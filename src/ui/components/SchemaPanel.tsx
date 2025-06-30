import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ChevronRight, ChevronDown, Database, Table, View, Package } from 'lucide-react';

const SchemaPanel: React.FC = () => {
  const { schema, loading } = useSelector((state: RootState) => state.schema);

  if (loading) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex items-center justify-center text-gray-500">
        <p>Nenhum schema carregado</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300">Schema</h3>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {schema.databases.map((database) => (
          <div key={database.name} className="mb-4">
            <div className="flex items-center text-sm font-medium text-gray-300 mb-2">
              <Database size={14} className="mr-2" />
              {database.name}
            </div>
            
            {/* Tabelas */}
            {database.tables.length > 0 && (
              <div className="ml-4 mb-2">
                <div className="text-xs text-gray-400 mb-1">Tabelas</div>
                {database.tables.map((table) => (
                  <div key={table.name} className="flex items-center text-sm text-gray-300 py-1 hover:bg-gray-700 rounded px-2">
                    <Table size={12} className="mr-2" />
                    {table.name}
                  </div>
                ))}
              </div>
            )}
            
            {/* Views */}
            {database.views.length > 0 && (
              <div className="ml-4 mb-2">
                <div className="text-xs text-gray-400 mb-1">Views</div>
                {database.views.map((view) => (
                  <div key={view.name} className="flex items-center text-sm text-gray-300 py-1 hover:bg-gray-700 rounded px-2">
                    <View size={12} className="mr-2" />
                    {view.name}
                  </div>
                ))}
              </div>
            )}
            
            {/* Procedures */}
            {database.procedures.length > 0 && (
              <div className="ml-4">
                <div className="text-xs text-gray-400 mb-1">Procedures</div>
                {database.procedures.map((procedure) => (
                  <div key={procedure.name} className="flex items-center text-sm text-gray-300 py-1 hover:bg-gray-700 rounded px-2">
                    <Package size={12} className="mr-2" />
                    {procedure.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemaPanel; 