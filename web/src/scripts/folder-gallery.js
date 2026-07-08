// Interactive folder gallery: click to open, photos fan into a draggable row,
// drag any photo down to close. Loaded lazily — see FolderGallery mount in Hero.astro.
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';

const CLOSE_DRAG_THRESHOLD = 100; // px downward drag that triggers close
const OPEN_EASE = 'back.out(1.4)';

/**
 * Compute the spread (x, y, rotation) for each photo index when the folder opens,
 * fanning them across the panel width. Pure/unit-testable — no DOM needed.
 * @param {number} count - number of photos
 * @param {number} spacing - horizontal spacing between photo centers, in px
 * @returns {Array<{ x: number, y: number, rotation: number }>}
 */
export function computeSpreadLayout(count, spacing = 150) {
  const mid = (count - 1) / 2;
  return Array.from({ length: count }, (_, i) => ({
    x: (i - mid) * spacing,
    y: 0,
    rotation: (i - mid) * 3,
  }));
}

/**
 * Initialize the folder gallery interaction inside `root`.
 * @param {HTMLElement} root - element with [data-folder-gallery]
 * @returns {{ destroy: () => void }}
 */
export default function initFolderGallery(root) {
  const trigger = root.querySelector('.folder-gallery__trigger');
  const photos = [...root.querySelectorAll('.folder-gallery__stack-photo')];
  const hint = root.querySelector('[data-folder-hint]');
  if (!trigger || photos.length === 0) return { destroy() {} };

  root.classList.add('js-active');

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.registerPlugin(Draggable);

  let open = false;
  let draggables = [];
  const layout = computeSpreadLayout(photos.length);

  function closedTransform(i) {
    return { x: 0, y: -10, rotation: (i - (photos.length - 1) / 2) * 4 };
  }

  function openGallery() {
    if (open) return;
    open = true;
    root.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');

    photos.forEach((photo, i) => {
      const pos = layout[i];
      if (reducedMotion) {
        gsap.set(photo, { x: pos.x, y: pos.y, rotation: 0 });
      } else {
        gsap.to(photo, { x: pos.x, y: pos.y, rotation: pos.rotation, duration: 0.6, ease: OPEN_EASE, delay: i * 0.05 });
      }
    });

    if (!reducedMotion) {
      enableDragging();
      if (hint) {
        hint.hidden = false;
        requestAnimationFrame(() => hint.classList.add('is-visible'));
      }
    }
  }

  function closeGallery() {
    if (!open) return;
    open = false;
    root.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    disableDragging();
    if (hint) hint.classList.remove('is-visible');

    photos.forEach((photo, i) => {
      const pos = closedTransform(i);
      gsap.to(photo, { x: pos.x, y: pos.y, rotation: pos.rotation, duration: reducedMotion ? 0 : 0.45, ease: 'power2.inOut' });
    });
  }

  function toggle() {
    if (open) closeGallery();
    else openGallery();
  }

  function enableDragging() {
    draggables = photos.map((photo) =>
      Draggable.create(photo, {
        type: 'x,y',
        inertia: false,
        onDragEnd() {
          if (this.y - (layout[photos.indexOf(photo)]?.y ?? 0) > CLOSE_DRAG_THRESHOLD) {
            closeGallery();
          }
        },
      })[0]
    );
  }

  function disableDragging() {
    draggables.forEach((d) => d.kill());
    draggables = [];
  }

  function onTriggerClick() {
    toggle();
  }

  function onKeydown(e) {
    if (e.key === 'Escape' && open) closeGallery();
  }

  document.addEventListener('keydown', onKeydown);

  if (reducedMotion) {
    // Static fallback: open flat, no drag, no hint, no click needed to explore.
    // Permanent state — trigger is inert, so no click listener is attached.
    openGallery();
    trigger.setAttribute('aria-disabled', 'true');
  } else {
    trigger.addEventListener('click', onTriggerClick);
  }

  function destroy() {
    root.classList.remove('js-active');
    if (!reducedMotion) trigger.removeEventListener('click', onTriggerClick);
    document.removeEventListener('keydown', onKeydown);
    disableDragging();
  }

  return { destroy };
}
