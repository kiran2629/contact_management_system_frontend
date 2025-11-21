import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState, store } from "../store";
import { setToken, setRefreshToken, logout } from "../slices/authSlice";

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

    // Set Content-Type header
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
