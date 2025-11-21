import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  username: string;
  role: 'Admin' | 'HR' | 'User';
  allowed_categories: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('crm_token'),
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem('crm_token', action.payload.token);
      localStorage.setItem('crm_user', JSON.stringify(action.payload.user));
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem('crm_user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
    },
    initializeAuth: (state) => {
      const storedToken = localStorage.getItem('crm_token');
      const storedUser = localStorage.getItem('crm_user');
      if (storedToken && storedUser) {
        state.token = storedToken;
        state.user = JSON.parse(storedUser);
        state.isAuthenticated = true;
      }
      state.loading = false;
    },
  },
});

export const { setUser, setCredentials, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
