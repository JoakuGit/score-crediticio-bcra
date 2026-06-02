import type {
  ApplicantInputs,
  BcraTimelineItem,
  CheckResult,
  DebtEntity,
  DebtResult,
  EntitySnapshot,
  IncomeEstimate,
  ScoreFactor,
  ScoreResult,
} from './types';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const money = (value: number) => Number.isFinite(value) ? value * 1000 : 0;

const situationLabels: Record<number, string> = {
  1: 'Situacion normal',
  2: 'Con seguimiento especial',
  3: 'Con problemas',
  4: 'Con alto riesgo de insolvencia',
  5: 'Irrecuperable',
};

function getSituationLabel(value: number) {
  return situationLabels[value] ?? `Situacion ${value}`;
}

function buildObservations(entity: DebtEntity) {
  const observations: string[] = [];

  if (entity.refinanciaciones) observations.push('Refinanciaciones');
  if (entity.recategorizacionOblig) observations.push('Recategorizacion obligatoria');
  if (entity.situacionJuridica) observations.push('Situacion juridica');
  if (entity.procesoJud) observations.push('Proceso judicial');
  if (entity.irrecDisposicionTecnica) observations.push('Irrecuperable por disposicion tecnica');
  if (entity.enRevision) observations.push('En revision');

  return observations.length ? observations : ['N/A'];
}

function allEntities(report?: DebtResult): DebtEntity[] {
  return report?.periodos?.flatMap((period) => period.entidades ?? []) ?? [];
}

function latestEntities(report?: DebtResult): DebtEntity[] {
  const [latest] = report?.periodos ?? [];
  return latest?.entidades ?? [];
}

function countRejectedChecks(checks?: CheckResult) {
  return checks?.causales?.reduce((total, causal) => {
    return total + (causal.entidades?.reduce((entityTotal, entity) => entityTotal + (entity.detalle?.length ?? 0), 0) ?? 0);
  }, 0) ?? 0;
}

function factor(key: string, label: string, value: number, max: number, description: string): ScoreFactor {
  const ratio = value / max;
  return {
    key,
    label,
    value: Math.round(clamp(value, 0, max)),
    max,
    description,
    status: ratio >= 0.7 ? 'good' : ratio >= 0.45 ? 'neutral' : 'risk',
  };
}

function buildTimeline(current?: DebtResult, historic?: DebtResult): BcraTimelineItem[] {
  const periods = historic?.periodos?.length ? historic.periodos : current?.periodos ?? [];

  return periods
    ?.map((period) => {
      const entities = period.entidades ?? [];
      return {
        period: period.periodo || 'Sin período',
        debt: entities.reduce((sum, entity) => sum + money(entity.monto ?? 0), 0),
        entitiesCount: new Set(entities.map((entity) => entity.entidad).filter(Boolean)).size,
        maxSituation: Math.max(1, ...entities.map((entity) => Number(entity.situacion ?? 1))),
        entities: entities.map((entity) => ({
          entity: entity.entidad?.trim() || 'Entidad sin nombre',
          debt: money(entity.monto ?? 0),
          situation: Number(entity.situacion ?? 1),
          overdueDays: entity.diasAtrasoPago == null ? null : Number(entity.diasAtrasoPago),
          observations: buildObservations(entity),
        })),
      };
    })
    .filter(Boolean) ?? [];
}

function buildEntities(current?: DebtResult, historic?: DebtResult): EntitySnapshot[] {
  const reports = historic?.periodos?.length ? historic.periodos : current?.periodos ?? [];
  const map = new Map<string, EntitySnapshot>();

  for (const period of reports) {
    for (const entity of period.entidades ?? []) {
      const key = entity.entidad?.trim() || 'Entidad sin nombre';
      const prev = map.get(key);

      map.set(key, {
        entity: key,
        periods: (prev?.periods ?? 0) + 1,
        totalDebt: (prev?.totalDebt ?? 0) + money(entity.monto ?? 0),
        maxSituation: Math.max(prev?.maxSituation ?? 1, Number(entity.situacion ?? 1)),
      });
    }
  }

  return [...map.values()].sort((a, b) => b.totalDebt - a.totalDebt).slice(0, 5);
}

function buildIncomeReference(applicant: ApplicantInputs): IncomeEstimate {
  return {
    estimatedIncome: applicant.ingresoMensual,
    description: `Referencia manual declarada: ${applicant.edad} anios y ${new Intl.NumberFormat('es-AR').format(applicant.ingresoMensual)} pesos mensuales.`,
  };
}

function buildAlerts(
  maxSituation: number,
  rejectedChecks: number,
  legalFlags: number,
  overdueDays: number,
  monthlyBurden: number,
  timeline: BcraTimelineItem[],
) {
  const alerts: string[] = [];
  const latestDebt = timeline[0]?.debt ?? 0;
  const oldestDebt = timeline[timeline.length - 1]?.debt ?? latestDebt;

  if (maxSituation > 1) alerts.push(`La peor situacion historica informada por BCRA es ${maxSituation} (${getSituationLabel(maxSituation)}). Cualquier situacion distinta de 1 ya es una senal de riesgo.`);
  if (rejectedChecks > 0) alerts.push(`Se detectaron ${rejectedChecks} cheque(s) rechazado(s) en la consulta pública.`);
  if (legalFlags > 0) alerts.push(`Aparecen ${legalFlags} alerta(s) judiciales o técnicas en los registros consultados.`);
  if (overdueDays >= 30) alerts.push(`El atraso máximo informado alcanza ${overdueDays} días.`);
  if (monthlyBurden >= 0.55) alerts.push(`La carga estimada de deuda sobre ingreso mensual de referencia supera el ${(monthlyBurden * 100).toFixed(0)}%.`);
  if (latestDebt > oldestDebt * 1.25 && timeline.length >= 3) alerts.push('La deuda más reciente está por encima del tramo inicial observado en el historial.');

  if (!alerts.length) {
    alerts.push('No aparecen alertas fuertes en la foto pública consultada; igual conviene complementar con documentación adicional.');
  }

  return alerts;
}

export function calculateScore(
  current: DebtResult | undefined,
  historic: DebtResult | undefined,
  checks: CheckResult | undefined,
  applicant: ApplicantInputs,
): ScoreResult {
  const currentEntities = latestEntities(current);
  const historicEntities = allEntities(historic);
  const combinedEntities = historicEntities.length ? historicEntities : allEntities(current);
  const timeline = buildTimeline(current, historic);
  const entities = buildEntities(current, historic);
  const periodsCount = timeline.length || current?.periodos?.length || 0;
  const entitiesCount = new Set(combinedEntities.map((entity) => entity.entidad).filter(Boolean)).size;
  const totalDebt = currentEntities.reduce((sum, entity) => sum + money(entity.monto ?? 0), 0);
  const averageDebt = timeline.length ? timeline.reduce((sum, item) => sum + item.debt, 0) / timeline.length : totalDebt;
  const peakDebt = timeline.length ? Math.max(...timeline.map((item) => item.debt)) : totalDebt;
  const historicDebt = combinedEntities.reduce((sum, entity) => sum + money(entity.monto ?? 0), 0);
  const maxSituation = Math.max(1, ...combinedEntities.map((entity) => Number(entity.situacion ?? 1)));
  const averageSituation = combinedEntities.length
    ? combinedEntities.reduce((sum, entity) => sum + Number(entity.situacion ?? 1), 0) / combinedEntities.length
    : 1;
  const rejectedChecks = countRejectedChecks(checks);
  const overdueDays = Math.max(0, ...allEntities(current).map((entity) => Number(entity.diasAtrasoPago ?? 0)));
  const legalFlags = combinedEntities.filter(
    (entity) => entity.procesoJud || entity.situacionJuridica || entity.irrecDisposicionTecnica,
  ).length;
  const refinanceFlags = combinedEntities.filter((entity) => entity.refinanciaciones || entity.recategorizacionOblig).length;
  const incomeEstimate = buildIncomeReference(applicant);
  const monthlyBurden = incomeEstimate.estimatedIncome > 0 ? totalDebt / incomeEstimate.estimatedIncome : 0;
  const debtTrend = timeline.length >= 2 && timeline[timeline.length - 1].debt > 0
    ? (timeline[0].debt - timeline[timeline.length - 1].debt) / timeline[timeline.length - 1].debt
    : 0;
  const regulatorySituationScore = maxSituation === 1
    ? 100
    : maxSituation === 2
      ? 60
      : maxSituation === 3
        ? 34
        : maxSituation === 4
          ? 16
          : 4;

  const factors = [
    factor(
      'trayectoria-bcra',
      'Trayectoria BCRA',
      clamp((periodsCount / 18) * 100 - refinanceFlags * 4, 20, 100),
      100,
      `${periodsCount} períodos disponibles en el historial y ${refinanceFlags} marcas de refinanciación/recategorización.`,
    ),
    factor(
      'situacion-regulatoria',
      'Situacion regulatoria',
      regulatorySituationScore,
      100,
      `Peor situacion observada: ${maxSituation} (${getSituationLabel(maxSituation)}).`,
    ),
    factor(
      'comportamiento-reciente',
      'Comportamiento reciente',
      112 - maxSituation * 18 - overdueDays * 0.45,
      100,
      `La foto más reciente combina situación máxima ${maxSituation} y atraso máximo de ${overdueDays} días.`,
    ),
    factor(
      'evolucion-deuda',
      'Evolución de deuda',
      75 - debtTrend * 60,
      100,
      debtTrend > 0
        ? `La deuda reciente está ${(debtTrend * 100).toFixed(0)}% por encima del inicio del historial observado.`
        : `La deuda reciente está ${Math.abs(debtTrend * 100).toFixed(0)}% por debajo del inicio del historial observado.`,
    ),
    factor(
      'carga-estimada',
      'Carga estimada',
      100 - clamp(monthlyBurden * 100, 0, 92),
      100,
      `La deuda vigente representa ${(monthlyBurden * 100).toFixed(0)}% del ingreso mensual declarado.`,
    ),
    factor(
      'historial-pagos',
      'Historial de pagos',
      104 - (averageSituation - 1) * 24 - rejectedChecks * 10,
      100,
      `Situación promedio ${averageSituation.toFixed(1)} y ${rejectedChecks} cheque(s) rechazado(s) detectado(s).`,
    ),
    factor(
      'concentracion',
      'Concentración de entidades',
      entitiesCount === 0 ? 75 : 100 - clamp((entitiesCount - 2) * 8, 0, 48),
      100,
      `${entitiesCount} entidades informantes en el historial consultado.`,
    ),
    factor(
      'alertas-legales',
      'Alertas legales y técnicas',
      100 - clamp(legalFlags * 16 + rejectedChecks * 6, 0, 100),
      100,
      `${legalFlags} alerta(s) legales/técnicas y ${rejectedChecks} registro(s) de cheques rechazados.`,
    ),
  ];

  const weightedScore = factors.reduce((sum, item) => sum + item.value, 0) / factors.length;
  const finalScore = Math.round(clamp(300 + weightedScore * 5.4 - Math.log10(historicDebt + 1) * 6 - (maxSituation > 1 ? 18 : 0), 300, 850));
  const rating = finalScore >= 760 ? 'Excelente' : finalScore >= 680 ? 'Bueno' : finalScore >= 580 ? 'Medio' : 'Riesgo alto';
  const summary = maxSituation > 1
    ? 'La lectura publica del BCRA ya muestra una situacion distinta de 1, por lo que la evaluacion preliminar debe considerarse riesgosa.'
    : finalScore >= 680
    ? 'La lectura pública del BCRA muestra un comportamiento razonablemente sano para una evaluación preliminar.'
    : 'La lectura pública del BCRA deja alertas que conviene revisar antes de tomar una decisión crediticia.';

  return {
    score: finalScore,
    rating,
    summary,
    factors,
    alerts: buildAlerts(maxSituation, rejectedChecks, legalFlags, overdueDays, monthlyBurden, timeline),
    timeline,
    entities,
    incomeEstimate,
    stats: {
      totalDebt,
      currentDebt: totalDebt,
      averageDebt,
      peakDebt,
      maxSituation,
      averageSituation,
      entitiesCount,
      periodsCount,
      monthlyBurden,
      rejectedChecks,
      overdueDays,
    },
  };
}
