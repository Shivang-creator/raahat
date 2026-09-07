// ivr-engine.js — AI Voice IVR State Machine for Feature Phones (104 Integration)
// Designed for Rural India (Bharat) · AGENTS.md Rule 1 & Rule 2 compliant
// Connects 2G keypad phone calls to deterministic OPD routing and DLT SMS tokens.

import { parseFreeTextComplaint, routeComplaint, checkRealtimeEmergency } from "./routing.js";
import { autoSelectNearestHospital, PAN_INDIA_HOSPITALS } from "./hospital-data.js";

export const SUPPORTED_DIALECTS = {
  "1": { code: "hi", name: "हिन्दी (Hindi)", bcp47: "hi-IN", prompt: "नमस्ते! 104 स्वास्थ्य सेवा। बीप के बाद अपनी तकलीफ़ बोलें, और 1 दबाएँ।" },
  "2": { code: "en", name: "English", bcp47: "en-IN", prompt: "Welcome to 104 Helpline. Please describe your symptoms after the beep, and press 1." },
  "3": { code: "bho", name: "भोजपुरी (Bhojpuri)", bcp47: "hi-IN", prompt: "प्रणाम! राहत 104 सेवा। बीप के बाद परेशानी बताईं, आ बोले के बाद 1 दबाईं।" },
  "4": { code: "mai", name: "मैथिली (Maithili)", bcp47: "hi-IN", prompt: "प्रणाम! 104 स्वास्थ्य सेवा। बीप के बाद अपन कष्ट कहू, आ कहलाक बाद 1 दबाउ।" },
  "5": { code: "bn", name: "বাংলা (Bengali)", bcp47: "bn-IN", prompt: "নমস্কার! ১০৪ স্বাস্থ্য হেল্পলাইন। বিপের পর সমস্যা বলুন, এবং ১ টিপুন।" },
  "6": { code: "ta", name: "தமிழ் (Tamil)", bcp47: "ta-IN", prompt: "வணக்கம்! 104 உதவி மையம். பீப் பிறகு பிரச்சனையை கூறி, 1 அழுத்தவும்." },
  "7": { code: "te", name: "తెలుగు (Telugu)", bcp47: "te-IN", prompt: "నమస్కారం! 104 హెల్ప్‌లైన్. బీప్ తర్వాత సమస్య చెప్పి, 1 నొక్కండి." },
  "8": { code: "mr", name: "मराठी (Marathi)", bcp47: "mr-IN", prompt: "नमस्कार! 104 आरोग्य सेवा. बीप नंतर समस्या सांगा, आणि 1 दाबा." }
};

// Dialect colloquialisms normalizer for rural phrasing
export function normalizeDialectPhrasing(rawText) {
  let txt = String(rawText || "").toLowerCase();

  // Pain & Ache variants
  txt = txt.replace(/दरद बा|दरद अछि|पिराता|पीरा बा|दुखता|पीड़ा बा|दुखे लागल/g, "dard hai");

  // Respiratory & Cardiac Emergencies (RF-01, RF-07)
  txt = txt.replace(/सांस फूले लागल बा|सांस फूले लागल|दम फूल रहल बा|सांस नइखे लेवात|सांस में घुरघुर/g, "saans phool rahi hai breathlessness");
  txt = txt.replace(/छाती में कस मसोस|छाती में भारीपन|सीने में जकड़न|छाती दबता/g, "chest pain sweating");
  txt = txt.replace(/पसीना छूट रहल बा|पसीना फेंक रहल बा|खूब पसीना/g, "sweating pasina");

  // Stroke / Neurological Emergency (RF-02)
  txt = txt.replace(/कमज़ोरी लागल बा|सुन्न हो गइल बा|एक तरफ के अंग सुन्न|लकवा मार दिहलस/g, "ek taraf kamzori weakness on one side");
  txt = txt.replace(/बोली नइखे फूटत|बोली लटपटा रहल बा|जीभ लड़खड़ा/g, "slurred speech boli ladkhada");

  // Severe Bleeding & Trauma (RF-03, RF-04)
  txt = txt.replace(/खून गिरता|रुक नइखे|रुक नहि रहल अछि|खून के धार/g, "khoon beh raha hai bleeding won't stop");

  // Pediatric phrasings
  txt = txt.replace(/लइका के|बबुआ के|बच्चवा के|छौड़ा के|नन्हा बबुआ|धिया-पुता/g, "bachhe ko 5 saal child");

  // Musculoskeletal / Orthopaedics
  txt = txt.replace(/गोड़ के जोड़|ठेहुना|ठेहुन में|पैर के जोड़/g, "knee ghutna pair leg");
  txt = txt.replace(/गोड़ में|पैरवा में/g, "pair mein leg knee");
  txt = txt.replace(/कमर टूट रहल बा|कमरिया पिराता|कमर के दरद|कमर में पीरा|पीठ में अकड़न/g, "kamar dard lower back pain");
  txt = txt.replace(/हड्डी टूट गइल|हड्डी चटक गइल|चलल नइखे जात/g, "fracture bone pain orthopaedics");

  // Gastrointestinal / Abdomen
  txt = txt.replace(/पेट मसोस रहल बा|पेट खराब बा|मरोड़ उठ रहल बा|पेट में मरोड़/g, "pet dard stomach pain");
  txt = txt.replace(/उल्टी-दस्त|उल्टी दस्त|कै भइल बा|झाड़ा उलटी/g, "loose motion vomiting loose motions dast");
  txt = txt.replace(/पेट फूलल बा|गैस बन रहल बा|हवा नइखे निकसत/g, "pet gas indigestion");

  // Head & Neurological
  txt = txt.replace(/माथा में|कपार में|मुरिया में|कपार दरद/g, "sar mein head");
  txt = txt.replace(/चक्कर आवता|माथा घूमत बा|अन्हरिया आवता/g, "chakkar dizziness");

  // Dental
  txt = txt.replace(/दांत में कीड़ा|दांत खोढ़र|दाढ़ पिराता|मसूढ़ा फूलल बा|दांतवा में दरद/g, "daant tooth teeth dental pain");

  // Eye / Ophthalmology
  txt = txt.replace(/आँख से पानी गिरता|आँखी में दरद|धुंधला दिख रहल बा|आँख लाल बा/g, "aankh eye vision");

  // ENT / Ear-Nose-Throat
  txt = txt.replace(/कान बह रहल बा|कान में पीरा|गला जाम बा|आवाज बैठ गइल बा|घोंटे में दरद/g, "kaan ear gala throat");

  // Dermatology / Skin
  txt = txt.replace(/लाल-लाल दाना|बदन में खुजली|चमड़ी पर चकत्ते|नोचनी भइल बा/g, "rash skin khujli dana");

  // Urological / Burning micturition
  txt = txt.replace(/पेशाब में जलन|मूत में जरन|पेशाब रुके लागल/g, "peshab mein jalan burning urine");

  // Pregnancy / Obstetric
  txt = txt.replace(/पेट में बच्चा बा|गर्भवती बानी|जचगी|महीना चढ़ल बा/g, "pregnant pregnancy garbhwati");

  return txt;
}

// Spoken or DTMF district resolver for Pan-India public hospitals
export function resolveDistrictFromInput(inputStr, defaultDistrict = "Delhi") {
  const str = String(inputStr || "").toLowerCase().trim();
  if (!str) return defaultDistrict;

  // DTMF Zone Shortcuts
  if (str === "1") return "Delhi";
  if (str === "2") return "Uttar Pradesh";
  if (str === "3") return "Bihar";
  if (str === "4") return "Maharashtra";
  if (str === "5") return "West Bengal";
  if (str === "6") return "Tamil Nadu";

  // City / District text match
  if (/delhi|dilli|दिल्ली|noida|gurgaon|ghaziabad|faridabad/i.test(str)) return "Delhi";
  if (/lucknow|लखनऊ|kanpur|कानपुर|up|uttar pradesh|उत्तर प्रदेश/i.test(str)) return "Lucknow";
  if (/varanasi|वाराणसी|banaras|बनारस|kashi|काशी/i.test(str)) return "Varanasi";
  if (/patna|पटना|bihar|बिहार/i.test(str)) return "Patna";
  if (/darbhanga|दरभंगा|madhubani|मधुबनी/i.test(str)) return "Darbhanga";
  if (/gorakhpur|गोरखपुर/i.test(str)) return "Gorakhpur";
  if (/mumbai|मुंबई|bombay|pune|पुणे|maharashtra|महाराष्ट्र/i.test(str)) return "Mumbai";
  if (/kolkata|कोलकाता|calcutta|bengal|বাংলা|হাওড়া|howrah/i.test(str)) return "Kolkata";
  if (/chennai|चेन्नई|madras|tamil nadu|தமிழ்நாடு|coimbatore/i.test(str)) return "Chennai";
  if (/hyderabad|हैदराबाद|telangana|secunderabad/i.test(str)) return "Hyderabad";
  if (/bengaluru|bangalore|बेंगलुरु|karnataka/i.test(str)) return "Bengaluru";
  if (/jaipur|जयपुर|rajasthan/i.test(str)) return "Jaipur";
  if (/chandigarh|चंडीगढ़|punjab/i.test(str)) return "Chandigarh";
  if (/bhopal|भोपाल|indore|इंदौर|madhya pradesh/i.test(str)) return "Bhopal";

  return str;
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
        `அவசரத்திற்கு 108 அழைக்கவும்।`;
    case "te":
      return `[రాహత్ 104 ఓపీడీ టోకెన్]\n` +
        `టోకెన్: ${token}\n` +
        `ఆసుపత్రి: ${hospitalName}\n` +
        `విభాగం: ${dept} OPD (కౌంటర్ 4)\n` +
        `సమయం: ఈరోజు 09:30 AM · రుసుము: ₹10\n` +
        `తీసుకురండి: ఏదైనా గుర్తింపు కార్డు + ఈ SMS\n` +
        `వైద్యుడితో చెప్పండి: "${complaintRegion || "భాగం"} లో ${complaintKind || "సమస్య"}"\n` +
        `అత్యవసర సమయంలో 108 కాల్ చేయండి।`;
    case "mr":
      return `[राहत 104 ओपीडी टोकन]\n` +
        `टोकन: ${token}\n` +
        `रुग्णालय: ${hospitalName}\n` +
        `विभाग: ${dept} OPD (काउंटर 4)\n` +
        `वेळ: आज 09:30 AM · शुल्क: ₹10\n` +
        `सोबत आणा: ओळखपत्र + हा SMS\n` +
        `डॉक्टरांना सांगा: "${complaintRegion || "अवयव"} ${complaintKind || "त्रास"}"\n` +
        `आणीबाणीत 108 डायल करा।`;
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

export function createInitialIvrSession(callerNumber = "+919876543210", defaultDistrict = "Delhi") {
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
    district: defaultDistrict || "Delhi",
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

    // Default dialect selection prompt (crisp, under 15 seconds)
    return {
      session,
      action: "GATHER_DTMF",
      spokenText: "नमस्ते! राष्ट्रीय स्वास्थ्य सेवा 104। हिन्दी के लिए 1 दबाएँ। For English, press 2. भोजपुरी खातिर 3. मैथिली लेल 4. বাংলা 5. தமிழ் 6. తెలుగు 7. मराठीसाठी 8 दाबा।",
      bcp47: "hi-IN",
      sms: null
    };
  }

  // State 2: SYMPTOM PROCESSING (RULE 1 & RULE 2)
  if (session.state === "SYMPTOM_INPUT" || session.state === "WELCOME_DIRECT_SPEECH") {
    // Check if caller signaled end-of-speech with DTMF 1 or #
    let rawSpoken = speech || session.rawSpeech || "";
    if ((dtmf === "1" || dtmf === "#") && !speech && session.rawSpeech) {
      rawSpoken = session.rawSpeech;
    }

    // If caller pressed DTMF 1 with empty speech and no prior input, prompt politely
    if (!rawSpoken && (dtmf === "1" || dtmf === "#" || !dtmf)) {
      if (session.retryCount === 0 && !rawSpoken) {
        session.retryCount++;
        const promptEmpty = session.dialectCode === "en"
          ? "Please describe your symptoms after the beep, and press 1 when finished."
          : session.dialectCode === "bho"
          ? "बीप के बाद आपन परेशानी बोलल जाईं, आ 1 दबाईं।"
          : "कृपया बीप के बाद अपनी तकलीफ़ बोलें, और 1 दबाएँ।";
        return {
          session,
          action: "GATHER_SPEECH",
          spokenText: promptEmpty,
          bcp47: (SUPPORTED_DIALECTS[session.dialectKey] || SUPPORTED_DIALECTS["1"]).bcp47,
          sms: null
        };
      }
    }

    session.rawSpeech = rawSpoken;
    const normalized = normalizeDialectPhrasing(rawSpoken);
    session.normalizedSpeech = normalized;

    // RULE 2: Deterministic Red Flag Safety Interception
    const emergencyCheck = checkRealtimeEmergency(normalized);
    const parsed = parseFreeTextComplaint(normalized);
    const routed = routeComplaint(parsed);

    // Ensure deterministic department is NEVER "Choose a department yourself" over telephone IVR
    if (!routed.department || routed.department === "Choose a department yourself") {
      routed.department = "General Medicine";
      routed.urgency = routed.urgency || "routine";
      routed.rule_id = "R-10";
      routed.reason = {
        en: "General Medicine is the primary intake counter for initial clinical evaluation.",
        hi: "सामान्य चिकित्सा विभाग प्रारंभिक जाँच और परामर्श का मुख्य काउंटर है।"
      };
    }

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
      const spokenMsg = session.dialectCode === "en"
        ? "Emergency Alert! Critical symptoms detected. Do not wait for OPD. Reach nearest Emergency immediately. Patching to 108 Ambulance now."
        : session.dialectCode === "bho"
        ? "सावधान! ई आपातकालीन लक्षण बा। ओपीडी के इंतज़ार मत करीं, तुरंत 24 घंटा इमरजेंसी अस्पताल जाईं। 108 एम्बुलेंस से जोड़ल जा रहल बा..."
        : session.dialectCode === "mai"
        ? "सावधान! ई अति गंभीर लक्षण अछि। तुरंत नजदीकी इमरजेंसी वार्ड जाउ। फोन 108 एम्बुलेंस सं जोड़ल जा रहल अछि..."
        : session.dialectCode === "bn"
        ? "সতর্কতা! জরুরি অবস্থা। অবিলম্বে জরুরি ট্রমা সেন্টারে যান। ১০৮ অ্যাম্বুলেন্সে সংযুক্ত করা হচ্ছে..."
        : session.dialectCode === "ta"
        ? "எச்சரிக்கை! அவசர நிலை. உடனடியாக அவசர பிரிவிற்கு செல்லவும். 108 ஆம்புலன்ஸ் இணைக்கப்படுகிறது..."
        : session.dialectCode === "te"
        ? "హెచ్చరిక! అత్యవసర పరిస్థితి. వెంటనే ఎమర్జెన్సీ విభాగానికి వెళ్ళండి. 108 అంబులెన్స్‌కు కనెక్ట్ చేయబడుతోంది..."
        : session.dialectCode === "mr"
        ? "सावधान! आणीबाणीचे लक्षण आहे. त्वरित इमर्जन्सी वॉर्डमध्ये जा. कॉल 108 रुग्णवाहिकेला जोडला जात आहे..."
        : "चेतावनी! यह आपातकालीन लक्षण है। नियमित ओपीडी की प्रतीक्षा न करें, तुरंत नजदीकी 24 घंटे इमरजेंसी जाएँ। कॉल 108 एम्बुलेंस से जोड़ी जा रही है...";

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
      const clarifyPrompt = session.dialectCode === "en"
        ? "Is this pain in stomach, chest, or joints? Speak body part and press 1."
        : session.dialectCode === "bho"
        ? "ई दरद पेट में बा, छाती में, कि जोड़ में? अंग के नाम बताईं आ 1 दबाईं।"
        : session.dialectCode === "mai"
        ? "ई दर्द पेट मे अछि, छाती मे, वा गाठि मे? अंगक नाम कहू आ 1 दबाउ।"
        : session.dialectCode === "bn"
        ? "এই ব্যথা পেটে, বুকে নাকি গাঁটে? অঙ্গের নাম বলুন এবং ১ টিপুন।"
        : session.dialectCode === "ta"
        ? "வலி வயிற்றில், நெஞ்சில் அல்லது மூட்டுகளிலா? உறுப்பின் பெயரை கூறி 1 அழுத்தவும்."
        : session.dialectCode === "te"
        ? "నొప్పి కడుపులో, ఛాతీలో లేదా కీళ్లలోనా? భాగాన్ని చెప్పి 1 నొక్కండి."
        : session.dialectCode === "mr"
        ? "हे दुखणे पोटात, छातीत की सांध्यात आहे? अवयव सांगा व 1 दाबा."
        : "यह दर्द पेट में है, छाती में, या जोड़ों में? कृपया अंग का नाम बोलें और 1 दबाएँ।";

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

    const promptDistrict = session.dialectCode === "en"
      ? `Department: ${routed.department}. Speak your district or city, or press 1 for Delhi, 2 for UP, 3 for Bihar, 4 for Mumbai.`
      : session.dialectCode === "bho"
      ? `विभाग: ${routed.department}। आपन जिला या शहर के नाम बताईं, या दिल्ली खातिर 1, यूपी खातिर 2, बिहार खातिर 3 दबाईं।`
      : session.dialectCode === "mai"
      ? `विभाग: ${routed.department}। अपन जिला वा शहरक नाम कहू, वा दिल्ली लेल 1, यूपी लेल 2, बिहार लेल 3 दबाउ।`
      : session.dialectCode === "bn"
      ? `বিভাগ: ${routed.department}। জেলার নাম বলুন, বা দিল্লির জন্য ১, বাংলার জন্য ৫ টিপুন।`
      : session.dialectCode === "ta"
      ? `துறை: ${routed.department}. மாவட்டத்தின் பெயரை கூறவும், அல்லது சென்னைக்கு 6 அழுத்தவும்.`
      : session.dialectCode === "te"
      ? `విభాగం: ${routed.department}. జిల్లా పేరు చెప్పండి, లేదా హైదరాబాద్ కోసం 1 నొక్కండి.`
      : session.dialectCode === "mr"
      ? `विभाग: ${routed.department}. जिल्ह्याचे नाव सांगा, किंवा मुंबईसाठी 4 दाबा.`
      : `विभाग: ${routed.department}। अपने जिले या शहर का नाम बोलें, या दिल्ली के लिए 1, यूपी के लिए 2, बिहार के लिए 3 दबाएँ।`;

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
    let rawClarify = speech || "";
    if ((dtmf === "1" || dtmf === "#") && !speech && session.rawSpeech) {
      rawClarify = "";
    }
    const combinedSpeech = (session.rawSpeech + " " + rawClarify).trim();
    session.rawSpeech = combinedSpeech;
    const normalized = normalizeDialectPhrasing(combinedSpeech);
    session.normalizedSpeech = normalized;

    const parsed = parseFreeTextComplaint(normalized);
    const routed = routeComplaint(parsed);

    // Department Fallback Guard
    if (!routed.department || routed.department === "Choose a department yourself") {
      routed.department = "General Medicine";
      routed.urgency = routed.urgency || "routine";
      routed.rule_id = "R-10";
    }

    session.complaint = parsed;
    session.routeResult = routed;
    session.state = "DISTRICT_INPUT";

    const promptDistrict = session.dialectCode === "en"
      ? `Department: ${routed.department}. Speak your district, or press 1 for Delhi, 2 for UP, 3 for Bihar.`
      : session.dialectCode === "bho"
      ? `विभाग: ${routed.department} मिली। आपन जिला या शहर के नाम बताईं।`
      : `विभाग: ${routed.department}। अपने जिले या शहर का नाम बोलें, या 1 दबाएँ।`;

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
    const rawInput = districtInput || dtmf || speech || session.district;
    const resolvedDist = resolveDistrictFromInput(rawInput, session.district || "Delhi");
    session.district = resolvedDist;

    const dept = session.routeResult?.department || "General Medicine";

    // 1. Search PAN_INDIA_HOSPITALS for matching district, city, or state
    let matchedHosp = PAN_INDIA_HOSPITALS.find((h) => 
      (h.departments && h.departments.includes(dept)) &&
      ((h.district && h.district.toLowerCase().includes(resolvedDist.toLowerCase())) ||
       (h.city && h.city.toLowerCase().includes(resolvedDist.toLowerCase())) ||
       (h.state && h.state.toLowerCase().includes(resolvedDist.toLowerCase())))
    );

    // 2. If no hospital with this specialty in specific district, search whole state
    if (!matchedHosp) {
      matchedHosp = PAN_INDIA_HOSPITALS.find((h) => 
        (h.departments && h.departments.includes(dept)) &&
        (h.state && h.state.toLowerCase().includes(resolvedDist.toLowerCase()))
      );
    }

    // 3. If still not matched, fallback to premier apex hospital (AIIMS New Delhi / Safdarjung for Delhi benchmark)
    if (!matchedHosp) {
      matchedHosp = autoSelectNearestHospital(dept, { lat: 28.5672, lng: 77.2100 }, "Delhi")
        || PAN_INDIA_HOSPITALS.find((h) => h.departments && h.departments.includes(dept))
        || PAN_INDIA_HOSPITALS[0];
    }

    session.selectedHospital = matchedHosp;
    session.state = "CONFIRM_APPOINTMENT";

    const confirmPrompt = session.dialectCode === "en"
      ? `${dept} at ${matchedHosp.name}. Press 1 to confirm, 2 to change.`
      : session.dialectCode === "bho"
      ? `${dept} विभाग, ${matchedHosp.name}। पक्का करे खातिर 1 दबाईं, बदले खातिर 2 दबाईं।`
      : session.dialectCode === "mai"
      ? `${dept} विभाग, ${matchedHosp.name}। पुष्टि लेल 1 दबाउ, बदलब लेल 2 दबाउ।`
      : session.dialectCode === "bn"
      ? `${dept} বিভাগ, ${matchedHosp.name}। নিশ্চিত করতে ১, বদলাতে ২ টিপুন।`
      : session.dialectCode === "ta"
      ? `${dept} பிரிவு, ${matchedHosp.name}. உறுதிப்படுத்த 1, மாற்ற 2 அழுத்தவும்.`
      : session.dialectCode === "te"
      ? `${dept} విభాగం, ${matchedHosp.name}. నిర్ధారించడానికి 1, మార్చడానికి 2 నొక్కండి.`
      : session.dialectCode === "mr"
      ? `${dept} विभाग, ${matchedHosp.name}. खात्रीसाठी 1, बदलण्यासाठी 2 दाबा.`
      : `${dept} विभाग, ${matchedHosp.name}। पक्का करने के लिए 1 दबाएँ, बदलने के लिए 2 दबाएँ।`;

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

      const rejectPrompt = session.dialectCode === "en"
        ? "Complaint cleared. Describe symptoms after beep, and press 1."
        : session.dialectCode === "bho"
        ? "शिकायत रद्द भइल। बीप के बाद परेशानी फेर से बताईं, आ 1 दबाईं।"
        : session.dialectCode === "mai"
        ? "शिकायत रद्द भेल। बीप के बाद अपन कष्ट पुनः कहू, आ 1 दबाउ।"
        : session.dialectCode === "bn"
        ? "বিবরণ বাতিল করা হয়েছে। বিপের পর আবার বলুন, এবং ১ টিপুন।"
        : session.dialectCode === "ta"
        ? "விவரம் ரத்து செய்யப்பட்டது. மீண்டும் கூறி 1 அழுத்தவும்."
        : session.dialectCode === "te"
        ? "రద్దు చేయబడింది. సమస్యను మళ్ళీ చెప్పి 1 నొక్కండి."
        : session.dialectCode === "mr"
        ? "तक्रार रद्द केली. लक्षण पुन्हा सांगा आणि 1 दाबा."
        : "शिकायत रद्द की गई। बीप के बाद अपनी तकलीफ़ दोबारा बोलें, और 1 दबाएँ।";

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

    const spokenConfirmation = session.dialectCode === "en"
      ? `Token ${session.token} confirmed for ${hosp.name}, Counter 4. SMS sent. Thank you for calling 104.`
      : session.dialectCode === "bho"
      ? `टोकन ${session.token} पक्का भइल। अस्पताल: ${hosp.name}, काउंटर 4। SMS भेज दिहल गइल बा। धन्यवाद।`
      : session.dialectCode === "mai"
      ? `टोकन ${session.token} पक्का भेल। अस्पताल: ${hosp.name}, काउंटर 4। SMS पठा देल गेल अछि। धन्यवाद।`
      : session.dialectCode === "bn"
      ? `টোকেন ${session.token} নিশ্চিত হয়েছে। হাসপাতাল: ${hosp.name}, কাউন্টার ৪। SMS পাঠানো হয়েছে। ধন্যবাদ।`
      : session.dialectCode === "ta"
      ? `டோக்கன் ${session.token} உறுதி செய்யப்பட்டது. மருத்துவமனை: ${hosp.name}, கவுண்டர் 4. SMS அனுப்பப்பட்டது. நன்றி.`
      : session.dialectCode === "te"
      ? `టోకెన్ ${session.token} నిర్ధారించబడింది. ఆసుపత్రి: ${hosp.name}, కౌంటర్ 4. SMS పంపబడింది. ధన్యవాదాలు.`
      : session.dialectCode === "mr"
      ? `पावती ${session.token} निश्चित झाली. रुग्णालय: ${hosp.name}, काउंटर 4. SMS पाठवला आहे. धन्यवाद.`
      : `टोकन नंबर ${session.token} पक्का हुआ। अस्पताल: ${hosp.name}, काउंटर 4। SMS भेज दिया गया है। 104 पर कॉल करने के लिए धन्यवाद।`;

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
