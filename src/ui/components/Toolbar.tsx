import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { executeQuery } from '../store/slices/queriesSlice';
import { addTab } from '../store/slices/queriesSlice';
import { Play, Plus, Save, FolderOpen, Settings } from 'lucide-react';
import { createConnection } from '../store/slices/connectionsSlice';

const Toolbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queriesState = useSelector((state: RootState) => state.queries) as {
    activeTabId: string | null;
    tabs: Array<{
      id: string;
      title: string;
      query: string;
      connectionId: string | null;
      loading: boolean;
    }>;
    loading: boolean;
  };
  const { activeTabId, tabs, loading } = queriesState;
  const { connections, activeConnection } = useSelector((state: RootState) => state.connections);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const activeTab = tabs.find((tab: any) => tab.id === activeTabId);

  const handleExecuteQuery = async () => {
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
  };

  const handleNewQuery = () => {
    // Garantir que sempre há uma conexão ativa para novas abas
    const connectionId = activeConnection?.id || (connections.length > 0 ? connections[0].id : null);
    
    dispatch(addTab({
      connectionId: connectionId,
    }));
  };

  const handleOpenFile = async () => {
    try {
      const result = await window.electronAPI.openFile();
      if (result.success && result.content) {
        dispatch(addTab({ 
          query: result.content,
          title: 'Query Importada'
        }));
      }
    } catch (error) {
      console.error('Erro ao abrir arquivo:', error);
    }
  };

  const handleSaveFile = async () => {
    if (activeTab && activeTab.query.trim()) {
      try {
        await window.electronAPI.saveFile(activeTab.query);
      } catch (error) {
        console.error('Erro ao salvar arquivo:', error);
      }
    }
  };

  const handleSettings = () => {
    setShowSettingsModal(true);
  };

  return (
    <>
      <div className="toolbar h-12 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExecuteQuery}
            disabled={loading || !activeTab?.query.trim()}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Play size={16} />
            <span>Executar</span>
          </button>

          <button
            onClick={handleNewQuery}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Nova Query</span>
          </button>

          <button
            onClick={handleOpenFile}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <FolderOpen size={16} />
            <span>Abrir</span>
          </button>

          <button
            onClick={handleSaveFile}
            disabled={!activeTab?.query.trim()}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Salvar</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={handleSettings}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Settings size={16} />
            <span>Configurações</span>
          </button>
        </div>
      </div>

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

// Componente para configurações
const SettingsForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-md font-medium text-white mb-2">Configurações Gerais</h4>
        <p className="text-sm text-gray-400">Configurações em desenvolvimento...</p>
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

export default Toolbar; 