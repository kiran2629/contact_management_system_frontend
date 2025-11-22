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
      canImportContacts: () => false,
      canViewBirthdays: () => false,
      canViewStatistics: () => false,
      canExportContacts: () => false,
    };
  }

  // Admin has all permissions for contact/notes/tasks
  // BUT CRM features (import_contacts, view_birthdays, etc.) must be explicitly set
  // even for Admin users based on getSignedUser API response
  const isAdmin = user.role === "Admin";

  // Use permissions from user object (fetched from API) - REQUIRED
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

  // For CRM features, we ONLY use parsedPermissions from user object
  // Do NOT fallback to permissions slice for CRM features

  const userPermissions = parsedPermissions
    ? { permissions: parsedPermissions }
    : permissions[user.role];

  // Debug: Log permissions structure (remove in production if needed)
  if (process.env.NODE_ENV === "development") {
    console.log("[usePermissions] User role:", user.role);
    console.log("[usePermissions] Parsed permissions:", parsedPermissions);
    console.log("[usePermissions] User permissions object:", userPermissions);
    if (userPermissions?.permissions?.crm_features) {
      console.log(
        "[usePermissions] CRM Features:",
        userPermissions.permissions.crm_features
      );
      console.log(
        "[usePermissions] import_contacts:",
        userPermissions.permissions.crm_features.import_contacts
      );
      console.log(
        "[usePermissions] view_birthdays:",
        userPermissions.permissions.crm_features.view_birthdays
      );
    }
  }

  return {
    canAccess: (permissionString: string, permission?: string) => {
      // Admin has all permissions for contact/notes/tasks (but NOT for CRM features)
      // Special permissions like "manage_users" are Admin-only
      if (isAdmin) {
        // Admin-only permissions
        if (
          permissionString === "manage_users" ||
          permissionString === "admin_access"
        ) {
          return true;
        }
        // For contact/notes/tasks, Admin has all permissions
        if (
          permissionString === "contact" ||
          permissionString === "notes" ||
          permissionString === "tasks"
        ) {
          return true;
        }
        // For mapped permissions (view_contacts, create_contact, etc.), Admin has all
        const adminPermissionMap = [
          "view_contacts",
          "create_contact",
          "edit_contact",
          "delete_contact",
          "view_notes",
          "create_note",
          "edit_note",
          "delete_note",
          "view_tasks",
          "create_task",
          "edit_task",
          "delete_task",
        ];
        if (adminPermissionMap.includes(permissionString)) {
          return true;
        }
      }

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
      // Admin has all permissions for contact/notes/tasks
      if (isAdmin && category !== "crm_features") return true;
      if (!userPermissions?.permissions?.[category]) return false;
      return userPermissions.permissions[category].read === true;
    },
    canEdit: (category: string) => {
      // Admin has all permissions for contact/notes/tasks
      if (isAdmin && category !== "crm_features") return true;
      if (!userPermissions?.permissions?.[category]) return false;
      return userPermissions.permissions[category].update === true;
    },
    canCreate: (category: string) => {
      // Admin has all permissions for contact/notes/tasks
      if (isAdmin && category !== "crm_features") return true;
      if (!userPermissions?.permissions?.[category]) return false;
      return userPermissions.permissions[category].create === true;
    },
    canDelete: (category: string) => {
      // Admin has all permissions for contact/notes/tasks
      if (isAdmin && category !== "crm_features") return true;
      if (!userPermissions?.permissions?.[category]) return false;
      return userPermissions.permissions[category].delete === true;
    },
    hasPermission: (category: string, permission: string) => {
      if (!userPermissions?.permissions?.[category]) return false;
      return userPermissions.permissions[category][permission] === true;
    },
    hasCategory: (category: string) => {
      return (
        user.allowed_categories?.some(
          (allowedCat) => allowedCat.toLowerCase() === category.toLowerCase()
        ) || false
      );
    },
    getAllowedCategories: () => {
      return user.allowed_categories || [];
    },
    // CRM Features permissions - ONLY from user.permissions (getSignedUser API)
    // Even Admin users must have explicit permission set to true
    canImportContacts: () => {
      // MUST have permissions from user object (getSignedUser API)
      if (!user.permissions) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "[canImportContacts] No user.permissions, returning false"
          );
        }
        return false;
      }
      // Parse if string
      let perms = user.permissions;
      if (typeof perms === "string") {
        try {
          perms = JSON.parse(perms);
        } catch (e) {
          console.error("[canImportContacts] Error parsing permissions:", e);
          return false;
        }
      }
      // Check crm_features
      if (!perms?.crm_features) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "[canImportContacts] No crm_features found, returning false"
          );
        }
        return false;
      }
      // Explicitly check for true - even Admin must have this set to true
      const importPerm = perms.crm_features.import_contacts;
      const result = importPerm === true;
      if (process.env.NODE_ENV === "development") {
        console.log("[canImportContacts] Checking permissions:", {
          role: user.role,
          hasPermissions: !!user.permissions,
          hasCrmFeatures: !!perms?.crm_features,
          import_contacts: importPerm,
          result: result,
          fullPermissions: perms,
        });
      }
      return result;
    },
    canViewBirthdays: () => {
      // MUST have permissions from user object (getSignedUser API)
      // Even Admin users must have explicit permission set to true
      if (!user.permissions) return false;
      // Parse if string
      let perms = user.permissions;
      if (typeof perms === "string") {
        try {
          perms = JSON.parse(perms);
        } catch (e) {
          console.error("[canViewBirthdays] Error parsing permissions:", e);
          return false;
        }
      }
      // Check crm_features
      if (!perms?.crm_features) return false;
      // Explicitly check for true - even Admin must have this set to true
      const birthdayPerm = perms.crm_features.view_birthdays;
      return birthdayPerm === true;
    },
    canViewStatistics: () => {
      // MUST have permissions from user object (getSignedUser API)
      // Even Admin users must have explicit permission set to true
      if (!user.permissions) return false;
      // Parse if string
      let perms = user.permissions;
      if (typeof perms === "string") {
        try {
          perms = JSON.parse(perms);
        } catch (e) {
          return false;
        }
      }
      if (!perms?.crm_features) return false;
      return perms.crm_features.view_statistics === true;
    },
    canExportContacts: () => {
      // MUST have permissions from user object (getSignedUser API)
      // Even Admin users must have explicit permission set to true
      if (!user.permissions) return false;
      // Parse if string
      let perms = user.permissions;
      if (typeof perms === "string") {
        try {
          perms = JSON.parse(perms);
        } catch (e) {
          return false;
        }
      }
      if (!perms?.crm_features) return false;
      return perms.crm_features.export_contacts === true;
    },
  };
};
