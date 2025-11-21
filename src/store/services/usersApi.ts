import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./api";

// API Response types
interface ApiUserResponse {
  _id: string;
  userName: string;
  email: string;
  role: "Admin" | "HR" | "User";
  allowed_categories: string[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
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

interface GetUsersResponse {
  status: boolean;
  users: ApiUserResponse[];
}

// Full User type matching the slice
export interface User {
  id: string;
  username: string;
  password?: string;
  email: string;
  role: "Admin" | "HR" | "User";
  allowed_categories: string[];
  name: string;
  avatar: string;
  created_at: string;
  last_login: string;
  status: "active" | "inactive";
  gender?: "Male" | "Female" | "Other";
  permissions?: ApiUserResponse["permissions"];
}

export interface CreateUserInput {
  name: string;
  username: string;
  email: string;
  password: string;
  role: "Admin" | "HR" | "User";
  allowed_categories: string[];
  status?: "active" | "inactive";
  gender?: "Male" | "Female" | "Other";
}

export interface UpdateUserInput {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: "Admin" | "HR" | "User";
  allowed_categories?: string[];
  status?: "active" | "inactive";
  gender?: "Male" | "Female" | "Other";
}

// Legacy types for backward compatibility
export interface CreateUserRequest extends CreateUserInput {}
export interface UpdateUserRequest extends UpdateUserInput {}

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery,
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => "/v1/api/user/all",
      transformResponse: (response: GetUsersResponse): User[] => {
        // Transform API response to match User interface
        if (!response.users || !Array.isArray(response.users)) {
          return [];
        }
        return response.users.map((apiUser) => ({
          id: apiUser._id,
          username: apiUser.userName,
          email: apiUser.email,
          role: apiUser.role,
          allowed_categories: apiUser.allowed_categories || [],
          name: apiUser.userName, // Use userName as name if name is not available
          avatar: "", // Not provided by API
          created_at: apiUser.createdAt,
          last_login: apiUser.lastLoginAt || "",
          status: apiUser.isActive ? "active" : "inactive",
          permissions: apiUser.permissions,
        }));
      },
      providesTags: ["Users"],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `/v1/api/user/${id}`,
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),
    createUser: builder.mutation<User, CreateUserInput>({
      query: (userData) => ({
        url: "/v1/api/user",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
    updateUser: builder.mutation<User, { id: string; data: UpdateUserInput }>({
      query: ({ id, data }) => ({
        url: `/v1/api/user/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        "Users",
      ],
    }),
    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/v1/api/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
