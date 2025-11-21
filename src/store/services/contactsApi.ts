import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

interface CreateContactInput {
  name: string;
  email: string;
  phone: string;
  company: string;
  categories: string[];
  birthday: string;
  linkedinUrl: string;
  address: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  categories: string[];
  birthday: string;
  linkedinUrl: string;
  address: string;
  notes: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  tags: string[];
}

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
    createContact: builder.mutation<Contact, CreateContactInput>({
      queryFn: async (data, _api, _extraOptions, baseQuery) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Get current user from localStorage (mock)
        const storedUser = localStorage.getItem('crm_user');
        const user = storedUser ? JSON.parse(storedUser) : { id: 'user1', name: 'System' };

        // Generate new contact ID
        const newId = `c${Date.now()}`;
        const now = new Date().toISOString();

        // Create new contact object
        const newContact: Contact = {
          id: newId,
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          position: '', // Optional field, can be added later
          categories: data.categories,
          birthday: data.birthday,
          linkedinUrl: data.linkedinUrl,
          address: data.address,
          notes: '',
          created_at: now,
          created_by: user.id || 'system',
          updated_at: now,
          tags: [],
        };

        // Store in localStorage for persistence (mock)
        try {
          const existingContacts = localStorage.getItem('crm_contacts');
          const contacts = existingContacts ? JSON.parse(existingContacts) : [];
          contacts.push(newContact);
          localStorage.setItem('crm_contacts', JSON.stringify(contacts));
        } catch (error) {
          console.error('Failed to save contact to localStorage:', error);
        }

        return { data: newContact };
      },
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
