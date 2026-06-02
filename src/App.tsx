import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { CalculatorPage } from './pages/CalculatorPage';
import { MethodologyPage } from './pages/MethodologyPage';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="sticky" color="primary" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 1.5, gap: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Box component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 42, height: 42, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.18)' }}>
                <ShieldRoundedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, lineHeight: 1.1 }}>Kodra Score Crediticio</Typography>
                <Typography variant="body2" sx={{ opacity: 0.84 }}>riesgo basado en BCRA</Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Button color="inherit" onClick={() => navigate('/')} variant={location.pathname === '/' ? 'outlined' : 'text'} sx={{ borderColor: 'rgba(255,255,255,0.45)' }}>
                Consulta
              </Button>
              <Button color="inherit" onClick={() => navigate('/metodologia')} variant={location.pathname === '/metodologia' ? 'outlined' : 'text'} sx={{ borderColor: 'rgba(255,255,255,0.45)' }}>
                Metodologia
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Routes>
        <Route path="/" element={<CalculatorPage />} />
        <Route path="/metodologia" element={<MethodologyPage />} />
      </Routes>
    </Box>
  );
}

export default App;
