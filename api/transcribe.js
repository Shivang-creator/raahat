// api/transcribe.js — Optional Whisper-1 audio transcription endpoint
// Transcription is descriptive only. It never routes a complaint or selects a department.

const OPENAI_TRANSCRIPTION_URL = "https://api.openai.com/v1/audio/transcriptions";
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const TRANSCRIPTION_PROMPT = "Hindi, English, Bhojpuri, Maithili, chest pain, fever, OPD, AIIMS";

export const config = { api: { bodyParser: false } };

function extensionForMime(mimeType = "audio/webm") {
  const mime = mimeType.toLowerCase();
  if (mime.includes("wav")) return "wav";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if (mime.includes("mp4") || mime.includes("m4a")) return "m4a";
  if (mime.includes("ogg") || mime.includes("opus")) return "ogg";
  return "webm";
}

function decodeBase64Audio(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^data:([^;,]+)?;base64,(.*)$/s);
  const encoded = (match ? match[2] : value).replace(/\s/g, "");
  if (!encoded || encoded.length % 4 === 1 || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) return null;
  const buffer = Buffer.from(encoded, "base64");
  return buffer.length ? buffer : null;
}

function parseContentDisposition(value) {
  const name = value.match(/name="([^"]+)"/i)?.[1] || "";
  const filename = value.match(/filename="([^"]*)"/i)?.[1] || "";
  return { name, filename };
}

function parseMultipart(buffer, contentType) {
  const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)?.[1]
    || contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)?.[2];
  if (!boundary) return {};

  const delimiter = Buffer.from(`--${boundary}`);
  const result = {};
  let cursor = 0;
  while (cursor < buffer.length) {
    const start = buffer.indexOf(delimiter, cursor);
    if (start < 0) break;
    const partStart = start + delimiter.length;
    if (buffer.slice(partStart, partStart + 2).toString() === "--") break;
    const headerStart = partStart + 2;
    const headerEnd = buffer.indexOf(Buffer.from("\r\n\r\n"), headerStart);
    if (headerEnd < 0) break;
    const nextBoundary = buffer.indexOf(delimiter, headerEnd + 4);
    if (nextBoundary < 0) break;
    const headers = buffer.slice(headerStart, headerEnd).toString("utf8");
    const disposition = parseContentDisposition(headers.match(/content-disposition:\s*([^\r\n]+)/i)?.[1] || "");
    const valueEnd = Math.max(headerEnd + 4, nextBoundary - 2);
    const part = buffer.slice(headerEnd + 4, valueEnd);
    const mimeType = headers.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim();
    if (disposition.name === "audio" || disposition.name === "file") {
      result.audioBuffer = part;
      result.mimeType = mimeType || (disposition.filename ? `audio/${extensionForMime(disposition.filename)}` : "audio/webm");
    } else if (disposition.name) {
      result[disposition.name] = part.toString("utf8");
    }
    cursor = nextBoundary;
  }
  return result;
}

async function readIncomingAudio(req) {
  const contentType = String(req.headers?.["content-type"] || "").toLowerCase();
  let body = req.body;
  if (body === undefined && req[Symbol.asyncIterator]) {
    const chunks = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    body = Buffer.concat(chunks);
  }

  if (contentType.includes("multipart/form-data")) {
    const raw = Buffer.isBuffer(body) ? body : Buffer.from(body || "");
    const multipart = parseMultipart(raw, contentType);
    if (multipart.audioBuffer) return multipart;
  }

  if (Buffer.isBuffer(body)) {
    return { audioBuffer: body, mimeType: contentType || "audio/webm" };
  }

  let payload = body;
  if (typeof payload === "string") {
    try { payload = JSON.parse(payload); } catch { payload = {}; }
  }
  if (payload && typeof payload === "object") {
    const audioBuffer = decodeBase64Audio(payload.audio);
    return { audioBuffer, mimeType: payload.mimeType || "audio/webm", language: payload.language };
  }
  return {};
}

export async function transcribeAudioBuffer(audioBuffer, mimeType = "audio/webm", language = "") {
  if (!process.env.OPENAI_API_KEY || !Buffer.isBuffer(audioBuffer) || !audioBuffer.length || audioBuffer.length > MAX_AUDIO_BYTES) {
    return { success: false, fallback: true };
  }

  try {
    const form = new FormData();
    form.append("file", new Blob([audioBuffer], { type: mimeType }), `raahat-note.${extensionForMime(mimeType)}`);
    form.append("model", "whisper-1");
    form.append("prompt", TRANSCRIPTION_PROMPT);
    const languageCode = String(language || "").split("-")[0].toLowerCase();
    if (/^[a-z]{2,3}$/.test(languageCode)) form.append("language", languageCode);

    const response = await fetch(OPENAI_TRANSCRIPTION_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form
    });
    if (!response.ok) throw new Error(`OpenAI transcription failed with ${response.status}`);
    const payload = await response.json();
    const text = typeof payload?.text === "string" ? payload.text.trim() : "";
    if (!text) throw new Error("OpenAI returned an empty transcription");
    return { success: true, text };
  } catch (error) {
    console.error("Audio transcription unavailable:", error?.message || error);
    return { success: false, fallback: true };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const input = await readIncomingAudio(req);
    if (!input.audioBuffer?.length) return res.status(400).json({ error: "audio is required" });
    const result = await transcribeAudioBuffer(input.audioBuffer, input.mimeType, input.language);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Transcription request error:", error?.message || error);
    return res.status(200).json({ success: false, fallback: true });
  }
}
