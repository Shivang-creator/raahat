import { ROUTING_RULES } from "./routing-rules.js";

const cleanText = (value) => String(value || "")
  .toLocaleLowerCase("en-IN")
  .replace(/[’']/g, "'")
  .replace(/\s+/g, " ")
  .trim();

const hasAny = (text, phrases) => phrases.some((phrase) => text.includes(phrase));

/**
 * Small, deterministic, client-side phrase extractor. It only creates a
 * Complaint shape; it never diagnoses or selects a department.
 */
export function parseFreeTextComplaint(input, language = "en") {
  const original = String(input || "").trim();
  const text = cleanText(original);
  const complaint = {
    region: null,
    side: null,
    kind: null,
    duration: null,
    severity: null,
    age_band: null,
    exact_age: null,
    who_for: null,
    patient_name: null,
    gender: null,
    conditions: [],
    severity_markers: [],
    parsed: false,
    unclear: original ? [original] : [],
  };

  if (!text) return complaint;

  const isBaby = hasAny(text, [
    "baby", "infant", "newborn", "नन्हा", "शिशु", "छोटे बच्चे", "bachhe", "bacche",
    "குழந்தை", "கைக்குழந்தை", "பாப்பா", "శిశువు", "పాప", "బాబు", "শিশু", "নবজাতক",
    "বাচ্চা", "बाळ", "अर्भक", "ಮಗು", "ಕೂಸು", "શિશુ", "കുഞ്ഞ്", "ਨਿਆਣਾ", "ଛୁଆ", "شیر خوار", "نوزائیدہ",
  ]);
  const isKidWord = (/\bkids?\b/i.test(text) && !text.includes("kidney"));
  const isChild = isBaby || isKidWord || hasAny(text, [
    "child", "बच्चे", "बच्चा", "बच्ची", "சிறுவன்", "சிறுமி", "పిల్లలు", "పిల్లాడు",
    "খোকা", "খুকি", "लहान मूल", "ಹುಡುಗ", "બાળક", "കുട്ടി", "ਬੱਚਾ", "ପିଲା", "بچہ",
  ]);
  if (isBaby) complaint.age_band = "baby";
  else if (isChild) complaint.age_band = "child";
  if (isChild) complaint.who_for = "child";


  // Expanded Clinical Extractors: Urology, Obs & Gynae, Pulmonology, Psychiatry
  const isPregnancy = hasAny(text, ["pregnant", "pregnancy", "garbhwati", "garbh", "गर्भवती", "गर्भ", "period pain", "mahwaari", "माहवारी", "delivery", "antenatal", "menses"]);
  const isUrinary = hasAny(text, ["urine", "urinary", "peshab", "पेशाब", "burning urine", "kidney stone", "pathri", "पथरी", "पेशाब में जलन", "मूत्र"]);
  const isCough = hasAny(text, ["cough", "khansi", "खांसी", "खोखला", "balgham", "phlegm", "बलगम", "wheezing", "asthma", "दमा"]);
  const isPsychiatry = hasAny(text, ["anxiety", "depression", "insomnia", "neend nahi", "तनाव", "घबराहट", "उदासी", "नींद न आना", "man me bechaini", "bechaini"]);

  if (isPregnancy) {
    complaint.kind = "pregnancy";
    complaint.region = "pelvis-female";
    complaint.parsed = true;
    if (hasAny(text, ["bleeding", "blood", "khoon", "खून", "रक्त"])) {
      complaint.severity_markers.push("pregnancy-bleeding");
      complaint.severity = "emergency";
    }
  } else if (isUrinary) {
    complaint.kind = "urinary";
    complaint.region = "urinary";
    complaint.parsed = true;
  } else if (isCough) {
    complaint.kind = "chronic-cough";
    complaint.region = "chest";
    complaint.parsed = true;
  } else if (isPsychiatry) {
    complaint.kind = "mental-health";
    complaint.region = "general";
    complaint.parsed = true;
  }

  const hasChest = hasAny(text, [
    "chest", "सीने", "सीना", "seene", "sine", "छाती", "chhati",
    "நெஞ்சு", "மார்பு", "ఛాతీ", "గుండె", "বুক", "বুকে", "छातीत",
    "ಎದೆ", "ಎದೆಯಲ್ಲಿ", "છાતીમાં", "છાતી", "നെഞ്ച്", "നെഞ്ചു", "നെഞ്ചിൽ",
    "ਛਾਤੀ", "ଛାତି", "ଛାତିରେ", "سینہ", "سینے", "বুকু",
  ]);
  const hasHead = hasAny(text, [
    "headache", "head pain", "सिरदर्द", "सिर दर्द", "sar dard", "sir dard", "सिर",
    "தலைவலி", "தலை வலி", "தலை", "తలనొప్పి", "తలనెప్పి", "తల",
    "মাথা ব্যথা", "মাথাব্যথা", "মাথা", "डोकेदुखी", "डोके दुखणे", "डोके",
    "ತಲೆನೋವು", "ತಲೆ ನೋವು", "ತಲೆ", "માથાનો દુખાવો", "માથું",
    "തലവേദന", "തല", "ਸਿਰ ਦਰਦ", "ਸਿਰ", "ମୁଣ୍ଡ ବିନ୍ଧା", "ମୁଣ୍ଡ ଯନ୍ତ୍ରଣା", "ମୁଣ୍ଡ",
    "سر درد", "درد سر", "سر", "মূৰৰ বিষ", "মূৰ",
  ]);
  const hasEyes = hasAny(text, [
    "eye", "eyes", "vision", "आँख", "आंख", "नज़र", "नजर", "दृष्टि", "aankh", "ankh",
    "கண்", "கண்கள்", "பார்வை", "కన్ను", "కళ్ళు", "చూపు",
    "চোখ", "চোখে", "দৃষ্টি", "डोळा", "डोळे", "ಕಣ್ಣು", "ಕಣ್ಣುಗಳು",
    "આંખ", "આંખો", "ദൃഷ്ടി", "കണ്ണ്", "കണ്ണുകൾ", "ਅੱਖ", "ਅੱਖਾਂ",
    "ଆଖି", "آنکھ", "آنکھیں", "চকু",
  ]);
  const hasNose = hasAny(text, [
    "nose", "nasal", "sinus", "sinuses", "नाक", "साइनस", "naak",
    "மூக்கு", "ముక్కు", "ناک", "নাক", "नाक", "ಮೂಗು", "નાક", "മൂക്ക്", "ਨੱਕ", "ନାକ", "নাকৰ",
  ]);
  const hasEars = hasAny(text, [
    "ear", "ears", "throat", "कान", "गला", "kaan", "gala",
    "காது", "தொண்டை", "చెవి", "చెవులు", "గొంతు", "কান", "গলা",
    "घसा", "ಕಿವಿ", "ಗಂಟಲು", "ગળું", "തൊണ്ട", "ਕੰਨ", "ଗଳା", "گلا", "ডিঙি",
  ]);
  const hasTeeth = hasAny(text, [
    "tooth", "teeth", "dental", "दाँत", "दांत", "मुँह", "मुंह", "daant",
    "பல்", "பற்கள்", "வாய்", "పన్ను", "పళ్ళు", "నోరు", "দাঁত", "মুখ",
    "दात", "तोंड", "ಹಲ್ಲು", "ಹಲ್ಲುಗಳು", "દાંત", "പല്ല്", "દੰਦ", "ଦାନ୍ତ", "دانت", "منہ",
  ]);
  const hasAbdomen = hasAny(text, [
    "stomach", "tummy", "stomach upset", "upset stomach", "indigestion", "pet", "पेट",
    "पेट खराब", "पेट ख़राब", "pet kharab", "pet kharaab", "pet upset", "loose motion",
    "loose motions", "dast", "vomit", "vomiting", "उल्टी", "दस्त",
    "வயிறு", "வயிற்று வலி", "வாந்தி", "பேதி", "కడుపు", "కడుపు నొప్పి", "వాంతులు", "విరేచనాలు",
    "পেট", "পেট ব্যথা", "বমি", "পাতলা পায়খানা", "पोट", "पोटात दुखणे", "उलट्या", "जुलाब",
    "ಹೊಟ್ಟೆ", "ಹೊಟ್ಟೆ ನೋವು", "ವಾಂತಿ", "ಭೇದಿ", "પેટ", "પેટમાં દુખાવો", "ઊલટી", "ઝાડા",
    "വയർ", "വയറുവേദന", "ഛർദ്ദി", "വയറിളക്കം", "ਢਿੱਡ", "ਪੇਟ ਦਰਦ", "ਦਸਤ", "ਉਲਟੀ",
    "ପେଟ", "ବାନ୍ତି", "ଝାଡ଼ା", "پیٹ", "پیٹ میں درد", "الٹی", "دست",
  ]);
  const hasShoulder = hasAny(text, [
    "shoulder", "कंधा", "कन्धा", "தோள்பட்டை", "భుజం", "কাঁধ", "खांदा",
    "ಭುಜ", "ખભા", "തോൾ", "ਮੋਢਾ", "କାନ୍ଧ", "کندھا",
  ]);
  const hasKnee = hasAny(text, [
    "knee", "घुटना", "घुटने", "முழங்கால்", "మోకాలు", "হাঁটু", "गुडघा",
    "ಮೊಣಕಾಲು", "ઢીંચણ", "മുട്ട്", "ਗੋਡਾ", "ଆଣ୍ଠୁ", "گھٹنا",
  ]);
  const hasHand = hasAny(text, [
    "hand", "wrist", "हाथ", "कलाई", "கை", "చేయి", "হাত", "हात",
    "ಕೈ", "હાથ", "കൈ", "ਹੱਥ", "ହାତ", "ہاتھ",
  ]);
  const hasFoot = hasAny(text, [
    "foot", "feet", "ankle", "पैर", "टखना", "टखने", "கால்", "பாదం",
    "పాదం", "পা", "पाय", "ಕಾಲು", "પગ", "കാൽ", "ਪੈਰ", "ଗୋଡ଼", "پاؤں",
  ]);
  const hasPelvis = hasAny(text, [
    "pelvis", "hip", "hips", "कूल्हा", "कूल्हे", "पेल्विस", "இடுப்பு",
    "నడుము", "কোমর", "कंबर", "ಸೊಂಟ", "કમર", "നടുവ്", "ਕਮਰ", "ଅଣ୍ଟା", "کولہے",
    "groin", "genital", "genitals", "reproductive", "testicle", "testicles", "scrotum",
    "penis", "vagina", "vulva", "prostate", "inguinal", "hernia", "हर्निया",
    "जननांग", "गुप्तांग", "अंडकोष", "प्रजनन",
  ]);
  const hasUpperBack = hasAny(text, [
    "upper back", "ऊपरी पीठ", "மேல் முதுகு", "పై వీపు", "পিঠের উপরিভাগ",
    "पाठीचा वरचा भाग", "ಮೇಲಿನ ಬೆನ್ನು", "ઉપરની પીઠ",
  ]);
  const hasLowerBack = hasAny(text, [
    "lower back", "lumbar", "कमर", "निचली पीठ", "கீழ் முதுகு", "నడుము నొప్పి",
    "কোমরের ব্যথা", "कंबरदुखी", "ಕೆಳ ಬೆನ್ನು", "નીચલી પીઠ", "കീഴ് നടുവ്", "ਲੱਕ ਦਰਦ", "کمر کا نچلا حصہ",
  ]);
  const hasLeg = hasAny(text, [
    "leg", "pair", "टांग", "टाँग", "கால் தசை", "కాలు", "পা", "पाय",
    "ಕಾಲು", "પગ", "കാലുകൾ", "ਲੱਤ", "ଗୋଡ", "ٹانگ",
  ]);

  const breathlessness = hasAny(text, [
    "breathlessness", "shortness of breath", "difficulty breathing", "breathing difficulty",
    "saans lene mein dikkat", "saans ki dikkat", "सांस लेने में दिक्कत", "साँस लेने में दिक्कत",
    "மூச்சு திணறல்", "மூச்சுத் திணறல்", "மூச்சு வாங்குதல்", "சுவாசிப்பதில் சிரமம்",
    "శ్వాస తీసుకోవడంలో ఇబ్బంది", "శ్వాస ఆడకపోవడం", "ఆయాసం",
    "শ্বাসকষ্ট", "শ্বাস নিতে কষ্ট", "দম বন্ধ",
    "श्वास घेण्यास त्रास", "धाप लागणे", "श्वास कोंडणे",
    "ಉಸಿರಾಟದ ತೊಂದರೆ", "ಉಸಿರಾಡಲು ಕಷ್ಟ", "ಉಸಿರು ಕಟ್ಟುವಿಕೆ",
    "શ્વાસ લેવામાં તકલીફ", "શ્વાસ ચડવો", "દમ ઘૂંટાવવો",
    "ശ്വാസതടസ്സം", "ശ്വാസമെടുക്കാൻ ബുദ്ധിമുട്ട്", "കിതപ്പ്",
    "ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ਼", "ਸਾਹ ਚੜ੍ਹਨਾ", "ਦਮ ਘੁੱਟਣਾ",
    "ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ", "ନିଶ୍ୱାସ ପ୍ରଶ୍ୱାସରେ ଅସୁବିଧା",
    "سانس لینے میں دشواری", "دم گھٹنا", "سانس پھولنا",
  ]);
  const sweating = hasAny(text, [
    "sweating", "sweat", "pasina", "पसीना", "வியர்வை", "చెమట", "ঘাম",
    "घाम", "ಬೆವರು", "પરસેવો", "വിയർപ്പ്", "ਮੁੜ੍ਹਕਾ", "ଝାଳ", "پسینہ",
  ]);
  const oneSidedWeakness = hasAny(text, [
    "weakness on one side", "one-sided weakness", "one sided weakness", "ek taraf kamzori",
    "ek taraf ki kamzori", "एक तरफ कमज़ोरी", "एक तरफ़ कमज़ोरी", "एक ओर कमज़ोरी",
    "ஒரு பக்க பலவீனம்", "ஒரு பக்கம் பலவீனம்", "ஒரு பக்கம் சோர்வு",
    "ఒక వైపు బలహీనత", "ఒక పక్క చచ్చుబడటం",
    "এক পাশে দুর্বলতা", "এক পাশ দুর্বল", "শরীরের এক দিক অবশ",
    "एका बाजूला अशक्तपणा", "एका बाजूची ताकद जाणे", "एका बाजूला लकवा",
    "ಒಂದು ಬದಿಯ ದೌರ್ಬಲ್ಯ", "ಒಂದು ಪಾರ್ಶ್ವ ನಿಶ್ಯಕ್ತಿ",
    "એક બાજુ નબળાઈ", "શરીરની એક તરફ નબળાશ",
    "ഒരു വശത്ത് തളർച്ച", "ഒരു ഭാഗം തളർന്നുപോകുക",
    "ਇੱਕ ਪਾਸੇ ਕਮਜ਼ੋਰੀ", "ਅੱਧਾ ਅੰਗ ਕਮਜ਼ੋਰ",
    "ଗୋଟିଏ ପାର୍ଶ୍ୱରେ ଦୁର୍ବଳତା", "ଗୋଟିଏ ପାଖ ଅବଶ",
    "ایک طرف کمزوری", "جسم کے ایک حصے میں کمزوری",
  ]);
  const oneSidedNumbness = hasAny(text, [
    "numbness on one side", "one-sided numbness", "one sided numbness", "ek taraf sunn",
    "एक तरफ सुन्न", "एक तरफ़ सुन्न", "एक ओर सुन्न",
    "ஒரு பக்கம் மரத்து", "ஒரு பக்கம் மரத்துப்போதல்",
    "ఒక వైపు మొద్దుబారడం", "ఒంటి పక్క తిమ్మిరి",
    "এক পাশ অবশ", "এক পাশ অসাড়",
    "एका बाजूला बधिरता", "एक बाजू सुन्न",
    "ಒಂದು ಕಡೆ ಮರಗಟ್ಟುವುದು",
    "એક તરફ બહેરી",
    "ഒരു വശം മരവിപ്പ്",
    "ਇੱਕ ਪਾਸਾ ਸੁੰਨ",
    "ایک طرف سن",
  ]);
  const slurredSpeech = hasAny(text, [
    "slurred speech", "speech is slurred", "बोली लड़खड़ा", "बोली लड़खड़ा", "boli ladkhada",
    "பேச்சு குழறுதல்", "நாக்கு குளறுதல்",
    "మాట ముద్దవడం", "మాట తడబడటం",
    "কথা জড়িয়ে যাওয়া", "কথা অস্পষ্ট",
    "बोलताना जीभ अडखळणे", "बोबडे बोलणे",
    "ಮಾತು ತಡವರುವುದು", "ಮಾತು ಅಸ್ಪಷ್ಟ",
    "જીભ લથડવી", "બોલવામાં તકલીફ",
    "സംസാരിക്കാൻ കുഴയുക",
    "ਬੋਲਣ ਵਿੱਚ ਲੜਖੜਾਹਟ",
    "زبان لڑکھڑانا",
  ]);
  const notFeeding = hasAny(text, [
    "not feeding", "not drinking milk", "won't feed", "doesn't feed", "doodh nahi pee", "doodh nahin pee",
    "दूध नहीं पी", "दूध नहीं पी रहा", "दूध नहीं पी रही", "दूध न पीना",
    "பால் குடிக்கவில்லை", "தாய்ப்பால் குடிக்கவில்லை",
    "పాలు తాగడం లేదు", "పాలు పట్టడం లేదు",
    "দুধ খাচ্ছে না", "বুকের দুধ খাচ্ছে না",
    "दूध पीत नाही", "दूध ओढत नाही",
    "ಹಾಲು ಕುಡಿಯುತ್ತಿಲ್ಲ",
    "દૂધ પીતું નથી",
    "പാല് കുടിക്കുന്നില്ല",
    "ਦੁੱਧ ਨਹੀਂ ਪੀ ਰਿਹਾ",
    "دودھ نہیں پی رہا",
  ]);
  const heavyBleeding = hasAny(text, [
    "heavy bleeding", "bleeding heavily", "uncontrolled bleeding", "bleeding won't stop", "bleeding will not stop",
    "bleeding not stopping", "बहुत ज्यादा खून", "बहुत ज़्यादा खून", "खून बहुत बह", "खून रुक नहीं रहा", "खून नहीं रुक",
    "அதிக இரத்தப்போக்கு", "ரத்தம் நிற்கவில்லை",
    "తీవ్ర రక్తస్రావం", "రక్తం ఆగడం లేదు",
    "অতিরিক্ত রক্তপাত", "রক্ত বন্ধ হচ্ছে না",
    "जास्त रक्तस्त्राव", "रक्त थांबत नाही",
    "ಅತಿಯಾದ ರಕ್ತಸ್ರಾವ", "ರಕ್ತ ನಿಲ್ಲುತ್ತಿಲ್ಲ",
    "ભારે રક્તસ્ત્રાવ", "લોહી બંધ નથી થતું",
    "അമിത രക്തസ്രാവം", "ചോര നിൽക്കുന്നില്ല",
    "ਬਹੁਤ ਜ਼ਿਆਦਾ ਖ਼ੂਨ", "ਖੂਨ ਰੁਕ ਨਹੀਂ ਰਿਹਾ",
    "شدید خون بہنا", "خون رک نہیں رہا",
  ]);
  const stiffNeck = hasAny(text, [
    "stiff neck", "neck is stiff", "gardan akad", "गर्दन अकड़", "गर्दन अकड़",
    "கழுத்து விறைப்பு", "கழுத்து திருப்ப முடியவில்லை",
    "మెడ పట్టేయడం", "మెడ బిగుతు",
    "ঘাড় শক্ত", "ঘাড় শক্ত হয়ে যাওয়া",
    "मान ताठणे", "मान आखडणे",
    "ಕತ್ತು ಬಿಗಿತ", "ಕುತ್ತಿಗೆ ಬಿಗಿತ",
    "ગરદન અકડાઈ જવી",
    "കഴുത്ത് അനക്കാൻ പറ്റാത്ത",
    "ਧੌਣ ਅਕੜਨਾ",
    "گردن اکڑ جانا",
  ]);
  const suddenSevereHeadache = hasAny(text, [
    "sudden severe headache", "worst headache", "अचानक बहुत तेज सिरदर्द", "अचानक बहुत तेज़ सिरदर्द",
    "திடீர் கடுமையான தலைவலி", "தாங்க முடியாத தலைவலி",
    "హఠాత్తుగా తీవ్రమైన తలనొప్పి",
    "হঠাৎ প্রচণ্ড মাথা ব্যথা",
    "अचानक अतिशय तीव्र डोकेदुखी",
    "ಹಠಾತ್ ತೀವ್ರ ತಲೆನೋವು",
    "અચાનક ખૂબ જ તીવ્ર માથાનો દુખાવો",
    "പെട്ടെന്ന് ഉണ്ടായ കഠിനമായ തലവേദന",
    "ਅਚਾਨਕ ਬਹੁਤ ਤੇਜ਼ ਸਿਰ ਦਰਦ",
    "اچانک شدید سر درد",
  ]);
  const seizure = hasAny(text, [
    "seizure", "fit", " दौरा", "दौरा", "mirgi ka daura",
    "வலிப்பு", "காக்காய் வலிப்பு", "ఫిట్స్", "మూర్ఛ",
    "খিঁচুনি", "ফেফरे", "झटके येणे", "ಫಿಟ್ಸ್", "ಮೂರ್ಛೆ",
    "આંચકી", "ખેંચ", "അപസ്മാരം", "ਦੌਰੇ", "ਮਿਰਗੀ", "تشنج", "مرگی",
  ]);
  const selfHarm = hasAny(text, [
    "self-harm", "self harm", "harm myself", "suicide", "खुद को नुकसान", "आत्महत्या",
    "தற்கொலை", "சுய தீங்கு", "ఆత్మహత్య", "আত্মহত্যা", "आत्महत्या",
    "ಆತ್ಮಹತ್ಯೆ", "આત્મહત્યા", "ആത്മഹത്യ", "ਖ਼ੁਦਕੁਸ਼ੀ", "خود کشی",
  ]);

  if (oneSidedWeakness) complaint.severity_markers.push("one-sided-weakness");
  if (oneSidedNumbness) complaint.severity_markers.push("one-sided-numbness");
  if (slurredSpeech) complaint.severity_markers.push("slurred-speech");
  if (notFeeding) complaint.severity_markers.push("not-feeding");
  if (heavyBleeding) complaint.severity_markers.push("heavy-bleeding");
  if (stiffNeck) complaint.severity_markers.push("stiff-neck");
  if (suddenSevereHeadache) complaint.severity_markers.push("sudden-severe-headache");
  if (seizure) complaint.severity_markers.push("seizure");
  if (selfHarm) complaint.severity_markers.push("self-harm-thoughts");

  if (!complaint.region) {
    if (hasChest) complaint.region = "chest";
    else if (hasHead) complaint.region = "head";
  else if (hasEyes) complaint.region = "eyes";
  else if (hasNose) complaint.region = "nose";
  else if (hasEars) complaint.region = "ears";
  else if (hasTeeth) complaint.region = "teeth";
  else if (hasShoulder) complaint.region = "shoulder";
  else if (hasKnee) complaint.region = "knee";
  else if (hasHand) complaint.region = "hand";
  else if (hasFoot) complaint.region = "foot";
  else if (hasPelvis) complaint.region = "pelvis";
  else if (hasUpperBack) complaint.region = "upper-back";
  else if (hasLowerBack) complaint.region = "lower-back";
  else if (hasLeg) complaint.region = "leg";
  else if (hasAbdomen) complaint.region = "upper-abdomen";
  else if (oneSidedWeakness || oneSidedNumbness || isChild || heavyBleeding || seizure || selfHarm) complaint.region = "general";
  }

  const painKeywords = [
    "pain", "ache", "dard", "दर्द", "discomfort", "भारीपन",
    "வலி", "நோவு", "உபாதை", "నొప్పి", "బాధ", "పీడ", "ব্যথা", "যন্ত্রণা",
    "दुखणे", "दुखी", "दुख", "दुखत", "कळ", "वेदना", "ನೋವು", "ವೇದನೆ", "દુખાવો", "દુખ", "દર્દ",
    "വേദന", "അസ്വസ്ഥത", "ਦਰਦ", "ਪੀੜ", "ଯନ୍ତ୍ରଣା", "ବିନ୍ଧା", "درد", "تکلیف", "বিষ",
  ];

  if (!complaint.kind) {
  if (hasChest && (hasAny(text, painKeywords) || breathlessness)) complaint.kind = "pain";
  else if (hasHead && hasAny(text, painKeywords)) complaint.kind = "pain";
  else if ((hasEyes || hasNose || hasEars || hasTeeth || hasShoulder || hasKnee || hasHand || hasFoot || hasPelvis || hasUpperBack || hasLowerBack)
    && (hasAny(text, painKeywords) || hasAny(text, ["hurt", "दिक्कत", "problem", "परेशानी", "blur", "itch", "खुजली", "बहना", "block", "जाम", "बंद", "अरीப்பு", "ದುರದ", "തുരികെ"]))) complaint.kind = "pain";
  else if (hasAbdomen && (hasAny(text, painKeywords) || hasAny(text, [
    "खराब", "ख़राब", "kharab", "kharaab", "upset", "indigestion", "loose motion", "dast", " दस्त", "दस्त",
    "vomit", " उल्टी", "उल्टी", "வாந்தி", "பேதி", "వాంతులు", "విరేచనాలు", "বমি", "পাতলা পায়খানা",
    "जुलाब", "उलट्या", "ಭೇದಿ", "വാಂತಿ", "ઝાડા", "ઊલટી", "ഛർദ്ദി", "വയറിളക്കം", "ਉਲਟੀ", "ବାନ୍ତି", "ଝାଡ଼ା",
  ]))) complaint.kind = "vomiting";
  else if (hasLeg && hasAny(text, [
    "sprain", "moch", "मोच", "fracture", "टूट", "चोट", "injury",
    "சுளுக்கு", "முறிவு", "காயம்", "బెణుకు", "గాయం", "ভাঙা", "আঘাত",
    "लचक", "जखम", "ಉಳುಕು", "ಮೂಳೆ ಮುರಿತ", "મચકોડ", "ઈજા", "ഉളുക്ക്", "ഒടിവ്", "ਸੱਟ", "چوٹ",
  ])) complaint.kind = "injury";
  else if (hasAny(text, [
    "rash", "skin rash", "daane", "दाने", "चकत्ते", "खुजली",
    "தடிப்பு", "அரிப்பு", "దద్దుర్లు", "దురద", "ফুসকুড়ি", "চুলকানি", "रॅश",
    "पुरळ", "खाज", "ದದ್ದು", "ತುರಿಕೆ", "ચકામા", "ખંજવાળ", "ചൊറിച്ചിൽ", "തിണർപ്പ്", "ਖਾਰਸ਼", "خارش",
  ])) { complaint.region ||= "general"; complaint.kind = "rash"; }
  else if (hasAny(text, [
    "fever", "bukhar", "बुखार", "temperature", "ताप",
    "காய்ச்சல்", "జ్వరం", "জ্বর", "ಜ್ವರ", "તાવ", "പനി", "ਬੁਖ਼ਾਰ", "ਬੁਖਾਰ", "ଜ୍ୱର", "بخار", "জ্বৰ",
  ])) { complaint.region ||= "general"; complaint.kind = "fever"; }
  else if (breathlessness) { complaint.region ||= "general"; complaint.kind = "breathing"; }
  else if (oneSidedWeakness || oneSidedNumbness) { complaint.region ||= "general"; complaint.kind = "low"; }
  else if (slurredSpeech) { complaint.region ||= "general"; complaint.kind = "low"; }
  else if (heavyBleeding) { complaint.region ||= "general"; complaint.kind = "bleeding"; }
  else if (seizure) { complaint.region ||= "general"; complaint.kind = "dizziness"; }
  else if (selfHarm) { complaint.region ||= "general"; complaint.kind = "low"; }
  }

  if (breathlessness && hasChest) complaint.severity_markers.push("breathlessness");
  else if (breathlessness) complaint.severity_markers.push("difficulty-breathing");
  if (sweating && hasChest) complaint.severity_markers.push("sweating");

  if (complaint.kind === "fever" && stiffNeck && !complaint.severity_markers.includes("stiff-neck")) complaint.severity_markers.push("stiff-neck");
  if (complaint.kind === "pain" && hasHead && suddenSevereHeadache && !complaint.severity_markers.includes("sudden-severe-headache")) complaint.severity_markers.push("sudden-severe-headache");

  if (complaint.kind) {
    complaint.duration = hasAny(text, [
      "just now", "abhi", "अभी", "இப்போது", "ఇప్పుడే", "এখনই", "आत्ताच", "ಈಗಷ್ಟೇ", "હમણાં જ", "ഇപ്പോൾ", "ਹੁਣੇ", "ابھی",
    ]) ? "now"
      : hasAny(text, [
        "few days", "a few days", "3 days", "days", "kal", "yesterday", "कल", "पिछले दिन",
        "சில நாட்கள்", "కొన్ని రోజులు", "কয়েক দিন", "काही दिवस", "ಕೆಲವು ದಿನಗಳು", "થોડા દિવસ", "കുറച്ചു ദിവസങ്ങൾ", "ਕੁਝ ਦਿਨ", "چند دن",
      ]) ? "days"
        : hasAny(text, [
          "weeks", "months", "a while", "काफी समय", "काफ़ी समय",
          "நீண்ட காலம்", "చాలా కాలం", "অনেক দিন", "खूप दिवस", "ತುಂಬಾ ಸಮಯ", "ઘણા સમયથી", "ഒരുപാട് നാളായി", "ਕਾਫ਼ੀ ਸਮਾਂ", "کافی عرصہ",
        ]) ? "longer" : "today";
    complaint.severity = "no";
    complaint.parsed = true;
    complaint.unclear = [];
  }

  // --- Multi-Entity AI/NLP Extraction Layer ---
  // 1. Age extraction
  const ageMatch = text.match(/(?:age|umar|umra|aayu|vayasu)\s*(?:is|hai|:)?\s*(\d{1,3})/i)
    || text.match(/(\d{1,3})\s*(?:years?|yrs?|yr|y\.?o\.?|saal|sal|varsh)\b/i)
    || text.match(/\b(\d{1,2})\s*(?:female|male)\b/i)
    || original.match(/\b(\d{1,2})\s*([MmFf])\b/);

  if (ageMatch) {
    const num = parseInt(ageMatch[1], 10);
    if (num >= 0 && num <= 120) {
      complaint.exact_age = num;
      if (num <= 1) complaint.age_band = "baby";
      else if (num <= 12) complaint.age_band = "child";
      else if (num <= 17) complaint.age_band = "adolescent";
      else if (num <= 44) complaint.age_band = "adult";
      else if (num <= 59) complaint.age_band = "middle";
      else complaint.age_band = "older";
      if (ageMatch[2] && !complaint.gender) {
        complaint.gender = ageMatch[2].toLowerCase() === "m" ? "male" : "female";
      }
    }
  }

  // 2. Caregiver / Who-For extraction
  if (!complaint.who_for) {
    if (hasAny(text, ["father", "pitaji", "papa", "dad", "mother", "mataji", "mummy", "mom", "dada", "dadi", "nana", "nani", "chacha", "chachi", "uncle", "aunt", "amma", "appa"])) {
      complaint.who_for = "parent";
    } else if (hasAny(text, ["child", "kid", "son", "daughter", "beta", "beti", "bachha", "bachhe", "baccha", "magu", "paapaa"])) {
      complaint.who_for = "child";
    } else if (hasAny(text, ["myself", "i have", "me", "i'm", "mujhe", "mera", "meri", "mere", "for me", "nanage", "enakku"])) {
      complaint.who_for = "self";
    }
  }

  // 3. Gender extraction
  if (!complaint.gender) {
    if (hasAny(text, ["female", "mahila", "aurat", "woman", "lady", "mother", "daughter", "beti", "sister", "behan", "mataji", "pregnant", "pregnancy", "ladki", "stree"])) {
      complaint.gender = "female";
    } else if (hasAny(text, ["purush", "aadmi", "man", "gentleman", "father", "son", "beta", "brother", "bhai", "pitaji", "uncle", "ladka"]) || /\bmale\b/.test(text)) {
      complaint.gender = "male";
    }
  }

  // 4. Pre-existing Conditions extraction
  const detectedConditions = [];
  if (hasAny(text, ["diabetes", "diabetic", "sugar", "madhumeh", "मधुमेह", "metformin", "insulin"])) detectedConditions.push("diabetes");
  if (hasAny(text, ["hypertension", "high bp", "bp problem", "blood pressure", "uchh raktchap", "उच्च रक्तचाप", "telmisartan", "amlodipine"])) detectedConditions.push("hypertension");
  if (hasAny(text, ["heart patient", "heart condition", "cardiac history", "heart disease", "dil ki bimari", "दिल की बीमारी", "bypass", "stent", "angioplasty"])) detectedConditions.push("heart");
  if (hasAny(text, ["asthma", "asthmatic", "dama", "दमा", "inhaler", "respiratory problem", "respiratory condition"])) detectedConditions.push("asthma");
  if (hasAny(text, ["pregnant", "pregnancy", "garbhwati", "गर्भवती", "garbhavastha", "expecting"])) detectedConditions.push("pregnancy");
  complaint.conditions = detectedConditions;

  // 5. Patient Name extraction
  const commonStopWords = new Set(["has", "is", "have", "had", "was", "with", "suffering", "ko", "ka", "ki", "ke", "hai", "severe", "mild", "acute", "and", "or", "who", "reported"]);
  let extractedName = null;

  const prefixMatch = original.match(/(?:patient(?:\s+name)?(?:\s+is)?[:\s]+|named\s+|father\s+|mother\s+|beta\s+|beti\s+|naam\s+|for\s+)([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
  if (prefixMatch && prefixMatch[1]) {
    const parts = prefixMatch[1].trim().split(/\s+/);
    if (parts.length > 1 && commonStopWords.has(parts[1].toLowerCase())) {
      extractedName = parts[0];
    } else {
      extractedName = parts.slice(0, 2).join(" ");
    }
  }

  if (!extractedName) {
    const leadingMatch = original.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)(?=\s+(?:\d{1,2}|male|female|who|has|is|having|suffering|ke|ko|se))/i);
    if (leadingMatch && leadingMatch[1]) {
      const parts = leadingMatch[1].trim().split(/\s+/);
      if (parts.length > 1 && commonStopWords.has(parts[1].toLowerCase())) {
        extractedName = parts[0];
      } else {
        extractedName = parts.slice(0, 2).join(" ");
      }
    }
  }

  if (extractedName) {
    const exclude = ["doctor", "hospital", "patient", "emergency", "cardiology", "fever", "chest", "cough", "pain", "today", "yesterday", "severe", "mild", "myself", "someone"];
    if (!exclude.includes(extractedName.toLowerCase())) {
      complaint.patient_name = extractedName;
    }
  }

  // 6. Side / Laterality extraction
  if (hasAny(text, ["both sides", "both knees", "both ears", "both eyes", "both hands", "both legs", "both feet", "both shoulders", "both arms", "dono taraf", "dono", "दोनों तरफ", "दोनों"])) {
    complaint.side = "both";
  } else if (hasAny(text, ["left side", "left knee", "left ear", "left eye", "left hand", "left leg", "left foot", "left shoulder", "left arm", "baayan", "baayein", "baaya", "बायाँ", "बाएं"])) {
    complaint.side = "left";
  } else if (hasAny(text, ["right side", "right knee", "right ear", "right eye", "right hand", "right leg", "right foot", "right shoulder", "right arm", "daayan", "daayein", "daaya", "दायाँ", "दाएं"])) {
    complaint.side = "right";
  }

  return complaint;
}

/**
 * Real-time emergency sentinel for reactive triage intake.
 * Scans user speech or typed text on every keystroke/speech frame.
 */
export function checkRealtimeEmergency(input, language = "en") {
  const original = String(input || "").trim();
  const text = cleanText(original);
  if (!text) return { isEmergency: false };

  // RF-10: Pregnancy with Bleeding or severe pain
  const pregnancyKeywords = ["pregnant", "pregnancy", "garbhwati", "garbh", "पेट में बच्चा", "गर्भवती", "மாதவிடாய்", "గర్భవతి", "অন্তঃসত্ত্বা"];
  const bleedingKeywords = ["bleeding", "blood", "khoon", "खून", "रक्त", "రక్తం", "রক্ত"];
  if (hasAny(text, pregnancyKeywords) && hasAny(text, bleedingKeywords)) {
    return {
      isEmergency: true,
      ruleId: "RF-10",
      conditionName: "Obstetric Hemorrhage / Pregnancy Bleeding",
      title: {
        en: "Obstetric Emergency (RF-10)",
        hi: "गर्भावस्था आपातकाल / रक्तस्राव (RF-10)",
      },
      advice: {
        en: "Bleeding during pregnancy is a life-threatening obstetric emergency. Proceed immediately to 24/7 Emergency or Labour Room.",
        hi: "गर्भावस्था के दौरान रक्तस्राव एक गंभीर आपातकालीन स्थिति है। तुरंत 24/7 इमरजेंसी या लेबर रूम जाएँ।",
      },
      trigger: "Pregnancy with bleeding",
    };
  }

  // RF-01: Chest pain + (breathlessness or sweating or radiating)
  const hasChest = hasAny(text, [
    "chest", "सीने", "सीना", "seene", "sine", "छाती", "chhati",
    "நெஞ்சு", "மார்பு", "ఛాతీ", "గుండె", "বুক", "বুকে", "छातीत",
    "ಎದೆ", "ಎದೆಯಲ್ಲಿ", "છાતીમાં", "છાતી", "നെഞ്ച്", "നെഞ്ചു", "നെഞ്ചിൽ",
    "ਛਾਤੀ", "ଛାତି", "ଛାତିରେ", "سینہ", "سینے", "বুকু",
  ]);
  const hasChestPain = hasChest && (hasAny(text, [
    "pain", "ache", "dard", "दर्द", "discomfort", "भारीपन", "tightness", "pressure", "burning", "जलन",
    "வலி", "நొప్పి", "ব্যথা", "दुखणे", "ನೋವು", "દુખાવો", "വേദന", "ਦਰਦ", "ଯନ୍ତ୍ରଣା", "درد",
  ]) || hasAny(text, ["saans", "breathlessness", "shortness of breath", "sweating", "pasina"]));

  const breathlessness = hasAny(text, [
    "breathlessness", "shortness of breath", "difficulty breathing", "breathing difficulty",
    "saans lene mein bohot dikkat", "saans lene mein bahut dikkat", "saans lene me bohot dikkat", "saans lene me bahut dikkat",
    "saans lene mein dikkat", "saans lene me dikkat", "saans ki dikkat", "सांस लेने में दिक्कत", "साँस लेने में दिक्कत", "saans phool", "saans phoolna", "सांस फूल",
    "மூச்சு திணறல்", "மூச்சுத் திணறல்", "శ్వాస తీసుకోవడంలో ఇబ్బంది", "শ্বাসকষ্ট",
    "श्वास घेण्यास त्रास", "ಉಸಿರಾಟದ ತೊಂದರೆ", "શ્વાસ લેવામાં તકલીફ", "ശ്വാസതടസ്സം",
    "ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ਼", "ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ", "سانس لینے میں دشواری",
  ]);
  const sweating = hasAny(text, [
    "sweating", "sweat", "pasina", "पसीना", "வியர்வை", "చెమట", "ঘাম",
    "घाम", "ಬೆವರು", "પરસેવો", "വിയർപ്പ്", "ਮੁੜ੍ਹਕਾ", "ଝାଳ", "پسینہ",
  ]);

  if (hasChestPain && (breathlessness || sweating)) {
    return {
      isEmergency: true,
      ruleId: "RF-01",
      conditionName: "Chest pain with breathlessness or sweating",
      title: {
        en: "Potential Cardiac Emergency (RF-01)",
        hi: "गंभीर हृदय आपातकाल (RF-01)",
      },
      advice: {
        en: "Chest pain accompanied by breathing difficulty or sweating requires immediate Emergency evaluation. Do not wait for a routine OPD appointment.",
        hi: "साँस फूलने या पसीने के साथ सीने का दर्द तत्काल इमरजेंसी देखभाल की मांग करता है। सामान्य ओपीडी की प्रतीक्षा न करें।",
      },
      trigger: breathlessness ? "Chest pain with breathlessness" : "Chest pain with sweating",
    };
  }

  // RF-02: One-sided weakness, numbness, or slurred speech (Acute Stroke)
  const oneSidedWeakness = hasAny(text, [
    "weakness on one side", "one-sided weakness", "one sided weakness", "ek taraf kamzori",
    "ek taraf ki kamzori", "एक तरफ कमज़ोरी", "एक तरफ़ कमज़ोरी", "एक ओर कमज़ोरी", "lakwa", "लकवा",
    "ஒரு பக்க பலவீனம்", "ఒక వైపు బలహీనత", "এক পাশে দুর্বলতা", "एका बाजूला अशक्तपणा",
    "ಒಂದು ಬದಿಯ ದೌರ್ಬಲ್ಯ", "એક બાજુ નબળાઈ", "ഒരു വശത്ത് തളർച്ച", "ਇੱਕ ਪਾਸੇ ਕਮਜ਼ੋਰੀ", "ایک طرف کمزوری",
  ]);
  const oneSidedNumbness = hasAny(text, [
    "numbness on one side", "one-sided numbness", "one sided numbness", "ek taraf sunn",
    "एक तरफ सुन्न", "एक तरफ़ सुन्न", "ஒரு பக்கம் மரத்து", "ఒక వైపు మొద్దుబారడం",
    "এক পাশ অবশ", "एका बाजूला बधिरता", "એક તરફ બહેરી", "ഒരു വശം മരവിപ്പ്", "ਇੱਕ ਪਾਸਾ ਸੁੰਨ", "ایک طرف سن",
  ]);
  const slurredSpeech = hasAny(text, [
    "slurred speech", "speech is slurred", "बोली लड़खड़ा", "बोली लड़खड़ा", "boli ladkhada",
    "பேச்சு குழறுதல்", "మాట ముద్దవడం", "কথা জড়িয়ে যাওয়া", "बोलताना जीभ अडखळणे",
    "ಮಾತು ತಡವರುವುದು", "જીભ લથડવી", "സംസാരിക്കാൻ കുഴയുക", "ਬੋਲਣ ਵਿੱਚ ਲੜਖੜਾਹਟ", "زبان لڑکھڑانا",
  ]);

  if (oneSidedWeakness || oneSidedNumbness || slurredSpeech) {
    return {
      isEmergency: true,
      ruleId: "RF-02",
      conditionName: "Stroke / Neurological Red Flag",
      title: {
        en: "Potential Acute Stroke (RF-02)",
        hi: "स्ट्रोक / पक्षाघात आपातकाल (RF-02)",
      },
      advice: {
        en: "Sudden one-sided weakness, numbness, or speech difficulty is a critical neurological emergency. Reach Emergency immediately.",
        hi: "शरीर के एक हिस्से में अचानक कमज़ोरी, सुन्नपन या बोली लड़खड़ाना न्यूरोलॉजिकल आपातकाल है। तुरंत इमरजेंसी जाएँ।",
      },
      trigger: oneSidedWeakness ? "One-sided weakness" : (oneSidedNumbness ? "One-sided numbness" : "Slurred speech"),
    };
  }

  // RF-03: Baby not feeding
  const isBaby = hasAny(text, ["baby", "infant", "newborn", "नन्हा", "शिशु", "छोटे बच्चे", "bachhe", "bacche", "bachha", "baccha", "बच्चा", "बच्चे", "குழந்தை", "ശിశువు", "শিশু", "बाळ", "ಮಗು", "શિશુ", "കുഞ്ഞ്", "ਨਿਆਣਾ", "ଛୁଆ"]);
  const notFeeding = hasAny(text, [
    "not feeding", "not drinking milk", "won't feed", "doesn't feed", "refusing milk", "refusing feed",
    "doodh nahi pee", "doodh nahi pi", "doodh nahin pee", "doodh nahin pi", "doodh na peena",
    "दूध नहीं पी", "दूध नहीं पी रहा", "दूध नहीं पी रही", "दूध न पीना",
    "பால் குடிக்கவில்லை", "పాలు తాగడం లేదు", "দুধ খাচ্ছে না", "दूध पीत नाही", "ಹಾಲು ಕುಡಿಯುತ್ತಿಲ್ಲ", "દૂધ પીતું નથી", "പാല് കുടിക്കുന്നില്ല", "ਦੁੱਧ ਨਹੀਂ ਪੀ ਰਿਹਾ", "دودھ نہیں پی رہا",
  ]);
  if (isBaby && notFeeding) {
    return {
      isEmergency: true,
      ruleId: "RF-03",
      conditionName: "Critical Paediatric Distress",
      title: {
        en: "Critical Infant Emergency (RF-03)",
        hi: "शिशु आपातकालीन स्थिति (RF-03)",
      },
      advice: {
        en: "An infant who refuses feeding or is unable to drink milk requires immediate emergency paediatric medical evaluation.",
        hi: "शिशु का दूध न पीना या सुस्त होना तत्काल आपातकालीन बाल रोग जाँच की मांग करता है।",
      },
      trigger: "Baby not feeding",
    };
  }

  // RF-04: Heavy bleeding
  const heavyBleeding = hasAny(text, [
    "heavy bleeding", "bleeding heavily", "uncontrolled bleeding", "bleeding won't stop", "bleeding will not stop",
    "bleeding not stopping", "बहुत ज्यादा खून", "बहुत ज़्यादा खून", "खून बहुत बह", "खून रुक नहीं रहा", "खून नहीं रुक", "khoon ruk nahi raha", "khoon nahi ruk", "khoon bohot", "khoon bahut", "khoon ki ulti", "vomiting blood",
    "அதிக இரத்தப்போக்கு", "తీవ్ర రక్తస్రావం", "অতিরিক্ত রক্তপাত", "जास्त रक्तस्त्राव", "ಅತಿಯಾದ ರಕ್ತಸ್ರಾವ", "ભારે રક્તસ્ત્રાવ", "അമിത രക്തസ്രാവം", "ਬਹੁਤ ਜ਼ਿਆਦਾ ਖ਼ੂਨ", "شدید خون بہنا",
  ]);
  if (heavyBleeding) {
    return {
      isEmergency: true,
      ruleId: "RF-04",
      conditionName: "Haemorrhage / Uncontrolled Bleeding",
      title: {
        en: "Severe Haemorrhage (RF-04)",
        hi: "अत्यधिक रक्तस्राव (RF-04)",
      },
      advice: {
        en: "Uncontrolled or heavy bleeding requires immediate emergency surgical/trauma care to prevent shock.",
        hi: "अनियंत्रित या बहुत ज़्यादा खून बहने पर तुरंत इमरजेंसी ट्रॉमा सेंटर जाएँ।",
      },
      trigger: "Heavy uncontrolled bleeding",
    };
  }

  // RF-05: Fever with stiff neck
  const stiffNeck = hasAny(text, [
    "stiff neck", "neck is stiff", "gardan akad", "गर्दन अकड़", "गर्दन अकड़",
    "கழுத்து விறைப்பு", "మెడ పట్టేయడం", "ঘাড় শক্ত", "मान ताठणे", "ಕತ್ತು ಬಿಗಿತ", "ગરદન અકડાઈ જવી", "കഴുത്ത് അനക്കാൻ പറ്റാത്ത", "ਧੌਣ ਅਕੜਨਾ", "گردن اکڑ جانا",
  ]);
  const hasFever = hasAny(text, [
    "fever", "bukhar", "बुखार", "temperature", "ताप", "காய்ச்சல்", "జ్వరం", "জ্বর", "ಜ್ವರ", "તાવ", "പനി", "ਬੁਖ਼ਾਰ", "ਬੁਖਾਰ", "ଜ୍ୱର", "بخار",
  ]);
  if (stiffNeck && (hasFever || hasAny(text, ["headache", "vomiting", "सिरदर्द", "उल्टी"]))) {
    return {
      isEmergency: true,
      ruleId: "RF-05",
      conditionName: "Possible Meningitis / Neurological Infection",
      title: {
        en: "Possible Meningitis Alert (RF-05)",
        hi: "मेनिन्जाइटिस / दिमागी बुखार अलर्ट (RF-05)",
      },
      advice: {
        en: "Fever combined with neck stiffness can indicate acute meningitis or severe central nervous system infection.",
        hi: "बुखार के साथ गर्दन में अकड़न गंभीर दिमागी संक्रमण का संकेत हो सकती है। तुरंत इमरजेंसी जाएँ।",
      },
      trigger: "Fever with neck stiffness",
    };
  }

  // RF-06: Sudden severe headache
  const suddenSevereHeadache = hasAny(text, [
    "sudden severe headache", "worst headache", "thunderclap headache",
    "achanak bohot tez sar dard", "achanak bahut tez sar dard", "achanak tez sar dard", "achanak tez sir dard",
    "अचानक बहुत तेज सिरदर्द", "अचानक बहुत तेज़ सिरदर्द",
    "திடீர் கடுமையான தலைவலி", "హఠాత్తుగా తీవ్రమైన తలనొప్పి", "হঠাৎ প্রচণ্ড মাথা ব্যথা", "अचानक अतिशय तीव्र डोकेदुखी", "ಹಠಾತ್ ತೀವ್ರ ತಲೆನೋವು", "અચાનક ખૂબ જ તીવ્ર માથાનો દુખાવો", "പെട്ടെന്ന് ഉണ്ടായ കഠിനമായ തലവേദന", "ਅਚਾਨਕ ਬਹੁਤ ਤੇਜ਼ ਸਿਰ ਦਰਦ", "اچانک شدید سر درد",
  ]);
  if (suddenSevereHeadache) {
    return {
      isEmergency: true,
      ruleId: "RF-06",
      conditionName: "Thunderclap Headache / Vascular Event",
      title: {
        en: "Thunderclap Headache (RF-06)",
        hi: "अति-तीव्र सिरदर्द (RF-06)",
      },
      advice: {
        en: "A sudden, explosive 'worst headache of life' requires an immediate emergency brain scan (CT/MRI).",
        hi: "अचानक शुरू हुआ असहनीय सिरदर्द मस्तिष्क संबंधी आपातकाल हो सकता है। तुरंत इमरजेंसी पहुँचें।",
      },
      trigger: "Sudden severe headache",
    };
  }

  // RF-07: Difficulty breathing / acute breathlessness
  if (breathlessness) {
    return {
      isEmergency: true,
      ruleId: "RF-07",
      conditionName: "Acute Respiratory Distress",
      title: {
        en: "Acute Respiratory Distress (RF-07)",
        hi: "साँस लेने में गंभीर संकट (RF-07)",
      },
      advice: {
        en: "Severe difficulty breathing or gasping requires immediate emergency oxygenation and clinical stabilization.",
        hi: "साँस लेने में गंभीर तकलीफ़ होने पर तुरंत इमरजेंसी विभाग जाएँ और ऑक्सीजन सहायता लें।",
      },
      trigger: "Difficulty breathing",
    };
  }

  // RF-08: Seizure / Fits / Loss of consciousness
  const seizure = hasAny(text, [
    "seizure", "fit", " दौरा", "दौरा", "mirgi ka daura", "mirgi", "behosh", "unconscious", "loss of consciousness", "chakkar aake behosh",
    "வலிப்பு", "ఫిట్స్", "খিঁচুনি", "झटके येणे", "ಫಿಟ್ಸ್", "ખેંચ", "അപസ്മാരം", "ਦੌਰੇ", "تشنج",
  ]);
  if (seizure) {
    return {
      isEmergency: true,
      ruleId: "RF-08",
      conditionName: "Seizures / Unconsciousness",
      title: {
        en: "Seizure / Convulsion Alert (RF-08)",
        hi: "दौरा / बेहोशी आपातकाल (RF-08)",
      },
      advice: {
        en: "Active seizures, fits, or sudden loss of consciousness require emergency airway management and neuro-resuscitation.",
        hi: "दौरा पड़ना या अचानक बेहोश होना तत्काल आपातकालीन चिकित्सा सहायता की मांग करता है।",
      },
      trigger: "Seizure / loss of consciousness",
    };
  }

  // RF-09: Self-harm / psychiatric crisis
  const selfHarm = hasAny(text, [
    "self-harm", "self harm", "harm myself", "suicide", "खुद को नुकसान", "आत्महत्या", "jaan dena",
    "தற்கொலை", "ఆత్మహత్య", "আত্মহত্যা", "आत्महत्या", "ಆತ್ಮಹತ್ಯೆ", "આત્મહત્યા", "ആത്മഹത്യ", "ਖ਼ੁਦਕੁਸ਼ੀ", "خود کشی",
  ]);
  if (selfHarm) {
    return {
      isEmergency: true,
      ruleId: "RF-09",
      conditionName: "Crisis Support / Psychiatric Emergency",
      title: {
        en: "Immediate Crisis Support (RF-09)",
        hi: "तत्काल संकट सहायता (RF-09)",
      },
      advice: {
        en: "Immediate crisis evaluation and emergency mental health support is required. You are not alone; reach out now.",
        hi: "तत्काल आपातकालीन मानसिक स्वास्थ्य सहायता उपलब्ध है। कृपया तुरंत इमरजेंसी सहायता लें।",
      },
      trigger: "Thoughts of self-harm",
    };
  }

  return { isEmergency: false };
}

const readField = (complaint, field) => complaint?.[field];

function matchesCriterion(complaint, criterion) {
  const value = readField(complaint, criterion.field);
  if (Object.prototype.hasOwnProperty.call(criterion, "equals")) return value === criterion.equals;
  if (criterion.in) return criterion.in.includes(value);
  if (criterion.includes) return Array.isArray(value) && value.includes(criterion.includes);
  if (criterion.anyIncludes) return Array.isArray(value) && criterion.anyIncludes.some((entry) => value.includes(entry));
  return false;
}

function matchesRule(complaint, matcher = {}) {
  const all = matcher.all || [];
  const any = matcher.any || [];
  return all.every((criterion) => matchesCriterion(complaint, criterion))
    && (!any.length || any.some((criterion) => matchesCriterion(complaint, criterion)));
}

function resultFor(entry) {
  return {
    department: entry.department,
    urgency: entry.severity,
    rule_id: entry.id,
    reason: entry.reason,
  };
}

/**
 * Pure routing boundary. It accepts structured complaint data and never reads
 * the DOM, calls a model, or performs network I/O.
 */
export function routeComplaint(complaint, rules = ROUTING_RULES) {
  const redFlag = rules.red_flags.find((entry) => matchesRule(complaint, entry.matches));
  if (redFlag) return resultFor(redFlag);

  const ordinaryRule = rules.rules.find((entry) => matchesRule(complaint, entry.matches));
  return resultFor(ordinaryRule || rules.rules[rules.rules.length - 1]);
}

export { matchesRule };
