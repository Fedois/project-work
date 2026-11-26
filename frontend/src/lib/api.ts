const API_URL = import.meta.env.PROD ? import.meta.env.VITE_BACKEND_URL : '';

/**
 * Unified function for API calls with HttpOnly cookie support.
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
