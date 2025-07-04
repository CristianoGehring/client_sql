import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DatabaseSchema } from '@/shared/types';

interface SchemaState {
  schema: DatabaseSchema | null;
  loading: boolean;
  error: string | null;
}

const initialState: SchemaState = {
  schema: null,
  loading: false,
  error: null,
};

export const fetchSchema = createAsyncThunk(
  'schema/fetchSchema',
  async (connectionId?: string) => {
    const result = await window.electronAPI.getSchema(connectionId);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.schema;
  }
);

const schemaSlice = createSlice({
  name: 'schema',
  initialState,
  reducers: {
    clearSchema: (state) => {
      state.schema = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchema.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchema.fulfilled, (state, action) => {
        state.loading = false;
        state.schema = action.payload || null;
      })
      .addCase(fetchSchema.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erro ao carregar schema';
      });
  },
});

export const { clearSchema, clearError } = schemaSlice.actions;
export default schemaSlice.reducer; 