import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ReferenceLine 
} from 'recharts';
import { KPI_LIST, WEEKS, MONTHS, YEARS } from '../constants';
import { storageService } from '../services/storage';
import { KpiRecord, Status, KpiId } from '../types';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from 'lucide-react';

interface DashboardProps {
  onNavigateAnomaly: (kpiId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateAnomaly }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedKpi, setSelectedKpi] = useState<string>('all');
  const [records, setRecords] = useState<KpiRecord[]>([]);

  useEffect(() => {
    setRecords(storageService.getRecords());
  }, []);

  // Filter Logic
  const weekData = records.filter(r => r.year === year && r.month === month && r.week === selectedWeek);
  
  // Stats
  const statusCounts = {
    [Status.OK]: weekData.filter(r => r.status === Status.OK).length,
    [Status.WARNING]: weekData.filter(r => r.status === Status.WARNING).length,
    [Status.CRITICAL]: weekData.filter(r => r.status === Status.CRITICAL).length,
  };

  // Prepare data for line chart (Trend over weeks for selected KPI or first one)
  const trendKpiId = selectedKpi === 'all' ? KPI_LIST[0].id : selectedKpi;
  const trendData = WEEKS.map(w => {
    const rec = records.find(r => r.year === year && r.month === month && r.week === w && r.kpiId === trendKpiId);
    return {
      week: `S${w}`,
      value: rec ? rec.value : 0,
      target: rec ? rec.target : storageService.getSettings().targets[trendKpiId] || 0
    };
  });

  // Prepare data for bar chart (Comparison of all KPIs for selected week)
  const barData = KPI_LIST.map(kpi => {
    const rec = weekData.find(r => r.kpiId === kpi.id);
    return {
      name: kpi.name.split(' ')[0], // Short name
      fullName: kpi.name,
      real: rec ? rec.value : 0,
      meta: rec ? rec.target : storageService.getSettings().targets[kpi.id] || 0,
      status: rec ? rec.status : Status.OK,
      kpiId: kpi.id
    };
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Dashboard Gerencial</h2>
        <div className="flex flex-wrap gap-2">
           <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500">
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500">
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={selectedWeek} onChange={(e) => setSelectedWeek(Number(e.target.value))} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500">
            {WEEKS.map(w => <option key={w} value={w}>Semana {w}</option>)}
          </select>
          <select value={selectedKpi} onChange={(e) => setSelectedKpi(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:ring-2 focus:ring-emerald-500 max-w-xs">
            <option value="all">Visão Geral (Todos)</option>
            {KPI_LIST.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-emerald-600 font-medium mb-1">Dentro da Meta</p>
            <p className="text-4xl font-bold text-emerald-800">{statusCounts[Status.OK]}</p>
          </div>
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600"><ArrowDownRight size={32} /></div>
        </div>
        <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-amber-600 font-medium mb-1">Atenção (Desvio Leve)</p>
            <p className="text-4xl font-bold text-amber-800">{statusCounts[Status.WARNING]}</p>
          </div>
          <div className="bg-amber-100 p-3 rounded-full text-amber-600"><Minus size={32} /></div>
        </div>
        <div className="bg-rose-50 p-6 rounded-xl border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-rose-600 font-medium mb-1">Crítico (Anomalia)</p>
            <p className="text-4xl font-bold text-rose-800">{statusCounts[Status.CRITICAL]}</p>
          </div>
          <div className="bg-rose-100 p-3 rounded-full text-rose-600"><AlertCircle size={32} /></div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Evolução Mensal: {KPI_LIST.find(k => k.id === trendKpiId)?.name}</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Line type="monotone" dataKey="value" name="Realizado" stroke="#0ea5e9" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="step" dataKey="target" name="Meta" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparison List/Chart for the Week */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Performance da Semana {selectedWeek}</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {barData.map((item) => {
               const deviation = item.meta > 0 ? ((item.real - item.meta) / item.meta) * 100 : 0;
               let bgColor = 'bg-emerald-50 border-emerald-200';
               let textColor = 'text-emerald-700';
               
               if (item.status === Status.CRITICAL) {
                 bgColor = 'bg-rose-50 border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors';
                 textColor = 'text-rose-700';
               } else if (item.status === Status.WARNING) {
                 bgColor = 'bg-amber-50 border-amber-200';
                 textColor = 'text-amber-700';
               }

               return (
                 <div 
                    key={item.kpiId} 
                    className={`p-4 rounded-lg border ${bgColor} flex justify-between items-center`}
                    onClick={() => item.status === Status.CRITICAL && onNavigateAnomaly(item.kpiId)}
                 >
                    <div>
                      <p className={`font-semibold ${textColor}`}>{item.fullName}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Meta: <span className="font-mono">{item.meta.toLocaleString('pt-BR')}</span> | Real: <span className="font-mono">{item.real.toLocaleString('pt-BR')}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${textColor}`}>
                        {deviation > 0 ? '+' : ''}{deviation.toFixed(1)}%
                      </p>
                      {item.status === Status.CRITICAL && (
                        <span className="text-[10px] uppercase font-bold bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full">
                          Relatar Anomalia
                        </span>
                      )}
                    </div>
                 </div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};