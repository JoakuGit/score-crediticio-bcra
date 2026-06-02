export type Situation = 1 | 2 | 3 | 4 | 5 | 6;

export interface DebtEntity {
  entidad?: string | null;
  situacion?: Situation | number | null;
  fechaSit1?: string | null;
  monto?: number | null;
  diasAtrasoPago?: number | null;
  refinanciaciones?: boolean;
  recategorizacionOblig?: boolean;
  situacionJuridica?: boolean;
  irrecDisposicionTecnica?: boolean;
  enRevision?: boolean;
  procesoJud?: boolean;
}

export interface DebtPeriod {
  periodo?: string | null;
  entidades?: DebtEntity[] | null;
}

export interface DebtResult {
  identificacion?: number;
  denominacion?: string | null;
  periodos?: DebtPeriod[] | null;
}

export interface BcraResponse<T> {
  status: number;
  results?: T;
  errorMessages?: string[];
}

export interface CheckDetail {
  nroCheque?: number;
  fechaRechazo?: string | null;
  monto?: number | null;
  fechaPago?: string | null;
  fechaPagoMulta?: string | null;
  estadoMulta?: string | null;
  procesoJud?: boolean;
  enRevision?: boolean;
}

export interface CheckEntity {
  entidad?: number | null;
  detalle?: CheckDetail[] | null;
}

export interface CheckCausal {
  causal?: string | null;
  entidades?: CheckEntity[] | null;
}

export interface CheckResult {
  identificacion?: number;
  denominacion?: string | null;
  causales?: CheckCausal[] | null;
}

export interface TimelineEntityDetail {
  entity: string;
  debt: number;
  situation: number;
  overdueDays: number | null;
  observations: string[];
}

export interface BcraTimelineItem {
  period: string;
  debt: number;
  entitiesCount: number;
  maxSituation: number;
  entities: TimelineEntityDetail[];
}

export interface EntitySnapshot {
  entity: string;
  periods: number;
  totalDebt: number;
  maxSituation: number;
}

export interface IncomeEstimate {
  estimatedIncome: number;
  confidence: 'alta' | 'media' | 'baja';
  description: string;
}

export interface ScoreFactor {
  key: string;
  label: string;
  value: number;
  max: number;
  description: string;
  status: 'good' | 'neutral' | 'risk';
}

export interface ScoreResult {
  score: number;
  rating: string;
  summary: string;
  factors: ScoreFactor[];
  alerts: string[];
  timeline: BcraTimelineItem[];
  entities: EntitySnapshot[];
  incomeEstimate: IncomeEstimate;
  stats: {
    totalDebt: number;
    currentDebt: number;
    averageDebt: number;
    peakDebt: number;
    maxSituation: number;
    averageSituation: number;
    entitiesCount: number;
    periodsCount: number;
    monthlyBurden: number;
    rejectedChecks: number;
    overdueDays: number;
  };
}
