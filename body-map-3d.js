// Presentation layer for the triage 3D body map.
// This file only reports a citizen-selected region. It never routes,
// diagnoses, calls a model, or chooses a department.

import * as THREE from "./vendor/three/three.module.js";
import { GLTFLoader } from "./vendor/three/GLTFLoader.js";

// Ensure global THREE is available for any external integrations
if (typeof window !== "undefined") {
  window.THREE = THREE;
}

// Serene alabaster porcelain anatomical twin aesthetic
const COLORS = Object.freeze({
  skinLight: 0xc8beb5,        // Warm alabaster porcelain
  skinContour: 0xcdbeaf,      // Subtle anatomical contouring
  skinDeep: 0xbda999,         // Soft anatomical shadow tone
  darkBody: 0x242e3b,         // Calm slate porcelain
  darkContour: 0x1b232e,      // Deep tone
  darkInner: 0x2f3c4c,        // Subsurface depth
  accentBlue: 0x8ecae6,       // Signature sky-blue sheen
  accentPurple: 0xb8a9c9,     // Soft lavender wireframe
  amber: 0xf59e0b,            // Interactive hover
});

// Dynamic Thermal Distress Intensity Levels (1 to 5)
export const INTENSITY_LEVELS = Object.freeze({
  1: { color: 0x10b981, emissive: 0x059669, label: "Mild / Distracting", hi: "हल्का / ध्यान भटकाने वाला" },
  2: { color: 0x0ea5e9, emissive: 0x0284c7, label: "Moderate / Uncomfortable", hi: "मध्यम / असहज" },
  3: { color: 0xf59e0b, emissive: 0xd97706, label: "Noticeable / Impairing", hi: "स्पष्ट / काम में बाधा" },
  4: { color: 0xf97316, emissive: 0xea580c, label: "Severe / Intense", hi: "तीव्र / गंभीर दर्द" },
  5: { color: 0xef4444, emissive: 0xdc2626, label: "Unbearable / Critical", hi: "असहनीय / अत्यंत गंभीर" },
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

// Female anatomical zone centers (normalized 1.75m coordinate space)
export const FEMALE_ZONE_CENTERS = Object.freeze({
  head: [0, 1.635, 0.06],
  eyes: [0, 1.625, 0.08],
  ears: [0.09, 1.605, 0.01],
  teeth: [0, 1.565, 0.07],
  face: [0, 1.595, 0.07],
  neck: [0, 1.495, 0.01],
  shoulder: [0.170, 1.380, 0.02],
  chest: [0, 1.280, 0.08],
  "upper-abdomen": [0, 1.080, 0.05],
  "lower-abdomen": [0, 0.950, 0.04],
  pelvis: [0, 0.820, -0.04],
  "upper-back": [0, 1.280, -0.06],
  "lower-back": [0, 1.080, -0.06],
  arm: [0.210, 1.150, 0.00],
  hand: [0.330, 0.830, -0.01],
  leg: [0.095, 0.680, 0.04],
  knee: [0.085, 0.480, 0.04],
  foot: [0.075, 0.055, 0.05],
});

// Male anatomical zone centers (normalized 1.75m coordinate space)
export const MALE_ZONE_CENTERS = Object.freeze({
  head: [0, 1.640, 0.06],
  eyes: [0, 1.630, 0.08],
  ears: [0.10, 1.610, 0.01],
  teeth: [0, 1.570, 0.07],
  face: [0, 1.600, 0.07],
  neck: [0, 1.494, 0.02],
  shoulder: [0.210, 1.380, 0.02],
  chest: [0, 1.300, 0.08],
  "upper-abdomen": [0, 1.080, 0.05],
  "lower-abdomen": [0, 0.950, 0.04],
  pelvis: [0, 0.820, -0.04],
  "upper-back": [0, 1.235, -0.08],
  "lower-back": [0, 1.080, -0.07],
  arm: [0.250, 1.150, 0.00],
  hand: [0.320, 0.830, 0.00],
  leg: [0.100, 0.680, 0.05],
  knee: [0.095, 0.480, 0.05],
  foot: [0.100, 0.070, 0.06],
});

export const ZONE_RADII = Object.freeze({
  head: 0.095,
  eyes: 0.055,
  ears: 0.055,
  teeth: 0.048,
  face: 0.068,
  neck: 0.058,
  chest: 0.135,
  "upper-abdomen": 0.115,
  "lower-abdomen": 0.105,
  pelvis: 0.125,
  "upper-back": 0.135,
  "lower-back": 0.115,
  shoulder: 0.078,
  arm: 0.075,
  hand: 0.058,
  leg: 0.105,
  knee: 0.068,
  foot: 0.062,
});

export function getZoneCenter(zoneId, silhouette = "neutral") {
  const centers = silhouette === "male" ? MALE_ZONE_CENTERS : FEMALE_ZONE_CENTERS;
  return centers[zoneId] || FEMALE_ZONE_CENTERS[zoneId] || [0, 0.88, 0];
}

// Maps raycast hit coordinates on the normalized 1.75m human body to anatomical zones
export function hitToZone(point, silhouette = "neutral") {
  const { x, y, z } = point;
  const isFemale = silhouette === "female" || silhouette === "neutral";
  const absX = Math.abs(x);
  const isRear = z < -0.04;

  // 1. Head & Facial Sensory Organs (Y >= 1.54)
  if (y >= 1.54) {
    if (y >= 1.66) return "head";
    if (absX > 0.075) return "ears";
    if (z > 0.035) {
      if (y >= 1.61 && absX < 0.055) return "eyes";
      if (y <= 1.58 && absX < 0.048) return "teeth";
      return "face";
    }
    return isRear ? "head" : "face";
  }

  // 2. Neck & Throat (Y: 1.44 -> 1.54)
  if (y >= 1.44 && y < 1.54) {
    return "neck";
  }

  // 3. Shoulders vs Chest / Upper Back (Y: 1.30 -> 1.46)
  const shoulderX = isFemale ? 0.13 : 0.15;
  if (y >= 1.30 && y < 1.46) {
    if (absX > shoulderX) return "shoulder";
    return isRear ? "upper-back" : "chest";
  }

  // 4. Upper Arms vs Chest / Back (Y: 1.20 -> 1.30)
  const armX = isFemale ? 0.17 : 0.19;
  if (y >= 1.20 && y < 1.30) {
    if (absX > armX) return "arm";
    return isRear ? "upper-back" : "chest";
  }

  // 5. Elbows vs Upper Abdomen / Back (Y: 1.08 -> 1.20)
  if (y >= 1.08 && y < 1.20) {
    if (absX > armX) return "arm";
    return isRear ? "lower-back" : "upper-abdomen";
  }

  // 6. Forearms vs Lower Abdomen / Lumbar (Y: 0.94 -> 1.08)
  if (y >= 0.94 && y < 1.08) {
    if (absX > armX) return "arm";
    return isRear ? "lower-back" : "upper-abdomen";
  }

  // 7. Hands vs Lower Abdomen / Pelvis (Y: 0.78 -> 0.94)
  const handX = isFemale ? 0.16 : 0.18;
  if (y >= 0.78 && y < 0.94) {
    if (absX > handX) return "hand";
    return isRear ? "pelvis" : "lower-abdomen";
  }

  // 8. Thighs (Y: 0.54 -> 0.78)
  if (y >= 0.54 && y < 0.78) {
    return "leg";
  }

  // 9. Knees (Y: 0.42 -> 0.54)
  if (y >= 0.42 && y < 0.54) {
    return isRear ? "leg" : "knee";
  }

  // 10. Calves & Lower Legs (Y: 0.15 -> 0.42)
  if (y >= 0.15 && y < 0.42) {
    return "leg";
  }

  // 11. Feet & Ankles (Y: 0.00 -> 0.15)
  return "foot";
}

// Standardizes raw GLB models directly into world coordinates:
// - Feet sit exactly at Y=0.00
// - Head sits at Y=1.75
// - Centered at X=0.00, Z=0.00
export function normalizeGLBScene(scene, targetHeight = 1.75) {
  scene.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(scene);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  const scale = size.y > 0 ? targetHeight / size.y : 1;

  scene.scale.set(scale, scale, scale);
  scene.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  scene.updateMatrixWorld(true);
}

// Creates the signature porcelain alabaster physical material
function createPorcelainMaterial(dark = false) {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(dark ? COLORS.darkBody : COLORS.skinLight),
    roughness: 0.55,
    metalness: 0.02,
    clearcoat: 0.35,
    clearcoatRoughness: 0.35,
    sheen: 0.80,
    sheenRoughness: 0.50,
    sheenColor: new THREE.Color(COLORS.accentBlue),
    emissive: new THREE.Color(dark ? 0x0f172a : 0x1a2a3a),
    emissiveIntensity: 0.12,
    transparent: true,
    opacity: 0.96,
    side: THREE.FrontSide,
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
  if (!canvas || !window.WebGLRenderingContext) {
    onUnavailable?.();
    return { available: false };
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0));
    if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
  } catch {
    onUnavailable?.();
    return { available: false };
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0, 0.92, 2.65);
  camera.lookAt(0, 0.88, 0);

  // Lighting suite for realistic anatomical definition
  const hemisphere = new THREE.HemisphereLight(0xfff7ed, 0x94a3b8, 1.8);
  const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
  keyLight.position.set(-2.5, 4.5, 5);

  const fillLight = new THREE.DirectionalLight(0xe0e7ff, 1.3);
  fillLight.position.set(3, -1, 4);

  const rimLight = new THREE.DirectionalLight(0xdbeafe, 1.6);
  rimLight.position.set(0, 3, -5);

  scene.add(hemisphere, keyLight, fillLight, rimLight);

  // Dynamic 3D Wireframe Highlight Sphere
  const highlightSphereGeo = new THREE.SphereGeometry(1, 24, 24);
  const highlightSphereMat = new THREE.MeshBasicMaterial({
    color: COLORS.accentBlue,
    wireframe: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  });
  const highlightSphere = new THREE.Mesh(highlightSphereGeo, highlightSphereMat);
  highlightSphere.visible = false;
  highlightSphere.renderOrder = 999;
  scene.add(highlightSphere);

  // Model storage & caching
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  const gltfLoader = new GLTFLoader();
  const cachedModels = { female: null, male: null };
  let currentSilhouette = "neutral";
  let activeMeshes = [];

  const MODEL_PATHS = {
    female: "./models/female-body.glb",
    male: "./models/male-body.glb",
  };

  async function loadModel(type) {
    const key = type === "male" ? "male" : "female";
    if (cachedModels[key]) {
      return cachedModels[key].clone();
    }
    return new Promise((resolve, reject) => {
      gltfLoader.load(
        MODEL_PATHS[key],
        (gltf) => {
          const loadedScene = gltf.scene;
          normalizeGLBScene(loadedScene, 1.75);
          cachedModels[key] = loadedScene;
          resolve(loadedScene.clone());
        },
        undefined,
        (err) => {
          console.warn("Could not load GLB for " + key + ":", err);
          reject(err);
        }
      );
    });
  }

  function applyMaterials(modelObj) {
    const dark = document.documentElement?.getAttribute("data-theme") === "dark";
    modelObj.traverse((child) => {
      if (child.isMesh) {
        child.material = createPorcelainMaterial(dark);
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  async function setSilhouetteModel(silhouette) {
    currentSilhouette = silhouette;
    const modelType = silhouette === "male" ? "male" : "female";
    try {
      const modelScene = await loadModel(modelType);
      applyMaterials(modelScene);

      // Clear existing models in group
      while (modelGroup.children.length > 0) {
        modelGroup.remove(modelGroup.children[0]);
      }
      modelGroup.add(modelScene);

      activeMeshes = [];
      modelScene.traverse((child) => {
        if (child.isMesh) activeMeshes.push(child);
      });

      updateVisualState();
    } catch (err) {
      console.error("Error setting silhouette model:", err);
    }
  }

  // Pre-load female/universal model initially
  await setSilhouetteModel("neutral");

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const tooltip = makeTooltip(stage);
  let currentLanguage = language;
  let hoveredRegion = null;
  let selectedRegion = null;
  let selectedIntensity = 3;

  // Touch & Pointer state
  let isPointerDown = false;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let velocityY = 0;
  let velocityX = 0;
  let rotationY = 0;
  let rotationX = 0;
  let targetRotationY = 0;
  let targetRotationX = 0;
  let pointerDownTime = 0;

  const targetCameraPosition = new THREE.Vector3(0, 0.92, 2.65);
  const targetLookAt = new THREE.Vector3(0, 0.88, 0);
  let targetLookY = 0.88;
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
  const themeObserver = window.MutationObserver ? new window.MutationObserver(() => applyMaterials(modelGroup)) : { observe() {}, disconnect() {} };
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  const getRegionHit = (event) => {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(activeMeshes, true);
    if (!intersects.length) return null;

    // Convert world hit point into local model coordinates
    const hitPoint = intersects[0].point.clone();
    modelGroup.worldToLocal(hitPoint);

    const region = hitToZone(hitPoint, currentSilhouette);
    return { region, point: hitPoint };
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
      tooltip.innerHTML = '<div class="tt-region-name">' + labels.en + ' · ' + labels.hi + '</div>' +
        '<div class="tt-dept-row"><span class="tt-tag">OPD Counter:</span> <strong>' + labels.dept + '</strong></div>' +
        '<div class="tt-tap-cta">Tap to select →</div>';
    }
    tooltip.hidden = false;
    if (event && stage) {
      const stageBounds = stage.getBoundingClientRect();
      const width = Math.min(stageBounds.width - 24, 300);
      tooltip.style.left = Math.min(stageBounds.width - width - 12, Math.max(12, event.clientX - stageBounds.left + 14)) + "px";
      tooltip.style.top = Math.min(stageBounds.height - 62, Math.max(12, event.clientY - stageBounds.top - 58)) + "px";
    }
  };

  function updateVisualState(now = 0) {
    const activeRegion = selectedRegion || hoveredRegion;
    const intensityConfig = INTENSITY_LEVELS[selectedIntensity] || INTENSITY_LEVELS[3];

    if (activeRegion) {
      const center = getZoneCenter(activeRegion, currentSilhouette);
      const radius = ZONE_RADII[activeRegion] || 0.10;
      const targetColor = selectedRegion ? intensityConfig.color : COLORS.accentBlue;

      highlightSphere.position.set(center[0], center[1], center[2]);
      highlightSphere.scale.setScalar(selectedRegion ? radius * 1.12 : radius);
      highlightSphere.material.color.setHex(targetColor);
      highlightSphere.visible = true;

      const pulse = selectedRegion 
        ? 0.55 + Math.sin(now * 0.006) * 0.20 
        : 0.38 + Math.sin(now * 0.004) * 0.14;
      highlightSphere.material.opacity = pulse;
    } else {
      highlightSphere.visible = false;
    }
  }

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
      velocityY = deltaX * 0.009;
      velocityX = deltaY * 0.004;
      rotationY += velocityY;
      rotationX = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, rotationX + velocityX));
      lastX = event.clientX;
      lastY = event.clientY;
      return;
    }
    const hit = getRegionHit(event);
    hoveredRegion = hit?.region || null;
    canvas.style.cursor = hoveredRegion ? "pointer" : "grab";
    updateVisualState();
    showTooltip(hoveredRegion, event);
    onHover?.(hoveredRegion ? { region: hoveredRegion, labels: REGION_LABELS[hoveredRegion] } : null);
  };

  const pointerUp = (event, allowSelect = true) => {
    const elapsed = performance.now() - pointerDownTime;
    const totalMoved = Math.hypot(event.clientX - startX, event.clientY - startY);
    const isTap = totalMoved < 10 || (elapsed < 320 && totalMoved < 16);

    if (allowSelect && isTap) {
      const hit = getRegionHit(event);
      if (hit?.region) {
        selectedRegion = hit.region;
        updateVisualState();
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
      updateVisualState();
      showTooltip(null);
      onHover?.(null);
    }
  };

  // Mouse wheel zoom
  const onWheel = (event) => {
    event.preventDefault();
    const zoomDelta = event.deltaY * 0.002;
    targetCameraPosition.z = Math.max(1.2, Math.min(4.2, targetCameraPosition.z + zoomDelta));
  };

  // Touch pinch-to-zoom for mobile screens
  let initialPinchDistance = 0;
  let initialCameraZ = 2.65;
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
      const ratio = initialPinchDistance / currentDistance;
      targetCameraPosition.z = Math.max(1.2, Math.min(4.2, initialCameraZ * ratio));
    }
  };

  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", (e) => pointerUp(e, false));
  canvas.addEventListener("pointerleave", pointerLeave);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("touchstart", onTouchStart, { passive: true });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });

  const render = (now) => {
    if (!isPointerDown) {
      velocityY *= 0.92;
      velocityX *= 0.92;
      rotationY += velocityY;
      rotationX = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, rotationX + velocityX));
      targetRotationY += 0.0016;
      rotationY += (targetRotationY - rotationY) * 0.04;
      rotationX += (targetRotationX - rotationX) * 0.04;
    }

    modelGroup.rotation.y = rotationY;
    modelGroup.rotation.x = rotationX;

    camera.position.lerp(targetCameraPosition, 0.08);
    targetLookAt.y += (targetLookY - targetLookAt.y) * 0.08;
    camera.lookAt(targetLookAt);

    if (highlightSphere.visible) {
      highlightSphere.rotation.y += 0.008;
      highlightSphere.rotation.x += 0.004;
    }

    updateVisualState(now);
    renderer.render(scene, camera);
    animationFrame = window.requestAnimationFrame(render);
  };

  animationFrame = window.requestAnimationFrame(render);

  function focusRegionCamera(region) {
    if (["head", "eyes", "ears", "teeth", "face", "neck"].includes(region)) {
      targetRotationY = 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 1.55, 1.35);
      targetLookY = 1.55;
    } else if (["chest", "upper-back"].includes(region)) {
      targetRotationY = region === "upper-back" ? Math.PI : 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 1.28, 1.45);
      targetLookY = 1.28;
    } else if (["upper-abdomen", "lower-abdomen", "lower-back", "pelvis"].includes(region)) {
      targetRotationY = region === "lower-back" ? Math.PI : 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 0.95, 1.55);
      targetLookY = 0.95;
    } else if (["leg", "knee", "foot"].includes(region)) {
      targetRotationY = 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 0.40, 1.65);
      targetLookY = 0.40;
    } else if (["shoulder", "arm", "hand"].includes(region)) {
      targetRotationY = 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 1.15, 1.65);
      targetLookY = 1.15;
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
      updateVisualState();
      if (region) focusRegionCamera(region);
    },
    setRegionIntensity(intensity) {
      selectedIntensity = Math.max(1, Math.min(5, parseInt(intensity, 10) || 3));
      updateVisualState();
    },
    async setSilhouette(newSilhouette) {
      if (!["neutral", "female", "male"].includes(newSilhouette) || newSilhouette === currentSilhouette) return;
      await setSilhouetteModel(newSilhouette);
    },
    getSilhouette() {
      return currentSilhouette;
    },
    setView(view) {
      if (view === "front") {
        targetRotationY = 0;
        targetRotationX = 0;
        targetCameraPosition.set(0, 0.92, 2.65);
        targetLookY = 0.88;
      } else if (view === "back") {
        targetRotationY = Math.PI;
        targetRotationX = 0;
        targetCameraPosition.set(0, 0.92, 2.65);
        targetLookY = 0.88;
      } else if (view === "upper") {
        targetCameraPosition.set(0, 1.35, 1.65);
        targetLookY = 1.35;
      } else if (view === "lower") {
        targetCameraPosition.set(0, 0.45, 1.75);
        targetLookY = 0.45;
      } else if (view === "zoom-in") {
        targetCameraPosition.z = Math.max(1.2, targetCameraPosition.z - 0.35);
      } else if (view === "zoom-out") {
        targetCameraPosition.z = Math.min(4.2, targetCameraPosition.z + 0.35);
      } else if (view === "reset") {
        targetRotationY = 0;
        targetRotationX = 0;
        targetCameraPosition.set(0, 0.92, 2.65);
        targetLookY = 0.88;
      }
    },
    destroy() {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointerleave", pointerLeave);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      tooltip?.remove();
      renderer.dispose();
    },
  };
}
