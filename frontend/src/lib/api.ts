const API_URL = import.meta.env.PROD ? import.meta.env.VITE_BACKEND_URL : '';

type SlowListener = (isSlow: boolean, wasWakingUp: boolean) => void;
const listeners = new Set<SlowListener>();

/**
 * Allows components/contexts to listen for when a backend request
 * takes longer than a few seconds (a typical symptom of a Render cold start).
 */
export function subscribeServerWakeup(listener: SlowListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let activeRequests = 0;
let slowTimer: ReturnType<typeof setTimeout> | null = null;
let isCurrentlySlow = false;

function notifyListeners(isSlow: boolean, wasWakingUp: boolean) {
  listeners.forEach((fn) => {
    try {
      fn(isSlow, wasWakingUp);
    } catch (e) {
      console.error('Error in server wakeup listener:', e);
    }
  });
}

function requestStarted() {
  activeRequests++;
  if (activeRequests === 1 && !slowTimer && !isCurrentlySlow) {
    // If the request takes longer than 2.5 seconds, indicate a possible server startup.    
    slowTimer = setTimeout(() => {
      if (activeRequests > 0) {
        isCurrentlySlow = true;
        notifyListeners(true, false);
      }
    }, 2500);
  }
}

function requestEnded() {
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) {
    if (slowTimer) {
      clearTimeout(slowTimer);
      slowTimer = null;
    }
    if (isCurrentlySlow) {
      isCurrentlySlow = false;
      notifyListeners(false, true); // woke up successfully
    }
  }
}

/**
 * Performs a fast ping to the /api/health endpoint of the backend.
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      credentials: 'include',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Unified function per le chiamate API con supporto a cookie HttpOnly e
 * retry automatico in caso di 502/503 o errore di rete tipico del cold-start su Render.
 */
export async function apiFetch(endpoint: string, options?: RequestInit, retries = 2): Promise<any> {
  requestStarted();
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include',
      ...options,
    });

    // If render return 502 Bad Gateway or 503 while the container starts, retry after a short wait
    if ((response.status === 502 || response.status === 503) && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return apiFetch(endpoint, options, retries - 1);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      console.error('API Error:', { status: response.status, data: errorData });
      throw new Error(errorData?.message || `Errore API: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // Failed to fetch typical when Render has not yet opened the socket
    if (retries > 0 && error instanceof TypeError) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return apiFetch(endpoint, options, retries - 1);
    }
    throw error;
  } finally {
    requestEnded();
  }
}
