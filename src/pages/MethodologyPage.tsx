import { Card, CardContent, Container, Stack, Typography } from '@mui/material';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';

const factors = [
  ['Trayectoria BCRA', 'Premia cantidad de períodos observables y castiga refinanciaciones o recategorizaciones.'],
  ['Situación regulatoria', 'Penaliza con fuerza la peor situación observada. Si la situación es distinta de 1, ya existe una señal de riesgo.'],
  ['Comportamiento reciente', 'Mide severidad actual usando situación y atraso de la última foto.'],
  ['Evolución de deuda', 'Compara el nivel de deuda reciente con el inicio del historial disponible.'],
  ['Carga estimada', 'Usa una referencia mensual conservadora inferida desde deuda, situación y atraso observados en BCRA.'],
  ['Historial de pagos', 'Penaliza situación promedio deteriorada y cheques rechazados.'],
  ['Concentración', 'Observa cuántas entidades informan deuda en el historial.'],
  ['Alertas legales', 'Resta por señales judiciales, técnicas o anomalías públicas.'],
];

export function MethodologyPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
            <ChecklistRoundedIcon color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 900 }}>Metodologia</Typography>
          </Stack>
          <Typography color="text.secondary">
            El score es orientativo y prioriza el historial publico del BCRA. Los montos se interpretan en miles de pesos,
            por lo que un valor como 4.432 se toma como $4.432.000. El algoritmo no pide edad ni datos manuales: se apoya solo en la informacion publicada por BCRA.
          </Typography>
          </CardContent>
        </Card>

        <Stack spacing={1.5}>
          {factors.map(([title, description]) => (
            <Card key={title} variant="outlined">
              <CardContent sx={{ p: 2.25 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                <AccountTreeRoundedIcon color="primary" sx={{ mt: 0.25 }} />
                <Stack spacing={0.5}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
                  <Typography variant="body2" color="text.secondary">{description}</Typography>
                </Stack>
              </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
