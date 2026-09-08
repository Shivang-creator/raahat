// api/ivr.js — Serverless Telephony Webhook for 104 National Healthline
// Handles Voice XML (TwiML / Exotel / Tata Tele) for feature phone callers
// Evaluates rural dialects and dispatches DLT SMS tokens.

import { createInitialIvrSession, handleIvrTurn } from "../ivr-engine.js";

const ivrSessions = new Map();

export default async function handler(req, res) {
  const method = req.method;
  const params = method === "GET" ? req.query : req.body || {};

  const caller = String(params.From || params.caller || "IVR-DEMO-CALLER");
  const callId = params.CallSid || params.call_id || "IVR-LOCAL";
  const dtmf = params.Digits || params.dtmf || "";
  const speech = params.SpeechResult || params.speech || "";
  const format = params.format || (req.headers["accept"]?.includes("json") ? "json" : "xml");

  if (!ivrSessions.has(callId)) {
    ivrSessions.set(callId, createInitialIvrSession(caller));
  }
  const session = ivrSessions.get(callId);

  // Run turn
  const result = handleIvrTurn(session, { dtmf, speech });
  ivrSessions.set(callId, session);

  if (format === "json") {
    return res.status(200).json({
      callId,
      session,
      action: result.action,
      spokenText: result.spokenText,
      bcp47: result.bcp47,
      sms: result.sms,
      transferTo108: session.transferTo108
    });
  }

  // Generate standard Voice XML (TwiML / Telecom standard)
  let twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n`;

  if (result.action === "GATHER_DTMF") {
    twiml += `  <Gather numDigits="1" timeout="6">\n`;
    twiml += `    <Say language="${result.bcp47}">${escapeXml(result.spokenText)}</Say>\n`;
    twiml += `  </Gather>\n`;
    twiml += `  <Redirect>/api/ivr</Redirect>\n`;
  } else if (result.action === "GATHER_SPEECH") {
    twiml += `  <Say language="${result.bcp47}">${escapeXml(result.spokenText)}</Say>\n`;
    twiml += `  <Gather input="speech" timeout="5" speechTimeout="auto">\n`;
    twiml += `  </Gather>\n`;
  } else if (result.action === "TRANSFER_EMERGENCY_108") {
    twiml += `  <Say language="${result.bcp47}">${escapeXml(result.spokenText)}</Say>\n`;
    twiml += `  <Dial>108</Dial>\n`;
  } else if (result.action === "CALL_COMPLETE") {
    twiml += `  <Say language="${result.bcp47}">${escapeXml(result.spokenText)}</Say>\n`;
    if (result.sms) {
      twiml += `  <Sms to="${escapeXml(caller)}">${escapeXml(result.sms)}</Sms>\n`;
    }
    twiml += `  <Hangup/>\n`;
  } else {
    twiml += `  <Say language="${result.bcp47}">${escapeXml(result.spokenText)}</Say>\n`;
    twiml += `  <Gather input="speech dtmf" timeout="5"></Gather>\n`;
  }

  twiml += `</Response>`;

  res.setHeader("Content-Type", "application/xml");
  return res.status(200).send(twiml);
}

function escapeXml(unsafe) {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&\x27\"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "\x27": return "&apos;";
      case "\"": return "&quot;";
    }
  });
}
