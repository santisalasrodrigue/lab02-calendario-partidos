import { els } from './dom.js';

const ZOOM_LEVEL = 1.25;
let isZoomed = false;

export function initZoomControls() {
  els.zoomInBtn.addEventListener('click', applyZoom);
  els.zoomOutBtn.addEventListener('click', removeZoom);
}

function applyZoom() {
  if (isZoomed) return; // no deja hacer zoom más de una vez
  document.documentElement.style.zoom = String(ZOOM_LEVEL);
  isZoomed = true;
  els.zoomInBtn.disabled = true;
  els.zoomOutBtn.disabled = false;
}

function removeZoom() {
  document.documentElement.style.zoom = '';
  isZoomed = false;
  els.zoomInBtn.disabled = false;
  els.zoomOutBtn.disabled = true;
}