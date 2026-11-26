const API_URL = import.meta.env.PROD ? import.meta.env.VITE_BACKEND_URL : '';

/**
 * Funzione unificata per le chiamate API con supporto a cookie HttpOnly.
 */
export async function apiFetch(endpoint: string, options?: RequestInit): Promise<any> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    console.error('API Error:', { status: response.status, data: errorData });
    throw new Error(errorData?.message || `Errore API: ${response.status}`);
  }

  return response.json();
}
