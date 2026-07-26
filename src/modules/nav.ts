/**
 * Mobile navigation.
 * The inline nav links only fit from `lg` up, so below that the site would
 * otherwise have no navigation at all — including no route to the Products
 * page. This provides a full-screen menu with a proper focus trap.
 */
import { gsap } from 'gsap';
import { prefersReducedMotion } from './motion';

export function initNav(): void {
  const toggle = document.getElementById('menu-toggle');
  const panel = document.getElementById('mobile-menu');
  if (!toggle || !panel) return;

  const links = [...panel.querySelectorAll<HTMLAnchorElement>('a')];
  const reduced = prefersReducedMotion();
  let isOpen = false;
  let lastFocused: HTMLElement | null = null;

  const open = (): void => {
    isOpen = true;
    lastFocused = document.activeElement as HTMLElement;
    panel.classList.remove('hidden');
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';

    if (reduced) {
      gsap.set(panel, { autoAlpha: 1 });
      gsap.set(links, { autoAlpha: 1, y: 0 });
    } else {
      gsap.to(panel, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' });
      gsap.fromTo(
        links,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out', delay: 0.1 }
      );
    }
    links[0]?.focus();
    document.addEventListener('keydown', onKeydown);
  };

  const close = (): void => {
    isOpen = false;
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    gsap.to(panel, {
      autoAlpha: 0,
      duration: reduced ? 0 : 0.3,
      onComplete: () => panel.classList.add('hidden'),
    });
    document.removeEventListener('keydown', onKeydown);
    lastFocused?.focus();
  };

  /** Escape closes; Tab cycles within the panel while it is open. */
  const onKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key !== 'Tab' || links.length === 0) return;
    const first = links[0];
    const last = links[links.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  toggle.addEventListener('click', () => (isOpen ? close() : open()));
  links.forEach((l) => l.addEventListener('click', close));

  // Never leave the menu stranded open if the viewport grows to desktop.
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches && isOpen) close();
  });
}
