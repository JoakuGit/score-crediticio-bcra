import type { BcraResponse, CheckResult, DebtResult } from './types';

const BCRA_BASE_URL = 'https://api.bcra.gob.ar/centraldedeudores/v1.0';

async function requestBcra<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BCRA_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
    signal,
  });

  const payload = (await response.json().catch(() => ({}))) as BcraResponse<T>;

  if (!response.ok) {
    const message = payload.errorMessages?.join(' ') || `El BCRA respondió con estado ${response.status}.`;
    throw new Error(message);
  }

  if (!payload.results) {
    throw new Error('La consulta no devolvió resultados para esa identificación.');
  }

  return payload.results;
}

export async function fetchDebtReport(identification: string, signal?: AbortSignal) {
  return requestBcra<DebtResult>(`/Deudas/${identification}`, signal);
}

export async function fetchHistoricDebtReport(identification: string, signal?: AbortSignal) {
  return requestBcra<DebtResult>(`/Deudas/Historicas/${identification}`, signal);
}

export async function fetchRejectedChecks(identification: string, signal?: AbortSignal) {
  return requestBcra<CheckResult>(`/Deudas/ChequesRechazados/${identification}`, signal);
}
