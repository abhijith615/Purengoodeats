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

    const jar = card.querySelector<HTMLElement>('.product-jar');
    const shadow = card.querySelector<HTMLElement>('.product-card__shadow');
    const jarX = jar ? gsap.quickTo(jar, 'x', { duration: 0.9, ease: 'power3' }) : null;
    const jarR = jar ? gsap.quickTo(jar, 'rotation', { duration: 0.9, ease: 'power3' }) : null;
    const shX = shadow ? gsap.quickTo(shadow, 'x', { duration: 0.9, ease: 'power3' }) : null;

    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;  // -0.5 .. 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5;

      rx(-ny * MAX_TILT);
      ry(nx * MAX_TILT);

      // The jar leans against the card for parallax depth; honey follows.
      jarX?.(nx * -14);
      jarR?.(nx * 5);
      shX?.(nx * 22);

      // The glow behaves like a light source tracking the pointer.
      card.style.setProperty('--glow-x', `${(nx + 0.5) * 100}%`);
      card.style.setProperty('--glow-y', `${(ny + 0.5) * 100}%`);
    });

    card.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
      jarX?.(0);
      jarR?.(0);
      shX?.(0);
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
