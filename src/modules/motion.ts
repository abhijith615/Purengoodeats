/** Shared motion utilities. */

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isTouchDevice(): boolean {
  return window.matchMedia('(pointer: coarse)').matches;
}

/** Clamp device pixel ratio so 4k screens don't tank the WebGL fill rate. */
export function cappedDPR(max = 1.75): number {
  return Math.min(window.devicePixelRatio || 1, max);
}
