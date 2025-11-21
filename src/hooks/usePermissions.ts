import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export const usePermissions = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { permissions } = useSelector((state: RootState) => state.permissions);

  if (!user) {
    return {
      canAccess: () => false,
      canView: () => false,
      canEdit: () => false,
      hasCategory: () => false,
    };
  }

  const userPermissions = permissions[user.role];

  return {
    canAccess: (action: string) => {
      return userPermissions.actions[action] === true;
    },
    canView: (field: string) => {
      return userPermissions.fields[`view_${field}`] === true;
    },
    canEdit: (field: string) => {
      return userPermissions.fields[`edit_${field}`] === true;
    },
    hasCategory: (category: string) => {
      return user.allowed_categories.includes(category);
    },
    getAllowedCategories: () => {
      return user.allowed_categories;
    },
  };
};
