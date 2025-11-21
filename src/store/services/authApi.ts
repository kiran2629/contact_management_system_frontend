import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  user: {
    id: number;
    username: string;
    role: "Admin" | "HR" | "User";
    allowed_categories: string[];
  };
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/v1/api/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation<{ success: boolean; message?: string }, void>({
      query: () => ({
        url: "/v1/api/auth/logout",
        method: "POST",
      }),
    }),
    getMe: builder.query<UserResponse, void>({
      query: () => "/v1/auth/me",
      providesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery } = authApi;
