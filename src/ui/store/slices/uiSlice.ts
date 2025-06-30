import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppConfig, Notification } from '@/shared/types';

interface UIState {
  theme: 'dark' | 'light';
  density: 'compact' | 'normal' | 'spacious';
  sidebarCollapsed: boolean;
  notifications: Notification[];
  config: AppConfig;
}

const initialState: UIState = {
  theme: 'dark',
  density: 'normal',
  sidebarCollapsed: false,
  notifications: [],
  config: {
    theme: 'dark',
    density: 'normal',
    maxResults: 1000,
    queryTimeout: 30000,
    autoSave: true,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
      state.config.theme = action.payload;
    },
    setDensity: (state, action: PayloadAction<'compact' | 'normal' | 'spacious'>) => {
      state.density = action.payload;
      state.config.density = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    updateConfig: (state, action: PayloadAction<Partial<AppConfig>>) => {
      state.config = { ...state.config, ...action.payload };
    },
  },
});

export const {
  setTheme,
  setDensity,
  toggleSidebar,
  setSidebarCollapsed,
  addNotification,
  removeNotification,
  clearNotifications,
  updateConfig,
} = uiSlice.actions;

export default uiSlice.reducer; 