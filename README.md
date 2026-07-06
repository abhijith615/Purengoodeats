# Pure N Good Eats 🍯

A cinematic, award-grade ecommerce experience for a premium wild-forest-honey brand
from Villupuram, Tamil Nadu — built for speed first.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Build | **Vite 6 + Vanilla TypeScript** | Zero framework runtime — fastest possible LCP |
| Styling | **Tailwind CSS v4** | Design tokens via `@theme`, tiny purged output |
| Motion | **GSAP 3.13** (ScrollTrigger, ScrollToPlugin, SplitText) | rAF-driven, GPU-accelerated |
| Scroll | **Lenis** | Buttery smooth scrolling, synced to ScrollTrigger via the GSAP ticker |
| WebGL | **OGL** (~15kb) | Single-draw-call honey shader; Three.js would cost 40× the bytes |

**Total JS: ~76 KB gzipped.** No images are downloaded — every visual is inline
SVG, CSS, or a WebGL shader, so there are zero layout shifts and nothing to lazy-load late.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks, then builds to dist/
npm run preview  # serve the production build
```

## Structure

```
index.html               All semantic markup + SEO meta + JSON-LD schemas
src/
  main.ts                Boot orchestrator, preloader, newsletter, map link
  styles/main.css        Tailwind theme tokens + component styles + grain texture
  modules/
    motion.ts            Reduced-motion / touch / DPR helpers
    scroll.ts            Lenis ⟷ ScrollTrigger sync, smooth anchor scrolling
    cursor.ts            Magnetic honey-drop cursor (velocity squash, blob morph, labels)
    hero.ts              OGL WebGL hero: flowing honey fbm, honeycomb lattice,
                         pollen parallax, pointer light — one fragment shader
    animations.ts        Scroll storytelling: SplitText masked reveals, story line
                         drawing, community colour journey, portrait unveils,
                         marquee w/ scroll-velocity, testimonial scrub, counters
    tilt.ts              3D product-card tilt: jar counter-parallax, light-tracking
                         glow, responsive shadow
    cart.ts              Cart state + localStorage, fly-to-cart drop, slide drawer,
                         WhatsApp checkout handoff
    accordions.ts        Native <details> accordions with GSAP height animation
    sound.ts             Optional ambient forest audio, synthesised with Web Audio
                         (zero network bytes), muted by default
```

## Performance & accessibility decisions

- **One rAF owner**: GSAP's ticker drives Lenis; the WebGL loop pauses when the
  hero is off-screen or the tab is hidden. DPR is capped at 1.75.
- **Reduced motion**: `prefers-reduced-motion` disables Lenis, all scroll
  animations, the cursor squash, and renders a single static WebGL frame.
  Content is authored visible-first — hidden states only exist inside JS.
- **Keyboard & SR**: skip link, focus-visible rings, native `<details>` for
  accordions, `aria-live` cart counts, focus management in the cart dialog,
  Escape-to-close, anchors move focus to their target.
- **SEO**: LocalBusiness + Product JSON-LD, OpenGraph, Twitter cards, canonical,
  semantic landmarks and a strict heading hierarchy — all server-rendered in
  static HTML (no JS needed to crawl).

## Bits worth stealing

- The hero's pollen, honeycomb and liquid are all *procedural* in one GLSL
  fragment shader — a single fullscreen triangle, one draw call.
- The marquee's speed is modulated by scroll velocity (`ScrollTrigger.getVelocity`).
- The ambient forest sound is synthesised (filtered brown noise + LFO breathing +
  randomised bird chirps) — no audio files shipped.
