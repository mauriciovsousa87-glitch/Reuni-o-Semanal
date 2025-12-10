
import React, { useState, useEffect } from 'react';
import { KPI_LIST, MONTHS, YEARS, WEEKS } from '../constants';
import { storageService } from '../services/storage';
import { KpiRecord, AppSettings, Anomaly } from '../types';
import { CalendarRange, Filter, CheckCircle2 } from 'lucide-react';

interface AnnualAnalysisProps {
  onNavigateAnomaly: (kpiId: string) => void;
}

export const AnnualAnalysis: React.FC<AnnualAnalysisProps> = ({ onNavigateAnomaly }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [records, setRecords] = useState<KpiRecord[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());

  useEffect(() => {
    setRecords(storageService.getRecords());
    setAnomalies(storageService.getAnomalies());
    setSettings(storageService.getSettings());
  }, []);

  // Helper to get formatted number
  const fmt = (val: number) => val.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

  // Helper for Color Logic
  // Assuming Lower is Better logic for red/green based on generic utility logic, 
  // OR strictly strictly Value > Target = Red.
  const getStatusColor = (val: number, target: number, isHeader = false) => {
    if (target === 0) return 'text-slate-500'; // No target defined
    const isBad = val > target; // Simple logic: Real > Meta is bad (Energy, Water, etc.)
    
    if (isBad) return isHeader ? 'text-rose-700 font-bold' : 'text-rose-600 font-medium';
    return isHeader ? 'text-emerald-700 font-bold' : 'text-emerald-600 font-medium';
  };

  // Helper to check if anomaly exists
  const checkAnomaly = (kpiId: string, w: number) => {
    // Find anomaly for this KPI, Year (implied in filtering context), and Week.
    // Note: The Anomaly interface has 'week' and 'date'. 
    // We check if there is an anomaly record for this week.
    // We might also want to check the month if weeks restart, but usually weeks are 1-52 or 1-5 per month.
    // Assuming 1-5 per month context here.
    return anomalies.some(a => 
      a.kpiId === kpiId && 
      a.week === w && 
      (new Date(a.date).getMonth() + 1 === month) && // Simple date check approximation
      (new Date(a.date).getFullYear() === year)
    );
  };

  const data = KPI_LIST.map(kpi => {
    const kpiId = kpi.id;
    const weeklyTarget = settings.targets[kpiId] || 0;
    const unit = settings.units[kpiId] || kpi.unit;

    // 1. Year Data (YTD)
    const yearRecords = records.filter(r => r.kpiId === kpiId && r.year === year);
    const yearReal = yearRecords.reduce((acc, curr) => acc + curr.value, 0);
    const yearMeta = weeklyTarget * 52; 

    // 2. Month Data
    const monthRecords = records.filter(r => r.kpiId === kpiId && r.year === year && r.month === month);
    const monthReal = monthRecords.reduce((acc, curr) => acc + curr.value, 0);
    const monthMeta = weeklyTarget * 5;

    // 3. Weekly Data (S1-S5)
    const weeksData: Record<number, { val: number | null, hasAnomaly: boolean, target: number }> = {};
    WEEKS.forEach(w => {
      const rec = monthRecords.find(r => r.week === w);
      // Look for specific anomaly record
      const hasAnom = checkAnomaly(kpiId, w);
      
      weeksData[w] = { 
        val: rec ? rec.value : null,
        target: rec ? rec.target : weeklyTarget,
        hasAnomaly: hasAnom
      };
    });

    return {
      kpi,
      unit,
      yearReal,
      yearMeta,
      monthReal,
      monthMeta,
      weeksData
    };
  });

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarRange className="text-indigo-600" /> Análise Anual
          </h2>
          <p className="text-slate-500 text-sm mt-1">Acumulado Ano, Semanal e Fechamento Mês.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <Filter size={18} className="text-slate-400 ml-2" />
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="w-px h-6 bg-slate-300 mx-1"></div>
          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer"
          >
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
        </div>
      </header>

      {/* Main Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 uppercase text-xs font-bold border-b border-slate-300">
                <th className="px-4 py-3 border-r border-slate-200 bg-slate-100 sticky left-0 z-10 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Indicador</th>
                <th colSpan={2} className="px-2 py-3 text-center border-r border-slate-300 bg-indigo-50 text-indigo-700">
                  {year} (Acumulado)
                </th>
                <th colSpan={5} className="px-2 py-3 text-center border-r border-slate-300 bg-white text-slate-700">
                  {MONTHS[month - 1]} (Semanas)
                </th>
                <th colSpan={2} className="px-2 py-3 text-center bg-emerald-50 text-emerald-700">
                  {MONTHS[month - 1]} (Total)
                </th>
              </tr>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-xs">
                <th className="px-4 py-2 border-r border-slate-200 sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Nome do KPI</th>
                <th className="px-2 py-2 text-right bg-indigo-50/50">Real</th>
                <th className="px-2 py-2 text-right border-r border-slate-300 bg-indigo-50/50">Meta</th>
                {WEEKS.map(w => (
                  <th key={w} className="px-2 py-2 text-center w-20">S{w}</th>
                ))}
                <th className="px-2 py-2 text-right border-l border-slate-300 bg-emerald-50/50">Real</th>
                <th className="px-2 py-2 text-right bg-emerald-50/50">Meta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => {
                const yearColor = getStatusColor(row.yearReal, row.yearMeta);
                const monthColor = getStatusColor(row.monthReal, row.monthMeta, true);

                return (
                  <tr key={row.kpi.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 border-r border-slate-200 font-medium text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      {row.kpi.name}
                      <span className="block text-[10px] text-slate-400 font-normal">{row.unit}</span>
                    </td>

                    {/* Ano Columns */}
                    <td className={`px-2 py-3 text-right bg-indigo-50/20 font-mono ${yearColor}`}>
                      {fmt(row.yearReal)}
                    </td>
                    <td className="px-2 py-3 text-right border-r border-slate-300 bg-indigo-50/20 text-slate-400 font-mono text-xs">
                      {fmt(row.yearMeta)}
                    </td>

                    {/* Weeks Columns */}
                    {WEEKS.map(w => {
                      const data = row.weeksData[w];
                      const val = data.val;
                      const hasVal = val !== null;
                      const cellColor = hasVal ? getStatusColor(val, data.target) : 'text-slate-300';
                      
                      return (
                        <td key={w} className="px-1 py-3 text-center border-r border-slate-100 last:border-none relative">
                          <div className="flex flex-col items-center justify-center h-full w-full">
                            <span className={`font-mono ${cellColor}`}>
                              {hasVal ? fmt(val) : '-'}
                            </span>
                            
                            {/* Anomaly Indicator */}
                            {data.hasAnomaly && (
                              <button 
                                onClick={() => onNavigateAnomaly(row.kpi.id)}
                                title="Anomalia relatada (Clique para ver)"
                                className="mt-1"
                              >
                                <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 hover:scale-125 transition-transform"></div>
                              </button>
                            )}
                            
                            {/* Visual cue if RED but NO Anomaly reported (Optional: small red outline or similar) */}
                            {hasVal && val > data.target && !data.hasAnomaly && (
                               <div className="w-1 h-1 rounded-full bg-rose-200 mt-1 opacity-50"></div>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Month Columns */}
                    <td className={`px-2 py-3 text-right border-l border-slate-300 bg-emerald-50/20 font-mono ${monthColor}`}>
                      {fmt(row.monthReal)}
                    </td>
                    <td className="px-2 py-3 text-right bg-emerald-50/20 text-slate-400 font-mono text-xs">
                      {fmt(row.monthMeta)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-4">
           <span className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Anomalia Relatada
           </span>
           <span className="flex items-center gap-2">
             <span className="text-rose-600 font-bold">123.00</span> Valor Acima da Meta
           </span>
           <span className="flex items-center gap-2">
             <span className="text-emerald-600 font-medium">100.00</span> Valor Dentro da Meta
           </span>
        </div>
      </div>
    </div>
  );
};
