import { DatabaseConnection, QueryResult, DatabaseSchema } from '../../shared/types';

export interface IDatabaseDriver {
  // Métodos de conexão
  connect(connection: DatabaseConnection): Promise<void>;
  disconnect(): Promise<void>;
  testConnection(connection: DatabaseConnection): Promise<boolean>;
  isConnected(): boolean;

  // Métodos de query
  executeQuery(query: string, params?: any[]): Promise<QueryResult>;
  executeTransaction(queries: string[]): Promise<QueryResult[]>;
  cancelQuery(): Promise<void>;

  // Métodos de schema
  getSchema(): Promise<DatabaseSchema>;
  getDatabases(): Promise<string[]>;
  getTables(database?: string): Promise<string[]>;
  getTableInfo(tableName: string, database?: string): Promise<any>;
  getColumns(tableName: string, database?: string): Promise<any[]>;

  // Métodos de utilidade
  formatQuery(query: string): string;
  getQueryPlan(query: string): Promise<any>;
  getServerInfo(): Promise<any>;
}

export interface DriverConfig {
  name: string;
  version: string;
  supportedVersions: string[];
  features: DriverFeature[];
}

export enum DriverFeature {
  TRANSACTIONS = 'transactions',
  STORED_PROCEDURES = 'stored_procedures',
  VIEWS = 'views',
  TRIGGERS = 'triggers',
  FOREIGN_KEYS = 'foreign_keys',
  INDEXES = 'indexes',
  SSL = 'ssl',
  POOLING = 'pooling'
}

export interface ConnectionPool {
  min: number;
  max: number;
  acquireTimeout: number;
  idleTimeout: number;
} 