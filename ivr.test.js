// ivr.test.js — Unit Tests for Raahat 104 AI Voice IVR Engine
import test from "node:test";
import assert from "node:assert/strict";
import { createInitialIvrSession, handleIvrTurn, normalizeDialectPhrasing } from "./ivr-engine.js";

test("IVR: Initial welcome prompt gathers DTMF dialect", () => {
  const session = createInitialIvrSession("+919876543210");
  assert.equal(session.state, "WELCOME");

  const turn1 = handleIvrTurn(session, {});
  assert.equal(turn1.action, "GATHER_DTMF");
  assert.ok(turn1.spokenText.includes("104"));
  assert.ok(turn1.spokenText.includes("भोजपुरी"));
  assert.ok(turn1.spokenText.includes("मैथिली"));
});

test("IVR: Pressing 2 selects Bhojpuri dialect and prompts for symptoms", () => {
  const session = createInitialIvrSession("+919876543210");
  const turn2 = handleIvrTurn(session, { dtmf: "2" });
  assert.equal(session.dialectCode, "bho");
  assert.equal(session.state, "SYMPTOM_INPUT");
  assert.equal(turn2.action, "GATHER_SPEECH");
  assert.ok(turn2.spokenText.includes("राउर स्वागत बा"));
});

test("IVR: Dialect Red-Flag in Bhojpuri triggers immediate 108 transfer (AGENTS.md Rule 2)", () => {
  const session = createInitialIvrSession("+919876543210");
  session.state = "SYMPTOM_INPUT";
  session.dialectCode = "bho";
  session.dialectKey = "2";

  // Bhojpuri red flag phrase: chest pain and breathlessness
  const turn = handleIvrTurn(session, { speech: "हमार छाती में बहुते दरद बा आ सांस फूले लागल बा" });

  assert.equal(session.state, "EMERGENCY_108");
  assert.equal(session.isEmergency, true);
  assert.equal(session.transferTo108, true);
  assert.equal(turn.action, "TRANSFER_EMERGENCY_108");
  assert.ok(turn.spokenText.includes("आपातकालीन") || turn.spokenText.includes("गंभीर"));
  assert.ok(turn.spokenText.includes("108"));
  assert.ok(turn.sms.includes("108") && turn.sms.includes("आपातकालीन"));
});

test("IVR: Routine Maithili complaint routes to Paediatrics and dispatches DLT SMS token", () => {
  const session = createInitialIvrSession("+919876543210");
  session.state = "SYMPTOM_INPUT";
  session.dialectCode = "mai";
  session.dialectKey = "3";

  // Maithili infant fever
  const turn = handleIvrTurn(session, { speech: "बबुआ के काल्हि सं खूब तेज बुखार अछि" });
  assert.equal(session.state, "DISTRICT_INPUT");
  assert.equal(session.routeResult.department, "Paediatrics");
  assert.equal(turn.action, "GATHER_DISTRICT");

  // Provide district
  const districtTurn = handleIvrTurn(session, { district: "Varanasi" });
  assert.equal(session.state, "COMPLETED");
  assert.equal(districtTurn.action, "CALL_COMPLETE");
  assert.ok(session.token.startsWith("#OPD-2026-"));
  assert.ok(session.smsPayload.includes(session.token));
  assert.ok(session.smsPayload.includes("Paediatrics") || session.smsPayload.includes("बाल चिकित्सा"));
  assert.ok(districtTurn.spokenText.includes("ओपीडी टोकन") || districtTurn.spokenText.includes("SMS"));
});

test("IVR: Dialect normalizer correctly extracts anatomical terms from rural speech", () => {
  const bho = normalizeDialectPhrasing("हमार गोड़ में दरद बा 3 हफ्ते से");
  assert.ok(bho.includes("leg") || bho.includes("knee") || bho.includes("pair"));
  assert.ok(bho.includes("dard hai"));

  const mai = normalizeDialectPhrasing("बबुआ के पेट में दरद अछि");
  assert.ok(mai.includes("bachhe") || mai.includes("child"));
});
