import test from "node:test";
import assert from "node:assert/strict";
import { ROUTING_RULES } from "./routing-rules.js";
import { parseFreeTextComplaint, routeComplaint } from "./routing.js";

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
