import { CONFIG } from './config.js';
import { state, AuthRequiredError } from './state.js';

export async function apiGet(path) {
  const headers = {};
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(`${CONFIG.API_BASE}${path}`, { headers });

  if (response.status === 401) {
    throw new AuthRequiredError('Token expirado o inválido');
  }
  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} en ${path}`);
  }
  return await response.json();
}

export async function apiAuth(path, payload) {
  const response = await fetch(`${CONFIG.API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'No se pudo autenticar');
  }
  return data;
}

export function normalizeList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    for (const value of Object.values(raw)) {
      if (Array.isArray(value)) return value;
    }
  }
  return [];
}