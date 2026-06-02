import { FormEvent, useEffect, useState } from 'react';
import { Alert, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { fetchDebtReport, fetchHistoricDebtReport, fetchRejectedChecks } from '../bcraApi';
import { calculateScore } from '../scoring';
import type { CheckResult, DebtResult, ScoreResult } from '../types';
import { AnalysisLoader } from '../components/organisms/AnalysisLoader';
import { ConsultationFlow } from '../components/organisms/ConsultationFlow';
import { ResultPanel } from '../components/organisms/ResultPanel';

const SESSION_KEY = 'score-bcra-session';

const sampleCurrent: DebtResult = {
  identificacion: 20123456789,
  denominacion: 'EJEMPLO DEMO',
  periodos: [{ periodo: '202405', entidades: [{ entidad: 'Banco Demo', situacion: 1, monto: 4432, diasAtrasoPago: 0 }] }],
};

const sampleHistoric: DebtResult = {
  ...sampleCurrent,
  periodos: [
    { periodo: '202405', entidades: [{ entidad: 'Banco Demo', situacion: 1, monto: 4432 }] },
    { periodo: '202404', entidades: [{ entidad: 'Banco Demo', situacion: 1, monto: 4210 }] },
    { periodo: '202403', entidades: [{ entidad: 'Fintech Demo', situacion: 2, monto: 1800 }] },
    { periodo: '202402', entidades: [{ entidad: 'Banco Demo', situacion: 1, monto: 3980 }] },
    { periodo: '202401', entidades: [{ entidad: 'Tarjeta Demo', situacion: 1, monto: 1200 }] },
  ],
};

const sampleChecks: CheckResult = {
  identificacion: 20123456789,
  denominacion: 'EJEMPLO DEMO',
  causales: [{ causal: 'Sin fondos', entidades: [{ entidad: 1, detalle: [{ nroCheque: 1001, monto: 450, fechaRechazo: '2024-03-10' }] }] }],
};

const loaderStages = [
  'Consultando deuda actual',
  'Leyendo historial BCRA',
  'Buscando cheques rechazados',
  'Armando score final',
];

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

interface PersistedSession {
  identification: string;
  personName: string;
  result: ScoreResult | null;
}

function readSession(): PersistedSession | null {
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

export function CalculatorPage() {
  const persisted = typeof window !== 'undefined' ? readSession() : null;
  const [identification, setIdentification] = useState(persisted?.identification ?? '');
  const [result, setResult] = useState<ScoreResult | null>(persisted?.result ?? null);
  const [personName, setPersonName] = useState(persisted?.personName ?? '');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(-1);
  const [error, setError] = useState('');

  const canContinue = identification.replace(/\D/g, '').length >= 8;

  useEffect(() => {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ identification, personName, result }));
  }, [identification, personName, result]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setLoadingStage(0);

    try {
      const cleanId = identification.replace(/\D/g, '');
      if (cleanId.length < 8) {
        throw new Error('Ingresá un CUIT, CUIL o CDI válido, solo con números.');
      }

      await delay(300);
      const current = await fetchDebtReport(cleanId);

      setLoadingStage(1);
      await delay(300);
      const historic = await fetchHistoricDebtReport(cleanId);

      setLoadingStage(2);
      await delay(250);
      const checks = await fetchRejectedChecks(cleanId).catch(() => undefined);

      setLoadingStage(3);
      await delay(300);

      const name = current.denominacion || historic.denominacion || 'Persona consultada';
      setPersonName(name);
      setResult(calculateScore(current, historic, checks));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo consultar el servicio del BCRA.');
      setResult(null);
    } finally {
      setLoading(false);
      setLoadingStage(-1);
    }
  }

  function loadDemo() {
    setIdentification('20123456789');
    setPersonName('EJEMPLO DEMO');
    setResult(calculateScore(sampleCurrent, sampleHistoric, sampleChecks));
    setError('');
  }

  function resetQuery() {
    setResult(null);
    setPersonName('');
    setError('');
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Stack spacing={2}>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>Kodra Score Crediticio</Typography>
            <Typography variant="h5" color="primary.main">Evalua riesgo crediticio en segundos</Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 820 }}>
              Algoritmo simple basado en la API publica del BCRA: consulta los datos disponibles y entrega una referencia orientativa para dar creditos o prestar dinero personalmente identificando el riesgo.
            </Typography>
            <Alert severity="info">Consulta deuda actual, historial, situacion, atraso y alertas publicas del BCRA.</Alert>
          </Stack>
          </CardContent>
        </Card>

        {loading ? (
          <AnalysisLoader stages={loaderStages} activeStage={loadingStage} />
        ) : result ? (
          <ResultPanel result={result} personName={personName} onReset={resetQuery} />
        ) : (
          <Stack spacing={3}>
            <ConsultationFlow
              identification={identification}
              loading={loading}
              error={error}
              canContinue={canContinue}
              onIdentificationChange={setIdentification}
              onSubmit={handleSubmit}
              onLoadDemo={loadDemo}
            />

            <ResultPanel result={null} personName="" onReset={resetQuery} />
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
