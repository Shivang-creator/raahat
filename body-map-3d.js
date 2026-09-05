// Presentation layer for the triage 3D body map.
// This file only reports a citizen-selected region. It never routes,
// diagnoses, calls a model, or chooses a department.

import * as THREE from "./vendor/three/three.module.js";
import { GLTFLoader } from "./vendor/three/GLTFLoader.js";

// Ensure global THREE is available for any external integrations
if (typeof window !== "undefined") {
  window.THREE = THREE;
}

// Signature Raahat Medical Celadon & Sandalwood Porcelain anatomical twin aesthetic
const COLORS = Object.freeze({
  skinLight: 0xdde5df,        // Serene celadon porcelain tone
  skinContour: 0xccd8d1,      // Subtle jade-tinted anatomical contouring
  skinDeep: 0xb6c5be,         // Soft medical depth tone
  darkBody: 0x18202c,         // Deep obsidian slate porcelain (sleek, luxury, neutral)
  darkContour: 0x0f141d,      // Deep shadow tone
  darkInner: 0x1c2432,        // Deep sub-surface slate
  accentJade: 0x10b981,       // Organic healing medical jade (calm, warm emerald)
  accentTeal: 0x059669,       // Balanced emerald accent
  beaconCyan: 0x38bdf8,       // High-visibility sensory sapphire
  beaconAmber: 0xf59e0b,      // Active landmark selection gold
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
  nose: { en: "Nose / sinuses / breathing", hi: "नाक / साइनस / साँस नली", dept: "ENT" },
  ears: { en: "Ears / hearing", hi: "कान और सुनना", dept: "ENT" },
  teeth: { en: "Teeth / mouth / jaw", hi: "दाँत और मुँह / जबड़ा", dept: "Dental" },
  face: { en: "Face / cheeks / sinuses", hi: "चेहरा / गाल / जबड़ा", dept: "Dental / ENT" },
  neck: { en: "Neck / throat / thyroid", hi: "गर्दन / गला / थायरॉइड", dept: "ENT / General Medicine" },
  chest: { en: "Chest / heart / lungs", hi: "छाती / दिल / फेफड़े", dept: "Cardiology" },
  "upper-abdomen": { en: "Upper abdomen / stomach", hi: "ऊपरी पेट / आमाशय", dept: "Gastroenterology" },
  "lower-abdomen": { en: "Lower abdomen / bladder", hi: "निचला पेट / मूत्राशय", dept: "Gastroenterology" },
  back: { en: "Back / spine", hi: "पीठ / रीढ़", dept: "Orthopaedics" },
  "upper-back": { en: "Upper back / spine", hi: "ऊपरी पीठ / रीढ़", dept: "Orthopaedics" },
  "lower-back": { en: "Lower back / lumbar", hi: "कमर / निचली पीठ", dept: "Orthopaedics" },
  shoulder: { en: "Shoulders / clavicle", hi: "कंधे / कॉलरबोन", dept: "Orthopaedics" },
  arm: { en: "Arms / biceps / elbows", hi: "बाँह / कोहनी", dept: "Orthopaedics" },
  hand: { en: "Hands / wrists / fingers", hi: "हाथ, कलाई और उँगलियाँ", dept: "Orthopaedics" },
  leg: { en: "Legs / thighs / calves", hi: "पैर, जाँघ और पिंडलियाँ", dept: "Orthopaedics" },
  knee: { en: "Knee joints / patella", hi: "घुटने", dept: "Orthopaedics" },
  foot: { en: "Feet / ankles / toes", hi: "पैर, टखने और अँगूठे", dept: "Orthopaedics" },
  pelvis: { en: "Pelvis, Groin & Reproductive", hi: "पेल्विस, जननांग व प्रजनन स्वास्थ्य", dept: "Orthopaedics / Surgery" },
});

// Bilateral anatomical regions that have distinct left and right sides
export const BILATERAL_REGIONS = Object.freeze([
  "shoulder", "arm", "hand", "leg", "knee", "foot", "ears", "eyes"
]);

// Female anatomical zone centers (normalized 1.75m coordinate space)
export const FEMALE_ZONE_CENTERS = Object.freeze({
  head: [0, 1.635, 0.06],
  eyes: [0, 1.628, 0.082],
  nose: [0, 1.602, 0.088],
  ears: [0.09, 1.605, 0.01],
  teeth: [0, 1.565, 0.076],
  face: [0, 1.595, 0.072],
  neck: [0, 1.495, 0.015],
  shoulder: [0.170, 1.380, 0.02],
  chest: [0, 1.280, 0.08],
  "upper-abdomen": [0, 1.080, 0.05],
  "lower-abdomen": [0, 0.950, 0.04],
  pelvis: [0, 0.790, 0.03],
  "upper-back": [0, 1.280, -0.06],
  "lower-back": [0, 1.080, -0.06],
  arm: [0.210, 1.150, 0.00],
  hand: [0.330, 0.830, -0.01],
  leg: [0.095, 0.640, 0.04],
  knee: [0.085, 0.480, 0.04],
  foot: [0.075, 0.055, 0.05],
});

// Male anatomical zone centers (normalized 1.75m coordinate space)
export const MALE_ZONE_CENTERS = Object.freeze({
  head: [0, 1.640, 0.06],
  eyes: [0, 1.632, 0.082],
  nose: [0, 1.606, 0.088],
  ears: [0.10, 1.610, 0.01],
  teeth: [0, 1.570, 0.076],
  face: [0, 1.600, 0.072],
  neck: [0, 1.494, 0.02],
  shoulder: [0.210, 1.380, 0.02],
  chest: [0, 1.300, 0.08],
  "upper-abdomen": [0, 1.080, 0.05],
  "lower-abdomen": [0, 0.950, 0.04],
  pelvis: [0, 0.790, 0.03],
  "upper-back": [0, 1.235, -0.08],
  "lower-back": [0, 1.080, -0.07],
  arm: [0.250, 1.150, 0.00],
  hand: [0.320, 0.830, 0.00],
  leg: [0.100, 0.640, 0.05],
  knee: [0.095, 0.480, 0.05],
  foot: [0.100, 0.070, 0.06],
});

export const ZONE_RADII = Object.freeze({
  head: 0.095,
  eyes: 0.050,
  nose: 0.038,
  ears: 0.055,
  teeth: 0.045,
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
    if (absX > 0.072) return "ears";
    if (z > 0.025) {
      if (y >= 1.618 && absX < 0.055) return "eyes";
      if (y >= 1.585 && y < 1.618 && absX < 0.038) return "nose";
      if (y <= 1.585 && absX < 0.048) return "teeth";
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

  // 5. Upper Abdomen / Stomach vs Middle Back / Arms (Y: 1.04 -> 1.20)
  if (y >= 1.04 && y < 1.20) {
    if (absX > armX) return "arm";
    return isRear ? "lower-back" : "upper-abdomen";
  }

  // 6. Lower Abdomen vs Lumbar / Forearms (Y: 0.88 -> 1.04)
  if (y >= 0.88 && y < 1.04) {
    if (absX > armX) return "arm";
    return isRear ? "lower-back" : "lower-abdomen";
  }

  // 7. Pelvis, Groin & Reproductive vs Hands / Lateral Hips (Y: 0.72 -> 0.88)
  const handX = isFemale ? 0.16 : 0.18;
  if (y >= 0.72 && y < 0.88) {
    if (absX > handX) return "hand";
    return "pelvis";
  }

  // 8. Thighs / Upper Legs (Y: 0.52 -> 0.72)
  if (y >= 0.52 && y < 0.72) {
    return "leg";
  }

  // 9. Knees (Y: 0.42 -> 0.52)
  if (y >= 0.42 && y < 0.52) {
    return isRear ? "leg" : "knee";
  }

  // 10. Calves & Lower Legs (Y: 0.14 -> 0.42)
  if (y >= 0.14 && y < 0.42) {
    return "leg";
  }

  // 11. Feet & Ankles (Y: 0.00 -> 0.14)
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

// Creates the signature porcelain celadon physical material
function createPorcelainMaterial(dark = false) {
  if (dark) {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x18202c), // Deep sculpted obsidian slate
      roughness: 0.46,
      metalness: 0.08,
      clearcoat: 0.52,
      clearcoatRoughness: 0.22,
      sheen: 0.50,
      sheenRoughness: 0.32,
      sheenColor: new THREE.Color(0x94a3b8), // Soft silver-pearl edge highlight (zero cyan/blue)
      emissive: new THREE.Color(0x0c1118), // Deep rich neutral dark
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.98,
      side: THREE.FrontSide,
    });
  }
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(COLORS.skinLight),
    roughness: 0.50,
    metalness: 0.04,
    clearcoat: 0.42,
    clearcoatRoughness: 0.26,
    sheen: 0.70,
    sheenRoughness: 0.38,
    sheenColor: new THREE.Color(0xb2dfdb),
    emissive: new THREE.Color(0x102820),
    emissiveIntensity: 0.10,
    transparent: true,
    opacity: 0.98,
    side: THREE.FrontSide,
  });
}

// Interactive 3D Anatomical Landmark Beacons for high-clarity sensory & facial organ discovery
const ANATOMICAL_BEACONS = Object.freeze([
  { id: "eyes", label: "Eyes", hi: "आँखें", x: 0.038, y: 1.630, z: 0.082, mirror: true, side: "left", color: 0x38bdf8 },
  { id: "nose", label: "Nose & Sinuses", hi: "नाक व साइनस", x: 0.000, y: 1.604, z: 0.092, mirror: false, side: "both", color: 0x34d399 },
  { id: "teeth", label: "Teeth & Jaw", hi: "दाँत व जबड़ा", x: 0.000, y: 1.568, z: 0.078, mirror: false, side: "both", color: 0xfbbf24 },
  { id: "ears", label: "Ears & Hearing", hi: "कान", x: 0.095, y: 1.610, z: 0.010, mirror: true, side: "left", color: 0xa78bfa },
  { id: "neck", label: "Throat & Neck", hi: "गला व गर्दन", x: 0.000, y: 1.492, z: 0.030, mirror: false, side: "both", color: 0x10b981 },
]);

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

  // Precision clinical lighting suite for realistic anatomical definition
  const hemisphere = new THREE.HemisphereLight(0xfffbf5, 0x151c27, 1.4);
  const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.1);
  keyLight.position.set(-2.2, 4.2, 4.8);

  const fillLight = new THREE.DirectionalLight(0xe2e8f0, 0.85);
  fillLight.position.set(2.8, -0.6, 3.8);

  const rimLight = new THREE.DirectionalLight(0xfef3c7, 1.15);
  rimLight.position.set(0, 2.8, -4.8);

  scene.add(hemisphere, keyLight, fillLight, rimLight);

  function updateLighting(isDark = false) {
    if (isDark) {
      hemisphere.color.setHex(0xfffbf5);
      hemisphere.groundColor.setHex(0x111823);
      hemisphere.intensity = 1.35;

      keyLight.color.setHex(0xfff8ee);
      keyLight.intensity = 2.1;

      fillLight.color.setHex(0xe2e8f0);
      fillLight.intensity = 0.8;

      rimLight.color.setHex(0xfef3c7);
      rimLight.intensity = 1.15;
    } else {
      hemisphere.color.setHex(0xf8fafc);
      hemisphere.groundColor.setHex(0xcfd8dc);
      hemisphere.intensity = 1.6;

      keyLight.color.setHex(0xfffaed);
      keyLight.intensity = 2.0;

      fillLight.color.setHex(0xf1f5f9);
      fillLight.intensity = 0.95;

      rimLight.color.setHex(0xfef3c7);
      rimLight.intensity = 1.1;
    }
  }
  updateLighting(document.documentElement?.getAttribute("data-theme") === "dark");

  // Dual-ring clinical targeting system (spherical volume + equatorial rotating coordinate reticle)
  const highlightSphereGeo = new THREE.SphereGeometry(1, 24, 24);
  const highlightRingGeo = new THREE.TorusGeometry(1.0, 0.024, 8, 36);

  const createHighlightMesh = () => {
    const mat = new THREE.MeshBasicMaterial({
      color: COLORS.accentTeal,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(highlightSphereGeo, mat);
    mesh.visible = false;
    mesh.renderOrder = 999;
    scene.add(mesh);
    return mesh;
  };

  const createHighlightRing = () => {
    const mat = new THREE.MeshBasicMaterial({
      color: COLORS.accentJade,
      transparent: true,
      opacity: 0.75,
      depthTest: false,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(highlightRingGeo, mat);
    ring.visible = false;
    ring.renderOrder = 1000;
    scene.add(ring);
    return ring;
  };

  const highlightSphere1 = createHighlightMesh();
  const highlightSphere2 = createHighlightMesh();
  const highlightRing1 = createHighlightRing();
  const highlightRing2 = createHighlightRing();

  // Model storage & hierarchical groups
  const modelGroup = new THREE.Group();
  const bodyMeshGroup = new THREE.Group();
  const beaconGroup = new THREE.Group();
  modelGroup.add(bodyMeshGroup, beaconGroup);
  scene.add(modelGroup);

  // Build Interactive 3D Anatomical Landmark Beacons
  const beaconObjects = [];
  const beaconHitSpheres = [];

  const beaconDotGeo = new THREE.SphereGeometry(0.007, 12, 12);
  const beaconRingGeo = new THREE.RingGeometry(0.010, 0.014, 24);
  const beaconHitGeo = new THREE.SphereGeometry(0.026, 8, 8);

  ANATOMICAL_BEACONS.forEach((b) => {
    const beaconColor = b.color || COLORS.accentJade;
    const instances = b.mirror
      ? [
          { side: "left", x: b.x, y: b.y, z: b.z },
          { side: "right", x: -b.x, y: b.y, z: b.z },
        ]
      : [{ side: b.side, x: b.x, y: b.y, z: b.z }];

    instances.forEach((inst) => {
      const node = new THREE.Group();
      node.position.set(inst.x, inst.y, inst.z);

      const dotMat = new THREE.MeshBasicMaterial({
        color: beaconColor,
        depthTest: false,
        depthWrite: false,
      });
      const dot = new THREE.Mesh(beaconDotGeo, dotMat);
      dot.renderOrder = 990;

      const ringMat = new THREE.MeshBasicMaterial({
        color: beaconColor,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(beaconRingGeo, ringMat);
      ring.renderOrder = 989;

      const hitSphereMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitSphere = new THREE.Mesh(beaconHitGeo, hitSphereMat);
      hitSphere.userData = { isBeacon: true, region: b.id, side: inst.side };

      node.add(dot, ring, hitSphere);
      beaconGroup.add(node);

      beaconObjects.push({
        id: b.id,
        side: inst.side,
        group: node,
        dot,
        ring,
        hitSphere,
      });
      beaconHitSpheres.push(hitSphere);
    });
  });

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
    updateLighting(dark);
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

      // Clear existing models in body mesh group
      while (bodyMeshGroup.children.length > 0) {
        bodyMeshGroup.remove(bodyMeshGroup.children[0]);
      }
      bodyMeshGroup.add(modelScene);

      activeMeshes = [...beaconHitSpheres];
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
  let hoveredSide = "both";
  let selectedRegion = null;
  let selectedSide = "both";
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
  let isTransitioningView = false;
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
  const themeObserver = window.MutationObserver ? new window.MutationObserver(() => applyMaterials(bodyMeshGroup)) : { observe() {}, disconnect() {} };
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  const getRegionHit = (event) => {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(activeMeshes, true);
    if (!intersects.length) return null;

    // Check if the intersected object is an anatomical landmark beacon
    const beaconHit = intersects.find((hit) => hit.object.userData?.isBeacon);
    if (beaconHit) {
      return {
        region: beaconHit.object.userData.region,
        side: beaconHit.object.userData.side || "both",
        point: beaconHit.point.clone(),
      };
    }

    // Convert world hit point into local model coordinates
    const hitPoint = intersects[0].point.clone();
    modelGroup.worldToLocal(hitPoint);

    const region = hitToZone(hitPoint, currentSilhouette);
    const side = Math.abs(hitPoint.x) > 0.025 ? (hitPoint.x > 0 ? "left" : "right") : "both";
    return { region, side, point: hitPoint };
  };

  const showTooltip = (region, side = "both", event) => {
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
      const isBilateral = BILATERAL_REGIONS.includes(region);
      let sidePrefixEn = "";
      let sidePrefixHi = "";
      if (isBilateral) {
        if (side === "left") {
          sidePrefixEn = "Left ";
          sidePrefixHi = "बायाँ ";
        } else if (side === "right") {
          sidePrefixEn = "Right ";
          sidePrefixHi = "दायाँ ";
        } else if (side === "both") {
          sidePrefixEn = "Both Sides: ";
          sidePrefixHi = "दोनों तरफ: ";
        }
      }
      const sideCta = isBilateral
        ? ' (' + (side === "both" ? "Both sides" : (side === "left" ? "Left side" : "Right side")) + ')'
        : '';

      tooltip.innerHTML = '<div class="tt-region-name">' + sidePrefixEn + labels.en + ' · ' + sidePrefixHi + labels.hi + '</div>' +
        '<div class="tt-dept-row"><span class="tt-tag">OPD Counter:</span> <strong>' + labels.dept + '</strong></div>' +
        '<div class="tt-tap-cta">Tap to select' + sideCta + ' →</div>';
    }
    tooltip.hidden = false;
    if (event && stage) {
      const stageBounds = stage.getBoundingClientRect();
      const width = Math.min(stageBounds.width - 24, 320);
      tooltip.style.left = Math.min(stageBounds.width - width - 12, Math.max(12, event.clientX - stageBounds.left + 14)) + "px";
      tooltip.style.top = Math.min(stageBounds.height - 62, Math.max(12, event.clientY - stageBounds.top - 58)) + "px";
    }
  };

  function updateVisualState(now = 0) {
    const activeRegion = selectedRegion || hoveredRegion;
    const activeSide = selectedRegion ? selectedSide : (hoveredSide || selectedSide || "both");
    const intensityConfig = INTENSITY_LEVELS[selectedIntensity] || INTENSITY_LEVELS[3];

    if (activeRegion) {
      const center = getZoneCenter(activeRegion, currentSilhouette);
      const radius = ZONE_RADII[activeRegion] || 0.10;
      const targetColor = selectedRegion ? intensityConfig.color : COLORS.accentTeal;
      const isBilateral = BILATERAL_REGIONS.includes(activeRegion);
      const absX = Math.abs(center[0]);

      const pulse = selectedRegion 
        ? 0.55 + Math.sin(now * 0.006) * 0.20 
        : 0.38 + Math.sin(now * 0.004) * 0.14;

      const scale = selectedRegion ? radius * 1.12 : radius;
      highlightSphere1.scale.setScalar(scale);
      highlightSphere1.material.color.setHex(targetColor);
      highlightSphere1.material.opacity = pulse;

      highlightSphere2.scale.setScalar(scale);
      highlightSphere2.material.color.setHex(targetColor);
      highlightSphere2.material.opacity = pulse;

      highlightRing1.scale.setScalar(scale);
      highlightRing1.material.color.setHex(targetColor);

      highlightRing2.scale.setScalar(scale);
      highlightRing2.material.color.setHex(targetColor);

      if (isBilateral) {
        if (activeSide === "both") {
          highlightSphere1.position.set(absX, center[1], center[2]);
          highlightSphere1.visible = true;
          highlightRing1.position.copy(highlightSphere1.position);
          highlightRing1.visible = true;

          highlightSphere2.position.set(-absX, center[1], center[2]);
          highlightSphere2.visible = true;
          highlightRing2.position.copy(highlightSphere2.position);
          highlightRing2.visible = true;
        } else if (activeSide === "left") {
          highlightSphere1.position.set(absX, center[1], center[2]);
          highlightSphere1.visible = true;
          highlightRing1.position.copy(highlightSphere1.position);
          highlightRing1.visible = true;

          highlightSphere2.visible = false;
          highlightRing2.visible = false;
        } else if (activeSide === "right") {
          highlightSphere1.position.set(-absX, center[1], center[2]);
          highlightSphere1.visible = true;
          highlightRing1.position.copy(highlightSphere1.position);
          highlightRing1.visible = true;

          highlightSphere2.visible = false;
          highlightRing2.visible = false;
        }
      } else {
        highlightSphere1.position.set(0, center[1], center[2]);
        highlightSphere1.visible = true;
        highlightRing1.position.copy(highlightSphere1.position);
        highlightRing1.visible = true;

        highlightSphere2.visible = false;
        highlightRing2.visible = false;
      }
    } else {
      highlightSphere1.visible = false;
      highlightSphere2.visible = false;
      highlightRing1.visible = false;
      highlightRing2.visible = false;
    }

    // Update anatomical landmark beacons glow and feedback
    const isFrontFacing = Math.cos(modelGroup.rotation.y) > -0.25;
    beaconObjects.forEach((beacon) => {
      const isTargeted = activeRegion === beacon.id && (activeSide === "both" || activeSide === beacon.side);
      const pulse = 1.0 + Math.sin(now * 0.005) * 0.15;

      if (isTargeted) {
        beacon.dot.material.color.setHex(COLORS.beaconAmber);
        beacon.ring.material.color.setHex(COLORS.beaconAmber);
        beacon.ring.scale.setScalar(1.35 * pulse);
        beacon.dot.scale.setScalar(1.3);
      } else {
        beacon.dot.material.color.setHex(COLORS.accentTeal);
        beacon.ring.material.color.setHex(COLORS.accentJade);
        beacon.ring.scale.setScalar(pulse);
        beacon.dot.scale.setScalar(1.0);
      }

      // Smoothly attenuate beacon visibility when the body is rotated backwards
      const opacity = isFrontFacing ? 0.90 : 0.20;
      beacon.dot.material.opacity = opacity;
      beacon.ring.material.opacity = opacity * 0.85;
      beacon.ring.lookAt(camera.position);
    });
  }

  const pointerDown = (event) => {
    isPointerDown = true;
    dragging = true;
    isTransitioningView = false;
    startX = event.clientX;
    startY = event.clientY;
    lastX = event.clientX;
    lastY = event.clientY;
    velocityY = 0;
    velocityX = 0;
    pointerDownTime = performance.now();
    targetRotationY = rotationY;
    targetRotationX = rotationX;
    canvas.setPointerCapture?.(event.pointerId);
  };

  const pointerMove = (event) => {
    if (isPointerDown && dragging) {
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;
      velocityY = deltaX * 0.008;
      velocityX = deltaY * 0.004;
      rotationY += velocityY;
      rotationX = Math.max(-Math.PI / 5, Math.min(Math.PI / 5, rotationX + velocityX));
      targetRotationY = rotationY;
      targetRotationX = rotationX;
      lastX = event.clientX;
      lastY = event.clientY;
      return;
    }
    const hit = getRegionHit(event);
    hoveredRegion = hit?.region || null;
    hoveredSide = hit?.side || "both";
    canvas.style.cursor = hoveredRegion ? "pointer" : "grab";
    updateVisualState();
    showTooltip(hoveredRegion, hoveredSide, event);
    onHover?.(hoveredRegion ? { region: hoveredRegion, side: hoveredSide, labels: REGION_LABELS[hoveredRegion] } : null);
  };

  const pointerUp = (event, allowSelect = true) => {
    const elapsed = performance.now() - pointerDownTime;
    const totalMoved = Math.hypot(event.clientX - startX, event.clientY - startY);
    const isTap = totalMoved < 10 || (elapsed < 320 && totalMoved < 16);

    if (allowSelect && isTap) {
      const hit = getRegionHit(event);
      if (hit?.region) {
        let nextSide = hit.side || "both";
        const isBilateral = BILATERAL_REGIONS.includes(hit.region);
        if (isBilateral && selectedRegion === hit.region) {
          if ((selectedSide === "left" && hit.side === "right") || (selectedSide === "right" && hit.side === "left")) {
            nextSide = "both";
          } else if (selectedSide === hit.side) {
            nextSide = "both";
          }
        }
        selectedRegion = hit.region;
        selectedSide = nextSide;
        updateVisualState();
        if ("vibrate" in navigator) navigator.vibrate?.(18);
        onSelect?.(selectedRegion, selectedSide);
      }
    }
    isPointerDown = false;
    dragging = false;
    targetRotationY = rotationY;
    targetRotationX = rotationX;
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
      if (Math.abs(velocityY) > 0.0001) {
        rotationY += velocityY;
        velocityY *= 0.88;
        targetRotationY = rotationY;
      } else {
        velocityY = 0;
      }

      if (Math.abs(velocityX) > 0.0001) {
        rotationX = Math.max(-Math.PI / 5, Math.min(Math.PI / 5, rotationX + velocityX));
        velocityX *= 0.88;
        targetRotationX = rotationX;
      } else {
        velocityX = 0;
      }

      if (isTransitioningView) {
        rotationY += (targetRotationY - rotationY) * 0.08;
        rotationX += (targetRotationX - rotationX) * 0.08;
        if (Math.abs(targetRotationY - rotationY) < 0.001 && Math.abs(targetRotationX - rotationX) < 0.001) {
          rotationY = targetRotationY;
          rotationX = targetRotationX;
          isTransitioningView = false;
        }
      }
    }

    modelGroup.rotation.y = rotationY;
    modelGroup.rotation.x = rotationX;

    camera.position.lerp(targetCameraPosition, 0.08);
    targetLookAt.y += (targetLookY - targetLookAt.y) * 0.08;
    camera.lookAt(targetLookAt);

    if (highlightSphere1.visible) {
      highlightSphere1.rotation.y += 0.008;
      highlightSphere1.rotation.x += 0.004;
    }
    if (highlightSphere2.visible) {
      highlightSphere2.rotation.y += 0.008;
      highlightSphere2.rotation.x += 0.004;
    }
    if (highlightRing1.visible) {
      highlightRing1.rotation.z += 0.015;
      highlightRing1.rotation.x += 0.008;
    }
    if (highlightRing2.visible) {
      highlightRing2.rotation.z -= 0.015;
      highlightRing2.rotation.x -= 0.008;
    }

    updateVisualState(now);
    renderer.render(scene, camera);
    animationFrame = window.requestAnimationFrame(render);
  };

  animationFrame = window.requestAnimationFrame(render);

  function focusRegionCamera(region, side = "both") {
    isTransitioningView = true;
    let targetX = 0;
    if (BILATERAL_REGIONS.includes(region)) {
      if (side === "left") targetX = 0.06;
      else if (side === "right") targetX = -0.06;
    }
    if (["head", "eyes", "nose", "ears", "teeth", "face", "neck"].includes(region)) {
      targetRotationY = 0;
      targetRotationX = 0;
      targetCameraPosition.set(targetX, 1.58, 1.25);
      targetLookY = 1.58;
    } else if (["chest", "upper-back"].includes(region)) {
      targetRotationY = region === "upper-back" ? Math.PI : 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 1.28, 1.45);
      targetLookY = 1.28;
    } else if (["upper-abdomen", "lower-abdomen", "lower-back", "pelvis"].includes(region)) {
      targetRotationY = region === "lower-back" ? Math.PI : 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 0.88, 1.55);
      targetLookY = 0.88;
    } else if (["leg", "knee", "foot"].includes(region)) {
      targetRotationY = 0;
      targetRotationX = 0;
      targetCameraPosition.set(targetX, 0.40, 1.65);
      targetLookY = 0.40;
    } else if (["shoulder", "arm", "hand"].includes(region)) {
      targetRotationY = 0;
      targetRotationX = 0;
      targetCameraPosition.set(targetX, 1.15, 1.65);
      targetLookY = 1.15;
    }
  }

  return {
    available: true,
    setLanguage(nextLanguage) {
      currentLanguage = nextLanguage;
      if (hoveredRegion) showTooltip(hoveredRegion, hoveredSide);
    },
    select(region, side = "both") {
      selectedRegion = region;
      selectedSide = side || "both";
      updateVisualState();
      if (region) focusRegionCamera(region, selectedSide);
    },
    setSide(side) {
      selectedSide = side || "both";
      updateVisualState();
      if (selectedRegion) focusRegionCamera(selectedRegion, selectedSide);
    },
    getSide() {
      return selectedSide;
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
      isTransitioningView = true;
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
      } else if (view === "head") {
        targetRotationY = 0;
        targetRotationX = 0;
        targetCameraPosition.set(0, 1.60, 1.15);
        targetLookY = 1.60;
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
      highlightSphereGeo.dispose();
      highlightRingGeo.dispose();
      highlightSphere1.material.dispose();
      highlightSphere2.material.dispose();
      highlightRing1.material.dispose();
      highlightRing2.material.dispose();
      beaconDotGeo.dispose();
      beaconRingGeo.dispose();
      beaconHitGeo.dispose();
      renderer.dispose();
    },
  };
}
