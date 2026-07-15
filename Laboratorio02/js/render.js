import { CONFIG } from './config.js';
import { state } from './state.js';
import { els } from './dom.js';
import { saveFavorites } from './storage.js';

// RENDER: construcción de tarjetas y pintado en el DOM.
// Nunca se inserta un nodo a la vez: siempre se agrupan en
// un DocumentFragment por lote.

function buildMatchCard(game) {
  const stadium = state.stadiumById[String(game.stadium_id)];
  const isFav = state.favorites.has(String(game.id));

  const homeName = game.home_team_name_en || game.home_team_label || `Equipo ${game.home_team_id}`;
  const awayName = game.away_team_name_en || game.away_team_label || `Equipo ${game.away_team_id}`;

  const card = document.createElement('article');
  card.className = 'match-card';
  card.dataset.matchId = game.id; 

  card.innerHTML = `
    <button class="fav-btn ${isFav ? 'is-favorite' : ''}" data-fav-btn data-match-id="${game.id}" aria-label="Marcar favorito">
      ${isFav ? '★' : '☆'}
    </button>
    <span class="group-tag">Grupo ${game.group || '-'} · Jornada ${game.matchday || '-'}</span>
    <div class="teams">
      <span>${homeName}</span>
      <span class="score">${game.home_score ?? 0} - ${game.away_score ?? 0}</span>
      <span>${awayName}</span>
    </div>
    <span class="meta">📅 ${game.local_date || 'Fecha por definir'}</span>
    <span class="meta">🏟️ ${stadium ? `${stadium.name_en} — ${stadium.city_en}` : `Estadio ${game.stadium_id}`}</span>
  `;
  return card;
}

export function resetRender() {
  state.renderedCount = 0;
  els.container.innerHTML = '';
}

//  DocumentFragment y lotes
export function renderNextBatch() {
  const slice = state.filteredGames.slice(
    state.renderedCount,
    state.renderedCount + CONFIG.BATCH_SIZE
  );
  if (slice.length === 0) return;

  const fragment = document.createDocumentFragment();
  for (const game of slice) {
    fragment.appendChild(buildMatchCard(game));
  }
  els.container.appendChild(fragment);   // ← una sola operación sobre el DOM visible

  state.renderedCount += slice.length;
}

//  IntersectionObserver
export function initLazyRender() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && state.renderedCount < state.filteredGames.length) {
        renderNextBatch();
      }
    });
  }, { rootMargin: '50px' });

  observer.observe(els.sentinel);
}

// Delegación de eventos
export function initFavoriteDelegation() {
  els.container.addEventListener('click', (event) => {
    const favBtn = event.target.closest('[data-fav-btn]');
    if (!favBtn) return;

    const matchId = favBtn.dataset.matchId;
    toggleFavorite(matchId, favBtn);
  });
}

function toggleFavorite(matchId, btnEl) {
  if (state.favorites.has(matchId)) {
    state.favorites.delete(matchId);
    btnEl.classList.remove('is-favorite');
    btnEl.textContent = '☆';
  } else {
    state.favorites.add(matchId);
    btnEl.classList.add('is-favorite');
    btnEl.textContent = '★';
  }
  saveFavorites(); // ← se guarda tanto al agregar como al quitar

  if (state.filters.favoritesOnly) {
    document.dispatchEvent(new CustomEvent('favorites:changed'));
  }
}

export function showOfflineBanner() {
  els.offlineBanner.classList.remove('hidden');
}

export function hideOfflineBanner() {
  els.offlineBanner.classList.add('hidden');
}