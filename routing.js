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
    kind: null,
    duration: null,
    severity: null,
    age_band: null,
    who_for: null,
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
  const isChild = isBaby || hasAny(text, [
    "child", "kid", "बच्चे", "बच्चा", "बच्ची", "சிறுவன்", "சிறுமி", "పిల్లలు", "పిల్లాడు",
    "খোকা", "খুকি", "लहान मूल", "ಹುಡುಗ", "બાળક", "കുട്ടി", "ਬੱਚਾ", "ପିଲା", "بچہ",
  ]);
  if (isBaby) complaint.age_band = "baby";
  else if (isChild) complaint.age_band = "child";
  if (isChild) complaint.who_for = "child";

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
    "penis", "vagina", "vulva", "prostate", "inguinal", "urine", "urinary",
    "जननांग", "गुप्तांग", "अंडकोष", "मूत्र", "पेशाब", "माहवारी", "प्रजनन", "हर्निया", "hernia",
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

  const painKeywords = [
    "pain", "ache", "dard", "दर्द", "discomfort", "भारीपन",
    "வலி", "நோவு", "உபாதை", "నొప్పి", "బాధ", "పీడ", "ব্যথা", "যন্ত্রণা",
    "दुखणे", "दुखी", "दुख", "दुखत", "कळ", "वेदना", "ನೋವು", "ವೇದನೆ", "દુખાવો", "દુખ", "દર્દ",
    "വേദന", "അസ്വസ്ഥത", "ਦਰਦ", "ਪੀੜ", "ଯନ୍ତ୍ରଣା", "ବିନ୍ଧା", "درد", "تکلیف", "বিষ",
  ];

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
  return complaint;
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
