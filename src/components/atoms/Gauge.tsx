import { Box, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import ReportGmailerrorredRoundedIcon from '@mui/icons-material/ReportGmailerrorredRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

interface GaugeProps {
  score: number;
  rating: string;
}

function getTone(rating: string) {
  if (rating === 'Excelente') return { color: 'success.main', icon: <VerifiedRoundedIcon fontSize="small" /> };
  if (rating === 'Bueno') return { color: 'info.main', icon: <CheckCircleRoundedIcon fontSize="small" /> };
  if (rating === 'Medio') return { color: 'warning.main', icon: <WarningAmberRoundedIcon fontSize="small" /> };
  return { color: 'error.main', icon: <ReportGmailerrorredRoundedIcon fontSize="small" /> };
}

export function Gauge({ score, rating }: GaugeProps) {
  const percent = Math.max(0, Math.min(100, ((score - 300) / 550) * 100));
  const tone = getTone(rating);

  return (
    <Stack spacing={2.25} aria-label={`Score ${score}`} sx={{ alignItems: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress variant="determinate" value={100} size={220} thickness={4} sx={{ color: 'rgba(148,163,184,0.14)' }} />
        <CircularProgress variant="determinate" value={percent} size={220} thickness={4} sx={{ color: tone.color, position: 'absolute', left: 0 }} />
        <Stack spacing={1} sx={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 900 }}>{score}</Typography>
          <Chip icon={tone.icon} label={rating} color={rating === 'Excelente' ? 'success' : rating === 'Bueno' ? 'info' : rating === 'Medio' ? 'warning' : 'error'} variant="outlined" />
        </Stack>
      </Box>
      <Typography variant="body2" color="text.secondary">Escala orientativa de 300 a 850</Typography>
    </Stack>
  );
}
