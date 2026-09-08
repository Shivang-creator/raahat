// ivr.test.js — Unit Tests for Raahat 104 AI Voice IVR Engine
import test from "node:test";
import assert from "node:assert/strict";
import { createInitialIvrSession, handleIvrTurn, normalizeDialectPhrasing, formatLocalizedIvrSms, resolveDistrictFromInput } from "./ivr-engine.js";

test("IVR: Initial welcome prompt gathers DTMF dialect with Hindi first and English second", () => {
  const session = createInitialIvrSession("DEMO-CALLER");
  assert.equal(session.state, "WELCOME");

  const turn1 = handleIvrTurn(session, {});
  assert.equal(turn1.action, "GATHER_DTMF");
  assert.ok(turn1.spokenText.includes("104"));
  assert.ok(turn1.spokenText.includes("हिन्दी के लिए 1"));
  assert.ok(turn1.spokenText.includes("English, press 2"));
  assert.ok(turn1.spokenText.includes("भोजपुरी खातिर 3"));
  assert.ok(turn1.spokenText.includes("मैथिली लेल 4"));
});

test("IVR: Pressing 2 selects English and prompts for symptoms with Press 1 instruction", () => {
  const session = createInitialIvrSession("DEMO-CALLER");
  const turn2 = handleIvrTurn(session, { dtmf: "2" });
  assert.equal(session.dialectCode, "en");
  assert.equal(session.state, "SYMPTOM_INPUT");
  assert.equal(turn2.action, "GATHER_SPEECH");
  assert.ok(turn2.spokenText.includes("104 Helpline"));
  assert.ok(turn2.spokenText.includes("press 1"));
});

test("IVR: Pressing 3 selects Bhojpuri dialect", () => {
  const session = createInitialIvrSession("DEMO-CALLER");
  const turn3 = handleIvrTurn(session, { dtmf: "3" });
  assert.equal(session.dialectCode, "bho");
  assert.equal(session.state, "SYMPTOM_INPUT");
  assert.equal(turn3.action, "GATHER_SPEECH");
  assert.ok(turn3.spokenText.includes("राहत 104"));
  assert.ok(turn3.spokenText.includes("1 दबाईं"));
});

test("IVR: Dialect Red-Flag in Bhojpuri triggers immediate 108 transfer (AGENTS.md Rule 2)", () => {
  const session = createInitialIvrSession("DEMO-CALLER");
  session.state = "SYMPTOM_INPUT";
  session.dialectCode = "bho";
  session.dialectKey = "3";

  // Bhojpuri red flag phrase: chest pain and breathlessness
  const turn = handleIvrTurn(session, { speech: "हमार छाती में बहुते दरद बा आ सांस फूले लागल बा" });

  assert.equal(session.state, "EMERGENCY_108");
  assert.equal(session.isEmergency, true);
  assert.equal(session.transferTo108, true);
  assert.equal(turn.action, "TRANSFER_EMERGENCY_108");
  assert.ok(turn.spokenText.includes("आपातकालीन") || turn.spokenText.includes("सावधान"));
  assert.ok(turn.spokenText.includes("108"));
  assert.ok(turn.sms.includes("108") && turn.sms.includes("आपातकालीन"));
});

test("IVR: Multi-turn flow with confirmation and localized Maithili SMS", () => {
  const session = createInitialIvrSession("DEMO-CALLER");
  session.state = "SYMPTOM_INPUT";
  session.dialectCode = "mai";
  session.dialectKey = "4";

  // Step 1: Maithili infant fever
  const turn1 = handleIvrTurn(session, { speech: "बबुआ के काल्हि सं खूब तेज बुखार अछि" });
  assert.equal(session.state, "DISTRICT_INPUT");
  assert.equal(session.routeResult.department, "Paediatrics");
  assert.equal(turn1.action, "GATHER_DISTRICT");

  // Step 2: Provide district -> moves to CONFIRM_APPOINTMENT
  const turn2 = handleIvrTurn(session, { district: "Darbhanga" });
  assert.equal(session.state, "CONFIRM_APPOINTMENT");
  assert.equal(turn2.action, "GATHER_CONFIRMATION");
  assert.ok(turn2.spokenText.includes("पुष्टि लेल 1 दबाउ"));

  // Step 3: Press 1 to confirm -> moves to COMPLETED
  const turn3 = handleIvrTurn(session, { dtmf: "1" });
  assert.equal(session.state, "COMPLETED");
  assert.equal(turn3.action, "CALL_COMPLETE");
  assert.ok(session.token.startsWith("#OPD-2026-"));
  assert.ok(session.smsPayload.includes(session.token));
  assert.ok(session.smsPayload.includes("Paediatrics") || session.smsPayload.includes("विभाग"));
  assert.ok(turn3.spokenText.includes("टोकन") && turn3.spokenText.includes("पक्का"));
  // Verified SMS in Maithili
  assert.ok(session.smsPayload.includes("संग आनू: पहचान पत्र"));
});

test("IVR: Rejection at confirmation step (Press 2) resets complaint and gathers new input", () => {
  const session = createInitialIvrSession("DEMO-CALLER");
  session.state = "CONFIRM_APPOINTMENT";
  session.dialectCode = "hi";
  session.dialectKey = "1";
  session.complaint = { kind: "pain", region: "knee" };
  session.routeResult = { department: "Orthopaedics" };

  // Press 2 to reject
  const turn = handleIvrTurn(session, { dtmf: "2" });
  assert.equal(session.state, "SYMPTOM_INPUT");
  assert.equal(session.complaint, null);
  assert.equal(turn.action, "GATHER_SPEECH");
  assert.ok(turn.spokenText.includes("शिकायत रद्द की गई"));
});

test("IVR: Vague symptom asks clarifying question before routing", () => {
  const session = createInitialIvrSession("DEMO-CALLER");
  session.state = "SYMPTOM_INPUT";
  session.dialectCode = "hi";
  session.dialectKey = "1";

  // Vague input: just "दर्द है"
  const turn1 = handleIvrTurn(session, { speech: "दर्द है बहुत" });
  assert.equal(session.state, "CLARIFY_INPUT");
  assert.ok(turn1.spokenText.includes("पेट") && turn1.spokenText.includes("छाती"));

  // Citizen clarifies: "घुटने में"
  const turn2 = handleIvrTurn(session, { speech: "घुटने में" });
  assert.equal(session.state, "DISTRICT_INPUT");
  assert.equal(session.routeResult.department, "Orthopaedics");
});

test("IVR: DTMF 1 signals end of speech turn and processes input immediately", () => {
  const session = createInitialIvrSession("DEMO-CALLER");
  session.state = "SYMPTOM_INPUT";
  session.dialectCode = "hi";
  session.dialectKey = "1";
  session.rawSpeech = "हड्डी टूट गई है पैर में";

  // Caller finishes speaking and taps 1
  const turn = handleIvrTurn(session, { dtmf: "1" });
  assert.equal(session.state, "DISTRICT_INPUT");
  assert.equal(session.routeResult.department, "Orthopaedics");
});

test("IVR: Non-specific symptom safely falls back to General Medicine and never 'Choose a department yourself'", () => {
  const session = createInitialIvrSession("DEMO-CALLER");
  session.state = "SYMPTOM_INPUT";
  session.dialectCode = "hi";
  session.dialectKey = "1";

  // Turn 1: Non-specific general ailment triggers clarification
  const turn1 = handleIvrTurn(session, { speech: "शरीर में अजीब सा लग रहा है कुछ समझ नहीं आ रहा" });
  assert.equal(session.state, "CLARIFY_INPUT");
  assert.ok(turn1.spokenText.includes("दर्द") || turn1.spokenText.includes("पेट"));

  // Turn 2: Clarification still unclassified -> falls back to General Medicine, never "Choose a department yourself"
  const turn2 = handleIvrTurn(session, { speech: "बस कमजोरी लग रही है पूरे शरीर में" });
  assert.equal(session.state, "DISTRICT_INPUT");
  assert.notEqual(session.routeResult?.department, "Choose a department yourself");
  assert.equal(session.routeResult?.department, "General Medicine");
  assert.ok(!turn2.spokenText.includes("Choose a department yourself"));
  assert.ok(turn2.spokenText.includes("General Medicine"));
});

test("IVR: Pan-India district and DTMF zone resolution works across states", () => {
  // Test DTMF zone 1 -> Delhi
  assert.equal(resolveDistrictFromInput("1"), "Delhi");
  // Test DTMF zone 3 -> Bihar
  assert.equal(resolveDistrictFromInput("3"), "Bihar");
  // Test spoken cities
  assert.equal(resolveDistrictFromInput("मुझे पटना में अस्पताल चाहिए"), "Patna");
  assert.equal(resolveDistrictFromInput("मुंबई"), "Mumbai");
  assert.equal(resolveDistrictFromInput("Kolkata"), "Kolkata");
  assert.equal(resolveDistrictFromInput("Lucknow"), "Lucknow");

  // Multi-state routing in IVR session
  const sessionDelhi = createInitialIvrSession("DEMO-CALLER", "Delhi");
  sessionDelhi.state = "DISTRICT_INPUT";
  sessionDelhi.routeResult = { department: "Cardiology" };
  const turnDelhi = handleIvrTurn(sessionDelhi, { district: "Delhi" });
  assert.ok(sessionDelhi.selectedHospital.name.includes("AIIMS") || sessionDelhi.selectedHospital.name.includes("Safdarjung"));

  const sessionPatna = createInitialIvrSession("DEMO-CALLER", "Patna");
  sessionPatna.state = "DISTRICT_INPUT";
  sessionPatna.routeResult = { department: "General Medicine" };
  const turnPatna = handleIvrTurn(sessionPatna, { district: "Patna" });
  assert.ok(sessionPatna.selectedHospital.district === "Patna" || sessionPatna.selectedHospital.state === "Bihar");
});

test("IVR: Dialect normalizer correctly extracts anatomical terms from rural speech", () => {
  const bho = normalizeDialectPhrasing("हमार गोड़ में दरद बा 3 हफ्ते से");
  assert.ok(bho.includes("leg") || bho.includes("knee") || bho.includes("pair"));
  assert.ok(bho.includes("dard hai"));

  const mai = normalizeDialectPhrasing("बबुआ के पेट में दरद अछि");
  assert.ok(mai.includes("bachhe") || mai.includes("child"));

  const ortho = normalizeDialectPhrasing("कमर टूट रहल बा और ठेहुना पिराता");
  assert.ok(ortho.includes("kamar") && ortho.includes("knee"));

  const gastro = normalizeDialectPhrasing("पेट मसोस रहल बा आ उल्टी-दस्त भइल बा");
  assert.ok(gastro.includes("stomach") && gastro.includes("loose motion"));
});

test("IVR: formatLocalizedIvrSms outputs authentic regional language SMS", () => {
  const tokenData = {
    token: "#OPD-2026-9999",
    hospitalName: "District Hospital",
    dept: "Cardiology",
    complaintKind: "pain",
    complaintRegion: "chest"
  };

  const smsBho = formatLocalizedIvrSms("bho", tokenData);
  assert.ok(smsBho.includes("साथ ले आईं"));
  assert.ok(smsBho.includes("108 डायल करीं"));

  const smsBn = formatLocalizedIvrSms("bn", tokenData);
  assert.ok(smsBn.includes("রাহাত ১০৪"));
  assert.ok(smsBn.includes("জরুরি"));

  const smsTa = formatLocalizedIvrSms("ta", tokenData);
  assert.ok(smsTa.includes("ராஹத் 104"));
  assert.ok(smsTa.includes("கொண்டு வரவும்"));

  const smsEn = formatLocalizedIvrSms("en", tokenData);
  assert.ok(smsEn.includes("RAAHAT 104 OPD TOKEN"));
  assert.ok(smsEn.includes("Govt Fee: ₹10"));
});
