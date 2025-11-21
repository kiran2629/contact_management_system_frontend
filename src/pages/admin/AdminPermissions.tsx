import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { RootState } from "@/store/store";
import { updatePermission } from "@/store/slices/permissionsSlice";
import { LayoutRouter } from "@/components/layout/LayoutRouter";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Edit, Shield, CheckCircle2, Eye, Lock, User } from "lucide-react";
import { toast } from "sonner";

type RoleType = "HR" | "User";

const AdminPermissions = () => {
  const dispatch = useDispatch();
  const { permissions } = useSelector((state: RootState) => state.permissions);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const roles: RoleType[] = ["HR", "User"]; // Admin has all access, no need to display

  const handleEdit = (role: RoleType) => {
    setSelectedRole(role);
    setShowEditDialog(true);
  };

  const handlePermissionChange = (
    category: "contact" | "notes" | "tasks" | "crm_features",
    permission: string,
    value: boolean
  ) => {
    if (!selectedRole) return;
    dispatch(
      updatePermission({ role: selectedRole, category, permission, value })
    );
    toast.success("Permission updated");
  };

  const getRoleBadgeColor = (role: RoleType) => {
    switch (role) {
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
      case "HR":
        return Eye;
      case "User":
        return User;
      default:
        return Lock;
    }
  };

  const getPermissionDescription = (
    category: string,
    permission: string
  ): string => {
    const descriptions: Record<string, Record<string, string>> = {
      contact: {
        create: "Create new contacts",
        read: "View and read contact information",
        update: "Edit and update existing contacts",
        delete: "Delete contacts from the system",
      },
      notes: {
        create: "Create new notes",
        read: "View and read notes",
        update: "Edit and update existing notes",
        delete: "Delete notes",
      },
      tasks: {
        create: "Create new tasks",
        read: "View and read tasks",
        update: "Edit and update existing tasks",
        delete: "Delete tasks",
      },
      crm_features: {
        view_birthdays: "View birthday information",
        view_statistics: "View CRM statistics and reports",
        export_contacts: "Export contacts to files",
        import_contacts: "Import contacts from files",
      },
    };
    return descriptions[category]?.[permission] || "";
  };

  const countEnabledPermissions = (role: RoleType) => {
    const rolePerms = permissions[role];
    if (!rolePerms?.permissions) return 0;

    let count = 0;
    Object.values(rolePerms.permissions).forEach((category: any) => {
      count += Object.values(category).filter(Boolean).length;
    });
    return count;
  };

  const totalPermissions = (role: RoleType) => {
    const rolePerms = permissions[role];
    if (!rolePerms?.permissions) return 0;

    let total = 0;
    Object.values(rolePerms.permissions).forEach((category: any) => {
      total += Object.keys(category).length;
    });
    return total;
  };

  return (
    <LayoutRouter>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Permission Management</h1>
          <p className="text-muted-foreground">
            Manage role-based access controls and permissions
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role, index) => {
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

            {selectedRole && permissions[selectedRole]?.permissions && (
              <div className="space-y-6 py-4">
                {/* Contact Permissions */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Contact Permissions
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(
                      permissions[selectedRole].permissions.contact
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <Label
                            htmlFor={`contact-${key}`}
                            className="cursor-pointer font-medium capitalize"
                          >
                            {key}
                          </Label>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {getPermissionDescription("contact", key)}
                          </p>
                        </div>
                        <Switch
                          id={`contact-${key}`}
                          checked={value as boolean}
                          onCheckedChange={(checked) =>
                            handlePermissionChange("contact", key, checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes Permissions */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Notes Permissions
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(
                      permissions[selectedRole].permissions.notes
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <Label
                            htmlFor={`notes-${key}`}
                            className="cursor-pointer font-medium capitalize"
                          >
                            {key}
                          </Label>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {getPermissionDescription("notes", key)}
                          </p>
                        </div>
                        <Switch
                          id={`notes-${key}`}
                          checked={value as boolean}
                          onCheckedChange={(checked) =>
                            handlePermissionChange("notes", key, checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks Permissions */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Tasks Permissions
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(
                      permissions[selectedRole].permissions.tasks
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <Label
                            htmlFor={`tasks-${key}`}
                            className="cursor-pointer font-medium capitalize"
                          >
                            {key}
                          </Label>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {getPermissionDescription("tasks", key)}
                          </p>
                        </div>
                        <Switch
                          id={`tasks-${key}`}
                          checked={value as boolean}
                          onCheckedChange={(checked) =>
                            handlePermissionChange("tasks", key, checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* CRM Features */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold">CRM Features</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(
                      permissions[selectedRole].permissions.crm_features
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <Label
                            htmlFor={`crm-${key}`}
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
                            {getPermissionDescription("crm_features", key)}
                          </p>
                        </div>
                        <Switch
                          id={`crm-${key}`}
                          checked={value as boolean}
                          onCheckedChange={(checked) =>
                            handlePermissionChange("crm_features", key, checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Access */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold">
                    Category Access
                  </h3>
                  <div className="flex flex-wrap gap-2 rounded-lg border p-4">
                    {permissions[selectedRole].categories?.map((category) => (
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
      </div>
    </LayoutRouter>
  );
};

export default AdminPermissions;
