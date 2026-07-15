import { CONFIG } from './config.js';
import { state, AuthRequiredError } from './state.js';
import { apiGet, normalizeList } from './api.js';
import { saveCache, getCached } from './storage.js';
import { els } from './dom.js';
import { showOfflineBanner, hideOfflineBanner } from './render.js';
import { populateFilterOptions, applyFiltersAndRender } from './filters.js';

// =========================================================
// DATA LOADER: carga /get/games y /get/stadiums de forma
// INDEPENDIENTE. Cada uno tiene su propio try/catch y su
// propio fallback a caché. Nunca se usa Promise.all, así que
// si uno falla el otro sigue funcionando con normalidad.
// =========================================================

// Se registra desde main.js para no crear un import circular
// entre este módulo y authModal.js.
let authRequiredHandler = () => {};
export function registerAuthHandler(fn) {
  authRequiredHandler = fn;
}

export async function loadGames() {
  try {
    const raw = await apiGet(CONFIG.ENDPOINTS.GAMES);
    const games = normalizeList(raw);
    state.games = games;
    saveCache(CONFIG.STORAGE_KEYS.CACHE_GAMES, games);
    hideOfflineBanner();
    return true;
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      authRequiredHandler(loadGames);
      return false;
    }
    console.warn('Fallo al cargar partidos, usando caché:', err.message);
    state.games = getCached(CONFIG.STORAGE_KEYS.CACHE_GAMES) || [];
    showOfflineBanner();
    return false;
  }
}

export async function loadStadiums() {
  try {
    const raw = await apiGet(CONFIG.ENDPOINTS.STADIUMS);
    const stadiums = normalizeList(raw);
    state.stadiums = stadiums;
    state.stadiumById = Object.fromEntries(stadiums.map(s => [String(s.id), s]));
    saveCache(CONFIG.STORAGE_KEYS.CACHE_STADIUMS, stadiums);
    return true;
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      authRequiredHandler(loadStadiums);
      return false;
    }
    console.warn('Fallo al cargar estadios, usando caché:', err.message);
    const cached = getCached(CONFIG.STORAGE_KEYS.CACHE_STADIUMS) || [];
    state.stadiums = cached;
    state.stadiumById = Object.fromEntries(cached.map(s => [String(s.id), s]));
    showOfflineBanner();
    return false;
  }
}

export async function loadAllData() {
  els.loader.classList.remove('hidden');

  // Llamadas independientes: si /get/games falla, /get/stadiums
  // se ejecuta igual (y viceversa). Sin Promise.all.
  const gamesOk = await loadGames();
  const stadiumsOk = await loadStadiums();

  els.loader.classList.add('hidden');

  if (gamesOk || stadiumsOk || state.games.length || state.stadiums.length) {
    populateFilterOptions();
    applyFiltersAndRender();
  }
}