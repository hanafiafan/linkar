import gsap from 'gsap';

const trigger = document.querySelector('.navbar__mega-trigger');
const mega = document.getElementById('mega');

if (trigger && mega) {
  const motionOK = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  let open = false;

  const setOpen = (next) => {
    open = next;
    trigger.setAttribute('aria-expanded', String(open));
    if (open) {
      mega.hidden = false;
      const h = mega.querySelector('.mega__inner').scrollHeight;
      if (motionOK) {
        gsap.fromTo(mega, { height: 0 }, { height: h, duration: .35, ease: 'power2.out', onComplete: () => { mega.style.height = 'auto'; } });
      } else {
        mega.style.height = `${h}px`;
      }
    } else {
      if (motionOK) {
        gsap.set(mega, { height: mega.scrollHeight });
        gsap.to(mega, { height: 0, duration: .25, ease: 'power2.in', onComplete: () => { mega.hidden = true; } });
      } else {
        mega.style.height = '0px';
        mega.hidden = true;
      }
    }
  };

  trigger.addEventListener('click', () => setOpen(!open));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) {
      setOpen(false);
      trigger.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (open && !mega.contains(e.target) && e.target !== trigger) setOpen(false);
  });
}
