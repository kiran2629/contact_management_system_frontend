import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import contactsReducer from './slices/contactsSlice';
import usersReducer from './slices/usersSlice';
import permissionsReducer from './slices/permissionsSlice';
import logsReducer from './slices/logsSlice';
import themeReducer from './slices/themeSlice';
import layoutReducer from './slices/layoutSlice';
import { contactsApi } from './services/contactsApi';
import { usersApi } from './services/usersApi';
import { authApi } from './services/authApi';
import { dashboardApi } from './services/dashboardApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contacts: contactsReducer,
    users: usersReducer,
    permissions: permissionsReducer,
    logs: logsReducer,
    theme: themeReducer,
    layout: layoutReducer,
    [contactsApi.reducerPath]: contactsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      contactsApi.middleware,
      usersApi.middleware,
      authApi.middleware,
      dashboardApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
