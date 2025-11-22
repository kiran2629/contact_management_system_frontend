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
  const userPermissions = user.permissions
    ? { permissions: user.permissions }
    : permissions[user.role];

  return {
    canAccess: (category: string, permission: string) => {
      if (!userPermissions?.permissions?.[category]) return false;
      return userPermissions.permissions[category][permission] === true;
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
