import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const queriesState = useSelector((state: RootState) => state.queries) as {
    activeTabId: string | null;
    tabs: Array<{
      id: string;
      title: string;
      query: string;
      connectionId: string | null;
      loading: boolean;
      result?: any;
      error?: string;
    }>;
  };
  
  const { activeTabId, tabs } = queriesState;
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Gerar notificação baseada no estado da query
  const getCurrentNotification = (): Notification | null => {
    if (!activeTab) return null;

    if (activeTab.loading) return null;

    if (activeTab.error) {
      return {
        id: `error-${activeTab.id}-${Date.now()}`,
        type: 'error',
        title: 'Erro na Query',
        message: activeTab.error,
        timestamp: new Date()
      };
    }

    if (activeTab.result) {
      return {
        id: `success-${activeTab.id}-${Date.now()}`,
        type: 'success',
        title: 'Query Executada',
        message: `${activeTab.result.rowCount} linhas retornadas em ${activeTab.result.executionTime}ms`,
        timestamp: new Date()
      };
    }

    return null;
  };

  // Adicionar nova notificação
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      // Remover notificações antigas do mesmo tipo para a mesma tab
      const filtered = prev.filter(n => 
        !(n.id.startsWith(notification.id.split('-')[0]) && 
          n.id.includes(activeTab?.id || ''))
      );
      return [...filtered, notification];
    });
  }, [activeTab?.id]);

  // Remover notificação
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Monitorar mudanças na query ativa
  useEffect(() => {
    const currentNotification = getCurrentNotification();
    
    if (currentNotification) {
      addNotification(currentNotification);
      
      // Auto-dismiss após 5 segundos para notificações de sucesso
      if (currentNotification.type === 'success') {
        const timer = setTimeout(() => {
          removeNotification(currentNotification.id);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [activeTab?.result, activeTab?.error, activeTab?.loading, addNotification, removeNotification]);

  // Limpar notificações antigas (mais de 10 segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNotifications(prev => 
        prev.filter(n => now - n.timestamp.getTime() < 10000)
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (notifications.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'error':
        return <XCircle size={20} className="text-red-400" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-400" />;
      case 'info':
        return <Info size={20} className="text-blue-400" />;
      default:
        return <Info size={20} className="text-gray-400" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-900/20 border-green-500/30';
      case 'error':
        return 'bg-red-900/20 border-red-500/30';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-500/30';
      case 'info':
        return 'bg-blue-900/20 border-blue-500/30';
      default:
        return 'bg-gray-900/20 border-gray-500/30';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-200';
      case 'error':
        return 'text-red-200';
      case 'warning':
        return 'text-yellow-200';
      case 'info':
        return 'text-blue-200';
      default:
        return 'text-gray-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className={`${getBgColor(notification.type)} border rounded-lg p-4 shadow-lg max-w-md animate-fade-in`}
        >
          <div className="flex items-start space-x-3">
            {getIcon(notification.type)}
            <div className="flex-1">
              <h4 className={`font-semibold ${getTextColor(notification.type)}`}>
                {notification.title}
              </h4>
              <p className={`text-sm mt-1 ${getTextColor(notification.type)}`}>
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <button 
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-200 p-1 rounded hover:bg-gray-700 transition-colors"
              title="Fechar notificação"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications; 