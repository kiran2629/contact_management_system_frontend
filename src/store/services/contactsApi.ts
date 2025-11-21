import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

export const contactsApi = createApi({
  reducerPath: 'contactsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Contacts'],
  endpoints: (builder) => ({
    // Placeholder for Day 2 API integration
    getContacts: builder.query({
      queryFn: () => ({ data: [] }),
      providesTags: ['Contacts'],
    }),
    getContactById: builder.query({
      queryFn: () => ({ data: null }),
    }),
    createContact: builder.mutation({
      queryFn: () => ({ data: null }),
      invalidatesTags: ['Contacts'],
    }),
    updateContact: builder.mutation({
      queryFn: () => ({ data: null }),
      invalidatesTags: ['Contacts'],
    }),
    deleteContact: builder.mutation({
      queryFn: () => ({ data: null }),
      invalidatesTags: ['Contacts'],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useGetContactByIdQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactsApi;
