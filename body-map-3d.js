// Optional presentation layer for the triage body map.
// This file never decides a department or urgency. It only renders a rotatable
// body model and reports the region button the citizen chooses.

const SPRUCE = 0x17634f;
const SPRUCE_DARK = 0x0f4335;
const MARIGOLD = 0xd97706;

function makeMaterial(THREE, color, roughness = 0.72) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02 });
}

function addLimb(THREE, group, start, end, radius = 0.18) {
  const startVector = new THREE.Vector3(...start);
  const endVector = new THREE.Vector3(...end);
  const direction = endVector.clone().sub(startVector);
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(radius, Math.max(0.1, direction.length() - (radius * 2)), 8, 12),
    makeMaterial(THREE, SPRUCE),
  );
  mesh.position.copy(startVector.clone().add(endVector).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  group.add(mesh);
}

function addNode(THREE, group, position) {
  const node = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 18, 12),
    new THREE.MeshBasicMaterial({ color: MARIGOLD, transparent: true, opacity: 0.96 }),
  );
  node.position.set(...position);
  group.add(node);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 18, 12),
    new THREE.MeshBasicMaterial({ color: MARIGOLD, transparent: true, opacity: 0.14 }),
  );
  halo.position.copy(node.position);
  group.add(halo);
}

function buildBody(THREE) {
  const group = new THREE.Group();
  const bodyMaterial = makeMaterial(THREE, SPRUCE);
  const darkMaterial = makeMaterial(THREE, SPRUCE_DARK);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 18), bodyMaterial);
  head.position.y = 3.75;
  group.add(head);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.5, 18), darkMaterial);
  neck.position.y = 3.02;
  group.add(neck);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(1.05, 1.7, 10, 18), bodyMaterial);
  torso.position.y = 1.75;
  torso.scale.x = 0.84;
  group.add(torso);

  addLimb(THREE, group, [-0.75, 2.55, 0], [-1.45, 1.35, 0.02], 0.22);
  addLimb(THREE, group, [-1.45, 1.35, 0.02], [-1.65, 0.2, 0.06], 0.19);
  addLimb(THREE, group, [0.75, 2.55, 0], [1.45, 1.35, 0.02], 0.22);
  addLimb(THREE, group, [1.45, 1.35, 0.02], [1.65, 0.2, 0.06], 0.19);
  addLimb(THREE, group, [-0.5, 0.55, 0], [-0.57, -1.2, 0], 0.3);
  addLimb(THREE, group, [-0.57, -1.2, 0], [-0.63, -2.8, 0.04], 0.24);
  addLimb(THREE, group, [0.5, 0.55, 0], [0.57, -1.2, 0], 0.3);
  addLimb(THREE, group, [0.57, -1.2, 0], [0.63, -2.8, 0.04], 0.24);

  const crossVertical = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.08), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const crossHorizontal = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 0.08), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  crossVertical.position.set(0, 2.05, 0.9);
  crossHorizontal.position.set(0, 2.05, 0.9);
  group.add(crossVertical, crossHorizontal);

  addNode(THREE, group, [0, 3.95, 0.63]);
  addNode(THREE, group, [0, 2.2, 0.92]);
  addNode(THREE, group, [0, 1.15, 0.86]);
  addNode(THREE, group, [0, 0.1, 0.1]);
  addNode(THREE, group, [1.55, 0.15, 0.1]);
  group.rotation.y = -0.26;
  return group;
}

export function createBodyMap3D({ canvas, onUnavailable } = {}) {
  const THREE = window.THREE;
  if (!THREE || !canvas || !window.WebGLRenderingContext) {
    onUnavailable?.();
    return { available: false };
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    onUnavailable?.();
    return { available: false };
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0.55, 12.5);
  const group = buildBody(THREE);
  scene.add(group);
  scene.add(new THREE.HemisphereLight(0xf9f7f1, 0x8ab19f, 2.1));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(-4, 7, 8);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(MARIGOLD, 1.8, 12);
  rimLight.position.set(3, 2, 5);
  scene.add(rimLight);

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  const observer = window.ResizeObserver ? new window.ResizeObserver(resize) : { observe() {}, disconnect() {} };
  observer.observe(canvas);

  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  const pointerDown = (event) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
  };
  const pointerMove = (event) => {
    if (!dragging) return;
    group.rotation.y += (event.clientX - lastX) * 0.012;
    group.rotation.x = Math.max(-0.3, Math.min(0.3, group.rotation.x + (event.clientY - lastY) * 0.006));
    lastX = event.clientX;
    lastY = event.clientY;
  };
  const pointerUp = (event) => {
    dragging = false;
    canvas.releasePointerCapture?.(event.pointerId);
  };
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerUp);

  let animationFrame;
  const render = () => {
    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(render);
  };
  render();

  return {
    available: true,
    destroy() {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", pointerUp);
      renderer.dispose();
    },
  };
}
