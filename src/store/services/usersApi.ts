import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import usersData from "../../mock/users.json";

// Full User type matching the slice
export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  role: "Admin" | "HR" | "User";
  allowed_categories: string[];
  name: string;
  avatar: string;
  created_at: string;
  last_login: string;
  status: "active" | "inactive";
  gender?: "Male" | "Female" | "Other";
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
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      queryFn: async () => {
        try {
          const stored = localStorage.getItem("crm_users");
          const users = stored ? JSON.parse(stored) : usersData;
          return { data: users as User[] };
        } catch (error) {
          return {
            error: { status: "CUSTOM_ERROR", error: "Failed to fetch users" },
          };
        }
      },
      providesTags: ["Users"],
    }),
    getUserById: builder.query<User, string>({
      queryFn: async (id) => {
        try {
          const stored = localStorage.getItem("crm_users");
          const users = stored ? JSON.parse(stored) : usersData;
          const user = users.find((u: User) => u.id === id);
          if (!user) {
            return {
              error: { status: "CUSTOM_ERROR", error: "User not found" },
            };
          }
          return { data: user as User };
        } catch (error) {
          return {
            error: { status: "CUSTOM_ERROR", error: "Failed to fetch user" },
          };
        }
      },
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),
    createUser: builder.mutation<User, CreateUserInput>({
      queryFn: async (userData) => {
        try {
          const stored = localStorage.getItem("crm_users");
          const users = stored ? JSON.parse(stored) : usersData;

          // Check uniqueness
          if (users.some((u: User) => u.username === userData.username)) {
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: "Username already exists",
              },
            };
          }
          if (users.some((u: User) => u.email === userData.email)) {
            return {
              error: { status: "CUSTOM_ERROR", error: "Email already exists" },
            };
          }

          const newUser: User = {
            id: String(Date.now()),
            username: userData.username,
            password: userData.password,
            email: userData.email,
            role: userData.role,
            allowed_categories: userData.allowed_categories,
            name: userData.name,
            avatar: "",
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            status: userData.status || "active",
            gender: userData.gender || "Other",
          };

          users.push(newUser);
          localStorage.setItem("crm_users", JSON.stringify(users));

          return { data: newUser };
        } catch (error) {
          return {
            error: { status: "CUSTOM_ERROR", error: "Failed to create user" },
          };
        }
      },
      invalidatesTags: ["Users"],
    }),
    updateUser: builder.mutation<User, { id: string; data: UpdateUserInput }>({
      queryFn: async ({ id, data }) => {
        try {
          const stored = localStorage.getItem("crm_users");
          const users = stored ? JSON.parse(stored) : usersData;
          const userIndex = users.findIndex((u: User) => u.id === id);

          if (userIndex === -1) {
            return {
              error: { status: "CUSTOM_ERROR", error: "User not found" },
            };
          }

          // Check uniqueness (excluding current user)
          if (
            data.username &&
            users.some((u: User) => u.username === data.username && u.id !== id)
          ) {
            return {
              error: {
                status: "CUSTOM_ERROR",
                error: "Username already exists",
              },
            };
          }
          if (
            data.email &&
            users.some((u: User) => u.email === data.email && u.id !== id)
          ) {
            return {
              error: { status: "CUSTOM_ERROR", error: "Email already exists" },
            };
          }

          const updatedUser: User = {
            ...users[userIndex],
            ...data,
            avatar: users[userIndex].avatar || "",
          };

          users[userIndex] = updatedUser;
          localStorage.setItem("crm_users", JSON.stringify(users));

          return { data: updatedUser };
        } catch (error) {
          return {
            error: { status: "CUSTOM_ERROR", error: "Failed to update user" },
          };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        "Users",
      ],
    }),
    deleteUser: builder.mutation<{ success: boolean }, string>({
      queryFn: async (id) => {
        try {
          const stored = localStorage.getItem("crm_users");
          const users = stored ? JSON.parse(stored) : usersData;
          const filtered = users.filter((u: User) => u.id !== id);
          localStorage.setItem("crm_users", JSON.stringify(filtered));
          return { data: { success: true } };
        } catch (error) {
          return {
            error: { status: "CUSTOM_ERROR", error: "Failed to delete user" },
          };
        }
      },
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
