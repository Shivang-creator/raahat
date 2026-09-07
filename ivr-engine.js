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
  txt = txt.replace(/दरद बा|दरद अछि|पिराता|पीरा बा/g, "dard hai");
  txt = txt.replace(/सांस फूले लागल बा|सांस फूले लागल|दम फूल रहल बा/g, "saans phool rahi hai breathlessness");
  txt = txt.replace(/लइका के|बबुआ के|बच्चवा के|छौड़ा के/g, "bachhe ko 5 saal child");
  txt = txt.replace(/गोड़ में|पैरवा में/g, "pair mein leg knee");
  txt = txt.replace(/माथा में|कपार में|मुरिया में/g, "sar mein head");
  txt = txt.replace(/कमज़ोरी लागल बा|सुन्न हो गइल बा/g, "ek taraf kamzori weakness on one side");
  txt = txt.replace(/खून गिरता|रुक नइखे|रुक नहि रहल अछि/g, "khoon beh raha hai bleeding won't stop");
  txt = txt.replace(/पेशाब में जलन|मूत में जरन/g, "peshab mein jalan burning urine");
  txt = txt.replace(/छाती में कस मसोस/g, "chest pain sweating");

  return txt;
}

export function formatLocalizedIvrSms(langCode, { token, hospitalName, dept, complaintKind, complaintRegion }) {
  switch (langCode) {
    case "bho":
      return `[राहत 104 ओपीडी टोकन]\n` +
        `टोकन: ${token}\n` +
        `अस्पताल: ${hospitalName}\n` +
        `विभाग: ${dept} OPD (काउंटर 4)\n` +
        `समय: आज 09:30 AM · सरकारी फीस: ₹10\n` +
        `साथ ले आईं: पहचान पत्र + ई SMS\n` +
        `डॉक्टर से कहीं: "${complaintKind || "परेशानी"} ${complaintRegion || "अंग"} में बा"\n` +
        `इमरजेंसी खातिर 108 डायल करीं।`;
    case "mai":
      return `[राहत 104 ओपीडी टोकन]\n` +
        `टोकन: ${token}\n` +
        `अस्पताल: ${hospitalName}\n` +
        `विभाग: ${dept} OPD (काउंटर 4)\n` +
        `समय: आई 09:30 AM · शुल्क: ₹10\n` +
        `संग आनू: पहचान पत्र + ई SMS\n` +
        `डॉक्टर के कहू: "${complaintKind || "कष्ट"} ${complaintRegion || "अंग"} मे अछि"\n` +
        `आपातकाल मे 108 डायल करू।`;
    case "bn":
      return `[রাহাত ১০৪ ওপিডি টোকেন]\n` +
        `টোকেন: ${token}\n` +
        `হাসপাতাল: ${hospitalName}\n` +
        `কাউন্টার: ${dept} ওপিডি (কাউন্টার ৪)\n` +
        `সময়: আজ ০৯:৩০ পূর্বাহ্ণ · ফি: ₹১০\n` +
        `সাথে আনুন: পরিচয়পত্র + এই SMS\n` +
        `ডাক্তারকে বলুন: "${complaintRegion || "শরীরের অঙ্গ"}-এ ${complaintKind || "সমস্যা"}"\n` +
        `জরুরি সেবায় ১০৮ ডায়াল করুন।`;
    case "ta":
      return `[ராஹத் 104 ஓபிடி டோக்கன்]\n` +
        `டோக்கன்: ${token}\n` +
        `மருத்துவமனை: ${hospitalName}\n` +
        `பிரிவு: ${dept} OPD (கவுண்டர் 4)\n` +
        `நேரம்: இன்று 09:30 AM · கட்டணம்: ₹10\n` +
        `கொண்டு வரவும்: அடையாள அட்டை + இந்த SMS\n` +
        `மருத்துவரிடம் கூறவும்: "${complaintRegion || "உறுப்பு"} ${complaintKind || "பிரச்சனை"}"\n` +
        `அவசரத்திற்கு 108 அழைக்கவும்.`;
    case "te":
      return `[రాహత్ 104 ఓపీడీ టోకెన్]\n` +
        `టోకెన్: ${token}\n` +
        `ఆసుపత్రి: ${hospitalName}\n` +
        `విభాగం: ${dept} OPD (కౌంటర్ 4)\n` +
        `సమయం: ఈరోజు 09:30 AM · రుసుము: ₹10\n` +
        `తీసుకురండి: ఏదైనా గుర్తింపు కార్డు + ఈ SMS\n` +
        `వైద్యుడితో చెప్పండి: "${complaintRegion || "భాగం"} లో ${complaintKind || "సమస్య"}"\n` +
        `అత్యవసర సమయంలో 108 కాల్ చేయండి.`;
    case "mr":
      return `[राहत 104 ओपीडी टोकन]\n` +
        `टोकन: ${token}\n` +
        `रुग्णालय: ${hospitalName}\n` +
        `विभाग: ${dept} OPD (काउंटर 4)\n` +
        `वेळ: आज 09:30 AM · शुल्क: ₹10\n` +
        `सोबत आणा: ओळखपत्र + हा SMS\n` +
        `डॉक्टरांना सांगा: "${complaintRegion || "अवयव"} ${complaintKind || "त्रास"}"\n` +
        `आणीबाणीत 108 डायल करा.`;
    case "en":
      return `[RAAHAT 104 OPD TOKEN]\n` +
        `Token: ${token}\n` +
        `Hospital: ${hospitalName}\n` +
        `Counter: ${dept} OPD (Counter 4)\n` +
        `Time: Today 09:30 AM · Govt Fee: ₹10\n` +
        `Bring: Govt ID proof + this SMS\n` +
        `Tell Doctor: "${complaintKind || "Problem"} in ${complaintRegion || "body area"}"\n` +
        `In emergency dial 108.`;
    case "hi":
    default:
      return `[राहत 104 ओपीडी टोकन]\n` +
        `टोकन: ${token}\n` +
        `अस्पताल: ${hospitalName}\n` +
        `काउंटर: ${dept} OPD (काउंटर 4)\n` +
        `समय: आज 09:30 AM · शुल्क: ₹10\n` +
        `साथ लाएँ: कोई पहचान पत्र + यह SMS\n` +
        `डॉक्टर को कहें: "${complaintKind || "तकलीफ़"} ${complaintRegion || "अंग"} में है"\n` +
        `आपातकाल में 108 डायल करें।`;
  }
}

export function createInitialIvrSession(callerNumber = "+919876543210") {
  return {
    callId: "104-" + Math.floor(100000 + Math.random() * 900000),
    caller: callerNumber,
    state: "WELCOME", // WELCOME -> SYMPTOM_INPUT -> (optional CLARIFY_INPUT) -> DISTRICT_INPUT -> CONFIRM_APPOINTMENT -> COMPLETED / EMERGENCY_108
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
    retryCount: 0,
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
      const emergencySms = session.dialectCode === "en"
        ? `[EMERGENCY ALERT · 108]\nRule: ${ruleId}\nCritical symptoms detected. Do NOT wait for OPD. Reach nearest 24/7 Emergency immediately or call 108 Ambulance.`
        : session.dialectCode === "bho"
        ? `[आपातकालीन चेतावनी · 108]\nनियम: ${ruleId}\nलक्षण बहुते गंभीर बाड़न। ओपीडी के इंतज़ार मत करीं। तुरंत 24 घंटा इमरजेंसी अस्पताल जाईं या 108 पर फ़ोन करीं।`
        : session.dialectCode === "mai"
        ? `[आपातकालीन चेतावनी · 108]\nनियम: ${ruleId}\nलक्षण अति गंभीर अछि। ओपीडी के प्रतीक्षा नहि करू। तुरंत 24 घंटा इमरजेंसी अस्पताल जाउ वा 108 पर फोन करू।`
        : `[आपातकालीन चेतावनी · 108]\nनियम: ${ruleId}\nआपके द्वारा बताए गए लक्षण अति-गंभीर हैं। नियमित OPD की प्रतीक्षा न करें। तुरंत नजदीकी 24/7 ट्रॉमा सेंटर जाएँ या 108 एम्बुलेंस को कॉल करें।`;

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
        : session.dialectCode === "te"
        ? "హెచ్చరిక! ఇది అత్యవసర పరిస్థితి. దయచేసి వెంటనే 24/7 ఎమర్జెన్సీ విభాగానికి వెళ్ళండి. మీ కాల్ 108 అంబులెన్స్‌కు కనెక్ట్ చేయబడుతోంది..."
        : session.dialectCode === "mr"
        ? "सावधान! हे अत्यंत गंभीर आणीबाणीचे लक्षण आहे. ओपीडीची वाट पाहू नका, त्वरित 24 तास सुरू असलेल्या इमर्जन्सी वॉर्डमध्ये जा. तुमचा कॉल 108 रुग्णवाहिकेला जोडला जात आहे..."
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

    // Check if clarification is needed (e.g. caller said just "दर्द है" / "pain" or region is completely vague)
    const isVague = (!parsed.region && !parsed.kind) || 
      (parsed.kind === "pain" && !parsed.region) ||
      (normalized.length < 7 && !parsed.region);

    if (isVague && session.retryCount === 0) {
      session.state = "CLARIFY_INPUT";
      session.retryCount++;
      const clarifyPrompt = session.dialectCode === "bho"
        ? "ई दरद पेट में बा, छाती में बा, कि जोड़ में? बताईं कवन अंग में परेशानी बा?"
        : session.dialectCode === "mai"
        ? "ई दर्द पेट मे अछि, छाती मे, वा गाठि मे? अंगक नाम कहू।"
        : session.dialectCode === "bn"
        ? "এই ব্যথা পেটে, বুকে নাকি গাঁটে? দয়া করে শরীরের অঙ্গের নাম বলুন।"
        : session.dialectCode === "ta"
        ? "இந்த வலி வயிற்றில் உள்ளதா, நெஞ்சில் உள்ளதா அல்லது மூட்டுகளில் உள்ளதா? உறுப்பின் பெயரை கூறவும்."
        : session.dialectCode === "te"
        ? "ఈ నొప్పి కడుపులో ఉందా, ఛాతీలో ఉందా లేక కీళ్లలో ఉందా? శరీర భాగాన్ని చెప్పండి."
        : session.dialectCode === "mr"
        ? "हे दुखणे पोटात आहे, छातीत आहे की सांध्यामध्ये? अवयवाचे नाव सांगा."
        : session.dialectCode === "en"
        ? "Is this pain in your stomach, chest, or joints? Please specify which body area hurts."
        : "क्या यह दर्द पेट में है, छाती में, या जोड़ों में? कृपया अंग का नाम बताएं।";

      return {
        session,
        action: "GATHER_SPEECH",
        spokenText: clarifyPrompt,
        bcp47: (SUPPORTED_DIALECTS[session.dialectKey] || SUPPORTED_DIALECTS["1"]).bcp47,
        sms: null
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
      : session.dialectCode === "te"
      ? `మీ సమస్య నమోదైంది. విభాగం: ${routed.department}. మీ జిల్లా పేరు చెప్పండి, ఉదాహరణకు వారణాసి లేదా హైదరాబాద్.`
      : session.dialectCode === "mr"
      ? `आपली तक्रार नोंदवली आहे. योग्य विभाग: ${routed.department}. कृपया आपल्या जिल्ह्याचे नाव सांगा, जसे पुणे किंवा मुंबई.`
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

  // State 2b: CLARIFY_INPUT
  if (session.state === "CLARIFY_INPUT") {
    const rawClarify = speech || "";
    const combinedSpeech = (session.rawSpeech + " " + rawClarify).trim();
    session.rawSpeech = combinedSpeech;
    const normalized = normalizeDialectPhrasing(combinedSpeech);
    session.normalizedSpeech = normalized;

    const parsed = parseFreeTextComplaint(normalized);
    const routed = routeComplaint(parsed);
    session.complaint = parsed;
    session.routeResult = routed;
    session.state = "DISTRICT_INPUT";

    const promptDistrict = session.dialectCode === "bho"
      ? `धन्यवाद। विभाग ${routed.department} मिली। अब आपन जिला के नाम बताईं।`
      : session.dialectCode === "en"
      ? `Thank you. Recommended department is ${routed.department}. Please speak your district name.`
      : `धन्यवाद। इसके लिए सही विभाग ${routed.department} है। कृपया अपने जिले का नाम बोलें।`;

    return {
      session,
      action: "GATHER_DISTRICT",
      spokenText: promptDistrict,
      bcp47: (SUPPORTED_DIALECTS[session.dialectKey] || SUPPORTED_DIALECTS["1"]).bcp47,
      sms: null
    };
  }

  // State 3: DISTRICT GATHERING & TRANSITION TO CONFIRMATION
  if (session.state === "DISTRICT_INPUT") {
    const rawDist = districtInput || speech || session.district || "Varanasi";
    session.district = rawDist;

    const dept = session.routeResult?.department || "General Medicine";
    let matchedHosp = PAN_INDIA_HOSPITALS.find((h) => 
      h.district && h.district.toLowerCase().includes(rawDist.toLowerCase())
    );

    if (!matchedHosp) {
      matchedHosp = autoSelectNearestHospital(dept, { lat: 25.3176, lng: 82.9739 }, "Uttar Pradesh");
    }

    session.selectedHospital = matchedHosp;
    session.state = "CONFIRM_APPOINTMENT";

    const confirmPrompt = session.dialectCode === "bho"
      ? `राउर ओपीडी पर्ची ${dept} विभाग, ${matchedHosp.name} खातिर तैयार बा। पक्का करे खातिर 1 दबाईं, शिकायत बदले खातिर 2 दबाईं।`
      : session.dialectCode === "mai"
      ? `अहाँक पर्ची ${dept} विभाग, ${matchedHosp.name} लेल तैयार अछि। पुष्टि लेल 1 दबाउ, वा बदलब लेल 2 दबाउ।`
      : session.dialectCode === "bn"
      ? `আপনার ওপিডি স্লিপ ${dept} বিভাগ, ${matchedHosp.name}-এ প্রস্তুত। নিশ্চিত করতে 1 টিপুন, বদলাতে 2 টিপুন।`
      : session.dialectCode === "ta"
      ? `உங்கள் ஓபிடி டோக்கன் ${dept} பிரிவு, ${matchedHosp.name} க்கு தயாராக உள்ளது. உறுதிப்படுத்த 1 அழுத்தவும், மாற்ற 2 அழுத்தவும்.`
      : session.dialectCode === "te"
      ? `మీ ఓపీడీ స్లిప్ ${dept} విభాగం, ${matchedHosp.name} కోసం సిద్ధంగా ఉంది. నిర్ధారించడానికి 1 నొక్కండి, మార్చడానికి 2 నొక్కండి.`
      : session.dialectCode === "mr"
      ? `आपली ओपीडी पावती ${dept} विभाग, ${matchedHosp.name} साठी तयार आहे. खात्री करण्यासाठी 1 दाबा, बदलण्यासाठी 2 दाबा.`
      : session.dialectCode === "en"
      ? `Your OPD slip is prepared for ${dept}, ${matchedHosp.name}. Press 1 to confirm, or press 2 to change your complaint.`
      : `आपकी ओपीडी पर्ची ${dept} विभाग, ${matchedHosp.name} के लिए तैयार है। पुष्टि के लिए 1 दबाएँ, या शिकायत बदलने के लिए 2 दबाएँ।`;

    return {
      session,
      action: "GATHER_CONFIRMATION",
      spokenText: confirmPrompt,
      bcp47: (SUPPORTED_DIALECTS[session.dialectKey] || SUPPORTED_DIALECTS["1"]).bcp47,
      sms: null
    };
  }

  // State 4: CONFIRM OR REJECT
  if (session.state === "CONFIRM_APPOINTMENT") {
    const isReject = dtmf === "2" || /बदलना|गलत|ना|नहीं|change|reject|no|wrong/i.test(speech);

    if (isReject) {
      // Citizen rejected -> Reset complaint and return to SYMPTOM_INPUT
      session.state = "SYMPTOM_INPUT";
      session.rawSpeech = "";
      session.normalizedSpeech = "";
      session.complaint = null;
      session.routeResult = null;
      session.retryCount = 0;

      const rejectPrompt = session.dialectCode === "bho"
        ? "शिकायत रद्द कइल गइल। कृपया बीप के बाद आपन परेशानी फेर से बताईं।"
        : session.dialectCode === "mai"
        ? "शिकायत रद्द भेल। कृपया बीप के बाद अपन कष्ट पुनः कहू।"
        : session.dialectCode === "bn"
        ? "পূর্ববর্তী বিবরণ বাতিল করা হয়েছে। বিপের পর আবার আপনার সমস্যা বলুন।"
        : session.dialectCode === "ta"
        ? "முந்தைய விவரம் ரத்து செய்யப்பட்டது. மீண்டும் உங்கள் பிரச்சனையை கூறுங்கள்."
        : session.dialectCode === "te"
        ? "రద్దు చేయబడింది. దయచేసి బీప్ తర్వాత మీ సమస్యను మళ్ళీ చెప్పండి."
        : session.dialectCode === "mr"
        ? "तक्रार रद्द केली. कृपया बीप नंतर आपले लक्षण पुन्हा सांगा."
        : session.dialectCode === "en"
        ? "Complaint cleared. Please describe your symptoms again after the beep."
        : "शिकायत रद्द की गई। कृपया बीप के बाद अपनी सही तकलीफ़ दोबारा बोलें।";

      return {
        session,
        action: "GATHER_SPEECH",
        spokenText: rejectPrompt,
        bcp47: (SUPPORTED_DIALECTS[session.dialectKey] || SUPPORTED_DIALECTS["1"]).bcp47,
        sms: null
      };
    }

    // Citizen confirmed (pressed 1, said yes, or default confirm)
    session.token = "#OPD-2026-" + Math.floor(1000 + Math.random() * 9000);
    session.state = "COMPLETED";

    const dept = session.routeResult?.department || "General Medicine";
    const hosp = session.selectedHospital || { name: "District Hospital" };

    // Format final SMS in the citizen's SELECTED LANGUAGE
    const localizedSms = formatLocalizedIvrSms(session.dialectCode, {
      token: session.token,
      hospitalName: hosp.name,
      dept: dept,
      complaintKind: session.complaint?.kind,
      complaintRegion: session.complaint?.region
    });

    session.smsDispatched = true;
    session.smsPayload = localizedSms;

    const spokenConfirmation = session.dialectCode === "bho"
      ? `राउर ओपीडी पर्ची पक्की हो गइल बा। टोकन नंबर ${session.token} बा। अस्पताल: ${hosp.name}, काउंटर 4। ई जानकारी राउर मोबाइल पर SMS से भेज दिहल गइल बा। धन्यवाद।`
      : session.dialectCode === "mai"
      ? `अहाँक ओपीडी टोकन ${session.token} पक्का भेल। अस्पताल: ${hosp.name}, काउंटर 4। सब जानकारी SMS द्वारा पठा देल गेल अछि। धन्यवाद।`
      : session.dialectCode === "bn"
      ? `আপনার ওপিডি টোকেন ${session.token} নিশ্চিত হয়েছে। হাসপাতাল: ${hosp.name}। বিস্তারিত SMS মারফত পাঠানো হয়েছে। ধন্যবাদ।`
      : session.dialectCode === "ta"
      ? `உங்கள் ஓபிடி டோக்கன் ${session.token} உறுதி செய்யப்பட்டது. மருத்துவமனை: ${hosp.name}. தகவல் SMS மூலம் அனுப்பப்பட்டது. நன்றி.`
      : session.dialectCode === "te"
      ? `మీ ఓపీడీ టోకెన్ ${session.token} నిర్ధారించబడింది. ఆసుపత్రి: ${hosp.name}. వివరాలు SMS ద్వారా పంపబడ్డాయి. ధన్యవాదాలు.`
      : session.dialectCode === "mr"
      ? `आपली ओपीडी पावती ${session.token} निश्चित झाली आहे. रुग्णालय: ${hosp.name}. माहिती SMS द्वारे पाठवली आहे. धन्यवाद.`
      : session.dialectCode === "en"
      ? `Your OPD token ${session.token} is confirmed for ${hosp.name} at Counter 4. Details sent via SMS in your language. Thank you for calling 104.`
      : `आपकी ओपीडी पर्ची पक्की हो गई है। टोकन नंबर है ${session.token}। अस्पताल: ${hosp.name}, काउंटर 4। सारी जानकारी आपके फोन पर SMS द्वारा भेज दी गई है। 104 पर कॉल करने के लिए धन्यवाद।`;

    return {
      session,
      action: "CALL_COMPLETE",
      spokenText: spokenConfirmation,
      bcp47: (SUPPORTED_DIALECTS[session.dialectKey] || SUPPORTED_DIALECTS["1"]).bcp47,
      sms: localizedSms
    };
  }

  // Completed or fallback
  return {
    session,
    action: "GATHER_DTMF",
    spokenText: "राष्ट्रीय स्वास्थ्य हेल्पलाइन 104। कृपया विकल्प चुनें या अपनी परेशानी बताएं।",
    bcp47: "hi-IN",
    sms: null
  };
}
