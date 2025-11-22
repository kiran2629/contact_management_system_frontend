import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./api";

// Helper function to parse permissions (can be string or object)
const parsePermissions = (permissions: any): any => {
  if (!permissions) return undefined;
  if (typeof permissions === "string") {
    try {
      return JSON.parse(permissions);
    } catch (e) {
      console.error("Error parsing permissions:", e);
      return undefined;
    }
  }
  return permissions;
};

// API Response types
interface ApiUserResponse {
  _id: string;
  userName: string;
  name?: string;
  email: string;
  role: "Admin" | "HR" | "User";
  allowed_categories: string[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  profile_photo?: string | null;
  gender?: "Male" | "Female" | "Other";
  status?: "Active" | "Inactive";
  permissions?:
    | string
    | {
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
  profile_photo?: string | null;
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
  profile_photo?: string;
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
          name: apiUser.name || apiUser.userName, // Use name if available, otherwise userName
          avatar: "", // Not provided by API
          profile_photo: apiUser.profile_photo || null,
          created_at: apiUser.createdAt,
          last_login: apiUser.lastLoginAt || "",
          status: apiUser.isActive ? "active" : "inactive",
          gender: apiUser.gender,
          permissions: parsePermissions(apiUser.permissions),
        }));
      },
      providesTags: ["Users"],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `/v1/api/user/${id}`,
      transformResponse: (response: any): User => {
        // Handle multiple response formats:
        // 1. { status: true, user: {...} }
        // 2. { status: true, data: { user: {...} } }
        // 3. { user: {...} }
        // 4. Direct user object: {...}
        let apiUser: ApiUserResponse;

        if (response.data?.user) {
          // Response is wrapped: { status: true, data: { user: {...} } }
          apiUser = response.data.user;
        } else if (response.user) {
          // Response is wrapped: { user: {...} } or { status: true, user: {...} }
          apiUser = response.user;
        } else if (response.data?._id) {
          // Response is wrapped: { status: true, data: {...} }
          apiUser = response.data;
        } else if (response._id) {
          // Response is direct: {...}
          apiUser = response;
        } else {
          // Fallback: use response as-is
          apiUser = response as ApiUserResponse;
        }

        // Transform API response to match User interface
        const transformed: User = {
          id: apiUser._id || "",
          username: apiUser.userName || "",
          email: apiUser.email || "",
          role: apiUser.role || "User",
          allowed_categories: apiUser.allowed_categories || [],
          name: apiUser.name || apiUser.userName || "", // Use name if available, otherwise userName
          avatar: "", // Not provided by API
          profile_photo: apiUser.profile_photo || null,
          created_at: apiUser.createdAt || "",
          last_login: apiUser.lastLoginAt || "",
          status: apiUser.isActive ? "active" : "inactive",
          gender: apiUser.gender,
          permissions: parsePermissions(apiUser.permissions),
        };

        return transformed;
      },
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),
    createUser: builder.mutation<User, CreateUserInput>({
      query: (userData) => ({
        url: "/v1/api/user/createUser",
        method: "POST",
        body: {
          userName: userData.username,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          allowed_categories: userData.allowed_categories,
          gender: userData.gender || "Other",
          status: userData.status === "active" ? "Active" : "Inactive",
        },
      }),
      transformResponse: (response: any): User => {
        // Handle API response - might be direct user object or wrapped
        const apiUser: ApiUserResponse = response.user || response;

        // Transform to match User interface
        return {
          id: apiUser._id || "",
          username: apiUser.userName || "",
          email: apiUser.email || "",
          role: apiUser.role || "User",
          allowed_categories: apiUser.allowed_categories || [],
          name: apiUser.name || apiUser.userName || "",
          avatar: "",
          profile_photo: apiUser.profile_photo || null,
          created_at: apiUser.createdAt || "",
          last_login: apiUser.lastLoginAt || "",
          status: apiUser.isActive ? "active" : "inactive",
          gender: apiUser.gender,
          permissions: parsePermissions(apiUser.permissions),
        };
      },
      invalidatesTags: ["Users"],
    }),
    updateUser: builder.mutation<
      User,
      { id: string; data: UpdateUserInput; profileImageFile?: File | null }
    >({
      query: ({ id, data, profileImageFile }) => {
        // If there's a file to upload, use FormData
        if (profileImageFile) {
          const formData = new FormData();

          // Add simple fields
          if (data.name !== undefined) formData.append("name", data.name);
          if (data.role !== undefined) formData.append("role", data.role);
          if (data.username !== undefined)
            formData.append("userName", data.username);
          if (data.email !== undefined) formData.append("email", data.email);
          if (data.password !== undefined && data.password.trim() !== "")
            formData.append("password", data.password);
          if (data.allowed_categories !== undefined) {
            data.allowed_categories.forEach((cat) => {
              formData.append("allowed_categories[]", cat);
            });
          }
          if (data.gender !== undefined) formData.append("gender", data.gender);
          if (data.status !== undefined)
            formData.append(
              "status",
              data.status === "active" ? "Active" : "Inactive"
            );
          if (data.permissions !== undefined)
            formData.append("permissions", JSON.stringify(data.permissions));

          // Add the file - backend expects 'profile_photo' field name
          formData.append("profile_photo", profileImageFile);

          return {
            url: `/v1/api/user/update/${id}`,
            method: "PUT",
            body: formData,
          };
        }

        // Otherwise, send as JSON
        const payload: any = {};
        if (data.name !== undefined) payload.name = data.name;
        if (data.role !== undefined) payload.role = data.role;
        if (data.username !== undefined) payload.userName = data.username;
        if (data.email !== undefined) payload.email = data.email;
        if (data.password !== undefined && data.password.trim() !== "")
          payload.password = data.password;
        if (data.allowed_categories !== undefined)
          payload.allowed_categories = data.allowed_categories;
        if (data.gender !== undefined) payload.gender = data.gender;
        if (data.status !== undefined)
          payload.status = data.status === "active" ? "Active" : "Inactive";
        if (data.permissions !== undefined)
          payload.permissions = data.permissions;

        return {
          url: `/v1/api/user/update/${id}`,
          method: "PUT",
          body: payload,
        };
      },
      transformResponse: (response: any): User => {
        // Handle API response - might be direct user object or wrapped
        const apiUser: ApiUserResponse = response.user || response;

        // Transform to match User interface
        return {
          id: apiUser._id || "",
          username: apiUser.userName || "",
          email: apiUser.email || "",
          role: apiUser.role || "User",
          allowed_categories: apiUser.allowed_categories || [],
          name: apiUser.name || apiUser.userName || "",
          avatar: "",
          profile_photo: apiUser.profile_photo || null,
          created_at: apiUser.createdAt || "",
          last_login: apiUser.lastLoginAt || "",
          status: apiUser.isActive ? "active" : "inactive",
          gender: apiUser.gender,
          permissions: parsePermissions(apiUser.permissions),
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        "Users",
      ],
    }),
    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/v1/api/user/delete/${id}`,
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
