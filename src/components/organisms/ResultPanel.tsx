import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import ReportGmailerrorredRoundedIcon from '@mui/icons-material/ReportGmailerrorredRounded';
import { Gauge } from '../atoms/Gauge';
import { MetricCard } from '../atoms/MetricCard';
import { Button } from '../atoms/Button';
import { formatCurrency, formatPeriod } from '../../utils/format';
import type { ScoreResult } from '../../types';

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

function getRatingTone(rating: string) {
  if (rating === 'Excelente') return { color: 'success', icon: <VerifiedRoundedIcon fontSize="small" /> } as const;
  if (rating === 'Bueno') return { color: 'info', icon: <VerifiedRoundedIcon fontSize="small" /> } as const;
  if (rating === 'Medio') return { color: 'warning', icon: <WarningAmberRoundedIcon fontSize="small" /> } as const;
  return { color: 'error', icon: <ReportGmailerrorredRoundedIcon fontSize="small" /> } as const;
}

interface ResultPanelProps {
  result: ScoreResult | null;
  personName: string;
  onReset: () => void;
}

export function ResultPanel({ result, personName, onReset }: ResultPanelProps) {
  if (!result) {
      return (
      <Card>
        <CardContent sx={{ p: { xs: 2.5, md: 3 }, minHeight: 240, display: 'grid', alignContent: 'center' }}>
        <Stack spacing={1.5}>
          <Chip label="Vista previa" variant="outlined" sx={{ width: 'fit-content' }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>El informe aparecera aca</Typography>
          <Typography color="text.secondary">Consulta el BCRA para ver score, alertas, entidades y el historial detallado.</Typography>
        </Stack>
        </CardContent>
      </Card>
    );
  }

  const tone = getRatingTone(result.rating);

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">Resultado para</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>{personName}</Typography>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Chip icon={tone.icon} label={result.rating} color={tone.color} />
              <Chip label={`Peor situacion ${result.stats.maxSituation}`} variant="outlined" />
            </Stack>
            <Typography color="text.secondary">{result.summary}</Typography>
          </Stack>

          <Button variant="ghost" type="button" onClick={onReset} startIcon={<RestartAltRoundedIcon />}>Otra consulta</Button>
        </Stack>

        <Stack spacing={3}>
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={3}>
              <Gauge score={result.score} rating={result.rating} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                <MetricCard label="Ingreso mensual" value={formatCurrency(result.incomeEstimate.estimatedIncome)} hint="Dato manual declarado" />
                <MetricCard label="Deuda actual" value={formatCurrency(result.stats.currentDebt)} hint="Foto mas reciente" />
                <MetricCard label="Promedio historico" value={formatCurrency(result.stats.averageDebt)} hint={`${result.stats.periodsCount} periodos`} />
                <MetricCard label="Pico observado" value={formatCurrency(result.stats.peakDebt)} hint="Maximo del historial" />
                <MetricCard label="Peor situacion" value={String(result.stats.maxSituation)} hint="Mayor severidad BCRA" />
                <MetricCard label="Carga estimada" value={`${(result.stats.monthlyBurden * 100).toFixed(0)}%`} hint="Deuda / ingreso declarado" />
              </Stack>
            </Stack>
            </CardContent>
          </Card>

          <Section title="Factores del score" icon={<InsightsRoundedIcon color="primary" />}>
            <Stack spacing={1.5}>
              {result.factors.map((item) => (
                <Card key={item.key} variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1.25}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 800 }}>{item.label}</Typography>
                      <Chip label={`${item.value}/${item.max}`} color={item.status === 'good' ? 'success' : item.status === 'neutral' ? 'warning' : 'error'} size="small" />
                    </Stack>
                    <Divider />
                    <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                  </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Section>

          <Section title="Alertas publicas" icon={<WarningAmberRoundedIcon color="warning" />}>
            <Stack spacing={1.25}>
              {result.alerts.map((item) => <Alert severity="warning" key={item}>{item}</Alert>)}
            </Stack>
          </Section>

          <Section title="Ingreso mensual declarado" icon={<MonetizationOnRoundedIcon color="success" />}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2.25 }}>
              <Stack spacing={1}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>{formatCurrency(result.incomeEstimate.estimatedIncome)}</Typography>
                <Typography variant="body2" color="text.secondary">{result.incomeEstimate.description}</Typography>
              </Stack>
              </CardContent>
            </Card>
          </Section>

          <Section title="Entidades relevantes" icon={<AccountBalanceRoundedIcon color="info" />}>
            <Stack spacing={1.25}>
              {result.entities.map((item) => (
                <Card key={item.entity} variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 800 }}>{item.entity}</Typography>
                    <Chip label={`Situacion max. ${item.maxSituation}`} size="small" variant="outlined" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{formatCurrency(item.totalDebt)} acumulados en {item.periods} periodo(s).</Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Section>

          <Section title="Evolucion por periodo" icon={<TimelineRoundedIcon color="secondary" />}>
            <Alert severity="info">Monto en pesos segun registros BCRA. Dias de atraso y observaciones se muestran tal como surgen del registro publico; si no aplica, se informa N/A.</Alert>
            <Stack spacing={1.25}>
              {result.timeline.map((item) => (
                <Accordion key={item.period} disableGutters sx={{ borderRadius: '18px !important', overflow: 'hidden' }}>
                  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ width: '100%', pr: 1, justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 800 }}>{formatPeriod(item.period)}</Typography>
                      <Typography color="text.secondary">{formatCurrency(item.debt)}</Typography>
                      <Typography color="text.secondary">{item.entitiesCount} entidades</Typography>
                      <Chip size="small" label={`Situacion max. ${item.maxSituation}`} variant="outlined" />
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1.25}>
                      {(item.entities ?? []).map((entity) => (
                        <Card key={`${item.period}-${entity.entity}`} variant="outlined">
                          <CardContent sx={{ p: 2 }}>
                          <Stack spacing={1}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
                              <Typography sx={{ fontWeight: 800 }}>{entity.entity}</Typography>
                              <Chip size="small" label={getSituationLabel(entity.situation)} />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">Monto: {formatCurrency(entity.debt)}</Typography>
                            <Typography variant="body2" color="text.secondary">Dias atraso: {entity.overdueDays == null ? 'N/A' : entity.overdueDays}</Typography>
                            <Typography variant="body2" color="text.secondary">Situacion: {entity.situation}</Typography>
                            <Typography variant="body2" color="text.secondary">Observaciones: {entity.observations.join(', ')}</Typography>
                          </Stack>
                          </CardContent>
                        </Card>
                      ))}
                      {(!item.entities || item.entities.length === 0) && (
                        <Alert severity="info">Este registro guardado no incluye el detalle por entidad. Volve a consultar para regenerarlo con el formato nuevo.</Alert>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Section>
        </Stack>
      </Stack>
      </CardContent>
    </Card>
  );
}

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
        {icon}
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
      </Stack>
      {children}
    </Stack>
  );
}
