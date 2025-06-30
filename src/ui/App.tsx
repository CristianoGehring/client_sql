import React from 'react';
import Sidebar from './components/Sidebar';
import QueryEditor from './components/QueryEditor';
import ResultsPanel from './components/ResultsPanel';
import SchemaPanel from './components/SchemaPanel';
import Toolbar from './components/Toolbar';
import Notifications from './components/Notifications';

const App: React.FC = () => {
  return (
    <div className="h-screen flex flex-col dark density-normal">
      <Toolbar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={false} />
        
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 overflow-hidden">
            <div className="flex flex-1 flex-col">
              <QueryEditor />
              <ResultsPanel />
            </div>
            
            <SchemaPanel />
          </div>
        </div>
      </div>
      
      <Notifications />
    </div>
  );
};

export default App; 