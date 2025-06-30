import { configureStore } from '@reduxjs/toolkit';
import connectionsReducer from './slices/connectionsSlice';
import queriesReducer from './slices/queriesSlice';
import schemaReducer from './slices/schemaSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    connections: connectionsReducer,
    queries: queriesReducer,
    schema: schemaReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: [
          'connections.connections.createdAt',
          'connections.connections.updatedAt',
          'queries.history.timestamp',
          'queries.tabs.result.rows'
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 