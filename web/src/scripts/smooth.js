// Lenis smooth scroll, wired to GSAP's ticker + ScrollTrigger. Imported first in
// Base.astro so the instance exists before animations.js creates any triggers.
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

let lenis = null;

if (motionOK) {
  gsap.registerPlugin(ScrollTrigger);

  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Native in-page anchors (navbar links, "back to top", etc.) still need to
  // route through Lenis so the smoothing applies to the jump too.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"], a[href^="/#"]');
    if (!link) return;
    const hash = link.getAttribute('href').split('#')[1];
    if (!hash) return;
    const target = document.getElementById(hash);
    if (!target) return;
    e.preventDefault();

    // Instantly morph background color to the target section's color to prevent text visibility bugs
    const targetBg = target.getAttribute('data-bg');
    if (targetBg) {
      const bg = document.getElementById('bg-morph');
      if (bg) {
        gsap.to(bg, { backgroundColor: targetBg, duration: 0.8, ease: 'power2.out' });
      }
    }

    lenis.scrollTo(target, { 
      offset: 0,
      onComplete: () => {
        ScrollTrigger.refresh();
      }
    });
  });
}

export default lenis;
