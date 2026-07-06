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
| Hero | **Native video** (desktop + mobile cuts) | Only the matching cut is downloaded; poster fallback for reduced motion |

**Total JS: ~62 KB gzipped.** All photography is pre-compressed (2–4 MB originals
→ 140–340 KB), served with explicit dimensions and `loading="lazy"`, so there are
zero layout shifts. Raw originals stay out of git; optimized copies live in `public/`.

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
public/
  images/                Optimized photography (story steps, community, products)
  video/                 Hero films: hero-desktop.mp4 + hero-mobile.mp4
src/
  main.ts                Boot orchestrator, preloader, newsletter, map link
  styles/main.css        Tailwind theme tokens + component styles + grain texture
  modules/
    motion.ts            Reduced-motion / touch / DPR helpers
    scroll.ts            Lenis ⟷ ScrollTrigger sync, smooth anchor scrolling
    cursor.ts            Magnetic honey-drop cursor (velocity squash, blob morph, labels)
    hero-video.ts        Cinematic hero: viewport-matched video source, visibility-
                         aware playback, Ken-Burns drift, scroll depth parallax
    animations.ts        Scroll storytelling: SplitText masked reveals, story line
                         drawing, community colour journey, clip-path photo reveals
                         with inner parallax, divider scrub, marquee w/ velocity,
                         testimonial scrub, counters
    tilt.ts              3D product-card tilt: photo counter-parallax on a deeper
                         Z-plane, light-tracking glow overlay
    cart.ts              Cart state + localStorage, fly-to-cart drop, slide drawer,
                         WhatsApp checkout handoff
    accordions.ts        Native <details> accordions with GSAP height animation
    sound.ts             Optional ambient forest audio, synthesised with Web Audio
                         (zero network bytes), muted by default
```

## Product imagery trick

All three product cards share ONE photograph (`jars-trio.jpg`, which shows the
250g / 500g / 1kg jars side by side). Each card crops into its own jar with
`background-size`/`background-position` custom properties — three "product
renders" for the bytes of one image.

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

- The hero downloads only the video cut that matches the viewport, pauses when
  off-screen, and layers Ken-Burns drift + scroll parallax over the film plane.
- The marquee's speed is modulated by scroll velocity (`ScrollTrigger.getVelocity`).
- The ambient forest sound is synthesised (filtered brown noise + LFO breathing +
  randomised bird chirps) — no audio files shipped.
