import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import contactsReducer from './slices/contactsSlice';
import usersReducer from './slices/usersSlice';
import permissionsReducer from './slices/permissionsSlice';
import logsReducer from './slices/logsSlice';
import themeReducer from './slices/themeSlice';
import { contactsApi } from './services/contactsApi';
import { usersApi } from './services/usersApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contacts: contactsReducer,
    users: usersReducer,
    permissions: permissionsReducer,
    logs: logsReducer,
    theme: themeReducer,
    [contactsApi.reducerPath]: contactsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(contactsApi.middleware, usersApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
