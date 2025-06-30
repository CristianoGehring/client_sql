import { DatabaseType } from '../../shared/types';
import { IDatabaseDriver } from '../interfaces/IDatabaseDriver';

export class DatabaseDriverFactory {
  private static drivers: Map<DatabaseType, new () => IDatabaseDriver> = new Map();

  /**
   * Registra um driver para um tipo específico de banco de dados
   */
  static registerDriver(type: DatabaseType, driverClass: new () => IDatabaseDriver): void {
    this.drivers.set(type, driverClass);
  }

  /**
   * Cria uma instância do driver para o tipo especificado
   */
  static createDriver(type: DatabaseType): IDatabaseDriver {
    const DriverClass = this.drivers.get(type);
    
    if (!DriverClass) {
      throw new Error(`Driver não encontrado para o tipo: ${type}`);
    }

    return new DriverClass();
  }

  /**
   * Retorna todos os tipos de banco suportados
   */
  static getSupportedTypes(): DatabaseType[] {
    return Array.from(this.drivers.keys());
  }

  /**
   * Verifica se um tipo de banco é suportado
   */
  static isSupported(type: DatabaseType): boolean {
    return this.drivers.has(type);
  }

  /**
   * Retorna informações sobre todos os drivers registrados
   */
  static getDriverInfo(): Array<{ type: DatabaseType; driver: IDatabaseDriver }> {
    return Array.from(this.drivers.entries()).map(([type, DriverClass]) => ({
      type,
      driver: new DriverClass()
    }));
  }
} 