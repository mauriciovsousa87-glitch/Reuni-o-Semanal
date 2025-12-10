
import React, { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { storageService } from '../services/storage';
import { AppSettings } from '../types';
import { KPI_LIST } from '../constants';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = () => {
    storageService.setSettings(settings);
    setMsg('Configurações salvas com sucesso!');
    setTimeout(() => setMsg(null), 3000);
  };

  const updateTarget = (id: string, val: string) => {
    setSettings(prev => ({
      ...prev,
      targets: {
        ...prev.targets,
        [id]: parseFloat(val)
      }
    }));
  };

  const updateUnit = (id: string, val: string) => {
    setSettings(prev => ({
      ...prev,
      units: {
        ...prev.units,
        [id]: val
      }
    }));
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <SettingsIcon className="text-slate-500" /> Configurações
          </h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie metas, unidades e parâmetros gerais do sistema.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-md transition-all hover:scale-105 font-medium"
        >
          <Save size={18} /> Salvar Alterações
        </button>
      </header>

      {msg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Geral</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Planta / Unidade</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                value={settings.plantName}
                onChange={(e) => setSettings({...settings, plantName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Limiar de Alerta (% acima da meta)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                value={settings.warningThresholdPct}
                onChange={(e) => setSettings({...settings, warningThresholdPct: parseFloat(e.target.value)})}
              />
              <p className="text-xs text-slate-500 mt-1">Define quando o KPI passa de Verde para Amarelo/Vermelho.</p>
            </div>
          </div>
        </div>

        {/* Targets and Units */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Metas e Unidades por KPI</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">KPI</th>
                  <th className="px-6 py-3 w-40">Unidade</th>
                  <th className="px-6 py-3 w-48">Meta Semanal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {KPI_LIST.map(kpi => (
                  <tr key={kpi.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {kpi.name}
                      <p className="text-xs text-slate-400 font-normal">{kpi.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={settings.units[kpi.id] || kpi.unit}
                        onChange={(e) => updateUnit(kpi.id, e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number"
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                        value={settings.targets[kpi.id] ?? 0}
                        onChange={(e) => updateTarget(kpi.id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
