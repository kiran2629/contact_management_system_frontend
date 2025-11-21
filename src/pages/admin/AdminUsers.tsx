import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RootState } from "@/store/store";
import { updateUser, deleteUser, addUser } from "@/store/slices/usersSlice";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/store/services/usersApi";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "@/store/services/usersApi";
import { AppLayout } from "@/components/layout/AppLayout";
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
} from "lucide-react";
import { toast } from "sonner";

// Available categories for users
const USER_CATEGORIES = ["Public", "Private", "Confidential", "Internal"];

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
  const { users } = useSelector((state: RootState) => state.users);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [createUserMutation, { isLoading: isCreating }] =
    useCreateUserMutation();
  const [updateUserMutation, { isLoading: isUpdating }] =
    useUpdateUserMutation();
  const [deleteUserMutation, { isLoading: isDeleting }] =
    useDeleteUserMutation();

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

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      // Also update Redux store for immediate UI update
      if (result) {
        dispatch(addUser(result));
      }

      toast.success("User created successfully!");
      setShowAddDialog(false);
      addForm.reset();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to create user. Please try again."
      );
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
        dispatch(updateUser(result));
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

  const handleStatusToggle = (user: any) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    dispatch(updateUser({ ...user, status: newStatus }));
    toast.success(
      `User ${newStatus === "active" ? "activated" : "deactivated"}`
    );
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

  return (
    <AppLayout>
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

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="flex items-center justify-center bg-muted">
                        {getGenderIcon(user.gender)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="mb-1 text-lg font-semibold">{user.name}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    @{user.username}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "secondary"
                      }
                    >
                      {user.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusToggle(user)}
                    >
                      {user.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>

                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                    <p>
                      Last login: {new Date(user.last_login).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
                        <FormLabel>
                          Allowed Categories{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Controller
                            control={addForm.control}
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
      </div>
    </AppLayout>
  );
};

export default AdminUsers;
