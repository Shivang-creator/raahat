// Raahat's hand-written routing table.
// This is data only: the evaluator in routing.js is deliberately generic.
export const ROUTING_RULES = Object.freeze({
  version: "1.0",
  rules: [
    {
      id: "R-01",
      matches: { all: [{ field: "age_band", in: ["baby", "child", "adolescent"] }] },
      department: "Paediatrics",
      reason: {
        en: "For a child, Paediatrics is the right first counter.",
        hi: "बच्चे के लिए सबसे पहले बाल रोग विभाग सही काउंटर है।",
      },
      severity: "routine",
    },
    {
      id: "R-11",
      matches: { all: [{ field: "region", equals: "eyes" }] },
      department: "Ophthalmology",
      reason: {
        en: "Eye or vision concerns start at Ophthalmology for an in-person assessment.",
        hi: "आँखों या नज़र की परेशानी के लिए आमने-सामने जाँच हेतु नेत्र रोग विभाग से शुरू करें।",
      },
      severity: "routine",
    },
    {
      id: "R-12",
      matches: { all: [{ field: "region", in: ["ears", "nose"] }] },
      department: "ENT",
      reason: {
        en: "Ear, nose or throat concerns start at ENT for an in-person assessment.",
        hi: "कान, नाक या गले की परेशानी के लिए आमने-सामने जाँच हेतु ईएनटी से शुरू करें।",
      },
      severity: "routine",
    },
    {
      id: "R-13",
      matches: { all: [{ field: "region", equals: "teeth" }] },
      department: "Dental",
      reason: {
        en: "Teeth, mouth or jaw concerns start at the Dental counter.",
        hi: "दाँत, मुँह या जबड़े की परेशानी के लिए डेंटल काउंटर से शुरू करें।",
      },
      severity: "routine",
    },
    {
      id: "R-14",
      matches: { all: [{ field: "region", in: ["shoulder", "knee", "hand", "foot", "upper-back", "lower-back"] }] },
      department: "Orthopaedics",
      reason: {
        en: "This joint, limb or spine concern starts at Orthopaedics.",
        hi: "इस जोड़, हाथ-पैर या रीढ़ की परेशानी के लिए ऑर्थोपेडिक्स से शुरू करें।",
      },
      severity: "routine",
    },
    {
      id: "R-15",
      matches: { all: [{ field: "region", equals: "pelvis" }] },
      department: "Orthopaedics",
      reason: {
        en: "Pelvis or hip concerns start at Orthopaedics for an in-person assessment.",
        hi: "कूल्हे या पेल्विस की परेशानी के लिए आमने-सामने जाँच हेतु ऑर्थोपेडिक्स से शुरू करें।",
      },
      severity: "routine",
    },
    {
      id: "R-16",
      matches: { any: [{ field: "kind", in: ["pregnancy", "period-pain", "gynaecology", "antenatal"] }, { field: "region", in: ["pelvis-female", "uterus"] }] },
      department: "Obstetrics & Gynaecology",
      reason: {
        en: "Pregnancy, menstrual or female reproductive health concerns start at Obstetrics & Gynaecology.",
        hi: "गर्भावस्था, माहवारी या महिला स्वास्थ्य संबंधी परेशानी के लिए स्त्री एवं प्रसूति रोग विभाग से शुरू करें।",
      },
      severity: "routine",
    },
    {
      id: "R-17",
      matches: { any: [{ field: "kind", in: ["urinary", "burning-urination", "kidney-stone", "kidney-pain"] }, { field: "region", in: ["urinary", "groin-urinary"] }] },
      department: "Urology",
      reason: {
        en: "Urinary difficulty, burning micturition, or kidney stone pain starts at Urology / Nephrology.",
        hi: "पेशाब में जलन, रुकावट या गुर्दे/पथरी के दर्द के लिए यूरोलॉजी / नेफ्रोलॉजी विभाग से शुरू करें।",
      },
      severity: "routine",
    },
    {
      id: "R-18",
      matches: { any: [{ field: "kind", in: ["chronic-cough", "asthma-bronchitis", "tuberculosis-screen"] }] },
      department: "Pulmonology",
      reason: {
        en: "Persistent cough, wheezing, or chronic respiratory concerns start at Pulmonology (Chest OPD).",
        hi: "लगातार खांसी, सांस की तकलीफ या पुरानी सीने की बीमारी के लिए पल्मोनोलॉजी (चेस्ट ओपीडी) से शुरू करें।",
      },
      severity: "routine",
    },
    {
      id: "R-19",
      matches: { any: [{ field: "kind", in: ["mental-health", "insomnia", "anxiety", "depression"] }] },
      department: "Psychiatry",
      reason: {
        en: "Mental well-being, severe anxiety, persistent insomnia or mood concerns start at Psychiatry OPD.",
        hi: "मानसिक स्वास्थ्य, अनिद्रा, अत्यधिक घबराहट या तनाव के लिए मनोचिकित्सा विभाग से शुरू करें।",
      },
      severity: "routine",
    },
    {
      id: "R-02",
      matches: { all: [{ field: "kind", equals: "pain" }, { field: "region", equals: "chest" }] },
      department: "Cardiology",
      reason: {
        en: "Chest pain starts at Cardiology, where the team can guide the next step.",
        hi: "सीने का दर्द कार्डियोलॉजी से शुरू होता है; टीम अगला कदम बताएगी।",
      },
      severity: "routine",
    },
    {
      id: "R-03",
      matches: { all: [{ field: "kind", equals: "pain" }, { field: "region", equals: "head" }] },
      department: "Neurology",
      reason: {
        en: "Head pain starts at Neurology for an in-person assessment.",
        hi: "सिर के दर्द के लिए आमने-सामने जाँच हेतु न्यूरोलॉजी से शुरू करें।",
      },
      severity: "routine",
    },
    {
      id: "R-04",
      matches: { all: [{ field: "kind", in: ["vomiting", "pain"] }, { field: "region", in: ["upper-abdomen", "lower-abdomen"] }] },
      department: "Gastroenterology",
      reason: {
        en: "Stomach trouble starts at Gastroenterology, where they can guide you.",
        hi: "पेट की परेशानी के लिए गैस्ट्रोएंटेरोलॉजी से शुरू करें; वे मार्गदर्शन करेंगे।",
      },
      severity: "routine",
    },
    {
      id: "R-05",
      matches: { all: [{ field: "kind", equals: "injury" }, { field: "region", in: ["arm", "hand", "leg", "foot"] }] },
      department: "Orthopaedics",
      reason: {
        en: "An injury to a limb starts at Orthopaedics.",
        hi: "हाथ या पैर की चोट के लिए ऑर्थोपेडिक्स से शुरू करें।",
      },
      severity: "routine",
    },
    {
      id: "R-06",
      matches: { all: [{ field: "kind", equals: "rash" }] },
      department: "Dermatology",
      reason: {
        en: "A rash starts at Dermatology for an in-person look.",
        hi: "दाने के लिए आमने-सामने जाँच हेतु त्वचा रोग विभाग से शुरू करें।",
      },
      severity: "routine",
    },
    {
      id: "R-07",
      matches: { all: [{ field: "kind", equals: "pain" }, { field: "region", equals: "face" }] },
      department: "Dental",
      reason: {
        en: "Face or jaw pain starts at the Dental counter.",
        hi: "चेहरे या जबड़े के दर्द के लिए डेंटल काउंटर से शुरू करें।",
      },
      severity: "routine",
    },
    {
      id: "R-08",
      matches: { all: [{ field: "kind", in: ["fever", "low", "swelling"] }] },
      department: "General Medicine",
      reason: {
        en: "General Medicine is the first counter for this kind of trouble.",
        hi: "इस तरह की परेशानी के लिए जनरल मेडिसिन पहला काउंटर है।",
      },
      severity: "routine",
    },
    {
      id: "R-09",
      matches: { all: [{ field: "kind", equals: "pain" }, { field: "region", equals: "general" }] },
      department: "General Medicine",
      reason: {
        en: "With no single place selected, General Medicine can guide the next step.",
        hi: "एक जगह तय न होने पर जनरल मेडिसिन अगला कदम बताएगा।",
      },
      severity: "routine",
    },
    {
      id: "R-10",
      matches: { all: [{ field: "parsed", equals: true }] },
      department: "General Medicine",
      reason: {
        en: "General Medicine is a safe starting counter for these details.",
        hi: "इन जानकारियों के लिए जनरल मेडिसिन एक शुरुआती काउंटर है।",
      },
      severity: "routine",
    },
    {
      id: "UNPARSED-01",
      matches: { all: [{ field: "parsed", equals: false }] },
      department: "Choose a department yourself",
      reason: {
        en: "I could not yet understand those words. You can choose a department or talk to a person.",
        hi: "इन शब्दों को अभी समझ नहीं पाए। आप विभाग चुन सकते हैं या किसी व्यक्ति से बात कर सकते हैं।",
      },
      severity: "routine",
    },
  ],
  red_flags: [
    {
      id: "RF-01",
      matches: { all: [{ field: "kind", equals: "pain" }, { field: "region", equals: "chest" }, { field: "severity_markers", anyIncludes: ["breathlessness", "sweating"] }] },
      department: "Emergency",
      reason: { en: "Chest pain with breathlessness or sweating needs Emergency now.", hi: "साँस फूलने या पसीना आने के साथ सीने का दर्द हो तो अभी इमरजेंसी जाएँ।" },
      severity: "emergency",
    },
    {
      id: "RF-02",
      matches: { all: [{ field: "severity_markers", anyIncludes: ["one-sided-weakness", "one-sided-numbness", "slurred-speech"] }] },
      department: "Emergency",
      reason: { en: "One-sided weakness, numbness, or slurred speech needs Emergency now.", hi: "एक तरफ़ कमज़ोरी, सुन्नपन या लड़खड़ाती बोली हो तो अभी इमरजेंसी जाएँ।" },
      severity: "emergency",
    },
    {
      id: "RF-03",
      matches: { all: [{ field: "age_band", equals: "baby" }, { field: "severity_markers", includes: "not-feeding" }] },
      department: "Emergency",
      reason: { en: "A baby under two months who is not feeding needs Emergency now.", hi: "दो महीने से छोटे बच्चे का दूध न पीना हो तो अभी इमरजेंसी जाएँ।" },
      severity: "emergency",
    },
    {
      id: "RF-04",
      matches: { all: [{ field: "severity_markers", includes: "heavy-bleeding" }] },
      department: "Emergency",
      reason: { en: "Heavy bleeding needs Emergency now.", hi: "बहुत ज़्यादा खून बहने पर अभी इमरजेंसी जाएँ।" },
      severity: "emergency",
    },
    {
      id: "RF-05",
      matches: { all: [{ field: "kind", equals: "fever" }, { field: "severity_markers", includes: "stiff-neck" }] },
      department: "Emergency",
      reason: { en: "Fever with a stiff neck needs Emergency now.", hi: "बुखार के साथ गर्दन अकड़ने पर अभी इमरजेंसी जाएँ।" },
      severity: "emergency",
    },
    {
      id: "RF-06",
      matches: { all: [{ field: "kind", equals: "pain" }, { field: "region", equals: "head" }, { field: "severity_markers", includes: "sudden-severe-headache" }] },
      department: "Emergency",
      reason: { en: "A sudden severe headache needs Emergency now.", hi: "अचानक बहुत तेज़ सिरदर्द हो तो अभी इमरजेंसी जाएँ।" },
      severity: "emergency",
    },
    {
      id: "RF-07",
      matches: { any: [{ field: "kind", equals: "breathing" }, { field: "severity_markers", includes: "difficulty-breathing" }] },
      department: "Emergency",
      reason: { en: "Difficulty breathing needs Emergency now.", hi: "साँस लेने में दिक्कत हो तो अभी इमरजेंसी जाएँ।" },
      severity: "emergency",
    },
    {
      id: "RF-08",
      matches: { all: [{ field: "severity_markers", includes: "seizure" }] },
      department: "Emergency",
      reason: { en: "A seizure needs Emergency now.", hi: "दौरा पड़ने पर अभी इमरजेंसी जाएँ।" },
      severity: "emergency",
    },
    {
      id: "RF-09",
      matches: { all: [{ field: "severity_markers", includes: "self-harm-thoughts" }] },
      department: "Emergency",
      reason: { en: "Thoughts of self-harm need Emergency support now.", hi: "खुद को नुकसान पहुँचाने के विचार आएँ तो अभी इमरजेंसी सहायता लें।" },
      severity: "emergency",
    },
    {
      id: "RF-10",
      matches: { any: [{ field: "severity_markers", anyIncludes: ["pregnancy-bleeding", "severe-pelvic-pain-pregnancy"] }] },
      department: "Emergency",
      reason: { en: "Bleeding during pregnancy or acute severe pelvic pain requires 24/7 Emergency immediately.", hi: "गर्भावस्था में रक्तस्राव या अचानक असहनीय पेल्विक दर्द होने पर तुरंत 24/7 इमरजेंसी / लेबर रूम जाएँ।" },
      severity: "emergency",
    },
  ],
});
