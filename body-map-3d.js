// Optional presentation layer for the triage body map.
// This file only reports a citizen-selected region. It never routes,
// diagnoses, calls a model, or chooses a department.

const COLORS = Object.freeze({
  spruce: 0x166534,
  emerald: 0x22c55e,
  spruceDark: 0x14532d,
  emeraldDark: 0x16a34a,
  amber: 0xf59e0b,
  white: 0xf8fafc,
});

const REGION_LABELS = Object.freeze({
  head: { en: "Head / cranium", hi: "सिर / खोपड़ी" },
  face: { en: "Face / jaw", hi: "चेहरा / जबड़ा" },
  neck: { en: "Neck / throat", hi: "गर्दन / गला" },
  chest: { en: "Chest / heart / lungs", hi: "छाती / दिल / फेफड़े" },
  "upper-abdomen": { en: "Upper abdomen / stomach", hi: "ऊपरी पेट / आमाशय" },
  "lower-abdomen": { en: "Lower abdomen / pelvis", hi: "निचला पेट / पेल्विस" },
  back: { en: "Back / spine", hi: "पीठ / रीढ़" },
  arm: { en: "Arm", hi: "बाँह" },
  hand: { en: "Hand / palm", hi: "हाथ / हथेली" },
  leg: { en: "Leg / knee", hi: "पैर / घुटना" },
  foot: { en: "Foot / ankle", hi: "पंजा / टखना" },
});

function themePalette() {
  const dark = document.documentElement?.getAttribute("data-theme") === "dark";
  return {
    body: dark ? COLORS.emerald : COLORS.spruce,
    secondary: dark ? COLORS.emeraldDark : COLORS.spruceDark,
    inner: dark ? 0x34d399 : 0x2b8060,
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

function addRegion(parent, mesh, region, material, themeRole = "body") {
  mesh.material = material.clone();
  mesh.material.opacity = 0.85;
  mesh.userData.region = region;
  mesh.userData.themeRole = themeRole;
  mesh.userData.baseColor = mesh.material.color.clone();
  mesh.userData.baseOpacity = 0.85;
  mesh.userData.restingOpacity = 0.85;
  parent.add(mesh);
  return mesh;
}

function addEllipsoid(THREE, parent, region, position, scale, material, themeRole = "body", segments = 24) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, segments, Math.max(12, segments - 6)), material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  return addRegion(parent, mesh, region, material, themeRole);
}

function addCapsule(THREE, parent, region, start, end, radius, material, themeRole = "body") {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = to.clone().sub(from);
  const length = Math.max(0.12, direction.length() - radius * 2);
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 18), material);
  mesh.position.copy(from.clone().add(to).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return addRegion(parent, mesh, region, material, themeRole);
}

function addBand(THREE, parent, region, position, radius, tube, material, themeRole = "body") {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 48), material);
  mesh.position.set(...position);
  mesh.rotation.x = Math.PI / 2;
  return addRegion(parent, mesh, region, material, themeRole);
}

function buildBody(THREE) {
  const palette = themePalette();
  const body = new THREE.Group();
  const baseMaterial = makeMaterial(THREE, palette.body);
  const secondaryMaterial = makeMaterial(THREE, palette.secondary);
  const innerMaterial = makeMaterial(THREE, palette.inner, { opacity: 0.62 });
  const amberMaterial = makeMaterial(THREE, COLORS.amber, {
    roughness: 0.18,
    metalness: 0.08,
    transmission: 0.3,
    opacity: 0.78,
    emissive: COLORS.amber,
    emissiveIntensity: 0.34,
  });

  // Head, face and cervical transition.
  addEllipsoid(THREE, body, "head", [0, 3.92, 0], [0.72, 0.82, 0.64], secondaryMaterial, "secondary");
  addEllipsoid(THREE, body, "head", [0, 4.05, -0.02], [0.58, 0.32, 0.56], innerMaterial, "inner", 20);
  addEllipsoid(THREE, body, "face", [0, 3.72, 0.56], [0.48, 0.42, 0.2], innerMaterial, "inner", 20);
  addEllipsoid(THREE, body, "face", [0, 3.43, 0.48], [0.43, 0.22, 0.25], secondaryMaterial, "secondary", 20);
  addCapsule(THREE, body, "neck", [0, 2.7, 0], [0, 3.25, 0], 0.3, secondaryMaterial, "secondary");
  addCapsule(THREE, body, "neck", [-0.25, 2.8, 0], [-0.9, 2.52, 0], 0.18, innerMaterial, "inner");
  addCapsule(THREE, body, "neck", [0.25, 2.8, 0], [0.9, 2.52, 0], 0.18, innerMaterial, "inner");

  // Thorax, pectoral planes, ribcage bands and internal cardiac/lung indicators.
  addEllipsoid(THREE, body, "chest", [0, 2.08, 0], [1.13, 0.92, 0.55], baseMaterial);
  addEllipsoid(THREE, body, "chest", [-0.48, 2.12, 0.48], [0.5, 0.56, 0.12], innerMaterial, "inner");
  addEllipsoid(THREE, body, "chest", [0.48, 2.12, 0.48], [0.5, 0.56, 0.12], innerMaterial, "inner");
  addBand(THREE, body, "chest", [0, 2.28, 0], 0.88, 0.035, innerMaterial, "inner");
  addBand(THREE, body, "chest", [0, 2.02, 0], 0.98, 0.035, innerMaterial, "inner");
  addBand(THREE, body, "chest", [0, 1.76, 0], 0.86, 0.035, innerMaterial, "inner");
  addEllipsoid(THREE, body, "chest", [-0.28, 2.08, 0.56], [0.28, 0.48, 0.11], innerMaterial, "inner", 20);
  addEllipsoid(THREE, body, "chest", [0.28, 2.08, 0.56], [0.28, 0.48, 0.11], innerMaterial, "inner", 20);
  const heartCore = addEllipsoid(THREE, body, "chest", [0.2, 2.02, 0.68], [0.18, 0.23, 0.14], amberMaterial, "organ", 18);
  heartCore.userData.isCardiacCore = true;

  // Upper and lower abdominal cavities, stomach and pelvic girdle.
  addEllipsoid(THREE, body, "upper-abdomen", [0, 1.17, 0.02], [0.9, 0.7, 0.5], baseMaterial);
  addEllipsoid(THREE, body, "upper-abdomen", [-0.16, 1.2, 0.47], [0.38, 0.3, 0.15], innerMaterial, "inner", 20);
  addEllipsoid(THREE, body, "upper-abdomen", [0.12, 1.08, 0.52], [0.23, 0.31, 0.14], amberMaterial, "organ", 20);
  addEllipsoid(THREE, body, "lower-abdomen", [0, 0.35, 0.03], [0.8, 0.63, 0.5], secondaryMaterial, "secondary");
  addBand(THREE, body, "lower-abdomen", [0, 0.2, 0], 0.64, 0.075, innerMaterial, "inner");
  addEllipsoid(THREE, body, "lower-abdomen", [0, -0.08, -0.02], [0.84, 0.31, 0.46], secondaryMaterial, "secondary");

  // Dorsal plate and articulated vertebral column, visible when rotated rearward.
  addEllipsoid(THREE, body, "back", [0, 1.6, -0.5], [0.83, 1.22, 0.14], innerMaterial, "inner", 24);
  for (let index = 0; index < 8; index += 1) {
    addEllipsoid(THREE, body, "back", [0, 2.55 - index * 0.28, -0.66], [0.13, 0.095, 0.08], amberMaterial, "organ", 14);
  }
  addCapsule(THREE, body, "back", [0, 2.25, -0.62], [0, 0.55, -0.62], 0.06, amberMaterial, "organ");

  // Trapezius, deltoids, arms, forearms and palms.
  addEllipsoid(THREE, body, "neck", [-0.55, 2.58, 0], [0.52, 0.22, 0.34], baseMaterial);
  addEllipsoid(THREE, body, "neck", [0.55, 2.58, 0], [0.52, 0.22, 0.34], baseMaterial);
  for (const side of [-1, 1]) {
    addEllipsoid(THREE, body, "arm", [side * 1.02, 2.48, 0], [0.34, 0.38, 0.34], secondaryMaterial, "secondary");
    addCapsule(THREE, body, "arm", [side * 0.92, 2.38, 0], [side * 1.48, 1.48, 0], 0.23, baseMaterial);
    addCapsule(THREE, body, "arm", [side * 1.48, 1.48, 0], [side * 1.68, 0.38, 0.04], 0.18, baseMaterial);
    addEllipsoid(THREE, body, "hand", [side * 1.7, 0.07, 0.05], [0.23, 0.32, 0.2], innerMaterial, "inner", 20);
    addCapsule(THREE, body, "hand", [side * 1.7, 0.03, 0.17], [side * 1.7, -0.1, 0.2], 0.045, amberMaterial, "organ");
  }

  // Thighs, patella joints, calves, ankles and contoured foot plates.
  for (const side of [-1, 1]) {
    addCapsule(THREE, body, "leg", [side * 0.47, -0.08, 0], [side * 0.56, -1.35, 0], 0.29, baseMaterial);
    addEllipsoid(THREE, body, "leg", [side * 0.56, -1.38, 0.27], [0.22, 0.25, 0.12], amberMaterial, "organ", 18);
    addCapsule(THREE, body, "leg", [side * 0.56, -1.48, 0], [side * 0.65, -2.72, 0.04], 0.23, secondaryMaterial, "secondary");
    addEllipsoid(THREE, body, "leg", [side * 0.66, -2.72, 0.03], [0.18, 0.18, 0.18], innerMaterial, "inner", 18);
    addEllipsoid(THREE, body, "foot", [side * 0.73, -2.92, 0.16], [0.3, 0.18, 0.55], innerMaterial, "inner", 20);
    addCapsule(THREE, body, "foot", [side * 0.73, -2.98, 0.16], [side * 0.73, -3.0, 0.55], 0.045, amberMaterial, "organ");
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
  const selectedPulse = 0.6 + Math.sin(now * 0.004) * 0.25;
  body.traverse((object) => {
    if (!object.isMesh || !object.userData.region || !object.material?.color) return;
    const isHovered = object.userData.region === hoveredRegion;
    const isSelected = object.userData.region === selectedRegion;
    const isDimmed = Boolean(selectedRegion) && !isSelected;
    object.userData.isHovered = isHovered;
    object.userData.isSelected = isSelected;
    if (isHovered || isSelected) {
      object.material.color.setHex(COLORS.amber);
      object.material.emissive?.setHex(COLORS.amber);
      object.material.emissiveIntensity = isSelected ? selectedPulse : 0.45;
      object.material.opacity = isSelected ? 0.98 : 0.94;
      return;
    }
    object.material.color.copy(object.userData.baseColor);
    object.material.emissive?.setHex(0x000000);
    object.material.emissiveIntensity = 0;
    object.material.opacity = isDimmed ? 0.38 : object.userData.restingOpacity;
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

  const hemisphere = new THREE.HemisphereLight(0xf8fafc, 0x355e4b, 2.1);
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(-4, 7, 8);
  const beacon = new THREE.PointLight(COLORS.amber, 1.75, 12);
  beacon.position.set(3, 2.5, 5);
  const heartLight = new THREE.PointLight(COLORS.amber, 1.1, 4.5);
  heartLight.position.set(0.2, 2.02, 1.05);
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
  let dragging = false;
  let didDrag = false;
  let lastX = 0;
  let lastY = 0;
  let velocityY = 0;
  let velocityX = 0;
  let rotationY = body.rotation.y;
  let rotationX = body.rotation.x;
  let targetRotationY = rotationY;
  let targetRotationX = rotationX;
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
    return raycaster.intersectObjects(selectableMeshes, false)[0]?.object || null;
  };

  const showTooltip = (region, event) => {
    if (!tooltip) return;
    if (!region) {
      tooltip.hidden = true;
      tooltip.textContent = "";
      return;
    }
    const labels = REGION_LABELS[region];
    tooltip.textContent = labels ? labels.en + " · " + labels.hi : region;
    tooltip.hidden = false;
    if (event && stage) {
      const stageBounds = stage.getBoundingClientRect();
      const width = Math.min(stageBounds.width - 24, 300);
      tooltip.style.left = Math.min(stageBounds.width - width - 12, Math.max(12, event.clientX - stageBounds.left + 14)) + "px";
      tooltip.style.top = Math.min(stageBounds.height - 62, Math.max(12, event.clientY - stageBounds.top - 58)) + "px";
    }
  };

  const pointerDown = (event) => {
    dragging = true;
    didDrag = false;
    targetRotationY = rotationY;
    targetRotationX = rotationX;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
  };
  const pointerMove = (event) => {
    if (dragging) {
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      if (Math.abs(deltaX) + Math.abs(deltaY) > 2) didDrag = true;
      velocityY = deltaX * 0.012;
      velocityX = deltaY * 0.006;
      rotationY += velocityY;
      rotationX = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, rotationX + velocityX));
      lastX = event.clientX;
      lastY = event.clientY;
      return;
    }
    const hit = getRegionHit(event);
    hoveredRegion = hit?.userData.region || null;
    updateVisualState(body, hoveredRegion, selectedRegion);
    showTooltip(hoveredRegion, event);
    onHover?.(hoveredRegion ? { region: hoveredRegion, labels: REGION_LABELS[hoveredRegion] } : null);
  };
  const pointerUp = (event, allowSelect = true) => {
    if (allowSelect && !didDrag) {
      const hit = getRegionHit(event);
      if (hit?.userData.region) {
        selectedRegion = hit.userData.region;
        updateVisualState(body, hoveredRegion, selectedRegion);
        onSelect?.(selectedRegion);
      }
    }
    dragging = false;
    canvas.releasePointerCapture?.(event.pointerId);
  };
  const pointerLeave = () => {
    if (!dragging) {
      hoveredRegion = null;
      updateVisualState(body, null, selectedRegion);
      showTooltip(null);
      onHover?.(null);
    }
  };

  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", (event) => pointerUp(event, false));
  canvas.addEventListener("pointerleave", pointerLeave);

  const render = (now = 0) => {
    if (!dragging) {
      rotationY += velocityY;
      rotationX = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, rotationX + velocityX));
      velocityY *= 0.9;
      velocityX *= 0.9;
    }
    const rotationDelta = ((targetRotationY - rotationY + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (!dragging && Math.abs(rotationDelta) > 0.001) rotationY += rotationDelta * 0.08;
    if (!dragging) rotationX += (targetRotationX - rotationX) * 0.08;
    body.rotation.set(rotationX, rotationY, 0);
    camera.position.lerp(targetCameraPosition, 0.08);
    targetLookAt.y += (targetLookY - targetLookAt.y) * 0.08;
    camera.lookAt(targetLookAt.x, targetLookAt.y, targetLookAt.z);
    heartLight.intensity = 1.05 + Math.sin(now * 0.004) * 0.22;
    if (body.userData.heartCore?.material) body.userData.heartCore.material.emissiveIntensity = 0.34 + Math.sin(now * 0.004) * 0.12;
    updateVisualState(body, hoveredRegion, selectedRegion, now);
    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(render);
  };
  applyTheme(body);
  render();

  return {
    available: true,
    setLanguage(nextLanguage) {
      currentLanguage = nextLanguage;
      if (hoveredRegion) showTooltip(hoveredRegion);
    },
    select(region) {
      selectedRegion = region;
      updateVisualState(body, hoveredRegion, selectedRegion);
    },
    setView(view) {
      if (view === "front") {
        targetRotationY = 0;
        targetRotationX = 0;
        targetCameraPosition.set(0, 0.5, 12);
        targetLookY = 0.5;
      }
      if (view === "back") {
        targetRotationY = Math.PI;
        targetRotationX = 0;
        targetCameraPosition.set(0, 0.5, 12);
        targetLookY = 0.5;
      }
      if (view === "upper") {
        targetCameraPosition.set(0, 2.2, 7.5);
        targetLookY = 2.2;
      }
      if (view === "lower") {
        targetCameraPosition.set(0, -0.8, 8.5);
        targetLookY = -0.8;
      }
      if (view === "reset") {
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
      tooltip?.remove();
      body.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material?.dispose) object.material.dispose();
      });
      renderer.dispose();
    },
  };
}
