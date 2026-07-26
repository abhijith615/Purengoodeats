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
import { initNav } from './modules/nav';
import { initHeroVideo } from './modules/hero-video';
import { initAnimations } from './modules/animations';
import { initTilt } from './modules/tilt';
import { initCart } from './modules/cart';
import { initSound } from './modules/sound';

function boot(): void {
  const reduced = prefersReducedMotion();

  const lenis = initScroll();
  initCursor();
  initNav();
  initHeroVideo(reduced);
  initAnimations(lenis, reduced);
  initTilt(reduced);
  initCart();
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
  map.setAttribute('aria-label', 'Open Ooty, The Nilgiris, Tamil Nadu in Google Maps');
  const openMaps = (): void => {
    window.open('https://www.google.com/maps/place/Ooty,+Tamil+Nadu', '_blank', 'noopener');
  };
  map.addEventListener('click', openMaps);
  map.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMaps();
    }
  });
}

/** Preloader: the logo settles into place, then the curtain lifts into the hero. */
function runPreloader(reduced: boolean): void {
  const preloader = document.getElementById('preloader');
  const logo = document.getElementById('preloader-logo');
  if (!preloader || !logo) return;

  const dismiss = (): void => preloader.remove();

  // The intro is driven by requestAnimationFrame, which browsers suspend in
  // background tabs. Never let that trap the page: skip the animation outright
  // if we boot hidden, and keep a hard failsafe for any other stall.
  if (reduced || document.hidden) {
    dismiss();
    return;
  }
  const failsafe = window.setTimeout(dismiss, 4000);

  gsap
    .timeline({ onComplete: () => window.clearTimeout(failsafe) })
    .from(logo, { scale: 0.82, autoAlpha: 0, duration: 0.9, ease: 'power3.out' })
    .from(preloader.querySelector('p'), { y: 12, autoAlpha: 0, duration: 0.5 }, '-=0.4')
    .to(preloader, {
      yPercent: -100,
      duration: 0.9,
      ease: 'power4.inOut',
      onComplete: dismiss,
    }, '+=0.35');
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
    msg.textContent = 'Welcome to the family — see you next season.';
    form.reset();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
