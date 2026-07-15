import { state } from './state.js';
import { els } from './dom.js';
import { resetRender, renderNextBatch } from './render.js';

// =========================================================
// FILTERS: filtrado por grupo/estadio/favoritos
// =========================================================

export function populateFilterOptions() {
  const groups = [...new Set(state.games.map(g => g.group).filter(Boolean))].sort();
  els.groupFilter.innerHTML = '<option value="">Todos</option>' +
    groups.map(g => `<option value="${g}">${g}</option>`).join('');

  els.stadiumFilter.innerHTML = '<option value="">Todos</option>' +
    state.stadiums.map(s => `<option value="${s.id}">${s.name_en}${s.city_en ? ' — ' + s.city_en : ''}</option>`).join('');
}

export function applyFiltersAndRender() {
  const { group, stadium, favoritesOnly } = state.filters;

  state.filteredGames = state.games.filter((game) => {
    if (group && game.group !== group) return false;
    if (stadium && String(game.stadium_id) !== String(stadium)) return false;
    if (favoritesOnly && !state.favorites.has(String(game.id))) return false;
    return true;
  });

  resetRender();
  els.emptyState.classList.toggle('hidden', state.filteredGames.length > 0);
  renderNextBatch();
}

export function initFilterListeners() {
  els.groupFilter.addEventListener('change', (e) => {
    state.filters.group = e.target.value;
    applyFiltersAndRender();
  });
  els.stadiumFilter.addEventListener('change', (e) => {
    state.filters.stadium = e.target.value;
    applyFiltersAndRender();
  });
  els.favoritesOnly.addEventListener('change', (e) => {
    state.filters.favoritesOnly = e.target.checked;
    applyFiltersAndRender();
  });

  // Disparado desde render.js cuando se destilda un favorito
  // con el filtro "solo favoritos" activo.
  document.addEventListener('favorites:changed', applyFiltersAndRender);
}