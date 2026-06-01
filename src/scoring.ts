import type { ApplicantInputs, CheckResult, DebtEntity, DebtResult, ScoreFactor, ScoreResult } from './types';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const money = (value: number) => Number.isFinite(value) ? value : 0;

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

export function calculateScore(
  current: DebtResult | undefined,
  historic: DebtResult | undefined,
  checks: CheckResult | undefined,
  applicant: ApplicantInputs,
): ScoreResult {
  const currentEntities = latestEntities(current);
  const historicEntities = allEntities(historic);
  const combinedEntities = historicEntities.length ? historicEntities : allEntities(current);
  const periodsCount = historic?.periodos?.length || current?.periodos?.length || 0;
  const entitiesCount = new Set(combinedEntities.map((entity) => entity.entidad).filter(Boolean)).size;
  const totalDebt = currentEntities.reduce((sum, entity) => sum + money(entity.monto ?? 0), 0);
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
  const monthlyBurden = applicant.ingresosMensuales > 0 ? totalDebt / applicant.ingresosMensuales : totalDebt > 0 ? 4 : 0;

  const factors = [
    factor(
      'antiguedad',
      'Antigüedad',
      clamp((periodsCount / 24) * 72 + (applicant.antiguedadLaboralMeses / 60) * 28, 0, 100),
      100,
      `${periodsCount} períodos BCRA y ${applicant.antiguedadLaboralMeses} meses de actividad declarada.`,
    ),
    factor(
      'estabilidad',
      'Estabilidad',
      (applicant.empleoEstable ? 62 : 35) + clamp(applicant.antiguedadLaboralMeses, 0, 48) * 0.8 - refinanceFlags * 7,
      100,
      applicant.empleoEstable ? 'Actividad estable declarada, ajustada por refinanciaciones.' : 'Actividad no estable o independiente, ajustada por refinanciaciones.',
    ),
    factor(
      'utilizacion',
      'Utilización',
      100 - clamp(monthlyBurden * 100, 0, 95),
      100,
      `Deuda informada actual equivalente a ${(monthlyBurden * 100).toFixed(0)}% del ingreso mensual declarado.`,
    ),
    factor(
      'historial',
      'Historial de pagos',
      100 - (averageSituation - 1) * 18 - rejectedChecks * 7 - overdueDays * 0.35,
      100,
      `Situación promedio ${averageSituation.toFixed(1)}, ${rejectedChecks} cheques rechazados y ${overdueDays} días máximos de atraso.`,
    ),
    factor(
      'edad',
      'Edad estimada',
      applicant.edad < 21 ? 40 : applicant.edad < 28 ? 70 : applicant.edad <= 65 ? 92 : 74,
      100,
      `Edad ingresada: ${applicant.edad} años. Se pondera madurez financiera esperada, sin validar identidad.`,
    ),
    factor(
      'ingresos',
      'Ingresos estimados',
      clamp((applicant.ingresosMensuales / 1_600_000) * 100, 20, 100) - clamp(totalDebt / 500_000, 0, 35),
      100,
      `Ingreso mensual declarado contra deuda vigente de $${Math.round(totalDebt).toLocaleString('es-AR')}.`,
    ),
    factor(
      'estres',
      'Estrés financiero',
      100 - clamp(monthlyBurden * 85 + rejectedChecks * 10 + legalFlags * 16, 0, 100),
      100,
      `Combina carga deuda/ingreso, cheques rechazados y alertas judiciales o técnicas.`,
    ),
    factor(
      'entidades',
      'Entidades financieras',
      entitiesCount === 0 ? 75 : 100 - clamp((entitiesCount - 2) * 9, 0, 55),
      100,
      `${entitiesCount} entidades informantes detectadas en el historial consultado.`,
    ),
    factor(
      'situacion',
      'Situación crediticia',
      110 - maxSituation * 18 - legalFlags * 10,
      100,
      `Peor situación BCRA observada: ${maxSituation}. ${legalFlags} alertas legales/técnicas.`,
    ),
  ];

  const weightedScore = factors.reduce((sum, item) => sum + item.value, 0) / factors.length;
  const finalScore = Math.round(clamp(300 + weightedScore * 5.5 - Math.log10(historicDebt + 1) * 6, 300, 850));
  const rating = finalScore >= 760 ? 'Excelente' : finalScore >= 680 ? 'Bueno' : finalScore >= 580 ? 'Medio' : 'Riesgo alto';
  const summary = finalScore >= 680
    ? 'Perfil con señales mayormente saludables según los datos públicos y los supuestos cargados.'
    : 'Perfil con alertas relevantes: conviene revisar mora, carga mensual o concentración de entidades.';

  return {
    score: finalScore,
    rating,
    summary,
    factors,
    stats: {
      totalDebt,
      currentDebt: totalDebt,
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
