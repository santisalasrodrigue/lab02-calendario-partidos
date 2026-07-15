import { CONFIG } from './config.js';
import { state } from './state.js';
import { els } from './dom.js';
import { apiAuth } from './api.js';
import { saveToken, clearToken } from './storage.js';
import { populateFilterOptions, applyFiltersAndRender } from './filters.js';

// =========================================================
// AUTH MODAL: aparece SOLO cuando la API responde 401, o si
// el usuario pulsa "Iniciar sesión" voluntariamente. La app
// NO exige login al arrancar.
// =========================================================

// Callback inyectado desde main.js (ej. loadAllData) para
// refrescar datos tras un login voluntario (no reintento de 401).
let onAuthSuccess = async () => {};

export function initAuthModal(authSuccessCallback) {
  onAuthSuccess = authSuccessCallback;
  els.authForm.addEventListener('submit', handleAuthSubmit);
  els.toggleModeBtn.addEventListener('click', () => {
    setAuthMode(state.authMode === 'login' ? 'register' : 'login');
  });
  els.logoutBtn.addEventListener('click', handleLogout);
}

// Llamado desde dataLoader.js cuando una petición responde 401.
// Guarda la función que falló para reintentarla luego del login,
// SIN recargar la página y SIN perder filtros/favoritos (viven
// en `state`, que nunca se toca aquí).
export function handleAuthRequired(retryFn) {
  state.pendingRetry = retryFn;
  clearToken();
  openAuthModal({ reauth: true });
}

export function openAuthModal({ reauth = false } = {}) {
  els.authModal.classList.remove('hidden');
  els.authModalMsg.classList.toggle('hidden', !reauth);
  els.authError.classList.add('hidden');
  els.authForm.reset();
  setAuthMode('login');
}

function closeAuthModal() {
  els.authModal.classList.add('hidden');
}

function setAuthMode(mode) {
  state.authMode = mode;
  const isRegister = mode === 'register';
  els.authModalTitle.textContent = isRegister ? 'Crear cuenta' : 'Iniciar sesión';
  els.nameField.classList.toggle('hidden', !isRegister);
  els.authSubmitBtn.textContent = isRegister ? 'Registrarme' : 'Entrar';
  els.toggleModeText.textContent = isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?';
  els.toggleModeBtn.textContent = isRegister ? 'Inicia sesión' : 'Regístrate';
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  els.authError.classList.add('hidden');
  els.authSubmitBtn.disabled = true;

  try {
    const email = els.authEmail.value.trim();
    const password = els.authPassword.value;
    let result;

    if (state.authMode === 'register') {
      const name = els.authName.value.trim();
      result = await apiAuth(CONFIG.ENDPOINTS.REGISTER, { name, email, password });
    } else {
      result = await apiAuth(CONFIG.ENDPOINTS.LOGIN, { email, password });
    }

    saveToken(result.token);
    updateUserStatus(result.user);
    closeAuthModal();

    if (state.pendingRetry) {
      // Reintenta la petición que había fallado por 401.
      const fn = state.pendingRetry;
      state.pendingRetry = null;
      await fn();
      populateFilterOptions();
      applyFiltersAndRender();
    } else {
      await onAuthSuccess();
    }
  } catch (err) {
    els.authError.textContent = err.message;
    els.authError.classList.remove('hidden');
  } finally {
    els.authSubmitBtn.disabled = false;
  }
}

function updateUserStatus(user) {
  if (user && user.name) {
    els.userStatus.textContent = `👤 ${user.name}`;
    els.logoutBtn.classList.remove('hidden');
  }
}

function handleLogout() {
  clearToken();
  els.userStatus.textContent = '';
  els.logoutBtn.classList.add('hidden');
}