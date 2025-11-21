import { store } from '../store/store';
import { addLog } from '../store/slices/logsSlice';

export const logActivity = (action: string, meta: Record<string, any> = {}) => {
  const state = store.getState();
  const userId = state.auth.user?.id;

  if (!userId) return;

  store.dispatch(addLog({
    user: userId,
    action,
    meta,
  }));
};
