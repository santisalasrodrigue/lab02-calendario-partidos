import { els } from './dom.js';

const SCROLL_THRESHOLD = 80; 

let lastScrollY = window.scrollY;

export function initScrollHide() {
  window.addEventListener('scroll', handleScroll, { passive: true });
}

function handleScroll() {
  const currentScrollY = window.scrollY;

  if (currentScrollY <= SCROLL_THRESHOLD) {
    els.filtersBar.classList.remove('filters--hidden');
  } else if (currentScrollY > lastScrollY) {
    els.filtersBar.classList.add('filters--hidden');
  } else {
    els.filtersBar.classList.remove('filters--hidden');
  }

  lastScrollY = currentScrollY;
}