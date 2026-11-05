const API_URL = import.meta.env.PROD ? import.meta.env.VITE_BACKEND_URL : '';

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    console.error('API Error:', {
      status: response.status,
      data: errorData,
    });
    throw new Error(`Errore API: ${response.status}`);
  }

  return response.json();
}