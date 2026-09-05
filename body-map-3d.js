// Presentation layer for the triage 3D body map.
// This file only reports a citizen-selected region. It never routes,
// diagnoses, calls a model, or chooses a department.

// Warm, organic human anatomical tones (replacing artificial green robot palette)
const COLORS = Object.freeze({
  // Natural human skin / warm alabaster anatomical tones
  skinLight: 0xebd5c6,       // Warm porcelain / soft skin tone
  skinContour: 0xdfc0ad,     // Gentle muscular contour tone
  skinDeep: 0xcfa894,        // Anatomical depth tone
  heartRose: 0xe11d48,       // Living cardiovascular tone
  amber: 0xf59e0b,           // Warm clinical interactive amber
  amberLight: 0xfbbf24,      // Selected glow
  glowPulse: 0xfef08a,       // Breathing vitality
  // Dark mode anatomical silhouette
  darkBody: 0x2c3545,        // Soft slate-obsidian human form
  darkContour: 0x1e2634,     // Deep contour
  darkInner: 0x3d4a60,       // Inner anatomical depth
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
    body: dark ? COLORS.darkBody : COLORS.skinLight,
    secondary: dark ? COLORS.darkContour : COLORS.skinContour,
    inner: dark ? COLORS.darkInner : COLORS.skinDeep,
    organ: dark ? COLORS.amber : COLORS.heartRose,
  };
}

// Organic skin/tissue physical material with natural subsurface scattering look
function makeMaterial(THREE, color, overrides = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.38,
    metalness: 0.04,
    transmission: 0.16,
    thickness: 1.6,
    ior: 1.40,
    clearcoat: 0.22,
    clearcoatRoughness: 0.28,
    transparent: true,
    opacity: 0.94,
    side: THREE.FrontSide,
    emissive: 0x000000,
    emissiveIntensity: 0,
    ...overrides,
  });
}

function addRegion(parent, mesh, region, material, themeRole = "body", priority = 0) {
  mesh.material = material.clone();
  mesh.userData.region = region;
  mesh.userData.themeRole = themeRole;
  mesh.userData.priority = priority;
  mesh.userData.baseColor = mesh.material.color.clone();
  mesh.userData.baseOpacity = mesh.material.opacity;
  mesh.userData.restingOpacity = mesh.material.opacity;
  parent.add(mesh);
  return mesh;
}

function addSculptedEllipsoid(THREE, parent, region, position, scale, material, themeRole = "body", segments = 24, priority = 0, sculptFn = null) {
  const geometry = new THREE.SphereGeometry(1, segments, Math.max(14, segments - 6));
  if (sculptFn) {
    const pos = geometry.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      sculptFn(v);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geometry.computeVertexNormals();
  }
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  return addRegion(parent, mesh, region, material, themeRole, priority);
}

// Builds an organic contoured human limb (replaces robotic straight capsules)
function addContouredLimb(THREE, parent, region, fromArr, toArr, rTop, rMid, rBot, material, themeRole = "body", priority = 0, options = {}) {
  const from = new THREE.Vector3(...fromArr);
  const to = new THREE.Vector3(...toArr);
  const direction = to.clone().sub(from);
  const length = direction.length();
  
  // Height segments allow smooth anatomical muscular curves
  const radialSegments = 20;
  const heightSegments = 16;
  const geometry = new THREE.CylinderGeometry(1, 1, length, radialSegments, heightSegments);
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();
  const halfLen = length / 2;

  const ovalX = options.ovalX || 1.0;
  const ovalZ = options.ovalZ || 1.0;
  const curveZ = options.curveZ || 0;
  const curveX = options.curveX || 0;
  const bellyT = options.bellyT || 0.40; // Where the muscle belly is thickest (0 to 1)

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // t goes from 0 (top/from) to 1 (bottom/to)
    const t = (halfLen - v.y) / length;
    
    // Calculate smooth contoured radius along the limb length
    let currentR;
    if (t < bellyT) {
      const subT = t / bellyT;
      currentR = rTop + (rMid - rTop) * Math.sin(subT * (Math.PI / 2));
    } else {
      const subT = (t - bellyT) / (1 - bellyT);
      currentR = rMid - (rMid - rBot) * Math.sin(subT * (Math.PI / 2));
    }

    // Apply anatomical cross-section (elliptical)
    v.x *= currentR * ovalX;
    v.z *= currentR * ovalZ;

    // Apply natural organic curvature (e.g. calf bulge, quadriceps arch)
    const arch = Math.sin(t * Math.PI);
    v.z += arch * curveZ;
    v.x += arch * curveX;

    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(from.clone().add(to).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return addRegion(parent, mesh, region, material, themeRole, priority);
}

function buildBody(THREE) {
  const palette = themePalette();
  const body = new THREE.Group();
  
  const skinMaterial = makeMaterial(THREE, palette.body);
  const contourMaterial = makeMaterial(THREE, palette.secondary);
  const deepMaterial = makeMaterial(THREE, palette.inner, { opacity: 0.90 });
  const organMaterial = makeMaterial(THREE, palette.organ, {
    roughness: 0.28,
    metalness: 0.05,
    transmission: 0.25,
    opacity: 0.90,
    emissive: palette.organ,
    emissiveIntensity: 0.28,
  });
  const amberAccentMaterial = makeMaterial(THREE, COLORS.amber, {
    roughness: 0.20,
    transmission: 0.20,
    emissive: COLORS.amber,
    emissiveIntensity: 0.35,
  });

  // ==========================================
  // 1. HEAD, CRANIUM & BRAIN
  // ==========================================
  // Organic cranial vault (broader at parietal back, tapering gently forward)
  addSculptedEllipsoid(THREE, body, "head", [0, 4.02, -0.04], [0.72, 0.82, 0.80], skinMaterial, "body", 28, 0, (v) => {
    if (v.y < 0) v.x *= 0.92; // Tapering towards base of skull
    if (v.z > 0 && v.y > 0) v.y *= 1.04; // Gentle frontal curve
  });
  // Inner cerebrum core
  addSculptedEllipsoid(THREE, body, "head", [0, 4.10, -0.02], [0.58, 0.46, 0.62], deepMaterial, "inner", 20, 0);

  // ==========================================
  // 2. FACE, JAW, SENSORY ORGANS
  // ==========================================
  // Contoured human face tapering down into a smooth, natural jawline and chin
  addSculptedEllipsoid(THREE, body, "face", [0, 3.52, 0.36], [0.54, 0.52, 0.44], skinMaterial, "body", 28, 1, (v) => {
    // Sculpt jawline taper towards chin
    if (v.y < 0) {
      const taper = (v.y + 1);
      v.x *= 0.45 + 0.55 * taper;
      v.z *= 0.70 + 0.30 * taper;
    }
    // Subtle cheekbone (zygomatic) fullness
    if (v.y > 0.1 && v.y < 0.6) {
      v.x *= 1.08;
    }
  });

  // Eyes (natural human almond orbital contours)
  for (const side of [-1, 1]) {
    addSculptedEllipsoid(THREE, body, "eyes", [side * 0.24, 3.82, 0.68], [0.11, 0.08, 0.08], amberAccentMaterial, "organ", 18, 3);
  }

  // Nose (natural human nasal bridge with gently contoured tip)
  addSculptedEllipsoid(THREE, body, "ears", [0, 3.65, 0.76], [0.09, 0.16, 0.16], amberAccentMaterial, "organ", 18, 3, (v) => {
    if (v.y < 0) v.z *= 1.25; // Lobule/tip protrusion
  });

  // Teeth, lips and dental arch
  addSculptedEllipsoid(THREE, body, "teeth", [0, 3.38, 0.65], [0.20, 0.07, 0.10], amberAccentMaterial, "organ", 18, 3);

  // Ears (anatomically curved auricular pinnae)
  for (const side of [-1, 1]) {
    addSculptedEllipsoid(THREE, body, "ears", [side * 0.64, 3.72, 0.02], [0.08, 0.20, 0.14], contourMaterial, "secondary", 18, 2);
  }

  // ==========================================
  // 3. NECK & TRAPEZIUS (Organic Muscular Transition)
  // ==========================================
  // Neck flaring outwards into trapezius slope connecting to shoulders
  addContouredLimb(THREE, body, "neck", [0, 3.28, 0.04], [0, 2.70, 0.02], 0.34, 0.36, 0.54, skinMaterial, "body", 1, {
    ovalX: 1.12,
    ovalZ: 1.05,
    curveZ: 0.03, // Slight natural cervical lordosis
    bellyT: 0.65,
  });
  // Thyroid prominence / Adam's apple
  addSculptedEllipsoid(THREE, body, "neck", [0, 2.96, 0.34], [0.12, 0.12, 0.09], amberAccentMaterial, "organ", 16, 2);

  // ==========================================
  // 4. CHEST, THORAX & PULSING CARDIAC CORE
  // ==========================================
  // Pectoral / Thoracic mass (broad at clavicles, curving gently over ribs)
  addSculptedEllipsoid(THREE, body, "chest", [0, 2.14, 0.05], [1.18, 0.62, 0.64], skinMaterial, "body", 28, 0, (v) => {
    // Pectoral forward fullness
    if (v.y > 0 && v.z > 0) v.z *= 1.15;
    // Latissimus dorsi taper
    if (v.y < 0) v.x *= 0.94;
  });
  // Clavicular contour arch
  addSculptedEllipsoid(THREE, body, "chest", [0, 2.54, 0.28], [0.98, 0.12, 0.22], contourMaterial, "secondary", 24, 0);

  // Living Cardiac Core with sinus rhythm
  const heartCore = addSculptedEllipsoid(THREE, body, "chest", [0.22, 2.06, 0.52], [0.22, 0.26, 0.18], organMaterial, "organ", 20, 3);
  heartCore.userData.isCardiacCore = true;

  // ==========================================
  // 5. ABDOMEN & PELVIS (Natural Human Silhouette)
  // ==========================================
  // Upper abdomen / Epigastrium (narrows into natural human waistline)
  addSculptedEllipsoid(THREE, body, "upper-abdomen", [0, 1.34, 0.04], [0.94, 0.44, 0.56], skinMaterial, "body", 26, 0, (v) => {
    // Waist indent
    v.x *= 0.92;
    v.z *= 0.92;
  });
  // Upper abdomen internal digestive zone
  addSculptedEllipsoid(THREE, body, "upper-abdomen", [0.08, 1.36, 0.38], [0.38, 0.26, 0.18], amberAccentMaterial, "organ", 18, 2);

  // Lower abdomen (umbilical region down to pelvic basin)
  addSculptedEllipsoid(THREE, body, "lower-abdomen", [0, 0.72, 0.02], [0.92, 0.42, 0.54], skinMaterial, "body", 26, 0, (v) => {
    // Gentle natural pelvic flare towards bottom
    if (v.y < 0) v.x *= 1.06;
  });

  // Pelvis, hips & groin (iliac crest curve and natural hip transition)
  addSculptedEllipsoid(THREE, body, "pelvis", [0, 0.18, 0.0], [1.02, 0.38, 0.58], skinMaterial, "body", 26, 0, (v) => {
    if (v.y > 0) v.x *= 1.04; // Iliac crest fullness
    if (v.z < 0) v.z *= 1.12; // Gluteal contour
  });
  // Pelvic pubic arch indicator
  addSculptedEllipsoid(THREE, body, "pelvis", [0, 0.14, 0.44], [0.45, 0.18, 0.16], amberAccentMaterial, "organ", 18, 2);

  // ==========================================
  // 6. BACK & POSTERIOR SPINE
  // ==========================================
  // Upper back & Scapular muscles
  addSculptedEllipsoid(THREE, body, "upper-back", [0, 2.14, -0.42], [0.98, 0.56, 0.28], contourMaterial, "secondary", 24, 1, (v) => {
    if (v.z < 0) v.z *= 1.10; // Scapular contour
  });
  // Lower back & Lumbar erector spinae
  addSculptedEllipsoid(THREE, body, "lower-back", [0, 1.20, -0.40], [0.86, 0.48, 0.26], contourMaterial, "secondary", 24, 1, (v) => {
    // Natural human lumbar lordosis indent
    v.z *= 0.88;
  });

  // ==========================================
  // 7. SHOULDERS, ARMS & HANDS (Natural Relaxed Posture)
  // ==========================================
  // Relaxed human anatomical stance (not rigid T-pose): arms angled naturally with subtle elbow flexion
  for (const side of [-1, 1]) {
    // Deltoid muscle cap (rounded teardrop sitting naturally over glenohumeral joint)
    addSculptedEllipsoid(THREE, body, "shoulder", [side * 1.12, 2.44, 0.02], [0.38, 0.44, 0.36], contourMaterial, "secondary", 22, 1);

    // Upper Arm (Biceps & Triceps with anatomical taper to elbow)
    // Shoulder to elbow: arm hangs naturally, angled slightly outward (~12°) and forward (~5°)
    const shoulderPt = [side * 1.08, 2.36, 0.02];
    const elbowPt = [side * 1.44, 1.42, 0.06];
    addContouredLimb(THREE, body, "arm", shoulderPt, elbowPt, 0.30, 0.32, 0.24, skinMaterial, "body", 0, {
      ovalX: 1.08,
      ovalZ: 1.12,
      curveZ: 0.04,
      bellyT: 0.42,
    });

    // Anatomical Elbow transition (seamless olecranon contour, NO robot ball!)
    addSculptedEllipsoid(THREE, body, "arm", elbowPt, [0.22, 0.22, 0.20], contourMaterial, "secondary", 18, 1);

    // Forearm (classic human teardrop: fuller upper brachioradialis tapering to slender wrist)
    const wristPt = [side * 1.62, 0.44, 0.16];
    addContouredLimb(THREE, body, "arm", elbowPt, wristPt, 0.24, 0.25, 0.17, skinMaterial, "body", 0, {
      ovalX: 1.15,
      ovalZ: 0.95,
      curveZ: 0.03,
      bellyT: 0.32,
    });

    // Hand & Wrist (natural human resting pose: cupped palm, relaxed thumb, curled fingers)
    // Wrist
    addSculptedEllipsoid(THREE, body, "hand", wristPt, [0.18, 0.12, 0.14], contourMaterial, "secondary", 18, 1);
    // Palm
    const palmPt = [side * 1.68, 0.22, 0.20];
    addSculptedEllipsoid(THREE, body, "hand", palmPt, [0.18, 0.22, 0.13], skinMaterial, "body", 20, 1, (v) => {
      // Gentle cupped palm
      if (v.z > 0) v.z *= 0.85;
    });
    // Thumb & relaxed fingers
    addSculptedEllipsoid(THREE, body, "hand", [side * 1.58, 0.20, 0.26], [0.08, 0.14, 0.08], skinMaterial, "body", 16, 1);
    addSculptedEllipsoid(THREE, body, "hand", [side * 1.70, 0.02, 0.22], [0.14, 0.18, 0.10], skinMaterial, "body", 16, 1);
  }

  // ==========================================
  // 8. LEGS, KNEES, ANKLES & FEET (Natural Contoured Stance)
  // ==========================================
  for (const side of [-1, 1]) {
    // Thigh (strong quadriceps curve with anterior fullness and medial taper)
    const hipPt = [side * 0.50, -0.04, 0.02];
    const kneePt = [side * 0.54, -1.38, 0.08]; // Slight natural knee forward flexion (~4°)
    addContouredLimb(THREE, body, "leg", hipPt, kneePt, 0.42, 0.40, 0.28, skinMaterial, "body", 0, {
      ovalX: 1.05,
      ovalZ: 1.18, // Anterior quadriceps depth
      curveZ: 0.06, // Natural thigh anterior arch
      bellyT: 0.38,
    });

    // Anatomical Knee joint (patellar prominence in quadriceps tendon, NO robot ball!)
    addSculptedEllipsoid(THREE, body, "knee", [side * 0.54, -1.38, 0.24], [0.20, 0.24, 0.16], contourMaterial, "secondary", 18, 2, (v) => {
      if (v.z > 0) v.z *= 1.18; // Patella prominence
    });

    // Calf & Shin (classic human gastrocnemius curve: muscular upper calf tapering to Achilles tendon)
    const anklePt = [side * 0.58, -2.70, 0.02];
    addContouredLimb(THREE, body, "leg", kneePt, anklePt, 0.28, 0.30, 0.18, skinMaterial, "body", 0, {
      ovalX: 0.95,
      ovalZ: 1.20,
      curveZ: -0.05, // Posterior calf bulge
      bellyT: 0.30,
    });

    // Ankle joint (medial and lateral malleoli contours)
    addSculptedEllipsoid(THREE, body, "foot", anklePt, [0.22, 0.16, 0.18], contourMaterial, "secondary", 18, 1);

    // Foot (arched foot with distinct heel/calcaneus and forward toe taper)
    const heelPt = [side * 0.58, -2.88, -0.08];
    const forefootPt = [side * 0.60, -2.94, 0.28];
    // Heel
    addSculptedEllipsoid(THREE, body, "foot", heelPt, [0.18, 0.16, 0.24], skinMaterial, "body", 18, 1);
    // Forefoot & Toes (angled slightly outward ~7° natural stance)
    addSculptedEllipsoid(THREE, body, "foot", forefootPt, [0.22, 0.14, 0.38], skinMaterial, "body", 20, 1, (v) => {
      // Natural arch on inner side
      if (side > 0 && v.x < 0) v.y += 0.08;
      if (side < 0 && v.x > 0) v.y += 0.08;
    });
  }

  body.rotation.set(0, -0.15, 0);
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
  const roleColors = { body: palette.body, secondary: palette.secondary, inner: palette.inner, organ: palette.organ };
  body.traverse((object) => {
    if (!object.isMesh || !object.userData.region || !object.material?.color) return;
    const color = roleColors[object.userData.themeRole] || palette.body;
    object.userData.baseColor.setHex(color);
    if (!object.userData.isSelected && !object.userData.isHovered) object.material.color.copy(object.userData.baseColor);
  });
}

function updateVisualState(body, hoveredRegion, selectedRegion, now = 0) {
  const selectedPulse = 0.65 + Math.sin(now * 0.005) * 0.28;
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
      object.material.emissiveIntensity = 0.50;
      object.material.opacity = 0.98;
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

  // Warm studio lighting that enhances natural human musculature and contours
  const hemisphere = new THREE.HemisphereLight(0xffedd5, 0x94a3b8, 2.0); // Warm ivory sky, soft cool slate ground
  const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.4); // Soft warm key light
  keyLight.position.set(-3.5, 6, 7);

  const fillLight = new THREE.DirectionalLight(0xe0e7ff, 1.2); // Soft cool fill
  fillLight.position.set(4, -1, 5);

  const rimLight = new THREE.DirectionalLight(0xfde68a, 1.6); // Warm golden rim light highlighting human silhouette
  rimLight.position.set(0, 4, -7);

  const heartLight = new THREE.PointLight(0xf43f5e, 0.9, 3.5); // Soft inner cardiovascular glow
  heartLight.position.set(0.22, 2.06, 0.65);

  scene.add(hemisphere, keyLight, fillLight, rimLight, heartLight);

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

    // Prioritize specific anatomical organs over surrounding capsules
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
      const ratio = initialPinchDistance / currentDistance;
      targetCameraPosition.z = Math.max(5.0, Math.min(17.0, initialCameraZ * ratio));
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
      rotationX = Math.max(-Math.PI / 5, Math.min(Math.PI / 5, rotationX + velocityX));
      targetRotationY += 0.0018; // Gentle breathing ambient rotation
      rotationY += (targetRotationY - rotationY) * 0.04;
      rotationX += (targetRotationX - rotationX) * 0.04;
    }

    body.rotation.y = rotationY;
    body.rotation.x = rotationX;

    // Smooth camera interpolation
    camera.position.lerp(targetCameraPosition, 0.08);
    targetLookAt.y += (targetLookY - targetLookAt.y) * 0.08;
    camera.lookAt(targetLookAt);

    // Living cardiac rhythm
    if (body.userData.heartCore) {
      const heartBeat = 1.0 + Math.pow(Math.sin(now * 0.0055), 4) * 0.16;
      body.userData.heartCore.scale.set(0.22 * heartBeat, 0.26 * heartBeat, 0.18 * heartBeat);
    }

    updateVisualState(body, hoveredRegion, selectedRegion, now);
    renderer.render(scene, camera);
    animationFrame = window.requestAnimationFrame(render);
  };

  animationFrame = window.requestAnimationFrame(render);

  function focusRegionCamera(region) {
    if (["head", "eyes", "ears", "teeth", "face", "neck"].includes(region)) {
      targetRotationY = 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 3.4, 6.8);
      targetLookY = 3.4;
    } else if (["chest", "upper-back"].includes(region)) {
      targetRotationY = region === "upper-back" ? Math.PI : 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 2.0, 7.8);
      targetLookY = 2.0;
    } else if (["upper-abdomen", "lower-abdomen", "lower-back", "pelvis"].includes(region)) {
      targetRotationY = region === "lower-back" ? Math.PI : 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 0.8, 8.2);
      targetLookY = 0.8;
    } else if (["leg", "knee", "foot"].includes(region)) {
      targetRotationY = 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, -1.4, 8.5);
      targetLookY = -1.4;
    } else if (["shoulder", "arm", "hand"].includes(region)) {
      targetRotationY = 0;
      targetRotationX = 0;
      targetCameraPosition.set(0, 1.4, 8.2);
      targetLookY = 1.4;
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
        targetRotationY = 0;
        targetRotationX = 0;
        targetCameraPosition.set(0, 0.5, 12);
        targetLookY = 0.5;
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
