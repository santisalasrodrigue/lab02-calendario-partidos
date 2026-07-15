import { CONFIG } from './config.js';
import { state } from './state.js';

// =========================================================
// STORAGE: toda la lectura/escritura de localStorage vive aquí
// =========================================================

export function loadFromStorage() {
  state.token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN) || null;

  const favRaw = localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES);
  state.favorites = new Set(favRaw ? JSON.parse(favRaw) : []);

  const cachedGames = localStorage.getItem(CONFIG.STORAGE_KEYS.CACHE_GAMES);
  const cachedStadiums = localStorage.getItem(CONFIG.STORAGE_KEYS.CACHE_STADIUMS);

  return {
    games: cachedGames ? JSON.parse(cachedGames) : null,
    stadiums: cachedStadiums ? JSON.parse(cachedStadiums) : null,
  };
}

export function saveFavorites() {
  localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify([...state.favorites]));
}

export function saveCache(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  localStorage.setItem(CONFIG.STORAGE_KEYS.CACHE_TIMESTAMP, new Date().toISOString());
}

export function getCached(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

export function saveToken(token) {
  state.token = token;
  localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
}

export function clearToken() {
  state.token = null;
  localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
}