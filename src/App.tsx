import { FormEvent, useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BadgeCheck, BarChart3, Building2, Calculator, CheckCircle2, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { fetchDebtReport, fetchHistoricDebtReport, fetchRejectedChecks } from './bcraApi';
import { calculateScore } from './scoring';
import type { ApplicantInputs, CheckResult, DebtResult, ScoreResult } from './types';

const initialApplicant: ApplicantInputs = {
  edad: 34,
  ingresosMensuales: 950000,
  antiguedadLaboralMeses: 36,
  empleoEstable: true,
};

const sampleCurrent: DebtResult = {
  identificacion: 20123456789,
  denominacion: 'EJEMPLO DEMO',
  periodos: [{ periodo: '202405', entidades: [{ entidad: 'Banco Demo', situacion: 1, monto: 180000, diasAtrasoPago: 0 }] }],
};

const sampleHistoric: DebtResult = {
  ...sampleCurrent,
  periodos: [
    { periodo: '202405', entidades: [{ entidad: 'Banco Demo', situacion: 1, monto: 180000 }] },
    { periodo: '202404', entidades: [{ entidad: 'Banco Demo', situacion: 1, monto: 210000 }] },
    { periodo: '202403', entidades: [{ entidad: 'Fintech Demo', situacion: 2, monto: 80000 }] },
    { periodo: '202402', entidades: [{ entidad: 'Banco Demo', situacion: 1, monto: 240000 }] },
  ],
};

const sampleChecks: CheckResult = { identificacion: 20123456789, denominacion: 'EJEMPLO DEMO', causales: [] };

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark"><BarChart3 size={22} /></span>
          <span>Score BCRA</span>
        </Link>
        <nav>
          <NavLink to="/">Calculadora</NavLink>
          <NavLink to="/metodologia">Metodología</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<CalculatorPage />} />
        <Route path="/metodologia" element={<MethodologyPage />} />
      </Routes>
    </div>
  );
}

function CalculatorPage() {
  const [identification, setIdentification] = useState('');
  const [applicant, setApplicant] = useState<ApplicantInputs>(initialApplicant);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [personName, setPersonName] = useState('Demo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const cleanId = identification.replace(/\D/g, '');
      if (cleanId.length < 8) {
        throw new Error('Ingresá un CUIT, CUIL o CDI válido, solo con números.');
      }

      const [current, historic, checks] = await Promise.all([
        fetchDebtReport(cleanId),
        fetchHistoricDebtReport(cleanId),
        fetchRejectedChecks(cleanId).catch(() => undefined),
      ]);

      setPersonName(current.denominacion || historic.denominacion || 'Persona consultada');
      setResult(calculateScore(current, historic, checks, applicant));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo consultar el servicio del BCRA.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function loadDemo() {
    setIdentification('20123456789');
    setPersonName('EJEMPLO DEMO');
    setResult(calculateScore(sampleCurrent, sampleHistoric, sampleChecks, applicant));
    setError('');
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={16} /> Scoring orientativo 100% frontend</span>
          <h1>Calculá un score crediticio simple con datos públicos de la Central de Deudores.</h1>
          <p>
            Consultá CUIT/CUIL/CDI contra la API del BCRA desde el navegador y combiná deuda, situación, entidades,
            historial y supuestos de ingresos para obtener una lectura clara para clientes.
          </p>
          <div className="hero-actions">
            <a href="#calculadora" className="button primary">Empezar <ArrowRight size={18} /></a>
            <Link to="/metodologia" className="button ghost">Ver algoritmo</Link>
          </div>
        </div>
        <div className="hero-card">
          <ShieldCheck size={34} />
          <strong>Sin backend propio</strong>
          <span>La aplicación es CSR y no almacena identificaciones ni resultados.</span>
        </div>
      </section>

      <section id="calculadora" className="workspace">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-title">
            <Calculator />
            <div>
              <h2>Datos de consulta</h2>
              <p>La API del BCRA requiere identificación fiscal numérica.</p>
            </div>
          </div>

          <label>
            CUIT / CUIL / CDI
            <input value={identification} onChange={(event) => setIdentification(event.target.value)} inputMode="numeric" placeholder="Ej: 20123456789" />
          </label>

          <div className="grid-2">
            <label>
              Edad estimada
              <input type="number" min="18" max="99" value={applicant.edad} onChange={(event) => setApplicant({ ...applicant, edad: Number(event.target.value) })} />
            </label>
            <label>
              Ingresos mensuales estimados
              <input type="number" min="0" step="50000" value={applicant.ingresosMensuales} onChange={(event) => setApplicant({ ...applicant, ingresosMensuales: Number(event.target.value) })} />
            </label>
          </div>

          <div className="grid-2">
            <label>
              Antigüedad laboral (meses)
              <input type="number" min="0" max="600" value={applicant.antiguedadLaboralMeses} onChange={(event) => setApplicant({ ...applicant, antiguedadLaboralMeses: Number(event.target.value) })} />
            </label>
            <label className="switch-row">
              <span>Actividad estable</span>
              <input type="checkbox" checked={applicant.empleoEstable} onChange={(event) => setApplicant({ ...applicant, empleoEstable: event.target.checked })} />
            </label>
          </div>

          {error && <div className="alert"><AlertTriangle size={18} /> {error}</div>}

          <div className="form-actions">
            <button className="button primary" disabled={loading} type="submit">{loading ? 'Consultando...' : 'Consultar BCRA'}</button>
            <button className="button ghost" type="button" onClick={loadDemo}>Usar demo</button>
          </div>
        </form>

        <ScorePanel result={result} personName={personName} />
      </section>
    </main>
  );
}

function ScorePanel({ result, personName }: { result: ScoreResult | null; personName: string }) {
  const circumference = 2 * Math.PI * 88;
  const percent = result ? (result.score - 300) / 550 : 0;
  const dashOffset = circumference * (1 - percent);

  return (
    <section className="panel score-panel">
      {!result ? (
        <div className="empty-state">
          <FileText size={52} />
          <h2>Resultado listo para presentar</h2>
          <p>Completá la identificación y supuestos básicos, o cargá el caso demo para ver la UI final.</p>
        </div>
      ) : (
        <>
          <div className="score-header">
            <div>
              <span className="muted">Resultado para</span>
              <h2>{personName}</h2>
              <p>{result.summary}</p>
            </div>
            <span className="rating"><BadgeCheck size={16} /> {result.rating}</span>
          </div>

          <div className="score-layout">
            <div className="gauge" aria-label={`Score ${result.score}`}>
              <svg viewBox="0 0 220 220">
                <circle cx="110" cy="110" r="88" className="track" />
                <circle cx="110" cy="110" r="88" className="progress" strokeDasharray={circumference} strokeDashoffset={dashOffset} />
              </svg>
              <div className="gauge-number">
                <strong>{result.score}</strong>
                <span>de 850</span>
              </div>
            </div>

            <div className="stats-grid">
              <Stat label="Deuda actual" value={`$${Math.round(result.stats.currentDebt).toLocaleString('es-AR')}`} />
              <Stat label="Entidades" value={result.stats.entitiesCount.toString()} />
              <Stat label="Peor situación" value={result.stats.maxSituation.toString()} />
              <Stat label="Carga/ingreso" value={`${(result.stats.monthlyBurden * 100).toFixed(0)}%`} />
            </div>
          </div>

          <div className="factor-list">
            {result.factors.map((item) => (
              <article className="factor" key={item.key}>
                <div className="factor-top">
                  <strong>{item.label}</strong>
                  <span className={item.status}>{item.value}/{item.max}</span>
                </div>
                <div className="bar"><span style={{ width: `${(item.value / item.max) * 100}%` }} /></div>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MethodologyPage() {
  const factors = useMemo(() => [
    ['Antigüedad', 'Premia más períodos observables en BCRA y mayor antigüedad laboral declarada.'],
    ['Estabilidad', 'Suma por actividad estable y resta si aparecen refinanciaciones o recategorizaciones.'],
    ['Utilización', 'Compara deuda vigente informada contra ingresos mensuales estimados.'],
    ['Historial de pagos', 'Evalúa situación promedio, días de atraso y cheques rechazados.'],
    ['Edad estimada', 'Aporta un proxy simple de madurez financiera declarada por el usuario.'],
    ['Ingresos estimados', 'Pondera capacidad de pago frente a deuda corriente.'],
    ['Estrés financiero', 'Penaliza alta carga, cheques rechazados y alertas judiciales/técnicas.'],
    ['Entidades financieras', 'Mide concentración o dispersión de acreedores informantes.'],
    ['Situación crediticia', 'Penaliza la peor situación BCRA observada y banderas legales.'],
  ], []);

  return (
    <main className="method-page">
      <section className="panel methodology-hero">
        <CheckCircle2 size={36} />
        <h1>Metodología transparente y editable</h1>
        <p>
          El score va de 300 a 850 y es orientativo. No reemplaza una política crediticia formal ni constituye
          recomendación financiera. Está pensado para una experiencia simple de cliente, desplegable como sitio estático.
        </p>
      </section>

      <section className="method-grid">
        {factors.map(([title, description]) => (
          <article className="panel method-card" key={title}>
            <Building2 size={22} />
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;
