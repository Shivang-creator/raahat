import test from "node:test";
import assert from "node:assert/strict";
import { ROUTING_RULES } from "./routing-rules.js";
import { parseFreeTextComplaint, routeComplaint, checkRealtimeEmergency } from "./routing.js";

const baseComplaint = {
  region: "chest",
  kind: "pain",
  duration: "today",
  severity: "no",
  age_band: "adult",
  who_for: "self",
  severity_markers: [],
  parsed: true,
  unclear: [],
};

const redFlagComplaints = [
  { name: "chest pain with breathlessness", severity_markers: ["breathlessness"] },
  { name: "one-sided weakness", severity_markers: ["one-sided-weakness"] },
  { name: "baby not feeding", age_band: "baby", severity_markers: ["not-feeding"] },
  { name: "heavy bleeding", severity_markers: ["heavy-bleeding"] },
  { name: "fever with stiff neck", kind: "fever", severity_markers: ["stiff-neck"] },
  { name: "sudden severe headache", region: "head", severity_markers: ["sudden-severe-headache"] },
  { name: "difficulty breathing", kind: "breathing" },
  { name: "seizure", severity_markers: ["seizure"] },
  { name: "thoughts of self-harm", severity_markers: ["self-harm-thoughts"] },
];

test("every red flag reaches Emergency", () => {
  for (const redFlag of redFlagComplaints) {
    const result = routeComplaint({ ...baseComplaint, ...redFlag });
    assert.equal(result.department, "Emergency", redFlag.name);
    assert.equal(result.urgency, "emergency", redFlag.name);
    assert.match(result.rule_id, /^RF-/);
  }
});

test("one red flag is enough regardless of everything else", () => {
  const result = routeComplaint({
    ...baseComplaint,
    region: "foot",
    kind: "rash",
    duration: "longer",
    severity: "no",
    age_band: "child",
    who_for: "child",
    severity_markers: ["one-sided-numbness"],
  });
  assert.deepEqual(result, {
    department: "Emergency",
    urgency: "emergency",
    rule_id: "RF-02",
    reason: ROUTING_RULES.red_flags.find((entry) => entry.id === "RF-02").reason,
  });
});

test("an unparsed complaint never routes to reassurance", () => {
  const result = routeComplaint({
    ...baseComplaint,
    region: null,
    kind: null,
    duration: null,
    severity: null,
    parsed: false,
    unclear: ["seene mein dard, kal raat se"],
  });
  assert.notEqual(result.department, "You are fine");
  assert.notEqual(result.department, "No action needed");
  assert.equal(result.rule_id, "UNPARSED-01");
});

test("the same complaint always gives the same department", () => {
  const complaint = { ...baseComplaint, region: "upper-abdomen", kind: "vomiting" };
  assert.equal(routeComplaint(complaint).department, routeComplaint(complaint).department);
});

test("a flag cannot be cleared by reassuring details", () => {
  const result = routeComplaint({
    ...baseComplaint,
    severity: "no",
    duration: "longer",
    severity_markers: ["slurred-speech"],
  });
  assert.equal(result.rule_id, "RF-02");
  assert.equal(result.department, "Emergency");
});

test("expanded anatomical regions route to their first counters", () => {
  const expectedDepartments = {
    eyes: "Ophthalmology",
    nose: "ENT",
    ears: "ENT",
    teeth: "Dental",
    shoulder: "Orthopaedics",
    knee: "Orthopaedics",
    hand: "Orthopaedics",
    foot: "Orthopaedics",
    pelvis: "Orthopaedics",
    "upper-back": "Orthopaedics",
    "lower-back": "Orthopaedics",
  };
  for (const [region, department] of Object.entries(expectedDepartments)) {
    assert.equal(routeComplaint({ ...baseComplaint, region, kind: "pain" }).department, department, region);
  }
});

test("expanded region phrases create routeable complaints", () => {
  const cases = [
    ["eye pain", "Ophthalmology", "eyes"],
    ["nose pain", "ENT", "nose"],
    ["ear pain", "ENT", "ears"],
    ["tooth pain", "Dental", "teeth"],
    ["shoulder pain", "Orthopaedics", "shoulder"],
    ["knee pain", "Orthopaedics", "knee"],
    ["wrist pain", "Orthopaedics", "hand"],
    ["ankle pain", "Orthopaedics", "foot"],
    ["hip pain", "Orthopaedics", "pelvis"],
    ["upper back pain", "Orthopaedics", "upper-back"],
    ["lower back pain", "Orthopaedics", "lower-back"],
  ];
  for (const [phrase, department, region] of cases) {
    const complaint = parseFreeTextComplaint(phrase);
    assert.equal(complaint.region, region, phrase);
    assert.equal(routeComplaint(complaint).department, department, phrase);
  }
});

test("free-text and Hinglish phrases create the expected structured complaint", () => {
  const cases = [
    ["chest pain", "Cardiology", { region: "chest", kind: "pain", duration: "today", severity: "no" }],
    ["seene mein dard", "Cardiology", { region: "chest", kind: "pain" }],
    ["chest discomfort", "Cardiology", { region: "chest", kind: "pain" }],
    ["weakness on one side", "Emergency", { region: "general", kind: "low", marker: "one-sided-weakness" }],
    ["ek taraf kamzori", "Emergency", { marker: "one-sided-weakness" }],
    ["chest pain with breathlessness", "Emergency", { marker: "breathlessness" }],
    ["seene mein dard aur saans lene mein dikkat", "Emergency", { marker: "breathlessness" }],
    ["uncontrolled bleeding", "Emergency", { marker: "heavy-bleeding" }],
    ["bleeding won't stop", "Emergency", { marker: "heavy-bleeding" }],
    ["baby fever not feeding", "Emergency", { age_band: "baby", who_for: "child", marker: "not-feeding" }],
    ["bachhe ko bukhar hai doodh nahi pee raha", "Emergency", { age_band: "baby", who_for: "child", marker: "not-feeding" }],
    ["pet dard", "Gastroenterology", { region: "upper-abdomen", kind: "vomiting" }],
    ["pet kharab", "Gastroenterology", { region: "upper-abdomen", kind: "vomiting" }],
    ["पेट खराब", "Gastroenterology", { region: "upper-abdomen", kind: "vomiting" }],
    ["loose motion", "Gastroenterology", { region: "upper-abdomen", kind: "vomiting" }],
    ["vomiting", "Gastroenterology", { region: "upper-abdomen", kind: "vomiting" }],
    ["sar dard", "Neurology", { region: "head", kind: "pain" }],
    ["skin rash", "Dermatology", { region: "general", kind: "rash" }],
    ["daane", "Dermatology", { region: "general", kind: "rash" }],
    ["pair mein moch", "Orthopaedics", { region: "leg", kind: "injury" }],
    ["fracture leg", "Orthopaedics", { region: "leg", kind: "injury" }],
    ["fever", "General Medicine", { region: "general", kind: "fever" }],
    ["child fever", "Paediatrics", { age_band: "child", who_for: "child", kind: "fever" }],
  ];

  for (const [phrase, department, expected] of cases) {
    const complaint = parseFreeTextComplaint(phrase, phrase.includes("seene") || phrase.includes("bachhe") ? "hi" : "en");
    assert.equal(complaint.parsed, true, phrase);
    assert.equal(routeComplaint(complaint).department, department, phrase);
    for (const [field, value] of Object.entries(expected)) {
      if (field === "marker") assert.ok(complaint.severity_markers.includes(value), phrase);
      else assert.equal(complaint[field], value, phrase);
    }
  }
});

test("all nine red-flag phrases remain Emergency routes", () => {
  const phrases = [
    "chest pain with breathlessness",
    "weakness on one side",
    "baby fever not feeding",
    "heavy bleeding",
    "fever with stiff neck",
    "sudden severe headache",
    "difficulty breathing",
    "seizure",
    "thoughts of self-harm",
  ];
  for (const phrase of phrases) {
    const result = routeComplaint(parseFreeTextComplaint(phrase));
    assert.equal(result.department, "Emergency", phrase);
    assert.equal(result.urgency, "emergency", phrase);
    assert.match(result.rule_id, /^RF-/);
  }
});

test("pan-India vernacular phrases across scheduled languages route accurately without reassurance", () => {
  const vernacularCases = [
    // Tamil
    { phrase: "நெஞ்சு வலி", lang: "ta", department: "Cardiology", region: "chest", kind: "pain" },
    { phrase: "தலைவலி", lang: "ta", department: "Neurology", region: "head", kind: "pain" },
    { phrase: "வயிற்று வலி", lang: "ta", department: "Gastroenterology", region: "upper-abdomen", kind: "vomiting" },
    { phrase: "காய்ச்சல்", lang: "ta", department: "General Medicine", region: "general", kind: "fever" },
    { phrase: "ஒரு பக்க பலவீனம்", lang: "ta", department: "Emergency", urgency: "emergency", marker: "one-sided-weakness", rule_id: "RF-02" },
    { phrase: "மூச்சு திணறல்", lang: "ta", department: "Emergency", urgency: "emergency", marker: "difficulty-breathing", rule_id: "RF-07" },
    { phrase: "நெஞ்சு வலி மூச்சு திணறல்", lang: "ta", department: "Emergency", urgency: "emergency", marker: "breathlessness", rule_id: "RF-01" },

    // Telugu
    { phrase: "ఛాతీ నొప్పి", lang: "te", department: "Cardiology", region: "chest", kind: "pain" },
    { phrase: "తలనొప్పి", lang: "te", department: "Neurology", region: "head", kind: "pain" },
    { phrase: "కడుపు నొప్పి", lang: "te", department: "Gastroenterology", region: "upper-abdomen", kind: "vomiting" },
    { phrase: "జ్వరం", lang: "te", department: "General Medicine", region: "general", kind: "fever" },
    { phrase: "ఒక వైపు బలహీనత", lang: "te", department: "Emergency", urgency: "emergency", marker: "one-sided-weakness", rule_id: "RF-02" },

    // Bengali
    { phrase: "বুকে ব্যথা", lang: "bn", department: "Cardiology", region: "chest", kind: "pain" },
    { phrase: "মাথা ব্যথা", lang: "bn", department: "Neurology", region: "head", kind: "pain" },
    { phrase: "পেট ব্যথা", lang: "bn", department: "Gastroenterology", region: "upper-abdomen", kind: "vomiting" },
    { phrase: "জ্বর", lang: "bn", department: "General Medicine", region: "general", kind: "fever" },
    { phrase: "শ্বাসকষ্ট", lang: "bn", department: "Emergency", urgency: "emergency", marker: "difficulty-breathing", rule_id: "RF-07" },
    { phrase: "বুকে ব্যথা শ্বাসকষ্ট", lang: "bn", department: "Emergency", urgency: "emergency", marker: "breathlessness", rule_id: "RF-01" },

    // Marathi
    { phrase: "छातीत दुखणे", lang: "mr", department: "Cardiology", region: "chest", kind: "pain" },
    { phrase: "डोकेदुखी", lang: "mr", department: "Neurology", region: "head", kind: "pain" },
    { phrase: "पोटात दुखणे", lang: "mr", department: "Gastroenterology", region: "upper-abdomen", kind: "vomiting" },
    { phrase: "ताप", lang: "mr", department: "General Medicine", region: "general", kind: "fever" },
    { phrase: "एका बाजूला अशक्तपणा", lang: "mr", department: "Emergency", urgency: "emergency", marker: "one-sided-weakness", rule_id: "RF-02" },

    // Kannada
    { phrase: "ಎದೆ ನೋವು", lang: "kn", department: "Cardiology", region: "chest", kind: "pain" },
    { phrase: "ತಲೆನೋವು", lang: "kn", department: "Neurology", region: "head", kind: "pain" },
    { phrase: "ಹೊಟ್ಟೆ ನೋವು", lang: "kn", department: "Gastroenterology", region: "upper-abdomen", kind: "vomiting" },
    { phrase: "ಜ್ವರ", lang: "kn", department: "General Medicine", region: "general", kind: "fever" },
    { phrase: "ಉಸಿರಾಟದ ತೊಂದರೆ", lang: "kn", department: "Emergency", urgency: "emergency", marker: "difficulty-breathing", rule_id: "RF-07" },

    // Gujarati
    { phrase: "છાતીમાં દુખાવો", lang: "gu", department: "Cardiology", region: "chest", kind: "pain" },
    { phrase: "માથાનો દુખાવો", lang: "gu", department: "Neurology", region: "head", kind: "pain" },
    { phrase: "પેટમાં દુખાવો", lang: "gu", department: "Gastroenterology", region: "upper-abdomen", kind: "vomiting" },
    { phrase: "તાવ", lang: "gu", department: "General Medicine", region: "general", kind: "fever" },

    // Malayalam
    { phrase: "നെഞ്ചുവേദന", lang: "ml", department: "Cardiology", region: "chest", kind: "pain" },
    { phrase: "തലവേദന", lang: "ml", department: "Neurology", region: "head", kind: "pain" },
    { phrase: "വയറുവേദന", lang: "ml", department: "Gastroenterology", region: "upper-abdomen", kind: "vomiting" },
    { phrase: "പനി", lang: "ml", department: "General Medicine", region: "general", kind: "fever" },

    // Punjabi
    { phrase: "ਛਾਤੀ ਵਿੱਚ ਦਰਦ", lang: "pa", department: "Cardiology", region: "chest", kind: "pain" },
    { phrase: "ਸਿਰ ਦਰਦ", lang: "pa", department: "Neurology", region: "head", kind: "pain" },
    { phrase: "ਬੁਖਾਰ", lang: "pa", department: "General Medicine", region: "general", kind: "fever" },

    // Odia
    { phrase: "ଛାତିରେ ଯନ୍ତ୍ରଣା", lang: "or", department: "Cardiology", region: "chest", kind: "pain" },
    { phrase: "ମୁଣ୍ଡ ବିନ୍ଧା", lang: "or", department: "Neurology", region: "head", kind: "pain" },
    { phrase: "ଜ୍ୱର", lang: "or", department: "General Medicine", region: "general", kind: "fever" },

    // Urdu
    { phrase: "سینے میں درد", lang: "ur", department: "Cardiology", region: "chest", kind: "pain" },
    { phrase: "سر درد", lang: "ur", department: "Neurology", region: "head", kind: "pain" },
    { phrase: "پیٹ میں درد", lang: "ur", department: "Gastroenterology", region: "upper-abdomen", kind: "vomiting" },
    { phrase: "ایک طرف کمزوری", lang: "ur", department: "Emergency", urgency: "emergency", marker: "one-sided-weakness", rule_id: "RF-02" },
  ];

  for (const tc of vernacularCases) {
    const complaint = parseFreeTextComplaint(tc.phrase, tc.lang);
    assert.equal(complaint.parsed, true, `Parsed flag for "${tc.phrase}" (${tc.lang})`);
    if (tc.region) assert.equal(complaint.region, tc.region, `Region for "${tc.phrase}"`);
    if (tc.kind) assert.equal(complaint.kind, tc.kind, `Kind for "${tc.phrase}"`);
    if (tc.marker) assert.ok(complaint.severity_markers.includes(tc.marker), `Marker for "${tc.phrase}"`);

    const result = routeComplaint(complaint);
    assert.equal(result.department, tc.department, `Department for "${tc.phrase}" (${tc.lang})`);
    if (tc.urgency) assert.equal(result.urgency, tc.urgency, `Urgency for "${tc.phrase}"`);
    if (tc.rule_id) assert.equal(result.rule_id, tc.rule_id, `Rule ID for "${tc.phrase}"`);
  }
});

test("checkRealtimeEmergency activates immediately across all 9 red-flag markers", () => {
  const cases = [
    { input: "chest pain with breathlessness", expectedRule: "RF-01" },
    { input: "seene mein dard aur pasina aa raha hai", expectedRule: "RF-01" },
    { input: "weakness on one side", expectedRule: "RF-02" },
    { input: "ek taraf kamzori lakwa", expectedRule: "RF-02" },
    { input: "ஒரு பக்க பலவீனம்", expectedRule: "RF-02" },
    { input: "baby not feeding", expectedRule: "RF-03" },
    { input: "bachha doodh nahi pee raha", expectedRule: "RF-03" },
    { input: "heavy bleeding won't stop", expectedRule: "RF-04" },
    { input: "khoon ruk nahi raha", expectedRule: "RF-04" },
    { input: "fever with stiff neck", expectedRule: "RF-05" },
    { input: "gardan akad gayi bukhar mein", expectedRule: "RF-05" },
    { input: "sudden severe headache", expectedRule: "RF-06" },
    { input: "achanak bohot tez sar dard", expectedRule: "RF-06" },
    { input: "difficulty breathing", expectedRule: "RF-07" },
    { input: "saans lene mein bohot dikkat", expectedRule: "RF-07" },
    { input: "seizure and fits", expectedRule: "RF-08" },
    { input: "mirgi ka daura aaya", expectedRule: "RF-08" },
    { input: "thoughts of self-harm", expectedRule: "RF-09" },
    { input: "suicide harm myself", expectedRule: "RF-09" },
  ];

  for (const tc of cases) {
    const res = checkRealtimeEmergency(tc.input);
    assert.equal(res.isEmergency, true, `Should detect emergency for: "${tc.input}"`);
    assert.equal(res.ruleId, tc.expectedRule, `Should match rule ${tc.expectedRule} for: "${tc.input}"`);
    assert.ok(res.title, "Should have a title");
    assert.ok(res.advice, "Should have emergency advice");
  }

  // Non-emergencies should return isEmergency: false
  assert.equal(checkRealtimeEmergency("mild cough since yesterday").isEmergency, false);
  assert.equal(checkRealtimeEmergency("tooth pain since 2 days").isEmergency, false);
  assert.equal(checkRealtimeEmergency("").isEmergency, false);
  assert.equal(checkRealtimeEmergency(null).isEmergency, false);
});

test("parseFreeTextComplaint extracts demographic entities without requiring manual form filling", () => {
  // Case 1: Elderly father with conditions
  const c1 = parseFreeTextComplaint("My 64 year old father Ramesh has severe chest pain and diabetes");
  assert.equal(c1.who_for, "parent");
  assert.equal(c1.patient_name, "Ramesh");
  assert.equal(c1.exact_age, 64);
  assert.equal(c1.age_band, "older");
  assert.equal(c1.gender, "male");
  assert.ok(c1.conditions.includes("diabetes"));
  assert.equal(c1.region, "chest");
  assert.equal(c1.kind, "pain");

  // Case 2: Child fever in Hindi/Hinglish
  const c2 = parseFreeTextComplaint("bachhe ko 102 bukhar hai 5 saal ka beta Aarav");
  assert.equal(c2.who_for, "child");
  assert.equal(c2.exact_age, 5);
  assert.equal(c2.age_band, "child");
  assert.equal(c2.patient_name, "Aarav");
  assert.equal(c2.gender, "male");
  assert.equal(c2.kind, "fever");

  // Case 3: Young adult female with migraine and hypertension
  const c3 = parseFreeTextComplaint("Sunita Devi 32 female severe headache and high bp");
  assert.equal(c3.patient_name, "Sunita Devi");
  assert.equal(c3.exact_age, 32);
  assert.equal(c3.age_band, "adult");
  assert.equal(c3.gender, "female");
  assert.ok(c3.conditions.includes("hypertension"));
  assert.equal(c3.region, "head");
  assert.equal(c3.kind, "pain");
});


