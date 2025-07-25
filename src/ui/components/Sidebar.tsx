import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setActiveConnection, addConnection, testConnection, clearError, createConnection, saveConnectionToDB, deleteConnectionFromDB } from '../store/slices/connectionsSlice';
import { addTab, updateTabConnection } from '../store/slices/queriesSlice';
import { fetchSchema } from '../store/slices/schemaSlice';
import { DatabaseConnection, QueryHistory, DatabaseType } from '@/shared/types';
import { Database, History, Star, Settings, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { connections, activeConnection, loading, error } = useSelector((state: RootState) => state.connections);
  const queriesState = useSelector((state: RootState) => state.queries) as {
    history: QueryHistory[];
    favorites: string[];
    tabs: Array<{
      id: string;
      title: string;
      query: string;
      connectionId: string | null;
      loading: boolean;
    }>;
    activeTabId: string | null;
  };
  const { history, favorites, tabs, activeTabId } = queriesState;
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const [showNewConnectionModal, setShowNewConnectionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleConnectionClick = async (connection: DatabaseConnection) => {
    try {
      // Verificar se a conexão já está ativa no backend
      const isActiveResult = await window.electronAPI.isConnectionActive(connection.id);
      
      if (!isActiveResult.success) {
        throw new Error('Erro ao verificar status da conexão');
      }
      
      if (!isActiveResult.isActive) {
        console.log(`Ativando conexão ${connection.id}...`);
        // Criar a conexão ativa no backend
        await dispatch(createConnection(connection));
      } else {
        console.log(`Conexão ${connection.id} já está ativa`);
      }
      
      // Definir como ativa no frontend
      dispatch(setActiveConnection(connection));
      
      // Carregar schema da conexão ativada
      try {
        await dispatch(fetchSchema(connection.id));
        console.log('✅ Schema carregado com sucesso');
      } catch (error) {
        console.error('❌ Erro ao carregar schema:', error);
      }
      
      // Atualizar a aba ativa se ela não tiver uma conexão definida
      if (activeTab && !activeTab.connectionId) {
        dispatch(updateTabConnection({ tabId: activeTab.id, connectionId: connection.id }));
      }
    } catch (error) {
      console.error('Erro ao ativar conexão:', error);
    }
  };

  const handleHistoryClick = (historyItem: QueryHistory) => {
    dispatch(addTab({ 
      query: historyItem.query,
      title: `Query ${new Date(historyItem.timestamp).toLocaleTimeString()}`,
      connectionId: historyItem.connectionId || activeConnection?.id || null,
    }));
  };

  const handleNewConnection = () => {
    dispatch(clearError()); // Limpar erros anteriores
    setShowNewConnectionModal(true);
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (confirm('Tem certeza que deseja deletar esta conexão?')) {
      try {
        await dispatch(deleteConnectionFromDB(connectionId));
      } catch (error) {
        console.error('Erro ao deletar conexão:', error);
      }
    }
  };

  const handleCreateConnection = async (connectionData: Partial<DatabaseConnection>) => {
    const now = new Date().toISOString();
    const newConnection: DatabaseConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: connectionData.name || 'Nova Conexão',
      type: connectionData.type || DatabaseType.MYSQL,
      host: connectionData.host || 'localhost',
      port: connectionData.port || 3306,
      database: connectionData.database || '',
      username: connectionData.username || '',
      password: connectionData.password || '',
      ssl: connectionData.ssl || false,
      createdAt: now,
      updatedAt: now,
    };
    
    try {
      // Criar conexão e salvar no SQLite
      await dispatch(createConnection(newConnection));
      await dispatch(saveConnectionToDB(newConnection));
      setShowNewConnectionModal(false);
    } catch (error) {
      console.error('Erro ao criar conexão:', error);
      // O erro será capturado pelo Redux e exibido automaticamente
    }
  };

  const handleTestConnection = async (connectionData: Partial<DatabaseConnection>) => {
    console.log('🧪 Componente: Iniciando teste de conexão', connectionData);
    
    const testConnectionData: DatabaseConnection = {
      id: `temp_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: connectionData.name || 'Teste',
      type: connectionData.type || DatabaseType.MYSQL,
      host: connectionData.host || 'localhost',
      port: connectionData.port || 3306,
      database: connectionData.database || '',
      username: connectionData.username || '',
      password: connectionData.password || '',
      ssl: connectionData.ssl || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('📡 Componente: Dados da conexão para teste:', testConnectionData);
    dispatch(clearError()); // Limpar erros anteriores
    console.log('🔄 Componente: Chamando dispatch testConnection...');
    
    try {
      console.log('🔄 Componente: Antes do dispatch...');
      const actionResult = await dispatch(testConnection(testConnectionData));
      console.log('📡 Componente: Resultado do dispatch:', actionResult);
      
      if (actionResult.meta.requestStatus === 'rejected') {
        console.log('❌ Componente: Action foi rejeitada');
        throw new Error(actionResult.payload?.toString() || 'Erro desconhecido');
      }
      
      console.log('✅ Componente: Teste concluído sem erro');
    } catch (error) {
      console.error('❌ Componente: Erro no teste:', error);
      // O erro será capturado pelo Redux e exibido automaticamente
    }
  };

  if (collapsed) {
    return (
      <div className="sidebar w-12 flex flex-col">
        <div className="p-2">
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">
            <Database size={16} />
          </button>
        </div>
        <div className="p-2">
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">
            <History size={16} />
          </button>
        </div>
        <div className="p-2">
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">
            <Star size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="sidebar w-64 flex flex-col">
        {/* Conexões */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
            <Database size={16} className="mr-2" />
            Conexões
          </h3>
          <div className="space-y-1">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className={`flex items-center justify-between px-2 py-1 rounded text-sm ${
                  activeConnection?.id === connection.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <button
                  onClick={() => handleConnectionClick(connection)}
                  className="flex-1 text-left truncate"
                >
                  {connection.name}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConnection(connection.id);
                  }}
                  className="ml-2 text-red-400 hover:text-red-300 text-xs"
                  title="Deletar conexão"
                >
                  ×
                </button>
              </div>
            ))}
            <button 
              onClick={handleNewConnection}
              className="w-full text-left px-2 py-1 rounded text-sm text-gray-400 hover:bg-gray-700"
            >
              + Nova Conexão
            </button>
          </div>
        </div>

        {/* Histórico */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
            <History size={16} className="mr-2" />
            Histórico
          </h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {history.slice(0, 5).map((item: QueryHistory) => (
              <button
                key={item.id}
                onClick={() => handleHistoryClick(item)}
                className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-gray-700 truncate flex items-center space-x-2 ${
                  item.success ? 'text-gray-300' : 'text-red-300'
                }`}
                title={item.error || `Executado em ${new Date(item.timestamp).toLocaleTimeString()}`}
              >
                {item.success ? (
                  <CheckCircle size={12} className="text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle size={12} className="text-red-400 flex-shrink-0" />
                )}
                <span className="truncate">
                  {item.query.substring(0, 30)}...
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Favoritos */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center">
            <Star size={16} className="mr-2" />
            Favoritos
          </h3>
          <div className="space-y-1">
            {favorites.length === 0 && (
              <p className="text-xs text-gray-500">Nenhum favorito</p>
            )}
          </div>
        </div>

        {/* Configurações */}
        <div className="p-4 mt-auto">
          <button 
            onClick={handleSettings}
            className="w-full text-left px-2 py-1 rounded text-sm text-gray-300 hover:bg-gray-700 flex items-center"
          >
            <Settings size={16} className="mr-2" />
            Configurações
          </button>
        </div>
      </div>

      {/* Modal Nova Conexão */}
      {showNewConnectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Nova Conexão</h3>
            <NewConnectionForm 
              onSubmit={handleCreateConnection}
              onTest={handleTestConnection}
              onCancel={() => {
                setShowNewConnectionModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal Configurações */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Configurações</h3>
            <SettingsForm onClose={() => setShowSettingsModal(false)} />
          </div>
        </div>
      )}
    </>
  );
};

// Componente para formulário de nova conexão
const NewConnectionForm: React.FC<{
  onSubmit: (data: Partial<DatabaseConnection>) => void;
  onTest: (data: Partial<DatabaseConnection>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onTest, onCancel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.connections);
  
  const [formData, setFormData] = useState({
    name: '',
    type: DatabaseType.MYSQL,
    host: 'localhost',
    port: 3306,
    database: '',
    username: '',
    password: '',
    ssl: false,
  });
  const [hasTested, setHasTested] = useState(false);

  // Limpar estado de teste quando o formulário muda
  React.useEffect(() => {
    setHasTested(false);
  }, [formData.name, formData.host, formData.port, formData.database, formData.username, formData.password, formData.ssl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleTest = async () => {
    dispatch(clearError()); // Limpar erros anteriores
    setHasTested(false); // Reset do estado de teste
    
    try {
      await onTest(formData);
      setHasTested(true); // Marcar que o teste foi executado
    } catch (error) {
      setHasTested(true); // Marcar que o teste foi executado (mesmo com erro)
      // O erro será capturado pelo Redux e exibido automaticamente
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input w-full"
          placeholder="Minha Conexão"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as DatabaseType })}
          className="input w-full"
        >
          <option value={DatabaseType.MYSQL}>MySQL</option>
          <option value={DatabaseType.POSTGRESQL}>PostgreSQL</option>
          <option value={DatabaseType.SQLITE}>SQLite</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Host</label>
        <input
          type="text"
          value={formData.host}
          onChange={(e) => setFormData({ ...formData, host: e.target.value })}
          className="input w-full"
          placeholder="localhost"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Porta</label>
        <input
          type="number"
          value={formData.port}
          onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
          className="input w-full"
          placeholder="3306"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Database</label>
        <input
          type="text"
          value={formData.database}
          onChange={(e) => setFormData({ ...formData, database: e.target.value })}
          className="input w-full"
          placeholder="nome_do_banco"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Usuário</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="input w-full"
          placeholder="root"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="input w-full"
          placeholder="••••••••"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="ssl"
          checked={formData.ssl}
          onChange={(e) => setFormData({ ...formData, ssl: e.target.checked })}
          className="mr-2"
        />
        <label htmlFor="ssl" className="text-sm text-gray-300">Usar SSL</label>
      </div>

      {/* Resultado do teste */}
      {error && (
        <div className="p-3 rounded text-sm bg-red-900 text-red-200 border border-red-700">
          {error}
        </div>
      )}

      {!error && !loading && hasTested && (
        <div className="p-3 rounded text-sm bg-green-900 text-green-200 border border-green-700">
          Conectada com sucesso!
        </div>
      )}

      <div className="flex justify-between space-x-2">
        <button
          type="button"
          onClick={handleTest}
          disabled={loading || !formData.name || !formData.host || !formData.database || !formData.username}
          className="btn btn-secondary flex-1"
        >
          {loading ? 'Testando...' : 'Testar Conexão'}
        </button>
        
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Criar Conexão
          </button>
        </div>
      </div>
    </form>
  );
};

// Componente para configurações
const SettingsForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const handleCleanDuplicates = async () => {
    try {
      await window.electronAPI.cleanDuplicates();
      console.log('✅ Duplicatas limpas com sucesso');
      // Recarregar conexões
      window.location.reload();
    } catch (error) {
      console.error('❌ Erro ao limpar duplicatas:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-md font-medium text-white mb-2">Configurações Gerais</h4>
        <p className="text-sm text-gray-400">Configurações em desenvolvimento...</p>
      </div>
      
      <div>
        <h4 className="text-md font-medium text-white mb-2">Manutenção</h4>
        <button
          onClick={handleCleanDuplicates}
          className="btn btn-secondary text-sm"
        >
          Limpar Duplicatas
        </button>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="btn btn-secondary"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 