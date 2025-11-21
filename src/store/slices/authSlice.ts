import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: number | string;
  username: string;
  role: "Admin" | "HR" | "User";
  allowed_categories: string[];
  name: string;
  email: string;
  avatar: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("crm_token"),
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem("crm_token", action.payload.token);
      localStorage.setItem("crm_user", JSON.stringify(action.payload.user));
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem("crm_user", JSON.stringify(action.payload));
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("crm_token", action.payload);
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      localStorage.setItem("crm_refresh_token", action.payload);
      // Also set as cookie
      const cookieOptions = [
        `refreshToken=${action.payload}`,
        "path=/",
        "SameSite=Lax",
        `max-age=${7 * 24 * 60 * 60}`, // 7 days
      ].join("; ");
      document.cookie = cookieOptions;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem("crm_token");
      localStorage.removeItem("crm_user");
      localStorage.removeItem("crm_refresh_token");
    },
    initializeAuth: (state) => {
      const storedToken = localStorage.getItem("crm_token");
      const storedUser = localStorage.getItem("crm_user");
      if (storedToken && storedUser) {
        state.token = storedToken;
        state.user = JSON.parse(storedUser);
        state.isAuthenticated = true;
      }
      state.loading = false;
    },
  },
});

export const {
  setUser,
  setCredentials,
  setToken,
  setRefreshToken,
  logout,
  initializeAuth,
} = authSlice.actions;
export default authSlice.reducer;
