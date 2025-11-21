import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import logsData from '../../mock/activityLogs.json';

interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  meta: Record<string, any>;
}

interface LogsState {
  logs: ActivityLog[];
}

const getStoredLogs = () => {
  const stored = localStorage.getItem('crm_logs');
  return stored ? JSON.parse(stored) : logsData;
};

const initialState: LogsState = {
  logs: getStoredLogs(),
};

const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    addLog: (state, action: PayloadAction<Omit<ActivityLog, 'id' | 'timestamp'>>) => {
      const newLog: ActivityLog = {
        ...action.payload,
        id: `log${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      state.logs.unshift(newLog);
      localStorage.setItem('crm_logs', JSON.stringify(state.logs));
    },
    clearLogs: (state) => {
      state.logs = [];
      localStorage.removeItem('crm_logs');
    },
  },
});

export const { addLog, clearLogs } = logsSlice.actions;
export default logsSlice.reducer;
