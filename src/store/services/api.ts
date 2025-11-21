import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include", // Include cookies in requests (needed for refresh token in logout)
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state first, then fallback to localStorage
    const state = getState() as RootState;
    const token = state.auth.token || localStorage.getItem("crm_token");

    // Set Authorization header for all requests when token is available
    // The login endpoint will work without it, but all other endpoints require it
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Set Content-Type header
    headers.set("Content-Type", "application/json");

    return headers;
  },
});
