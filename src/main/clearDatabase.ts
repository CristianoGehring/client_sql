import { connectionDB } from './database';

// Script para limpar o banco de dados (usar apenas em desenvolvimento)
export const clearDatabase = () => {
  try {
    console.log('🗑️ Limpando banco de dados...');
    connectionDB.deleteAllConnections();
    console.log('✅ Banco de dados limpo com sucesso');
  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  clearDatabase();
} 