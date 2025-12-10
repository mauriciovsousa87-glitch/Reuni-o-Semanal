
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Save, FileText } from 'lucide-react';

interface AgendaItem {
  id: number;
  topic: string;
  timeSpent: number; // seconds
  isActive: boolean;
  notes: string;
}

const DEFAULT_AGENDA = [
  { id: 1, topic: 'Segurança e Meio Ambiente (SHE)', timeSpent: 0, isActive: false, notes: '' },
  { id: 2, topic: 'Qualidade & Água/Efluentes', timeSpent: 0, isActive: false, notes: '' },
  { id: 3, topic: 'Eficiência Energética & CO2', timeSpent: 0, isActive: false, notes: '' },
  { id: 4, topic: 'Manutenção & Confiabilidade', timeSpent: 0, isActive: false, notes: '' },
  { id: 5, topic: 'Custos (OBZ/VIC)', timeSpent: 0, isActive: false, notes: '' },
  { id: 6, topic: 'Pessoas & Geral', timeSpent: 0, isActive: false, notes: '' },
];

export const Minutes: React.FC = () => {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isMeetingRunning, setIsMeetingRunning] = useState(false);
  const [items, setItems] = useState<AgendaItem[]>(DEFAULT_AGENDA);
  const [activeTopicId, setActiveTopicId] = useState<number | null>(null);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (isMeetingRunning) {
      interval = setInterval(() => {
        setTotalSeconds(prev => prev + 1);
        
        if (activeTopicId !== null) {
          setItems(prev => prev.map(item => {
            if (item.id === activeTopicId) {
              return { ...item, timeSpent: item.timeSpent + 1 };
            }
            return item;
          }));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMeetingRunning, activeTopicId]);

  const toggleMeeting = () => {
    if (isMeetingRunning) {
      // Pause everything
      setIsMeetingRunning(false);
      setActiveTopicId(null); // Also pause specific topic
    } else {
      setIsMeetingRunning(true);
      // If no topic was selected, maybe select the first one? No, let user choose.
    }
  };

  const toggleTopic = (id: number) => {
    if (!isMeetingRunning) {
      alert("Inicie a reunião no cronômetro principal primeiro.");
      return;
    }

    if (activeTopicId === id) {
      // Pause this topic
      setActiveTopicId(null);
    } else {
      // Switch to this topic
      setActiveTopicId(id);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const h = Math.floor(m / 60);
    const displayM = m % 60;
    
    if (h > 0) return `${h}h ${displayM}m ${s}s`;
    return `${displayM}m ${s.toString().padStart(2, '0')}s`;
  };

  const MEETING_LIMIT_SEC = 90 * 60; // 1h30m
  const progressPct = Math.min((totalSeconds / MEETING_LIMIT_SEC) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Top Timer Dashboard */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-6 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-full">
            <Clock size={32} className={isMeetingRunning ? "text-emerald-400 animate-pulse" : "text-slate-500"} />
          </div>
          <div>
            <h2 className="text-slate-400 text-xs uppercase font-bold tracking-wider">Tempo Total de Reunião</h2>
            <div className="text-4xl font-mono font-bold tracking-tight">
              {formatTime(totalSeconds)}
            </div>
            <div className="w-48 h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
               <div 
                className={`h-full ${progressPct > 90 ? 'bg-rose-500' : 'bg-emerald-500'} transition-all duration-1000`} 
                style={{ width: `${progressPct}%` }}
               ></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
           <span className="text-xs text-slate-400 mb-1">Status: {isMeetingRunning ? 'Em Andamento' : 'Pausada'}</span>
           <button 
             onClick={toggleMeeting}
             className={`
               flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-transform hover:scale-105
               ${isMeetingRunning 
                 ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                 : 'bg-emerald-500 hover:bg-emerald-600 text-white'
               }
             `}
           >
             {isMeetingRunning ? <><Pause fill="currentColor" /> Pausar</> : <><Play fill="currentColor" /> Iniciar Reunião</>}
           </button>
        </div>

        <div className="hidden md:block text-right">
           <p className="text-slate-400 text-sm">Meta de Tempo</p>
           <p className="text-xl font-bold">01h 30m</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agenda List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
            <FileText className="text-indigo-600" /> Pauta da Reunião
          </h3>
          
          {items.map(item => (
            <div 
              key={item.id} 
              className={`
                bg-white border rounded-xl p-4 transition-all
                ${activeTopicId === item.id ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-md' : 'border-slate-200'}
              `}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => toggleTopic(item.id)}
                    className={`
                      p-3 rounded-full transition-colors
                      ${activeTopicId === item.id 
                        ? 'bg-indigo-100 text-indigo-600' 
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                      }
                    `}
                  >
                     {activeTopicId === item.id ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                  </button>
                  <div>
                    <h4 className={`font-bold ${activeTopicId === item.id ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {item.topic}
                    </h4>
                    <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded ${activeTopicId === item.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                      {formatTime(item.timeSpent)}
                    </span>
                  </div>
                </div>
              </div>
              
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                rows={3}
                placeholder="Anotações, decisões e pontos de atenção..."
                value={item.notes}
                onChange={(e) => {
                  const val = e.target.value;
                  setItems(prev => prev.map(i => i.id === item.id ? { ...i, notes: val } : i));
                }}
              />
            </div>
          ))}
        </div>

        {/* Sidebar for Actions / Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4">Participantes</h3>
             <textarea 
               className="w-full border border-slate-300 rounded-lg p-2 text-sm h-32 outline-none focus:ring-2 focus:ring-emerald-500"
               placeholder="Liste os presentes..."
             />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4">Resumo do Tempo</h3>
             <ul className="space-y-2 text-sm">
                {items.map(i => (
                  <li key={i.id} className="flex justify-between items-center border-b border-slate-50 pb-1">
                    <span className="text-slate-600 truncate max-w-[180px]">{i.topic}</span>
                    <span className="font-mono text-slate-800 font-medium">{formatTime(i.timeSpent)}</span>
                  </li>
                ))}
                <li className="flex justify-between items-center pt-2 font-bold text-slate-900">
                  <span>Total Cronometrado</span>
                  <span>{formatTime(totalSeconds)}</span>
                </li>
             </ul>
          </div>

          <button className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-colors">
            <Save size={20} /> Encerrar e Salvar Ata
          </button>
        </div>
      </div>
    </div>
  );
};
