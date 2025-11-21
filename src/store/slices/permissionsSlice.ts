import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import permissionsData from "../../mock/permissions.json";

interface PermissionsState {
  permissions: typeof permissionsData;
}

const getStoredPermissions = () => {
  const stored = localStorage.getItem("crm_permissions");
  return stored ? JSON.parse(stored) : permissionsData;
};

const initialState: PermissionsState = {
  permissions: getStoredPermissions(),
};

const permissionsSlice = createSlice({
  name: "permissions",
  initialState,
  reducers: {
    updatePermission: (
      state,
      action: PayloadAction<{
        role: "HR" | "User";
        category: "contact" | "notes" | "tasks" | "crm_features";
        permission: string;
        value: boolean;
      }>
    ) => {
      const { role, category, permission, value } = action.payload;
      if (state.permissions[role]?.permissions?.[category]) {
        (state.permissions[role].permissions[category] as any)[permission] =
          value;
        localStorage.setItem(
          "crm_permissions",
          JSON.stringify(state.permissions)
        );
      }
    },
    resetPermissions: (state) => {
      state.permissions = permissionsData;
      localStorage.removeItem("crm_permissions");
    },
  },
});

export const { updatePermission, resetPermissions } = permissionsSlice.actions;
export default permissionsSlice.reducer;
