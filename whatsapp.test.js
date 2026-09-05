// whatsapp.test.js — Unit Tests for Raahat WhatsApp Engine
import test from "node:test";
import assert from "node:assert/strict";
import { createInitialSession, handleWhatsAppMessage } from "./whatsapp-bot.js";

test("WhatsApp: initial greeting and language selection", () => {
  const session = createInitialSession("+919876543210");
  assert.equal(session.stage, "INIT");

  const res = handleWhatsAppMessage(session, { text: "hi" });
  assert.equal(session.stage, "INIT");
  assert.ok(res.replies.length >= 2);
  assert.equal(res.replies[1].type, "buttons");
  assert.equal(res.replies[1].buttons.length, 3);

  // Select Hindi
  const langRes = handleWhatsAppMessage(session, { buttonId: "lang_hi", text: "हिन्दी" });
  assert.equal(session.stage, "COMPLAINT");
  assert.equal(session.language, "hi");
  assert.ok(langRes.replies[0].text.includes("तकलीफ़") || langRes.replies[0].text.includes("समस्या"));
});

test("WhatsApp: Red Flag triggers emergency escalation immediately (AGENTS.md Rule 2)", () => {
  const session = createInitialSession("+919876543210");
  session.stage = "COMPLAINT";
  session.language = "en";

  const res = handleWhatsAppMessage(session, { text: "chest pain with breathlessness" });
  assert.equal(session.stage, "EMERGENCY_RED_FLAG");
  assert.ok(res.replies[0].text.includes("EMERGENCY") || res.replies[0].text.includes("RED-FLAG"));
  assert.ok(res.replies[0].text.includes("108") || res.replies[0].text.includes("102"));
  assert.equal(res.replies[1].buttons[0].id, "cmd_call_108");
});

test("WhatsApp: Normal complaint routes to department and asks citizen confirmation (AGENTS.md Rule 5)", () => {
  const session = createInitialSession("+919876543210");
  session.stage = "COMPLAINT";
  session.language = "en";

  const res = handleWhatsAppMessage(session, { text: "knee pain for 3 weeks after running" });
  assert.equal(session.stage, "CONFIRM");
  assert.ok(session.complaint);
  assert.equal(session.routeResult.department, "Orthopaedics");
  assert.equal(res.replies[0].type, "buttons");
  assert.ok(res.replies[0].text.includes("Complaint Summary") || res.replies[0].text.includes("Symptom Readback"));
  assert.ok(res.replies[0].buttons.some(b => b.id === "confirm_complaint_yes" || b.id === "confirm_yes"));

  // Confirm complaint
  const confirmRes = handleWhatsAppMessage(session, { buttonId: "confirm_complaint_yes" });
  assert.equal(session.stage, "LOCATION");
  assert.ok(confirmRes.replies[0].text.includes("Hospital") || confirmRes.replies[0].text.includes("Location"));
});

test("WhatsApp: Location sharing matches nearest facility and allows shift booking", () => {
  const session = createInitialSession("+919876543210");
  session.stage = "LOCATION";
  session.language = "en";
  session.routeResult = { department: "Cardiology", urgency: "routine", carryList: ["Aadhaar"] };

  // Send Central Delhi location
  const locRes = handleWhatsAppMessage(session, {
    buttonId: "loc_delhi"
  });

  assert.equal(session.stage, "SESSION");
  assert.ok(session.selectedHospital);
  assert.ok(locRes.replies[0].text.includes(session.selectedHospital.name));
  assert.ok(locRes.replies[1].buttons.some(b => b.id === "shift_morning"));

  // Book morning shift
  const bookRes = handleWhatsAppMessage(session, { buttonId: "shift_morning" });
  assert.equal(session.stage, "PASS");
  assert.ok(session.token.startsWith("#OPD-2026-"));
  assert.ok(bookRes.replies[0].text.includes("PASS"));
  assert.ok(bookRes.replies[0].text.includes(session.token));
});

test("WhatsApp: Global keywords STATUS, BLOOD, LAB, HELP respond accurately", () => {
  const session = createInitialSession("+919876543210");

  // STATUS
  const statusRes = handleWhatsAppMessage(session, { text: "STATUS" });
  assert.ok(statusRes.replies[0].text.includes("Queue Status") || statusRes.replies[0].text.includes("कतार"));
  assert.ok(statusRes.replies[0].text.includes("Ahead") || statusRes.replies[0].text.includes("आगे"));

  // BLOOD
  const bloodRes = handleWhatsAppMessage(session, { text: "BLOOD" });
  assert.ok(bloodRes.replies[0].text.includes("Blood") || bloodRes.replies[0].text.includes("रक्त"));

  // LAB
  const labRes = handleWhatsAppMessage(session, { text: "LAB" });
  assert.ok(labRes.replies[0].text.includes("Lab") || labRes.replies[0].text.includes("जांच"));

  // HELP
  const helpRes = handleWhatsAppMessage(session, { text: "HELP" });
  assert.ok(helpRes.replies[0].text.includes("108"));
});
