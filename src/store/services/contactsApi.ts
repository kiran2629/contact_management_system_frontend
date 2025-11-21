import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./api";

export interface Contact {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position?: string;
  categories: string[];
  birthday?: string;
  linkedinUrl?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  created_by: number | string;
  updated_at?: string;
}

export interface CreateContactInput {
  name: string;
  email: string;
  phone: string;
  company: string;
  categories: string[];
  birthday: string;
  linkedinUrl: string;
  address: string;
  tags?: string[];
  notes?: string;
}

export const contactsApi = createApi({
  reducerPath: "contactsApi",
  baseQuery,
  tagTypes: ["Contacts"],
  endpoints: (builder) => ({
    getContacts: builder.query<Contact[], void>({
      query: () => "/contacts",
      providesTags: ["Contacts"],
    }),
    getContactById: builder.query<Contact, number>({
      query: (id) => `/contacts/${id}`,
      providesTags: (result, error, id) => [{ type: "Contacts", id }],
    }),
    searchContacts: builder.query<Contact[], string>({
      query: (query) => `/contacts/search?q=${encodeURIComponent(query)}`,
      providesTags: ["Contacts"],
    }),
    createContact: builder.mutation<
      Contact,
      Omit<Contact, "id" | "created_at" | "created_by">
    >({
      query: (contact) => ({
        url: "/contacts",
        method: "POST",
        body: contact,
      }),
      invalidatesTags: ["Contacts"],
    }),
    updateContact: builder.mutation<
      Contact,
      { id: number; data: Partial<Contact> }
    >({
      query: ({ id, data }) => ({
        url: `/contacts/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Contacts", id },
        "Contacts",
      ],
    }),
    deleteContact: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/contacts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contacts"],
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
