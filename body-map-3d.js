// Presentation layer for the triage 3D body map.
// This file only reports a citizen-selected region. It never routes,
// diagnoses, calls a model, or chooses a department.

// EmoLens-inspired serene alabaster / porcelain medical twin aesthetic
const COLORS = Object.freeze({
  // Natural alabaster / porcelain tones (light theme)
  skinLight: 0xd9d1c7,        // Smooth warm porcelain
  skinContour: 0xcdbeaf,      // Subtle anatomical contouring
  skinDeep: 0xbda999,         // Soft anatomical shadow tone
  // Obsidian-slate alabaster (dark theme)
  darkBody: 0x242e3b,         // Calm slate porcelain
  darkContour: 0x1b232e,      // Deep tone
  darkInner: 0x2f3c4c,        // Subsurface depth
  // Interactive accents
  accentBlue: 0x8ecae6,       // EmoLens signature sky-blue sheen
  accentPurple: 0xb8a9c9,     // EmoLens soft lavender wireframe
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

// Precise 3D Zone Centers for the EmoLens Dynamic HighlightSphere
export const ZONE_CENTERS = Object.freeze({
  head: [0, 4.15, 0.05],
  eyes: [0, 3.92, 0.62],
  ears: [0, 3.75, 0.10],
  teeth: [0, 3.48, 0.58],
  face: [0, 3.68, 0.52],
  neck: [0, 3.12, 0.12],
  chest: [0, 2.32, 0.30],
  "upper-abdomen": [0, 1.62, 0.28],
  "lower-abdomen": [0, 0.98, 0.24],
  pelvis: [0, 0.35, 0.18],
  "upper-back": [0, 2.32, -0.38],
  "lower-back": [0, 1.30, -0.34],
  shoulder: [0.95, 2.52, 0.0],
  arm: [1.38, 1.58, 0.05],
  hand: [1.65, 0.22, 0.12],
  leg: [0.50, -0.72, 0.12],
  knee: [0.50, -1.42, 0.16],
  foot: [0.52, -2.85, 0.22],
});

export const ZONE_RADII = Object.freeze({
  head: 0.72,
  eyes: 0.34,
  ears: 0.36,
  teeth: 0.32,
  face: 0.44,
  neck: 0.40,
  chest: 0.88,
  "upper-abdomen": 0.70,
  "lower-abdomen": 0.68,
  pelvis: 0.76,
  "upper-back": 0.82,
  "lower-back": 0.72,
  shoulder: 0.46,
  arm: 0.42,
  hand: 0.34,
  leg: 0.55,
  knee: 0.38,
  foot: 0.36,
});

function themePalette() {
  const dark = document.documentElement?.getAttribute("data-theme") === "dark";
  return {
    body: dark ? COLORS.darkBody : COLORS.skinLight,
    secondary: dark ? COLORS.darkContour : COLORS.skinContour,
    inner: dark ? COLORS.darkInner : COLORS.skinDeep,
  };
}

// EmoLens-inspired Porcelain Physical Material
function makePorcelainMaterial(THREE, color, overrides = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.52,
    metalness: 0.02,
    clearcoat: 0.35,
    clearcoatRoughness: 0.32,
    sheen: 0.80,
    sheenRoughness: 0.48,
    sheenColor: new THREE.Color(COLORS.accentBlue),
    transparent: true,
    opacity: 0.96,
    side: THREE.FrontSide,
    emissive: 0x000000,
    emissiveIntensity: 0,
    ...overrides,
  });
}

function addRegionMesh(parent, mesh, region, material, themeRole = "body", priority = 0) {
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

// Generates an organic, contoured anatomical limb or torso segment
// with smooth cross-sections along the Y-axis
function createContouredSegment(THREE, fromArr, toArr, rTop, rMid, rBot, options = {}) {
  const from = new THREE.Vector3(...fromArr);
  const to = new THREE.Vector3(...toArr);
  const direction = to.clone().sub(from);
  const length = direction.length();

  const radialSegments = options.radialSegments || 28;
  const heightSegments = options.heightSegments || 20;
  const geometry = new THREE.CylinderGeometry(1, 1, length, radialSegments, heightSegments, false);
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();
  const halfLen = length / 2;

  const ovalX = options.ovalX || 1.0;
  const ovalZ = options.ovalZ || 1.0;
  const curveZ = options.curveZ || 0;
  const curveX = options.curveX || 0;
  const bellyT = options.bellyT !== undefined ? options.bellyT : 0.45;
  const bulgeZFront = options.bulgeZFront || 0;
  const bulgeZBack = options.bulgeZBack || 0;

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const t = (halfLen - v.y) / (length || 1); // 0 at top, 1 at bottom

    let currentR;
    if (t <= bellyT) {
      const subT = bellyT > 0 ? t / bellyT : 0;
      currentR = rTop + (rMid - rTop) * Math.sin(subT * (Math.PI / 2));
    } else {
      const subT = bellyT < 1 ? (t - bellyT) / (1 - bellyT) : 0;
      currentR = rMid - (rMid - rBot) * Math.sin(subT * (Math.PI / 2));
    }

    v.x *= currentR * ovalX;
    v.z *= currentR * ovalZ;

    // Arch along axis
    const arch = Math.sin(t * Math.PI);
    v.z += arch * curveZ;
    v.x += arch * curveX;

    // Asymmetrical front/back muscular contours (e.g. chest, buttocks)
    if (v.z > 0 && bulgeZFront) {
      v.z += Math.sin(t * Math.PI) * bulgeZFront;
    } else if (v.z < 0 && bulgeZBack) {
      v.z -= Math.sin(t * Math.PI) * bulgeZBack;
    }

    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry);
  mesh.position.copy(from.clone().add(to).multiplyScalar(0.5));
  if (length > 0.001) {
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  }
  return mesh;
}

// Creates an organic sculpted head with cranial vault, brow, jawline and chin
function createAnatomicalHead(THREE, material) {
  const headGroup = new THREE.Group();
  
  // 1. Cranium / Brain vault (upper head)
  const craniumGeo = new THREE.SphereGeometry(1, 32, 24);
  const cPos = craniumGeo.attributes.position;
  const cv = new THREE.Vector3();
  for (let i = 0; i < cPos.count; i++) {
    cv.fromBufferAttribute(cPos, i);
    // Slight parietal flare, occipital curve
    if (cv.y > 0) cv.y *= 1.05;
    if (cv.z < 0) cv.z *= 1.08;
    if (cv.y < 0) cv.x *= 0.92;
    cPos.setXYZ(i, cv.x, cv.y, cv.z);
  }
  craniumGeo.computeVertexNormals();
  const craniumMesh = new THREE.Mesh(craniumGeo, material);
  craniumMesh.position.set(0, 4.22, 0.0);
  craniumMesh.scale.set(0.68, 0.72, 0.74);
  headGroup.add(craniumMesh);

  // 2. Viscerocranium (Face, Cheeks, Jawline tapering down to chin)
  const faceGeo = new THREE.SphereGeometry(1, 32, 24);
  const fPos = faceGeo.attributes.position;
  const fv = new THREE.Vector3();
  for (let i = 0; i < fPos.count; i++) {
    fv.fromBufferAttribute(fPos, i);
    // Tapering into jaw and chin
    if (fv.y < 0) {
      const taper = fv.y + 1; // 0 at bottom, 1 at middle
      fv.x *= 0.52 + 0.48 * taper;
      fv.z *= 0.65 + 0.35 * taper;
    }
    // Cheekbone prominence
    if (fv.y > 0.05 && fv.y < 0.45 && fv.z > 0) {
      fv.x *= 1.06;
      fv.z *= 1.08;
    }
    // Brow ridge
    if (fv.y >= 0.45 && fv.z > 0) {
      fv.z *= 1.04;
    }
    fPos.setXYZ(i, fv.x, fv.y, fv.z);
  }
  faceGeo.computeVertexNormals();
  const faceMesh = new THREE.Mesh(faceGeo, material);
  faceMesh.position.set(0, 3.76, 0.16);
  faceMesh.scale.set(0.56, 0.58, 0.52);
  headGroup.add(faceMesh);

  return { headGroup, craniumMesh, faceMesh };
}

function buildBody(THREE, silhouette = "neutral") {
  const palette = themePalette();
  const body = new THREE.Group();
  
  const porcelain = makePorcelainMaterial(THREE, palette.body);
  const contourPorcelain = makePorcelainMaterial(THREE, palette.secondary);

  // Silhouette modifiers (procedural morphing)
  const isFemale = silhouette === "female";
  const isMale = silhouette === "male";
  
  const shoulderSpan = isFemale ? 0.88 : (isMale ? 1.12 : 1.0);
  const chestWidth = isFemale ? 0.92 : (isMale ? 1.08 : 1.0);
  const waistWidth = isFemale ? 0.80 : (isMale ? 0.96 : 0.88);
  const hipWidth = isFemale ? 1.16 : (isMale ? 0.92 : 1.02);

  // ==========================================
  // 1. HEAD & FACE
  // ==========================================
  const { headGroup, craniumMesh, faceMesh } = createAnatomicalHead(THREE, porcelain);
  addRegionMesh(body, craniumMesh, "head", porcelain, "body", 1);
  addRegionMesh(body, faceMesh, "face", porcelain, "body", 2);

  // Invisible anatomical sensory hitboxes (for precise tap selection without visual blobs)
  // Eyes
  const eyesHitbox = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 0.30), new THREE.MeshBasicMaterial({ visible: false }));
  eyesHitbox.position.set(0, 3.92, 0.55);
  addRegionMesh(body, eyesHitbox, "eyes", porcelain, "body", 5);

  // Ears
  for (const side of [-1, 1]) {
    const earHitbox = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 0.30), new THREE.MeshBasicMaterial({ visible: false }));
    earHitbox.position.set(side * 0.68, 3.82, 0.05);
    addRegionMesh(body, earHitbox, "ears", contourPorcelain, "body", 4);
  }

  // Teeth / Mouth / Jaw
  const mouthHitbox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.32), new THREE.MeshBasicMaterial({ visible: false }));
  mouthHitbox.position.set(0, 3.48, 0.50);
  addRegionMesh(body, mouthHitbox, "teeth", porcelain, "body", 5);

  // ==========================================
  // 2. NECK
  // ==========================================
  const neckMesh = createContouredSegment(
    THREE,
    [0, 3.40, 0.04],
    [0, 2.70, 0.02],
    0.32,
    0.34,
    0.46 * shoulderSpan,
    {
      ovalX: 1.10,
      ovalZ: 1.08,
      curveZ: 0.04,
      bellyT: 0.55,
      radialSegments: 26,
    }
  );
  addRegionMesh(body, neckMesh, "neck", porcelain, "body", 2);

  // ==========================================
  // 3. TORSO (Seamless Anatomical Continuous Segments)
  // ==========================================
  // A. Chest / Thorax (from clavicles Y=2.70 down to ribcage Y=1.95)
  const chestMesh = createContouredSegment(
    THREE,
    [0, 2.70, 0.02],
    [0, 1.95, 0.04],
    0.85 * shoulderSpan,
    1.12 * chestWidth,
    0.92 * waistWidth,
    {
      ovalX: 1.25,
      ovalZ: 0.72,
      curveZ: -0.02, // Gentle forward thoracic posture
      bulgeZFront: isFemale ? 0.32 : 0.14, // Natural pectoral/breast contours
      bulgeZBack: 0.08,  // Trapezius and rhomboid contour
      bellyT: 0.40,
      radialSegments: 32,
      heightSegments: 24,
    }
  );
  addRegionMesh(body, chestMesh, "chest", porcelain, "body", 1);

  // Upper back posterior hitbox
  const upperBackHitbox = new THREE.Mesh(new THREE.BoxGeometry(1.4 * shoulderSpan, 0.75, 0.40), new THREE.MeshBasicMaterial({ visible: false }));
  upperBackHitbox.position.set(0, 2.32, -0.36);
  addRegionMesh(body, upperBackHitbox, "upper-back", contourPorcelain, "secondary", 3);

  // B. Upper Abdomen / Stomach (from Y=1.95 to Y=1.25)
  const upperAbdomenMesh = createContouredSegment(
    THREE,
    [0, 1.95, 0.04],
    [0, 1.25, 0.02],
    0.92 * waistWidth,
    0.82 * waistWidth, // Waist indent
    0.88 * waistWidth,
    {
      ovalX: 1.20,
      ovalZ: 0.70,
      curveZ: 0.03, // Lumbar lordosis
      bellyT: 0.50,
      radialSegments: 30,
      heightSegments: 20,
    }
  );
  addRegionMesh(body, upperAbdomenMesh, "upper-abdomen", porcelain, "body", 1);

  // C. Lower Abdomen (from Y=1.25 to Y=0.65)
  const lowerAbdomenMesh = createContouredSegment(
    THREE,
    [0, 1.25, 0.02],
    [0, 0.65, 0.00],
    0.88 * waistWidth,
    0.98 * ((waistWidth + hipWidth) / 2),
    1.08 * hipWidth, // Flares into hips
    {
      ovalX: 1.18,
      ovalZ: 0.72,
      curveZ: 0.02,
      bellyT: 0.55,
      radialSegments: 30,
      heightSegments: 20,
    }
  );
  addRegionMesh(body, lowerAbdomenMesh, "lower-abdomen", porcelain, "body", 1);

  // Lower back / lumbar hitbox
  const lowerBackHitbox = new THREE.Mesh(new THREE.BoxGeometry(1.2 * waistWidth, 0.65, 0.38), new THREE.MeshBasicMaterial({ visible: false }));
  lowerBackHitbox.position.set(0, 1.30, -0.32);
  addRegionMesh(body, lowerBackHitbox, "lower-back", contourPorcelain, "secondary", 3);

  // D. Pelvis, Hips & Groin (from Y=0.65 down to Y=0.00)
  const pelvisMesh = createContouredSegment(
    THREE,
    [0, 0.65, 0.00],
    [0, 0.00, -0.02],
    1.08 * hipWidth,
    1.12 * hipWidth,
    0.82 * hipWidth,
    {
      ovalX: 1.15,
      ovalZ: 0.82,
      bulgeZBack: isFemale ? 0.28 : 0.18, // Gluteal contour
      bellyT: 0.40,
      radialSegments: 30,
      heightSegments: 20,
    }
  );
  addRegionMesh(body, pelvisMesh, "pelvis", porcelain, "body", 1);

  // ==========================================
  // 4. SHOULDERS, ARMS & HANDS
  // ==========================================
  for (const side of [-1, 1]) {
    // Deltoid Shoulder Cap
    const shoulderX = side * 1.12 * shoulderSpan;
    const deltoidGeo = new THREE.SphereGeometry(1, 24, 20);
    const deltoidMesh = new THREE.Mesh(deltoidGeo, contourPorcelain);
    deltoidMesh.position.set(shoulderX, 2.50, 0.0);
    deltoidMesh.scale.set(0.36, 0.42, 0.34);
    addRegionMesh(body, deltoidMesh, "shoulder", contourPorcelain, "secondary", 2);

    // Upper Arm (Deltoid to Elbow)
    const shoulderPt = [side * 1.10 * shoulderSpan, 2.42, 0.0];
    const elbowPt = [side * 1.46 * shoulderSpan, 1.48, 0.04];
    const upperArmMesh = createContouredSegment(
      THREE,
      shoulderPt,
      elbowPt,
      0.28,
      0.30,
      0.23,
      { ovalX: 1.06, ovalZ: 1.12, curveZ: 0.03, bellyT: 0.40 }
    );
    addRegionMesh(body, upperArmMesh, "arm", porcelain, "body", 1);

    // Elbow Joint Transition
    const elbowGeo = new THREE.SphereGeometry(1, 20, 16);
    const elbowMesh = new THREE.Mesh(elbowGeo, contourPorcelain);
    elbowMesh.position.set(...elbowPt);
    elbowMesh.scale.set(0.22, 0.22, 0.20);
    addRegionMesh(body, elbowMesh, "arm", contourPorcelain, "secondary", 2);

    // Forearm (Elbow to Wrist)
    const wristPt = [side * 1.66 * shoulderSpan, 0.52, 0.14];
    const forearmMesh = createContouredSegment(
      THREE,
      elbowPt,
      wristPt,
      0.23,
      0.24,
      0.16,
      { ovalX: 1.14, ovalZ: 0.94, curveZ: 0.02, bellyT: 0.32 }
    );
    addRegionMesh(body, forearmMesh, "arm", porcelain, "body", 1);

    // Wrist
    const wristGeo = new THREE.SphereGeometry(1, 18, 14);
    const wristMesh = new THREE.Mesh(wristGeo, contourPorcelain);
    wristMesh.position.set(...wristPt);
    wristMesh.scale.set(0.16, 0.12, 0.14);
    addRegionMesh(body, wristMesh, "hand", contourPorcelain, "secondary", 2);

    // Hand & Relaxed Fingers
    const palmPt = [side * 1.74 * shoulderSpan, 0.26, 0.18];
    const handGeo = new THREE.SphereGeometry(1, 20, 16);
    const hPos = handGeo.attributes.position;
    const hv = new THREE.Vector3();
    for (let i = 0; i < hPos.count; i++) {
      hv.fromBufferAttribute(hPos, i);
      if (hv.y < 0) hv.y *= 1.35; // Finger taper
      if (hv.z > 0) hv.z *= 0.75;
      hPos.setXYZ(i, hv.x, hv.y, hv.z);
    }
    handGeo.computeVertexNormals();
    const handMesh = new THREE.Mesh(handGeo, porcelain);
    handMesh.position.set(...palmPt);
    handMesh.scale.set(0.18, 0.28, 0.12);
    addRegionMesh(body, handMesh, "hand", porcelain, "body", 2);
  }

  // ==========================================
  // 5. LEGS, KNEES & FEET
  // ==========================================
  for (const side of [-1, 1]) {
    // Thigh (Hip to Knee)
    const hipPt = [side * 0.48 * hipWidth, -0.02, 0.0];
    const kneePt = [side * 0.50, -1.40, 0.06];
    const thighMesh = createContouredSegment(
      THREE,
      hipPt,
      kneePt,
      0.40,
      0.38,
      0.26,
      {
        ovalX: 1.05,
        ovalZ: 1.15,
        curveZ: 0.05, // Quadriceps forward fullness
        bellyT: 0.36,
      }
    );
    addRegionMesh(body, thighMesh, "leg", porcelain, "body", 1);

    // Knee / Patella
    const kneeGeo = new THREE.SphereGeometry(1, 22, 18);
    const kneeMesh = new THREE.Mesh(kneeGeo, contourPorcelain);
    kneeMesh.position.set(side * 0.50, -1.40, 0.16);
    kneeMesh.scale.set(0.20, 0.24, 0.18);
    addRegionMesh(body, kneeMesh, "knee", contourPorcelain, "secondary", 3);

    // Calf / Lower Leg (Knee to Ankle)
    const anklePt = [side * 0.52, -2.72, 0.02];
    const calfMesh = createContouredSegment(
      THREE,
      kneePt,
      anklePt,
      0.26,
      0.29,
      0.17,
      {
        ovalX: 0.96,
        ovalZ: 1.18,
        curveZ: -0.04, // Gastrocnemius posterior fullness
        bellyT: 0.28,
      }
    );
    addRegionMesh(body, calfMesh, "leg", porcelain, "body", 1);

    // Ankle Joint
    const ankleGeo = new THREE.SphereGeometry(1, 18, 14);
    const ankleMesh = new THREE.Mesh(ankleGeo, contourPorcelain);
    ankleMesh.position.set(...anklePt);
    ankleMesh.scale.set(0.18, 0.14, 0.16);
    addRegionMesh(body, ankleMesh, "foot", contourPorcelain, "secondary", 2);

    // Foot (Heel + Instep + Forefoot)
    const footGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.55, 18, 12);
    footGeo.rotateX(Math.PI / 2);
    const ftPos = footGeo.attributes.position;
    const ftv = new THREE.Vector3();
    for (let i = 0; i < ftPos.count; i++) {
      ftv.fromBufferAttribute(ftPos, i);
      if (ftv.z > 0) ftv.x *= 1.25; // Wider at toes
      if (ftv.y < 0) ftv.y *= 0.65; // Flat sole
      ftPos.setXYZ(i, ftv.x, ftv.y, ftv.z);
    }
    footGeo.computeVertexNormals();
    const footMesh = new THREE.Mesh(footGeo, porcelain);
    footMesh.position.set(side * 0.52, -2.88, 0.12);
    addRegionMesh(body, footMesh, "foot", porcelain, "body", 2);
  }

  body.rotation.set(0, -0.15, 0);
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
  body.traverse((object) => {
    if (!object.isMesh || !object.userData.region || !object.material?.color) return;
    const roleColor = object.userData.themeRole === "secondary" ? palette.secondary : palette.body;
    object.userData.baseColor.setHex(roleColor);
    if (!object.userData.isSelected && !object.userData.isHovered) {
      object.material.color.copy(object.userData.baseColor);
    }
  });
}

function updateVisualState(body, hoveredRegion, selectedRegion, selectedIntensity = 3, highlightSphere = null, now = 0) {
  const intensityConfig = INTENSITY_LEVELS[selectedIntensity] || INTENSITY_LEVELS[3];

  // Update Body Meshes
  body.traverse((object) => {
    if (!object.isMesh || !object.userData.region || !object.material?.color) return;
    const isHovered = object.userData.region === hoveredRegion;
    const isSelected = object.userData.region === selectedRegion;
    const isDimmed = Boolean(selectedRegion) && !isSelected;
    object.userData.isHovered = isHovered;
    object.userData.isSelected = isSelected;

    if (isSelected) {
      object.material.color.setHex(intensityConfig.color);
      object.material.emissive?.setHex(intensityConfig.emissive);
      object.material.emissiveIntensity = 0.60;
      object.material.opacity = 1.0;
      return;
    }

    if (isHovered) {
      object.material.color.setHex(COLORS.amber);
      object.material.emissive?.setHex(COLORS.amber);
      object.material.emissiveIntensity = 0.45;
      object.material.opacity = 0.98;
      return;
    }

    object.material.color.copy(object.userData.baseColor);
    object.material.emissive?.setHex(0x000000);
    object.material.emissiveIntensity = 0;
    object.material.opacity = isDimmed ? 0.38 : object.userData.restingOpacity;
  });

  // Update EmoLens Dynamic Highlight Sphere
  if (highlightSphere) {
    const activeRegion = selectedRegion || hoveredRegion;
    if (activeRegion && ZONE_CENTERS[activeRegion]) {
      const center = ZONE_CENTERS[activeRegion];
      const radius = ZONE_RADII[activeRegion] || 0.60;
      const targetColor = selectedRegion ? intensityConfig.color : COLORS.accentBlue;

      highlightSphere.position.set(...center);
      highlightSphere.scale.set(radius, radius, radius);
      highlightSphere.material.color.setHex(targetColor);
      highlightSphere.visible = true;

      // Gentle pulsing rhythm
      const pulse = selectedRegion 
        ? 0.50 + Math.sin(now * 0.006) * 0.20 
        : 0.35 + Math.sin(now * 0.004) * 0.12;
      highlightSphere.material.opacity = pulse;
    } else {
      highlightSphere.visible = false;
    }
  }
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

  let currentSilhouette = "neutral";
  let body = buildBody(THREE, currentSilhouette);
  scene.add(body);

  // EmoLens-style Dynamic Highlight Sphere
  const highlightSphereGeo = new THREE.SphereGeometry(1, 24, 20);
  const highlightSphereMat = new THREE.MeshBasicMaterial({
    color: COLORS.accentBlue,
    wireframe: true,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  });
  const highlightSphere = new THREE.Mesh(highlightSphereGeo, highlightSphereMat);
  highlightSphere.visible = false;
  highlightSphere.renderOrder = 999;
  scene.add(highlightSphere);

  // Refined studio lighting
  const hemisphere = new THREE.HemisphereLight(0xfff7ed, 0x94a3b8, 1.8);
  const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
  keyLight.position.set(-3.5, 6, 7);

  const fillLight = new THREE.DirectionalLight(0xe0e7ff, 1.3);
  fillLight.position.set(4, -1, 5);

  const rimLight = new THREE.DirectionalLight(0xdbeafe, 1.6);
  rimLight.position.set(0, 4, -7);

  scene.add(hemisphere, keyLight, fillLight, rimLight);

  const selectableMeshes = [];
  const refreshSelectables = () => {
    selectableMeshes.length = 0;
    body.traverse((object) => {
      if (object.isMesh && object.userData.region) selectableMeshes.push(object);
    });
  };
  refreshSelectables();

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
    updateVisualState(body, hoveredRegion, selectedRegion, selectedIntensity, highlightSphere);
    showTooltip(hoveredRegion, event);
    onHover?.(hoveredRegion ? { region: hoveredRegion, labels: REGION_LABELS[hoveredRegion] } : null);
  };

  const pointerUp = (event, allowSelect = true) => {
    const elapsed = performance.now() - pointerDownTime;
    const totalMoved = Math.hypot(event.clientX - startX, event.clientY - startY);
    const isTap = totalMoved < 10 || (elapsed < 320 && totalMoved < 16);

    if (allowSelect && isTap) {
      const hit = getRegionHit(event);
      if (hit?.userData.region) {
        selectedRegion = hit.userData.region;
        updateVisualState(body, hoveredRegion, selectedRegion, selectedIntensity, highlightSphere);
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
      updateVisualState(body, null, selectedRegion, selectedIntensity, highlightSphere);
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
      targetRotationY += 0.0018;
      rotationY += (targetRotationY - rotationY) * 0.04;
      rotationX += (targetRotationX - rotationX) * 0.04;
    }

    body.rotation.y = rotationY;
    body.rotation.x = rotationX;

    camera.position.lerp(targetCameraPosition, 0.08);
    targetLookAt.y += (targetLookY - targetLookAt.y) * 0.08;
    camera.lookAt(targetLookAt);

    if (highlightSphere.visible) {
      highlightSphere.rotation.y += 0.008;
      highlightSphere.rotation.x += 0.004;
    }

    updateVisualState(body, hoveredRegion, selectedRegion, selectedIntensity, highlightSphere, now);
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
      updateVisualState(body, hoveredRegion, selectedRegion, selectedIntensity, highlightSphere);
      if (region) focusRegionCamera(region);
    },
    setRegionIntensity(intensity) {
      selectedIntensity = Math.max(1, Math.min(5, parseInt(intensity, 10) || 3));
      updateVisualState(body, hoveredRegion, selectedRegion, selectedIntensity, highlightSphere);
    },
    setSilhouette(newSilhouette) {
      if (!["neutral", "female", "male"].includes(newSilhouette) || newSilhouette === currentSilhouette) return;
      currentSilhouette = newSilhouette;
      const oldRotY = body.rotation.y;
      const oldRotX = body.rotation.x;
      scene.remove(body);
      body = buildBody(THREE, currentSilhouette);
      body.rotation.y = oldRotY;
      body.rotation.x = oldRotX;
      scene.add(body);
      refreshSelectables();
      updateVisualState(body, hoveredRegion, selectedRegion, selectedIntensity, highlightSphere);
    },
    getSilhouette() {
      return currentSilhouette;
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
