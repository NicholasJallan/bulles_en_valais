// GSAP for the motion module (02-architecture.md §8): loaded with it, never in the initial bundle.
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { registerEases } from '@/lib/motion/eases.ts';

let ready = false;

/** Plugins and the easings of the tokens (`buoyant`, `surface`, `drift`, `sink`), once. */
export function setupGsap(): void {
  if (ready) return;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  registerEases(CustomEase);
  // The mobile address bar resizes the viewport: no refresh (and no jump) for that.
  ScrollTrigger.config({ ignoreMobileResize: true });
  ready = true;
}

export { gsap, ScrollTrigger, SplitText };
