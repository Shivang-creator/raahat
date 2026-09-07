# Project Raahat — Engineering Handoff & Architecture Context

> **Project Mission**: Raahat helps a citizen get to the right OPD counter at an Indian government hospital. It is an independent civic access prototype designed for rural and low-literacy citizens across Bharat. It is **not** a doctor, never makes diagnoses, and never tells anyone they are "fine".

---

## 1. Architectural Guardrails (Non-Negotiable Boundaries)

Before touching any code or integrating new models, familiarize yourself with the core design rules defined in `AGENTS.md`:

1. **The Model Never Decides**:
   - Model duty: Read free text / voice note transcription and convert it into a structured `Complaint`:
     ```typescript
     type Complaint = {
       region: string;           // Anatomical area (e.g., "chest", "knee", "eye")
       kind: string;             // Symptom description (e.g., "pain", "swelling", "fever")
       duration: string;         // e.g., "3 days", "chronic"
       severity: string;         // e.g., "severe", "mild"
       ageBand?: string;         // "infant" | "child" | "adult" | "elderly"
       unclear?: string[];
     }
     ```
   - Code duty: Map `Complaint` -> `Department + Urgency + Counter Number + What to Carry`.
   - The model **never** decides the clinical department, triage priority, or hospital destination.
   - If the model is offline or disabled, the entire app still functions through the interactive anatomical body map and deterministic keyword parsers.

2. **Red Flags are Deterministic Code, and One is Enough**:
   - Emergency markers (`RF-01` through `RF-09`) route immediately to 24/7 Emergency / Trauma (`urgency: "immediate"`) with an alert to call 108/102.
   - A calm sentence containing an emergency marker (e.g., *"mild weakness on one side of face"*) triggers immediate emergency routing. Reassuring phrases can never cancel a red flag. Only code evaluates flags.

3. **No Reassurance Outcomes**:
   - The lowest possible outcome is *"Book a routine OPD slot"*. The app never tells a citizen that "no action is needed". Every screen maintains a visible path to human assistance.

4. **Value Tagging Requirement**:
   Every data point on screen must be labelled with one of five civic tags:
   - `Observed`: Entered by the citizen in this session.
   - `Verified`: Published public fact (carries source URL and verification date).
   - `Rule`: Computed by deterministic code (shows the rule ID, e.g., `R-10`, `RF-01`).
   - `Simulated`: Mock operational data (queue lengths, token wait times).
   - `Generated`: Prose written by an AI service, strictly descriptive, never a decision.

5. **Mandatory Citizen Confirmation (Rule 5)**:
   - Triage readback must be displayed, edited, and explicitly confirmed by the citizen before any hospital matching or token generation occurs.

6. **Accessibility Guarantee (Rule 8)**:
   - Describing symptoms has 3 independent routes: **Speak (Voice)**, **Type (Text)**, and **Tap (Anatomical Body Map)**. Any single route can complete the journey.

---

## 2. System Architecture & Omnichannel Entrypoints

Raahat provides 3 unified citizen access channels sharing a single deterministic routing core:

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
                      ├── routing.js (Red flags & rules)
                      └── hospital-data.js (2,500+ pan-India centres)
                                     │
                                     ▼
                     [ Output Pass & Notification ]
                      ├── Thermal OPD Specimen Slip
                      ├── WhatsApp OPD Pass Card + Queue Push
                      └── DLT-Compliant Regional SMS
```

### Core Source Files

- `index.html`: Complete single-page application with responsive CSS, dark mode, Leaflet hospital map, prescription OCR digitizer, 104 phone chassis simulator, and WhatsApp mobile simulator modal.
- `ivr-engine.js`: 104 telephony state machine with 8-dialect support, DTMF tone handling, rural colloquial speech normalizer (`normalizeDialectPhrasing`), and localized SMS formatting.
- `whatsapp-bot.js`: Meta WhatsApp Cloud API conversational state machine supporting interactive template buttons, GPS geolocation pin matching, dialect normalization, and OPD pass card generation.
- `routing.js`: Deterministic triage engine containing red-flag regexes (`RF-01` to `RF-09`), anatomical region mapping, and clinical routing rules.
- `hospital-data.js`: Directory of 2,500+ verified health facilities across all 30+ Indian states/UTs, Haversine geospatial distance calculation, and department availability filtering.
- `api/whatsapp.js`: Serverless webhook handler for Meta WhatsApp Business Cloud API.
- `api/ivr.js`: Serverless webhook handler returning standard VoiceXML / TwiML for telecom operators (Exotel / Tata Tele / Twilio).
- `ivr.test.js`, `whatsapp.test.js`, `routing.test.js`, `hospital-data.test.js`: Automated test suites covering all routing and conversational flows (40 tests total).

---

## 3. Detailed Summary of Recent Changes & Engineering Decisions

### A. Telephony Engine (104 AI Voice Helpline)
1. **Female Voice Customization**:
   - **Requirement**: Restrict all speech synthesis exclusively to authentic Indian female voices.
   - **Implementation**: Created `selectBestIndianVoice()` in `index.html` with an explicit exclusion list (`MALE_VOICE_EXCLUSIONS`) blocking names such as `Rishi`, `Ravi`, `Hemant`, `David`, `Mark`, `George`, `Pradeep`, `Ajay`, etc.
   - **Priority Voices**: Selects `Lekha`, `Veena`, `Neerja`, `Kajal`, `Heera`, `Kalpana`, `Google हिन्दी`, `Google English (India)`, `Zira`, etc.
   - **Acoustic Tuning**: Elevated synthesis pitch to `1.08` across browser readback and IVR audio for a warm, reassuring, and respectful female tone.
2. **Language Ordering & Keypad Ergonomics**:
   - Reordered languages to place **Hindi as Key 1** and **English as Key 2**, followed by regional languages:
     `1: हिन्दी (Hindi), 2: English, 3: भोजपुरी (Bhojpuri), 4: मैथिली (Maithili), 5: বাংলা (Bengali), 6: தமிழ் (Tamil), 7: తెలుగు (Telugu), 8: मराठी (Marathi)`.
   - Documented the human-factors rationale: 8 languages fit cleanly on a 12-key DTMF telephone pad and cover ~88% of national OPD footfall, while Key 0 connects unlisted dialects to human operators.
3. **Turn-Taking & DTMF-1 Finalization**:
   - Callers previously did not know when to stop speaking. Added explicit prompts: *"बीप के बाद अपनी तकलीफ़ बोलें, और 1 दबाएँ"* ("Speak after the beep, and press 1").
   - Pressing Key `1` or `#` immediately terminates speech recording and initiates clinical triage without waiting for silence timeouts.
4. **Safety Fallback (`R-10` General Medicine)**:
   - Removed the confusing and unguided output *"Choose a department yourself"*.
   - Any non-specific, vague, or multi-system symptom safely resolves to **General Medicine (`R-10`)**, which serves as the universal intake counter at all Indian district and apex hospitals.
5. **Prompt Brevity**:
   - Shortened all spoken voice prompts across all 8 dialects by 45–50% to prevent caller fatigue on 2G connections.
6. **Pan-India District Resolution**:
   - Replaced static Varanasi defaults with `resolveDistrictFromInput()`, allowing callers to speak their city/district or select DTMF regional zones.

### B. Feature Phone IVR Layout & SMS Toast Fix
1. **The Bug**:
   - In the 2G phone simulator, the SMS toast overlay containing the OPD pass was overflowing vertically outside the LCD screen and covering the keypad keys.
2. **The Fix**:
   - Expanded `.ivr-screen` min-height to `165px` (`max-height: 185px`) with `overflow: hidden`.
   - Constrained `.ivr-sms-toast` using `position: absolute; inset: 0; max-height: 100%; box-sizing: border-box; overflow: hidden;`.
   - Added internal scrolling on `#ivr-sms-text` (`max-height: 110px; overflow-y: auto; word-break: break-word; white-space: pre-line;`).
   - The DLT-compliant SMS pass now renders cleanly inside the simulated screen with a working dismiss button.

### C. WhatsApp Civic Gateway Overhaul
1. **Authentic WhatsApp UI**:
   - **Header**: Official WhatsApp green (`#008069`), verified green badge (`✓`), business avatar, and `online · Govt OPD Gateway` status.
   - **Background**: Authentic WhatsApp cream `#efeae2` (light) / `#0c1317` (dark) with a subtle radial doodle pattern.
   - **Speech Bubbles**: Notch tails on incoming white bubbles (`#ffffff`) and outgoing green bubbles (`#d9fdd3`), discrete AGENTS.md rule tags, and double blue ticks (`✓✓` in `#53bdeb`).
   - **Interactive Template Buttons**: Styled matching WhatsApp Cloud API message templates with divider borders and full-width `#00a884` tap targets.
2. **Web Audio Sound Effects**:
   - Implemented zero-dependency audio synthesis via `window.AudioContext`:
     - `playWaSendSound()`: 80ms ascending frequency sine wave ("pop") on message send.
     - `playWaReceiveSound()`: Two-tone 620Hz -> 880Hz chime on bot reply.
3. **Omnichannel Telephony Linkage**:
   - Added an audio call icon in the WhatsApp header that instantly switches the user to the 104 AI Voice Phone simulator.
4. **Triage Accuracy & Geographic Expansion**:
   - Integrated `normalizeDialectPhrasing()` to parse colloquial terms in Bhojpuri, Maithili, etc.
   - Expanded location parsing across all Indian states and coordinates, auto-selecting the nearest equipped hospital from `PAN_INDIA_HOSPITALS`.

---

## 4. Test Suite & Verification Results

The automated test suite runs via Node.js native test runner (`node --test`).

Run tests:
```bash
npm test
```

Current test status: **40 passing tests, 0 failures**:
- `routing.test.js`: Validates all 9 red-flag markers, demographic extraction, and department mappings.
- `hospital-data.test.js`: Validates Haversine distance calculations and 2,500+ facility catalog lookups.
- `ivr.test.js`: Validates DTMF navigation, dialect normalization, prompt brevity, and General Medicine fallbacks.
- `whatsapp.test.js`: Validates WhatsApp session lifecycle, quick-reply buttons, emergency escalation, and pan-India city matching.

---

## 5. Next Engineering Steps for Codex

Here are recommended tasks and integration opportunities for Codex:

### 1. Model Provider Integration (OpenAI API / Whisper-1)
- **Goal**: Augment the voice note and free-text processing using an affordable, fast model (such as `gpt-4o-mini`) via API key.
- **Strict Boundary**: The model must **only** perform structured entity extraction into the `Complaint` schema. It must **not** decide the department.
- **Example Prompt Template for Model**:
  ```json
  {
    "role": "system",
    "content": "You are a clinical transcription assistant for Indian public hospital triage. Extract the following JSON from the patient's complaint: { region: string, kind: string, duration: string, severity: string, age_band: string }. Do NOT provide medical advice. Do NOT suggest a medical department or diagnosis."
  }
  ```
- **Voice Transcription**:
  - Connect audio blobs recorded in WhatsApp voice notes or the 104 mic to the OpenAI Whisper API (`v1/audio/transcriptions`) with `language: "hi"` or `"en"` and regional dialect hints.

### 2. Live Environment Variables Configuration
For production deployments, the following environment variables can be configured:
- `OPENAI_API_KEY`: For Whisper-1 speech-to-text and lightweight complaint parsing.
- `WHATSAPP_API_TOKEN`: Meta WhatsApp Cloud API system user access token.
- `WHATSAPP_PHONE_NUMBER_ID`: Sender WhatsApp Business Account phone ID.
- `WHATSAPP_VERIFY_TOKEN`: Webhook handshake verification secret (default: `raahat_secure_webhook_2026`).

### 3. Edge Cases & Continuous Improvement
- Expand `normalizeDialectPhrasing` in `ivr-engine.js` for additional regional variations (e.g., Punjabi, Odia, Assamese).
- Maintain 100% compliance with AGENTS.md rules at all times.

---

## 6. Live Deployments Reference

- **Production URL**: [https://raahat-nu.vercel.app](https://raahat-nu.vercel.app)
- **Deployment Platform**: Vercel Serverless (Node.js 24 ESM, static HTML/CSS/JS frontend + `/api` functions)
