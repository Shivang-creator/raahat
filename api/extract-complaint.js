// api/extract-complaint.js — Optional OpenAI structured complaint extraction
// The model only extracts citizen words into a Complaint shape. Routing remains
// deterministic in routing.js and is never performed in this function.

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = [
  "You are a clinical intake assistant for Indian government hospital triage.",
  "Extract structured data from patient input into JSON with keys: region (anatomical body part: chest, head, eye, knee, abdomen, etc.), kind (symptom type: pain, fever, swelling, cough, etc.), duration (e.g. 2 days, 3 weeks), severity (mild, moderate, severe), age_band (infant, child, adult, elderly).",
  "Do NOT provide diagnoses. Do NOT output a hospital department.",
  "If a field is not stated, use null. Include unclear as an array of short strings for details you could not confidently place in the requested fields. Return JSON only."
].join(" ");

const FIELDS = ["region", "kind", "duration", "severity", "age_band"];

const textValue = (value, maxLength = 120) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
};

function normalizeComplaint(value) {
  const source = value && typeof value === "object" ? value : {};
  const complaint = Object.fromEntries(FIELDS.map((field) => [field, textValue(source[field] ?? source[field === "age_band" ? "ageBand" : field])]));
  complaint.unclear = Array.isArray(source.unclear)
    ? source.unclear.filter((item) => typeof item === "string").map((item) => item.trim().slice(0, 160)).filter(Boolean).slice(0, 8)
    : [];
  return complaint;
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return res.status(400).json({ error: "Expected a JSON request body" });
  }

  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return res.status(400).json({ error: "text is required" });
  if (!process.env.OPENAI_API_KEY) {
    return res.status(200).json({ success: false, fallback: true });
  }

  try {
    const response = await fetch(OPENAI_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 150,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Language: ${String(body.language || "unknown").slice(0, 40)}\nPatient input:\n${text.slice(0, 4000)}` }
        ]
      })
    });

    if (!response.ok) throw new Error(`OpenAI extraction failed with ${response.status}`);
    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("OpenAI returned no structured complaint");

    const extracted = normalizeComplaint(JSON.parse(content));
    return res.status(200).json({ success: true, complaint: extracted });
  } catch (error) {
    console.error("Complaint extraction unavailable:", error?.message || error);
    return res.status(200).json({ success: false, fallback: true });
  }
}

