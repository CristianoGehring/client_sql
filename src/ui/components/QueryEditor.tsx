import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setActiveTab, removeTab, updateTabQuery, executeQuery, addTab, updateTabConnection } from '../store/slices/queriesSlice';
import { setActiveConnection } from '../store/slices/connectionsSlice';
import { X, Plus, Database } from 'lucide-react';

const QueryEditor: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queriesState = useSelector((state: RootState) => state.queries) as {
    tabs: Array<{
      id: string;
      title: string;
      query: string;
      connectionId: string | null;
      loading: boolean;
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
    dispatch(addTab({
      title: 'Nova Query',
      query: '',
      connectionId: activeConnection?.id || null,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      if (activeTab && activeTab.query.trim() && activeTab.connectionId) {
        dispatch(executeQuery({ 
          query: activeTab.query, 
          connectionId: activeTab.connectionId 
        }));
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
            <textarea
              value={activeTab.query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua query SQL aqui... (Ctrl+Enter para executar)"
              className="flex-1 bg-gray-900 text-gray-100 p-4 font-mono text-sm resize-none outline-none"
              spellCheck={false}
            />
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