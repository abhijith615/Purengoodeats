/**
 * Product-detail accordions built on native <details>/<summary> —
 * keyboard and screen-reader friendly for free — with GSAP height
 * animation layered on top.
 */
import { gsap } from 'gsap';

export function initAccordions(reduced: boolean): void {
  document.querySelectorAll<HTMLDetailsElement>('[data-accordion]').forEach((details) => {
    const summary = details.querySelector('summary');
    const body = details.querySelector<HTMLElement>('.accordion__body');
    if (!summary || !body) return;
    if (reduced) return; // native open/close behaviour, no animation

    let animating = false;

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (animating) return;
      animating = true;

      if (details.open) {
        // Collapse: animate shut, then let the platform close it.
        gsap.to(body, {
          height: 0,
          autoAlpha: 0,
          duration: 0.45,
          ease: 'power3.inOut',
          onComplete: () => {
            details.open = false;
            gsap.set(body, { clearProps: 'all' });
            animating = false;
          },
        });
      } else {
        details.open = true;
        gsap.fromTo(
          body,
          { height: 0, autoAlpha: 0 },
          {
            height: 'auto',
            autoAlpha: 1,
            duration: 0.55,
            ease: 'power3.out',
            onComplete: () => {
              gsap.set(body, { clearProps: 'all' });
              animating = false;
            },
          }
        );
      }
    });
  });
}
