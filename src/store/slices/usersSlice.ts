import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import usersData from "../../mock/users.json";

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

interface UsersState {
  users: User[];
  loading: boolean;
}

const initialState: UsersState = {
  users: usersData as User[],
  loading: false,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
    },
  },
});

export const { setUsers, addUser, updateUser, deleteUser } = usersSlice.actions;
export default usersSlice.reducer;
