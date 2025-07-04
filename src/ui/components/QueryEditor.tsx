import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setActiveTab, removeTab, updateTabQuery, executeQuery, addTab, updateTabConnection } from '../store/slices/queriesSlice';
import { setActiveConnection, createConnection } from '../store/slices/connectionsSlice';
import { X, Plus, Database, AlertCircle } from 'lucide-react';

const QueryEditor: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queriesState = useSelector((state: RootState) => state.queries) as {
    tabs: Array<{
      id: string;
      title: string;
      query: string;
      connectionId: string | null;
      loading: boolean;
      error?: string;
    }>;
    activeTabId: string | null;
  };
  const { tabs, activeTabId } = queriesState;
  
  const { connections, activeConnection } = useSelector((state: RootState) => state.connections);

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const handleTabClick = (tabId: string) => {
    dispatch(setActiveTab(tabId));
  };

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    dispatch(removeTab(tabId));
  };

  const handleNewTab = () => {
    // Garantir que sempre há uma conexão ativa para novas abas
    const connectionId = activeConnection?.id || (connections.length > 0 ? connections[0].id : null);
    
    dispatch(addTab({
      title: 'Nova Query',
      query: '',
      connectionId: connectionId,
    }));
  };

  const handleQueryChange = (query: string) => {
    if (activeTab) {
      dispatch(updateTabQuery({ tabId: activeTab.id, query }));
    }
  };

  const handleConnectionChange = (connectionId: string) => {
    if (activeTab) {
      // Atualizar a conexão da tab
      dispatch(updateTabConnection({ tabId: activeTab.id, connectionId }));
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      if (activeTab && activeTab.query.trim() && activeTab.connectionId) {
        try {
          // Verificar se a conexão está ativa no backend
          const isActiveResult = await window.electronAPI.isConnectionActive(activeTab.connectionId);
          
          if (!isActiveResult.success) {
            console.error('Erro ao verificar status da conexão');
            return;
          }
          
          if (!isActiveResult.isActive) {
            console.log(`Conexão ${activeTab.connectionId} não está ativa, ativando...`);
            // Encontrar a conexão e ativá-la
            const connection = connections.find(conn => conn.id === activeTab.connectionId);
            if (connection) {
              await dispatch(createConnection(connection));
            } else {
              console.error('Conexão não encontrada');
              return;
            }
          }
          
          dispatch(executeQuery({ 
            query: activeTab.query, 
            connectionId: activeTab.connectionId 
          }));
        } catch (error) {
          console.error('Erro ao executar query:', error);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-1/2">
      {/* Abas */}
      <div className="flex bg-gray-800 border-b border-gray-700">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex items-center px-4 py-2 border-r border-gray-700 cursor-pointer ${
              activeTabId === tab.id
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="text-sm truncate max-w-32">{tab.title}</span>
            <button
              onClick={(e) => handleTabClose(e, tab.id)}
              className="ml-2 p-1 rounded hover:bg-gray-600"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={handleNewTab}
          className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-gray-900">
        {activeTab ? (
          <div className="h-full flex flex-col">
            {/* Seletor de Conexão */}
            <div className="flex items-center gap-2 p-2 bg-gray-800 border-b border-gray-700">
              <Database size={16} className="text-gray-400" />
              <select
                value={activeTab.connectionId || ''}
                onChange={(e) => handleConnectionChange(e.target.value)}
                className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-sm border border-gray-600"
              >
                <option value="">Selecione uma conexão</option>
                {connections.map((connection) => (
                  <option key={connection.id} value={connection.id}>
                    {connection.name} ({connection.host}:{connection.port})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Editor de Query */}
            <div className="flex-1 flex flex-col">
              <textarea
                value={activeTab.query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua query SQL aqui... (Ctrl+Enter para executar)"
                className="flex-1 bg-gray-900 text-gray-100 p-4 font-mono text-sm resize-none outline-none"
                spellCheck={false}
              />
              
              {/* Área de erro */}
              {activeTab.error && (
                <div className="bg-red-900/20 border-t border-red-500/30 p-3">
                  <div className="flex items-center space-x-2 text-red-400 mb-2">
                    <AlertCircle size={16} />
                    <span className="font-semibold text-sm">Erro</span>
                  </div>
                  <p className="text-red-200 text-xs font-mono">{activeTab.error}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Nenhuma query aberta</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryEditor; 