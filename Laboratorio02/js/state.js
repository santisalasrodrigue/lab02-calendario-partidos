
export const state = {
  token: null,
  authMode: 'login', 
  games: [],
  stadiums: [],
  stadiumById: {},
  favorites: new Set(),
  filters: { group: '', stadium: '', favoritesOnly: false },
  renderedCount: 0,     
  filteredGames: [],
  pendingRetry: null,    
};

// Error especial para distinguir un 401 de cualquier otro fallo de red/HTTP
export class AuthRequiredError extends Error {}