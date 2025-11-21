import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './api';
import usersData from '../../mock/users.json';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: 'Admin' | 'HR' | 'User';
    allowed_categories: string[];
    name: string;
    email: string;
    avatar: string;
  };
}

export interface UserResponse {
  user: {
    id: number;
    username: string;
    role: 'Admin' | 'HR' | 'User';
    allowed_categories: string[];
    name: string;
    email: string;
    avatar: string;
  };
}

// Check if we should use mock data (backend not available)
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

// Mock base query for local development
const mockBaseQuery = fetchBaseQuery({
  baseUrl: '/',
  // Simulate API delay
  fetchFn: async (...args) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return fetch(...args);
  },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: USE_MOCK_AUTH ? mockBaseQuery : baseQuery,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      queryFn: USE_MOCK_AUTH
        ? async (credentials) => {
            // Mock authentication logic
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const user = usersData.find(
              u => u.username === credentials.username && 
                   u.password === credentials.password &&
                   u.status === 'active'
            );

            if (user) {
              const { password, status, created_at, last_login, ...userWithoutSensitive } = user;
              return {
                data: {
                  token: `mock-jwt-token-${user.id}-${Date.now()}`,
                  user: {
                    id: parseInt(user.id),
                    username: user.username,
                    role: user.role,
                    allowed_categories: user.allowed_categories,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                  },
                },
              };
            }

            return {
              error: {
                status: 401,
                data: { error: 'Invalid credentials or inactive account' },
              },
            };
          }
        : undefined,
      query: !USE_MOCK_AUTH
        ? (credentials) => ({
            url: '/auth/login',
            method: 'POST',
            body: credentials,
          })
        : undefined,
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      queryFn: USE_MOCK_AUTH
        ? async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            return { data: { success: true } };
          }
        : undefined,
      query: !USE_MOCK_AUTH
        ? () => ({
            url: '/auth/logout',
            method: 'POST',
          })
        : undefined,
    }),
    getMe: builder.query<UserResponse, void>({
      queryFn: USE_MOCK_AUTH
        ? async () => {
            const storedUser = localStorage.getItem('crm_user');
            if (storedUser) {
              return { data: { user: JSON.parse(storedUser) } };
            }
            return {
              error: {
                status: 401,
                data: { error: 'Not authenticated' },
              },
            };
          }
        : undefined,
      query: !USE_MOCK_AUTH ? () => '/auth/me' : undefined,
      providesTags: ['Auth'],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery } = authApi;



