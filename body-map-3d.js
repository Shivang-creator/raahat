// Optional presentation layer for the triage body map.
// This file only reports a citizen-selected region. It never routes, diagnoses,
// calls a model, or chooses a department.

const COLORS = Object.freeze({
  spruce: 0x14532d,
  evergreen: 0x166534,
  mint: 0xdcfce7,
  marigold: 0xd97706,
});

const REGION_LABELS = Object.freeze({
  head: { en: "Head / brain", hi: "सिर / दिमाग" },
  face: { en: "Face / jaw", hi: "चेहरा / जबड़ा" },
  neck: { en: "Neck / throat", hi: "गर्दन / गला" },
  chest: { en: "Chest / heart / lungs", hi: "छाती / दिल / फेफड़े" },
  "upper-abdomen": { en: "Upper abdomen / stomach", hi: "ऊपरी पेट / आमाशय" },
  "lower-abdomen": { en: "Lower abdomen / pelvis", hi: "निचला पेट / पेल्विस" },
  back: { en: "Back / spine", hi: "पीठ / रीढ़" },
  arm: { en: "Arm / hand", hi: "बाँह / हाथ" },
  leg: { en: "Leg / knee / foot", hi: "पैर / घुटना / पंजा" },
});

function makeMaterial(THREE, color = COLORS.evergreen) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.48,
    metalness: 0.02,
    clearcoat: 0.28,
    clearcoatRoughness: 0.25,
    transparent: true,
    opacity: 0.82,
    emissive: 0x000000,
    emissiveIntensity: 0,
  });
}

function addRegion(group, mesh, region, material) {
  mesh.material = material.clone();
  mesh.userData.region = region;
  mesh.userData.baseColor = material.color.clone();
  mesh.userData.baseOpacity = material.opacity;
  group.add(mesh);
  return mesh;
}

function addCapsule(THREE, group, region, start, end, radius, material) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = to.clone().sub(from);
  const length = Math.max(0.12, direction.length() - radius * 2);
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 8, 16), material);
  mesh.position.copy(from.clone().add(to).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return addRegion(group, mesh, region, material);
}

function addEllipsoid(THREE, group, region, position, scale, material, segments = 24) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, segments, Math.max(12, segments - 6)), material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  return addRegion(group, mesh, region, material);
}

function buildBody(THREE) {
  const body = new THREE.Group();
  const torsoMaterial = makeMaterial(THREE, COLORS.evergreen);
  const accentMaterial = makeMaterial(THREE, COLORS.spruce);
  const softMaterial = makeMaterial(THREE, 0x2b8060);

  // Each selectable mesh carries a region ID. These are wayfinding shapes,
  // deliberately not a clinical anatomy model.
  addEllipsoid(THREE, body, "head", [0, 3.85, 0], [0.72, 0.78, 0.62], accentMaterial);
  addEllipsoid(THREE, body, "face", [0, 3.72, 0.54], [0.5, 0.42, 0.18], softMaterial, 20);
  addCapsule(THREE, body, "neck", [0, 2.76, 0], [0, 3.26, 0], 0.31, accentMaterial);
  addEllipsoid(THREE, body, "chest", [0, 2.05, 0], [1.12, 0.92, 0.52], torsoMaterial);
  addEllipsoid(THREE, body, "upper-abdomen", [0, 1.16, 0.02], [0.88, 0.68, 0.5], torsoMaterial);
  addEllipsoid(THREE, body, "lower-abdomen", [0, 0.34, 0.03], [0.78, 0.6, 0.5], accentMaterial);
  addEllipsoid(THREE, body, "back", [0, 1.6, -0.48], [0.82, 1.2, 0.12], softMaterial, 20);

  addCapsule(THREE, body, "arm", [-0.83, 2.48, 0], [-1.48, 1.42, 0], 0.22, torsoMaterial);
  addCapsule(THREE, body, "arm", [-1.48, 1.42, 0], [-1.66, 0.32, 0.03], 0.18, torsoMaterial);
  addEllipsoid(THREE, body, "arm", [-1.67, 0.1, 0.03], [0.23, 0.3, 0.2], softMaterial, 18);
  addCapsule(THREE, body, "arm", [0.83, 2.48, 0], [1.48, 1.42, 0], 0.22, torsoMaterial);
  addCapsule(THREE, body, "arm", [1.48, 1.42, 0], [1.66, 0.32, 0.03], 0.18, torsoMaterial);
  addEllipsoid(THREE, body, "arm", [1.67, 0.1, 0.03], [0.23, 0.3, 0.2], softMaterial, 18);

  addCapsule(THREE, body, "leg", [-0.47, -0.12, 0], [-0.56, -1.35, 0], 0.29, torsoMaterial);
  addCapsule(THREE, body, "leg", [-0.56, -1.35, 0], [-0.64, -2.72, 0.04], 0.23, accentMaterial);
  addEllipsoid(THREE, body, "leg", [-0.72, -2.9, 0.16], [0.3, 0.18, 0.52], softMaterial, 18);
  addCapsule(THREE, body, "leg", [0.47, -0.12, 0], [0.56, -1.35, 0], 0.29, torsoMaterial);
  addCapsule(THREE, body, "leg", [0.56, -1.35, 0], [0.64, -2.72, 0.04], 0.23, accentMaterial);
  addEllipsoid(THREE, body, "leg", [0.72, -2.9, 0.16], [0.3, 0.18, 0.52], softMaterial, 18);

  const crossMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  const crossVertical = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.56, 0.08), crossMaterial);
  const crossHorizontal = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.16, 0.08), crossMaterial);
  crossVertical.position.set(0, 2.08, 0.55);
  crossHorizontal.position.set(0, 2.08, 0.55);
  body.add(crossVertical, crossHorizontal);
  body.rotation.y = -0.18;
  return body;
}

function setMeshHighlight(mesh, active, selected = false) {
  const material = mesh.material;
  if (!material?.color || !mesh.userData.region) return;
  if (active || selected) {
    material.color.setHex(COLORS.marigold);
    material.emissive?.setHex(COLORS.marigold);
    material.emissiveIntensity = selected ? 0.42 : 0.18;
    material.opacity = selected ? 0.98 : 0.92;
  } else {
    material.color.copy(mesh.userData.baseColor);
    material.emissive?.setHex(0x000000);
    material.emissiveIntensity = 0;
    material.opacity = mesh.userData.baseOpacity;
  }
}

function setRegionState(body, region, hovered, selected) {
  body.traverse((object) => {
    if (object.isMesh && object.userData.region) {
      setMeshHighlight(object, object.userData.region === region && hovered, object.userData.region === selected);
    }
  });
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
  } catch {
    onUnavailable?.();
    return { available: false };
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(27, 1, 0.1, 100);
  camera.position.set(0, 0.45, 12.5);
  const body = buildBody(THREE);
  scene.add(body);
  scene.add(new THREE.HemisphereLight(0xf8faf9, 0x5b8b70, 2.1));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(-4, 7, 8);
  scene.add(keyLight);
  const beacon = new THREE.PointLight(COLORS.marigold, 1.75, 12);
  beacon.position.set(3, 2.5, 5);
  scene.add(beacon);

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
  let animationFrame;

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth || 640);
    const height = Math.max(1, canvas.clientHeight || 480);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  const observer = window.ResizeObserver ? new window.ResizeObserver(resize) : { observe() {}, disconnect() {} };
  observer.observe(canvas);

  const getRegionHit = (event) => {
    const bounds = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(body.children, true).find((hit) => hit.object.userData.region)?.object || null;
  };

  const showTooltip = (region, event) => {
    if (!tooltip) return;
    if (!region) {
      tooltip.hidden = true;
      tooltip.textContent = "";
      return;
    }
    const labels = REGION_LABELS[region];
    tooltip.textContent = labels?.[currentLanguage] || labels?.en || region;
    tooltip.hidden = false;
    if (event && stage) {
      const stageBounds = stage.getBoundingClientRect();
      tooltip.style.left = `${Math.min(stageBounds.width - 190, Math.max(12, event.clientX - stageBounds.left + 14))}px`;
      tooltip.style.top = `${Math.min(stageBounds.height - 54, Math.max(12, event.clientY - stageBounds.top - 52))}px`;
    }
  };

  const pointerDown = (event) => {
    dragging = true;
    didDrag = false;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture?.(event.pointerId);
  };
  const pointerMove = (event) => {
    if (dragging) {
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      if (Math.abs(deltaX) + Math.abs(deltaY) > 2) didDrag = true;
      body.rotation.y += deltaX * 0.012;
      body.rotation.x = Math.max(-0.3, Math.min(0.3, body.rotation.x + deltaY * 0.006));
      lastX = event.clientX;
      lastY = event.clientY;
      return;
    }
    const hit = getRegionHit(event);
    hoveredRegion = hit?.userData.region || null;
    setRegionState(body, hoveredRegion, hoveredRegion, selectedRegion);
    showTooltip(hoveredRegion, event);
    onHover?.(hoveredRegion ? { region: hoveredRegion, labels: REGION_LABELS[hoveredRegion] } : null);
  };
  const pointerUp = (event) => {
    if (!didDrag) {
      const hit = getRegionHit(event);
      selectedRegion = hit?.userData.region || selectedRegion;
      setRegionState(body, hoveredRegion, hoveredRegion, selectedRegion);
      if (selectedRegion) onSelect?.(selectedRegion);
    }
    dragging = false;
    canvas.releasePointerCapture?.(event.pointerId);
  };
  const pointerLeave = () => {
    if (!dragging) {
      hoveredRegion = null;
      setRegionState(body, null, null, selectedRegion);
      showTooltip(null);
      onHover?.(null);
    }
  };

  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerUp);
  canvas.addEventListener("pointerleave", pointerLeave);

  const render = (now = 0) => {
    if (selectedRegion) {
      const pulse = 0.5 + Math.sin(now * 0.005) * 0.16;
      body.traverse((object) => {
        if (object.isMesh && object.userData.region === selectedRegion && object.material) object.material.emissiveIntensity = pulse;
      });
    }
    renderer.render(scene, camera);
    animationFrame = requestAnimationFrame(render);
  };
  render();

  return {
    available: true,
    setLanguage(nextLanguage) {
      currentLanguage = nextLanguage;
      if (hoveredRegion) showTooltip(hoveredRegion);
    },
    select(region) {
      selectedRegion = region;
      setRegionState(body, hoveredRegion, hoveredRegion, selectedRegion);
    },
    setView(view) {
      if (view === "front") body.rotation.set(0, 0, 0);
      if (view === "back") body.rotation.set(0, Math.PI, 0);
      if (view === "reset") body.rotation.set(0, -0.18, 0);
    },
    destroy() {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", pointerUp);
      canvas.removeEventListener("pointerleave", pointerLeave);
      tooltip?.remove();
      body.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material?.dispose) object.material.dispose();
      });
      renderer.dispose();
    },
  };
}
