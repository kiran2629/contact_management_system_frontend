import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import permissionsData from '../../mock/permissions.json';

interface PermissionsState {
  permissions: typeof permissionsData;
}

const getStoredPermissions = () => {
  const stored = localStorage.getItem('crm_permissions');
  return stored ? JSON.parse(stored) : permissionsData;
};

const initialState: PermissionsState = {
  permissions: getStoredPermissions(),
};

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    updatePermission: (state, action: PayloadAction<{
      role: 'Admin' | 'HR' | 'User';
      type: 'actions' | 'fields';
      key: string;
      value: boolean;
    }>) => {
      const { role, type, key, value } = action.payload;
      state.permissions[role][type][key] = value;
      localStorage.setItem('crm_permissions', JSON.stringify(state.permissions));
    },
    resetPermissions: (state) => {
      state.permissions = permissionsData;
      localStorage.removeItem('crm_permissions');
    },
  },
});

export const { updatePermission, resetPermissions } = permissionsSlice.actions;
export default permissionsSlice.reducer;
