import { Card, CardContent, Stack, Typography } from '@mui/material';

interface MetricCardProps {
  label: string;
  value: string;
  hint: string;
}

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <Card variant="outlined" sx={{ minHeight: 120, minWidth: { xs: '100%', sm: 220 }, flex: 1 }}>
      <CardContent>
      <Stack spacing={0.75}>
        <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{hint}</Typography>
      </Stack>
      </CardContent>
    </Card>
  );
}
