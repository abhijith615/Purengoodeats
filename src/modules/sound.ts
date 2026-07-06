/**
 * Optional ambient forest sound — synthesised live with the Web Audio API,
 * so it costs zero network bytes. A bed of lowpass-filtered noise ("wind
 * through leaves") with a slow breathing LFO and occasional soft bird-like
 * chirps. Muted by default; the user opts in via the header toggle.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let chirpTimer: number | undefined;

export function initSound(): void {
  const toggle = document.getElementById('sound-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const on = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(on));
    if (on) start();
    else stop();
  });
}

function start(): void {
  if (!ctx) buildGraph();
  if (!ctx || !master) return;
  void ctx.resume();
  master.gain.cancelScheduledValues(ctx.currentTime);
  // Very subtle — an atmosphere, not a soundtrack.
  master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2.5);
  scheduleChirp();
}

function stop(): void {
  window.clearTimeout(chirpTimer);
  if (!ctx || !master) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
  const c = ctx;
  window.setTimeout(() => void c.suspend(), 1200);
}

/** Build the audio graph once; toggling only ramps the master gain. */
function buildGraph(): void {
  ctx = new AudioContext();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // Wind bed: looped noise buffer → gentle lowpass → breathing LFO.
  const seconds = 4;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    // Brown-ish noise: integrate white noise for a soft, deep texture.
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 420;

  const breathe = ctx.createGain();
  breathe.gain.value = 0.7;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.08; // one slow breath every ~12s
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0.25;
  lfo.connect(lfoDepth).connect(breathe.gain);

  noise.connect(lowpass).connect(breathe).connect(master);
  noise.start();
  lfo.start();
}

/** Soft two-note chirps at random, distant intervals. */
function scheduleChirp(): void {
  chirpTimer = window.setTimeout(() => {
    if (ctx && master && ctx.state === 'running') {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      const base = 1800 + Math.random() * 1200;
      osc.frequency.setValueAtTime(base, t);
      osc.frequency.exponentialRampToValueAtTime(base * 1.4, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(base * 0.9, t + 0.18);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.02, t + 0.03);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      osc.connect(env).connect(master);
      osc.start(t);
      osc.stop(t + 0.3);
    }
    scheduleChirp();
  }, 6000 + Math.random() * 14000);
}
