
// CONFIG: constantes de la aplicación

export const CONFIG = {
 
  API_BASE: 'https://worldcup26.ir',
  ENDPOINTS: {
    LOGIN: '/auth/authenticate',
    REGISTER: '/auth/register',
    GAMES: '/get/games',
    STADIUMS: '/get/stadiums',
  },
  STORAGE_KEYS: {
    TOKEN: 'wc26_token',
    FAVORITES: 'wc26_favorites',
    CACHE_GAMES: 'wc26_cache_games',
    CACHE_STADIUMS: 'wc26_cache_stadiums',
    CACHE_TIMESTAMP: 'wc26_cache_timestamp',
  },
  BATCH_SIZE: 20, 
};