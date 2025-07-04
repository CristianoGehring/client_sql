import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { loadSavedConnections, createConnection, setActiveConnection } from '../store/slices/connectionsSlice';
import { fetchSchema } from '../store/slices/schemaSlice';

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { connections, activeConnection } = useSelector((state: RootState) => state.connections);

  useEffect(() => {
    // Carregar conexões salvas na inicialização
    const initializeApp = async () => {
      try {
        console.log('🚀 Inicializando aplicação...');
        await dispatch(loadSavedConnections());
        console.log('✅ Conexões carregadas com sucesso');
      } catch (error) {
        console.error('❌ Erro ao carregar conexões:', error);
      }
    };

    initializeApp();
  }, [dispatch]);

  // Efeito para ativar automaticamente a primeira conexão se não houver nenhuma ativa
  useEffect(() => {
    const activateFirstConnection = async () => {
      if (connections.length > 0 && !activeConnection) {
        try {
          console.log('🔗 Ativando primeira conexão automaticamente...');
          const firstConnection = connections[0];
          
          // Verificar se a conexão já está ativa no backend
          const isActiveResult = await window.electronAPI.isConnectionActive(firstConnection.id);
          
          if (!isActiveResult.success) {
            console.error('Erro ao verificar status da conexão');
            return;
          }
          
          if (!isActiveResult.isActive) {
            console.log(`Ativando conexão ${firstConnection.id}...`);
            // Criar a conexão ativa no backend
            await dispatch(createConnection(firstConnection));
          } else {
            console.log(`Conexão ${firstConnection.id} já está ativa`);
          }
          
          // Definir como ativa no frontend
          dispatch(setActiveConnection(firstConnection));
          
          // Carregar schema da conexão ativada
          try {
            await dispatch(fetchSchema(firstConnection.id));
            console.log('✅ Schema carregado com sucesso');
          } catch (error) {
            console.error('❌ Erro ao carregar schema:', error);
          }
          
          console.log('✅ Primeira conexão ativada com sucesso');
        } catch (error) {
          console.error('❌ Erro ao ativar primeira conexão:', error);
        }
      }
    };

    activateFirstConnection();
  }, [connections, activeConnection, dispatch]);

  return <>{children}</>;
};

export default AppInitializer; 