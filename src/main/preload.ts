import { contextBridge, ipcRenderer } from 'electron';
import { DatabaseConnection, QueryResult, DatabaseSchema } from '../shared/types';

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  testConnection: (connection: DatabaseConnection) => 
    ipcRenderer.invoke('database:test-connection', connection),
  
  connect: (connection: DatabaseConnection) => 
    ipcRenderer.invoke('database:connect', connection),
  
  disconnect: () => 
    ipcRenderer.invoke('database:disconnect'),
  
  executeQuery: (query: string, connectionId: string, params?: any[]) => 
    ipcRenderer.invoke('database:execute-query', query, connectionId, params),
  
  getSchema: () => 
    ipcRenderer.invoke('database:get-schema'),
  
  // Connection management
  createConnection: (connection: DatabaseConnection) => 
    ipcRenderer.invoke('connection:create', connection),
  
  closeConnection: (connectionId: string) => 
    ipcRenderer.invoke('connection:close', connectionId),
  
  // Connection persistence
  saveConnection: (connection: DatabaseConnection) => 
    ipcRenderer.invoke('connection:save', connection),
  
  loadAllConnections: () => 
    ipcRenderer.invoke('connection:loadAll'),
  
  loadConnectionById: (id: string) => 
    ipcRenderer.invoke('connection:loadById', id),
  
  updateConnection: (connection: DatabaseConnection) => 
    ipcRenderer.invoke('connection:update', connection),
  
  deleteConnection: (id: string) => 
    ipcRenderer.invoke('connection:delete', id),
  
  getConnectionCount: () => 
    ipcRenderer.invoke('connection:getCount'),
  
  isConnectionActive: (connectionId: string) => 
    ipcRenderer.invoke('connection:isActive', connectionId),
  
  cleanDuplicates: () => 
    ipcRenderer.invoke('connection:cleanDuplicates'),
  
  // File operations
  openFile: () => 
    ipcRenderer.invoke('file:open'),
  
  saveFile: (content: string, filePath?: string) => 
    ipcRenderer.invoke('file:save', content, filePath),
});

// Tipos para TypeScript
declare global {
  interface Window {
    electronAPI: {
      testConnection: (connection: DatabaseConnection) => Promise<{ success: boolean; error?: string }>;
      connect: (connection: DatabaseConnection) => Promise<{ success: boolean; error?: string }>;
      disconnect: () => Promise<{ success: boolean; error?: string }>;
      executeQuery: (query: string, connectionId: string, params?: any[]) => Promise<{ success: boolean; result?: QueryResult; error?: string }>;
      getSchema: () => Promise<{ success: boolean; schema?: DatabaseSchema; error?: string }>;
      createConnection: (connection: DatabaseConnection) => Promise<{ success: boolean; error?: string }>;
      closeConnection: (connectionId: string) => Promise<{ success: boolean; error?: string }>;
      saveConnection: (connection: DatabaseConnection) => Promise<{ success: boolean; error?: string }>;
      loadAllConnections: () => Promise<{ success: boolean; connections?: DatabaseConnection[]; error?: string }>;
      loadConnectionById: (id: string) => Promise<{ success: boolean; connection?: DatabaseConnection }>;
      updateConnection: (connection: DatabaseConnection) => Promise<{ success: boolean; error?: string }>;
      deleteConnection: (id: string) => Promise<{ success: boolean; error?: string }>;
      getConnectionCount: () => Promise<{ success: boolean; count: number }>;
      isConnectionActive: (connectionId: string) => Promise<{ success: boolean; isActive: boolean }>;
      cleanDuplicates: () => Promise<{ success: boolean; error?: string }>;
      openFile: () => Promise<{ success: boolean; content?: string; filePath?: string }>;
      saveFile: (content: string, filePath?: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    };
  }
} 