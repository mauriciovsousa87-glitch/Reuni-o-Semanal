
export enum Status {
  OK = 'OK',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export enum KpiId {
  ENERGIA_ELETRICA = 'energia_eletrica',
  INDICE_ENERGIA = 'indice_energia',
  GAS_NATURAL = 'gas_natural',
  CO2_BENEFICIAMENTO = 'co2_beneficiamento',
  CO2_CONSUMO = 'co2_consumo',
  CO2_SURPLUS = 'co2_surplus',
  INDISPONIBILIDADE = 'indisponibilidade',
  OBZ_VIC = 'obz_vic',
  CAPITAL_EMPREGADO = 'capital_empregado'
}

export interface KpiDefinition {
  id: KpiId;
  name: string;
  unit: string;
  description: string;
}

export interface KpiRecord {
  id: string;
  kpiId: KpiId;
  year: number;
  month: number;
  week: number; // 1 to 5
  value: number;
  target: number;
  deviationAbs: number;
  deviationPct: number;
  status: Status;
  comment?: string;
}

export interface Ishikawa {
  method: string;
  machine: string;
  material: string;
  manpower: string;
  environment: string;
  measurement: string;
  actions?: {
    method: string;
    machine: string;
    material: string;
    manpower: string;
    environment: string;
    measurement: string;
  }
}

export interface Anomaly {
  id: string;
  kpiId: KpiId;
  date: string; // ISO
  week: number;
  description: string;
  impact: string;
  status: 'Aberto' | 'Em Análise' | 'Plano de Ação' | 'Encerrado';
  ishikawa: Ishikawa;
  whys: string[]; // Array of 5 strings
}

export interface DtoRecord {
  id: string;
  week: number;
  title: string;
  relatedSystem: string;
  description: string;
  tests: string;
  results: string;
  decision: string;
  benefits: {
    type: 'Energia' | 'Gás' | 'CO2' | 'Custo';
    value: string;
  };
}

export interface ActionPlan {
  id: string;
  title: string;
  originType: 'KPI' | 'Anomalia' | 'DTO';
  originId?: string;
  responsible: string;
  area: string;
  startDate: string;
  deadline: string;
  status: 'Aberto' | 'Em Andamento' | 'Concluído' | 'Atrasado';
  description: string;
}

export interface MeetingMinutes {
  id: string;
  date: string;
  week: number;
  participants: string;
  highlights: string;
  decisions: string;
}

export interface AppSettings {
  plantName: string;
  warningThresholdPct: number; // e.g. 5%
  targets: Record<string, number>; // kpiId -> target value
  units: Record<string, string>; // kpiId -> unit string
}
