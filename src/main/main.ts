import { app, BrowserWindow, ipcMain, dialog, IpcMainInvokeEvent } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as http from 'http';
import { DatabaseDriverFactory } from '../core/factories/DatabaseDriverFactory';
import { MySQLDriver } from '../drivers/mysql/MySQLDriver';
import { DatabaseConnection, QueryResult, DatabaseType } from '../shared/types';

// Registrar drivers
DatabaseDriverFactory.registerDriver(DatabaseType.MYSQL, MySQLDriver);

let mainWindow: BrowserWindow | null = null;

// Função para detectar a porta do Vite
async function findVitePort(): Promise<number> {
  const ports = [3000, 3001, 3002, 3003, 3004, 3005];
  
  for (const port of ports) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
          // Aceitar qualquer resposta como sucesso (mesmo 404, pois significa que o servidor está rodando)
          console.log(`Testando porta ${port}: status ${res.statusCode}`);
          resolve();
        });
        
        req.on('error', (error) => {
          console.log(`Porta ${port} não disponível:`, error.message);
          reject(new Error('Connection failed'));
        });
        req.setTimeout(2000, () => {
          console.log(`Porta ${port} timeout`);
          reject(new Error('Timeout'));
        });
      });
      
      console.log(`Vite encontrado na porta ${port}`);
      return port;
    } catch (error) {
      console.log(`Porta ${port} não disponível:`, error instanceof Error ? error.message : String(error));
      continue;
    }
  }
  
  throw new Error('Vite não encontrado em nenhuma porta');
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    titleBarStyle: 'default',
    show: false
  });

  // Configurar CSP para desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; script-src 'self' 'unsafe-inline' http://localhost:*; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ws: wss: http://localhost:* https:; font-src 'self' data:;"
          ]
        }
      });
    });
  }

  // Carregar a aplicação
  if (process.env.NODE_ENV === 'development') {
    // Aguardar o Vite estar disponível
    const loadViteApp = async () => {
      try {
        const port = await findVitePort();
        console.log(`Carregando Vite na porta ${port}`);
        await mainWindow!.loadURL(`http://localhost:${port}`);
        mainWindow!.webContents.openDevTools();
        mainWindow!.show();
      } catch (error) {
        console.error('Erro ao carregar Vite:', error);
        // Tentar novamente em 5 segundos
        setTimeout(loadViteApp, 5000);
      }
    };
    
    // Aguardar 5 segundos antes de tentar conectar para dar tempo do Vite inicializar completamente
    setTimeout(loadViteApp, 5000);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    mainWindow.show();
  }

  mainWindow.once('ready-to-show', () => {
    if (process.env.NODE_ENV !== 'development') {
      mainWindow?.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Eventos do app
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers para comunicação com o renderer
ipcMain.handle('database:test-connection', async (event: IpcMainInvokeEvent, connection: DatabaseConnection) => {
  console.log('🔄 Handler test-connection chamado:', {
    host: connection.host,
    port: connection.port,
    user: connection.username,
    database: connection.database,
    type: connection.type
  });
  
  try {
    const driver = DatabaseDriverFactory.createDriver(connection.type);
    console.log('🚀 Driver criado, testando conexão...');
    const isConnected = await driver.testConnection(connection);
    console.log('✅ Resultado do teste:', isConnected);
    return { success: isConnected };
  } catch (error) {
    console.error('❌ Erro no handler test-connection:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
});

ipcMain.handle('database:connect', async (event: IpcMainInvokeEvent, connection: DatabaseConnection) => {
  try {
    const driver = DatabaseDriverFactory.createDriver(connection.type);
    await driver.connect(connection);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
});

ipcMain.handle('database:disconnect', async () => {
  try {
    // TODO: Implementar gerenciamento de conexões ativas
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
});

ipcMain.handle('database:execute-query', async (event: IpcMainInvokeEvent, query: string, params?: any[]) => {
  try {
    // TODO: Implementar gerenciamento de conexões ativas
    const driver = DatabaseDriverFactory.createDriver(DatabaseType.MYSQL); // Temporário
    const result = await driver.executeQuery(query, params);
    return { success: true, result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
});

ipcMain.handle('database:get-schema', async () => {
  try {
    // TODO: Implementar gerenciamento de conexões ativas
    const driver = DatabaseDriverFactory.createDriver(DatabaseType.MYSQL); // Temporário
    const schema = await driver.getSchema();
    return { success: true, schema };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
});

ipcMain.handle('file:open', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'SQL Files', extensions: ['sql'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content, filePath };
  }

  return { success: false };
});

ipcMain.handle('file:save', async (event: IpcMainInvokeEvent, content: string, filePath?: string) => {
  try {
    let targetPath = filePath;
    
    if (!targetPath) {
      const result = await dialog.showSaveDialog(mainWindow!, {
        filters: [
          { name: 'SQL Files', extensions: ['sql'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if (result.canceled) {
        return { success: false };
      }

      targetPath = result.filePath!;
    }

    fs.writeFileSync(targetPath, content, 'utf-8');
    return { success: true, filePath: targetPath };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
});

// Gerenciamento de conexões ativas (simplificado)
const activeConnections = new Map<string, any>();

ipcMain.handle('connection:create', async (event: IpcMainInvokeEvent, connection: DatabaseConnection) => {
  try {
    const driver = DatabaseDriverFactory.createDriver(connection.type);
    await driver.connect(connection);
    activeConnections.set(connection.id, driver);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
});

ipcMain.handle('connection:close', async (event: IpcMainInvokeEvent, connectionId: string) => {
  try {
    const driver = activeConnections.get(connectionId);
    if (driver) {
      await driver.disconnect();
      activeConnections.delete(connectionId);
    }
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}); 