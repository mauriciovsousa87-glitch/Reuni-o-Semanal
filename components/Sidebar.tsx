
import React from 'react';
import { 
  BarChart2, 
  FileText, 
  AlertTriangle, 
  Activity, 
  CheckSquare, 
  Settings, 
  TrendingUp, 
  Menu, 
  X,
  PlusCircle,
  CalendarRange
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'input', label: 'Inserção de Dados', icon: PlusCircle },
  { id: 'dashboard', label: 'Dashboards', icon: BarChart2 },
  { id: 'annual', label: 'Análise Anual', icon: CalendarRange },
  { id: 'anomalies', label: 'Relato de Anomalias', icon: AlertTriangle },
  { id: 'dto', label: 'DTO - Diagnóstico', icon: Activity },
  { id: 'actions', label: 'Planos de Ação', icon: CheckSquare },
  { id: 'minutes', label: 'Ata da Reunião', icon: FileText },
  { id: 'history', label: 'Histórico & Tendências', icon: TrendingUp },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle, activeTab, setActiveTab }) => {
  return (
    <div 
      className={`
        fixed left-0 top-0 h-full bg-slate-900 text-white transition-all duration-300 z-50 shadow-xl
        ${isOpen ? 'w-64' : 'w-16'}
      `}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700 h-16">
        {isOpen && <span className="font-bold text-lg tracking-wide text-emerald-400">KPI MANAGER</span>}
        <button onClick={toggle} className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="mt-4 flex flex-col gap-1 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex items-center p-3 rounded-lg transition-all duration-200 group
                ${isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
              title={!isOpen ? item.label : ''}
            >
              <Icon size={20} className={`${isOpen ? 'mr-3' : 'mx-auto'}`} />
              {isOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </nav>
      
      {isOpen && (
        <div className="absolute bottom-4 left-0 w-full px-4">
          <div className="text-xs text-slate-500 text-center">
            v1.1.0 - Enterprise
          </div>
        </div>
      )}
    </div>
  );
};
