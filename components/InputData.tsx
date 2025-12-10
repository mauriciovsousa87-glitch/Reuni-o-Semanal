
import React, { useState, useEffect } from 'react';
import { Save, Upload } from 'lucide-react';
import { KPI_LIST, WEEKS, MONTHS, YEARS } from '../constants';
import { storageService } from '../services/storage';
import { KpiRecord, Status, AppSettings, KpiId } from '../types';

export const InputData: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [week, setWeek] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({}); // Use string for input handling
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Refresh settings whenever component mounts or updates
    setSettings(storageService.getSettings());
    
    // Load existing data for this timeframe if available
    const records = storageService.getRecords();
    const currentValues: Record<string, string> = {};
    
    KPI_LIST.forEach(kpi => {
      const found = records.find(r => 
        r.kpiId === kpi.id && r.year === year && r.month === month && r.week === week
      );
      if (found) {
        currentValues[kpi.id] = found.value.toString();
      } else {
        currentValues[kpi.id] = '';
      }
    });
    setValues(currentValues);
  }, [year, month, week]);

  const handleSave = () => {
    const newRecords: KpiRecord[] = [];
    let incomplete = false;

    KPI_LIST.forEach(kpi => {
      const valStr = values[kpi.id];
      if (valStr === '' || valStr === undefined) {
        incomplete = true;
        return;
      }

      const val = parseFloat(valStr);
      const target = settings.targets[kpi.id] || 0;
      const deviationAbs = val - target;
      // Avoid division by zero
      const deviationPct = target !== 0 ? (deviationAbs / target) * 100 : 0;
      
      let status = Status.OK;
      const threshold = settings.warningThresholdPct;

      if (deviationPct > threshold) {
        status = Status.CRITICAL;
      } else if (deviationPct > 0) {
        status = Status.WARNING;
      } else {
        status = Status.OK;
      }

      newRecords.push({
        id: `${year}-${month}-${week}-${kpi.id}`,
        kpiId: kpi.id,
        year,
        month,
        week,
        value: val,
        target,
        deviationAbs,
        deviationPct,
        status
      });
    });

    if (incomplete) {
      setMessage('Por favor, preencha todos os campos antes de salvar.');
      return;
    }

    storageService.saveRecords(newRecords);
    setMessage('Dados salvos com sucesso!');
    setTimeout(() => setMessage(null), 3000);
  };

  const getTarget = (kpiId: string) => settings.targets[kpiId] || 0;
  const getUnit = (kpiId: string) => settings.units[kpiId] || '';

  const calculateDeviation = (valStr: string, target: number) => {
    if (!valStr) return { abs: '-', pct: '-', color: 'text-slate-400' };
    const val = parseFloat(valStr);
    const diff = val - target;
    const pct = target !== 0 ? (diff / target) * 100 : 0;
    
    let color = 'text-emerald-600';
    if (pct > settings.warningThresholdPct) color = 'text-rose-600';
    else if (pct > 0) color = 'text-amber-500';

    return {
      abs: diff.toLocaleString('pt-BR', { maximumFractionDigits: 2 }),
      pct: pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%',
      color
    };
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inserção de Dados Semanais</h2>
          <p className="text-slate-500 text-sm mt-1">Lance os valores realizados para calcular o desempenho.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select 
            value={week} 
            onChange={(e) => setWeek(Number(e.target.value))}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {WEEKS.map(w => <option key={w} value={w}>Semana {w}</option>)}
          </select>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-lg mb-4 text-sm font-medium ${message.includes('sucesso') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">KPI</th>
                <th className="px-6 py-4">Unidade</th>
                <th className="px-6 py-4">Meta Semanal</th>
                <th className="px-6 py-4 w-40">Valor Real</th>
                <th className="px-6 py-4 text-right">Desvio Abs.</th>
                <th className="px-6 py-4 text-right">Desvio %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {KPI_LIST.map((kpi) => {
                const target = getTarget(kpi.id);
                const unit = getUnit(kpi.id);
                const calc = calculateDeviation(values[kpi.id], target);
                return (
                  <tr key={kpi.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{kpi.name}</td>
                    <td className="px-6 py-4 text-slate-500">{unit}</td>
                    <td className="px-6 py-4 text-slate-700 font-mono">{target.toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-right font-mono"
                        placeholder="0.00"
                        value={values[kpi.id] || ''}
                        onChange={(e) => setValues({...values, [kpi.id]: e.target.value})}
                      />
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${calc.color}`}>
                      {calc.abs}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${calc.color}`}>
                      {calc.pct}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
           <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 px-4 py-2 rounded transition-colors text-sm font-medium">
            <Upload size={18} />
            Importar CSV
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg shadow-md transition-all font-semibold transform hover:scale-105"
          >
            <Save size={20} />
            Salvar Dados da Semana
          </button>
        </div>
      </div>
    </div>
  );
};
