// Premium custom cursor with smooth follow (lerp), scroll progress ring & interactive scale effects.
import gsap from 'gsap';

const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
const isDesktop = window.matchMedia('(pointer: fine)').matches;

if (motionOK && isDesktop) {
  const cursor = document.getElementById('custom-cursor');
  const cursorRing = document.getElementById('custom-cursor-ring');

  if (cursor && cursorRing) {
    // Sembunyikan kursor asli hanya kalau kursor custom benar-benar aktif
    document.body.classList.add('has-cursor');
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let isVisible = false;

    // Inject SVG progress circle into the cursor ring
    cursorRing.innerHTML = `
      <svg class="cursor-ring-svg" width="36" height="36" viewBox="0 0 36 36">
        <circle class="ring-bg" cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"></circle>
        <circle class="ring-progress" cx="18" cy="18" r="16" fill="none" stroke="#F26A21" stroke-width="1.5" stroke-dasharray="100.5" stroke-dashoffset="100.5" transform="rotate(-90 18 18)"></circle>
      </svg>
    `;

    const progressCircle = cursorRing.querySelector('.ring-progress');

    // Initially hide elements
    gsap.set([cursor, cursorRing], { opacity: 0 });

    const xSetter = gsap.quickSetter(cursor, 'x', 'px');
    const ySetter = gsap.quickSetter(cursor, 'y', 'px');
    const rxSetter = gsap.quickSetter(cursorRing, 'x', 'px');
    const rySetter = gsap.quickSetter(cursorRing, 'y', 'px');

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;

      if (!isVisible) {
        gsap.to([cursor, cursorRing], { opacity: 1, duration: 0.3 });
        isVisible = true;
      }
    });

    // Update positions: snappy dot + lerped progress ring
    gsap.ticker.add(() => {
      xSetter(mx);
      ySetter(my);

      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      rxSetter(rx);
      rySetter(ry);
    });

    // Track scroll percent to update progress circle
    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrollPercent = window.scrollY / scrollHeight;
      const offset = 100.5 * (1 - Math.min(Math.max(scrollPercent, 0), 1));
      if (progressCircle) {
        progressCircle.style.strokeDashoffset = String(offset);
      }
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress(); // initial trigger

    // Hover states for links, buttons, and brand cards
    const INTERACTIVES = 'a, button, [role="button"], .btn, .stack-card, .portfolio-row';
    
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(INTERACTIVES);
      if (target) {
        cursor.classList.add('is-hovering');
        cursorRing.classList.add('is-hovering');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest(INTERACTIVES);
      if (target) {
        cursor.classList.remove('is-hovering');
        cursorRing.classList.remove('is-hovering');
      }
    });

    // Hide cursor when mouse leaves the document window
    document.addEventListener('mouseleave', () => {
      cursor.classList.add('is-hidden');
      cursorRing.classList.add('is-hidden');
    });

    document.addEventListener('mouseenter', () => {
      cursor.classList.remove('is-hidden');
      cursorRing.classList.remove('is-hidden');
    });
  }
}
