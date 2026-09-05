// ivr-engine.js — AI Voice IVR State Machine for Feature Phones (104 Integration)
// Designed for Rural India (Bharat) · AGENTS.md Rule 1 & Rule 2 compliant
// Connects 2G keypad phone calls to deterministic OPD routing and DLT SMS tokens.

import { parseFreeTextComplaint, routeComplaint, checkRealtimeEmergency } from "./routing.js";
import { autoSelectNearestHospital, PAN_INDIA_HOSPITALS } from "./hospital-data.js";

export const SUPPORTED_DIALECTS = {
  "1": { code: "hi", name: "हिन्दी (Hindi)", bcp47: "hi-IN", prompt: "नमस्ते! राष्ट्रीय स्वास्थ्य सेवा 104 में आपका स्वागत है। बीप के बाद अपनी तकलीफ़ बोलें।" },
  "2": { code: "bho", name: "भोजपुरी (Bhojpuri)", bcp47: "hi-IN", prompt: "प्रणाम! राहत 104 सेवा में राउर स्वागत बा। बीप के बाद बताईं का परेशानी बा?" },
  "3": { code: "mai", name: "मैथिली (Maithili)", bcp47: "hi-IN", prompt: "प्रणाम! 104 स्वास्थ्य सेवा में अपनेक स्वागत अछि। बीप के बाद अपन कष्ट कहू।" },
  "4": { code: "bn", name: "বাংলা (Bengali)", bcp47: "bn-IN", prompt: "নমস্কার! 104 স্বাস্থ্য হেল্পলাইনে স্বাগতম। বিপের পর আপনার শারীরিক সমস্যা বলুন।" },
  "5": { code: "ta", name: "தமிழ் (Tamil)", bcp47: "ta-IN", prompt: "வணக்கம்! 104 சுகாதார உதவி மையத்திற்கு வரவேற்கிறோம். பீப் ஒலிக்குப் பிறகு உங்கள் பிரச்சனையை கூறுங்கள்." },
  "6": { code: "te", name: "తెలుగు (Telugu)", bcp47: "te-IN", prompt: "నమస్కారం! 104 ఆరోగ్య హెల్ప్‌లైన్‌కు స్వాగతం. బీప్ తర్వాత మీ సమస్యను చెప్పండి." },
  "7": { code: "mr", name: "मराठी (Marathi)", bcp47: "mr-IN", prompt: "नमस्कार! 104 आरोग्य सेवेत आपले स्वागत आहे. बीप नंतर आपली समस्या सांगा." },
  "8": { code: "en", name: "English", bcp47: "en-IN", prompt: "Welcome to National Health Helpline 104. Please describe your symptoms after the beep." }
};

// Dialect colloquialisms normalizer for rural phrasing
export function normalizeDialectPhrasing(rawText) {
  let txt = String(rawText || "").toLowerCase();

  // Bhojpuri / Maithili normalizations
  txt = txt.replace(/दरद बा|दरद अछि|पिराता/g, "dard hai");
  txt = txt.replace(/सांस फूले लागल बा|सांस फूले लागल/g, "saans phool rahi hai breathlessness");
  txt = txt.replace(/लइका के|बबुआ के|बच्चवा के/g, "bachhe ko 5 saal child");
  txt = txt.replace(/गोड़ में/g, "pair mein leg knee");
  txt = txt.replace(/माथा में|कपार में/g, "sar mein head");
  txt = txt.replace(/कमज़ोरी लागल बा|सुन्न हो गइल बा/g, "ek taraf kamzori weakness on one side");
  txt = txt.replace(/खून गिरता|रुक नइखे/g, "khoon beh raha hai bleeding won't stop");

  return txt;
}

export function createInitialIvrSession(callerNumber = "+919876543210") {
  return {
    callId: "104-" + Math.floor(100000 + Math.random() * 900000),
    caller: callerNumber,
    state: "WELCOME", // WELCOME -> DIALECT_SELECTED -> SYMPTOM_CAPTURED -> DISTRICT_CAPTURED -> COMPLETED / EMERGENCY_108
    dialectKey: "1",
    dialectCode: "hi",
    rawSpeech: "",
    normalizedSpeech: "",
    complaint: null,
    routeResult: null,
    district: "Varanasi",
    selectedHospital: null,
    token: null,
    smsDispatched: false,
    smsPayload: null,
    isEmergency: false,
    transferTo108: false,
    callDurationSec: 0,
    startedAt: new Date().toISOString()
  };
}

export function handleIvrTurn(session, input = {}) {
  const dtmf = String(input.dtmf || "").trim();
  const speech = String(input.speech || "").trim();
  const districtInput = String(input.district || "").trim();

  // State 1: WELCOME & DIALECT SELECTION
  if (session.state === "WELCOME") {
    if (dtmf && SUPPORTED_DIALECTS[dtmf]) {
      session.dialectKey = dtmf;
      session.dialectCode = SUPPORTED_DIALECTS[dtmf].code;
      session.state = "SYMPTOM_INPUT";
      const config = SUPPORTED_DIALECTS[dtmf];
      return {
        session,
        action: "GATHER_SPEECH",
        spokenText: config.prompt,
        bcp47: config.bcp47,
        sms: null
      };
    }

    // Default dialect selection prompt
    return {
      session,
      action: "GATHER_DTMF",
      spokenText: "नमस्ते! राष्ट्रीय स्वास्थ्य हेल्पलाइन 104 में आपका स्वागत है। हिन्दी के लिए 1 दबाएँ। भोजपुरी खातिर 2 दबाईं। मैथिली लेल 3 दबाउ। বাংলা জন্য 4 টিপুন। தமிழுக்கு 5 அழுத்தவும்। తెలుగు కోసం 6 నొక్కండి। मराठीसाठी 7 दाबा। For English, press 8.",
      bcp47: "hi-IN",
      sms: null
    };
  }

  // State 2: SYMPTOM PROCESSING (RULE 1 & RULE 2)
  if (session.state === "SYMPTOM_INPUT" || session.state === "WELCOME_DIRECT_SPEECH") {
    const rawSpoken = speech || session.rawSpeech || "";
    session.rawSpeech = rawSpoken;
    const normalized = normalizeDialectPhrasing(rawSpoken);
    session.normalizedSpeech = normalized;

    // RULE 2: Deterministic Red Flag Safety Interception
    const emergencyCheck = checkRealtimeEmergency(normalized);
    const parsed = parseFreeTextComplaint(normalized);
    const routed = routeComplaint(parsed);

    const isEmergency = emergencyCheck.isEmergency || routed.urgency === "immediate" || (routed.redFlags && routed.redFlags.length > 0);

    if (isEmergency) {
      session.state = "EMERGENCY_108";
      session.isEmergency = true;
      session.transferTo108 = true;
      session.complaint = parsed;
      session.routeResult = routed;

      const ruleId = emergencyCheck.ruleId || routed.matchedRuleIds?.[0] || "RF-01";
      const emergencySms = `[आपातकालीन चेतावनी · 108]\nनियम: ${ruleId}\nआपके द्वारा बताए गए लक्षण अति-गंभीर हैं। नियमित OPD की प्रतीक्षा न करें। तुरंत नजदीकी 24/7 ट्रॉमा सेंटर जाएँ या 108 एम्बुलेंस को कॉल करें।`;

      session.smsDispatched = true;
      session.smsPayload = emergencySms;

      const dialectCfg = SUPPORTED_DIALECTS[session.dialectKey] || SUPPORTED_DIALECTS["1"];
      const spokenMsg = session.dialectCode === "bho"
        ? "सावधान! ई बहुत गंभीर आपातकालीन लक्षण बा। कवनो ओपीडी के इंतज़ार मत करीं, तुरंत 24 घंटा खुले वाला इमरजेंसी अस्पताल जाईं। हम राउर कॉल सीधे 108 एम्बुलेंस से जोड़ रहल बानी..."
        : session.dialectCode === "mai"
        ? "सावधान! ई अति गंभीर आपातकालीन लक्षण अछि। तुरंत नजदीकी इमरजेंसी वार्ड जाउ। अहाँक फोन 108 एम्बुलेंस सं जोड़ल जा रहल अछि..."
        : session.dialectCode === "bn"
        ? "সতর্কতা! এটি একটি অত্যন্ত জরুরি শারীরিক অবস্থা। অবিলম্বে জরুরি ট্রমা সেন্টারে যান। আপনার কলটি 108 অ্যাম্বুলেন্সে সংযুক্ত করা হচ্ছে..."
        : session.dialectCode === "ta"
        ? "எச்சரிக்கை! இது அவசர சிகிச்சை தேவைப்படும் நிலை. உடனடியாக அவசர பிரிவிற்கு செல்லவும். உங்கள் அழைப்பு 108 ஆம்புலன்ஸுடன் இணைக்கப்படுகிறது..."
        : session.dialectCode === "en"
        ? "Emergency Alert! Detected critical red-flag symptoms. Do not wait for routine OPD. Please proceed immediately to 24/7 Emergency. Patching your call to 108 Ambulance now."
        : "चेतावनी! यह अति गंभीर आपातकालीन लक्षण है। नियमित ओपीडी की प्रतीक्षा न करें, तुरंत 24 घंटे खुले रहने वाले इमरजेंसी वार्ड जाएँ। आपकी कॉल सीधे 108 एम्बुलेंस से जोड़ी जा रही है...";

      return {
        session,
        action: "TRANSFER_EMERGENCY_108",
        spokenText: spokenMsg,
        bcp47: dialectCfg.bcp47,
        audioSiren: true,
        sms: emergencySms
      };
    }

    // Standard OPD Complaint
    session.complaint = parsed;
    session.routeResult = routed;
    session.state = "DISTRICT_INPUT";

    const promptDistrict = session.dialectCode === "bho"
      ? `राउर बात समझ आ गइल बा। विभाग ${routed.department} मिली। अब आपन जिला के नाम बताईं, जइसे वाराणसी, पटना, या गोरखपुर।`
      : session.dialectCode === "mai"
      ? `अहाँक कष्ट समझ में आबि गेल अछि। ${routed.department} विभाग मे जांच हेतै। अपन जिलाक नाम कहू, जेना दरभंगा, पटना, वा मधुबनी।`
      : session.dialectCode === "bn"
      ? `আপনার সমস্যা রেকর্ড করা হয়েছে। বিভাগ: ${routed.department}। এবার আপনার জেলার নাম বলুন, যেমন কলকাতা, হাওড়া, বা বর্ধমান।`
      : session.dialectCode === "ta"
      ? `உங்கள் பிரச்சனை பதிவு செய்யப்பட்டது. துறை: ${routed.department}. உங்கள் மாவட்டத்தின் பெயரை கூறவும், உதாரணமாக சென்னை அல்லது மதுரை.`
      : session.dialectCode === "en"
      ? `Complaint understood. Recommended department is ${routed.department}. Please speak your district name, for example Varanasi, Lucknow, or Delhi.`
      : `आपकी परेशानी दर्ज कर ली गई है। इसके लिए सही विभाग ${routed.department} है। कृपया अपने जिले का नाम बोलें, जैसे वाराणसी, लखनऊ, या पटना।`;

    return {
      session,
      action: "GATHER_DISTRICT",
      spokenText: promptDistrict,
      bcp47: (SUPPORTED_DIALECTS[session.dialectKey] || SUPPORTED_DIALECTS["1"]).bcp47,
      sms: null
    };
  }

  // State 3: DISTRICT / HOSPITAL MATCHING & SMS DISPATCH
  if (session.state === "DISTRICT_INPUT") {
    const rawDist = districtInput || speech || session.district || "Varanasi";
    session.district = rawDist;

    // Resolve nearest hospital from directory prioritizing CHC/DH
    const dept = session.routeResult?.department || "General Medicine";
    let matchedHosp = PAN_INDIA_HOSPITALS.find((h) => 
      h.district && h.district.toLowerCase().includes(rawDist.toLowerCase())
    );

    if (!matchedHosp) {
      // Fallback to closest equipped facility
      matchedHosp = autoSelectNearestHospital(dept, { lat: 25.3176, lng: 82.9739 }, "Uttar Pradesh");
    }

    session.selectedHospital = matchedHosp;
    session.token = "#OPD-2026-" + Math.floor(1000 + Math.random() * 9000);
    session.state = "COMPLETED";

    // Format DLT SMS payload
    const sms = `[राहत 104 ओपीडी टोकन]\n` +
      `टोकन: ${session.token}\n` +
      `अस्पताल: ${matchedHosp.name}\n` +
      `काउंटर: ${dept} OPD (काउंटर 4)\n` +
      `समय: आज 09:30 AM · शुल्क: ₹10\n` +
      `साथ लाएँ: कोई पहचान पत्र + यह SMS\n` +
      `डॉक्टर को कहें: "${session.complaint?.kind || "तकलीफ़"} ${session.complaint?.region || "अंग"} में है"\n` +
      `आपातकाल में 108 डायल करें।`;

    session.smsDispatched = true;
    session.smsPayload = sms;

    const spokenConfirmation = session.dialectCode === "bho"
      ? `राउर ओपीडी पर्ची बन गइल बा। टोकन नंबर ${session.token} बा। अस्पताल: ${matchedHosp.name}, काउंटर 4। ई जानकारी राउर मोबाइल पर SMS से भेज दिहल गइल बा। धन्यवाद।`
      : session.dialectCode === "mai"
      ? `अहाँक ओपीडी टोकन ${session.token} तैयार अछि। अस्पताल: ${matchedHosp.name}, काउंटर 4। सब जानकारी SMS द्वारा पठा देल गेल अछि। धन्यवाद।`
      : session.dialectCode === "bn"
      ? `আপনার ওপিডি টোকেন ${session.token} বুকিং সম্পন্ন হয়েছে। হাসপাতাল: ${matchedHosp.name}। বিস্তারিত SMS মারফত পাঠানো হয়েছে। ধন্যবাদ।`
      : session.dialectCode === "ta"
      ? `உங்கள் ஓபிடி டோக்கன் ${session.token} தயாராக உள்ளது. மருத்துவமனை: ${matchedHosp.name}. தகவல் SMS மூலம் அனுப்பப்பட்டது. நன்றி.`
      : session.dialectCode === "en"
      ? `Your OPD specimen token ${session.token} is confirmed for ${matchedHosp.name} at Counter 4. Details have been sent via SMS to your phone. Thank you for calling 104.`
      : `आपकी ओपीडी पर्ची तैयार हो गई है। टोकन नंबर है ${session.token}। अस्पताल: ${matchedHosp.name}, काउंटर 4। सारी जानकारी आपके फोन पर SMS द्वारा भेज दी गई है। 104 पर कॉल करने के लिए धन्यवाद।`;

    return {
      session,
      action: "CALL_COMPLETE",
      spokenText: spokenConfirmation,
      bcp47: (SUPPORTED_DIALECTS[session.dialectKey] || SUPPORTED_DIALECTS["1"]).bcp47,
      sms: sms
    };
  }

  // Fallback
  return {
    session,
    action: "GATHER_DTMF",
    spokenText: "राष्ट्रीय स्वास्थ्य हेल्पलाइन 104। कृपया विकल्प चुनें या अपनी परेशानी बताएं।",
    bcp47: "hi-IN",
    sms: null
  };
}
