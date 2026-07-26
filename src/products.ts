/**
 * Products catalog page entry point.
 * Reuses the same modules as the homepage, minus the hero video and the
 * scroll-storytelling pieces that only exist on the landing page.
 */
import './styles/main.css';

import { prefersReducedMotion } from './modules/motion';
import { initScroll } from './modules/scroll';
import { initCursor } from './modules/cursor';
import { initNav } from './modules/nav';
import { initCatalogAnimations } from './modules/animations';
import { initCart } from './modules/cart';
import { initSound } from './modules/sound';

function boot(): void {
  const reduced = prefersReducedMotion();

  initScroll();
  initCursor();
  initNav();
  initCatalogAnimations(reduced);
  initCart();
  initSound();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
