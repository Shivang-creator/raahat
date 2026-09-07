# राहत · Raahat
> **Autonomous OPD Queue Triage & Omnichannel Healthcare Gateway for Bharat.**<br>
> Built for the **Build What Moves India** Hackathon (Varun Mayya × OpenAI).

[![Tests](https://img.shields.io/badge/tests-40%20passed-success)](https://github.com/Shivang-creator/raahat)
[![Deployment](https://img.shields.io/badge/deployment-live-brightgreen)](https://raahat-nu.vercel.app)
[![AI Models](https://img.shields.io/badge/OpenAI-GPT--4o--mini%20%7C%20Whisper--1-blue)](https://openai.com)
[![Telephony](https://img.shields.io/badge/104%20Telephony-2G%20Feature%20Phone-orange)](https://raahat-nu.vercel.app)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Meta%20Cloud%20API-25D366?logo=whatsapp&logoColor=white)](https://raahat-nu.vercel.app)

🌐 **Live Prototype**: [https://raahat-nu.vercel.app](https://raahat-nu.vercel.app)<br>
📦 **Tech Stack**: Vanilla ES Modules · Modern CSS (Bento Grid) · Three.js Raycasting · Web Audio API · Node.js Native Test Runner · Vercel Serverless<br>
🔒 **Privacy Architecture**: 100% Client-Side Session Privacy · Zero Server Health Data Storage

---

## 1. The Problem: The 5:30 AM Hospital Queue in India

Every single morning across India, over **1.2 million citizens** travel hours to district and apex government hospitals (like AIIMS, BHU, Safdarjung), only to stand in 4.5-hour queues starting at 5:30 AM. 

Nearly **40% are turned away at the registration window** because they stood in the wrong line—confusing General Medicine with Chest Medicine, or Orthopaedics with Physical Medicine. The official Online Registration System ([ors.gov.in](https://ors.gov.in)) fails rural Bharat because it demands English literacy, smartphone keyboards, and medical vocabulary that ordinary citizens do not possess.

> *"A sick person only knows where it hurts, not the clinical hierarchy of a hospital."*

**Raahat (राहत)** eliminates the morning counter bottleneck through an autonomous, zero-barrier clinical triage engine. Citizens can describe symptoms in their own words in their native dialect, speak via voice notes, or simply tap where it hurts on an interactive 3D anatomical body map.

---

## 2. Omnichannel Civic Access: Meeting Citizens Where They Are

Following mentor guidance to *"never force rural citizens to download a 45MB app or navigate a complex portal"*, Raahat brings public hospital triage to 3 unified citizen channels:

```
                          [ Citizen Entrypoints ]
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
  1. Web Application         2. WhatsApp Gateway         3. 104 Telephony
   (Browser UI / PWA)      (Meta Cloud API Webhook)    (2G Feature Phone IVR)
         │                           │                           │
         │ (index.html)              │ (api/whatsapp.js)         │ (api/ivr.js)
         │                           │ (whatsapp-bot.js)         │ (ivr-engine.js)
         └───────────────────────────┼───────────────────────────┘
                                     │
                                     ▼
                     [ Deterministic Routing Core ]
                      ├── routing.js (9 Red-Flag Rules + R-10)
                      └── hospital-data.js (2,500+ Pan-India Centres)
                                     │
                                     ▼
                     [ Output Pass & Notification ]
                      ├── Thermal OPD Specimen Slip
                      ├── WhatsApp OPD Pass Card + Queue Push
                      └── DLT-Compliant Regional SMS
```

### 💬 1. WhatsApp Civic Gateway (Meta Cloud API)
- Official verified green business account badge (`✓`), authentic doodle wallpaper, and double blue ticks (`✓✓`).
- Accepts typed vernacular text or **WhatsApp Voice Notes 🎤** transcribed via **OpenAI Whisper-1**.
- Interactive WhatsApp Cloud API template buttons for shift selection (Morning / Afternoon).
- Issues an instant scannable **OPD Counter Pass Card with Barcode** directly inside the chat.
- Live simulated push notifications alerting the patient when their token is 2 positions away.
- 1-tap call icon in header switches directly to the 104 Voice Keypad simulator.

### 📞 2. 104 AI Voice Telephony for 2G Keypad Feature Phones
- Dedicated Nokia / JioPhone simulator bringing autonomous triage to the **500 million Indians without smartphones**.
- Dial 104 toll-free and select from **8 regional languages**:
  `1: हिन्दी (Hindi), 2: English, 3: भोजपुरी (Bhojpuri), 4: मैथिली (Maithili), 5: বাংলা (Bengali), 6: தமிழ் (Tamil), 7: తెలుగు (Telugu), 8: मराठी (Marathi)`.
- **Strict Female Indian Operator Voices**: Authentic voice profiles (`Lekha`, `Veena`, `Neerja`, `Kajal`, `Heera`, `Kalpana`) tuned to pitch `1.08` for a warm, reassuring, and maternal cadence.
- **DTMF-1 Turn-Taking**: Prompts clearly state: *"बीप के बाद अपनी तकलीफ़ बोलें, और 1 दबाएँ"* ("Speak after the beep, and press 1 to confirm").
- **DLT-Compliant Regional SMS**: Automatically dispatches a local-script appointment token with exact counter number and reporting slot that fits squarely inside the feature phone LCD screen.

### 🌐 3. Zero-Barrier Web Experience
- **Interactive 3D Anatomical Body Map**: Sculpted Three.js humanoid with frosted-glass shaders, 360° rotation, and discrete mesh raycasting (Head, Eyes, Ears, Chest, Abdomen, Pelvis, Spine, Joints, Limbs). Instant 2D accessible SVG fallback.
- **Bilingual Voice Readback & Speech Input**: Speak in Hindi, English, or regional dialects; readback in clear, comfortable audio tempo.
- **Prescription OCR Digitizer**: Scans written prescriptions in 300ms, auto-populating patient name, age, and chief complaints with zero typing needed.
- **Thermal Specimen Slip Generator**: Bilingual OPD registration slip with barcode, counter room number, travel instructions, and **PGPortal Citizen Grievance Shield**.
- **10-Second Doctor SBAR Handover**: Clinical desk view (`#screen-doctor`) organizing incoming triage cases by urgency, vitals, and counter load balancing.

---

## 3. Frugal AI Architecture: Powered by OpenAI

Raahat demonstrates **disciplined, mature AI engineering** designed for population-scale public health:

| Component | Model / Engine | Role in Raahat | Frugal Economics |
|---|---|---|---|
| **Clinical Entity Intake** | `gpt-4o-mini` | Reads messy vernacular text / transcripts and extracts structured JSON: `{ region, kind, duration, severity, age_band }`. | **$0.15 / 1M tokens** (~$0.00003 per query). $5 covers 30,000+ patients. |
| **Voice Note Transcription** | `whisper-1` | Transcribes noisy, accented Indian audio voice notes and 104 phone speech across regional dialects. | **$0.006 / min** (~$0.001 per voice note). Robust to loud ambient noise. |
| **Clinical Routing & Triage** | Deterministic Code (`routing.js`) | Maps structured complaint to medical department, counter number, and urgency. | **Zero API cost · 100% Deterministic · Zero Hallucinations.** |

---

## 4. The 7 Inviolable Architectural Boundaries (`AGENTS.md`)

Written before the first line of code and strictly enforced:

1. **The Model Never Decides**: The model only extracts structured complaint facts. It is strictly prohibited from diagnosing, deciding hospital departments, or offering medical advice.
2. **Red Flags are Code, and One is Enough**: Emergency markers (`RF-01` to `RF-09`) route immediately to 24/7 Emergency and trigger 108 ambulance alerts. Reassuring words can never clear a red flag. Only code decides.
3. **No False Reassurance**: The app never tells anyone they are "fine." The lowest possible outcome is a routine OPD consultation.
4. **Epistemic Data Provenance Tagging**: Every value on screen carries an explicit tag:
   - `[Observed]`: Entered by the citizen in this session.
   - `[Verified]`: Published public facts (2,500+ hospital catalog, source URLs).
   - `[Rule]`: Computed by deterministic code with Rule ID shown (`R-10`, `RF-01`).
   - `[Simulated]`: Mock wait times and token queues.
   - `[Generated]`: Prose written by the AI model, strictly descriptive, never a decision.
5. **Mandatory Citizen Confirmation (Rule 5)**: Triage readback must be explicitly reviewed, edited, and confirmed by the citizen before any hospital routing or token issuance.
6. **100% Client-Side Privacy (Rule 6)**: No Aadhaar, phone numbers, or health records are ever stored server-side.
7. **3-Way Accessibility (Rule 8)**: Describing symptoms has 3 independent routes: **Speak (Voice)**, **Type (Text)**, and **Tap (Body Map)**. Any single route completes the journey.

---

## 5. Pan-India Hospital Directory

- **2,500+ Verified Government Facilities** across 30+ Indian States and Union Territories.
- **Geospatial Haversine Distance**: Instant distance and transit calculation from user coordinates or shared WhatsApp location pins.
- **Hospital Tiers**: Categorized into Apex National Institutes (AIIMS, PGI, JIPMER), State Medical Colleges, District Hospitals, and Community Health Centres (CHCs).
- **Clinical Specialty Matching**: Directs patients only to hospitals verified to have the required department and diagnostic equipment.

---

## 6. Local Development & Testing

```bash
# 1. Clone the repository
git clone https://github.com/Shivang-creator/raahat.git
cd raahat

# 2. Run automated test suites (40 unit tests)
npm test

# 3. (Optional) Configure environment variables for OpenAI / WhatsApp
cp .env.example .env # Add OPENAI_API_KEY, WHATSAPP_API_TOKEN

# 4. Start local development server
npx serve .
```

### Automated Test Suite Coverage (40/40 Passing)
- `routing.test.js`: 9 emergency red-flag markers, anatomical entity extraction, and clinical rules.
- `hospital-data.test.js`: Haversine distance accuracy, multi-tier hospital lookup, and wait time calculations.
- `ivr.test.js`: 104 telephony state machine, 8-dialect matrix, DTMF-1 finalization, and General Medicine (`R-10`) safety fallbacks.
- `whatsapp.test.js`: WhatsApp conversational lifecycle, interactive buttons, emergency escalation, and pan-India city matching.

---

## 7. Prototype Boundary & Disclaimer

*Independent prototype · Mock data · Not affiliated with National Health Authority, ORS, or any government body.*

Raahat does not connect to ORS or any live government system, book real appointments, or provide medical advice. It is a civic technology exploration demonstrating how public healthcare intake can be made zero-barrier, dignified, and safe for every citizen of Bharat.
