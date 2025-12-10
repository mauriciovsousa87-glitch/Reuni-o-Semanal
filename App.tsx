
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { InputData } from './components/InputData';
import { Dashboard } from './components/Dashboard';
import { Anomalies } from './components/Anomalies';
import { Settings } from './components/Settings';
import { AnnualAnalysis } from './components/AnnualAnalysis';
import { Minutes } from './components/Minutes';
import { KPI_LIST } from './constants';
import { storageService } from './services/storage';

// Minimal implementations for other pages
const DtoPage = () => <div className="p-8 bg-white rounded-xl shadow text-center text-slate-500">Módulo DTO (Em construção)</div>;
const ActionPlans = () => <div className="p-8 bg-white rounded-xl shadow text-center text-slate-500">Planos de Ação (Em construção)</div>;
const History = () => <div className="p-8 bg-white rounded-xl shadow text-center text-slate-500">Histórico e Tendências (Em construção)</div>;

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [anomalyContext, setAnomalyContext] = useState<string | undefined>(undefined);

  const navigateToAnomaly = (kpiId: string) => {
    setAnomalyContext(kpiId);
    setActiveTab('anomalies');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'input': return <InputData />;
      case 'dashboard': return <Dashboard onNavigateAnomaly={navigateToAnomaly} />;
      case 'annual': return <AnnualAnalysis onNavigateAnomaly={navigateToAnomaly} />;
      case 'anomalies': return <Anomalies initialKpiId={anomalyContext} />;
      case 'dto': return <DtoPage />;
      case 'actions': return <ActionPlans />;
      case 'minutes': return <Minutes />;
      case 'settings': return <Settings />;
      case 'history': return <History />;
      default: return <Dashboard onNavigateAnomaly={navigateToAnomaly} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900">
      <Sidebar 
        isOpen={sidebarOpen} 
        toggle={() => setSidebarOpen(!sidebarOpen)} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <main 
        className={`
          flex-1 transition-all duration-300 p-8
          ${sidebarOpen ? 'ml-64' : 'ml-16'}
        `}
      >
        <div className="max-w-7xl mx-auto">
           {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
