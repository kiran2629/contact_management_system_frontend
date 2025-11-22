import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { RootState } from "@/store/store";
import { toggleTheme } from "@/store/slices/themeSlice";
import { setUser } from "@/store/slices/authSlice";
import { useGetSignedUserQuery } from "@/store/services/authApi";
import { LayoutRouter } from "@/components/layout/LayoutRouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Moon,
  Sun,
  User,
  Crown,
  Users,
  Shield,
  CheckCircle2,
  Star,
  Edit,
  Save,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const dispatch = useDispatch();
  const { user: reduxUser } = useSelector((state: RootState) => state.auth);
  const { mode } = useSelector((state: RootState) => state.theme);
  const {
    data: signedUserData,
    isLoading,
    error,
    refetch,
  } = useGetSignedUserQuery();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transform API user data to match Redux User interface
  const user = signedUserData
    ? {
        id: signedUserData._id || reduxUser?.id || "",
        username:
          signedUserData.userName ||
          signedUserData.name ||
          reduxUser?.username ||
          "",
        role: signedUserData.role || reduxUser?.role || "User",
        allowed_categories:
          signedUserData.allowed_categories ||
          reduxUser?.allowed_categories ||
          [],
        name:
          signedUserData.name ||
          signedUserData.userName ||
          reduxUser?.name ||
          "",
        email: signedUserData.email || reduxUser?.email || "",
        avatar: signedUserData.avatar || reduxUser?.avatar || "",
        profile_photo:
          signedUserData.profile_photo || reduxUser?.profile_photo || null,
      }
    : reduxUser;

  // Update Redux state when API data is fetched
  useEffect(() => {
    if (signedUserData) {
      const transformedUser = {
        id: signedUserData._id || reduxUser?.id || "",
        username:
          signedUserData.userName ||
          signedUserData.name ||
          reduxUser?.username ||
          "",
        role: signedUserData.role || reduxUser?.role || "User",
        allowed_categories:
          signedUserData.allowed_categories ||
          reduxUser?.allowed_categories ||
          [],
        name:
          signedUserData.name ||
          signedUserData.userName ||
          reduxUser?.name ||
          "",
        email: signedUserData.email || reduxUser?.email || "",
        avatar: signedUserData.avatar || reduxUser?.avatar || "",
        profile_photo:
          signedUserData.profile_photo || reduxUser?.profile_photo || null,
      };
      dispatch(setUser(transformedUser));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedUserData?._id]);

  // Initialize edit username and profile image from user data
  useEffect(() => {
    if (user?.username) {
      setEditUsername(user.username);
    }
    // Set preview image from user profile_photo
    if (user?.profile_photo) {
      const profilePhotoUrl = getProfilePhotoUrl(user.profile_photo);
      setPreviewImage(profilePhotoUrl);
    } else {
      setPreviewImage(null);
    }
  }, [user?.username, user?.profile_photo]);

  // Get profile photo URL helper
  const getProfilePhotoUrl = (profilePhoto: string | null | undefined) => {
    if (!profilePhoto) return null;
    // If it's already a full URL (Cloudinary, etc.), return as is
    if (profilePhoto.startsWith("http")) return profilePhoto;
    // If it's a relative path, prepend API URL
    if (profilePhoto.startsWith("/"))
      return `${
        import.meta.env.VITE_API_URL || "http://localhost:5000"
      }${profilePhoto}`;
    return profilePhoto;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Store the File object for FormData upload
      setProfileImageFile(file);
      // Also create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setProfileImageFile(null);
    // Reset to original profile photo if available
    if (user?.profile_photo) {
      const profilePhotoUrl = getProfilePhotoUrl(user.profile_photo);
      setPreviewImage(profilePhotoUrl);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      // If there's a new profile image file, upload it
      if (profileImageFile) {
        const formData = new FormData();
        formData.append("profile_photo", profileImageFile);
        if (editUsername.trim() !== user.username) {
          formData.append("userName", editUsername.trim());
        }

        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000"
          }/v1/api/user/update/${user.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("crm_token")}`,
            },
            body: formData,
            credentials: "include",
          }
        );

        if (response.ok) {
          const result = await response.json();
          const updatedUser = {
            ...user,
            username: editUsername.trim(),
            profile_photo:
              result.user?.profile_photo ||
              result.profile_photo ||
              user.profile_photo,
          };
          dispatch(setUser(updatedUser));
          toast.success("Profile updated successfully!");
          setIsEditDialogOpen(false);
          setProfileImageFile(null);
          // Refetch signed user data to get updated profile photo
          refetch();
          return;
        }
      }

      // If only username changed, update via API
      if (editUsername.trim() !== user.username) {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000"
          }/v1/api/user/update/${user.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("crm_token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userName: editUsername.trim() }),
            credentials: "include",
          }
        );

        if (response.ok) {
          const updatedUser = {
            ...user,
            username: editUsername.trim(),
          };
          dispatch(setUser(updatedUser));
          toast.success("Profile updated successfully!");
          setIsEditDialogOpen(false);
          return;
        }
      }

      // If nothing changed, just close dialog
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Refetch user data after profile update
      refetch();
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, [refetch]);

  // Show loading state
  if (isLoading) {
    return (
      <LayoutRouter>
        <div className="space-y-6 w-full">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </LayoutRouter>
    );
  }

  // Show error state
  if (error) {
    return (
      <LayoutRouter>
        <div className="space-y-6 w-full">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-destructive mb-4">
                Failed to load profile data
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </LayoutRouter>
    );
  }

  // Show message if no user data
  if (!user) {
    return (
      <LayoutRouter>
        <div className="space-y-6 w-full">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">No user data available</p>
          </div>
        </div>
      </LayoutRouter>
    );
  }

  return (
    <LayoutRouter>
      <div className="space-y-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border border-border/50 shadow-sm bg-card backdrop-blur-sm">
            <CardHeader className="border-b border-border/30 bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    Your account details and role information
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="h-8 w-8 rounded-md hover:bg-accent"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="relative overflow-hidden rounded-lg border border-border/30 bg-muted/30 p-6">
                {/* Role-specific background glow */}
                {user?.role === "Admin" && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
                {user?.role === "HR" && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-teal-600/20 via-cyan-600/20 to-blue-600/20"
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
                {user?.role === "User" && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-600/20 via-rose-600/20 to-orange-600/20"
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}

                <div className="relative flex items-center gap-6">
                  <div className="relative">
                    <div className="relative group">
                      <Avatar
                        className="h-20 w-20 border-2 shadow-md relative z-10"
                        style={{
                          borderColor:
                            user?.role === "Admin"
                              ? "rgba(59, 130, 246, 0.3)"
                              : user?.role === "HR"
                              ? "rgba(20, 184, 166, 0.3)"
                              : "rgba(236, 72, 153, 0.3)",
                        }}
                      >
                        <AvatarImage
                          src={
                            getProfilePhotoUrl(user?.profile_photo) || undefined
                          }
                          alt={user?.username}
                          className="object-cover"
                        />
                        <AvatarFallback
                          className="text-white text-2xl font-semibold relative z-10"
                          style={{
                            background:
                              user?.role === "Admin"
                                ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)"
                                : user?.role === "HR"
                                ? "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)"
                                : "linear-gradient(135deg, #ec4899 0%, #f97316 100%)",
                          }}
                        >
                          {user?.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <motion.button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Upload className="h-5 w-5 text-white" />
                      </motion.button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    {/* Role icon overlay */}
                    {user?.role === "Admin" && (
                      <motion.div
                        className="absolute -top-2 -right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg border-2 border-white"
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Crown className="h-5 w-5 text-white" />
                      </motion.div>
                    )}
                    {user?.role === "HR" && (
                      <motion.div
                        className="absolute -top-2 -right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 shadow-lg border-2 border-white"
                        animate={{
                          y: [0, -5, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Users className="h-5 w-5 text-white" />
                      </motion.div>
                    )}
                    {user?.role === "User" && (
                      <motion.div
                        className="absolute -top-2 -right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg border-2 border-white"
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <User className="h-5 w-5 text-white" />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-semibold text-foreground mb-2">
                          {user?.username?.charAt(0).toUpperCase() +
                            user?.username?.slice(1)}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {user?.email || `${user?.username}@crm.com`}
                        </p>
                        {/* Role Badge */}
                        <div className="mb-3">
                          {user?.role === "Admin" && (
                            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-3 py-1 text-xs font-medium flex items-center gap-1.5 w-fit">
                              <Crown className="h-3.5 w-3.5" />
                              <span>Administrator</span>
                            </Badge>
                          )}
                          {user?.role === "HR" && (
                            <Badge className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0 px-3 py-1 text-xs font-medium flex items-center gap-1.5 w-fit">
                              <Users className="h-3.5 w-3.5" />
                              <span>HR Manager</span>
                            </Badge>
                          )}
                          {user?.role === "User" && (
                            <Badge className="bg-gradient-to-r from-pink-600 to-rose-600 text-white border-0 px-3 py-1 text-xs font-medium flex items-center gap-1.5 w-fit">
                              <User className="h-3.5 w-3.5" />
                              <span>Standard User</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditDialogOpen(true)}
                        className="h-8 w-8 rounded-md hover:bg-accent"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Role Description */}
                    <div className="mt-4">
                      {user?.role === "Admin" && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p>
                            Full system access with complete control over users,
                            contacts, and permissions
                          </p>
                        </div>
                      )}
                      {user?.role === "HR" && (
                        <p className="text-sm text-muted-foreground">
                          Manage HR-related contacts and employee information
                        </p>
                      )}
                      {user?.role === "User" && (
                        <p className="text-sm text-muted-foreground">
                          Access to public contacts and basic features
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Username
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {user?.username}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Role
                  </p>
                  <div className="flex items-center gap-2">
                    {user?.role === "Admin" && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                    {user?.role === "HR" && (
                      <Users className="h-4 w-4 text-cyan-500" />
                    )}
                    {user?.role === "User" && (
                      <User className="h-4 w-4 text-pink-500" />
                    )}
                    <p className="text-lg font-semibold text-foreground">
                      {user?.role}
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="md:col-span-2 p-4 rounded-lg border border-border/30 bg-muted/20"
                >
                  <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Allowed Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user?.allowed_categories.map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="bg-primary/10 border border-primary/20 text-primary font-medium px-2.5 py-1 text-xs"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="border border-border/50 shadow-sm bg-card backdrop-blur-sm">
            <CardHeader className="border-b border-border/30 bg-muted/30">
              <CardTitle className="text-xl font-semibold text-foreground">
                Appearance
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Customize how the app looks for you
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted border border-border">
                    {mode === "light" ? (
                      <Sun className="h-5 w-5 text-foreground" />
                    ) : (
                      <Moon className="h-5 w-5 text-foreground" />
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="theme-toggle"
                      className="cursor-pointer text-base font-medium"
                    >
                      Dark Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark theme
                    </p>
                  </div>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={mode === "dark"}
                  onCheckedChange={() => dispatch(toggleTheme())}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Profile
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Update your profile information. Note: Role and categories can
                only be changed by administrators.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              {/* Profile Image Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Profile Image</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border border-border">
                      <AvatarImage
                        src={previewImage || undefined}
                        alt="Preview"
                      />
                      <AvatarFallback className="bg-muted">
                        <ImageIcon className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    {previewImage && (
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      size="sm"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {previewImage ? "Change Image" : "Upload Image"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: Square image, max 5MB (JPG, PNG, GIF)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="edit-username"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Enter username"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Role</Label>
                <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
                  {user?.role === "Admin" && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                  {user?.role === "HR" && (
                    <Users className="h-4 w-4 text-cyan-500" />
                  )}
                  {user?.role === "User" && (
                    <User className="h-4 w-4 text-pink-500" />
                  )}
                  <span className="font-medium text-sm">{user?.role}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    Read-only
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Allowed Categories
                </Label>
                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex flex-wrap gap-2">
                    {user?.allowed_categories.map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="bg-primary/10 border border-primary/20 text-primary font-medium px-2.5 py-1 text-xs"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Categories can only be modified by administrators
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditUsername(user?.username || "");
                  setProfileImageFile(null);
                  if (user?.profile_photo) {
                    setPreviewImage(getProfilePhotoUrl(user.profile_photo));
                  } else {
                    setPreviewImage(null);
                  }
                }}
                size="sm"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LayoutRouter>
  );
};

export default Profile;
