// whatsapp-bot.js — Conversational State Machine for Raahat on WhatsApp
// Shared across Meta Cloud API webhook (/api/whatsapp.js) and In-App WhatsApp Canvas

import { parseFreeTextComplaint, routeComplaint, checkRealtimeEmergency } from "./routing.js";
import { normalizeDialectPhrasing } from "./ivr-engine.js";
import { hospitalsForDepartment, autoSelectNearestHospital, PAN_INDIA_HOSPITALS } from "./hospital-data.js";

// Session stages: "INIT" -> "LANGUAGE" -> "COMPLAINT" -> "CONFIRM" -> "LOCATION" -> "SESSION" -> "PASS"

export function createInitialSession(phoneNumber = "user_default") {
  return {
    phone: phoneNumber,
    stage: "INIT",
    language: "hi",
    rawComplaint: "",
    complaint: null,
    routeResult: null,
    selectedHospital: null,
    selectedShift: "morning",
    token: null,
    userLocation: null,
    queueAhead: 2,
    createdAt: new Date().toISOString()
  };
}

export function handleWhatsAppMessage(session, incomingMsg) {
  const text = (incomingMsg.text || "").trim();
  const lower = text.toLowerCase();
  const buttonId = incomingMsg.buttonId || "";
  const location = incomingMsg.location || null; // { lat, lng }

  // Global Keyword Commands
  if (lower === "restart" || lower === "reset" || lower === "hi" || lower === "hello" || buttonId === "cmd_restart") {
    Object.assign(session, createInitialSession(session.phone));
    return {
      session,
      replies: [
        {
          type: "text",
          text: `🏥 *राहत (Raahat) Public OPD Assistant*\n\nसरकारी अस्पताल के सही OPD काउंटर तक सीधे पहुँचने के लिए अपनी भाषा चुनें:\nChoose your preferred language for triage:`
        },
        {
          type: "buttons",
          text: "Select Language / भाषा चुनें:",
          buttons: [
            { id: "lang_hi", title: "🇮🇳 हिन्दी" },
            { id: "lang_en", title: "🇬🇧 English" },
            { id: "lang_bn", title: "🌾 বাংলা" }
          ]
        }
      ]
    };
  }

  if (lower === "status" || buttonId === "cmd_status") {
    const hospName = session.selectedHospital?.name || "AIIMS New Delhi";
    const dept = session.routeResult?.department || "Cardiology";
    const token = session.token || "#OPD-2026-4802";
    return {
      session,
      replies: [
        {
          type: "text",
          text: `🔔 *Live OPD Queue Status · राहत लाइव कतार*\n\n🎫 *टोकन:* ${token}\n🏥 *अस्पताल:* ${hospName}\n🩺 *काउंटर:* ${dept} (Counter 4 · Room 104)\n\n📍 *Status / स्थिति:* Ahead: ${session.queueAhead} patients ahead (आपके आगे ${session.queueAhead} मरीज़ हैं, ~12m est wait).\nकृपया काउंटर 4 के प्रतीक्षा कक्ष के पास रहें।`
        }
      ]
    };
  }

  if (lower === "blood" || buttonId === "cmd_blood") {
    return {
      session,
      replies: [
        {
          type: "text",
          text: `🩸 *e-RaktKosh Blood Network · रक्त बैंक सेवा*\n\n• राष्ट्रीय रक्त हेल्पलाइन: 104 / 1910 (24/7)\n• AIIMS Blood Bank: A+ (24 units), B+ (32 units), O+ (18 units)\n• Safdarjung Hospital: AB+ (12 units), O- (4 units - Urgent)\n\nरक्त की तत्काल आवश्यकता होने पर 011-26594405 पर कॉल करें।`
        }
      ]
    };
  }

  if (lower === "lab" || buttonId === "cmd_lab") {
    return {
      session,
      replies: [
        {
          type: "text",
          text: `🔬 *Govt Lab Diagnostic Catalog · सरकारी जांच दरें*\n\n• 12-Lead ECG: ₹0 (Free)\n• Complete Blood Count (CBC): ₹25\n• Fasting Blood Sugar: ₹10\n• Chest X-Ray PA View: ₹50\n• Lipid Profile: ₹60\n\nAyushman Bharat / PM-JAY कार्ड धारकों के लिए सभी जांचें निःशुल्क हैं।`
        }
      ]
    };
  }

  if (lower === "help" || buttonId === "cmd_help") {
    return {
      session,
      replies: [
        {
          type: "text",
          text: `⚖️ *Citizen Rights & Grievance Shield · नागरिक अधिकार*\n\nयदि मान्य ऑनलाइन ओपीडी पर्ची होने पर भी आपको काउंटर पर लौटाया जाता है:\n1. टोकन नंबर नोट करें\n2. pgportal.gov.in पर शिकायत दर्ज करें या CMO कार्यालय में संपर्क करें।\n\n📞 आपातकालीन नंबर: 108 (एम्बुलेंस) · 104 (स्वास्थ्य सेवा) · 112 (राष्ट्रीय आपातकाल).`
        }
      ]
    };
  }

  // --- Step 0: Language Selection ---
  if (session.stage === "INIT" || session.stage === "LANGUAGE") {
    if (buttonId.startsWith("lang_") || lower.includes("hindi") || lower.includes("english") || lower.includes("bangla")) {
      if (buttonId === "lang_en" || lower.includes("english")) {
        session.language = "en";
      } else if (buttonId === "lang_bn" || lower.includes("bangla")) {
        session.language = "bn";
      } else {
        session.language = "hi";
      }
      session.stage = "COMPLAINT";

      const promptMsg = session.language === "en"
        ? `✅ *Language selected: English*\n\nPlease describe what is troubling you in your own words. You can **type** or send a **WhatsApp Voice Note 🎤**.\n\n_Example: "Chest pain and sweating since yesterday" or "My 5-year-old child has 103°F fever"._`
        : `✅ *भाषा चुनी गई: हिन्दी*\n\nकृपया अपनी तकलीफ़ या समस्या बोलकर (वॉइस नोट 🎤) या लिखकर बताएं।\n\n_उदाहरण: "कल से सीने में दर्द और भारीपन है" या "बच्चे को तेज़ बुखार है"।_`;

      return {
        session,
        replies: [
          {
            type: "text",
            text: promptMsg
          }
        ]
      };
    }
  }

  // --- Step 1: Complaint Evaluation (Rule 1 & Rule 2) ---
  if (session.stage === "COMPLAINT") {
    const rawText = incomingMsg.transcription || text;
    session.rawComplaint = rawText;
    const normalized = normalizeDialectPhrasing(rawText);

    // Parse structured complaint with dialect normalizer
    const parsed = parseFreeTextComplaint(normalized);
    const routed = routeComplaint(parsed);
    const emergencyCheck = checkRealtimeEmergency(normalized);

    // Clinical Safety Fallback: Never output unguided department
    if (!routed.department || routed.department === "Choose a department yourself") {
      routed.department = "General Medicine";
      routed.urgency = routed.urgency || "routine";
      routed.rule_id = "R-10";
      routed.reason = {
        en: "General Medicine is the primary intake counter for clinical evaluation.",
        hi: "सामान्य चिकित्सा विभाग प्रारंभिक जाँच और परामर्श का मुख्य काउंटर है।"
      };
    }

    // RULE 2: Deterministic Red Flag Safety Interception (One red flag is enough)
    const isImmediate = emergencyCheck.isEmergency || routed.urgency === "immediate" || (routed.redFlags && routed.redFlags.length > 0);
    if (isImmediate) {
      session.stage = "EMERGENCY_RED_FLAG";
      const marker = emergencyCheck.marker || (routed.redFlags && routed.redFlags[0]) || "Emergency Indicator";
      const ruleId = emergencyCheck.ruleId || (routed.matchedRuleIds && routed.matchedRuleIds[0]) || "RF-01";
      const isEn = session.language === "en";
      return {
        session,
        replies: [
          {
            type: "text",
            text: isEn
              ? `🚨 *EMERGENCY RED-FLAG ALERT (Rule: ${ruleId})*\n\nDetected critical symptom: *${marker}*\n\n⚠️ *Please proceed to the nearest 24/7 Emergency Department / Trauma Center immediately. Do NOT wait for a routine OPD appointment!*\n\n📞 *Call 108 / 102 Ambulance immediately.*`
              : `🚨 *आपातकालीन चेतावनी (EMERGENCY RED-FLAG ALERT)*\n\nनियम: \`${ruleId}\`\nपहचाना गया लक्षण: *${marker}*\n\n⚠️ *कृपया तुरंत 24/7 आपातकालीन विभाग (Emergency / Trauma Center) जाएँ। नियमित ओपीडी की प्रतीक्षा न करें!*\n\n📞 *108 एम्बुलेंस तुरंत बुलाएँ।*`
          },
          {
            type: "buttons",
            text: isEn ? "Emergency Assistance:" : "आपातकालीन सहायता / Emergency Assistance:",
            buttons: [
              { id: "cmd_call_108", title: "📞 Call 108 Ambulance" },
              { id: "cmd_trauma_location", title: "🏥 Nearest Trauma Ctr" },
              { id: "cmd_restart", title: "🔄 Start Over" }
            ]
          }
        ]
      };
    }
    session.complaint = parsed;
    session.routeResult = routed;
    session.stage = "CONFIRM";

    // RULE 5: Citizen must confirm readback before routing
    const isEn = session.language === "en";
    const readbackText = isEn
      ? `📝 *Complaint Summary & Symptom Readback (Please Confirm):*\n\n• Target Area: *${parsed.region || "General"}*\n• Symptom: *${parsed.kind || "Discomfort"}*\n• Duration: *${parsed.duration || "Recent"}*\n• Severity: *${parsed.severity || "Noticeable"}*\n\nIs this accurate?`
      : `📝 *लक्षण विवरण (कृपया पुष्टि करें):*\n\n• प्रभावित अंग: *${parsed.region || "सामान्य"}*\n• समस्या: *${parsed.kind || "तकलीफ़"}*\n• अवधि: *${parsed.duration || "हालिया"}*\n• गंभीरता: *${parsed.severity || "मध्यम"}*\n\nक्या यह विवरण सही है?`;

    return {
      session,
      replies: [
        {
          type: "buttons",
          text: readbackText,
          buttons: [
            { id: "confirm_complaint_yes", title: isEn ? "✅ Yes, accurate" : "✅ हाँ, सही है" },
            { id: "confirm_no", title: isEn ? "✏️ Edit / Re-enter" : "✏️ दोबारा बताएं" }
          ]
        }
      ]
    };
  }

  // --- Step 2: Readback Confirmation ---
  if (session.stage === "CONFIRM") {
    if (buttonId === "confirm_no" || lower.includes("edit") || lower.includes("no") || lower.includes("nahi")) {
      session.stage = "COMPLAINT";
      return {
        session,
        replies: [
          {
            type: "text",
            text: session.language === "en"
              ? "Understood. Please describe your symptoms again in words or send a voice note 🎤:"
              : "कृपया अपनी तकलीफ़ दोबारा बोलकर या लिखकर बताएं 🎤:"
          }
        ]
      };
    }

    if (buttonId === "confirm_yes" || buttonId === "confirm_complaint_yes" || lower.includes("yes") || lower.includes("haan") || lower.includes("sahi")) {
      session.stage = "LOCATION";
      const isEn = session.language === "en";
      return {
        session,
        replies: [
          {
            type: "text",
            text: isEn
              ? `📍 *Nearest Hospital Match*\n\nPlease share your **WhatsApp Location Pin 📎** or type your **City/District name** (e.g. New Delhi, Lucknow, Varanasi, Bengaluru):`
              : `📍 *निकटतम अस्पताल चयन*\n\nकृपया अपना **लोकेशन पिन 📎 शेयर करें** या अपने **शहर/जिले का नाम** टाइप करें (जैसे Delhi, Lucknow, Varanasi, Bengaluru):`
          },
          {
            type: "buttons",
            text: isEn ? "Choose location option:" : "स्थान विकल्प चुनें:",
            buttons: [
              { id: "loc_delhi", title: "📍 Central Delhi" },
              { id: "loc_lucknow", title: "📍 Lucknow" },
              { id: "loc_bengaluru", title: "📍 Bengaluru" }
            ]
          }
        ]
      };
    }
  }

  // --- Step 3: Location / Hospital Matching ---
  if (session.stage === "LOCATION") {
    let coords = { lat: 28.5672, lng: 77.2100, name: "AIIMS New Delhi" };
    let preferredState = "All India";

    if (location && location.latitude && location.longitude) {
      coords = { lat: location.latitude, lng: location.longitude, name: "Your Pin" };
    } else if (buttonId === "loc_lucknow" || lower.includes("lucknow") || lower.includes("uttar pradesh") || lower.includes("up") || lower.includes("varanasi") || lower.includes("kanpur") || lower.includes("gorakhpur")) {
      coords = { lat: 26.8467, lng: 80.9462, name: "Lucknow / UP" };
      preferredState = "Uttar Pradesh";
    } else if (buttonId === "loc_patna" || lower.includes("patna") || lower.includes("bihar") || lower.includes("darbhanga") || lower.includes("gaya") || lower.includes("muzaffarpur")) {
      coords = { lat: 25.5941, lng: 85.1376, name: "Patna / Bihar" };
      preferredState = "Bihar";
    } else if (buttonId === "loc_mumbai" || lower.includes("mumbai") || lower.includes("pune") || lower.includes("maharashtra") || lower.includes("nagpur")) {
      coords = { lat: 19.0760, lng: 72.8777, name: "Mumbai" };
      preferredState = "Maharashtra";
    } else if (buttonId === "loc_bengaluru" || lower.includes("bengaluru") || lower.includes("bangalore") || lower.includes("karnataka") || lower.includes("mysore")) {
      coords = { lat: 12.9716, lng: 77.5946, name: "Bengaluru" };
      preferredState = "Karnataka";
    } else if (buttonId === "loc_kolkata" || lower.includes("kolkata") || lower.includes("calcutta") || lower.includes("bengal") || lower.includes("howrah")) {
      coords = { lat: 22.5726, lng: 88.3639, name: "Kolkata" };
      preferredState = "West Bengal";
    } else if (buttonId === "loc_chennai" || lower.includes("chennai") || lower.includes("madras") || lower.includes("tamil nadu") || lower.includes("coimbatore")) {
      coords = { lat: 13.0827, lng: 80.2707, name: "Chennai" };
      preferredState = "Tamil Nadu";
    } else if (buttonId === "loc_delhi" || lower.includes("delhi") || lower.includes("noida") || lower.includes("gurgaon") || lower.includes("faridabad")) {
      coords = { lat: 28.5672, lng: 77.2100, name: "New Delhi" };
      preferredState = "Delhi";
    } else if (text) {
      const match = PAN_INDIA_HOSPITALS.find((h) => 
        (h.city && h.city.toLowerCase().includes(lower)) || 
        (h.district && h.district.toLowerCase().includes(lower)) ||
        (h.state && h.state.toLowerCase().includes(lower))
      );
      if (match && match.lat && match.lng) {
        coords = { lat: match.lat, lng: match.lng, name: match.city || match.district || match.state };
        preferredState = match.state || "All India";
      }
    }

    session.userLocation = coords;
    const dept = session.routeResult?.department || "General Medicine";
    let matchedHosp = autoSelectNearestHospital(dept, coords, preferredState);
    if (!matchedHosp) {
      matchedHosp = autoSelectNearestHospital(dept, coords, "All India")
        || PAN_INDIA_HOSPITALS.find((h) => h.departments && h.departments.includes(dept))
        || PAN_INDIA_HOSPITALS[0];
    }
    session.selectedHospital = matchedHosp;
    session.stage = "SESSION";

    const isEn = session.language === "en";
    const distStr = matchedHosp.availability?.distanceKm ? `${matchedHosp.availability.distanceKm.toFixed(1)} km` : "2.4 km";
    const waitStr = matchedHosp.availability?.waitMinutes ? `~${Math.round(matchedHosp.availability.waitMinutes / 5) * 5}m` : "~25m";

    return {
      session,
      replies: [
        {
          type: "text",
          text: isEn
            ? `🏥 *Nearest Equipped Hospital:*\n\n*${matchedHosp.name}*\n• Department: *${dept} (Counter 4)*\n• Distance: *${distStr} away*\n• Queue Wait: *${waitStr}*\n• Level: *${matchedHosp.tier || "Govt Hospital"}*\n• Transit: _${matchedHosp.transit || "Main OPD Gate"}_`
            : `🏥 *निकटतम उपयुक्त अस्पताल:*\n\n*${matchedHosp.name}*\n• विभाग: *${dept} (Counter 4)*\n• दूरी: *${distStr} दूर*\n• कतार इंतज़ार: *${waitStr}*\n• स्तर: *${matchedHosp.tier || "सरकारी अस्पताल"}*\n• मेट्रो/मार्ग: _${matchedHosp.transit || "मुख्य ओपीडी गेट"}_`
        },
        {
          type: "buttons",
          text: isEn ? "Pick your OPD visit session:" : "ओपीडी विज़िट का सत्र चुनें:",
          buttons: [
            { id: "shift_morning", title: "🌅 Morning (09-11 AM)" },
            { id: "shift_midday", title: "☀️ Mid-Day (11:30-1:30)" },
            { id: "shift_afternoon", title: "🌇 Afternoon (2:30-4:30)" }
          ]
        }
      ]
    };
  }

  // --- Step 4: Session Selection & Specimen Pass Delivery ---
  if (session.stage === "SESSION") {
    if (buttonId.startsWith("shift_")) {
      session.selectedShift = buttonId.replace("shift_", "");
    } else {
      session.selectedShift = "morning";
    }

    session.token = `#OPD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    session.stage = "PASS";

    const hosp = session.selectedHospital || { name: "AIIMS New Delhi", shortName: "AIIMS" };
    const dept = session.routeResult?.department || "Cardiology";
    const isEn = session.language === "en";

    const passMessage = isEn
      ? `🎫 *RAAHAT DIGITAL OPD SPECIMEN ENTRY PASS*\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🎫 *Token:* \`${session.token}\`\n` +
        `🏥 *Hospital:* *${hosp.name}*\n` +
        `🩺 *Counter:* *${dept} OPD · Counter 4 (Room 104)*\n` +
        `🕒 *Arrival Slot:* 09:30 AM (Est. consultation ~12:15 PM)\n` +
        `💳 *Fee:* ₹10 (Govt Counter Fee)\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `📋 *What to Carry to the Counter:*\n` +
        `1. Photo ID Card (Aadhaar / Voter ID)\n` +
        `2. Phone that receives SMS OTP\n` +
        `3. Any previous hospital prescriptions\n\n` +
        `🩺 *Doctor Handover Card (Show in Room 104):*\n` +
        `_"Doctor, I am experiencing ${session.complaint?.kind || "symptoms"} in my ${session.complaint?.region || "target area"} (distress level 3/5). Please examine."_\n\n` +
        `_Independent Prototype · Mock Data · Not affiliated with government._`
      : `🎫 *राहत डिजिटल ओपीडी स्पेसिमेन पर्ची*\n\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `🎫 *टोकन नंबर:* \`${session.token}\`\n` +
        `🏥 *अस्पताल:* *${hosp.name}*\n` +
        `🩺 *काउंटर:* *${dept} ओपीडी · काउंटर 4 (कमरा 104)*\n` +
        `🕒 *पहुँचने का समय:* 09:30 AM (परामर्श ~12:15 PM)\n` +
        `💳 *पंजीकरण शुल्क:* ₹10 (काउंटर पर देय)\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `📋 *काउंटर पर साथ ले जाएँ:*\n` +
        `1. फोटो पहचान पत्र (आधार कार्ड / वोटर आईडी)\n` +
        `2. वह फ़ोन जिस पर SMS OTP आएगा\n` +
        `3. पुरानी दवाइयों की पर्चियां\n\n` +
        `🩺 *डॉक्टर संवाद वाक्य (कमरा 104 में दिखाएँ):*\n` +
        `_"डॉक्टर साहब, मुझे ${session.complaint?.region || "अंग"} में ${session.complaint?.kind || "तकलीफ़"} महसूस हो रही है। कृपया जाँच करें।"_\n\n` +
        `_स्वतंत्र प्रोटोटाइप · नकली डेटा · सरकारी निकाय से संबद्ध नहीं।_`;

    return {
      session,
      replies: [
        {
          type: "text",
          text: passMessage
        },
        {
          type: "buttons",
          text: isEn ? "Pass Actions:" : "पर्ची विकल्प:",
          buttons: [
            { id: "cmd_status", title: "🔔 Check Queue Status" },
            { id: "cmd_help", title: "⚖️ Citizen Rights" },
            { id: "cmd_restart", title: "🔄 Book Another" }
          ]
        }
      ]
    };
  }

  // Default Fallback
  return {
    session,
    replies: [
      {
        type: "text",
        text: session.language === "en"
          ? "Please choose an option above or type `RESTART` to begin again."
          : "कृपया ऊपर दिए गए विकल्प चुनें या दोबारा शुरू करने के लिए `RESTART` लिखें।"
      }
    ]
  };
}
