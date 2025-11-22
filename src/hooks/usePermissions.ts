import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export const usePermissions = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { permissions } = useSelector((state: RootState) => state.permissions);

  if (!user) {
    return {
      canAccess: () => false,
      canView: () => false,
      canEdit: () => false,
      canCreate: () => false,
      canDelete: () => false,
      hasCategory: () => false,
      hasPermission: () => false,
    };
  }

  // Admin has all permissions
  if (user.role === "Admin") {
    return {
      canAccess: () => true,
      canView: () => true,
      canEdit: () => true,
      canCreate: () => true,
      canDelete: () => true,
      hasCategory: () => true,
      hasPermission: () => true,
      getAllowedCategories: () => user.allowed_categories || [],
    };
  }

  // Use permissions from user object (fetched from API) if available
  // Otherwise fallback to permissions slice (for backward compatibility)
  // Parse permissions if it's still a string (defensive check)
  let parsedPermissions = user.permissions;
  if (parsedPermissions && typeof parsedPermissions === "string") {
    try {
      parsedPermissions = JSON.parse(parsedPermissions);
    } catch (e) {
      console.error("Error parsing permissions in usePermissions:", e);
      parsedPermissions = undefined;
    }
  }

  const userPermissions = parsedPermissions
    ? { permissions: parsedPermissions }
    : permissions[user.role];

  return {
    canAccess: (permissionString: string, permission?: string) => {
      // Handle two formats:
      // 1. Single string: "view_contacts" -> maps to category "contact", permission "read"
      // 2. Two params: canAccess("contact", "read")

      let category: string;
      let perm: string;

      if (permission) {
        // Two-parameter format: canAccess("contact", "read")
        category = permissionString;
        perm = permission;
      } else {
        // Single string format: "view_contacts", "create_contact", "edit_contact"
        const permissionMap: Record<
          string,
          { category: string; permission: string }
        > = {
          view_contacts: { category: "contact", permission: "read" },
          create_contact: { category: "contact", permission: "create" },
          edit_contact: { category: "contact", permission: "update" },
          delete_contact: { category: "contact", permission: "delete" },
          view_notes: { category: "notes", permission: "read" },
          create_note: { category: "notes", permission: "create" },
          edit_note: { category: "notes", permission: "update" },
          delete_note: { category: "notes", permission: "delete" },
          view_tasks: { category: "tasks", permission: "read" },
          create_task: { category: "tasks", permission: "create" },
          edit_task: { category: "tasks", permission: "update" },
          delete_task: { category: "tasks", permission: "delete" },
        };

        const mapped = permissionMap[permissionString];
        if (!mapped) {
          // If not in map, try to parse as "category_permission" format
          const parts = permissionString.split("_");
          if (parts.length >= 2) {
            category = parts[0];
            perm = parts.slice(1).join("_");
          } else {
            return false;
          }
        } else {
          category = mapped.category;
          perm = mapped.permission;
        }
      }

      if (!userPermissions?.permissions?.[category]) return false;
      return userPermissions.permissions[category][perm] === true;
    },
    canView: (category: string) => {
      if (!userPermissions?.permissions?.[category]) return false;
      return userPermissions.permissions[category].read === true;
    },
    canEdit: (category: string) => {
      if (!userPermissions?.permissions?.[category]) return false;
      return userPermissions.permissions[category].update === true;
    },
    canCreate: (category: string) => {
      if (!userPermissions?.permissions?.[category]) return false;
      return userPermissions.permissions[category].create === true;
    },
    canDelete: (category: string) => {
      if (!userPermissions?.permissions?.[category]) return false;
      return userPermissions.permissions[category].delete === true;
    },
    hasPermission: (category: string, permission: string) => {
      if (!userPermissions?.permissions?.[category]) return false;
      return userPermissions.permissions[category][permission] === true;
    },
    hasCategory: (category: string) => {
      return user.allowed_categories?.includes(category) || false;
    },
    getAllowedCategories: () => {
      return user.allowed_categories || [];
    },
  };
};
