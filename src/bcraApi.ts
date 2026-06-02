import type { BcraResponse, CheckResult, DebtResult } from './types';

const BCRA_BASE_URL = '/api/bcra';
const REQUEST_TIMEOUT = 30000; // 30 segundos
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestBcra<T>(path: string, signal?: AbortSignal): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    let timeoutId: number | undefined;

    try {
      // Crear un timeout controller que se combine con el signal existente
      const timeoutController = new AbortController();
      timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT);

      // Combinar señales de abort (si existe signal externo + timeout interno)
      const combinedSignal = signal ? createCombinedSignal(signal, timeoutController.signal) : timeoutController.signal;

      const response = await fetch(`${BCRA_BASE_URL}${path}`, {
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: combinedSignal,
        // Agregar keepalive para evitar resets
        keepalive: true,
      });

      clearTimeout(timeoutId);

      const payload = (await response.json().catch(() => ({}))) as BcraResponse<T>;

      if (!response.ok) {
        const message = payload.errorMessages?.join(' ') || `El BCRA respondió con estado ${response.status}.`;
        throw new Error(message);
      }

      if (!payload.results) {
        throw new Error('La consulta no devolvió resultados para esa identificación.');
      }

      return payload.results;
    } catch (error) {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      lastError = error instanceof Error ? error : new Error('Error desconocido');

      // Si fue abortado por el usuario, no reintentar
      if (signal?.aborted) {
        throw lastError;
      }

      // Si fue un error de red o timeout, reintentar
      const isNetworkError = error instanceof TypeError || (error instanceof Error && error.name === 'AbortError') || (error instanceof Error && error.message.includes('fetch'));

      if (isNetworkError && attempt < MAX_RETRIES - 1) {
        console.warn(`Reintento ${attempt + 1}/${MAX_RETRIES} para ${path}:`, lastError.message);
        await delay(RETRY_DELAY * (attempt + 1)); // Backoff exponencial
        continue;
      }

      // Si no es un error de red o ya no quedan reintentos, lanzar el error
      throw lastError;
    }
  }

  // Esto no debería alcanzarse, pero por seguridad
  throw lastError || new Error('Error desconocido al consultar el BCRA');
}

// Función helper para combinar señales de abort
function createCombinedSignal(signal1: AbortSignal, signal2: AbortSignal): AbortSignal {
  const controller = new AbortController();

  const abort = () => controller.abort();

  if (signal1.aborted || signal2.aborted) {
    controller.abort();
  } else {
    signal1.addEventListener('abort', abort, { once: true });
    signal2.addEventListener('abort', abort, { once: true });
  }

  return controller.signal;
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
