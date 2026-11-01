const API_URL = import.meta.env.PROD ? import.meta.env.VITE_BACKEND_URL : '';

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`Errore API: ${response.status}`);
  }

  return response.json();
}