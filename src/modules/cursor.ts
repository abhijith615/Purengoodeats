/**
 * Premium magnetic cursor.
 * A honey-drop blob follows the pointer with fluid GSAP interpolation,
 * morphs its border-radius organically, scales over interactive elements,
 * pulls magnetic elements toward itself, and shows contextual labels.
 */
import { gsap } from 'gsap';
import { isTouchDevice, prefersReducedMotion } from './motion';

const INTERACTIVE = 'a, button, [data-tilt], summary, input';

export function initCursor(): void {
  if (isTouchDevice()) return;

  const root = document.getElementById('cursor');
  const drop = document.getElementById('cursor-drop');
  const label = document.getElementById('cursor-label');
  if (!root || !drop || !label) return;

  const reduced = prefersReducedMotion();

  // Fluid follow — slightly lazy so the drop feels liquid, not glued.
  const toX = gsap.quickTo(root, 'x', { duration: reduced ? 0 : 0.45, ease: 'power3' });
  const toY = gsap.quickTo(root, 'y', { duration: reduced ? 0 : 0.45, ease: 'power3' });

  let lastX = innerWidth / 2;
  let lastY = innerHeight / 2;

  window.addEventListener('pointermove', (e) => {
    root.classList.add('is-active');
    toX(e.clientX);
    toY(e.clientY);
    if (!reduced) {
      // Velocity-based squash: the drop stretches along its travel direction.
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const speed = Math.min(Math.hypot(dx, dy) / 28, 1);
      gsap.to(drop, {
        scaleX: 1 + speed * 0.45,
        scaleY: 1 - speed * 0.25,
        rotation: (Math.atan2(dy, dx) * 180) / Math.PI,
        duration: 0.3,
        overwrite: 'auto',
      });
    }
    lastX = e.clientX;
    lastY = e.clientY;
  }, { passive: true });

  // Organic idle morph — the blob never sits perfectly still.
  if (!reduced) {
    gsap.to(drop, {
      keyframes: [
        { borderRadius: '55% 45% 60% 40% / 45% 60% 40% 55%' },
        { borderRadius: '45% 55% 40% 60% / 60% 40% 55% 45%' },
        { borderRadius: '60% 40% 55% 45% / 50% 55% 45% 60%' },
      ],
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }

  // Grow over anything interactive; show label when provided.
  document.addEventListener('pointerover', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(INTERACTIVE);
    if (!el) return;
    gsap.to(drop, { scale: 2.1, duration: 0.35, overwrite: 'auto' });
    const text = el.closest<HTMLElement>('[data-cursor]')?.dataset.cursor;
    if (text) {
      label.textContent = text;
      gsap.to(label, { opacity: 1, scale: 1, duration: 0.3, overwrite: 'auto' });
    }
  });
  document.addEventListener('pointerout', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>(INTERACTIVE);
    if (!el) return;
    gsap.to(drop, { scale: 1, duration: 0.35, overwrite: 'auto' });
    gsap.to(label, { opacity: 0, scale: 0.6, duration: 0.25, overwrite: 'auto' });
  });

  // Click: honey-drop squish.
  document.addEventListener('pointerdown', () =>
    gsap.to(drop, { scale: 0.8, duration: 0.15, overwrite: 'auto' })
  );
  document.addEventListener('pointerup', () =>
    gsap.to(drop, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' })
  );

  initMagnetic(reduced);
}

/**
 * Elements with [data-magnetic] gently lean toward the pointer.
 *
 * The pull is proportional to the element's size, so a wide button could
 * travel far enough to collide with its neighbour — a 253px-wide CTA drifted
 * 43px into the button beside it. MAX_PULL caps the displacement so the effect
 * stays a lean, never a leap, whatever the element's width.
 */
const MAX_PULL = 10; // px — stays below the tightest gap between two magnetic elements

function initMagnetic(reduced: boolean): void {
  if (reduced) return;

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = 0.35;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * strength;
      const dy = (e.clientY - (r.top + r.height / 2)) * strength;
      // Clamp the vector's length, preserving its direction.
      const dist = Math.hypot(dx, dy);
      const scale = dist > MAX_PULL ? MAX_PULL / dist : 1;
      xTo(dx * scale);
      yTo(dy * scale);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}
