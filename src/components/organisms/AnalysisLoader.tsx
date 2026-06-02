import { Alert, Card, CardContent, LinearProgress, Skeleton, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import RadarRoundedIcon from '@mui/icons-material/RadarRounded';

interface AnalysisLoaderProps {
  stages: string[];
  activeStage: number;
}

export function AnalysisLoader({ stages, activeStage }: AnalysisLoaderProps) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <RadarRoundedIcon color="primary" />
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Armando resultado crediticio</Typography>
            <Typography variant="body2" color="text.secondary">Se consulta la API del BCRA y luego se sintetizan las señales relevantes.</Typography>
          </Stack>
        </Stack>

        <Alert severity="info">Consulta en progreso. No cierres la pagina hasta terminar.</Alert>

        <LinearProgress />

        <Stack spacing={1.25}>
          <Skeleton variant="rounded" height={92} />
          <Skeleton variant="rounded" height={18} width="72%" />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Skeleton variant="rounded" height={90} sx={{ flex: 1 }} />
            <Skeleton variant="rounded" height={90} sx={{ flex: 1 }} />
            <Skeleton variant="rounded" height={90} sx={{ flex: 1 }} />
          </Stack>
        </Stack>

        <Stepper activeStep={Math.max(activeStage, 0)} alternativeLabel sx={{ display: { xs: 'none', md: 'flex' } }}>
          {stages.map((stage) => (
            <Step key={stage}>
              <StepLabel>{stage}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Stack spacing={1}>
          {stages.map((stage, index) => (
            <Alert key={stage} severity={index < activeStage ? 'success' : index === activeStage ? 'info' : 'warning'}>
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 700 }}>{stage}</Typography>
                <Typography variant="body2" color={index < activeStage ? 'success.main' : index === activeStage ? 'primary.light' : 'text.secondary'}>
                  {index < activeStage ? 'Completado' : index === activeStage ? 'En progreso' : 'Pendiente'}
                </Typography>
              </Stack>
            </Alert>
          ))}
        </Stack>
      </Stack>
      </CardContent>
    </Card>
  );
}
