import { ROUTING_RULES } from "./routing-rules.js";

const cleanText = (value) => String(value || "")
  .toLocaleLowerCase("en-IN")
  .replace(/[’']/g, "'")
  .replace(/\s+/g, " ")
  .trim();

const hasAny = (text, phrases) => phrases.some((phrase) => text.includes(phrase));

/**
 * Small, deterministic, client-side phrase extractor. It only creates a
 * Complaint shape; it never diagnoses or selects a department.
 */
export function parseFreeTextComplaint(input, language = "en") {
  const original = String(input || "").trim();
  const text = cleanText(original);
  const complaint = {
    region: null,
    kind: null,
    duration: null,
    severity: null,
    age_band: null,
    who_for: null,
    severity_markers: [],
    parsed: false,
    unclear: original ? [original] : [],
  };

  if (!text) return complaint;

  const isBaby = hasAny(text, ["baby", "infant", "newborn", "नन्हा", "शिशु", "छोटे बच्चे", "bachhe", "bacche"]);
  const isChild = isBaby || hasAny(text, ["child", "kid", "बच्चे", "बच्चा", "बच्ची", "child"]);
  if (isBaby) complaint.age_band = "baby";
  else if (isChild) complaint.age_band = "child";
  if (isChild) complaint.who_for = "child";

  const hasChest = hasAny(text, ["chest", "सीने", "सीना", "seene", "sine"]);
  const hasHead = hasAny(text, ["headache", "head pain", "सिरदर्द", "सिर दर्द", "sar dard", "sir dard"]);
  const hasAbdomen = hasAny(text, [
    "stomach", "tummy", "stomach upset", "upset stomach", "indigestion", "pet", "पेट",
    "पेट खराब", "पेट ख़राब", "pet kharab", "pet kharaab", "pet upset", "loose motion",
    "loose motions", "dast", "vomit", "vomiting", "उल्टी", "दस्त",
  ]);
  const hasLeg = hasAny(text, ["leg", "pair", "पैर", "टांग", "टाँग"]);

  const breathlessness = hasAny(text, [
    "breathlessness", "shortness of breath", "difficulty breathing", "breathing difficulty",
    "saans lene mein dikkat", "saans ki dikkat", "सांस लेने में दिक्कत", "साँस लेने में दिक्कत",
  ]);
  const sweating = hasAny(text, ["sweating", "sweat", "pasina", "पसीना"]);
  const oneSidedWeakness = hasAny(text, [
    "weakness on one side", "one-sided weakness", "one sided weakness", "ek taraf kamzori",
    "ek taraf ki kamzori", "एक तरफ कमज़ोरी", "एक तरफ़ कमज़ोरी", "एक ओर कमज़ोरी",
  ]);
  const oneSidedNumbness = hasAny(text, [
    "numbness on one side", "one-sided numbness", "one sided numbness", "ek taraf sunn",
    "एक तरफ सुन्न", "एक तरफ़ सुन्न", "एक ओर सुन्न",
  ]);
  const slurredSpeech = hasAny(text, ["slurred speech", "speech is slurred", "बोली लड़खड़ा", "बोली लड़खड़ा", "boli ladkhada"]);
  const notFeeding = hasAny(text, [
    "not feeding", "not drinking milk", "won't feed", "doesn't feed", "doodh nahi pee", "doodh nahin pee",
    "दूध नहीं पी", "दूध नहीं पी रहा", "दूध नहीं पी रही", "दूध न पीना",
  ]);
  const heavyBleeding = hasAny(text, ["heavy bleeding", "bleeding heavily", "बहुत ज्यादा खून", "बहुत ज़्यादा खून", "खून बहुत बह"]);
  const stiffNeck = hasAny(text, ["stiff neck", "neck is stiff", "gardan akad", "गर्दन अकड़", "गर्दन अकड़"]);
  const suddenSevereHeadache = hasAny(text, ["sudden severe headache", "worst headache", "अचानक बहुत तेज सिरदर्द", "अचानक बहुत तेज़ सिरदर्द"]);
  const seizure = hasAny(text, ["seizure", "fit", " दौरा", "दौरा", "mirgi ka daura"]);
  const selfHarm = hasAny(text, ["self-harm", "self harm", "harm myself", "suicide", "खुद को नुकसान", "आत्महत्या"]);

  if (oneSidedWeakness) complaint.severity_markers.push("one-sided-weakness");
  if (oneSidedNumbness) complaint.severity_markers.push("one-sided-numbness");
  if (slurredSpeech) complaint.severity_markers.push("slurred-speech");
  if (notFeeding) complaint.severity_markers.push("not-feeding");
  if (heavyBleeding) complaint.severity_markers.push("heavy-bleeding");
  if (stiffNeck) complaint.severity_markers.push("stiff-neck");
  if (suddenSevereHeadache) complaint.severity_markers.push("sudden-severe-headache");
  if (seizure) complaint.severity_markers.push("seizure");
  if (selfHarm) complaint.severity_markers.push("self-harm-thoughts");

  if (hasChest) complaint.region = "chest";
  else if (hasHead) complaint.region = "head";
  else if (hasLeg) complaint.region = "leg";
  else if (hasAbdomen) complaint.region = "upper-abdomen";
  else if (oneSidedWeakness || oneSidedNumbness || isChild || heavyBleeding || seizure || selfHarm) complaint.region = "general";

  if (hasChest && (hasAny(text, ["pain", "dard", "दर्द", "discomfort", "भारीपन"]) || breathlessness)) complaint.kind = "pain";
  else if (hasHead && hasAny(text, ["pain", "ache", "dard", "दर्द"])) complaint.kind = "pain";
  else if (hasAbdomen && hasAny(text, [
    "pain", "ache", "dard", "दर्द", "खराब", "ख़राब", "kharab", "kharaab", "upset",
    "indigestion", "loose motion", "dast", " दस्त", "दस्त", "vomit", " उल्टी", "उल्टी",
  ])) complaint.kind = "vomiting";
  else if (hasLeg && hasAny(text, ["sprain", "moch", "मोच", "fracture", "टूट", "चोट", "injury"])) complaint.kind = "injury";
  else if (hasAny(text, ["rash", "skin rash", "daane", "दाने", "चकत्ते", "खुजली"])) { complaint.region ||= "general"; complaint.kind = "rash"; }
  else if (hasAny(text, ["fever", "bukhar", "बुखार", "temperature", "ताप"])) { complaint.region ||= "general"; complaint.kind = "fever"; }
  else if (breathlessness) { complaint.region ||= "general"; complaint.kind = "breathing"; }
  else if (oneSidedWeakness || oneSidedNumbness) { complaint.region ||= "general"; complaint.kind = "low"; }
  else if (slurredSpeech) { complaint.region ||= "general"; complaint.kind = "low"; }
  else if (heavyBleeding) { complaint.region ||= "general"; complaint.kind = "bleeding"; }
  else if (seizure) { complaint.region ||= "general"; complaint.kind = "dizziness"; }
  else if (selfHarm) { complaint.region ||= "general"; complaint.kind = "low"; }

  if (breathlessness && hasChest) complaint.severity_markers.push("breathlessness");
  else if (breathlessness) complaint.severity_markers.push("difficulty-breathing");
  if (sweating && hasChest) complaint.severity_markers.push("sweating");

  if (complaint.kind === "fever" && stiffNeck && !complaint.severity_markers.includes("stiff-neck")) complaint.severity_markers.push("stiff-neck");
  if (complaint.kind === "pain" && hasHead && suddenSevereHeadache && !complaint.severity_markers.includes("sudden-severe-headache")) complaint.severity_markers.push("sudden-severe-headache");

  if (complaint.kind) {
    complaint.duration = hasAny(text, ["just now", "abhi", "अभी"]) ? "now"
      : hasAny(text, ["few days", "a few days", "3 days", "days", "kal", "yesterday", "कल", "पिछले दिन"]) ? "days"
        : hasAny(text, ["weeks", "months", "a while", "काफी समय", "काफ़ी समय"]) ? "longer" : "today";
    complaint.severity = "no";
    complaint.parsed = true;
    complaint.unclear = [];
  }
  return complaint;
}

const readField = (complaint, field) => complaint?.[field];

function matchesCriterion(complaint, criterion) {
  const value = readField(complaint, criterion.field);
  if (Object.prototype.hasOwnProperty.call(criterion, "equals")) return value === criterion.equals;
  if (criterion.in) return criterion.in.includes(value);
  if (criterion.includes) return Array.isArray(value) && value.includes(criterion.includes);
  if (criterion.anyIncludes) return Array.isArray(value) && criterion.anyIncludes.some((entry) => value.includes(entry));
  return false;
}

function matchesRule(complaint, matcher = {}) {
  const all = matcher.all || [];
  const any = matcher.any || [];
  return all.every((criterion) => matchesCriterion(complaint, criterion))
    && (!any.length || any.some((criterion) => matchesCriterion(complaint, criterion)));
}

function resultFor(entry) {
  return {
    department: entry.department,
    urgency: entry.severity,
    rule_id: entry.id,
    reason: entry.reason,
  };
}

/**
 * Pure routing boundary. It accepts structured complaint data and never reads
 * the DOM, calls a model, or performs network I/O.
 */
export function routeComplaint(complaint, rules = ROUTING_RULES) {
  const redFlag = rules.red_flags.find((entry) => matchesRule(complaint, entry.matches));
  if (redFlag) return resultFor(redFlag);

  const ordinaryRule = rules.rules.find((entry) => matchesRule(complaint, entry.matches));
  return resultFor(ordinaryRule || rules.rules[rules.rules.length - 1]);
}

export { matchesRule };
