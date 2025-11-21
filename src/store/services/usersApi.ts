import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Users'],
  endpoints: (builder) => ({
    // Placeholder for Day 2 API integration
    getUsers: builder.query({
      queryFn: () => ({ data: [] }),
      providesTags: ['Users'],
    }),
    getUserById: builder.query({
      queryFn: () => ({ data: null }),
    }),
    createUser: builder.mutation({
      queryFn: () => ({ data: null }),
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation({
      queryFn: () => ({ data: null }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation({
      queryFn: () => ({ data: null }),
      invalidatesTags: ['Users'],
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
