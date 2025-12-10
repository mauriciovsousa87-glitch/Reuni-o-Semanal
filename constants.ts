
import { KpiDefinition, KpiId, AppSettings } from './types';

export const KPI_LIST: KpiDefinition[] = [
  { id: KpiId.ENERGIA_ELETRICA, name: 'Energia Elétrica', unit: 'kWh', description: 'Consumo total de energia elétrica' },
  { id: KpiId.INDICE_ENERGIA, name: 'Índice de Energia Utilidades', unit: 'kWh/prod', description: 'Eficiência energética da planta' },
  { id: KpiId.GAS_NATURAL, name: 'Consumo de Gás Natural', unit: 'Nm³', description: 'Consumo total de gás' },
  { id: KpiId.CO2_BENEFICIAMENTO, name: 'CO2 Beneficiamento', unit: 'tCO2', description: 'Emissões no processo de beneficiamento' },
  { id: KpiId.CO2_CONSUMO, name: 'CO2 Consumo', unit: 'tCO2', description: 'Emissões totais de consumo' },
  { id: KpiId.CO2_SURPLUS, name: 'CO2 Surplus', unit: 'tCO2', description: 'Excedente de emissões' },
  { id: KpiId.INDISPONIBILIDADE, name: 'Indisponibilidade Utilidades', unit: '%', description: 'Tempo de parada por falha de utilidades' },
  { id: KpiId.OBZ_VIC, name: 'OBZ + VIC Manutenção', unit: 'R$', description: 'Orçamento Base Zero + Variáveis' },
  { id: KpiId.CAPITAL_EMPREGADO, name: 'Capital Empregado', unit: 'R$', description: 'Capital investido em operação' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  plantName: 'Planta Industrial - Unidade 01',
  warningThresholdPct: 5.0,
  targets: {
    [KpiId.ENERGIA_ELETRICA]: 50000,
    [KpiId.INDICE_ENERGIA]: 120,
    [KpiId.GAS_NATURAL]: 15000,
    [KpiId.CO2_BENEFICIAMENTO]: 200,
    [KpiId.CO2_CONSUMO]: 500,
    [KpiId.CO2_SURPLUS]: 0,
    [KpiId.INDISPONIBILIDADE]: 0.5,
    [KpiId.OBZ_VIC]: 100000,
    [KpiId.CAPITAL_EMPREGADO]: 5000000,
  },
  units: {
    [KpiId.ENERGIA_ELETRICA]: 'kWh',
    [KpiId.INDICE_ENERGIA]: 'kWh/prod',
    [KpiId.GAS_NATURAL]: 'Nm³',
    [KpiId.CO2_BENEFICIAMENTO]: 'tCO2',
    [KpiId.CO2_CONSUMO]: 'tCO2',
    [KpiId.CO2_SURPLUS]: 'tCO2',
    [KpiId.INDISPONIBILIDADE]: '%',
    [KpiId.OBZ_VIC]: 'R$',
    [KpiId.CAPITAL_EMPREGADO]: 'R$',
  }
};

export const WEEKS = [1, 2, 3, 4, 5];
export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
export const YEARS = [2024, 2025, 2026];
