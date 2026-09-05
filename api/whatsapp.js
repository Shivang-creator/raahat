// api/whatsapp.js — Meta WhatsApp Cloud API Webhook for Raahat
// Handles verification handshakes (GET) and incoming user messages (POST)
// Strictly routes through deterministic logic (Rule 1 & Rule 2)

import { handleWhatsAppMessage, createInitialSession } from "../whatsapp-bot.js";

// In-memory session store for serverless runs
const sessions = new Map();

export default async function handler(req, res) {
  // GET: Meta Webhook Verification Handshake
  if (req.method === "GET") {
    const query = req.query || {};
    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "raahat_secure_webhook_2026";

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: "Verification token mismatch" });
  }

  // POST: Incoming message from Meta WhatsApp Cloud API
  if (req.method === "POST") {
    try {
      const body = req.body;

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
            const from = msg.from; // Phone number e.g. "919876543210"
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
              incoming.text = "[Voice Note Received]";
            }

            // Retrieve or initialize session
            if (!sessions.has(from)) {
              sessions.set(from, createInitialSession(from));
            }
            const session = sessions.get(from);

            // Run shared state machine
            const { replies } = handleWhatsAppMessage(session, incoming);
            sessions.set(from, session);

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
    console.log("[Simulated WhatsApp Outbound] to=" + to + " replies=" + JSON.stringify(replies, null, 2));
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
