import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { toggleTheme } from "@/store/slices/themeSlice";
import { logActivity } from "@/utils/activityLogger";
import { useLogoutMutation } from "@/store/services/authApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Moon,
  Sun,
  LogOut,
  UserCircle,
  Settings,
  Crown,
  Users,
  Shield,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { mode } = useSelector((state: RootState) => state.theme);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Get profile image from localStorage
  const getProfileImage = () => {
    if (!user?.id) return null;
    return localStorage.getItem(`profile_image_${user.id}`) || null;
  };

  // Load image on mount and when user changes
  useEffect(() => {
    const image = getProfileImage();
    setProfileImage(image);
  }, [user?.id, user?.username, forceUpdate]);

  // Listen for profile updates (including username changes)
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Update profile image
      const image = getProfileImage();
      setProfileImage(image);
      // Force component re-render to ensure username and image update immediately
      setForceUpdate((prev) => prev + 1);
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      // Call the logout API
      await logoutMutation().unwrap();

      // Clear local storage
      localStorage.removeItem("crm_refresh_token");

      // Dispatch logout action to clear Redux state
      dispatch(logout());

      logActivity("logout");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      // Even if API call fails, logout locally
      localStorage.removeItem("crm_refresh_token");
      dispatch(logout());
      logActivity("logout");

      const errorMessage =
        error?.data?.error ||
        error?.data?.message ||
        error?.message ||
        "Error during logout";
      toast.error(errorMessage);
      navigate("/login");
    }
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    logActivity("theme_change", { theme: mode === "light" ? "dark" : "light" });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger />

        <div className="flex flex-1 items-center justify-end gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            className="rounded-full"
          >
            {mode === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-accent"
              >
                <Avatar
                  className="h-10 w-10 border-2"
                  style={{
                    borderColor:
                      user?.role === "Admin"
                        ? "rgba(59, 130, 246, 0.5)"
                        : user?.role === "HR"
                        ? "rgba(20, 184, 166, 0.5)"
                        : "rgba(236, 72, 153, 0.5)",
                  }}
                >
                  <AvatarImage
                    src={profileImage || undefined}
                    alt={user?.username}
                  />
                  <AvatarFallback
                    className="text-white font-bold"
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
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end">
              <DropdownMenuLabel>
                <div className="flex items-center gap-4 p-2">
                  <Avatar
                    className="h-14 w-14 border-2"
                    style={{
                      borderColor:
                        user?.role === "Admin"
                          ? "rgba(59, 130, 246, 0.5)"
                          : user?.role === "HR"
                          ? "rgba(20, 184, 166, 0.5)"
                          : "rgba(236, 72, 153, 0.5)",
                    }}
                  >
                    <AvatarImage
                      src={profileImage || undefined}
                      alt={user?.username}
                    />
                    <AvatarFallback
                      className="text-white font-bold text-lg"
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
                  <div className="flex flex-col space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {user?.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.username}@crm.com
                    </p>
                    <div className="mt-1">
                      {user?.role === "Admin" && (
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-xs px-2 py-0.5 h-5 flex items-center gap-1 w-fit">
                          <Crown className="h-3 w-3" />
                          <span>Admin</span>
                        </Badge>
                      )}
                      {user?.role === "HR" && (
                        <Badge className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0 text-xs px-2 py-0.5 h-5 flex items-center gap-1 w-fit">
                          <Users className="h-3 w-3" />
                          <span>HR</span>
                        </Badge>
                      )}
                      {user?.role === "User" && (
                        <Badge className="bg-gradient-to-r from-pink-600 to-rose-600 text-white border-0 text-xs px-2 py-0.5 h-5 flex items-center gap-1 w-fit">
                          <UserCircle className="h-3 w-3" />
                          <span>User</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate("/profile")}
                className="cursor-pointer"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/settings")}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive cursor-pointer focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
