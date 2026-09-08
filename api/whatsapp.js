// api/whatsapp.js — Meta WhatsApp Cloud API Webhook for Raahat
// Handles verification handshakes (GET) and incoming user messages (POST)
// Strictly routes through deterministic logic (Rule 1 & Rule 2)

import { handleWhatsAppMessage, createInitialSession } from "../whatsapp-bot.js";
import { transcribeAudioBuffer } from "./transcribe.js";
import { createHash } from "node:crypto";

// In-memory session store for serverless runs
const sessions = new Map();

function sessionKeyForSender(sender) {
  return createHash("sha256").update(String(sender || "")).digest("hex");
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body);
  if (!req[Symbol.asyncIterator]) return {};
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function transcribeWhatsAppAudio(mediaId) {
  const token = process.env.WHATSAPP_API_TOKEN;
  if (!mediaId || !token) return "";

  try {
    const metadataResponse = await fetch(`https://graph.facebook.com/v20.0/${encodeURIComponent(mediaId)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!metadataResponse.ok) throw new Error(`WhatsApp media metadata failed with ${metadataResponse.status}`);
    const metadata = await metadataResponse.json();
    if (!metadata?.url) throw new Error("WhatsApp media URL missing");

    const mediaResponse = await fetch(metadata.url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!mediaResponse.ok) throw new Error(`WhatsApp media download failed with ${mediaResponse.status}`);
    const audioBuffer = Buffer.from(await mediaResponse.arrayBuffer());
    const result = await transcribeAudioBuffer(audioBuffer, metadata.mime_type || "audio/ogg");
    return result.success ? result.text : "";
  } catch (error) {
    console.error("WhatsApp voice transcription unavailable:", error?.message || error);
    return "";
  }
}

export default async function handler(req, res) {
  // GET: Meta Webhook Verification Handshake
  if (req.method === "GET") {
    const query = req.query || {};
    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === "subscribe" && VERIFY_TOKEN && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: "Verification token mismatch" });
  }

  // POST: Incoming message from Meta WhatsApp Cloud API
  if (req.method === "POST") {
    try {
      const body = await readJsonBody(req);

      if (!body || body.object !== "whatsapp_business_account") {
        return res.status(404).json({ error: "Not a WhatsApp API event" });
      }

      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value || {};
          const messages = value.messages || [];
          for (const msg of messages) {
            const from = String(msg.from || "").trim();
            if (!from) continue;
            const sessionKey = sessionKeyForSender(from);
            let incoming = { text: "", buttonId: "", location: null };

            if (msg.type === "text") {
              incoming.text = msg.text?.body || "";
            } else if (msg.type === "interactive") {
              if (msg.interactive?.type === "button_reply") {
                incoming.buttonId = msg.interactive.button_reply.id;
                incoming.text = msg.interactive.button_reply.title;
              } else if (msg.interactive?.type === "list_reply") {
                incoming.buttonId = msg.interactive.list_reply.id;
                incoming.text = msg.interactive.list_reply.title;
              }
            } else if (msg.type === "button") {
              incoming.buttonId = msg.button?.payload || "";
              incoming.text = msg.button?.text || "";
            } else if (msg.type === "location") {
              incoming.location = {
                lat: msg.location?.latitude,
                lng: msg.location?.longitude,
                name: msg.location?.name,
                address: msg.location?.address
              };
            } else if (msg.type === "audio" || msg.type === "voice") {
              const transcription = await transcribeWhatsAppAudio(msg.audio?.id || msg.voice?.id);
              incoming.transcription = transcription;
              incoming.sourceTag = transcription ? "Generated" : "Observed";
              incoming.text = transcription || "[Voice Note Received]";
            }

            // Retrieve or initialize session
            if (!sessions.has(sessionKey)) {
              sessions.set(sessionKey, createInitialSession());
            }
            const session = sessions.get(sessionKey);

            // Run shared state machine
            const { replies } = handleWhatsAppMessage(session, incoming);
            sessions.set(sessionKey, session);

            // Send outbound messages back to citizen via Meta Graph API
            await sendMetaWhatsAppMessages(from, replies);
          }
        }
      }

      return res.status(200).json({ status: "success" });
    } catch (err) {
      console.error("WhatsApp webhook error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export async function sendMetaWhatsAppMessages(to, replies) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    // Graceful fallback / simulation mode if env vars are not set
    console.log("[Simulated WhatsApp Outbound] message prepared");
    return;
  }

  const url = "https://graph.facebook.com/v20.0/" + phoneNumberId + "/messages";

  for (const reply of replies) {
    let payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to
    };

    if (reply.type === "text") {
      payload.type = "text";
      payload.text = { preview_url: false, body: reply.text };
    } else if (reply.type === "buttons") {
      payload.interactive = {
        type: "button",
        body: { text: reply.text },
        action: {
          buttons: reply.buttons.map((b) => ({
            type: "reply",
            reply: { id: b.id, title: b.title.slice(0, 20) }
          }))
        }
      };
      payload.type = "interactive";
    }

    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("[Meta WhatsApp Send Error]", err);
    }
  }
}
