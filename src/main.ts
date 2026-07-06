/**
 * Pure N Good Eats — entry point.
 * Boots the smooth-scroll core, then progressively enhances:
 * cursor → WebGL hero → scroll storytelling → commerce UI.
 */
import './styles/main.css';

import { gsap } from 'gsap';
import { prefersReducedMotion } from './modules/motion';
import { initScroll } from './modules/scroll';
import { initCursor } from './modules/cursor';
import { initHeroVideo } from './modules/hero-video';
import { initAnimations } from './modules/animations';
import { initTilt } from './modules/tilt';
import { initCart } from './modules/cart';
import { initAccordions } from './modules/accordions';
import { initSound } from './modules/sound';

function boot(): void {
  const reduced = prefersReducedMotion();

  const lenis = initScroll();
  initCursor();
  initHeroVideo(reduced);
  initAnimations(lenis, reduced);
  initTilt(reduced);
  initCart();
  initAccordions(reduced);
  initSound();
  initNewsletter();
  initMapLink();
  runPreloader(reduced);
}

/** The map placeholder opens the real location in Google Maps. */
function initMapLink(): void {
  const map = document.querySelector<HTMLElement>('.map-placeholder');
  if (!map) return;
  map.style.cursor = 'pointer';
  map.setAttribute('role', 'link');
  map.setAttribute('tabindex', '0');
  map.setAttribute('aria-label', 'Open Villupuram, Tamil Nadu in Google Maps');
  const openMaps = (): void => {
    window.open('https://www.google.com/maps/place/Villupuram,+Tamil+Nadu', '_blank', 'noopener');
  };
  map.addEventListener('click', openMaps);
  map.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMaps();
    }
  });
}

/** Preloader: honey drop draws + fills, then the curtain lifts into the hero intro. */
function runPreloader(reduced: boolean): void {
  const preloader = document.getElementById('preloader');
  const drop = document.getElementById('preloader-drop');
  if (!preloader || !drop) return;

  if (reduced) {
    preloader.remove();
    return;
  }

  const length = (drop as unknown as SVGPathElement).getTotalLength();
  gsap.set(drop, { strokeDasharray: length, strokeDashoffset: length });

  gsap
    .timeline()
    .to(drop, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' })
    .to(drop, { fill: '#F5B942', duration: 0.35, ease: 'power1.in' }, '-=0.2')
    .to(preloader, {
      yPercent: -100,
      duration: 0.9,
      ease: 'power4.inOut',
      onComplete: () => preloader.remove(),
    }, '+=0.15');
}

function initNewsletter(): void {
  const form = document.getElementById('newsletter-form') as HTMLFormElement | null;
  const msg = document.getElementById('newsletter-msg');
  const email = document.getElementById('newsletter-email') as HTMLInputElement | null;
  if (!form || !msg || !email) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!email.checkValidity()) {
      msg.textContent = 'Please enter a valid email address.';
      return;
    }
    msg.textContent = 'Welcome to the hive — see you next season. 🍯';
    form.reset();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
