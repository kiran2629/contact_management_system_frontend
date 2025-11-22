import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState, store } from "../store";
import { setToken, setRefreshToken, logout } from "../slices/authSlice";

// API Base URL Configuration:
// - Development: Uses .env file (VITE_API_URL=http://localhost:5000)
// - Production: Uses .env.production file (VITE_API_URL=<your-backend-api-url>)
// - Frontend Production URL: https://crm-b7wf.onrender.com/
// Note: VITE_API_URL should point to your backend API server, not the frontend URL
// Vite automatically loads the correct .env file based on the build mode
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include", // Include cookies in requests (needed for refresh token)
  prepareHeaders: (headers, { getState }) => {
    // Get access token from Redux state first, then fallback to localStorage
    const state = getState() as RootState;
    const token = state.auth.token || localStorage.getItem("crm_token");

    // Set Authorization header for all requests when token is available
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Set Content-Type header for JSON requests
    // Note: For FormData, we'll handle it in the baseQuery wrapper
    headers.set("Content-Type", "application/json");

    return headers;
  },
});

// Base query with automatic token refresh
export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Check if body is FormData and remove Content-Type header if so
  const requestArgs = typeof args === "string" ? { url: args } : args;
  if (requestArgs.body instanceof FormData) {
    // Create a modified args without Content-Type header
    const modifiedArgs =
      typeof args === "string"
        ? { url: args, headers: {} }
        : {
            ...args,
            headers: { ...(args.headers || {}), "Content-Type": undefined },
          };

    // Use a custom fetch that doesn't set Content-Type for FormData
    const customBaseQuery = fetchBaseQuery({
      baseUrl: API_BASE_URL,
      credentials: "include",
      prepareHeaders: (headers, { getState }) => {
        const state = getState() as RootState;
        const token = state.auth.token || localStorage.getItem("crm_token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        // Don't set Content-Type - let browser set it with boundary for FormData
        return headers;
      },
    });

    let result = await customBaseQuery(modifiedArgs, api, extraOptions);

    // Handle token refresh if needed
    const url =
      typeof modifiedArgs === "string" ? modifiedArgs : modifiedArgs.url;
    const isRefreshRequest = url?.includes("/refresh-token");
    const isLoginRequest = url?.includes("/login");
    const isLogoutRequest = url?.includes("/logout");

    if (
      result.error &&
      result.error.status === 401 &&
      !isRefreshRequest &&
      !isLoginRequest &&
      !isLogoutRequest
    ) {
      const refreshToken = localStorage.getItem("crm_refresh_token");

      if (refreshToken) {
        const refreshResult = await customBaseQuery(
          {
            url: "/v1/api/auth/refresh-token",
            method: "POST",
            body: { refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const refreshData = refreshResult.data as {
            success: boolean;
            accessToken: string;
            refreshToken: string;
          };

          store.dispatch(setToken(refreshData.accessToken));
          store.dispatch(setRefreshToken(refreshData.refreshToken));

          const retryResult = await customBaseQuery(
            modifiedArgs,
            api,
            extraOptions
          );
          return retryResult;
        } else {
          store.dispatch(logout());
          document.cookie =
            "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie =
            "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          return result;
        }
      } else {
        store.dispatch(logout());
        return result;
      }
    }

    return result;
  }

  let result = await baseQueryWithAuth(args, api, extraOptions);

  // Check if this is a refresh token request to avoid infinite loops
  const url = typeof args === "string" ? args : args.url;
  const isRefreshRequest = url?.includes("/refresh-token");
  const isLoginRequest = url?.includes("/login");
  const isLogoutRequest = url?.includes("/logout");

  // If we get a 401 (Unauthorized), try to refresh the token
  // Skip refresh for login, logout, and refresh-token endpoints
  if (
    result.error &&
    result.error.status === 401 &&
    !isRefreshRequest &&
    !isLoginRequest &&
    !isLogoutRequest
  ) {
    const refreshToken = localStorage.getItem("crm_refresh_token");

    if (refreshToken) {
      // Try to refresh the token
      const refreshResult = await baseQueryWithAuth(
        {
          url: "/v1/api/auth/refresh-token",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const refreshData = refreshResult.data as {
          success: boolean;
          accessToken: string;
          refreshToken: string;
        };

        // Update tokens in Redux store and localStorage
        store.dispatch(setToken(refreshData.accessToken));
        store.dispatch(setRefreshToken(refreshData.refreshToken));

        // Retry the original request with the new token
        const retryResult = await baseQueryWithAuth(args, api, extraOptions);
        return retryResult;
      } else {
        // Refresh failed, logout the user
        store.dispatch(logout());
        // Clear cookies
        document.cookie =
          "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        return result; // Return the original error
      }
    } else {
      // No refresh token available, logout
      store.dispatch(logout());
      return result;
    }
  }

  return result;
};
