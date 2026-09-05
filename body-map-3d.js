// Presentation layer for the triage 3D body map.
// This file only reports a citizen-selected region. It never routes,
// diagnoses, calls a model, or chooses a department.

const COLORS = Object.freeze({
  spruce: 0x166534,
  emerald: 0x1d3d33,
  spruceDark: 0x14532d,
  emeraldDark: 0x142b24,
  amber: 0xf59e0b,
  amberLight: 0xfbbf24,
  white: 0xf8fafc,
});

export const REGION_LABELS = Object.freeze({
  head: { en: "Head / cranium / brain", hi: "सिर / खोपड़ी / मस्तिष्क", dept: "Neurology" },
  eyes: { en: "Eyes / vision", hi: "आँखें / नज़र", dept: "Ophthalmology" },
  ears: { en: "Ears / nose / throat", hi: "कान, नाक और गला", dept: "ENT" },
  teeth: { en: "Teeth / mouth / jaw", hi: "दाँत और मुँह / जबड़ा", dept: "Dental" },
  face: { en: "Face / cheeks / sinuses", hi: "चेहरा / गाल / साइनस", dept: "Dental / ENT" },
  neck: { en: "Neck / throat / thyroid", hi: "गर्दन / गला / थायरॉइड", dept: "ENT / General Medicine" },
  chest: { en: "Chest / heart / lungs", hi: "छाती / दिल / फेफड़े", dept: "Cardiology" },
  "upper-abdomen": { en: "Upper abdomen / stomach", hi: "ऊपरी पेट / आमाशय", dept: "Gastroenterology" },
  "lower-abdomen": { en: "Lower abdomen / pelvis", hi: "निचला पेट / पेल्विस", dept: "Gastroenterology" },
  back: { en: "Back / spine", hi: "पीठ / रीढ़", dept: "Orthopaedics" },
  "upper-back": { en: "Upper back / spine", hi: "ऊपरी पीठ / रीढ़", dept: "Orthopaedics" },
  "lower-back": { en: "Lower back / lumbar", hi: "कमर / निचली पीठ", dept: "Orthopaedics" },
  shoulder: { en: "Shoulders / clavicle", hi: "कंधे / कॉलरबोन", dept: "Orthopaedics" },
  arm: { en: "Arms / biceps / elbows", hi: "बाँह / कोहनी", dept: "Orthopaedics" },
  hand: { en: "Hands / wrists / fingers", hi: "हाथ, कलाई और उँगलियाँ", dept: "Orthopaedics" },
  leg: { en: "Legs / thighs / calves", hi: "पैर, जाँघ और पिंडलियाँ", dept: "Orthopaedics" },
  knee: { en: "Knee joints / patella", hi: "घुटने", dept: "Orthopaedics" },
  foot: { en: "Feet / ankles / toes", hi: "पैर, टखने और अँगूठे", dept: "Orthopaedics" },
  pelvis: { en: "Pelvis / hips / groin", hi: "कूल्हा और पेल्विस", dept: "Orthopaedics" },
});

function themePalette() {
  const dark = document.documentElement?.getAttribute("data-theme") === "dark";
  return {
    body: dark ? 0x224438 : COLORS.spruce,
    secondary: dark ? 0x162c25 : COLORS.spruceDark,
    inner: dark ? 0x2dd4bf : 0x2b8060,
  };
}

function makeMaterial(THREE, color, overrides = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.22,
    metalness: 0.12,
    transmission: 0.55,
    thickness: 1.2,
    ior: 1.4,
    clearcoat: 0.65,
    clearcoatRoughness: 0.15,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
    emissive: 0x000000,
    emissiveIntensity: 0,
    ...overrides,
  });
}

function addRegion(parent, mesh, region, material, themeRole = "body", priority = 0) {
  mesh.material = material.clone();
  mesh.material.opacity = 0.85;
  mesh.userData.region = region;
  mesh.userData.themeRole = themeRole;
  mesh.userData.priority = priority;
  mesh.userData.baseColor = mesh.material.color.clone();
  mesh.userData.baseOpacity = 0.85;
  mesh.userData.restingOpacity = 0.85;
  parent.add(mesh);
  return mesh;
}

function addEllipsoid(THREE, parent, region, position, scale, material, themeRole = "body", segments = 24, priority = 0) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, segments, Math.max(12, segments - 6)), material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  return addRegion(parent, mesh, region, material, themeRole, priority);
}

function addCapsule(THREE, parent, region, start, end, radius, material, themeRole = "body", priority = 0) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = to.clone().sub(from);
  const length = Math.max(0.12, direction.length() - radius * 2);
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 18), material);
  mesh.position.copy(from.clone().add(to).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return addRegion(parent, mesh, region, material, themeRole, priority);
}

function addBand(THREE, parent, region, position, radius, tube, material, themeRole = "body", priority = 0) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 48), material);
  mesh.position.set(...position);
  mesh.rotation.x = Math.PI / 2;
  return addRegion(parent, mesh, region, material, themeRole, priority);
}

function buildBody(THREE) {
  const palette = themePalette();
  const body = new THREE.Group();
  const baseMaterial = makeMaterial(THREE, palette.body);
  const secondaryMaterial = makeMaterial(THREE, palette.secondary);
  const innerMaterial = makeMaterial(THREE, palette.inner, { opacity: 0.64 });
  const amberMaterial = makeMaterial(THREE, COLORS.amber, {
    roughness: 0.18,
    metalness: 0.08,
    transmission: 0.3,
    opacity: 0.85,
    emissive: COLORS.amber,
    emissiveIntensity: 0.38,
  });

  // 1. HEAD & CRANIUM
  addEllipsoid(THREE, body, "head", [0, 3.96, 0], [0.74, 0.86, 0.68], secondaryMaterial, "secondary");
  addEllipsoid(THREE, body, "head", [0, 4.12, -0.02], [0.60, 0.34, 0.58], innerMaterial, "inner", 20);

  // 2. FACE & SENSORY ORGANS
  addEllipsoid(THREE, body, "face", [0, 3.76, 0.56], [0.50, 0.44, 0.22], innerMaterial, "inner", 20);
  for (const side of [-1, 1]) {
    addEllipsoid(THREE, body, "face", [side * 0.34, 3.55, 0.54], [0.18, 0.16, 0.14], innerMaterial, "inner", 16);
  }
  addEllipsoid(THREE, body, "face", [0, 3.38, 0.50], [0.42, 0.24, 0.28], secondaryMaterial, "secondary", 20);
  // Eyes
  for (const side of [-1, 1]) {
    addEllipsoid(THREE, body, "eyes", [side * 0.22, 3.82, 0.74], [0.12, 0.10, 0.08], amberMaterial, "organ", 18, 2);
  }
  // Ears
  for (const side of [-1, 1]) {
    addEllipsoid(THREE, body, "ears", [side * 0.65, 3.72, 0.03], [0.12, 0.22, 0.14], innerMaterial, "inner", 18, 2);
  }
  // Nose & Sinuses (routes to ENT/ears)
  addEllipsoid(THREE, body, "ears", [0, 3.66, 0.78], [0.11, 0.18, 0.15], amberMaterial, "organ", 16, 2);
  // Teeth & Mandibular arch
  addEllipsoid(THREE, body, "teeth", [0, 3.42, 0.73], [0.22, 0.08, 0.08], amberMaterial, "organ", 18, 2);

  // 3. NECK & THROAT
  addCapsule(THREE, body, "neck", [0, 2.70, 0], [0, 3.28, 0], 0.32, secondaryMaterial, "secondary");
  addCapsule(THREE, body, "neck", [-0.25, 2.80, 0], [-0.90, 2.52, 0], 0.18, innerMaterial, "inner");
  addCapsule(THREE, body, "neck", [0.25, 2.80, 0], [0.90, 2.52, 0], 0.18, innerMaterial, "inner");
  addEllipsoid(THREE, body, "neck", [0, 2.90, 0.30], [0.15, 0.12, 0.10], amberMaterial, "organ", 16, 1);

  // 4. THORAX, CHEST & HEART
  addEllipsoid(THREE, body, "chest", [0, 2.08, 0], [1.16, 0.95, 0.58], baseMaterial);
  addEllipsoid(THREE, body, "chest", [-0.48, 2.12, 0.48], [0.52, 0.58, 0.14], innerMaterial, "inner");
  addEllipsoid(THREE, body, "chest", [0.48, 2.12, 0.48], [0.52, 0.58, 0.14], innerMaterial, "inner");
  addBand(THREE, body, "chest", [0, 2.30, 0], 0.90, 0.038, innerMaterial, "inner");
  addBand(THREE, body, "chest", [0, 2.04, 0], 1.00, 0.038, innerMaterial, "inner");
  addBand(THREE, body, "chest", [0, 1.78, 0], 0.88, 0.038, innerMaterial, "inner");
  const heartCore = addEllipsoid(THREE, body, "chest", [0.22, 2.04, 0.68], [0.20, 0.25, 0.16], amberMaterial, "organ", 18, 2);
  heartCore.userData.isCardiacCore = true;

  // 5. ABDOMEN & PELVIS
  addEllipsoid(THREE, body, "upper-abdomen", [0, 1.18, 0.02], [0.92, 0.72, 0.52], baseMaterial);
  addEllipsoid(THREE, body, "upper-abdomen", [-0.18, 1.22, 0.48], [0.40, 0.32, 0.16], innerMaterial, "inner", 20);
  addEllipsoid(THREE, body, "upper-abdomen", [0.14, 1.10, 0.52], [0.25, 0.32, 0.15], amberMaterial, "organ", 20, 1);
  addEllipsoid(THREE, body, "lower-abdomen", [0, 0.36, 0.03], [0.82, 0.64, 0.50], secondaryMaterial, "secondary");
  addBand(THREE, body, "lower-abdomen", [0, 0.22, 0], 0.66, 0.075, innerMaterial, "inner");
  addEllipsoid(THREE, body, "lower-abdomen", [0, -0.06, -0.02], [0.84, 0.32, 0.46], secondaryMaterial, "secondary");
  addEllipsoid(THREE, body, "pelvis", [0, 0.36, 0.48], [0.68, 0.32, 0.18], amberMaterial, "organ", 20, 1);
  for (const side of [-1, 1]) {
    addEllipsoid(THREE, body, "pelvis", [side * 0.64, 0.34, 0.12], [0.22, 0.28, 0.20], innerMaterial, "inner", 18, 1);
  }

  // 6. BACK & VERTEBRAL COLUMN
  addEllipsoid(THREE, body, "upper-back", [0, 2.02, -0.52], [0.85, 0.70, 0.16], innerMaterial, "inner", 24);
  addEllipsoid(THREE, body, "lower-back", [0, 1.08, -0.52], [0.82, 0.56, 0.16], innerMaterial, "inner", 24);
  for (let index = 0; index < 10; index += 1) {
    const y = 2.65 - index * 0.24;
    const region = y > 1.45 ? "upper-back" : "lower-back";
    addEllipsoid(THREE, body, region, [0, y, -0.68], [0.14, 0.10, 0.09], amberMaterial, "organ", 14, 1);
  }
  addCapsule(THREE, body, "lower-back", [0, 2.30, -0.64], [0, 0.48, -0.64], 0.07, amberMaterial, "organ");

  // 7. SHOULDERS & ARMS WITH ARTICULATED ELBOWS & WRISTS
  addEllipsoid(THREE, body, "shoulder", [-0.58, 2.60, 0], [0.54, 0.24, 0.36], baseMaterial);
  addEllipsoid(THREE, body, "shoulder", [0.58, 2.60, 0], [0.54, 0.24, 0.36], baseMaterial);
  for (const side of [-1, 1]) {
    // Deltoid
    addEllipsoid(THREE, body, "shoulder", [side * 1.05, 2.50, 0], [0.36, 0.40, 0.36], secondaryMaterial, "secondary");
    // Upper Arm
    addCapsule(THREE, body, "arm", [side * 0.95, 2.40, 0], [side * 1.48, 1.48, 0], 0.24, baseMaterial);
    // ELBOW JOINT (Amber node)
    addEllipsoid(THREE, body, "arm", [side * 1.48, 1.48, 0], [0.22, 0.22, 0.18], amberMaterial, "organ", 18, 1);
    // Forearm
    addCapsule(THREE, body, "arm", [side * 1.48, 1.48, 0], [side * 1.68, 0.38, 0.04], 0.19, baseMaterial);
    // WRIST JOINT (Amber node)
    addEllipsoid(THREE, body, "hand", [side * 1.68, 0.38, 0.04], [0.16, 0.16, 0.14], amberMaterial, "organ", 16, 2);
    // Hand
    addCapsule(THREE, body, "hand", [side * 1.68, 0.38, 0.04], [side * 1.70, 0.16, 0.05], 0.11, innerMaterial, "inner");
    addEllipsoid(THREE, body, "hand", [side * 1.70, 0.06, 0.05], [0.24, 0.34, 0.20], innerMaterial, "inner", 20);
    addCapsule(THREE, body, "hand", [side * 1.70, 0.02, 0.17], [side * 1.70, -0.12, 0.20], 0.05, amberMaterial, "organ");
  }

  // 8. LEGS, KNEES, ANKLES & FEET
  for (const side of [-1, 1]) {
    // Thigh
    addCapsule(THREE, body, "leg", [side * 0.48, -0.06, 0], [side * 0.56, -1.35, 0], 0.30, baseMaterial);
    // KNEE JOINT (Patella amber node)
    addEllipsoid(THREE, body, "knee", [side * 0.56, -1.38, 0.28], [0.24, 0.26, 0.14], amberMaterial, "organ", 18, 2);
    // Calf & Shin
    addCapsule(THREE, body, "leg", [side * 0.56, -1.48, 0], [side * 0.65, -2.72, 0.04], 0.24, secondaryMaterial, "secondary");
    // ANKLE JOINT (Amber node)
    addEllipsoid(THREE, body, "foot", [side * 0.66, -2.72, 0.03], [0.22, 0.20, 0.20], amberMaterial, "organ", 18, 2);
    // Foot & Toes
    addEllipsoid(THREE, body, "foot", [side * 0.73, -2.92, 0.16], [0.32, 0.19, 0.56], innerMaterial, "inner", 20);
    addCapsule(THREE, body, "foot", [side * 0.73, -2.98, 0.16], [side * 0.73, -3.00, 0.56], 0.05, amberMaterial, "organ");
  }

  body.rotation.set(0, -0.18, 0);
  body.userData.heartCore = heartCore;
  return body;
}

function makeTooltip(stage) {
  if (!stage) return null;
  const tooltip = document.createElement("div");
  tooltip.className = "three-tooltip";
  tooltip.setAttribute("role", "status");
  tooltip.setAttribute("aria-live", "polite");
  tooltip.hidden = true;
  stage.append(tooltip);
  return tooltip;
}

function applyTheme(body) {
  const palette = themePalette();
  const roleColors = { body: palette.body, secondary: palette.secondary, inner: palette.inner, organ: COLORS.amber };
  body.traverse((object) => {
    if (!object.isMesh || !object.userData.region || !object.material?.color) return;
    const color = roleColors[object.userData.themeRole] || palette.body;
    object.userData.baseColor.setHex(color);
    if (!object.userData.isSelected && !object.userData.isHovered) object.material.color.copy(object.userData.baseColor);
  });
}

function updateVisualState(body, hoveredRegion, selectedRegion, now = 0) {
  const selectedPulse = 0.7 + Math.sin(now * 0.005) * 0.25;
  body.traverse((object) => {
    if (!object.isMesh || !object.userData.region || !object.material?.color) return;
    const isHovered = object.userData.region === hoveredRegion;
    const isSelected = object.userData.region === selectedRegion;
    const isDimmed = Boolean(selectedRegion) && !isSelected;
    object.userData.isHovered = isHovered;
    object.userData.isSelected = isSelected;

    if (isSelected) {
      object.material.color.setHex(COLORS.amberLight);
      object.material.emissive?.setHex(COLORS.amber);
      object.material.emissiveIntensity = selectedPulse;
      object.material.opacity = 1.0;
      return;
    }

    if (isHovered) {
      object.material.color.setHex(COLORS.amber);
      object.material.emissive?.setHex(COLORS.amber);
      object.material.emissiveIntensity = 0.52;
      object.material.opacity = 0.95;
      return;
    }

    object.material.color.copy(object.userData.baseColor);
    object.material.emissive?.setHex(0x000000);
    object.material.emissiveIntensity = 0;
    object.material.opacity = isDimmed ? 0.32 : object.userData.restingOpacity;
  });
}

export async function createBodyMap3D({ canvas, stage, language = "en", onSelect, onHover, onUnavailable } = {}) {
  const waitUntil = Date.now() + 2600;
  while (!window.THREE && Date.now() < waitUntil) {
    await new Promise((resolve) => window.setTimeout(resolve, 80));
  }
  const THREE = window.THREE;
  if (!THREE || !canvas || !window.WebGLRenderingContext) {
    onUnavailable?.();
    return { available: false };
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
  } catch {
    onUnavailable?.();
    return { available: false };
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.5, 12);
  const body = buildBody(THREE);
  scene.add(body);

  const hemisphere = new THREE.HemisphereLight(0xf8fafc, 0x355e4b, 2.2);
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(-4, 7, 8);
  const beacon = new THREE.PointLight(COLORS.amber, 1.8, 12);
  beacon.position.set(3, 2.5, 5);
  const heartLight = new THREE.PointLight(COLORS.amber, 1.1, 4.5);
  heartLight.position.set(0.22, 2.04, 1.05);
  scene.add(hemisphere, keyLight, beacon, heartLight);

  const selectableMeshes = [];
  body.traverse((object) => {
    if (object.isMesh && object.userData.region) selectableMeshes.push(object);
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const tooltip = makeTooltip(stage);
  let currentLanguage = language;
  let hoveredRegion = null;
  let selectedRegion = null;

  // Touch & Pointer state
  let isPointerDown = false;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let velocityY = 0;
  let velocityX = 0;
  let rotationY = body.rotation.y;
  let rotationX = body.rotation.x;
  let targetRotationY = rotationY;
  let targetRotationX = rotationX;
  let pointerDownTime = 0;

  const targetCameraPosition = new THREE.Vector3(0, 0.5, 12);
  const targetLookAt = new THREE.Vector3(0, 0.5, 0);
  let targetLookY = 0.5;
  let animationFrame;

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth || 640);
    const height = Math.max(1, canvas.clientHeight || 480);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  const resizeObserver = window.ResizeObserver ? new window.ResizeObserver(resize) : { observe() {}, disconnect() {} };
  resizeObserver.observe(canvas);
  const themeObserver = window.MutationObserver ? new window.MutationObserver(() => applyTheme(body)) : { observe() {}, disconnect() {} };
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  const getRegionHit = (event) => {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(selectableMeshes, false);
    if (!intersects.length) return null;

    intersects.sort((a, b) => (b.object.userData.priority || 0) - (a.object.userData.priority || 0) || a.distance - b.distance);
    return intersects[0]?.object || null;
  };

  const showTooltip = (region, event) => {
    if (!tooltip) return;
    if (!region) {
      tooltip.hidden = true;
      tooltip.innerHTML = "";
      return;
    }
    const labels = REGION_LABELS[region];
    if (!labels) {
      tooltip.textContent = region;
    } else {
      tooltip.innerHTML = `
        <div class="tt-region-name">${labels.en} · ${labels.hi}</div>
        <div class="tt-dept-row"><span class="tt-tag">OPD Counter:</span> <strong>${labels.dept}</strong></div>
        <div class="tt-tap-cta">Tap to select →</div>
      `;
    }
    tooltip.hidden = false;
    if (event && stage) {
      const stageBounds = stage.getBoundingClientRect();
      const width = Math.min(stageBounds.width - 24, 300);
      tooltip.style.left = Math.min(stageBounds.width - width - 12, Math.max(12, event.clientX - stageBounds.left + 14)) + "px";
      tooltip.style.top = Math.min(stageBounds.height - 62, Math.max(12, event.clientY - stageBounds.top - 58)) + "px";
    }
  };

  const pointerDown = (event) => {
    isPointerDown = true;
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    lastX = event.clientX;
    lastY = event.clientY;
    pointerDownTime = performance.now();
    targetRotationY = rotationY;
    targetRotationX = rotationX;
    canvas.setPointerCapture?.(event.pointerId);
  };

  const pointerMove = (event) => {
    if (isPointerDown && dragging) {
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      velocityY = deltaX * 0.01;
      velocityX = deltaY * 0.005;
      rotationY += velocityY;
      rotationX = Math.max(-Math.PI / 5, Math.min(Math.PI / 5, rotationX + velocityX));
      lastX = event.clientX;
      lastY = event.clientY;
      return;
    }
    const hit = getRegionHit(event);
    hoveredRegion = hit?.userData.region || null;
    canvas.style.cursor = hoveredRegion ? "pointer" : "grab";
    updateVisualState(body, hoveredRegion, selectedRegion);
    showTooltip(hoveredRegion, event);
    onHover?.(hoveredRegion ? { region: hoveredRegion, labels: REGION_LABELS[hoveredRegion] } : null);
  };

  const pointerUp = (event, allowSelect = true) => {
    const elapsed = performance.now() - pointerDownTime;
    const totalMoved = Math.hypot(event.clientX - startX, event.clientY - startY);
    // Crucial touch usability fix: taps on mobile allow up to 10px of movement, or quick tap <320ms
    const isTap = totalMoved < 10 || (elapsed < 320 && totalMoved < 16);

    if (allowSelect && isTap) {
      const hit = getRegionHit(event);
      if (hit?.userData.region) {
        selectedRegion = hit.userData.region;
        updateVisualState(body, hoveredRegion, selectedRegion);
        if ("vibrate" in navigator) navigator.vibrate?.(18);
        onSelect?.(selectedRegion);
      }
    }
    isPointerDown = false;
    dragging = false;
    canvas.releasePointerCapture?.(event.pointerId);
    canvas.style.cursor = hoveredRegion ? "pointer" : "grab";
  };

  const pointerLeave = () => {
    if (!isPointerDown) {
      hoveredRegion = null;
      updateVisualState(body, null, selectedRegion);
      showTooltip(null);
      onHover?.(null);
    }
  };

  // Mouse wheel zoom
  const onWheel = (event) => {
    event.preventDefault();
    const zoomDelta = event.deltaY * 0.008;
    targetCameraPosition.z = Math.max(5.0, Math.min(17.0, targetCameraPosition.z + zoomDelta));
  };

  // Touch pinch-to-zoom for mobile screens
  let initialPinchDistance = 0;
  let initialCameraZ = 12;
  const onTouchStart = (event) => {
    if (event.touches.length === 2) {
      initialPinchDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      initialCameraZ = targetCameraPosition.z;
    }
  };
  const onTouchMove = (event) => {
    if (event.touches.length === 2 && initialPinchDistance > 0) {
      event.preventDefault();
      const currentDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );
      const factor = initialPinchDistance / currentDistance;
      targetCameraPosition.z = Math.max(5.0, Math.min(17.0, initialCameraZ * factor));
    }
  };
  const onTouchEnd = () => {
    initialPinchDistance = 0;
  };

  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", (event) => pointerUp(event, false));
  canvas.addEventListener("pointerleave", pointerLeave);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("touchstart", onTouchStart, { passive: true });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd, { passive: true });

  const render = (now = 0) => {
    if (!dragging) {
      rotationY += velocityY;
      rotationX = Math.max(-Math.PI / 5, Math.min(Math.PI / 5, rotationX + velocityX));
      velocityY *= 0.90;
      velocityX *= 0.90;
    }
    const rotationDelta = ((targetRotationY - rotationY + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (!dragging && Math.abs(rotationDelta) > 0.001) rotationY += rotationDelta * 0.08;
    if (!dragging) rotationX += (targetRotationX - rotationX) * 0.08;
    body.rotation.set(rotationX, rotationY, 0);

    camera.position.lerp(targetCameraPosition, 0.08);
    targetLookAt.y += (targetLookY - targetLookAt.y) * 0.08;
    camera.lookAt(targetLookAt.x, targetLookAt.y, targetLookAt.z);

    heartLight.intensity = 1.1 + Math.sin(now * 0.005) * 0.28;
    if (body.userData.heartCore?.material) {
      body.userData.heartCore.material.emissiveIntensity = 0.38 + Math.sin(now * 0.005) * 0.16;
    }
    updateVisualState(body, hoveredRegion, selectedRegion, now);
    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(render);
  };
  applyTheme(body);
  render();

  function focusRegionCamera(region) {
    if (["upper-back", "lower-back", "back"].includes(region)) {
      targetRotationY = Math.PI;
      targetRotationX = 0;
      targetCameraPosition.set(0, 1.6, 8.5);
      targetLookY = 1.6;
    } else if (["head", "eyes", "ears", "teeth", "face"].includes(region)) {
      targetRotationY = 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 3.7, 6.5);
      targetLookY = 3.7;
    } else if (["neck"].includes(region)) {
      targetRotationY = 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 2.9, 6.8);
      targetLookY = 2.9;
    } else if (["chest"].includes(region)) {
      targetRotationY = 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 2.1, 7.2);
      targetLookY = 2.1;
    } else if (["upper-abdomen", "lower-abdomen", "pelvis"].includes(region)) {
      targetRotationY = 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 0.8, 7.8);
      targetLookY = 0.8;
    } else if (["knee", "leg", "foot"].includes(region)) {
      targetRotationY = 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, -1.5, 8.5);
      targetLookY = -1.5;
    } else if (["shoulder", "arm", "hand"].includes(region)) {
      targetRotationY = 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 1.5, 8.0);
      targetLookY = 1.5;
    }
  }

  return {
    available: true,
    setLanguage(nextLanguage) {
      currentLanguage = nextLanguage;
      if (hoveredRegion) showTooltip(hoveredRegion);
    },
    select(region) {
      selectedRegion = region;
      updateVisualState(body, hoveredRegion, selectedRegion);
      if (region) focusRegionCamera(region);
    },
    setView(view) {
      if (view === "front") {
        targetRotationY = 0;
        targetRotationX = 0;
        targetCameraPosition.set(0, 0.5, 12);
        targetLookY = 0.5;
      } else if (view === "back") {
        targetRotationY = Math.PI;
        targetRotationX = 0;
        targetCameraPosition.set(0, 0.5, 12);
        targetLookY = 0.5;
      } else if (view === "upper") {
        targetCameraPosition.set(0, 2.2, 7.5);
        targetLookY = 2.2;
      } else if (view === "lower") {
        targetCameraPosition.set(0, -0.8, 8.5);
        targetLookY = -0.8;
      } else if (view === "zoom-in") {
        targetCameraPosition.z = Math.max(5.0, targetCameraPosition.z - 2.2);
      } else if (view === "zoom-out") {
        targetCameraPosition.z = Math.min(17.0, targetCameraPosition.z + 2.2);
      } else if (view === "reset") {
        targetRotationY = -0.18;
        targetRotationX = 0;
        targetCameraPosition.set(0, 0.5, 12);
        targetLookY = 0.5;
      }
      velocityX = 0;
      velocityY = 0;
    },
    destroy() {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      tooltip?.remove();
      body.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material?.dispose) object.material.dispose();
      });
      renderer.dispose();
    },
  };
}
