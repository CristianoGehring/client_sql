import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Clock, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const ResultsPanel: React.FC = () => {
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
  const activeTab = tabs.find((tab: any) => tab.id === activeTabId);
  
  // Estado para paginação - SEMPRE no topo
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Cálculos de paginação - SEMPRE no topo
  const paginationData = useMemo(() => {
    if (!activeTab?.result) return null;
    
    const result = activeTab.result;
    const totalRows = result.rows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    const currentRows = result.rows.slice(startIndex, endIndex);
    
    return {
      totalRows,
      totalPages,
      startIndex,
      endIndex,
      currentRows,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [activeTab?.result, currentPage, rowsPerPage]);

  // Resetar página quando mudar de tab ou resultado - SEMPRE no topo
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTabId, activeTab?.result]);

  if (!activeTab) {
    return (
      <div className="h-1/2 bg-gray-900 flex items-center justify-center text-gray-500">
        <p>Nenhum resultado para exibir</p>
      </div>
    );
  }

  const { result, error, loading } = activeTab;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') {
      // Truncar strings muito longas
      return value.length > 100 ? value.substring(0, 100) + '...' : value;
    }
    return String(value);
  };

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
      <div className="flex-1 flex flex-col overflow-hidden">
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

        {result && !error && paginationData && (
          <>
            {/* Indicador de scroll horizontal */}
            <div className="px-4 py-1 bg-gray-800 border-b border-gray-700 text-xs text-gray-400">
              <span>
                {result.columns.length} colunas • Largura total: {result.columns.length * 200}px • 
                {result.columns.length * 200 > 800 ? ' Scroll horizontal disponível' : ' Tabela cabe na tela'}
              </span>
            </div>
            
            {/* Tabela com scroll horizontal */}
            <div className="flex-1" style={{ overflow: 'hidden' }}>
              <div 
                style={{
                  overflowX: 'auto',
                  overflowY: 'auto',
                  width:  `calc(100vw - 36rem)`,
                  height: '100%'
                }}
              >
                <table 
                  className="text-xs border-collapse"
                  style={{ 
                    width: `${result.columns.length * 200}px`,
                    minWidth: `${result.columns.length * 200}px`,
                    tableLayout: 'fixed'
                  }}
                >
                  <thead className="bg-gray-800 sticky top-0 z-10">
                    <tr>
                      {result.columns.map((column: string, index: number) => (
                        <th 
                          key={index} 
                          className="px-3 py-2 text-left text-gray-300 font-medium border-b border-gray-700 whitespace-nowrap"
                          style={{ width: '200px', minWidth: '200px' }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{column}</span>
                            <span className="text-gray-500 text-xs ml-1 flex-shrink-0">
                              {result.rows.length > 0 && typeof result.rows[0][column] !== 'undefined' 
                                ? typeof result.rows[0][column] 
                                : 'text'
                              }
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginationData.currentRows.map((row: any, rowIndex: number) => (
                      <tr 
                        key={paginationData.startIndex + rowIndex} 
                        className="border-b border-gray-700 hover:bg-gray-800 transition-colors"
                      >
                        {result.columns.map((column: string, colIndex: number) => (
                          <td 
                            key={colIndex} 
                            className="px-3 py-1 text-gray-300 border-r border-gray-700 last:border-r-0"
                            style={{ width: '200px', minWidth: '200px' }}
                          >
                            <div className="max-w-[180px] truncate" title={formatCellValue(row[column])}>
                              {row[column] !== null && row[column] !== undefined 
                                ? formatCellValue(row[column])
                                : <span className="text-gray-500 italic">NULL</span>
                              }
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-700 bg-gray-800">
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span>
                  Mostrando {paginationData.startIndex + 1} a {paginationData.endIndex} de {paginationData.totalRows} linhas
                </span>
                <div className="flex items-center space-x-2">
                  <span>Linhas por página:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs border border-gray-600"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={!paginationData.hasPrevPage}
                  className="p-1 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!paginationData.hasPrevPage}
                  className="p-1 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span className="text-xs text-gray-400 px-2">
                  Página {currentPage} de {paginationData.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationData.hasNextPage}
                  className="p-1 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(paginationData.totalPages)}
                  disabled={!paginationData.hasNextPage}
                  className="p-1 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </>
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