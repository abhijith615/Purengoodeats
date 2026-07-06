/**
 * Luxurious 3D tilt for product cards and the map.
 * The card rotates in perspective toward the pointer, the jar counter-rotates
 * on a deeper Z-plane, the honey glow follows the light source, and the
 * ground shadow stretches away from it — all through GSAP's rAF-driven quickTo.
 */
import { gsap } from 'gsap';
import { isTouchDevice } from './motion';

const MAX_TILT = 9; // degrees

export function initTilt(reduced: boolean): void {
  if (reduced || isTouchDevice()) return;

  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
    gsap.set(card, { transformPerspective: 900 });

    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.7, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.7, ease: 'power3' });

    const photo = card.querySelector<HTMLElement>('.product-photo');
    const phX = photo ? gsap.quickTo(photo, 'x', { duration: 0.9, ease: 'power3' }) : null;
    const phY = photo ? gsap.quickTo(photo, 'y', { duration: 0.9, ease: 'power3' }) : null;

    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;  // -0.5 .. 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5;

      rx(-ny * MAX_TILT);
      ry(nx * MAX_TILT);

      // The photograph counter-drifts on its deeper Z-plane for parallax.
      phX?.(nx * -10);
      phY?.(ny * -8);

      // The glow behaves like a light source tracking the pointer.
      card.style.setProperty('--glow-x', `${(nx + 0.5) * 100}%`);
      card.style.setProperty('--glow-y', `${(ny + 0.5) * 100}%`);
    });

    card.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
      phX?.(0);
      phY?.(0);
    });

    // Quick-view lift on entry — the card greets the pointer.
    card.addEventListener('pointerenter', () => {
      gsap.fromTo(card, { scale: 1 }, { scale: 1.015, duration: 0.5, ease: 'power2.out' });
    });
    card.addEventListener('pointerleave', () => {
      gsap.to(card, { scale: 1, duration: 0.5, ease: 'power2.out' });
    });
  });
}
