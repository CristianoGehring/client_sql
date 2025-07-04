import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateTabQuery, addTab } from '../store/slices/queriesSlice';
import { ChevronRight, ChevronDown, Database, Table, View, Package, RefreshCw } from 'lucide-react';

const SchemaPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { schema, loading } = useSelector((state: RootState) => state.schema);
  const { activeConnection } = useSelector((state: RootState) => state.connections);
  const { activeTabId } = useSelector((state: RootState) => state.queries);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleTableClick = (tableName: string) => {
    if (!activeTabId) {
      // Se não há aba ativa, criar uma nova
      dispatch(addTab({
        title: `Query ${tableName}`,
        query: `SELECT * FROM ${tableName} LIMIT 100`,
        connectionId: activeConnection?.id || null,
      }));
    } else {
      // Atualizar a aba ativa
      dispatch(updateTabQuery({ 
        tabId: activeTabId,
        query: `SELECT * FROM ${tableName} LIMIT 100`
      }));
    }
  };

  const handleRefreshSchema = async () => {
    if (activeConnection) {
      try {
        // Recarregar schema
        await window.electronAPI.getSchema(activeConnection.id);
        window.location.reload(); // Recarregar para atualizar o estado
      } catch (error) {
        console.error('Erro ao recarregar schema:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300">Schema</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Nenhum schema carregado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">Schema</h3>
        <button
          onClick={handleRefreshSchema}
          className="text-gray-400 hover:text-gray-200 p-1 rounded hover:bg-gray-700"
          title="Recarregar schema"
        >
          <RefreshCw size={14} />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {schema.databases.map((database) => (
          <div key={database.name} className="mb-4">
            <div 
              className="flex items-center text-sm font-medium text-gray-300 mb-2 cursor-pointer hover:bg-gray-700 rounded px-2 py-1"
              onClick={() => toggleExpanded(`db-${database.name}`)}
            >
              {expandedItems.has(`db-${database.name}`) ? (
                <ChevronDown size={14} className="mr-2" />
              ) : (
                <ChevronRight size={14} className="mr-2" />
              )}
              <Database size={14} className="mr-2" />
              {database.name}
              <span className="ml-auto text-xs text-gray-500">
                {database.tables.length + database.views.length + database.procedures.length}
              </span>
            </div>
            
            {expandedItems.has(`db-${database.name}`) && (
              <div className="ml-4">
                {/* Tabelas */}
                {database.tables.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-400 mb-1 flex items-center">
                      <Table size={10} className="mr-1" />
                      Tabelas ({database.tables.length})
                    </div>
                    {database.tables.map((table) => (
                      <div 
                        key={table.name} 
                        className="flex items-center text-sm text-gray-300 py-1 hover:bg-gray-700 rounded px-2 cursor-pointer"
                        onClick={() => handleTableClick(table.name)}
                        title={`Clique para executar: SELECT * FROM ${table.name} LIMIT 100`}
                      >
                        <Table size={12} className="mr-2 text-blue-400" />
                        {table.name}
                        <span className="ml-auto text-xs text-gray-500">
                          {table.columns.length} cols
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Views */}
                {database.views.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-400 mb-1 flex items-center">
                      <View size={10} className="mr-1" />
                      Views ({database.views.length})
                    </div>
                    {database.views.map((view) => (
                      <div 
                        key={view.name} 
                        className="flex items-center text-sm text-gray-300 py-1 hover:bg-gray-700 rounded px-2 cursor-pointer"
                        onClick={() => handleTableClick(view.name)}
                        title={`Clique para executar: SELECT * FROM ${view.name} LIMIT 100`}
                      >
                        <View size={12} className="mr-2 text-green-400" />
                        {view.name}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Procedures */}
                {database.procedures.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1 flex items-center">
                      <Package size={10} className="mr-1" />
                      Procedures ({database.procedures.length})
                    </div>
                    {database.procedures.map((procedure) => (
                      <div 
                        key={procedure.name} 
                        className="flex items-center text-sm text-gray-300 py-1 hover:bg-gray-700 rounded px-2"
                        title={`Procedure: ${procedure.name}`}
                      >
                        <Package size={12} className="mr-2 text-purple-400" />
                        {procedure.name}
                        <span className="ml-auto text-xs text-gray-500">
                          {procedure.parameters.length} params
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemaPanel; 