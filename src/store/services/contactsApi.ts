import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./api";

// Backend response format
interface BackendContact {
  _id: string;
  name: string;
  emails: Array<{ email: string; type: string; is_primary: boolean }>;
  phones: Array<{ number: string; type: string; is_primary: boolean }>;
  company: string;
  categories: string[];
  tags?: string[];
  notes?: string;
  addresses?: Array<{
    type: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_primary: boolean;
  }>;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  profile_photo?: string;
  status?: string;
  leadScore?: number;
  lastInteraction?: string;
  created_at: string;
  created_by: string | { _id: string; name: string; email: string };
  updated_at?: string;
}

// Frontend Contact interface (transformed from backend)
export interface Contact {
  id: string;
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
  created_by: string;
  updated_at?: string;
  // Backend fields
  emails?: Array<{ email: string; type: string; is_primary: boolean }>;
  phones?: Array<{ number: string; type: string; is_primary: boolean }>;
  addresses?: Array<{
    type: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_primary: boolean;
  }>;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  profile_photo?: string;
  status?: string;
  leadScore?: number;
  lastInteraction?: string;
}

// Type exports for EditContact
export type Email = { email: string; type: string; is_primary: boolean };
export type Phone = { number: string; type: string; is_primary: boolean };
export type Address = {
  type: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
};
export type SocialLinks = {
  linkedin?: string;
  twitter?: string;
  website?: string;
};

// Backend create/update format
export interface CreateContactInput {
  name: string;
  emails: Email[];
  phones: Phone[];
  company: string;
  categories: string[];
  addresses?: Address[];
  social_links?: SocialLinks;
  tags?: string[];
  notes?: string;
  profile_photo?: string;
  status?: string;
  leadScore?: number;
  lastInteraction?: string;
}

// Helper function to transform backend contact to frontend format
const transformContact = (backendContact: any): Contact => {
  // Handle both new format (emails/phones arrays) and old format (direct email/phone fields)
  let primaryEmail = '';
  if (backendContact.emails && Array.isArray(backendContact.emails) && backendContact.emails.length > 0) {
    primaryEmail = backendContact.emails.find((e: any) => e.is_primary)?.email || backendContact.emails[0]?.email || '';
  } else if (backendContact.email) {
    primaryEmail = backendContact.email;
  }

  let primaryPhone = '';
  if (backendContact.phones && Array.isArray(backendContact.phones) && backendContact.phones.length > 0) {
    primaryPhone = backendContact.phones.find((p: any) => p.is_primary)?.number || backendContact.phones[0]?.number || '';
  } else if (backendContact.phone) {
    primaryPhone = backendContact.phone;
  }

  // Handle address - can be from addresses array or direct address field
  let address = '';
  const primaryAddress = backendContact.addresses?.find((a: any) => a.is_primary) || backendContact.addresses?.[0];
  if (primaryAddress) {
    address = `${primaryAddress.street || ''}, ${primaryAddress.city || ''}, ${primaryAddress.state || ''} ${primaryAddress.postal_code || ''}`.trim();
  } else if (backendContact.address) {
    address = backendContact.address;
  }

  // Handle LinkedIn URL - can be from social_links or direct linkedin field
  const linkedinUrl = backendContact.social_links?.linkedin || backendContact.linkedin || '';

  // Handle created_by - can be object or string
  const created_by = typeof backendContact.created_by === 'object' 
    ? (backendContact.created_by?._id || backendContact.created_by)
    : (backendContact.created_by || backendContact.createdBy || '');

  // Handle categories - normalize to array and capitalize first letter
  let categories: string[] = [];
  if (Array.isArray(backendContact.categories)) {
    categories = backendContact.categories.map((cat: string) => 
      cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()
    );
  } else if (backendContact.categories) {
    categories = [backendContact.categories];
  }

  // Handle created_at - can be created_at or createdAt
  const created_at = backendContact.created_at || backendContact.createdAt || new Date().toISOString();
  const updated_at = backendContact.updated_at || backendContact.updatedAt;

  return {
    id: backendContact._id,
    name: backendContact.name || '',
    email: primaryEmail,
    phone: primaryPhone,
    company: backendContact.company || '',
    categories: categories,
    address,
    linkedinUrl,
    notes: backendContact.notes,
    tags: backendContact.tags || [],
    created_at,
    created_by: String(created_by),
    updated_at,
    // Keep backend fields for edit operations
    emails: backendContact.emails && Array.isArray(backendContact.emails) && backendContact.emails.length > 0 
      ? backendContact.emails 
      : (primaryEmail ? [{ email: primaryEmail, type: 'work', is_primary: true }] : []),
    phones: backendContact.phones && Array.isArray(backendContact.phones) && backendContact.phones.length > 0 
      ? backendContact.phones 
      : (primaryPhone ? [{ number: primaryPhone, type: 'mobile', is_primary: true }] : []),
    addresses: backendContact.addresses || [],
    social_links: backendContact.social_links || (backendContact.linkedin ? { linkedin: backendContact.linkedin } : {}),
    profile_photo: backendContact.profile_photo,
    status: backendContact.status,
    leadScore: backendContact.leadScore,
    lastInteraction: backendContact.lastInteraction,
  };
};

export const contactsApi = createApi({
  reducerPath: "contactsApi",
  baseQuery,
  tagTypes: ["Contacts"],
  endpoints: (builder) => ({
    getContacts: builder.query<Contact[], void>({
      query: () => "/v1/api/contacts?limit=1000", // Fetch more contacts (increase limit)
      transformResponse: (response: any) => {
        // Handle different response structures
        if (response && response.success && Array.isArray(response.data)) {
          return response.data.map(transformContact);
        }
        // Fallback: if data is directly an array
        if (Array.isArray(response)) {
          return response.map(transformContact);
        }
        // Fallback: if response has data property that's an array
        if (response?.data && Array.isArray(response.data)) {
          return response.data.map(transformContact);
        }
        return [];
      },
      providesTags: ["Contacts"],
    }),
    getContactById: builder.query<Contact, string>({
      query: (id) => `/v1/api/contacts/${id}`,
      transformResponse: (response: any) => {
        // Handle backend response structure: { success: true, data: {...} }
        if (response && response.success && response.data) {
          return transformContact(response.data);
        }
        // Fallback: if data is directly the contact object
        if (response && response._id) {
          return transformContact(response);
        }
        throw new Error("Contact not found");
      },
      providesTags: (result, error, id) => [{ type: "Contacts", id }],
    }),
    searchContacts: builder.query<Contact[], string>({
      query: (query) => `/v1/api/contacts/search?q=${encodeURIComponent(query)}`,
      transformResponse: (response: { success: boolean; data: BackendContact[] }) => {
        if (response.success && Array.isArray(response.data)) {
          return response.data.map(transformContact);
        }
        return [];
      },
      providesTags: ["Contacts"],
    }),
    createContact: builder.mutation<Contact, CreateContactInput>({
      query: (contact) => ({
        url: "/v1/api/contacts",
        method: "POST",
        body: contact,
      }),
      transformResponse: (response: { success: boolean; data: BackendContact }) => {
        if (response.success && response.data) {
          return transformContact(response.data);
        }
        throw new Error("Failed to create contact");
      },
      invalidatesTags: ["Contacts"],
    }),
    updateContact: builder.mutation<Contact, { id: string; data: Partial<CreateContactInput>; profileImageFile?: File | null }>({
      query: ({ id, data, profileImageFile }) => {
        const endpoint = `/v1/api/contacts/${id}`;
        console.log('PUT API Call:', { endpoint, method: 'PUT', hasFile: !!profileImageFile, data });
        
        // If there's a file to upload, use FormData
        if (profileImageFile) {
          const formData = new FormData();
          
          // For complex nested structures, stringify them as JSON
          // This ensures the backend can parse them correctly
          if (data.emails) {
            formData.append('emails', JSON.stringify(data.emails));
          }
          if (data.phones) {
            formData.append('phones', JSON.stringify(data.phones));
          }
          if (data.addresses) {
            formData.append('addresses', JSON.stringify(data.addresses));
          }
          if (data.social_links) {
            formData.append('social_links', JSON.stringify(data.social_links));
          }
          if (data.categories) {
            // For simple arrays, append each item
            data.categories.forEach((cat) => {
              formData.append('categories[]', cat);
            });
          }
          if (data.tags) {
            data.tags.forEach((tag) => {
              formData.append('tags[]', tag);
            });
          }
          
          // Add simple fields
          if (data.name) formData.append('name', data.name);
          if (data.company) formData.append('company', data.company);
          if (data.status) formData.append('status', data.status);
          if (data.notes) formData.append('notes', data.notes);
          if (data.leadScore !== undefined) formData.append('leadScore', String(data.leadScore));
          if (data.lastInteraction) formData.append('lastInteraction', data.lastInteraction);
          if (data.profile_photo) formData.append('profile_photo', data.profile_photo);
          
          // Add the file
          formData.append('profile_photo', profileImageFile);
          
          return {
            url: endpoint,
            method: "PUT",
            body: formData,
          };
        }
        
        // Otherwise, send as JSON
        return {
          url: endpoint,
          method: "PUT",
          body: data,
        };
      },
      transformResponse: (response: any) => {
        // Handle backend response structure: { success: true, data: {...} }
        if (response && response.success && response.data) {
          return transformContact(response.data);
        }
        // Fallback: if data is directly the contact object
        if (response && response._id) {
          return transformContact(response);
        }
        throw new Error("Failed to update contact");
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Contacts", id },
        "Contacts",
      ],
    }),
    deleteContact: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/v1/api/contacts/${id}`,
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
