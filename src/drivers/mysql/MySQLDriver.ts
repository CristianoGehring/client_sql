import mysql, { Connection, ConnectionOptions, RowDataPacket, FieldPacket } from 'mysql2/promise';
import { DatabaseConnection, QueryResult, DatabaseSchema, DatabaseInfo, TableInfo, ColumnInfo } from '../../shared/types';
import { IDatabaseDriver, DriverConfig, DriverFeature } from '../../core/interfaces/IDatabaseDriver';

export class MySQLDriver implements IDatabaseDriver {
  private connection: Connection | null = null;
  private currentConnection: DatabaseConnection | null = null;

  private readonly config: DriverConfig = {
    name: 'MySQL',
    version: '8.0',
    supportedVersions: ['5.7', '8.0'],
    features: [
      DriverFeature.TRANSACTIONS,
      DriverFeature.STORED_PROCEDURES,
      DriverFeature.VIEWS,
      DriverFeature.TRIGGERS,
      DriverFeature.FOREIGN_KEYS,
      DriverFeature.INDEXES,
      DriverFeature.SSL,
      DriverFeature.POOLING
    ]
  };

  async connect(connection: DatabaseConnection): Promise<void> {
    try {
      const options: ConnectionOptions = {
        host: connection.host,
        port: connection.port,
        user: connection.username,
        password: connection.password,
        database: connection.database,
        ssl: connection.ssl ? { rejectUnauthorized: false } : undefined,
        connectTimeout: 10000,
        charset: 'utf8mb4'
      };

      this.connection = await mysql.createConnection(options);
      this.currentConnection = connection;
    } catch (error) {
      throw new Error(`Erro ao conectar ao MySQL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      this.currentConnection = null;
    }
  }

  async testConnection(connection: DatabaseConnection): Promise<boolean> {
    console.log('🔍 Testando conexão MySQL:', {
      host: connection.host,
      port: connection.port,
      user: connection.username,
      database: connection.database,
      ssl: connection.ssl
    });
    
    try {
      const options: ConnectionOptions = {
        host: connection.host,
        port: connection.port,
        user: connection.username,
        password: connection.password,
        database: connection.database,
        ssl: connection.ssl ? { rejectUnauthorized: false } : undefined,
        connectTimeout: 5000
      };

      console.log('📡 Tentando conectar...');
      const tempConnection = await mysql.createConnection(options);
      console.log('✅ Conexão criada, fazendo ping...');
      await tempConnection.ping();
      console.log('✅ Ping bem-sucedido, fechando conexão...');
      await tempConnection.end();
      console.log('✅ Teste de conexão concluído com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro no teste de conexão:', error);
      throw new Error(`Erro ao conectar ao MySQL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  isConnected(): boolean {
    return this.connection !== null;
  }

  async executeQuery(query: string, params?: any[]): Promise<QueryResult> {
    if (!this.connection) {
      throw new Error('Não há conexão ativa');
    }

    const startTime = Date.now();
    
    try {
      const [rows, fields] = await this.connection.execute(query, params);
      const executionTime = Date.now() - startTime;

      return {
        columns: fields.map((field: FieldPacket) => field.name),
        rows: rows as any[],
        rowCount: Array.isArray(rows) ? rows.length : 0,
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        columns: [],
        rows: [],
        rowCount: 0,
        executionTime,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async executeTransaction(queries: string[]): Promise<QueryResult[]> {
    if (!this.connection) {
      throw new Error('Não há conexão ativa');
    }

    const results: QueryResult[] = [];
    
    try {
      await this.connection.beginTransaction();
      
      for (const query of queries) {
        const result = await this.executeQuery(query);
        results.push(result);
        
        if (result.error) {
          throw new Error(result.error);
        }
      }
      
      await this.connection.commit();
      return results;
    } catch (error) {
      await this.connection.rollback();
      throw error;
    }
  }

  async cancelQuery(): Promise<void> {
    if (this.connection) {
      await this.connection.query('KILL QUERY CONNECTION_ID()');
    }
  }

  async getSchema(): Promise<DatabaseSchema> {
    if (!this.connection) {
      throw new Error('Não há conexão ativa');
    }

    const databases = await this.getDatabases();
    const currentDatabase = this.currentConnection?.database || '';

    const databaseInfos: DatabaseInfo[] = [];
    
    for (const dbName of databases) {
      const tables = await this.getTables(dbName);
      const tableInfos: TableInfo[] = [];
      
      for (const tableName of tables) {
        const tableInfo = await this.getTableInfo(tableName, dbName);
        tableInfos.push(tableInfo);
      }

      databaseInfos.push({
        name: dbName,
        tables: tableInfos,
        views: [], // TODO: Implementar
        procedures: [] // TODO: Implementar
      });
    }

    return {
      databases: databaseInfos,
      currentDatabase
    };
  }

  async getDatabases(): Promise<string[]> {
    if (!this.connection) {
      throw new Error('Não há conexão ativa');
    }

    const [rows] = await this.connection.execute('SHOW DATABASES');
    return (rows as RowDataPacket[]).map(row => row.Database);
  }

  async getTables(database?: string): Promise<string[]> {
    if (!this.connection) {
      throw new Error('Não há conexão ativa');
    }

    const dbName = database || this.currentConnection?.database;
    if (!dbName) {
      throw new Error('Nenhum banco de dados especificado');
    }

    const [rows] = await this.connection.execute('SHOW TABLES');
    return (rows as RowDataPacket[]).map(row => Object.values(row)[0] as string);
  }

  async getTableInfo(tableName: string, database?: string): Promise<TableInfo> {
    if (!this.connection) {
      throw new Error('Não há conexão ativa');
    }

    const dbName = database || this.currentConnection?.database;
    if (!dbName) {
      throw new Error('Nenhum banco de dados especificado');
    }

    // Obter colunas
    const [columns] = await this.connection.execute(
      'SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION',
      [dbName, tableName]
    );

    const columnInfos: ColumnInfo[] = (columns as RowDataPacket[]).map(col => ({
      name: col.COLUMN_NAME,
      type: col.DATA_TYPE,
      nullable: col.IS_NULLABLE === 'YES',
      defaultValue: col.COLUMN_DEFAULT,
      isPrimaryKey: col.COLUMN_KEY === 'PRI',
      isAutoIncrement: col.EXTRA.includes('auto_increment')
    }));

    // Obter índices
    const [indexes] = await this.connection.execute(
      'SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY INDEX_NAME, SEQ_IN_INDEX',
      [dbName, tableName]
    );

    const indexMap = new Map<string, { columns: string[]; isUnique: boolean }>();
    (indexes as RowDataPacket[]).forEach(index => {
      const indexName = index.INDEX_NAME;
      if (!indexMap.has(indexName)) {
        indexMap.set(indexName, { columns: [], isUnique: index.NON_UNIQUE === 0 });
      }
      indexMap.get(indexName)!.columns.push(index.COLUMN_NAME);
    });

    const indexInfos = Array.from(indexMap.entries()).map(([name, info]) => ({
      name,
      columns: info.columns,
      isUnique: info.isUnique
    }));

    // Obter foreign keys
    const [foreignKeys] = await this.connection.execute(
      'SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL',
      [dbName, tableName]
    );

    const foreignKeyInfos = (foreignKeys as RowDataPacket[]).map(fk => ({
      name: fk.CONSTRAINT_NAME,
      column: fk.COLUMN_NAME,
      referencedTable: fk.REFERENCED_TABLE_NAME,
      referencedColumn: fk.REFERENCED_COLUMN_NAME
    }));

    return {
      name: tableName,
      columns: columnInfos,
      indexes: indexInfos,
      foreignKeys: foreignKeyInfos
    };
  }

  async getColumns(tableName: string, database?: string): Promise<ColumnInfo[]> {
    const tableInfo = await this.getTableInfo(tableName, database);
    return tableInfo.columns;
  }

  formatQuery(query: string): string {
    // Implementação básica de formatação SQL
    // TODO: Implementar formatação mais robusta
    return query.trim();
  }

  async getQueryPlan(query: string): Promise<any> {
    if (!this.connection) {
      throw new Error('Não há conexão ativa');
    }

    const [rows] = await this.connection.execute(`EXPLAIN ${query}`);
    return rows;
  }

  async getServerInfo(): Promise<any> {
    if (!this.connection) {
      throw new Error('Não há conexão ativa');
    }

    const [version] = await this.connection.execute('SELECT VERSION() as version');
    const [variables] = await this.connection.execute('SHOW VARIABLES LIKE "max_connections"');
    
    return {
      version: (version as RowDataPacket[])[0]?.version,
      maxConnections: (variables as RowDataPacket[])[0]?.Value,
      config: this.config
    };
  }
} 