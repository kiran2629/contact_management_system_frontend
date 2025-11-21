import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { RootState } from "@/store/store";
import {
  updatePermission,
  resetPermissions,
} from "@/store/slices/permissionsSlice";
import { LayoutRouter } from "@/components/layout/LayoutRouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Search,
  Edit,
  Shield,
  RefreshCw,
  Filter,
  X,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  User,
} from "lucide-react";
import { toast } from "sonner";

type RoleType = "Admin" | "HR" | "User";

const AdminPermissions = () => {
  const dispatch = useDispatch();
  const { permissions } = useSelector((state: RootState) => state.permissions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<
    RoleType | "all"
  >("all");
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const roles: RoleType[] = ["Admin", "HR", "User"];

  const filteredRoles = roles.filter((role) => {
    const matchesSearch = role
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedRoleFilter === "all" || role === selectedRoleFilter;
    return matchesSearch && matchesFilter;
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedRoleFilter("all");
  };

  const hasActiveFilters =
    searchQuery.length > 0 || selectedRoleFilter !== "all";

  const handleEdit = (role: RoleType) => {
    setSelectedRole(role);
    setShowEditDialog(true);
  };

  const handlePermissionChange = (
    type: "actions" | "fields",
    key: string,
    value: boolean
  ) => {
    if (!selectedRole) return;
    dispatch(updatePermission({ role: selectedRole, type, key, value }));
    toast.success("Permission updated");
  };

  const handleReset = () => {
    dispatch(resetPermissions());
    toast.success("Permissions reset to default");
    setShowResetDialog(false);
  };

  const getRoleBadgeColor = (role: RoleType) => {
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

  const getRoleIcon = (role: RoleType) => {
    switch (role) {
      case "Admin":
        return Shield;
      case "HR":
        return Eye;
      case "User":
        return User;
      default:
        return Lock;
    }
  };

  const getActionDescription = (action: string): string => {
    const descriptions: Record<string, string> = {
      view_contacts: "View contact information",
      create_contact: "Create new contacts",
      edit_contact: "Edit existing contacts",
      delete_contact: "Delete contacts",
      import_contacts: "Import contacts from files",
      export_contacts: "Export contacts to files",
      manage_users: "Manage system users",
      manage_permissions: "Manage role permissions",
      view_all_logs: "View all activity logs",
      impersonate_user: "Impersonate other users",
    };
    return descriptions[action] || "";
  };

  const getFieldDescription = (field: string): string => {
    const descriptions: Record<string, string> = {
      view_email: "View email addresses",
      view_phone: "View phone numbers",
      view_birthday: "View birthday information",
      view_address: "View physical addresses",
      view_notes: "View contact notes",
      view_linkedin: "View LinkedIn profiles",
      edit_email: "Edit email addresses",
      edit_phone: "Edit phone numbers",
      edit_birthday: "Edit birthday information",
      edit_address: "Edit physical addresses",
      edit_notes: "Edit contact notes",
    };
    return descriptions[field] || "";
  };

  const countEnabledPermissions = (role: RoleType) => {
    const rolePerms = permissions[role];
    const actionsCount = Object.values(rolePerms.actions).filter(
      Boolean
    ).length;
    const fieldsCount = Object.values(rolePerms.fields).filter(Boolean).length;
    return actionsCount + fieldsCount;
  };

  const totalPermissions = (role: RoleType) => {
    const rolePerms = permissions[role];
    return (
      Object.keys(rolePerms.actions).length +
      Object.keys(rolePerms.fields).length
    );
  };

  return (
    <LayoutRouter>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Permission Management</h1>
            <p className="text-muted-foreground">
              Manage role-based access controls and permissions
            </p>
          </div>
          <Button variant="outline" onClick={() => setShowResetDialog(true)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
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
                <Select
                  value={selectedRoleFilter}
                  onValueChange={(value) =>
                    setSelectedRoleFilter(value as RoleType | "all")
                  }
                >
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
              {selectedRoleFilter !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Role: {selectedRoleFilter}
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

        {/* Role Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role, index) => {
            const RoleIcon = getRoleIcon(role);
            const rolePerms = permissions[role];
            const enabledCount = countEnabledPermissions(role);
            const totalCount = totalPermissions(role);

            return (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                        <RoleIcon className="h-7 w-7 text-primary" />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>

                    <h3 className="mb-1 text-lg font-semibold">{role} Role</h3>
                    <p className="mb-3 text-sm text-muted-foreground">
                      Permission configuration
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Badge className={getRoleBadgeColor(role)}>
                          {role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">
                          {enabledCount} / {totalCount} permissions enabled
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {rolePerms.categories.length} categories
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {rolePerms.categories.slice(0, 3).map((category) => (
                        <Badge
                          key={category}
                          variant="secondary"
                          className="text-xs"
                        >
                          {category}
                        </Badge>
                      ))}
                      {rolePerms.categories.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{rolePerms.categories.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleEdit(role)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Permissions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Edit Permissions Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Permissions - {selectedRole} Role</DialogTitle>
              <DialogDescription>
                Configure what actions and fields {selectedRole} users can
                access
              </DialogDescription>
            </DialogHeader>

            {selectedRole && (
              <div className="space-y-6 py-4">
                {/* Action Permissions */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Action Permissions
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(permissions[selectedRole].actions).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="flex-1">
                            <Label
                              htmlFor={`action-${key}`}
                              className="cursor-pointer font-medium"
                            >
                              {key
                                .split("_")
                                .map(
                                  (w) => w.charAt(0).toUpperCase() + w.slice(1)
                                )
                                .join(" ")}
                            </Label>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {getActionDescription(key)}
                            </p>
                          </div>
                          <Switch
                            id={`action-${key}`}
                            checked={value}
                            onCheckedChange={(checked) =>
                              handlePermissionChange("actions", key, checked)
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Field Permissions */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Field Permissions
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(permissions[selectedRole].fields).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="flex-1">
                            <Label
                              htmlFor={`field-${key}`}
                              className="cursor-pointer font-medium"
                            >
                              {key
                                .split("_")
                                .map(
                                  (w) => w.charAt(0).toUpperCase() + w.slice(1)
                                )
                                .join(" ")}
                            </Label>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {getFieldDescription(key)}
                            </p>
                          </div>
                          <Switch
                            id={`field-${key}`}
                            checked={value}
                            onCheckedChange={(checked) =>
                              handlePermissionChange("fields", key, checked)
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Category Access */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Category Access
                  </h3>
                  <div className="flex flex-wrap gap-2 rounded-lg border p-4">
                    {permissions[selectedRole].categories.map((category) => (
                      <Badge key={category} className="text-sm">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Confirmation Dialog */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Permissions to Default?</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset all role permissions to their default values.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Reset Permissions
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </LayoutRouter>
  );
};

export default AdminPermissions;
