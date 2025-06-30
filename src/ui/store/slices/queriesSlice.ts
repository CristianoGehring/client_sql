import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { QueryResult, QueryHistory } from '@/shared/types';

interface QueryTab {
  id: string;
  title: string;
  query: string;
  connectionId: string | null; // ID da conexão selecionada
  result?: QueryResult;
  loading: boolean;
  error?: string;
}

interface QueriesState {
  tabs: QueryTab[];
  activeTabId: string | null;
  history: QueryHistory[];
  favorites: string[];
  loading: boolean;
  error: string | null;
}

const initialState: QueriesState = {
  tabs: [],
  activeTabId: null,
  history: [],
  favorites: [],
  loading: false,
  error: null,
};

// Async thunks
export const executeQuery = createAsyncThunk(
  'queries/executeQuery',
  async ({ query, connectionId, params }: { query: string; connectionId: string; params?: any[] }) => {
    const result = await window.electronAPI.executeQuery(query, connectionId, params);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.result;
  }
);

const queriesSlice = createSlice({
  name: 'queries',
  initialState,
  reducers: {
    addTab: (state, action: PayloadAction<Partial<QueryTab>>) => {
      const newTab: QueryTab = {
        id: action.payload.id || `tab-${Date.now()}`,
        title: action.payload.title || 'Nova Query',
        query: action.payload.query || '',
        connectionId: action.payload.connectionId || null,
        loading: false,
      };
      state.tabs.push(newTab);
      state.activeTabId = newTab.id;
    },
    removeTab: (state, action: PayloadAction<string>) => {
      state.tabs = state.tabs.filter(tab => tab.id !== action.payload);
      if (state.activeTabId === action.payload) {
        state.activeTabId = state.tabs.length > 0 ? state.tabs[0].id : null;
      }
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTabId = action.payload;
    },
    updateTabQuery: (state, action: PayloadAction<{ tabId: string; query: string }>) => {
      const tab = state.tabs.find(t => t.id === action.payload.tabId);
      if (tab) {
        tab.query = action.payload.query;
      }
    },
    updateTabTitle: (state, action: PayloadAction<{ tabId: string; title: string }>) => {
      const tab = state.tabs.find(t => t.id === action.payload.tabId);
      if (tab) {
        tab.title = action.payload.title;
      }
    },
    updateTabConnection: (state, action: PayloadAction<{ tabId: string; connectionId: string | null }>) => {
      const tab = state.tabs.find(t => t.id === action.payload.tabId);
      if (tab) {
        tab.connectionId = action.payload.connectionId;
      }
    },
    clearTabResult: (state, action: PayloadAction<{ tabId: string }>) => {
      const tab = state.tabs.find(t => t.id === action.payload.tabId);
      if (tab) {
        tab.result = undefined;
        tab.error = undefined;
      }
    },
    addToHistory: (state, action: PayloadAction<QueryHistory>) => {
      state.history.unshift(action.payload);
      // Manter apenas os últimos 100 itens
      if (state.history.length > 100) {
        state.history = state.history.slice(0, 100);
      }
    },
    addToFavorites: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(fav => fav !== action.payload);
    },
    clearHistory: (state) => {
      state.history = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(executeQuery.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        // Encontrar a tab ativa e marcar como loading
        const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
        if (activeTab) {
          activeTab.loading = true;
          activeTab.error = undefined;
        }
      })
      .addCase(executeQuery.fulfilled, (state, action) => {
        state.loading = false;
        const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
        if (activeTab && action.payload) {
          activeTab.loading = false;
          activeTab.result = action.payload;
          // Adicionar ao histórico
          state.history.unshift({
            id: `history-${Date.now()}`,
            query: activeTab.query,
            connectionId: activeTab.connectionId || '',
            executionTime: action.payload.executionTime,
            timestamp: new Date().toISOString(),
            success: true,
          });
        }
      })
      .addCase(executeQuery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao executar query';
        const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
        if (activeTab) {
          activeTab.loading = false;
          activeTab.error = action.error.message || 'Erro ao executar query';
        }
      });
  },
});

export const {
  addTab,
  removeTab,
  setActiveTab,
  updateTabQuery,
  updateTabTitle,
  updateTabConnection,
  clearTabResult,
  addToHistory,
  addToFavorites,
  removeFromFavorites,
  clearHistory,
  clearError,
} = queriesSlice.actions;

export default queriesSlice.reducer; 