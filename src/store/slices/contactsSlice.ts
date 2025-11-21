import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import contactsData from '../../mock/contacts.json';

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

interface ContactsState {
  contacts: Contact[];
  loading: boolean;
}

const initialState: ContactsState = {
  contacts: contactsData as Contact[],
  loading: false,
};

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setContacts: (state, action: PayloadAction<Contact[]>) => {
      state.contacts = action.payload;
    },
    addContact: (state, action: PayloadAction<Contact>) => {
      state.contacts.push(action.payload);
    },
    updateContact: (state, action: PayloadAction<Contact>) => {
      const index = state.contacts.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.contacts[index] = action.payload;
      }
    },
    deleteContact: (state, action: PayloadAction<string>) => {
      state.contacts = state.contacts.filter(c => c.id !== action.payload);
    },
  },
});

export const { setContacts, addContact, updateContact, deleteContact } = contactsSlice.actions;
export default contactsSlice.reducer;
