// Tipos de conexão
export interface DatabaseConnection {
  id: string;
  name: string;
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum DatabaseType {
  MYSQL = 'mysql',
  POSTGRESQL = 'postgresql',
  SQLITE = 'sqlite',
  SQLSERVER = 'sqlserver'
}

// Tipos de query
export interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
  executionTime: number;
  error?: string;
}

export interface QueryHistory {
  id: string;
  query: string;
  connectionId: string;
  executionTime: number;
  timestamp: string;
  success: boolean;
  error?: string;
}

// Tipos de schema
export interface DatabaseSchema {
  databases: DatabaseInfo[];
  currentDatabase: string;
}

export interface DatabaseInfo {
  name: string;
  tables: TableInfo[];
  views: ViewInfo[];
  procedures: ProcedureInfo[];
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
  foreignKeys: ForeignKeyInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: any;
  isPrimaryKey: boolean;
  isAutoIncrement: boolean;
}

export interface IndexInfo {
  name: string;
  columns: string[];
  isUnique: boolean;
}

export interface ForeignKeyInfo {
  name: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

export interface ViewInfo {
  name: string;
  definition: string;
}

export interface ProcedureInfo {
  name: string;
  parameters: ProcedureParameter[];
  definition: string;
}

export interface ProcedureParameter {
  name: string;
  type: string;
  direction: 'IN' | 'OUT' | 'INOUT';
}

// Tipos de configuração
export interface AppConfig {
  theme: 'dark' | 'light';
  density: 'compact' | 'normal' | 'spacious';
  maxResults: number;
  queryTimeout: number;
  autoSave: boolean;
}

// Tipos de notificação
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
} 