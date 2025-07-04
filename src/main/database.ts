import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import { DatabaseConnection } from '../shared/types';

export class ConnectionDatabase {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'connections.db');
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  private initDatabase() {
    // Criar tabela de conexões se não existir
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS connections (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        host TEXT NOT NULL,
        port INTEGER NOT NULL,
        database TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        ssl BOOLEAN NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Criar índices para melhor performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_connections_name ON connections(name);
      CREATE INDEX IF NOT EXISTS idx_connections_type ON connections(type);
      CREATE INDEX IF NOT EXISTS idx_connections_created_at ON connections(createdAt);
    `);
  }

  // Salvar uma nova conexão
  saveConnection(connection: DatabaseConnection): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO connections 
      (id, name, type, host, port, database, username, password, ssl, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      connection.id,
      connection.name,
      connection.type,
      connection.host,
      connection.port,
      connection.database,
      connection.username,
      connection.password,
      connection.ssl ? 1 : 0,
      connection.createdAt,
      connection.updatedAt
    );
  }

  // Buscar todas as conexões
  getAllConnections(): DatabaseConnection[] {
    const stmt = this.db.prepare(`
      SELECT * FROM connections 
      ORDER BY createdAt DESC
    `);

    const rows = stmt.all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      host: row.host,
      port: row.port,
      database: row.database,
      username: row.username,
      password: row.password,
      ssl: Boolean(row.ssl),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }

  // Buscar conexão por ID
  getConnectionById(id: string): DatabaseConnection | null {
    const stmt = this.db.prepare(`
      SELECT * FROM connections WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      type: row.type,
      host: row.host,
      port: row.port,
      database: row.database,
      username: row.username,
      password: row.password,
      ssl: Boolean(row.ssl),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }

  // Atualizar uma conexão
  updateConnection(connection: DatabaseConnection): void {
    const stmt = this.db.prepare(`
      UPDATE connections 
      SET name = ?, type = ?, host = ?, port = ?, database = ?, 
          username = ?, password = ?, ssl = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(
      connection.name,
      connection.type,
      connection.host,
      connection.port,
      connection.database,
      connection.username,
      connection.password,
      connection.ssl ? 1 : 0,
      connection.updatedAt,
      connection.id
    );
  }

  // Deletar uma conexão
  deleteConnection(id: string): void {
    const stmt = this.db.prepare(`
      DELETE FROM connections WHERE id = ?
    `);

    stmt.run(id);
  }

  // Deletar todas as conexões
  deleteAllConnections(): void {
    this.db.exec('DELETE FROM connections');
  }

  // Limpar duplicatas baseado no ID
  cleanDuplicates(): void {
    // Criar uma tabela temporária com conexões únicas
    this.db.exec(`
      CREATE TEMPORARY TABLE temp_connections AS
      SELECT DISTINCT id, name, type, host, port, database, username, password, ssl, createdAt, updatedAt
      FROM connections
      ORDER BY createdAt DESC
    `);
    
    // Deletar a tabela original
    this.db.exec('DELETE FROM connections');
    
    // Inserir de volta apenas as conexões únicas
    this.db.exec(`
      INSERT INTO connections
      SELECT id, name, type, host, port, database, username, password, ssl, createdAt, updatedAt
      FROM temp_connections
    `);
    
    // Deletar a tabela temporária
    this.db.exec('DROP TABLE temp_connections');
  }

  // Contar total de conexões
  getConnectionCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM connections');
    const result = stmt.get() as any;
    return result.count;
  }

  // Buscar conexões por tipo
  getConnectionsByType(type: string): DatabaseConnection[] {
    const stmt = this.db.prepare(`
      SELECT * FROM connections 
      WHERE type = ? 
      ORDER BY createdAt DESC
    `);

    const rows = stmt.all(type) as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      host: row.host,
      port: row.port,
      database: row.database,
      username: row.username,
      password: row.password,
      ssl: Boolean(row.ssl),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }

  // Fechar conexão com o banco
  close(): void {
    this.db.close();
  }
}

// Instância singleton
export const connectionDB = new ConnectionDatabase(); 