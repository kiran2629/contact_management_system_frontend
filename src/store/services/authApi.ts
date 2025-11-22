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
  user?: {
    id: number | string;
    username: string;
    role: "Admin" | "HR" | "User";
    allowed_categories: string[];
    name?: string;
    email?: string;
    avatar?: string;
  };
}

export interface UserResponse {
  user: {
    id: number;
    username: string;
    role: "Admin" | "HR" | "User";
    allowed_categories: string[];
    name?: string;
    email?: string;
    avatar?: string;
  };
}

export interface SignedUserApiResponse {
  success: boolean;
  user: {
    _id: string;
    userName: string;
    email: string;
    role: "Admin" | "HR" | "User";
    allowed_categories: string[];
    name?: string;
    avatar?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    lastLoginAt?: string;
    permissions?: {
      contact?: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
      };
      notes?: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
      };
      tasks?: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
      };
      crm_features?: {
        view_birthdays: boolean;
        view_statistics: boolean;
        export_contacts: boolean;
        import_contacts: boolean;
      };
    };
  };
}

export interface SignedUserResponse {
  _id: string;
  userName: string;
  email: string;
  role: "Admin" | "HR" | "User";
  allowed_categories: string[];
  name?: string;
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  permissions?: {
    contact?: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
    notes?: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
    tasks?: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
    crm_features?: {
      view_birthdays: boolean;
      view_statistics: boolean;
      export_contacts: boolean;
      import_contacts: boolean;
    };
  };
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQuery,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/v1/api/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/v1/api/auth/logout",
        method: "POST",
      }),
    }),
    getMe: builder.query<UserResponse, void>({
      query: () => ({
        url: "/v1/api/auth/me",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
    getSignedUser: builder.query<SignedUserResponse, void>({
      query: () => ({
        url: "/v1/api/auth/getSignedUser",
        method: "GET",
      }),
      transformResponse: (
        response: SignedUserApiResponse
      ): SignedUserResponse => {
        return response.user;
      },
      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useGetSignedUserQuery,
} = authApi;
