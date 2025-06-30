const mysql = require('mysql2/promise');

async function testMySQLConnection() {
  console.log('🧪 Testando conexão MySQL...');
  
  const testCases = [
    {
      name: 'Conexão válida',
      config: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'password',
        database: 'test',
        connectTimeout: 5000
      }
    },
    {
      name: 'Credenciais inválidas',
      config: {
        host: 'localhost',
        port: 3306,
        user: 'invalid_user',
        password: 'invalid_password',
        database: 'test',
        connectTimeout: 5000
      }
    },
    {
      name: 'Host inválido',
      config: {
        host: 'invalid_host',
        port: 3306,
        user: 'root',
        password: 'password',
        database: 'test',
        connectTimeout: 5000
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Teste: ${testCase.name}`);
    console.log('Config:', testCase.config);
    
    try {
      const connection = await mysql.createConnection(testCase.config);
      await connection.ping();
      await connection.end();
      console.log('✅ Sucesso!');
    } catch (error) {
      console.log('❌ Erro:', error.message);
    }
  }
}

testMySQLConnection().catch(console.error); 