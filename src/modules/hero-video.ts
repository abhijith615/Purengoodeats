/**
 * Cinematic video hero.
 * Picks the desktop or mobile cut based on the viewport (only ONE file is
 * ever downloaded), plays only while visible, and adds a slow Ken-Burns
 * drift plus a depth-parallax exit as the user scrolls away.
 * Reduced-motion users get the poster frame — no autoplaying video.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHeroVideo(reduced: boolean): void {
  const video = document.getElementById('hero-video') as HTMLVideoElement | null;
  if (!video) return;

  if (reduced) return; // poster only — respect the preference

  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  video.src = isMobile ? '/video/hero-mobile.mp4' : '/video/hero-desktop.mp4';

  const tryPlay = (): void => {
    video.play().catch(() => {
      /* Autoplay blocked: the poster still gives a full-art hero. */
    });
  };
  if (video.readyState >= 2) tryPlay();
  else video.addEventListener('canplay', tryPlay, { once: true });

  // Save battery: pause whenever the hero leaves the viewport.
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) tryPlay();
    else video.pause();
  }).observe(video);

  // Slow Ken-Burns breathing so even a paused frame feels alive.
  gsap.fromTo(
    video,
    { scale: 1.08 },
    { scale: 1, duration: 9, ease: 'power1.out' }
  );

  // Depth parallax: the film plane recedes as the story begins.
  gsap.to(video, {
    yPercent: 12,
    scale: 1.06,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}
