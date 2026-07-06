/**
 * Scroll storytelling. Every section gets a handcrafted entrance —
 * masked line reveals, word cascades, drawn SVG lines, colour journeys,
 * horizontal scrubbing — all driven by ScrollTrigger and synced to Lenis.
 *
 * With prefers-reduced-motion, none of this runs: content is authored
 * visible-first, and initial "hidden" states are only applied here.
 */
import type Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initAnimations(_lenis: Lenis | null, reduced: boolean): void {
  initHeader();
  if (reduced) return;

  // SplitText must wait for webfonts, or line breaks land in the wrong place.
  document.fonts.ready.then(() => {
    heroIntro();
    textReveals();
  });

  marquee();
  scrollHint();
  storyTimeline();
  communityJourney();
  imageReveals();
  dividerParallax();
  featureCards();
  staggerGroups();
  testimonialScrub();
  counters();
}

/* ---------------------------------------------------------------- header */
function initHeader(): void {
  const header = document.getElementById('site-header');
  const hero = document.getElementById('hero');
  if (!header || !hero) return;

  // Solid backdrop once past the hero; hide on scroll down, show on up.
  ScrollTrigger.create({
    start: () => `${hero.offsetHeight - 80} top`,
    end: 'max',
    onUpdate: (self) => {
      header.classList.toggle('is-solid', self.isActive);
      header.classList.toggle('is-hidden', self.isActive && self.direction === 1);
    },
    onLeaveBack: () => header.classList.remove('is-solid', 'is-hidden'),
  });
}

/* ------------------------------------------------------------ hero intro */
function heroIntro(): void {
  const title = document.getElementById('hero-title');
  if (!title) return;

  const split = SplitText.create(title, { type: 'lines', mask: 'lines' });

  gsap
    .timeline({ delay: 1.5, defaults: { ease: 'power4.out' } }) // after preloader
    .from(split.lines, { yPercent: 110, duration: 1.2, stagger: 0.12 })
    .from('#hero-eyebrow', { y: 24, autoAlpha: 0, duration: 0.8 }, '-=0.8')
    .from('#hero-copy', { y: 30, autoAlpha: 0, duration: 0.8 }, '-=0.6')
    .from('#hero-ctas > *', { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, '-=0.5')
    .from('#hero-scroll-hint', { autoAlpha: 0, duration: 0.6 }, '-=0.3');

  // Cinematic exit: the headline sinks and softens as you scroll away.
  gsap.to('#hero > div.relative', {
    yPercent: 18,
    autoAlpha: 0.25,
    ease: 'none',
    scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}

function scrollHint(): void {
  gsap.fromTo(
    '#scroll-hint-line',
    { scaleY: 0, transformOrigin: 'top' },
    {
      keyframes: [
        { scaleY: 1, transformOrigin: 'top', duration: 0.7, ease: 'power2.inOut' },
        { scaleY: 0, transformOrigin: 'bottom', duration: 0.7, ease: 'power2.inOut' },
      ],
      repeat: -1,
      repeatDelay: 0.4,
    }
  );
}

/* -------------------------------------------------------- shared reveals */
function textReveals(): void {
  // Masked multi-line reveals — the signature move, used instead of fades.
  document.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 1.1,
      stagger: 0.1,
      ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Word-by-word cascade for the emotional community paragraph.
  document.querySelectorAll<HTMLElement>('[data-reveal="words"]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words' });
    gsap.from(split.words, {
      autoAlpha: 0,
      y: 14,
      rotationX: -35,
      transformOrigin: '50% 100%',
      duration: 0.7,
      stagger: 0.025,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 80%' },
    });
  });

  // Eyebrows: a single clipped line sliding up.
  document.querySelectorAll<HTMLElement>('[data-reveal="line"]').forEach((el) => {
    const wrap = document.createElement('span');
    wrap.className = 'split-line-mask inline-block';
    el.replaceChildren(...wrapContents(el, wrap));
    gsap.from(wrap.firstChild, {
      yPercent: 120,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });
}

/** Wrap an element's children in an inner span inside a mask span. */
function wrapContents(el: HTMLElement, mask: HTMLSpanElement): HTMLElement[] {
  const inner = document.createElement('span');
  inner.className = 'inline-block';
  inner.append(...Array.from(el.childNodes));
  mask.append(inner);
  return [mask];
}

/* --------------------------------------------------------------- marquee */
function marquee(): void {
  const track = document.getElementById('marquee');
  const chunk = track?.querySelector('.marquee-chunk');
  if (!track || !chunk) return;

  // Duplicate the strip until it spans 2× viewport, then loop seamlessly.
  while (track.scrollWidth < innerWidth * 2) {
    track.append(chunk.cloneNode(true));
  }
  const width = (chunk as HTMLElement).offsetWidth + 40; // + gap

  const tween = gsap.to(track, { x: -width, duration: 22, ease: 'none', repeat: -1 });

  // Scroll velocity nudges the marquee speed — the page feels alive.
  ScrollTrigger.create({
    onUpdate: (self) => {
      gsap.to(tween, {
        timeScale: 1 + Math.min(Math.abs(self.getVelocity()) / 1200, 2.5),
        duration: 0.4,
        overwrite: true,
      });
    },
  });
}

/* --------------------------------------------------- story: forest → jar */
function storyTimeline(): void {
  const line = document.getElementById('story-line') as unknown as SVGPathElement | null;
  if (line) {
    const length = line.getTotalLength();
    gsap.set(line, { strokeDasharray: `${length}`, strokeDashoffset: length });
    gsap.to(line, {
      strokeDashoffset: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '#story ol',
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: 0.6,
      },
    });
  }

  document.querySelectorAll<HTMLElement>('.story-step').forEach((step, i) => {
    const fromLeft = i % 2 === 0;
    gsap.from(step.children[0], {
      x: fromLeft ? -70 : 70,
      autoAlpha: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: step, start: 'top 78%' },
    });
  });
}

/* --------------------------------------- community: colour + portraits */
function communityJourney(): void {
  const section = document.getElementById('community');
  if (!section) return;

  // The background journeys from forest green to warm honey-brown as you read.
  gsap.fromTo(
    section,
    { backgroundColor: '#24371F' },
    {
      backgroundColor: '#5C3D10',
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top 60%', end: 'bottom 90%', scrub: true },
    }
  );

}

/* ------------------------------------------------- photography reveals */
/**
 * Signature move for every photograph: the frame unclips upward while the
 * image inside settles from a zoom, then drifts gently in parallax as it
 * crosses the viewport. Way more cinematic than a fade.
 */
function imageReveals(): void {
  document.querySelectorAll<HTMLElement>('[data-img-reveal]').forEach((frame) => {
    const img = frame.querySelector('img');
    if (!img) return;

    gsap.set(frame, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(img, { scale: 1.25 });

    gsap
      .timeline({ scrollTrigger: { trigger: frame, start: 'top 82%' } })
      .to(frame, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power4.inOut' })
      .to(img, { scale: 1, duration: 1.6, ease: 'power3.out' }, '<0.1');

    // Continuous micro-parallax inside the frame while scrolling past.
    gsap.fromTo(
      img,
      { yPercent: -5 },
      {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  });
}

/* ------------------------------------------- cinematic quote divider */
function dividerParallax(): void {
  const img = document.getElementById('divider-img');
  if (!img) return;
  gsap.fromTo(
    img,
    { yPercent: -12 },
    {
      yPercent: 4,
      ease: 'none',
      scrollTrigger: { trigger: '#divider', start: 'top bottom', end: 'bottom top', scrub: true },
    }
  );
}

/* ------------------------------------------------------- feature cards */
function featureCards(): void {
  document.querySelectorAll<SVGElement>('.feature-icon .draw').forEach((path) => {
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.4,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: path, start: 'top 85%' },
    });
  });

  // Idle float — each card breathes on its own rhythm.
  document.querySelectorAll<HTMLElement>('[data-float]').forEach((card, i) => {
    gsap.to(card, {
      y: -8,
      duration: 2.4 + (i % 3) * 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.2,
    });
  });
}

/* -------------------------------------------------- generic stagger-ins */
function staggerGroups(): void {
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    gsap.from(group.children, {
      autoAlpha: 0,
      x: -24,
      duration: 0.8,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: { trigger: group, start: 'top 85%' },
    });
  });

  document.querySelectorAll<HTMLElement>('[data-stagger-cards]').forEach((grid) => {
    gsap.from(grid.children, {
      y: 70,
      autoAlpha: 0,
      rotation: () => gsap.utils.random(-2.5, 2.5),
      duration: 1,
      stagger: 0.09,
      ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 82%' },
    });
  });
}

/* ------------------------------------------- testimonials: horizontal */
function testimonialScrub(): void {
  const wrap = document.getElementById('testimonial-track-wrap');
  const track = document.getElementById('testimonial-track');
  if (!wrap || !track) return;

  // The whole shelf of cards glides sideways as the section crosses the viewport.
  gsap.to(track, {
    x: () => -(track.scrollWidth - innerWidth) * 0.92,
    ease: 'none',
    scrollTrigger: {
      trigger: wrap,
      start: 'top 90%',
      end: 'bottom 5%',
      scrub: 0.5,
      invalidateOnRefresh: true,
    },
  });

  // Each card tilts slightly against the motion for depth.
  track.querySelectorAll<HTMLElement>('.testimonial-card').forEach((card, i) => {
    gsap.fromTo(
      card,
      { rotation: i % 2 ? 1.2 : -1.2, y: i % 2 ? 18 : 0 },
      {
        rotation: i % 2 ? -1.2 : 1.2,
        ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'bottom top', scrub: 1 },
      }
    );
  });
}

/* --------------------------------------------------------- stat counters */
function counters(): void {
  document.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
    const end = Number(el.dataset.counter ?? 0);
    const state = { value: 0 };
    gsap.to(state, {
      value: end,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      onUpdate: () => {
        el.textContent = Math.round(state.value).toLocaleString('en-IN');
      },
    });
  });
}
