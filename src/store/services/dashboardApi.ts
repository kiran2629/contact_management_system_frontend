import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./api";

// Dashboard Contact type (simplified version for recent contacts list)
export interface DashboardContact {
  id: number | string;
  name: string;
  company: string;
  created_at: string;
}

// API Response Contact (from backend)
interface ApiDashboardContact {
  _id: string;
  name: string;
  company: string;
  createdAt: string;
}

// API Response structure
interface ApiDashboardResponse {
  status: boolean;
  data: {
    totalContacts: number;
    totalUsers: number;
    recentActivities: number;
    weekActivities: number;
    recentContacts: ApiDashboardContact[];
  };
}

// Transformed Dashboard Response
export interface DashboardResponse {
  totalContacts: number;
  totalUsers: number;
  recentActivities: number;
  weekActivities: number;
  recentContacts: DashboardContact[];
}

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery,
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardResponse, void>({
      query: () => "/v1/api/user/dashboard",
      transformResponse: (response: ApiDashboardResponse): DashboardResponse => {
        // Transform API response to match our interface
        return {
          totalContacts: response.data?.totalContacts ?? 0,
          totalUsers: response.data?.totalUsers ?? 0,
          recentActivities: response.data?.recentActivities ?? 0,
          weekActivities: response.data?.weekActivities ?? 0,
          recentContacts: (response.data?.recentContacts ?? []).map((contact) => ({
            id: contact._id,
            name: contact.name,
            company: contact.company,
            created_at: contact.createdAt,
          })),
        };
      },
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;

