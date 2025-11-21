import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RootState } from "@/store/store";
import { updateUser, deleteUser, addUser } from "@/store/slices/usersSlice";
import {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/store/services/usersApi";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "@/store/services/usersApi";
import { LayoutRouter } from "@/components/layout/LayoutRouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/form/MultiSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ButtonLoader } from "@/components/loaders/ButtonLoader";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Mail,
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  UserCircle,
  Users,
  Filter,
  X,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Briefcase,
  Star,
  Settings,
  Tags,
} from "lucide-react";
import { toast } from "sonner";

// Available categories for users
const USER_CATEGORIES = [
  "Public",
  "HR",
  "Employee",
  "Client",
  "Candidate",
  "Partner",
  "Vendor",
  "Other",
];

// Zod validation schema
const addUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  role: z.enum(["Admin", "HR", "User"], {
    required_error: "Please select a role",
  }),
  allowed_categories: z
    .array(z.string())
    .min(1, "Please select at least one category"),
  status: z.enum(["active", "inactive"]).optional().default("active"),
  gender: z.enum(["Male", "Female", "Other"]).optional().default("Other"),
});

// Edit user schema (password is optional)
const editUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 6,
      "Password must be at least 6 characters"
    )
    .refine(
      (val) => !val || /[A-Z]/.test(val),
      "Password must contain at least one uppercase letter"
    )
    .refine(
      (val) => !val || /[a-z]/.test(val),
      "Password must contain at least one lowercase letter"
    )
    .refine(
      (val) => !val || /[0-9]/.test(val),
      "Password must contain at least one number"
    )
    .refine(
      (val) => !val || /[^A-Za-z0-9]/.test(val),
      "Password must contain at least one special character"
    ),
  role: z.enum(["Admin", "HR", "User"], {
    required_error: "Please select a role",
  }),
  allowed_categories: z
    .array(z.string())
    .min(1, "Please select at least one category"),
  status: z.enum(["active", "inactive"]).optional().default("active"),
  gender: z.enum(["Male", "Female", "Other"]).optional().default("Other"),
});

type AddUserForm = z.infer<typeof addUserSchema>;
type EditUserForm = z.infer<typeof editUserSchema>;

// Helper function to get gender icon
const getGenderIcon = (gender?: string) => {
  switch (gender) {
    case "Male":
      return <User className="h-full w-full" />;
    case "Female":
      return <UserCircle className="h-full w-full" />;
    default:
      return <Users className="h-full w-full" />;
  }
};

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { data: usersData, isLoading, error } = useGetUsersQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUserDetailDialog, setShowUserDetailDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const {
    data: userDetailData,
    isLoading: isLoadingUserDetail,
    error: userDetailError,
  } = useGetUserByIdQuery(selectedUserId || "", {
    skip: !selectedUserId, // Skip query if no user ID is selected
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [createUserMutation, { isLoading: isCreating }] =
    useCreateUserMutation();
  const [updateUserMutation, { isLoading: isUpdating }] =
    useUpdateUserMutation();
  const [deleteUserMutation, { isLoading: isDeleting }] =
    useDeleteUserMutation();

  // Debug: Log userDetailData when it changes
  useEffect(() => {
    if (userDetailData) {
      console.log("User Detail Data received:", userDetailData);
    }
  }, [userDetailData]);

  // Ensure users is always an array, even if API returns error or undefined
  const users = Array.isArray(usersData) ? usersData : [];

  const addForm = useForm<AddUserForm>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role: undefined,
      allowed_categories: [],
      status: "active",
      gender: "Other",
    },
  });

  const editForm = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role: undefined,
      allowed_categories: [],
      status: "active",
      gender: "Other",
    },
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === "all" || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedRole("all");
  };

  const hasActiveFilters = searchQuery.length > 0 || selectedRole !== "all";

  const onSubmitAdd = async (data: AddUserForm) => {
    try {
      // Check if username already exists
      if (users.some((u) => u.username === data.username)) {
        addForm.setError("username", { message: "Username already exists" });
        return;
      }

      // Check if email already exists
      if (users.some((u) => u.email === data.email)) {
        addForm.setError("email", { message: "Email already exists" });
        return;
      }

      // Ensure all required fields are present
      const userData: CreateUserInput = {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        allowed_categories: data.allowed_categories,
        status: data.status || "active",
        gender: data.gender || "Other",
      };

      const result = await createUserMutation(userData).unwrap();

      // Show success toast
      toast.success("User created successfully!");

      // Close dialog and reset form
      setShowAddDialog(false);
      addForm.reset();

      // The list will automatically refetch due to invalidatesTags: ["Users"]
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        "Failed to create user. Please try again.";
      toast.error(errorMessage);
      console.error("Create user error:", error);
    }
  };

  const onSubmitEdit = async (data: EditUserForm) => {
    if (!selectedUser) return;

    try {
      // Check if username already exists (excluding current user)
      if (
        users.some(
          (u) => u.username === data.username && u.id !== selectedUser.id
        )
      ) {
        editForm.setError("username", { message: "Username already exists" });
        return;
      }

      // Check if email already exists (excluding current user)
      if (
        users.some((u) => u.email === data.email && u.id !== selectedUser.id)
      ) {
        editForm.setError("email", { message: "Email already exists" });
        return;
      }

      // Prepare update data (only include password if provided)
      const updateData: UpdateUserInput = {
        name: data.name,
        username: data.username,
        email: data.email,
        role: data.role,
        allowed_categories: data.allowed_categories,
        status: data.status || "active",
        gender: data.gender || "Other",
      };

      // Only include password if it was provided
      if (data.password && data.password.trim() !== "") {
        updateData.password = data.password;
      }

      const result = await updateUserMutation({
        id: selectedUser.id,
        data: updateData,
      }).unwrap();

      // Also update Redux store for immediate UI update
      if (result) {
        dispatch(updateUser(result as any));
      }

      toast.success("User updated successfully!");
      setShowEditDialog(false);
      setSelectedUser(null);
      editForm.reset();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to update user. Please try again."
      );
    }
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    editForm.reset({
      name: user.name,
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      allowed_categories: user.allowed_categories,
      status: user.status,
      gender: user.gender || "Other",
    });
    setShowEditDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUserMutation(selectedUser.id).unwrap();
      dispatch(deleteUser(selectedUser.id));
      toast.success("User deleted successfully!");
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to delete user. Please try again."
      );
    }
  };

  const handleDeleteClick = (user: any) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleUserCardClick = (user: any) => {
    console.log("Card clicked for user:", user);
    // Use the user's ID (which is the _id from the API)
    setSelectedUserId(user.id);
    setShowUserDetailDialog(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-gradient-to-r from-primary to-blue-600 text-white";
      case "HR":
        return "bg-gradient-to-r from-secondary to-teal-600 text-white";
      case "User":
        return "bg-gradient-to-r from-accent to-yellow-600 text-white";
      default:
        return "";
    }
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get avatar gradient - matching sidemenu gradient
  const getAvatarGradient = (role: string) => {
    return "bg-gradient-to-br from-primary to-secondary";
  };

  if (isLoading) {
    return (
      <LayoutRouter>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </LayoutRouter>
    );
  }

  if (error) {
    return (
      <LayoutRouter>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Users className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-2 font-semibold">
              Failed to load users
            </p>
            <p className="text-sm text-muted-foreground">
              {error && "data" in error
                ? (error.data as any)?.message || "An error occurred"
                : "Please try again later"}
            </p>
          </div>
        </div>
      </LayoutRouter>
    );
  }

  return (
    <LayoutRouter>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage system users and their roles
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by Role:</span>
              </div>
              <div className="flex-1 max-w-xs">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="User">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Active filters:</span>
              {selectedRole !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Role: {selectedRole}
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchQuery}"
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user, index) => {
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm group">
                  <CardContent
                    className="p-0"
                    onClick={() => handleUserCardClick(user)}
                  >
                    {/* Header with gradient background */}
                    <div className="relative h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-secondary/20">
                      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                      <div className="absolute top-4 right-4 flex gap-2 z-20">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-background/95 backdrop-blur-sm hover:bg-background border-border/50 opacity-30 group-hover:opacity-100 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(user);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 bg-destructive/95 backdrop-blur-sm hover:bg-destructive border-border/50 opacity-30 group-hover:opacity-100 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(user);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-6 -mt-10">
                      {/* Avatar */}
                      <div className="relative mb-4">
                        <Avatar className="h-20 w-20 border-4 border-background shadow-lg ring-2 ring-primary/20">
                          <AvatarFallback
                            className={`${getAvatarGradient(
                              user.role
                            )} text-white text-xl font-bold`}
                          >
                            {getInitials(user.name || user.username)}
                          </AvatarFallback>
                        </Avatar>
                        {user.status === "active" && (
                          <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-green-500 border-2 border-background flex items-center justify-center shadow-md">
                            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-1">
                            {user.name}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <span>@{user.username}</span>
                          </p>
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Badge
                              className={`${getRoleBadgeColor(
                                user.role
                              )} text-xs font-medium`}
                            >
                              {user.role}
                            </Badge>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            {user.status === "active" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Badge
                              variant={
                                user.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {user.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Last Login */}
                        <div className="pt-2 border-t border-border/50">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {user.last_login &&
                              user.last_login.trim() !== "" &&
                              user.last_login !== "Invalid Date"
                                ? new Date(user.last_login).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )
                                : "Never logged in"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Add User Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with appropriate role and permissions
              </DialogDescription>
            </DialogHeader>

            <Form {...addForm}>
              <form
                onSubmit={addForm.handleSubmit(onSubmitAdd)}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Name */}
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Username */}
                  <FormField
                    control={addForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Username <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={addForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john.doe@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={addForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Password <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter password"
                              {...field}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Must contain uppercase, lowercase, number, and special
                          character
                        </p>
                      </FormItem>
                    )}
                  />

                  {/* Role */}
                  <FormField
                    control={addForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Role <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status */}
                  <FormField
                    control={addForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Gender */}
                  <FormField
                    control={addForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Allowed Categories */}
                  <FormField
                    control={addForm.control}
                    name="allowed_categories"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2">
                          <Tags className="h-4 w-4 text-primary" />
                          Categories <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Controller
                            control={addForm.control}
                            name="allowed_categories"
                            render={({ field: { value, onChange } }) => (
                              <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg bg-card">
                                {USER_CATEGORIES.map((category) => (
                                  <div
                                    key={category}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`category-${category}`}
                                      checked={value?.includes(category)}
                                      onCheckedChange={(checked) => {
                                        const currentValue = value || [];
                                        if (checked) {
                                          onChange([...currentValue, category]);
                                        } else {
                                          onChange(
                                            currentValue.filter(
                                              (c) => c !== category
                                            )
                                          );
                                        }
                                      }}
                                    />
                                    <Label
                                      htmlFor={`category-${category}`}
                                      className="text-sm font-normal cursor-pointer"
                                    >
                                      {category}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                        {field.value && field.value.length === 0 && (
                          <p className="text-sm text-destructive">
                            Please select at least one category
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddDialog(false);
                      addForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <ButtonLoader size={16} />
                        <span className="ml-2">Creating...</span>
                      </>
                    ) : (
                      "Create User"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions
              </DialogDescription>
            </DialogHeader>

            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(onSubmitEdit)}
                className="space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Name */}
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Username */}
                  <FormField
                    control={editForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Username <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john.doe@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={editForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Password (leave blank to keep current)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showEditPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              {...field}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() =>
                                setShowEditPassword(!showEditPassword)
                              }
                            >
                              {showEditPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Leave blank to keep current password. If provided,
                          must contain uppercase, lowercase, number, and special
                          character
                        </p>
                      </FormItem>
                    )}
                  />

                  {/* Role */}
                  <FormField
                    control={editForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Role <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status */}
                  <FormField
                    control={editForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Gender */}
                  <FormField
                    control={editForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Allowed Categories */}
                  <FormField
                    control={editForm.control}
                    name="allowed_categories"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>
                          Allowed Categories{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Controller
                            control={editForm.control}
                            name="allowed_categories"
                            render={({ field: { value, onChange } }) => (
                              <MultiSelect
                                options={USER_CATEGORIES}
                                selected={value}
                                onChange={onChange}
                                placeholder="Select categories..."
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditDialog(false);
                      setSelectedUser(null);
                      editForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <ButtonLoader size={16} />
                        <span className="ml-2">Updating...</span>
                      </>
                    ) : (
                      "Update User"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                user <strong>{selectedUser?.name}</strong> (
                <strong>@{selectedUser?.username}</strong>) and all associated
                data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* User Detail Dialog */}
        <Dialog
          open={showUserDetailDialog}
          onOpenChange={setShowUserDetailDialog}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Complete information about the user
              </DialogDescription>
            </DialogHeader>

            {isLoadingUserDetail ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading user details...
                  </p>
                </div>
              </div>
            ) : userDetailError ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-destructive mb-2 font-semibold">
                    Failed to load user details
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please try again later
                  </p>
                </div>
              </div>
            ) : userDetailData ? (
              <div className="space-y-6">
                {/* User Profile Header Card */}
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-6">
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-lg ring-2 ring-primary/20">
                        <AvatarFallback
                          className={`${getAvatarGradient(
                            userDetailData.role
                          )} text-white text-3xl font-bold flex items-center justify-center`}
                        >
                          {(userDetailData.name || userDetailData.username)
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {userDetailData.status === "active" && (
                        <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-green-500 border-4 border-background flex items-center justify-center shadow-md">
                          <div className="h-2.5 w-2.5 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {userDetailData.name}
                        </h2>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                          <span>@{userDetailData.username}</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge
                          className={`${getRoleBadgeColor(
                            userDetailData.role
                          )} text-sm px-3 py-1`}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {userDetailData.role}
                        </Badge>
                        <Badge
                          variant={
                            userDetailData.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className="text-sm px-3 py-1"
                        >
                          {userDetailData.status === "active" ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {userDetailData.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{userDetailData.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Basic Information */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">
                        Basic Information
                      </h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Full Name
                          </p>
                          <p className="font-medium">{userDetailData.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Username
                          </p>
                          <p className="font-medium">
                            @{userDetailData.username}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Email Address
                          </p>
                          <p className="font-medium flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {userDetailData.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Gender
                          </p>
                          <p className="font-medium capitalize">
                            {userDetailData.gender || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Allowed Categories */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">
                        Allowed Categories
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {userDetailData.allowed_categories?.length > 0 ? (
                        userDetailData.allowed_categories.map(
                          (category, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="px-3 py-1 text-sm"
                            >
                              {category}
                            </Badge>
                          )
                        )
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No categories assigned
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Permissions */}
                {userDetailData.permissions && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Settings className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Permissions</h3>
                      </div>
                      <div className="space-y-6">
                        {/* Contact Permissions */}
                        {userDetailData.permissions.contact && (
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              Contact
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.contact.create
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.contact.create ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Create
                                </Badge>
                              </div>
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.contact.read
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.contact.read ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Read
                                </Badge>
                              </div>
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.contact.update
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.contact.update ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Update
                                </Badge>
                              </div>
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.contact.delete
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.contact.delete ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Delete
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notes Permissions */}
                        {userDetailData.permissions.notes && (
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              Notes
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.notes.create
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.notes.create ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Create
                                </Badge>
                              </div>
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.notes.read
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.notes.read ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Read
                                </Badge>
                              </div>
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.notes.update
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.notes.update ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Update
                                </Badge>
                              </div>
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.notes.delete
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.notes.delete ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Delete
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tasks Permissions */}
                        {userDetailData.permissions.tasks && (
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              Tasks
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.tasks.create
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.tasks.create ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Create
                                </Badge>
                              </div>
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.tasks.read
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.tasks.read ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Read
                                </Badge>
                              </div>
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.tasks.update
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.tasks.update ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Update
                                </Badge>
                              </div>
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.tasks.delete
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.tasks.delete ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Delete
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CRM Features */}
                        {userDetailData.permissions.crm_features && (
                          <div>
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Star className="h-4 w-4 text-muted-foreground" />
                              CRM Features
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.crm_features
                                      .view_birthdays
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.crm_features
                                    .view_birthdays ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  View Birthdays
                                </Badge>
                              </div>
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.crm_features
                                      .view_statistics
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.crm_features
                                    .view_statistics ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  View Statistics
                                </Badge>
                              </div>
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.crm_features
                                      .export_contacts
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.crm_features
                                    .export_contacts ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Export Contacts
                                </Badge>
                              </div>
                              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                                <Badge
                                  variant={
                                    userDetailData.permissions.crm_features
                                      .import_contacts
                                      ? "default"
                                      : "outline"
                                  }
                                  className="w-full justify-center"
                                >
                                  {userDetailData.permissions.crm_features
                                    .import_contacts ? (
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Import Contacts
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Account Information */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">
                        Account Information
                      </h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Created At
                          </p>
                          <p className="font-medium">
                            {userDetailData.created_at &&
                            userDetailData.created_at.trim() !== ""
                              ? new Date(
                                  userDetailData.created_at
                                ).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Last Login
                          </p>
                          <p className="font-medium">
                            {userDetailData.last_login &&
                            userDetailData.last_login.trim() !== ""
                              ? new Date(
                                  userDetailData.last_login
                                ).toLocaleString()
                              : "Never"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUserDetailDialog(false);
                  setSelectedUserId(null);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LayoutRouter>
  );
};

export default AdminUsers;
