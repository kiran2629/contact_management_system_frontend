import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

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

interface User {
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

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    // Placeholder for Day 2 API integration
    getUsers: builder.query({
      queryFn: () => ({ data: [] }),
      providesTags: ["Users"],
    }),
    getUserById: builder.query({
      queryFn: () => ({ data: null }),
    }),
    createUser: builder.mutation<User, CreateUserInput>({
      queryFn: async (data, _api, _extraOptions, baseQuery) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Get existing users from localStorage
        try {
          const existingUsers = localStorage.getItem("crm_users");
          const users: User[] = existingUsers ? JSON.parse(existingUsers) : [];

          // Check if username already exists
          if (users.some((u) => u.username === data.username)) {
            return {
              error: {
                status: 400,
                data: { message: "Username already exists" },
              },
            };
          }

          // Check if email already exists
          if (users.some((u) => u.email === data.email)) {
            return {
              error: { status: 400, data: { message: "Email already exists" } },
            };
          }

          // Generate new user ID
          const newId = `${users.length + 1}`;
          const now = new Date().toISOString();

          // No avatar URL - we'll use gender-specific icons only
          const avatar = "";

          // Create new user object
          const newUser: User = {
            id: newId,
            name: data.name,
            username: data.username,
            password: data.password,
            email: data.email,
            role: data.role,
            allowed_categories: data.allowed_categories,
            avatar,
            created_at: now,
            last_login: now,
            status: data.status || "active",
            gender: data.gender || "Other",
          };

          users.push(newUser);
          localStorage.setItem("crm_users", JSON.stringify(users));

          return { data: newUser };
        } catch (error) {
          console.error("Failed to create user:", error);
          return {
            error: { status: 500, data: { message: "Failed to create user" } },
          };
        }
      },
      invalidatesTags: ["Users"],
    }),
    updateUser: builder.mutation<User, { id: string; data: UpdateUserInput }>({
      queryFn: async ({ id, data }, _api, _extraOptions, baseQuery) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Get existing users from localStorage
        try {
          const existingUsers = localStorage.getItem("crm_users");
          const users: User[] = existingUsers ? JSON.parse(existingUsers) : [];

          // Find the user to update
          const userIndex = users.findIndex((u) => u.id === id);
          if (userIndex === -1) {
            return {
              error: { status: 404, data: { message: "User not found" } },
            };
          }

          const existingUser = users[userIndex];

          // Check if username already exists (if being changed)
          if (data.username && data.username !== existingUser.username) {
            if (
              users.some((u) => u.username === data.username && u.id !== id)
            ) {
              return {
                error: {
                  status: 400,
                  data: { message: "Username already exists" },
                },
              };
            }
          }

          // Check if email already exists (if being changed)
          if (data.email && data.email !== existingUser.email) {
            if (users.some((u) => u.email === data.email && u.id !== id)) {
              return {
                error: {
                  status: 400,
                  data: { message: "Email already exists" },
                },
              };
            }
          }

          const now = new Date().toISOString();

          // Update user
          const updatedUser: User = {
            ...existingUser,
            ...(data.name && { name: data.name }),
            ...(data.username && { username: data.username }),
            ...(data.email && { email: data.email }),
            ...(data.password && { password: data.password }),
            ...(data.role && { role: data.role }),
            ...(data.allowed_categories && {
              allowed_categories: data.allowed_categories,
            }),
            ...(data.status && { status: data.status }),
            ...(data.gender && { gender: data.gender }),
            // No avatar URL - we use gender-specific icons only
            avatar: "",
          };

          users[userIndex] = updatedUser;
          localStorage.setItem("crm_users", JSON.stringify(users));

          return { data: updatedUser };
        } catch (error) {
          console.error("Failed to update user:", error);
          return {
            error: { status: 500, data: { message: "Failed to update user" } },
          };
        }
      },
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation<{ success: boolean }, string>({
      queryFn: async (id, _api, _extraOptions, baseQuery) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Get existing users from localStorage
        try {
          const existingUsers = localStorage.getItem("crm_users");
          const users: User[] = existingUsers ? JSON.parse(existingUsers) : [];

          // Find and remove the user
          const filteredUsers = users.filter((u) => u.id !== id);

          if (filteredUsers.length === users.length) {
            return {
              error: { status: 404, data: { message: "User not found" } },
            };
          }

          localStorage.setItem("crm_users", JSON.stringify(filteredUsers));

          return { data: { success: true } };
        } catch (error) {
          console.error("Failed to delete user:", error);
          return {
            error: { status: 500, data: { message: "Failed to delete user" } },
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
