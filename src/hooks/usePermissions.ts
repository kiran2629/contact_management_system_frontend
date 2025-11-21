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
      hasCategory: () => true,
      hasPermission: () => true,
      getAllowedCategories: () => user.allowed_categories || [],
    };
  }

  const userPermissions = permissions[user.role];

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
