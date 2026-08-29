# राहत · Raahat
> **A Calmer Front Door to Public Hospitals.**<br>
> Built for the **Build What Moves India** Hackathon (Varun Mayya × OpenAI).

🌐 **Live Prototype**: [https://raahat-nu.vercel.app](https://raahat-nu.vercel.app)<br>
📦 **Tech Stack**: Vanilla ES Modules · Modern CSS · Three.js Raycasting · Web Speech API · Node.js Test Runner<br>
🔒 **Privacy Architecture**: 100% Client-Side Session Privacy · Zero Server Health Data Storage

---

## 1. The Core Insight: Why ORS Fails at the Front Door

The Online Registration System ([ors.gov.in](https://ors.gov.in)) digitised the hospital counter in 2015, but it introduced a fundamental barrier: **it forces a sick citizen to guess a specialised medical department** (*Cardiothoracic Surgery vs General Medicine vs Gastroenterology*) before they can see open appointments.

> *"A sick person only knows where it hurts, not the clinical hierarchy of a hospital."*

**Raahat (राहत)** solves the moment before the counter: **Zero-Knowledge Triage**, calculating **Honest Queue Wait Times**, and guiding citizens through voice, text, or a **Holographic 3D Anatomical Body Map**.

## 2. The 7 Inviolable Architectural Boundaries (`AGENTS.md`)

1. **The Model Never Decides Clinical Outcomes**: Free text/voice is parsed into structured complaint facts (`region`, `kind`, `duration`, `severity`). Routing to hospital departments is executed purely by deterministic code in `routing-rules.js`.
2. **Red Flags are Deterministic Code**: Emergency markers (`RF-01` to `RF-09`) halt routine OPD booking immediately and route to 24/7 Emergency. One red flag is enough regardless of other signals.
3. **No False Reassurance**: Raahat never says "you are fine." The lowest outcome is a routine OPD consultation.
4. **Epistemic Tagging**: Every value on screen carries an explicit tag:
   - `[Observed]`: Entered by the citizen in this session.
   - `[Verified]`: Verified public facts (hospital directories, source URLs).
   - `[Rule]`: Computed by deterministic code with Rule IDs shown.
   - `[Simulated]`: Mock availability and token throughput.
5. **Citizen Confirmation Before Routing**: Read-back details are displayed for editing and confirmation before any OPD routing occurs.
6. **100% Client-Side Privacy**: Complaints, names, and mock IDs are held strictly in browser session memory and never persisted to a backend server.
7. **Accessibility First**: Speak, type, or tap the 3D/2D body map. Every route completes the full journey.

## 3. Key Feature Tour

### 🏥 1. Interactive 3D Anatomical Body Explorer

- Sculpted Three.js humanoid with translucent frosted-glass shaders.
- True **mesh raycasting** across discrete anatomical regions (Head, Eyes, Ears, Teeth, Chest, Abdomen, Pelvis, Spine, Joints, Limbs).
- 360° orbital drag, touch selection, glowing amber highlights, and instant 2D accessible SVG fallback.

### ⏱️ 2. Honest Queue Wait Calculator

- Solves phantom slot times by computing real doctor consultation times based on morning rounds and token throughput (*"Slot 09:30 AM → Expected consultation ~12:15 PM"*).

### 🔬 3. Diagnostic Lab & Scan Booking

- Pathology tests (CBC, Lipid, HbA1c, LFT, KFT) and Radiology scans (X-Ray, MRI, CT Scan, Ultrasound, ECG).
- Clinical preparation guide (fasting rules, clothing instructions) and simulated digital report locker.

### 🩸 4. Live Delhi Hospital Blood Bank Stock & Donor Network

- Real-time stock monitor by blood group (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`) across AIIMS, Safdarjung, Dr. RML, and Red Cross.
- Priority Emergency Blood Request generator and voluntary donor registry.

### 📹 5. Specimen OPD Slip & Teleconsultation

- Printable registration slip with official watermark, barcode, token number, and **PGPortal Citizen Rights Notice**.
- Integrated **Tele-OPD Video Call Room** for remote e-Sanjeevani consultations.

## 4. How Raahat Rethinks ORS

| Feature | ors.gov.in (2015 NIC Model) | Raahat (2026 Citizen Gateway) |
|---|---|---|
| **Department Selection** | Requires guessing medical specialties | Zero-Knowledge Triage (start with where it hurts) |
| **Wait Transparency** | Phantom slot time without queue context | Honest Wait Calculator (Slot time + doctor rounds) |
| **Authentication** | Front-door CAPTCHA & OTP barriers | Frictionless triage; 1-tap human check only at slip generation |
| **Emergency Safety** | Routine booking allows critical emergencies | Immediate deterministic Red-Flag escalation to Emergency |
| **Accessibility** | 1.7★ app rating; 1920×1080 desktop requirement | 100% Mobile-first, non-literate 3D body map, bilingual Hindi/English voice |

## 5. Civic Roadmap

1. **ABDM & e-Hospital Integration**: Direct token push into national Hospital Management Information Systems (HMIS).
2. **AI Voice IVR for Feature Phones (104 Integration)**: Dial a toll-free number from any basic keypad phone, speak in 22 regional dialects, and receive an OPD token via SMS.
3. **Real-Time Hospital Queue Vision**: Waiting-hall token camera integration to stream live turnaround estimates.
4. **Pan-India Vernacular Expansion**: Native voice models for all 22 scheduled Indian languages.

## 6. Local Development & Testing

```bash
# Clone the repository
git clone https://github.com/Shivang-creator/raahat.git
cd raahat

# Run automated rule and data test suites
npm test

# Run a local static server
npx serve .
```

## Prototype Boundary

Independent prototype · mock data · not affiliated with any government body.

Raahat does not connect to ORS or any government system, book a real appointment, see real slot availability, or provide medical advice. It covers a limited set of departments at a limited set of hospitals. Never enter real identity, health, or account information.
