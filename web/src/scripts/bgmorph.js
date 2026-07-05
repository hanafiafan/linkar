// Scroll-driven background morph + navbar reveal (Steps 3-4). Only runs when
// motionOK; otherwise sections/navbar keep their static CSS (see global.css).
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

if (motionOK) {
  gsap.registerPlugin(ScrollTrigger);

  // --- Step 3: background morph ---
  const sections = [...document.querySelectorAll('[data-bg]')];
  if (sections.length > 0) {
    const bg = document.createElement('div');
    bg.id = 'bg-morph';
    document.body.prepend(bg);
    document.body.classList.add('morph-active');

    gsap.set(bg, { backgroundColor: sections[0].dataset.bg });
    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 60%',
        end: 'bottom 60%',
        onEnter: () => gsap.to(bg, { backgroundColor: section.dataset.bg, duration: 0.6, ease: 'power2.out' }),
        onEnterBack: () => gsap.to(bg, { backgroundColor: section.dataset.bg, duration: 0.6, ease: 'power2.out' }),
      });
    });
  }

  // --- Step 4: navbar reveal (landing page only). Subpages (brand/program/blog)
  // reuse the ".hero" class for their own banner, so we key off ".hero__stats"
  // instead — a class unique to Hero.astro's landing-page markup.
  const hero = document.querySelector('.hero');
  const heroIsLanding = !!document.querySelector('.hero__stats');
  const header = document.getElementById('navbar');
  if (hero && heroIsLanding && header) {
    document.body.classList.add('navbar-gated');
    ScrollTrigger.create({
      trigger: hero,
      start: 'bottom 40%', // ~60% scrolled past hero
      onEnter: () => header.classList.add('is-revealed'),
      onLeaveBack: () => header.classList.remove('is-revealed'),
    });
  }
}
