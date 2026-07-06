/**
 * WebGL hero — "liquid honey" experience built with OGL (~15kb).
 *
 * Everything happens in ONE fullscreen fragment shader (a single draw call):
 *  - slow-flowing honey currents (domain-warped fbm noise)
 *  - a faint honeycomb lattice breathing beneath the surface
 *  - pollen motes drifting upward in three parallax layers
 *  - a golden light that follows the pointer with smoothing
 *
 * The loop pauses when the hero leaves the viewport or the tab is hidden.
 */
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { cappedDPR, isTouchDevice } from './motion';

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse; // smoothed, 0..1

  varying vec2 vUv;

  // --- value noise + fbm -------------------------------------------------
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(11.3, 7.7);
      a *= 0.5;
    }
    return v;
  }

  // --- hexagonal lattice (honeycomb) --------------------------------------
  float hexDist(vec2 p) {
    p = abs(p);
    return max(dot(p, normalize(vec2(1.0, 1.73))), p.x);
  }
  float hexGrid(vec2 p) {
    vec2 r = vec2(1.0, 1.73);
    vec2 h = r * 0.5;
    vec2 a = mod(p, r) - h;
    vec2 b = mod(p - h, r) - h;
    vec2 g = dot(a, a) < dot(b, b) ? a : b;
    return hexDist(g);
  }

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2(vUv.x * aspect, vUv.y);
    vec2 m = vec2(uMouse.x * aspect, uMouse.y);

    // Honey flow: two layers of domain-warped noise creeping downward.
    vec2 warp = vec2(
      fbm(p * 1.8 + vec2(0.0, uTime * 0.05)),
      fbm(p * 1.8 - vec2(uTime * 0.03, 0.0))
    );
    float flow = fbm(p * 2.2 + warp * 1.4 + vec2(0.0, uTime * 0.06));

    // Palette: deep cocoa -> forest honey -> golden amber.
    vec3 cocoa  = vec3(0.10, 0.06, 0.03);
    vec3 forest = vec3(0.45, 0.26, 0.06);
    vec3 amber  = vec3(0.96, 0.73, 0.26);

    vec3 col = mix(cocoa, forest, smoothstep(0.25, 0.75, flow));
    col = mix(col, amber, smoothstep(0.68, 0.95, flow) * 0.55);

    // Honeycomb lattice, revealed by the flow and near the pointer.
    float hex = hexGrid(p * 9.0 + vec2(0.0, uTime * 0.12));
    float lattice = smoothstep(0.46, 0.5, hex);
    float mouseGlowMask = exp(-distance(p, m) * 2.6);
    col += amber * lattice * (0.025 + mouseGlowMask * 0.10) * smoothstep(0.3, 0.7, flow);

    // Pollen motes: three parallax layers of drifting glow points.
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float scale = 6.0 + fi * 5.0;
      float speed = 0.02 + fi * 0.015;
      // parallax: deeper layers react more to the pointer
      vec2 par = (m - vec2(aspect * 0.5, 0.5)) * (0.02 + fi * 0.03);
      vec2 q = p * scale + vec2(0.0, -uTime * speed * scale) - par * scale;
      vec2 cell = floor(q);
      vec2 f = fract(q) - 0.5;
      vec2 jitter = vec2(hash(cell), hash(cell + 19.19)) - 0.5;
      float sparkle = hash(cell + 7.7);
      float d = length(f - jitter * 0.6);
      float twinkle = 0.6 + 0.4 * sin(uTime * (1.0 + sparkle * 2.0) + sparkle * 6.28);
      float dot_ = smoothstep(0.10, 0.0, d) * step(0.82, sparkle) * twinkle;
      col += amber * dot_ * (0.35 - fi * 0.09);
    }

    // Pointer light: warm, soft, alive.
    col += amber * exp(-distance(p, m) * 3.2) * 0.22;

    // Cinematic vignette.
    float vig = smoothstep(1.25, 0.35, distance(vUv, vec2(0.5, 0.45)));
    col *= mix(0.55, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function initHero(reduced: boolean): void {
  const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  let renderer: Renderer;
  try {
    renderer = new Renderer({ canvas, dpr: cappedDPR(), alpha: false, antialias: false });
  } catch {
    return; // no WebGL — the CSS gradient overlay still gives a branded hero
  }
  const gl = renderer.gl;

  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: [1, 1] },
      uMouse: { value: [0.5, 0.5] },
    },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const resize = (): void => {
    const { clientWidth: w, clientHeight: h } = canvas.parentElement as HTMLElement;
    renderer.setSize(w, h);
    program.uniforms.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight];
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Smoothed pointer (shader-space: y up).
  const target = { x: 0.5, y: 0.5 };
  const smooth = { x: 0.5, y: 0.5 };
  if (!isTouchDevice()) {
    window.addEventListener('pointermove', (e) => {
      target.x = e.clientX / innerWidth;
      target.y = 1 - e.clientY / innerHeight;
    }, { passive: true });
  }

  if (reduced) {
    // One static, beautiful frame — no motion.
    program.uniforms.uTime.value = 12;
    renderer.render({ scene: mesh });
    return;
  }

  // Render only while the hero is on screen and the tab is visible.
  let inView = true;
  let rafId = 0;
  let running = false;
  const start = performance.now();

  const frame = (now: number): void => {
    if (!inView || document.hidden) {
      running = false;
      return;
    }
    smooth.x += (target.x - smooth.x) * 0.05;
    smooth.y += (target.y - smooth.y) * 0.05;
    program.uniforms.uTime.value = (now - start) / 1000;
    program.uniforms.uMouse.value = [smooth.x, smooth.y];
    renderer.render({ scene: mesh });
    rafId = requestAnimationFrame(frame);
  };
  const run = (): void => {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  };

  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) run();
    else cancelAnimationFrame(rafId);
  }).observe(canvas);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) run();
  });

  run();
}
