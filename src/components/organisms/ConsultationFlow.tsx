import type { FormEvent } from 'react';
import { Alert, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { Button } from '../atoms/Button';
import type { ApplicantInputs } from '../../types';

interface ConsultationFlowProps {
  identification: string;
  applicant: ApplicantInputs;
  loading: boolean;
  error: string;
  canContinue: boolean;
  onIdentificationChange: (value: string) => void;
  onApplicantChange: (value: ApplicantInputs) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLoadDemo: () => void;
}

export function ConsultationFlow({
  identification,
  applicant,
  loading,
  error,
  canContinue,
  onIdentificationChange,
  onApplicantChange,
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

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Edad"
            type="number"
            value={applicant.edad}
            onChange={(event) => onApplicantChange({ ...applicant, edad: Number(event.target.value) })}
            inputProps={{ min: 18, max: 100 }}
            fullWidth
          />
          <TextField
            label="Ingreso mensual"
            type="number"
            value={applicant.ingresoMensual}
            onChange={(event) => onApplicantChange({ ...applicant, ingresoMensual: Number(event.target.value) })}
            inputProps={{ min: 0, step: 10000 }}
            fullWidth
          />
        </Stack>

        <Alert severity="info" icon={<AutoAwesomeRoundedIcon fontSize="inherit" />}>
          El calculo usa datos del BCRA y toma como referencia manual la edad y el ingreso mensual que declares.
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
