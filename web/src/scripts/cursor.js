// Magnetic custom cursor — desktop only, motionOK gated.
// Tracks mouse position with GSAP spring, expands on interactive elements.
import gsap from 'gsap';

const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
const isDesktop = window.matchMedia('(min-width: 1000px) and (pointer: fine)').matches;

if (motionOK && isDesktop) {
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.innerHTML = '<div class="cursor__dot"></div><div class="cursor__ring"></div><span class="cursor__label"></span>';
  document.body.appendChild(cursor);
  document.body.classList.add('has-cursor');

  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  const label = cursor.querySelector('.cursor__label');

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  // Smooth follow with GSAP quickTo
  const xDot = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power3.out' });
  const yDot = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power3.out' });

  gsap.ticker.add(() => {
    xDot(mx);
    yDot(my);
  });

  // Magnetic effect + labels on hover
  const SELECTORS = 'a, button, [role="button"], .scard, .gitem, .xitem, .stack-card, .btn';

  const LABELS = {
    '.gitem': 'VIEW',
    '.xitem': 'VIEW',
    '.stack-card': 'EXPLORE',
    '.scard': 'EXPLORE',
    '.btn-submit': 'SEND',
    '.btn-primary': 'GO',
    '.btn-ghost': 'GO',
  };

  function getLabel(el) {
    for (const [sel, lbl] of Object.entries(LABELS)) {
      if (el.matches(sel) || el.closest(sel)) return lbl;
    }
    return '';
  }

  document.addEventListener('mouseover', (e) => {
    const delightTarget = e.target.closest('[data-cursor="delight"]');
    if (delightTarget) {
      cursor.classList.add('is-delight');
      label.textContent = 'CLICK!';
      return;
    }
    const editTarget = e.target.closest('[data-cursor="edit"]');
    if (editTarget) {
      cursor.classList.add('is-edit');
      label.textContent = 'EDIT!';
      return;
    }
    const target = e.target.closest(SELECTORS);
    if (target) {
      cursor.classList.add('is-hover');
      const l = getLabel(target);
      if (l) label.textContent = l;
    }
  });

  document.addEventListener('mouseout', (e) => {
    const delightTarget = e.target.closest('[data-cursor="delight"]');
    if (delightTarget) {
      cursor.classList.remove('is-delight');
      label.textContent = '';
      return;
    }
    const editTarget = e.target.closest('[data-cursor="edit"]');
    if (editTarget) {
      cursor.classList.remove('is-edit');
      label.textContent = '';
      return;
    }
    const target = e.target.closest(SELECTORS);
    if (target) {
      cursor.classList.remove('is-hover');
      label.textContent = '';
    }
  });
}
