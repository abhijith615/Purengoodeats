/**
 * Smooth scrolling core: Lenis drives the scroll, GSAP's ticker drives Lenis,
 * and ScrollTrigger listens to Lenis so every animation stays in sync.
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { prefersReducedMotion } from './motion';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export function initScroll(): Lenis | null {
  if (prefersReducedMotion()) {
    // Native scrolling for reduced-motion users; anchors still work.
    bindAnchors(null);
    return null;
  }

  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    touchMultiplier: 1.4,
  });

  lenis.on('scroll', ScrollTrigger.update);

  // Single rAF owner: GSAP ticker → Lenis. Avoids double rAF loops.
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  bindAnchors(lenis);
  return lenis;
}

/** Smooth-scroll all same-page anchor links, keeping keyboard focus behaviour intact. */
function bindAnchors(lenis: Lenis | null): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target as HTMLElement, { offset: 0, duration: 1.4 });
      } else {
        target.scrollIntoView();
      }
      // Move focus for screen reader / keyboard users.
      (target as HTMLElement).setAttribute('tabindex', '-1');
      (target as HTMLElement).focus({ preventScroll: true });
    });
  });
}
