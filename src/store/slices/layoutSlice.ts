import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LayoutType = 'floating' | 'sidebar' | 'minimal' | 'bottom' | 'command';

interface LayoutState {
  currentLayout: LayoutType;
}

const initialState: LayoutState = {
  currentLayout: (localStorage.getItem('layout_preference') as LayoutType) || 'floating',
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    setLayout: (state, action: PayloadAction<LayoutType>) => {
      state.currentLayout = action.payload;
      localStorage.setItem('layout_preference', action.payload);
    },
  },
});

export const { setLayout } = layoutSlice.actions;
export default layoutSlice.reducer;

