
import React, { useState, useEffect } from 'react';
import { KPI_LIST, WEEKS } from '../constants';
import { storageService } from '../services/storage';
import { Anomaly, KpiId } from '../types';
import { Plus, Edit, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AnomaliesProps {
  initialKpiId?: string;
}

const emptyAnomaly: Anomaly = {
  id: '',
  kpiId: KpiId.ENERGIA_ELETRICA,
  date: new Date().toISOString().split('T')[0],
  week: 1,
  description: '',
  impact: '',
  status: 'Aberto',
  ishikawa: { 
    method: '', machine: '', material: '', manpower: '', environment: '', measurement: '',
    actions: { method: '', machine: '', material: '', manpower: '', environment: '', measurement: '' }
  },
  whys: ['', '', '', '', '']
};

export const Anomalies: React.FC<AnomaliesProps> = ({ initialKpiId }) => {
  const [list, setList] = useState<Anomaly[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState<Anomaly>(emptyAnomaly);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setList(storageService.getAnomalies());
    if (initialKpiId) {
        setIsEditing(true);
        // Ensure we preserve type safety for KpiId
        setCurrent({ ...emptyAnomaly, kpiId: initialKpiId as KpiId, id: Date.now().toString() });
    }
  }, [initialKpiId]);

  const handleSave = () => {
    const toSave = { ...current, id: current.id || Date.now().toString() };
    storageService.saveAnomaly(toSave);
    setList(storageService.getAnomalies());
    setIsEditing(false);
    setCurrent(emptyAnomaly);
  };

  const startEdit = (anom: Anomaly) => {
    // Ensure nested objects exist to avoid undefined errors if editing old records
    const safeAnom = {
      ...anom,
      ishikawa: {
        ...anom.ishikawa,
        actions: anom.ishikawa.actions || { method: '', machine: '', material: '', manpower: '', environment: '', measurement: '' }
      }
    };
    setCurrent(safeAnom);
    setIsEditing(true);
  };

  const generateAiSuggestions = async () => {
    if (!current.description) {
      alert("Por favor, preencha a descrição do problema antes de pedir sugestões à IA.");
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = "gemini-2.5-flash";
      
      const prompt = `
        Atue como um especialista sênior em manutenção industrial e engenharia de utilidades.
        Analise o seguinte problema relatado:
        
        KPI Afetado: ${KPI_LIST.find(k => k.id === current.kpiId)?.name}
        Descrição do Problema: ${current.description}
        Impacto: ${current.impact}

        Tarefa:
        Preencha um diagrama de Ishikawa (6M) com as prováveis causas raízes.
        Para cada causa identificada em cada um dos 6Ms, sugira uma ação corretiva ou preventiva imediata.

        Retorne a resposta APENAS em formato JSON, seguindo estritamente este schema:
        {
          "ishikawa": {
            "method": "Causa provável relacionada a método...",
            "machine": "Causa provável relacionada a máquina...",
            "material": "Causa provável relacionada a material...",
            "manpower": "Causa provável relacionada a mão de obra...",
            "environment": "Causa provável relacionada a meio ambiente...",
            "measurement": "Causa provável relacionada a medição..."
          },
          "actions": {
             "method": "Ação sugerida para método...",
             "machine": "Ação sugerida para máquina...",
             "material": "Ação sugerida para material...",
             "manpower": "Ação sugerida para mão de obra...",
             "environment": "Ação sugerida para meio ambiente...",
             "measurement": "Ação sugerida para medição..."
          }
        }
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (text) {
        const json = JSON.parse(text);
        
        setCurrent(prev => ({
          ...prev,
          ishikawa: {
            ...prev.ishikawa,
            method: json.ishikawa.method || prev.ishikawa.method,
            machine: json.ishikawa.machine || prev.ishikawa.machine,
            material: json.ishikawa.material || prev.ishikawa.material,
            manpower: json.ishikawa.manpower || prev.ishikawa.manpower,
            environment: json.ishikawa.environment || prev.ishikawa.environment,
            measurement: json.ishikawa.measurement || prev.ishikawa.measurement,
            actions: {
              method: json.actions.method || prev.ishikawa.actions?.method || '',
              machine: json.actions.machine || prev.ishikawa.actions?.machine || '',
              material: json.actions.material || prev.ishikawa.actions?.material || '',
              manpower: json.actions.manpower || prev.ishikawa.actions?.manpower || '',
              environment: json.actions.environment || prev.ishikawa.actions?.environment || '',
              measurement: json.actions.measurement || prev.ishikawa.actions?.measurement || '',
            }
          }
        }));
      }

    } catch (error) {
      console.error("Erro ao gerar sugestões:", error);
      alert("Não foi possível gerar sugestões no momento. Verifique sua conexão ou tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <AlertTriangle className="text-rose-500" /> Relato de Anomalias
           </h2>
           <p className="text-slate-500 text-sm mt-1">Análise de causa raiz (Ishikawa + 5 Porquês).</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => { setCurrent(emptyAnomaly); setIsEditing(true); }}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm transition-transform hover:scale-105"
          >
            <Plus size={18} /> Nova Anomalia
          </button>
        )}
      </header>

      {isEditing ? (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
             <h3 className="font-bold text-lg text-slate-700">Detalhes da Anomalia</h3>
             <span className="text-xs text-slate-400">ID: {current.id || 'Novo'}</span>
          </div>
          <div className="p-6 space-y-6">
            {/* Header Data */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">KPI Afetado</label>
                <select 
                  className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
                  value={current.kpiId} 
                  onChange={(e) => setCurrent({...current, kpiId: e.target.value as KpiId})}
                >
                  {KPI_LIST.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Semana</label>
                 <select 
                  className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={current.week}
                  onChange={(e) => setCurrent({...current, week: Number(e.target.value)})}
                 >
                    {WEEKS.map(w => <option key={w} value={w}>Semana {w}</option>)}
                 </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input 
                  type="date" 
                  className="w-full border border-slate-300 p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={current.date}
                  onChange={(e) => setCurrent({...current, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                   className="w-full border border-slate-300 p-2 rounded bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                   value={current.status}
                   onChange={(e) => setCurrent({...current, status: e.target.value as any})}
                >
                  <option>Aberto</option>
                  <option>Em Análise</option>
                  <option>Plano de Ação</option>
                  <option>Encerrado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Descrição do Problema</label>
                  <textarea 
                    className="w-full border border-slate-300 p-2 rounded h-24 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    value={current.description}
                    onChange={(e) => setCurrent({...current, description: e.target.value})}
                    placeholder="Descreva o que aconteceu..."
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Impacto (Quantitativo/Financeiro)</label>
                  <textarea 
                    className="w-full border border-slate-300 p-2 rounded h-24 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                    value={current.impact}
                    onChange={(e) => setCurrent({...current, impact: e.target.value})}
                    placeholder="Ex: Aumento de 500 kWh..."
                  />
               </div>
            </div>

            {/* Ishikawa */}
            <div className="border border-slate-200 rounded-lg p-5 bg-slate-50/50">
              <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-3">
                <h4 className="font-bold text-slate-700 text-lg">Ishikawa (Espinha de Peixe)</h4>
                <button 
                  onClick={generateAiSuggestions}
                  disabled={isGenerating || !current.description}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all
                    ${isGenerating 
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'
                    }
                  `}
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  {isGenerating ? 'Gerando Sugestões...' : 'Sugerir Causas e Ações com IA'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {['method', 'machine', 'material', 'manpower', 'environment', 'measurement'].map((factor) => {
                   const label = factor === 'manpower' ? 'Mão de Obra' : 
                                 factor === 'environment' ? 'Meio Ambiente' : 
                                 factor === 'measurement' ? 'Medição' : 
                                 factor === 'machine' ? 'Máquina' : 
                                 factor === 'method' ? 'Método' : 'Material';
                   return (
                     <div key={factor} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-3">
                       <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                           <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                           Causa ({label})
                         </label>
                         <textarea 
                            rows={2}
                            className="w-full border border-slate-200 bg-slate-50 p-2 rounded text-sm focus:ring-2 focus:ring-rose-200 focus:border-rose-400 outline-none resize-none"
                            value={(current.ishikawa as any)[factor]}
                            onChange={(e) => setCurrent({...current, ishikawa: {...current.ishikawa, [factor]: e.target.value}})}
                            placeholder={`Possível causa em ${label}...`}
                         />
                       </div>
                       
                       <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                           <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                           Ação Sugerida
                         </label>
                         <textarea 
                            rows={2}
                            className="w-full border border-slate-200 bg-slate-50 p-2 rounded text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none resize-none"
                            value={current.ishikawa.actions?.[factor as keyof typeof current.ishikawa.actions] || ''}
                            onChange={(e) => setCurrent({
                              ...current, 
                              ishikawa: {
                                ...current.ishikawa, 
                                actions: {
                                  ...current.ishikawa.actions!,
                                  [factor]: e.target.value
                                }
                              }
                            })}
                            placeholder="Ação corretiva..."
                         />
                       </div>
                     </div>
                   );
                 })}
              </div>
            </div>

            {/* 5 Whys */}
            <div className="border border-slate-200 rounded-lg p-5">
              <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">5 Porquês</h4>
              <div className="space-y-3">
                 {current.whys.map((why, idx) => (
                   <div key={idx} className="flex gap-3 items-center">
                     <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">
                       {idx + 1}
                     </span>
                     <input 
                        className="w-full border border-slate-300 p-2 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder={`Por que ${idx === 0 ? 'aconteceu o problema?' : 'isso ocorreu?'}`}
                        value={why}
                        onChange={(e) => {
                          const newWhys = [...current.whys];
                          newWhys[idx] = e.target.value;
                          setCurrent({...current, whys: newWhys});
                        }}
                     />
                   </div>
                 ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium">Cancelar</button>
              <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium shadow-sm">Salvar Anomalia</button>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
               <tr>
                 <th className="px-6 py-4">Semana</th>
                 <th className="px-6 py-4">KPI</th>
                 <th className="px-6 py-4">Descrição</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4 text-right">Ação</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {list.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                     <div className="flex flex-col items-center gap-2">
                       <AlertTriangle size={32} className="opacity-20" />
                       <p>Nenhuma anomalia registrada.</p>
                     </div>
                   </td>
                 </tr>
               ) : (
                 list.map(item => (
                   <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 font-mono text-slate-600">S{item.week}</td>
                     <td className="px-6 py-4 font-medium text-slate-800">{KPI_LIST.find(k => k.id === item.kpiId)?.name}</td>
                     <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{item.description}</td>
                     <td className="px-6 py-4">
                       <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                         item.status === 'Encerrado' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                         item.status === 'Aberto' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                       }`}>
                         {item.status}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                       <button onClick={() => startEdit(item)} className="text-sky-600 hover:text-sky-800 p-1 hover:bg-sky-50 rounded transition-colors">
                         <Edit size={18} />
                       </button>
                     </td>
                   </tr>
                 ))
               )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
