import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { MORPH_FROM, MORPH_TO, morphTargets } from './morph.js';

const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

if (motionOK) {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  document.querySelectorAll('[data-reveal]').forEach(el => {
    const kind = el.getAttribute('data-reveal');
    const from = kind === 'pop' ? { scale: 0, opacity: 0 }
               : kind === 'line' ? { scaleY: 0, transformOrigin: 'top', opacity: 1 }
               : { y: 26, opacity: 0 };
    gsap.from(el, { ...from, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  document.querySelectorAll('[data-stagger]').forEach(parent => {
    gsap.from(parent.children, { y: 30, opacity: 0, rotation: () => gsap.utils.random(-2.5, 2.5), duration: .7, ease: 'power3.out', stagger: .12,
      scrollTrigger: { trigger: parent, start: 'top 82%' } });
  });

  document.querySelectorAll('[data-split]').forEach(el => {
    const split = new SplitText(el, { type: 'words', mask: 'words' });
    gsap.from(split.words, { yPercent: 110, duration: .9, ease: 'power4.out', stagger: .06,
      scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  // scrub word color wipe
  document.querySelectorAll('[data-text-reveal]').forEach(el => {
    const split = new SplitText(el, { type: 'words' });
    gsap.set(split.words, { opacity: .22 });
    gsap.to(split.words, { opacity: 1, stagger: .06, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 45%', scrub: 1 } });
  });

  // pinned section intro (settle-in) — pin only on wider viewports, cramped on mobile
  if (window.matchMedia('(min-width: 900px)').matches) {
    document.querySelectorAll('[data-pin-intro]').forEach(el => {
      gsap.fromTo(el, { scale: .94, opacity: .85 }, { scale: 1, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 20%', end: '+=45%', pin: true, scrub: true, pinSpacing: true } });
    });
  }

  // clip-path trapezoid morph
  morphTargets().forEach(el => {
    gsap.fromTo(el, { clipPath: MORPH_FROM }, { clipPath: MORPH_TO, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 88%', end: 'top 45%', scrub: 1 } });
  });

  document.querySelectorAll('.marquee .marquee-track').forEach(track => {
    const tween = gsap.to(track, { xPercent: -50, ease: 'none', duration: 28, repeat: -1 });
    track.closest('.marquee').addEventListener('mouseenter', () => tween.pause());
    track.closest('.marquee').addEventListener('mouseleave', () => tween.play());
  });

  const header = document.querySelector('header');
  if (header) ScrollTrigger.create({ start: 60, onEnter: () => header.classList.add('is-scrolled'), onLeaveBack: () => header.classList.remove('is-scrolled') });

  // portfolio heading strip crossfade
  document.querySelectorAll('.strip').forEach(strip => {
    const imgs = [...strip.querySelectorAll('img')];
    if (imgs.length < 2) return;
    let cur = 0;
    setInterval(() => {
      imgs[cur].classList.remove('is-active');
      cur = (cur + 1) % imgs.length;
      imgs[cur].classList.add('is-active');
    }, 1600);
  });

  if (window.__linkarOdometer) window.__linkarOdometer(gsap, ScrollTrigger);

  document.addEventListener('visibilitychange', () => {
    gsap.globalTimeline[document.hidden ? 'pause' : 'resume']();
  });

  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
