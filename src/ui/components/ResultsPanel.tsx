import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

const ResultsPanel: React.FC = () => {
  const { activeTabId, tabs } = useSelector((state: RootState) => state.queries);
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  if (!activeTab) {
    return (
      <div className="h-1/2 bg-gray-900 flex items-center justify-center text-gray-500">
        <p>Nenhum resultado para exibir</p>
      </div>
    );
  }

  const { result, error, loading } = activeTab;

  return (
    <div className="h-1/2 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300">Resultados</h3>
        {result && (
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span>{result.rowCount} linhas</span>
            <span className="flex items-center">
              <Clock size={12} className="mr-1" />
              {result.executionTime}ms
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="p-4">
            <div className="flex items-center space-x-2 text-red-400 mb-2">
              <AlertCircle size={16} />
              <span className="font-semibold">Erro</span>
            </div>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {result && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800">
                <tr>
                  {result.columns.map((column, index) => (
                    <th key={index} className="px-4 py-2 text-left text-gray-300 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-700 hover:bg-gray-800">
                    {result.columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-4 py-2 text-gray-300">
                        {row[column] !== null && row[column] !== undefined 
                          ? String(row[column])
                          : <span className="text-gray-500">NULL</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!result && !error && !loading && (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Execute uma query para ver os resultados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel; 