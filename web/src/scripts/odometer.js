export function buildOdometer(el) {
  const value = el.dataset.value ?? '';
  el.setAttribute('aria-label', value + (el.dataset.suffix ?? ''));
  el.innerHTML = '';
  for (const ch of value) {
    if (/\d/.test(ch)) {
      const col = document.createElement('span');
      col.className = 'od-col'; col.dataset.target = ch; col.setAttribute('aria-hidden', 'true');
      for (let d = 0; d <= 9; d++) {
        const s = document.createElement('span');
        s.className = 'od-digit'; s.textContent = String(d); col.appendChild(s);
      }
      col.style.transform = `translateY(-${ch}em)`;
      el.appendChild(col);
    } else {
      const s = document.createElement('span');
      s.className = 'od-static'; s.textContent = ch; s.setAttribute('aria-hidden', 'true');
      el.appendChild(s);
    }
  }
  if (el.dataset.suffix) {
    const s = document.createElement('span');
    s.className = 'od-static'; s.textContent = el.dataset.suffix; s.setAttribute('aria-hidden', 'true');
    el.appendChild(s);
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.querySelector) {
  const els = [...document.querySelectorAll('[data-odometer]')];
  els.forEach(buildOdometer);
  window.__linkarOdometer = (gsap, ScrollTrigger) => {
    els.forEach(el => {
      el.querySelectorAll('.od-col').forEach((col, i) => {
        gsap.fromTo(col, { y: '-9em' }, {
          y: `-${col.dataset.target}em`,
          duration: 1.6, delay: i * .08, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' } });
      });
    });
  };
}
