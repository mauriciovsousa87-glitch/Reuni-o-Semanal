
import { AppSettings, KpiRecord, Anomaly, DtoRecord, ActionPlan, MeetingMinutes } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

const KEYS = {
  SETTINGS: 'kpi_app_settings',
  RECORDS: 'kpi_app_records',
  ANOMALIES: 'kpi_app_anomalies',
  DTOS: 'kpi_app_dtos',
  ACTIONS: 'kpi_app_actions',
  MINUTES: 'kpi_app_minutes',
};

// Generics helpers
function get<T>(key: string, defaultVal: T): T {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultVal;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return defaultVal;
  }
}

function set<T>(key: string, val: T): void {
  localStorage.setItem(key, JSON.stringify(val));
}

// Specific Accessors
export const storageService = {
  getSettings: () => {
    const stored = get<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
    // Deep merge defaults to ensure new fields (like units) are present
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      targets: { ...DEFAULT_SETTINGS.targets, ...(stored.targets || {}) },
      units: { ...DEFAULT_SETTINGS.units, ...(stored.units || {}) }
    };
  },
  setSettings: (s: AppSettings) => set(KEYS.SETTINGS, s),

  getRecords: () => get<KpiRecord[]>(KEYS.RECORDS, []),
  saveRecords: (recs: KpiRecord[]) => {
    const existing = get<KpiRecord[]>(KEYS.RECORDS, []);
    // Simple upsert based on ID
    const map = new Map(existing.map(r => [r.id, r]));
    recs.forEach(r => map.set(r.id, r));
    set(KEYS.RECORDS, Array.from(map.values()));
  },

  getAnomalies: () => get<Anomaly[]>(KEYS.ANOMALIES, []),
  saveAnomaly: (anom: Anomaly) => {
    const list = get<Anomaly[]>(KEYS.ANOMALIES, []);
    const idx = list.findIndex(a => a.id === anom.id);
    if (idx >= 0) list[idx] = anom;
    else list.push(anom);
    set(KEYS.ANOMALIES, list);
  },

  getDtos: () => get<DtoRecord[]>(KEYS.DTOS, []),
  saveDto: (dto: DtoRecord) => {
    const list = get<DtoRecord[]>(KEYS.DTOS, []);
    const idx = list.findIndex(d => d.id === dto.id);
    if (idx >= 0) list[idx] = dto;
    else list.push(dto);
    set(KEYS.DTOS, list);
  },

  getActions: () => get<ActionPlan[]>(KEYS.ACTIONS, []),
  saveAction: (action: ActionPlan) => {
    const list = get<ActionPlan[]>(KEYS.ACTIONS, []);
    const idx = list.findIndex(a => a.id === action.id);
    if (idx >= 0) list[idx] = action;
    else list.push(action);
    set(KEYS.ACTIONS, list);
  },

  getMinutes: () => get<MeetingMinutes[]>(KEYS.MINUTES, []),
  saveMinute: (min: MeetingMinutes) => {
    const list = get<MeetingMinutes[]>(KEYS.MINUTES, []);
    const idx = list.findIndex(m => m.id === min.id);
    if (idx >= 0) list[idx] = min;
    else list.push(min);
    set(KEYS.MINUTES, list);
  },
};
