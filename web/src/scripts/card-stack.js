// Ecosystem card-stack: fanned carousel of brand cards. Pure geometry helpers
// are exported for unit testing; initCardStack() wires them to the DOM + GSAP.
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(Draggable);

const AUTO_ADVANCE_MS = 3500;
const SWIPE_THRESHOLD_PX = 120;
const SWIPE_VELOCITY = 500;

/**
 * Wrap an index into [0, len). Pure/unit-testable.
 * @param {number} n
 * @param {number} len
 * @returns {number}
 */
export function wrapIndex(n, len) {
  if (len <= 0) return 0;
  return ((n % len) + len) % len;
}

/**
 * Signed offset of card `i` from `active`, wrapped to the minimal-magnitude
 * representative (e.g. len=6, active=0, i=5 -> -1, not +5). Pure/unit-testable.
 * @param {number} i
 * @param {number} active
 * @param {number} len
 * @returns {number}
 */
export function signedOffset(i, active, len) {
  if (len <= 0) return 0;
  let d = wrapIndex(i - active, len);
  if (d > len / 2) d -= len;
  return d;
}

/**
 * Compute the fan transform for a card at a given signed offset from active.
 * Cards beyond maxVisible are flagged hidden (opacity 0, non-interactive).
 * Pure/unit-testable — no DOM needed.
 * @param {number} offset - signed offset from active card (0 = active)
 * @param {{spacing?: number, stepDeg?: number, depth?: number, maxVisible?: number}} [opts]
 * @returns {{x:number,y:number,rotateZ:number,scale:number,zIndex:number,opacity:number,hidden:boolean}}
 */
export function fanTransform(offset, opts = {}) {
  const { spacing = 90, stepDeg = 8, depth = 24, maxVisible = 2 } = opts;
  const abs = Math.abs(offset);
  const hidden = abs > maxVisible;
  return {
    x: offset * spacing,
    y: abs === 0 ? -depth : abs * (depth / 2),
    rotateZ: offset * stepDeg,
    scale: abs === 0 ? 1 : Math.max(1 - abs * 0.12, 0.6),
    zIndex: 100 - abs,
    opacity: hidden ? 0 : Math.max(1 - abs * 0.3, 0.4),
    hidden,
  };
}

/**
 * Initialize the ecosystem card stack inside `root`.
 * @param {HTMLElement} root - element with [data-card-stack]
 * @returns {{ destroy: () => void }}
 */
export default function initCardStack(root) {
  const cards = [...root.querySelectorAll('.stack-card')];
  const dots = [...root.querySelectorAll('.stack-dots button')];
  if (cards.length === 0) return { destroy() {} };

  const len = cards.length;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 700px)').matches;
  const opts = mobile
    ? { spacing: 46, stepDeg: 6, depth: 14, maxVisible: 1 }
    : { spacing: 150, stepDeg: 8, depth: 32, maxVisible: 2 };

  let active = 0;
  let draggable = null;
  let autoTimer = null;

  function render(animate) {
    cards.forEach((card, i) => {
      const offset = signedOffset(i, active, len);
      const t = fanTransform(offset, opts);
      card.classList.toggle('is-active', offset === 0);
      card.setAttribute('aria-hidden', t.hidden ? 'true' : 'false');
      card.setAttribute('tabindex', t.hidden ? '-1' : '0');
      card.style.pointerEvents = t.hidden ? 'none' : '';
      const vars = { x: t.x, y: t.y, rotateZ: t.rotateZ, scale: t.scale, zIndex: t.zIndex, opacity: t.opacity };
      if (animate && !reducedMotion) {
        gsap.to(card, { ...vars, duration: 0.6, ease: 'power3.out' });
      } else {
        gsap.set(card, vars);
      }
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === active);
      dot.setAttribute('aria-current', i === active ? 'true' : 'false');
    });
    setupDraggable();
  }

  function goTo(i, animate = true) {
    active = wrapIndex(i, len);
    render(animate);
  }
  function next() { goTo(active + 1); }
  function prev() { goTo(active - 1); }

  function setupDraggable() {
    if (draggable) { draggable.kill(); draggable = null; }
    if (reducedMotion) return;
    const activeCard = cards[active];
    if (!activeCard) return;
    draggable = Draggable.create(activeCard, {
      type: 'x',
      inertia: false,
      onDragEnd() {
        if (this.x <= -SWIPE_THRESHOLD_PX || this.getVelocity('x') <= -SWIPE_VELOCITY) next();
        else if (this.x >= SWIPE_THRESHOLD_PX || this.getVelocity('x') >= SWIPE_VELOCITY) prev();
        else render(true);
      },
    })[0];
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }
  function startAuto() {
    if (reducedMotion || len <= 1) return;
    stopAuto();
    autoTimer = setInterval(next, AUTO_ADVANCE_MS);
  }

  function onDotClick(e) {
    const idx = dots.indexOf(e.currentTarget);
    if (idx !== -1) goTo(idx);
  }
  function onCardClick(e) {
    const card = e.currentTarget;
    const idx = cards.indexOf(card);
    const offset = signedOffset(idx, active, len);
    if (offset !== 0) {
      e.preventDefault();
      goTo(idx);
    }
    // active card's own link click passes through to navigate.
  }
  function onKeydown(e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  }

  dots.forEach((dot) => dot.addEventListener('click', onDotClick));
  cards.forEach((card) => card.addEventListener('click', onCardClick));
  root.addEventListener('keydown', onKeydown);
  root.addEventListener('mouseenter', stopAuto);
  root.addEventListener('mouseleave', startAuto);
  root.addEventListener('focusin', stopAuto);
  root.addEventListener('focusout', startAuto);

  render(false);
  startAuto();

  function destroy() {
    stopAuto();
    if (draggable) draggable.kill();
    dots.forEach((dot) => dot.removeEventListener('click', onDotClick));
    cards.forEach((card) => card.removeEventListener('click', onCardClick));
    root.removeEventListener('keydown', onKeydown);
    root.removeEventListener('mouseenter', stopAuto);
    root.removeEventListener('mouseleave', startAuto);
    root.removeEventListener('focusin', stopAuto);
    root.removeEventListener('focusout', startAuto);
  }

  return { destroy };
}
