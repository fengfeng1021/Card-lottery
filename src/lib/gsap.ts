import { gsap } from 'gsap';

// Project-wide GSAP defaults so every tween/timeline shares a consistent feel.
gsap.defaults({ duration: 0.6, ease: 'power3.out' });

/** True when the user has requested reduced motion at the OS level. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Returns `full` normally, or `reduced` when the user prefers reduced motion. */
export const motionValue = <T,>(full: T, reduced: T): T =>
  prefersReducedMotion() ? reduced : full;

export { gsap };
