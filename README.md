# PureNgood Farms — *Good that is Pure*

A cinematic, award-grade site for a South Indian farm-foods brand: traditionally
made foods crafted on village farms across the Western and Eastern Ghats of
Tamil Nadu and Kerala. Built for speed first.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Build | **Vite 6 + Vanilla TypeScript** | Zero framework runtime — fastest possible LCP |
| Styling | **Tailwind CSS v4** | Design tokens via `@theme`, tiny purged output |
| Motion | **GSAP 3.13** (ScrollTrigger, ScrollToPlugin, SplitText) | rAF-driven, GPU-accelerated |
| Scroll | **Lenis** | Buttery smooth scrolling, synced to ScrollTrigger via the GSAP ticker |
| Hero | **Native video** (desktop + mobile cuts) | Only the matching cut is downloaded; poster fallback for reduced motion |

**Total JS: ~62 KB gzipped.** All photography is pre-compressed and served with
explicit dimensions and `loading="lazy"`, so there are zero layout shifts.

## The colour system

The logo is pure **`#F9FE2E`** — a neon that is nearly invisible on white
(**1.03:1**) but explosive on near-black (**18:1**). So the whole site is built
on an ink canvas, with the neon reserved for accents, full-bleed brand blocks,
and knockout type.

| Token | Value | Role |
|---|---|---|
| `--color-ink` | `#0B0B07` | Canvas |
| `--color-ink-soft` | `#14140E` | Elevated surfaces |
| `--color-line` | `#26261C` | Hairlines |
| `--color-neon` | `#F9FE2E` | The brand |
| `--color-neon-deep` | `#5A6100` | The neon darkened, for use *on light* |
| `--color-bone` | `#F2F2E4` | Light sections + text on ink |

**The one rule that matters:** neon text only ever sits on ink. On the light
(bone) sections it is swapped for `--color-neon-deep`, which keeps the brand hue
at 5.9:1 instead of a completely unreadable 1.03:1.

Type pairs **Instrument Serif** (editorial display) with **Outfit** (geometric
sans, echoing the logo's rounded letterforms).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-checks, then builds to dist/
npm run preview  # serve the production build
```

## Typography gotcha worth knowing

Instrument Serif has a **1.30em content area** (0.99 ascent + 0.31 descent) with
ink descenders reaching **0.22em** below the baseline. Our display line-heights
are deliberately tighter than that (0.86–1.1), so the line box is *shorter than
the glyphs* — and GSAP's `mask: 'lines'` wrapper (`overflow: clip`) shears the
tails off every g, y, p and j.

The fix in `main.css` extends each mask's clip box downward with `padding-bottom`
and pulls the next line back up with an equal negative margin, so the tight
rhythm is preserved exactly. Reveals then animate from `-135%` (`MASK_OFFSET` in
`animations.ts`) so copy still starts fully outside the taller box.

**If you add a new masked heading, add its selector to that rule.** Likewise,
never put a `<figcaption>` inside `.img-reveal` — that frame clips its overflow
to animate, and will eat the caption. Wrap it: `.img-figure > .img-reveal + figcaption`.

## Structure

```
index.html               Landing page + SEO meta + JSON-LD (LocalBusiness, Product)
products.html            Full catalog (generated markup, static for SEO)
public/
  images/                logo.png + photography
  video/                 hero-desktop.mp4 + hero-mobile.mp4
  favicon.png
src/
  main.ts                Landing page entry: preloader, newsletter, map link
  products.ts            Catalog page entry
  styles/main.css        Design tokens + components + film grain
  modules/
    motion.ts            Reduced-motion / touch / DPR helpers
    scroll.ts            Lenis ⟷ ScrollTrigger sync, smooth anchor scrolling
    cursor.ts            Magnetic cursor (velocity squash, blob morph, labels)
    nav.ts               Full-screen mobile menu with focus trap (below lg)
    hero-video.ts        Viewport-matched video, visibility-aware playback,
                         Ken-Burns drift, scroll depth parallax
    animations.ts        SplitText masked reveals, clip-path photo unveils with
                         inner parallax, divider scrub, velocity-driven marquee
    tilt.ts              3D product-card tilt with photo counter-parallax
    cart.ts              Cart + localStorage, fly-to-cart, drawer, WhatsApp checkout
    accordions.ts        Native <details> with GSAP height animation
    sound.ts             Optional ambient audio, synthesised with Web Audio
```

## Page sections

**Landing** — Hero → marquee → Our Beginning + Our Values → The Heart of Our
Brand (divider) → Featured Product: Deep Forest Raw Blossom Honey (provenance,
taste & use, buy) → Our Product Range (10 equal cards) → How We Work → Bring
PureNgood Home → Contact.

**Products** (`/products.html`) — the full catalog: all 10 products, each with
its icon, description, taste notes, suggested use and a Buy Now panel.

## How "Buy Now" works

Every product carries the same Buy Now button — no category is second-class.
Behaviour is driven purely by whether a price exists:

| Product state | Buy Now does | Card shows |
|---|---|---|
| Has a price (honey, 3 sizes) | Adds the selected size to the cart and opens the drawer | `From ₹349` |
| No price yet (the other nine) | Opens a pre-filled WhatsApp order for that product | `Price on request` |

The nine unpriced products are unpriced because **the content brief contains no
pricing** — nothing was invented. To upgrade any of them to real cart checkout,
add `data-price="..."` to its `[data-buy-now]` button (or a `[data-size-select]`
with `data-price` / `data-name` options, as honey has); `cart.ts` picks it up
with no other change.

To regenerate `products.html` after editing the catalog, the product data lives
in the generator script referenced in the commit history — or edit the static
HTML directly, which is the source of truth.

## Bits worth stealing

- **One photo, three products.** All three jar cards crop into a single
  `jars-trio.jpg` via `background-size`/`background-position` custom properties.
- **The preloader can't trap the page.** It is driven by rAF, which browsers
  suspend in background tabs — so it skips entirely when `document.hidden` at
  boot, and carries a 4s hard failsafe.
- **The marquee reacts to you**, modulating its speed from `ScrollTrigger.getVelocity()`.
- **Ambient sound is synthesised** (filtered brown noise + LFO breathing +
  randomised chirps) — no audio files shipped.

## Notes for the owner

A few values are placeholders and should be replaced before launch:

- **Prices** (₹349 / ₹649 / ₹1,199) — the content document contains no pricing.
- **Phone, WhatsApp, email, Instagram handle** — currently sample values.
- The **`Logo 3D.mp4`** in `New Creatives/` is unused: at 34 MB it would
  dominate the page weight. Worth re-exporting at ~2 MB if you want it in the
  preloader or hero.
- The hero videos are 11–12 MB each. Re-exporting at ~4–5 Mbps (or WebM) would
  noticeably speed up first paint on slow connections.
