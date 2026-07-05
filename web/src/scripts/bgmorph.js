// Scroll-driven background morph. Only runs when motionOK; otherwise
// sections keep their static CSS (see global.css).
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
}
