/**
 * Scroll storytelling. Every section gets a handcrafted entrance —
 * masked line reveals, word cascades, clip-path photo unveils, parallax
 * and stagger — all driven by ScrollTrigger and synced to Lenis.
 *
 * With prefers-reduced-motion, none of this runs: content is authored
 * visible-first, and initial "hidden" states are only applied here.
 */
import type Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * How far below its mask a line starts, as a % of its own height.
 * The masks are padded 0.2em taller than the line box so tight display
 * line-heights don't shear descenders (see main.css), so 100% is no longer
 * far enough to hide the copy — this clears the padded box at every size.
 */
const MASK_OFFSET = 135;

/**
 * How far a card travels on entry. Cards are transformed, so they escape their
 * layout box — this must stay well under the margin separating a grid from the
 * content beneath it, or the last row lands on top of it.
 */
const CARD_ENTRANCE_Y = 40;

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
  imageReveals();
  dividerParallax();
  floatCards();
  staggerGroups();
}

/**
 * Reduced set for the catalog page: text reveals and staggered entrances,
 * but none of the landing-page-only scroll storytelling.
 */
export function initCatalogAnimations(reduced: boolean): void {
  if (reduced) return;
  document.fonts.ready.then(textReveals);
  catalogItems();
}

/** Each catalog row slides in from the left as it enters the viewport. */
function catalogItems(): void {
  document.querySelectorAll<HTMLElement>('.catalog-item').forEach((item) => {
    gsap.from(item, {
      y: 40,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 88%' },
    });
  });
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
    .from(split.lines, { yPercent: MASK_OFFSET, duration: 1.2, stagger: 0.12 })
    .from('#hero-eyebrow', { y: 24, autoAlpha: 0, duration: 0.8 }, '-=0.8')
    .from('#hero-copy', { y: 30, autoAlpha: 0, duration: 0.8 }, '-=0.6')
    // Travel stays under the CTA row gap — the buttons stack on mobile, and a
    // taller hop would visibly overlap them mid-stagger on every page load.
    .from('#hero-ctas > *', { y: 12, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, '-=0.5')
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
      yPercent: MASK_OFFSET,
      duration: 1.1,
      stagger: 0.1,
      ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Word-by-word cascade for the emotional lead paragraphs.
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
      yPercent: MASK_OFFSET,
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
  const width = (chunk as HTMLElement).offsetWidth + 32; // + gap

  const tween = gsap.to(track, { x: -width, duration: 20, ease: 'none', repeat: -1 });

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

/* ------------------------------------------------- photography reveals */
/**
 * Signature move for every photograph: the frame unclips upward while the
 * image inside settles from a zoom, then drifts gently in parallax as it
 * crosses the viewport. Far more cinematic than a fade.
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
      scrollTrigger: { trigger: '#heart', start: 'top bottom', end: 'bottom top', scrub: true },
    }
  );
}

/* ------------------------------------------------- idle card breathing */
function floatCards(): void {
  document.querySelectorAll<HTMLElement>('[data-float]').forEach((card, i) => {
    gsap.to(card, {
      y: -7,
      duration: 2.4 + (i % 3) * 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.18,
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
      stagger: 0.06,
      ease: 'power2.out',
      scrollTrigger: { trigger: group, start: 'top 85%' },
    });
  });

  document.querySelectorAll<HTMLElement>('[data-stagger-cards]').forEach((grid) => {
    // Keep this offset comfortably smaller than the margin below any grid —
    // a transform lifts cards out of layout flow, so a larger travel makes the
    // last row visually overlap whatever follows it.
    gsap.from(grid.children, {
      y: CARD_ENTRANCE_Y,
      autoAlpha: 0,
      duration: 1,
      stagger: 0.09,
      ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 82%' },
    });
  });
}
