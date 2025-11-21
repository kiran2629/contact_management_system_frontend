import { createApi } from "@reduxjs/toolkit/query/react";
import { fakeBaseQuery } from "@reduxjs/toolkit/query";
import usersData from "../../mock/users.json";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
<<<<<<< HEAD
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
=======
  token: string;
  user: {
    id: number;
    username: string;
    role: "Admin" | "HR" | "User";
    allowed_categories: string[];
    name: string;
    email: string;
    avatar: string;
  };
>>>>>>> a5401ffb8e75068482635918f9499e7f8fe3cf8b
}

export interface UserResponse {
  user: {
    id: number;
    username: string;
    role: "Admin" | "HR" | "User";
    allowed_categories: string[];
    name: string;
    email: string;
    avatar: string;
  };
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
<<<<<<< HEAD
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
=======
      queryFn: async (credentials) => {
        // Mock authentication logic
        await new Promise((resolve) => setTimeout(resolve, 800));

        const user = usersData.find(
          (u) =>
            u.username === credentials.username &&
            u.password === credentials.password &&
            u.status === "active"
        );

        if (user) {
          return {
            data: {
              token: `mock-jwt-token-${user.id}-${Date.now()}`,
              user: {
                id: parseInt(user.id),
                username: user.username,
                role: user.role as "Admin" | "HR" | "User",
                allowed_categories: user.allowed_categories,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
              },
            },
          };
        }

        return {
          error: {
            status: "CUSTOM_ERROR" as const,
            error: "Invalid credentials or inactive account",
          },
        };
      },
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { data: { success: true } };
      },
    }),
    getMe: builder.query<UserResponse, void>({
      queryFn: async () => {
        const storedUser = localStorage.getItem("crm_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          return {
            data: {
              user: {
                id: user.id,
                username: user.username,
                role: user.role as "Admin" | "HR" | "User",
                allowed_categories: user.allowed_categories,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
              },
            },
          };
        }
        return {
          error: {
            status: "CUSTOM_ERROR" as const,
            error: "Not authenticated",
          },
        };
      },
>>>>>>> a5401ffb8e75068482635918f9499e7f8fe3cf8b
      providesTags: ["Auth"],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery } = authApi;
