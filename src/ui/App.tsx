import React from 'react';
import Sidebar from './components/Sidebar';
import QueryEditor from './components/QueryEditor';
import ResultsPanel from './components/ResultsPanel';
import SchemaPanel from './components/SchemaPanel';
import Toolbar from './components/Toolbar';
import Notifications from './components/Notifications';
import AppInitializer from './components/AppInitializer';

const App: React.FC = () => {
  return (
    <AppInitializer>
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
    </AppInitializer>
  );
};

export default App; 