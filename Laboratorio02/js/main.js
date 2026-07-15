import { state } from './state.js';
import { els } from './dom.js';
import { loadFromStorage } from './storage.js';
import { loadAllData, registerAuthHandler } from './dataLoader.js';
import { handleAuthRequired, initAuthModal } from './authModal.js';
import { populateFilterOptions, applyFiltersAndRender, initFilterListeners } from './filters.js';
import { initFavoriteDelegation, initLazyRender, showOfflineBanner } from './render.js';
import { initZoomControls } from './zoomControl.js';
import { initScrollHide } from './scrollHide.js';

// Inicializa los módulos y configura los eventos principales de la aplicación.
registerAuthHandler(handleAuthRequired);
initAuthModal(loadAllData);
initFilterListeners();
initFavoriteDelegation();
initLazyRender();
initZoomControls();
initScrollHide();

els.reloadBtn.addEventListener('click', () => loadAllData());

window.addEventListener('offline', showOfflineBanner);
window.addEventListener('online', () => loadAllData());

async function init() {
   // Recupera los datos guardados localmente para el modo offline.
  const cache = loadFromStorage();

  // Pinta de inmediato lo que haya en caché mientras llega la red.
  if (cache.games) state.games = cache.games;
  if (cache.stadiums) {
    state.stadiums = cache.stadiums;
    state.stadiumById = Object.fromEntries(cache.stadiums.map(s => [String(s.id), s]));
  }
  if (cache.games || cache.stadiums) {
    populateFilterOptions();
    applyFiltersAndRender();
  }

  // Carga la información actual desde la API.
  await loadAllData();
}

init();