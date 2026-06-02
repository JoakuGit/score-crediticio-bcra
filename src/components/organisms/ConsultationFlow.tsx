import type { FormEvent } from 'react';
import { Alert, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { Button } from '../atoms/Button';

interface ConsultationFlowProps {
  identification: string;
  loading: boolean;
  error: string;
  canContinue: boolean;
  onIdentificationChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLoadDemo: () => void;
}

export function ConsultationFlow({
  identification,
  loading,
  error,
  canContinue,
  onIdentificationChange,
  onSubmit,
  onLoadDemo,
}: ConsultationFlowProps) {
  return (
    <Card component="form" onSubmit={onSubmit}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <SearchRoundedIcon color="primary" />
          <BoxText title="Consulta BCRA" description="Ingresa una identificacion y obtene una lectura clara del riesgo crediticio." />
        </Stack>

        <TextField
          label="CUIT / CUIL / CDI"
          value={identification}
          onChange={(event) => onIdentificationChange(event.target.value)}
          inputMode="numeric"
          placeholder="Ej: 20123456789"
          fullWidth
        />

        <Alert severity="info" icon={<AutoAwesomeRoundedIcon fontSize="inherit" />}>
          El calculo usa deuda actual, historial, situacion, dias de atraso, observaciones y cheques rechazados publicados por el BCRA.
        </Alert>

        {error && <Alert severity="error">{error}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
          <Button variant="ghost" type="button" onClick={onLoadDemo}>Usar demo</Button>
          <Button type="submit" disabled={loading || !canContinue}>{loading ? 'Analizando...' : 'Consultar BCRA'}</Button>
        </Stack>
      </Stack>
      </CardContent>
    </Card>
  );
}

function BoxText({ title, description }: { title: string; description: string }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">{description}</Typography>
    </Stack>
  );
}
