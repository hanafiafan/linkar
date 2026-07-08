// Interactive 3D extruded LINKAR logo for the hero panel.
// Loaded via dynamic import only — see Hero.astro for the feature-gated loader.
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

const NAVY = 0x1f2b5b;
const ORANGE = 0xf26a21;

const DPR_CAP = 2;
const FOV = 35;
const EXTRUDE_DEPTH_RATIO = 0.1; // ~10% of mark width
const BEVEL_SIZE_RATIO = 0.015;
const ROTATE_CLAMP = 0.4; // rad, both axes
const LERP_SPEED = 0.08;
const IDLE_ROTATE_SPEED = 0.08; // rad/sec
const FIT_MARGIN = 1.2; // 20% breathing room around the mesh at max rotation

/**
 * Group SVGLoader paths by fill color. Pure/unit-testable — no WebGL/DOM needed.
 * @param {Array<{color?: string, path: any}>} paths
 * @returns {Map<string, any[]>} color (lowercased hex) -> array of paths
 */
export function groupPathsByColor(paths) {
  const groups = new Map();
  for (const item of paths || []) {
    const color = (item && item.color ? String(item.color) : '#1f2b5b').toLowerCase();
    if (!groups.has(color)) groups.set(color, []);
    groups.get(color).push(item.path);
  }
  return groups;
}

/**
 * Camera distance that fits a sphere of `radius` fully inside the vertical FOV,
 * with `margin` extra breathing room (1.2 = 20%) so the mesh never clips at its
 * widest silhouette — i.e. when rotated to the max clamp on either axis, the
 * effective bounding sphere (rotation-invariant) still fits within frame.
 * Pure/unit-testable — no WebGL/DOM needed.
 * @param {number} radius - bounding sphere radius of the mesh, in mesh units
 * @param {number} fovDeg - vertical field of view, in degrees
 * @param {number} margin - multiplier applied to the fitted distance (>1 = more room)
 * @returns {number} camera distance along the view axis
 */
export function fitDistanceForSphere(radius, fovDeg, margin = FIT_MARGIN) {
  const fovRad = (fovDeg * Math.PI) / 180;
  return (radius / Math.sin(fovRad / 2)) * margin;
}

/**
 * The binding FOV for fitting an object in frame is the SMALLER of vertical and
 * horizontal FOV. `vFovDeg` is the camera's (vertical) fov; horizontal FOV is
 * derived from aspect = width / height. Pure/unit-testable — no WebGL/DOM needed.
 * @param {number} vFovDeg - vertical field of view, in degrees
 * @param {number} aspect - width / height
 * @returns {number} the smaller of vertical/horizontal FOV, in degrees
 */
export function effectiveFovDeg(vFovDeg, aspect) {
  const v = (vFovDeg * Math.PI) / 180;
  const h = 2 * Math.atan(Math.tan(v / 2) * aspect);
  return (Math.min(v, h) * 180) / Math.PI;
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

async function loadMarkGroup() {
  const svgUrl = new URL('../assets/logo-mark.svg', import.meta.url);
  const res = await fetch(svgUrl);
  const svgText = await res.text();

  const loader = new SVGLoader();
  const data = loader.parse(svgText);

  const flatPaths = data.paths.map((path) => ({
    color: `#${path.color.getHexString()}`,
    path,
  }));
  const byColor = groupPathsByColor(flatPaths);

  const group = new THREE.Group();
  const size = 100; // SVG viewBox is 0 0 100 100
  const depth = size * EXTRUDE_DEPTH_RATIO;
  const bevelSize = size * BEVEL_SIZE_RATIO;

  const materials = {
    [`#${new THREE.Color(NAVY).getHexString()}`]: new THREE.MeshStandardMaterial({ color: NAVY, metalness: 0.2, roughness: 0.5 }),
    [`#${new THREE.Color(ORANGE).getHexString()}`]: new THREE.MeshStandardMaterial({ color: ORANGE, metalness: 0.2, roughness: 0.5 }),
  };
  const fallbackMaterial = new THREE.MeshStandardMaterial({ color: NAVY, metalness: 0.2, roughness: 0.5 });

  for (const [color, colorPaths] of byColor) {
    const material = materials[color] || fallbackMaterial;
    for (const path of colorPaths) {
      const shapes = SVGLoader.createShapes(path);
      for (const shape of shapes) {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: true,
          bevelThickness: bevelSize,
          bevelSize,
          bevelSegments: 2,
          curveSegments: 24,
        });
        group.add(new THREE.Mesh(geometry, material));
      }
    }
  }

  // Center the group on its bounding box, measured in local (pre-flip) geometry
  // space — mixing world-space (post-flip) measurements with geometry.translate()
  // (which is always local-space) double-counts the Y flip and throws the mesh
  // wildly off-center. Center first, flip the group after.
  const box = new THREE.Box3();
  group.children.forEach((mesh) => box.expandByObject(mesh));
  const center = new THREE.Vector3();
  box.getCenter(center);
  group.children.forEach((mesh) => mesh.geometry.translate(-center.x, -center.y, -center.z));

  return group;
}

/**
 * Initialize the interactive 3D hero logo into the given canvas.
 * @param {HTMLElement} panelEl - the hero-photo panel (used for sizing + intersection).
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<{ destroy: () => void }>}
 */
export default async function initHero3D(panelEl, canvas) {
  if (!matchMedia('(min-width: 1000px)').matches) throw new Error('hero3d: below desktop breakpoint');
  if (!supportsWebGL()) throw new Error('hero3d: WebGL unsupported');

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const width = panelEl.clientWidth;
  const height = panelEl.clientHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
  renderer.setSize(width, height, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 1000);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(80, 120, 160);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
  fillLight.position.set(-120, -40, 80);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(ORANGE, 0.6);
  rimLight.position.set(-60, 60, -120);
  scene.add(rimLight);

  const markGroup = await loadMarkGroup();
  markGroup.scale.set(1.6, -1.6, 1.6);
  scene.add(markGroup);

  // Fit the camera to the mesh's bounding sphere (rotation-invariant) so the mark
  // never clips the frame even at ROTATE_CLAMP on either axis, with a 20% margin.
  const bounds = new THREE.Box3().setFromObject(markGroup);
  const sphere = new THREE.Sphere();
  bounds.getBoundingSphere(sphere);
  camera.position.set(0, 0, fitDistanceForSphere(sphere.radius, effectiveFovDeg(FOV, width / height)));

  let rafId = null;
  let running = false;
  const pointer = { x: 0, y: 0 };
  const targetRotation = { x: 0, y: 0 };

  function onPointerMove(e) {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    targetRotation.y = THREE.MathUtils.clamp(nx * ROTATE_CLAMP, -ROTATE_CLAMP, ROTATE_CLAMP);
    targetRotation.x = THREE.MathUtils.clamp(-ny * ROTATE_CLAMP, -ROTATE_CLAMP, ROTATE_CLAMP);
  }

  function onResize() {
    const w = panelEl.clientWidth;
    const h = panelEl.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  let lastTime = performance.now();
  function tick(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    const idle = Math.abs(targetRotation.x - pointer.x) < 0.001 && Math.abs(targetRotation.y - pointer.y) < 0.001;
    if (idle) targetRotation.y += IDLE_ROTATE_SPEED * dt;

    pointer.x += (targetRotation.x - pointer.x) * LERP_SPEED;
    pointer.y += (targetRotation.y - pointer.y) * LERP_SPEED;
    markGroup.rotation.x = pointer.x;
    markGroup.rotation.y = pointer.y;

    renderer.render(scene, camera);
    if (running) rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  let io = null;
  let onVisibilityChange = null;

  if (reducedMotion) {
    // Static frame at a flattering angle, no loop, no listeners.
    markGroup.rotation.set(-0.15, 0.35, 0);
    renderer.render(scene, camera);
  } else {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', onResize);

    io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible && document.visibilityState === 'visible') start();
        else stop();
      },
      { threshold: 0.1 }
    );
    io.observe(panelEl);

    onVisibilityChange = () => {
      if (document.hidden) stop();
      else if (io && panelEl.getBoundingClientRect().top < window.innerHeight) start();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    start();
  }

  function destroy() {
    stop();
    if (io) io.disconnect();
    if (onVisibilityChange) document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', onResize);
    markGroup.children.forEach((mesh) => mesh.geometry.dispose());
    renderer.dispose();
  }

  return { destroy };
}
