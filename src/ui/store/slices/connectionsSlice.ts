import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DatabaseConnection } from '@/shared/types';

interface ConnectionsState {
  connections: DatabaseConnection[];
  activeConnection: DatabaseConnection | null;
  loading: boolean;
  error: string | null;
}

const initialState: ConnectionsState = {
  connections: [],
  activeConnection: null,
  loading: false,
  error: null,
};

// Async thunks
export const testConnection = createAsyncThunk(
  'connections/testConnection',
  async (connection: DatabaseConnection) => {
    console.log('🔄 Redux: testConnection chamado com:', connection);
    const result = await window.electronAPI.testConnection(connection);
    console.log('📡 Redux: Resultado da API:', result);
    if (!result.success) {
      console.error('❌ Redux: Erro na API:', result.error);
      throw new Error(result.error);
    }
    console.log('✅ Redux: Teste bem-sucedido');
    return result;
  }
);

export const createConnection = createAsyncThunk(
  'connections/createConnection',
  async (connection: DatabaseConnection) => {
    const result = await window.electronAPI.createConnection(connection);
    if (!result.success) {
      throw new Error(result.error);
    }
    return connection;
  }
);

export const closeConnection = createAsyncThunk(
  'connections/closeConnection',
  async (connectionId: string) => {
    const result = await window.electronAPI.closeConnection(connectionId);
    if (!result.success) {
      throw new Error(result.error);
    }
    return connectionId;
  }
);

export const loadSavedConnections = createAsyncThunk(
  'connections/loadSavedConnections',
  async () => {
    const result = await window.electronAPI.loadAllConnections();
    if (!result.success) {
      throw new Error(result.error || 'Erro ao carregar conexões');
    }
    return result.connections || [];
  }
);

export const saveConnectionToDB = createAsyncThunk(
  'connections/saveConnectionToDB',
  async (connection: DatabaseConnection) => {
    const result = await window.electronAPI.saveConnection(connection);
    if (!result.success) {
      throw new Error(result.error);
    }
    return connection;
  }
);

export const deleteConnectionFromDB = createAsyncThunk(
  'connections/deleteConnectionFromDB',
  async (connectionId: string) => {
    const result = await window.electronAPI.deleteConnection(connectionId);
    if (!result.success) {
      throw new Error(result.error);
    }
    return connectionId;
  }
);

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    addConnection: (state, action: PayloadAction<DatabaseConnection>) => {
      state.connections.push(action.payload);
    },
    removeConnection: (state, action: PayloadAction<string>) => {
      state.connections = state.connections.filter(
        conn => conn.id !== action.payload
      );
      if (state.activeConnection?.id === action.payload) {
        state.activeConnection = null;
      }
    },
    setActiveConnection: (state, action: PayloadAction<DatabaseConnection | null>) => {
      state.activeConnection = action.payload;
    },
    updateConnection: (state, action: PayloadAction<DatabaseConnection>) => {
      const index = state.connections.findIndex(
        conn => conn.id === action.payload.id
      );
      if (index !== -1) {
        state.connections[index] = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(testConnection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(testConnection.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(testConnection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao testar conexão';
      })
      .addCase(createConnection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConnection.fulfilled, (state, action) => {
        state.loading = false;
        // Verificar se a conexão já existe no estado antes de adicionar
        const existingIndex = state.connections.findIndex(
          conn => conn.id === action.payload.id
        );
        if (existingIndex === -1) {
          state.connections.push(action.payload);
        } else {
          // Atualizar a conexão existente
          state.connections[existingIndex] = action.payload;
        }
        state.activeConnection = action.payload;
      })
      .addCase(createConnection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao criar conexão';
      })
      .addCase(closeConnection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(closeConnection.fulfilled, (state, action) => {
        state.loading = false;
        if (state.activeConnection?.id === action.payload) {
          state.activeConnection = null;
        }
      })
      .addCase(closeConnection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao fechar conexão';
      })
      .addCase(loadSavedConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSavedConnections.fulfilled, (state, action) => {
        state.loading = false;
        // Remover duplicatas baseado no ID usando um Map para garantir unicidade
        const uniqueConnectionsMap = new Map();
        action.payload.forEach(connection => {
          if (!uniqueConnectionsMap.has(connection.id)) {
            uniqueConnectionsMap.set(connection.id, connection);
          }
        });
        state.connections = Array.from(uniqueConnectionsMap.values());
      })
      .addCase(loadSavedConnections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao carregar conexões salvas';
      })
      .addCase(saveConnectionToDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveConnectionToDB.fulfilled, (state, action) => {
        state.loading = false;
        // Não adicionar novamente, apenas atualizar se já existir
        const existingIndex = state.connections.findIndex(
          conn => conn.id === action.payload.id
        );
        if (existingIndex !== -1) {
          state.connections[existingIndex] = action.payload;
        }
      })
      .addCase(saveConnectionToDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao salvar conexão no banco de dados';
      })
      .addCase(deleteConnectionFromDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteConnectionFromDB.fulfilled, (state, action) => {
        state.loading = false;
        state.connections = state.connections.filter(
          conn => conn.id !== action.payload
        );
        if (state.activeConnection?.id === action.payload) {
          state.activeConnection = null;
        }
      })
      .addCase(deleteConnectionFromDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao deletar conexão do banco de dados';
      });
  },
});

export const {
  addConnection,
  removeConnection,
  setActiveConnection,
  updateConnection,
  clearError,
} = connectionsSlice.actions;

export default connectionsSlice.reducer; 