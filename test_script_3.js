import { parseFreeTextComplaint, routeComplaint, checkRealtimeEmergency } from "./routing.js";
      import { LOCALITIES, HOSPITAL_FACT_CHECKED_ON, hospitalsForDepartment, PAN_INDIA_HOSPITALS, INDIAN_STATES, COUNTERFACTUAL_METRICS, panIndiaHospitalsForDepartment, hospitalsByState, haversineDistanceKm, autoSelectNearestHospital, INDIAN_DISTRICTS } from "./hospital-data.js";
      import { createBodyMap3D, BILATERAL_REGIONS, REGION_LABELS } from "./body-map-3d.js?v=20260908";
      import { createInitialSession, handleWhatsAppMessage } from "./whatsapp-bot.js";
      import { createInitialIvrSession, handleIvrTurn, SUPPORTED_DIALECTS, normalizeDialectPhrasing } from "./ivr-engine.js";

      const copy = {
        en: {
          landingKicker: "A calmer front door to public hospitals", landingTitle: "Government Hospital Appointments, Without the Confusion.", landingSubtitle: "ORS asks which department you need. A sick person only knows where it hurts. Tell us what feels wrong in your own words, voice, or tap the interactive 3D body map. We guide you to the right OPD counter with honest queue wait times.", modelDisclosure: "Your words are evaluated securely inside this browser to guide you to the right counter. Nothing is sent to a server.", startTriage: "Start Triage", learnMore: "See how it works", privacyBadge: "100% Client-Side Privacy", noIdBadge: "No Aadhaar/OTP Required to Explore", accessBadge: "Accessible for Non-Literate Citizens", quickStartTitle: "Start with what you know", quickStartNote: "No account. No department guessing. Try a sample or type one sentence.", entryRouteLabel: "How would you like to describe it?", entrySpeak: "Speak", entryType: "Type", entryMap: "Body map", landingPlaceholder: "e.g. chest pain, since this morning", exampleBreathing: "chest pain + breathlessness", continueFromCard: "Continue to read-back", whyLink: "Why Raahat?", orsLink: "ORS vs Raahat", faqLink: "FAQs", profileNav: "My Profile", profileShort: "Profile", footerDesc: "A citizen-first triage front door for Indian government hospitals. Helping citizens reach the right OPD counter through native voice, regional languages, and interactive 3D body mapping.", whyTitle: "A little more dignity at the counter.", whyNote: "Raahat starts with the citizen's words, not a medical vocabulary test. The person stays in control before anything is routed.", journeyOneTitle: "Describe in your voice or tap the map", journeyOneNote: "Speak, type, or use a flat body map. Every route creates the same reviewable complaint.", journeyTwoTitle: "Verified hospital & honest queue wait", journeyTwoNote: "See public hospital facts, then see simulated token throughput and when people are usually seen.", journeyThreeTitle: "Print specimen slip with citizen rights", journeyThreeNote: "A clearly marked mock slip keeps the next step legible and carries a grievance route.", comparisonTitle: "How Raahat rethinks ORS", comparisonNote: "ORS is a useful appointment system. Raahat addresses the moment before it: when a citizen does not know the right counter.", comparisonQuestion: "The front door question", orsEra: "2015 · NIC digitised counter", raahatEra: "2026 · citizen-first triage", comparisonDepartment: "Finding a department", orsDepartment: "Department guessing", raahatDepartment: "Start with where it hurts, not a department name", comparisonWait: "Knowing the real wait", orsWait: "Slot time without a seen-time estimate", raahatWait: "Estimated seen-time from slot + simulated throughput", comparisonAuth: "Getting started", orsAuth: "Front-door distorted CAPTCHA", raahatAuth: "Late-stage 1-tap Auth , only when making a specimen slip", comparisonAccess: "Describing the problem", orsAccess: "Text Forms", raahatAccess: "2D Visual Body Map + speak + type", networkTitle: "Delhi hospital network live status", networkNote: "Hospital names, addresses and departments are public facts. Availability and token throughput are simulated for this prototype.", faqTitle: "Questions citizens and judges ask", faqNote: "Plain answers about safety, access, privacy and what this prototype can really do.", faqSafetyQ: "Is this triage safe?", faqSafetyA: "Raahat does not diagnose. Code applies a small published rule file after you see and confirm the complaint. When a red flag is present, one flag is enough to route to Emergency.", faqRedFlagQ: "What happens when there is an Emergency red flag?", faqRedFlagA: "The result says to go to Emergency now and not book an appointment. The rule ID is shown, and the nearest simulated emergency-capable hospital in your chosen locality is displayed.", faqAccessQ: "Can someone who cannot read use it?", faqAccessA: "Yes. Complaint entry has three equal routes: speak, type, or tap the labelled 2D body map. Large buttons, keyboard focus and screen-reader labels are built into the flow.", faqPrivacyQ: "What happens to my data?", faqPrivacyA: "This prototype keeps the complaint in the browser for this session and never stores it server-side. Typed words are sent to no service in the body-map route; typed words stay in this browser for this session.", faqWaitQ: "How is the wait time calculated?", faqWaitA: "It is simulated as slot start plus a simulated wait. Hospitals are sorted by estimated seen-time, then travel time, then name. It is not live queue data.", faqOrsQ: "How is Raahat different from ORS?", faqOrsA: "ORS begins by asking you to choose a hospital and department. Raahat helps a citizen structure their own words first, then shows an honest simulated queue view. It does not connect to ORS.", faqAbdmQ: "Will this connect to ABDM?", faqAbdmA: "No. ABDM, Aadhaar, ABHA, UHID, OTP and government systems are outside this prototype. Any future integration would need explicit consent, security review and a real public-service partnership.", qrTitle: "Sample QR container", qrNote: "This pattern is decorative. It does not open a real appointment.", emergencyHospitalTitle: "Nearest Emergency-capable hospital in your chosen locality", emergencyHospitalNote: "Go now. This hospital fact is verified; travel is simulated.",
          eyebrow: "A simpler way to reach the right OPD counter", title: "What's wrong?",
          note: "Tell us in your own words. You can speak, type, or point to the body map.",
          bookingFor: "Booking for:", myself: "Myself", someoneElse: "Someone else", whoLabel: "Who is it for?",
          parent: "My parent", child: "My child", someoneElseShort: "Someone else", ageLabel: "Age band",
          baby: "Baby", childAge: "Child", adult: "Adult", olderAdult: "Older adult", complaintLabel: "What is bothering you?",
          placeholder: "seene mein dard, kal raat se", inputHelp: "Your words stay in this browser for this session.",
          exampleChest: "chest pain", exampleFever: "fever", exampleWeakness: "weakness on one side", continue: "Continue",
          bodyMapButton: "Point at the body map", captured: "Your words are ready for the next step. Nothing has been sent or booked.", needHelp: "Need a person?",
          backToQuestion: "← Back", mapEyebrow: "No reading needed", mapTitle: "Point to where it hurts",
          mapNote: "Tap the place that feels wrong.", mapWordsLabel: "Your words:", browserProcessing: "This body map stays in your browser. Nothing is sent to a server.", noLocationTitle: "Nothing in one place?", noLocationNote: "Choose this for a whole-body feeling or if you are not sure where it is.", noLocationFever: "Fever", noLocationWeak: "Weak all over", noLocationUnsure: "Not sure", selectionKicker: "Selected place", selectionEmpty: "Point at a place", selectionHint: "The place you point to will appear here.", selectionChosen: "Selected. Now choose the kind of trouble.", selectionNone: "No one place", figureHint: "Tap the part that feels wrong.", backHint: "Tap anywhere on the upper or lower back.", fallbackTitle: "Or choose from a list", fallbackNote: "Use this only if pointing is difficult.", front: "Front", back: "Back",
          regionHead: "Head", regionFace: "Face / jaw", regionNeck: "Neck", regionChest: "Chest", regionUpperAbdomen: "Upper abdomen", regionLowerAbdomen: "Lower abdomen", regionBack: "Back , upper or lower", regionArm: "Arm", regionHand: "Hand", regionLeg: "Leg", regionFoot: "Foot", regionGeneral: "Whole body / general", frontView: "Front view", backView: "Back view", resetView: "Reset view",
          sideSelectorTitle: "Side Affected · Laterality", sideLeft: "Left Side · बायाँ", sideBoth: "Both Sides · दोनों तरफ", sideRight: "Right Side · दायाँ",
          kindTitle: "What kind of trouble?", kindNote: "Choose the picture that feels closest. You can change it.", kindEmpty: "Choose a kind", kindHint: "Your choice will appear here.", kindChosen: "Selected. Now add the two quick details.", kindPain: "Pain", kindFever: "Fever or heat", kindBreathing: "Breathing", kindBleeding: "Bleeding", kindSwelling: "Swelling", kindRash: "Rash", kindInjury: "Injury", kindVomiting: "Vomiting or stomach", kindDizziness: "Dizziness", kindLow: "Feeling low", followupTitle: "A little more", durationLabel: "How long?", durationNow: "Just now", durationToday: "Today", durationDays: "A few days", durationLonger: "A while", durationUnsure: "Not sure", severityLabel: "Is it severe right now?", severityNo: "No", severityYes: "Yes", severityUnsure: "Not sure", mapContinue: "Continue", mapIncomplete: "Choose a kind, how long, and whether it is severe right now.", mapReady: "Your description is ready to review.", mapReadyNote: "Nothing has been sent, decided, or booked.", reviewMap: "Review this",
          reviewEyebrow: "Screen 2 · Read-back", reviewTitle: "This is what I understood", reviewNote: "Check these details. Nothing is decided until you confirm.", browserProcessingReview: "These details were prepared in this browser from the choices you can see below.", readbackWordsLabel: "Your words:", chipRegion: "Place", chipKind: "Kind of trouble", chipDuration: "How long", chipSeverity: "Severe now", chipWho: "For", chipAge: "Age band", editTitle: "Change a detail", editNote: "Choose a new answer below. Your read-back will update.", unclearLabel: "I did not understand:", confirmNote: "Your answers stay in this browser for this session. Confirm only when they look right.", confirm: "Confirm", changeSomething: "Change something", resultEyebrow: "Screen 3 · Where to go", matchedCounter: "Matched Counter:", routeReference: "Route reference:", chooseDepartment: "Not right? Choose a department yourself.", emergencyEyebrow: "Emergency guidance", emergencyTitle: "Go to the Emergency department now. Do not book an appointment.", notDiagnosis: "This is not a diagnosis.", deptPaediatrics: "Paediatrics", deptCardiology: "Cardiology", deptNeurology: "Neurology", deptGastroenterology: "Gastroenterology", deptOrthopaedics: "Orthopaedics", deptDermatology: "Dermatology", deptDental: "Dental", deptGeneralMedicine: "General Medicine", deptChoose: "Choose a department yourself",
          backToDepartment: "← Back to department", bookingEyebrow: "Your result · choose what happens next", bookingTitle: "Find a hospital, honestly", bookingNote: "This is one clear result: choose a locality, choose a hospital, then decide whether to make a specimen slip.", findHospital: "See hospitals and slots", whereTitle: "Where would you like to go?", whereNote: "Choose a locality. We do not read your device location.", localityLabel: "Your chosen locality", locationChosenNote: "Location is chosen by you, never taken from the phone. Travel figures below are simulated.", sortNote: "Sorted by seen soonest: slot start + simulated wait. Ties use travel time, then hospital name.", verifiedSource: "Hospital name and department", checked: "Checked", distance: "Travel", nextSlot: "Next open slot", seenBy: "Usually seen by", calendarOpens: "Calendar opens", chooseHospital: "Choose this hospital", chosenHospital: "Hospital chosen", chosenHospitalNote: "Now choose the visit type below.", noHospitals: "No verified hospital is listed for this department in this demo locality.", carryTitle: "What to carry", carryNote: "Choose the list that matches this visit.", firstVisit: "First visit", returningVisit: "Returning", firstId: "a photo ID", phoneOtp: "the phone that receives the one-time passcode", returningUhid: "your UHID from an earlier visit", previousSlip: "your previous appointment slip", feeLine: "OPD registration fee", toSignIn: "Continue to sign in", signInTitle: "Sign in to hold this slot", signInNote: "Identity is needed only now, when making the specimen slip. Nothing real is submitted.", credentialsNote: "These demo credentials are printed here so you never have to use a real account.", usernameLabel: "Username", passwordLabel: "Password", usernameInputLabel: "Demo username", passwordInputLabel: "Demo password", humanCheck: "Tap once: I am a person", signInButton: "Sign in and show the slip", humanCheckNeeded: "Tap the human check first.", slipTitle: "Your specimen slip", slipNote: "Keep this for the counter. It is a mock slip, not a booking.", slipPatient: "Patient", slipDepartment: "Department", slipHospital: "Hospital", slipSlot: "Slot", slipSeenBy: "Honest wait", slipAppointmentId: "Appointment ID", slipUhid: "UHID", patientSaid: "Patient reports:", rightsCard: "If you are turned away with this slip , note the appointment ID, raise a grievance at pgportal.gov.in, or file an RTI asking why a valid online appointment was not honoured.", printSlip: "Print slip", downloadSlip: "Download slip", printFooter: "SPECIMEN , NOT A REAL APPOINTMENT · independent prototype · mock data.", signedIn: "Mock sign-in complete. Your specimen slip is below.", credentialsMismatch: "Use the printed demo credentials above.", feeAmount: "₹10",
          honestyBack: "← Back", honestyEyebrow: "Screen 7 · Honesty", honestyTitle: "What is real and what is not", honestyIntro: "Start with what ORS already does well. Then see exactly what this independent prototype does , and does not , claim.", honestyLink: "What is real?", orsCreditTitle: "What ORS already does well", orsCreditNote: "These are ORS features we are crediting, not claiming to have invented.", honestySourceLabel: "Source · checked 26 Aug 2026:", orsLabReports: "Lab reports", orsBlood: "Blood availability", orsCancellation: "Cancellation by appointment ID", orsAbha: "ABHA integration", orsApp: "An official mobile app · Nextgen ORS", limitsTitle: "What this prototype does not claim", limitNoOrs: "Nothing here connects to ORS. No appointment is real.", limitMock: "Every hospital, slot, wait, queue position, appointment ID and UHID is mock.", limitRules: "The department mapping is a small hand-written rule file, not a clinical protocol reviewed by any medical body.", limitAdvice: "This is not medical advice.", limitModel: "Your words are handled in this browser for this prototype. Nothing is sent to a server.", buildTitle: "What built this prototype", buildInterfaceTitle: "HTML and CSS", buildInterface: "the mobile-first screens, large controls, focus states and print view.", buildRoutingTitle: "JavaScript + routing-rules.js", buildRouting: "structured complaint to department and urgency, with the rule ID shown.", buildHospitalTitle: "hospital-data.js", buildHospital: "verified hospital names and mock slots, waits, travel figures and identifiers.", buildCodexTitle: "Codex", buildCodex: "wrote the application code, tests and verification pass.", talkToPerson: "Talk to a person", prototype: "independent prototype · mock data · not affiliated with any government body.",
          voiceStart: "Speak your complaint", voiceStop: "Stop listening", voiceLabel: "Speak", voiceLabelStop: "Stop", voiceUnsupported: "Voice input is not available here. You can type or use the body map.",
          voiceListening: "Listening… say it in your own words.", voiceDone: "I heard your words. You can edit them before continuing.",
          continueHint: "Add a few words, or choose an example, so we can carry on.", someoneHint: "Choose who this is for and an age band.", notChosen: "Not chosen", notAsked: "Not asked", chooseDepartmentScreen: "Choose a department yourself",
        },
        hi: {
          landingKicker: "सरकारी अस्पताल तक पहुँचने का आसान पहला कदम", landingTitle: "सरकारी अस्पताल की अपॉइंटमेंट, बिना उलझन के।", landingSubtitle: "ORS पूछता है कि आपको कौन सा विभाग चाहिए। बीमार व्यक्ति को बस यह पता होता है कि कहाँ दर्द है। अपनी बात बोलकर, लिखकर या शरीर के नक्शे पर चुनकर बताइए , हम सही ओपीडी काउंटर और ईमानदार इंतज़ार दिखाएँगे।", modelDisclosure: "आपकी बात समझने के लिए यह वाक्य एआई सेवा को भेजा जाता है। अगर आप ऐसा नहीं चाहते तो शरीर का नक्शा चुनें।", startTriage: "ट्रायेज शुरू करें", learnMore: "यह कैसे काम करता है", privacyBadge: "100% जानकारी इसी फ़ोन में", noIdBadge: "देखने के लिए आधार/ओटीपी नहीं", accessBadge: "कम पढ़ने वालों के लिए भी आसान", quickStartTitle: "जो पता है, वहीं से शुरू करें", quickStartNote: "खाता नहीं। विभाग का अनुमान नहीं। नमूना चुनें या एक वाक्य लिखें।", entryRouteLabel: "कैसे बताना चाहेंगे?", entrySpeak: "बोलें", entryType: "लिखें", entryMap: "शरीर का नक्शा", landingPlaceholder: "जैसे: सीने में दर्द, आज सुबह से", exampleBreathing: "सीने में दर्द + साँस में दिक्कत", continueFromCard: "दोबारा पढ़ने के लिए आगे बढ़ें", whyLink: "राहत क्यों?", orsLink: "ORS और राहत", faqLink: "सवाल-जवाब", profileNav: "मेरी प्रोफाइल", profileShort: "प्रोफाइल", footerDesc: "भारतीय सरकारी अस्पतालों के लिए नागरिक-प्रथम ट्रायेज फ्रंट डोर। देशी आवाज़, 22 क्षेत्रीय भाषाओं और इंटरैक्टिव 3D बॉडी मैप द्वारा सही काउंटर तक मार्गदर्शन।", whyTitle: "काउंटर पर थोड़ा और सम्मान।", whyNote: "राहत मेडिकल शब्दावली की परीक्षा नहीं लेता। आपकी बात से शुरुआत होती है और आगे बढ़ने से पहले आप सब कुछ देख सकते हैं।", journeyOneTitle: "अपनी आवाज़ में बताएँ या नक्शे पर चुनें", journeyOneNote: "बोलें, लिखें या सरल शरीर के नक्शे का इस्तेमाल करें। हर रास्ता एक ही जाँच योग्य विवरण बनाता है।", journeyTwoTitle: "सत्यापित अस्पताल और ईमानदार इंतज़ार", journeyTwoNote: "सार्वजनिक अस्पताल की जानकारी, नकली टोकन की चाल और आम तौर पर दिखने का समय देखें।", journeyThreeTitle: "नागरिक अधिकारों वाली नमूना स्लिप", journeyThreeNote: "साफ़ तौर पर नकली बताई गई स्लिप अगला कदम और शिकायत का रास्ता साथ रखती है।", comparisonTitle: "राहत ORS को नए ढंग से सोचता है", comparisonNote: "ORS अपॉइंटमेंट के लिए उपयोगी है। राहत उस पल को आसान बनाता है जब नागरिक को सही काउंटर पता नहीं होता।", comparisonQuestion: "पहले सवाल का फर्क", orsEra: "2015 · NIC का डिजिटल काउंटर", raahatEra: "2026 · नागरिक पहले", comparisonDepartment: "विभाग ढूँढना", orsDepartment: "विभाग का अनुमान", raahatDepartment: "जीरो-नॉलेज ट्रायेज , जहाँ दर्द है वहाँ से शुरुआत", comparisonWait: "सही इंतज़ार जानना", orsWait: "सिर्फ स्लॉट का समय", raahatWait: "ईमानदार इंतज़ार , स्लॉट + नकली दिखने का समय", comparisonAuth: "शुरुआत करना", orsAuth: "शुरू में टेढ़ा CAPTCHA", raahatAuth: "अंत में एक टैप से पहचान , सिर्फ नमूना स्लिप पर", comparisonAccess: "परेशानी बताना", orsAccess: "टेक्स्ट फ़ॉर्म", raahatAccess: "2D शरीर का नक्शा + बोलना + लिखना", networkTitle: "दिल्ली अस्पताल नेटवर्क की स्थिति", networkNote: "अस्पताल के नाम, पते और विभाग सार्वजनिक तथ्य हैं। उपलब्धता और टोकन की गति इस प्रोटोटाइप की नकली जानकारी है।", faqTitle: "नागरिक और जज के सवाल", faqNote: "सुरक्षा, पहुँच, गोपनीयता और इस प्रोटोटाइप की असली सीमा के साफ़ जवाब।", faqSafetyQ: "क्या यह ट्रायेज सुरक्षित है?", faqSafetyA: "राहत बीमारी का पता नहीं लगाता। आपकी पुष्टि के बाद कोड की छोटी नियम-सूची काम करती है। एक भी रेड फ्लैग होने पर इमरजेंसी का रास्ता चुना जाता है।", faqRedFlagQ: "इमरजेंसी रेड फ्लैग होने पर क्या होता है?", faqRedFlagA: "नतीजा कहता है कि अभी इमरजेंसी जाएँ और अपॉइंटमेंट न लें। नियम आईडी और चुने हुए इलाके का सबसे नज़दीकी नकली इमरजेंसी अस्पताल दिखता है।", faqAccessQ: "क्या बिना पढ़े कोई इसे इस्तेमाल कर सकता है?", faqAccessA: "हाँ। परेशानी बताने के तीन बराबर रास्ते हैं: बोलना, लिखना या नाम वाले 2D शरीर के नक्शे पर टैप करना।", faqPrivacyQ: "मेरी जानकारी का क्या होता है?", faqPrivacyA: "परेशानी इसी ब्राउज़र में इस सत्र तक रहती है और सर्वर पर सेव नहीं होती। शरीर के नक्शे वाले रास्ते में कुछ भी किसी सेवा को नहीं भेजा जाता।", faqWaitQ: "इंतज़ार का समय कैसे निकला है?", faqWaitA: "यह स्लॉट शुरू होने का समय और नकली इंतज़ार जोड़कर निकाला गया है। अस्पताल पहले दिखने के समय, फिर यात्रा और फिर नाम से क्रम में आते हैं। यह लाइव कतार नहीं है।", faqOrsQ: "राहत ORS से कैसे अलग है?", faqOrsA: "ORS आपसे अस्पताल और विभाग चुनने को कहता है। राहत पहले आपकी बात को व्यवस्थित करता है और फिर नकली कतार दिखाता है। यह ORS से जुड़ा नहीं है।", faqAbdmQ: "क्या यह ABDM से जुड़ेगा?", faqAbdmA: "नहीं। ABDM, आधार, ABHA, UHID, OTP और सरकारी सिस्टम इस प्रोटोटाइप के बाहर हैं। भविष्य में जोड़ने के लिए साफ़ सहमति और सुरक्षा जाँच ज़रूरी होगी।", qrTitle: "नमूना QR बॉक्स", qrNote: "यह सजावटी पैटर्न है। इससे असली अपॉइंटमेंट नहीं खुलेगी।", emergencyHospitalTitle: "आपके चुने इलाके का सबसे नज़दीकी इमरजेंसी अस्पताल", emergencyHospitalNote: "अभी जाएँ। अस्पताल की जानकारी सत्यापित है; यात्रा का समय नकली है।",
          eyebrow: "सही ओपीडी काउंटर तक पहुँचने का आसान तरीका", title: "क्या तकलीफ़ है?",
          note: "अपने शब्दों में बताइए। बोलें, लिखें या शरीर के नक्शे पर चुनें।",
          bookingFor: "किसके लिए बुकिंग है:", myself: "मेरे लिए", someoneElse: "किसी और के लिए", whoLabel: "किसके लिए है?",
          parent: "मेरे माता-पिता", child: "मेरे बच्चे", someoneElseShort: "कोई और", ageLabel: "उम्र का समूह",
          baby: "नन्हा बच्चा", childAge: "बच्चा", adult: "वयस्क", olderAdult: "बुज़ुर्ग", complaintLabel: "क्या परेशानी है?",
          placeholder: "सीने में दर्द, कल रात से", inputHelp: "आपके शब्द इस ब्राउज़र में इसी सत्र तक रहेंगे।",
          exampleChest: "सीने में दर्द", exampleFever: "बुखार", exampleWeakness: "एक तरफ़ कमज़ोरी", continue: "आगे बढ़ें",
          bodyMapButton: "शरीर के नक्शे पर चुनें", captured: "आपके शब्द अगले कदम के लिए तैयार हैं। कुछ भेजा या बुक नहीं हुआ है।", needHelp: "किसी व्यक्ति से बात करें?",
          backToQuestion: "← वापस", mapEyebrow: "पढ़ने की ज़रूरत नहीं", mapTitle: "जहाँ तकलीफ़ है वहाँ चुनें",
          mapNote: "जहाँ परेशानी है वहाँ चुनें।", mapWordsLabel: "आपके शब्द:", browserProcessing: "शरीर का यह नक्शा इसी ब्राउज़र में चलता है। कुछ भी सर्वर पर नहीं भेजा जाता।", noLocationTitle: "एक जगह पर परेशानी नहीं?", noLocationNote: "पूरे शरीर में परेशानी हो या जगह पता न हो तो इसे चुनें।", noLocationFever: "बुखार", noLocationWeak: "पूरे शरीर में कमज़ोरी", noLocationUnsure: "पता नहीं", selectionKicker: "चुनी हुई जगह", selectionEmpty: "किसी जगह पर चुनें", selectionHint: "आप जहाँ चुनेंगे, वह जगह यहाँ दिखेगी।", selectionChosen: "चुन लिया। अब परेशानी की किस्म चुनें।", selectionNone: "कोई एक जगह नहीं", figureHint: "जहाँ परेशानी है वहाँ चुनें।", backHint: "ऊपरी या निचली पीठ पर कहीं भी चुनें।", fallbackTitle: "या सूची में से चुनें", fallbackNote: "अगर नक्शे पर चुनना मुश्किल हो तभी इसका इस्तेमाल करें।", front: "सामने", back: "पीछे",
          regionHead: "सिर", regionFace: "चेहरा / जबड़ा", regionNeck: "गर्दन", regionChest: "सीना", regionUpperAbdomen: "पेट का ऊपरी हिस्सा", regionLowerAbdomen: "पेट का निचला हिस्सा", regionBack: "पीठ , ऊपर या नीचे", regionArm: "बाँह", regionHand: "हाथ", regionLeg: "टाँग", regionFoot: "पैर", regionGeneral: "पूरा शरीर / सामान्य", frontView: "सामने से", backView: "पीछे से", resetView: "दृश्य रीसेट करें",
          sideSelectorTitle: "प्रभावित हिस्सा / तरफ", sideLeft: "बायाँ हिस्सा", sideBoth: "दोनों तरफ (बायाँ व दायाँ)", sideRight: "दायाँ हिस्सा",
          kindTitle: "परेशानी किस तरह की है?", kindNote: "जो तस्वीर सबसे करीब लगे उसे चुनें। इसे बदल सकते हैं।", kindEmpty: "किस्म चुनें", kindHint: "आपकी पसंद यहाँ दिखेगी।", kindChosen: "चुन लिया। अब दो छोटी बातें बताइए।", kindPain: "दर्द", kindFever: "बुखार या गर्मी", kindBreathing: "साँस", kindBleeding: "खून आना", kindSwelling: "सूजन", kindRash: "दाने", kindInjury: "चोट", kindVomiting: "उल्टी या पेट", kindDizziness: "चक्कर", kindLow: "कमज़ोरी या मन उदास", followupTitle: "थोड़ा और बताइए", durationLabel: "कब से?", durationNow: "अभी", durationToday: "आज", durationDays: "कुछ दिन", durationLonger: "काफ़ी समय", durationUnsure: "पता नहीं", severityLabel: "क्या अभी बहुत तेज़ है?", severityNo: "नहीं", severityYes: "हाँ", severityUnsure: "पता नहीं", mapContinue: "आगे बढ़ें", mapIncomplete: "परेशानी की किस्म, कब से और अभी बहुत तेज़ है या नहीं चुनें।", mapReady: "आपका विवरण देखने के लिए तैयार है।", mapReadyNote: "कुछ भेजा, तय या बुक नहीं हुआ है।", reviewMap: "इसे देखें",
          reviewEyebrow: "स्क्रीन 2 · दोबारा पढ़ें", reviewTitle: "हमने यह समझा", reviewNote: "इन जानकारियों को जाँचें। आपकी पुष्टि से पहले कुछ तय नहीं होगा।", browserProcessingReview: "नीचे दिख रहे आपके जवाबों से यह विवरण इसी ब्राउज़र में तैयार हुआ है।", readbackWordsLabel: "आपके शब्द:", chipRegion: "जगह", chipKind: "परेशानी की किस्म", chipDuration: "कब से", chipSeverity: "अभी बहुत तेज़", chipWho: "किसके लिए", chipAge: "उम्र का समूह", editTitle: "एक जानकारी बदलें", editNote: "नीचे नया जवाब चुनें। दोबारा पढ़ा गया विवरण बदल जाएगा।", unclearLabel: "समझ नहीं आया:", confirmNote: "आपके जवाब इस ब्राउज़र में इसी सत्र तक रहेंगे। सही लगे तभी पुष्टि करें।", confirm: "पुष्टि करें", changeSomething: "कुछ बदलें", resultEyebrow: "स्क्रीन 3 · कहाँ जाएँ", matchedCounter: "मिलान हुआ काउंटर:", routeReference: "रूट संदर्भ:", chooseDepartment: "सही नहीं? विभाग खुद चुनें।", emergencyEyebrow: "इमरजेंसी की सलाह", emergencyTitle: "अभी इमरजेंसी विभाग जाएँ। अपॉइंटमेंट बुक न करें।", notDiagnosis: "यह बीमारी का पता नहीं है।", deptPaediatrics: "बाल रोग विभाग", deptCardiology: "कार्डियोलॉजी", deptNeurology: "न्यूरोलॉजी", deptGastroenterology: "गैस्ट्रोएंटेरोलॉजी", deptOrthopaedics: "ऑर्थोपेडिक्स", deptDermatology: "त्वचा रोग विभाग", deptDental: "डेंटल", deptGeneralMedicine: "जनरल मेडिसिन", deptChoose: "विभाग खुद चुनें",
          backToDepartment: "← विभाग पर वापस जाएँ", bookingEyebrow: "आपका नतीजा · अगला कदम चुनें", bookingTitle: "ईमानदारी से अस्पताल चुनें", bookingNote: "एक ही साफ़ नतीजा: इलाका चुनें, अस्पताल चुनें, फिर नकली स्लिप बनाने का फैसला करें।", findHospital: "अस्पताल और स्लॉट देखें", whereTitle: "आप कहाँ जाना चाहेंगे?", whereNote: "इलाका चुनें। हम आपके फ़ोन की जगह नहीं पढ़ते।", localityLabel: "आपका चुना हुआ इलाका", locationChosenNote: "जगह आपने चुनी है, फ़ोन से नहीं ली गई। नीचे आने-जाने का समय नकली है।", sortNote: "जल्दी दिखने के हिसाब से क्रम: स्लॉट का समय + नकली इंतज़ार। बराबरी पर आने-जाने का समय, फिर अस्पताल का नाम।", verifiedSource: "अस्पताल का नाम और विभाग", checked: "जाँच की तारीख", distance: "यात्रा", nextSlot: "अगला खुला स्लॉट", seenBy: "आमतौर पर दिखेंगे", calendarOpens: "कैलेंडर खुलेगा", chooseHospital: "यह अस्पताल चुनें", chosenHospital: "अस्पताल चुना गया", chosenHospitalNote: "अब नीचे इस यात्रा का प्रकार चुनें।", noHospitals: "इस डेमो इलाके में इस विभाग के लिए कोई सत्यापित अस्पताल सूची में नहीं है।", carryTitle: "क्या साथ ले जाएँ", carryNote: "इस यात्रा के अनुसार सूची चुनें।", firstVisit: "पहली यात्रा", returningVisit: "फिर से आना", firstId: "फोटो पहचान पत्र", phoneOtp: "वह फ़ोन जिस पर वन-टाइम पासकोड आएगा", returningUhid: "पहले का यूएचआईडी", previousSlip: "पहली अपॉइंटमेंट की स्लिप", feeLine: "ओपीडी पंजीकरण शुल्क", toSignIn: "साइन इन करने के लिए आगे बढ़ें", signInTitle: "स्लॉट रखने के लिए साइन इन करें", signInNote: "पहचान की ज़रूरत सिर्फ़ अब है, नकली स्लिप बनाते समय। कुछ असली जमा नहीं होता।", credentialsNote: "डेमो क्रेडेंशियल यहाँ बड़े अक्षरों में हैं; असली खाता इस्तेमाल न करें।", usernameLabel: "यूज़रनेम", passwordLabel: "पासवर्ड", usernameInputLabel: "डेमो यूज़रनेम", passwordInputLabel: "डेमो पासवर्ड", humanCheck: "एक बार चुनें: मैं इंसान हूँ", signInButton: "साइन इन करें और स्लिप दिखाएँ", humanCheckNeeded: "पहले मानव-जाँच चुनें।", slipTitle: "आपकी नकली स्लिप", slipNote: "इसे काउंटर पर दिखाने के लिए रखें। यह नकली स्लिप है, बुकिंग नहीं।", slipPatient: "मरीज़", slipDepartment: "विभाग", slipHospital: "अस्पताल", slipSlot: "स्लॉट", slipSeenBy: "ईमानदार इंतज़ार", slipAppointmentId: "अपॉइंटमेंट आईडी", slipUhid: "यूएचआईडी", patientSaid: "मरीज़ ने बताया:", rightsCard: "अगर इस स्लिप के साथ आपको लौटा दिया जाए , अपॉइंटमेंट आईडी लिखें, pgportal.gov.in पर शिकायत करें, या पूछें कि मान्य ऑनलाइन अपॉइंटमेंट क्यों नहीं माना गया।", printSlip: "स्लिप प्रिंट करें", downloadSlip: "स्लिप डाउनलोड करें", printFooter: "नमूना , असली अपॉइंटमेंट नहीं · स्वतंत्र प्रोटोटाइप · नकली डेटा।", signedIn: "नकली साइन-इन पूरा हुआ। आपकी नकली स्लिप नीचे है।", credentialsMismatch: "ऊपर दिए डेमो क्रेडेंशियल इस्तेमाल करें।", feeAmount: "₹10",
          honestyBack: "← वापस", honestyEyebrow: "स्क्रीन 7 · ईमानदारी", honestyTitle: "क्या असली है और क्या नहीं", honestyIntro: "पहले जानिए कि ओआरएस क्या अच्छा करता है। फिर देखें कि यह स्वतंत्र प्रोटोटाइप क्या दावा करता है , और क्या नहीं।", honestyLink: "क्या असली है?", orsCreditTitle: "ओआरएस पहले से क्या अच्छा करता है", orsCreditNote: "ये ओआरएस की सुविधाएँ हैं; हम इन्हें अपना बनाया हुआ नहीं बता रहे हैं।", honestySourceLabel: "स्रोत · 26 अगस्त 2026 को जाँचा:", orsLabReports: "लैब रिपोर्ट", orsBlood: "खून की उपलब्धता", orsCancellation: "अपॉइंटमेंट आईडी से रद्द करना", orsAbha: "आभा एकीकरण", orsApp: "आधिकारिक मोबाइल ऐप · नेक्स्टजेन ओआरएस", limitsTitle: "यह प्रोटोटाइप क्या दावा नहीं करता", limitNoOrs: "यहाँ कुछ भी ओआरएस से नहीं जुड़ा है। कोई अपॉइंटमेंट असली नहीं है।", limitMock: "हर अस्पताल, स्लॉट, इंतज़ार, कतार की जगह, अपॉइंटमेंट आईडी और यूएचआईडी नकली है।", limitRules: "विभाग चुनने का तरीका एक छोटी, हाथ से लिखी नियम फ़ाइल है; यह क्लिनिकल प्रोटोकॉल नहीं है और किसी मेडिकल संस्था ने इसकी समीक्षा नहीं की है।", limitAdvice: "यह मेडिकल सलाह नहीं है।", limitModel: "आपकी बात अपने शब्दों में पढ़ने के लिए हम यह वाक्य एक एआई सेवा को भेजते हैं। अगर आप ऐसा नहीं चाहते तो शरीर का नक्शा चुनें।", buildTitle: "यह प्रोटोटाइप किससे बना", buildInterfaceTitle: "एचटीएमएल और सीएसएस", buildInterface: "मोबाइल स्क्रीन, बड़े कंट्रोल, फ़ोकस स्थिति और प्रिंट व्यू।", buildRoutingTitle: "जावास्क्रिप्ट + routing-rules.js", buildRouting: "आपकी संरचित शिकायत से विभाग और ज़रूरत की तात्कालिकता; नियम आईडी भी दिखती है।", buildHospitalTitle: "hospital-data.js", buildHospital: "सत्यापित अस्पताल नाम और नकली स्लॉट, इंतज़ार, यात्रा आँकड़े और आईडी।", buildCodexTitle: "Codex", buildCodex: "एप्लिकेशन कोड, टेस्ट और जाँच लिखने में मदद की।", talkToPerson: "किसी व्यक्ति से बात करें", prototype: "स्वतंत्र प्रोटोटाइप · नकली डेटा · किसी सरकारी संस्था से जुड़ा नहीं।",
          voiceStart: "अपनी परेशानी बोलें", voiceStop: "सुनना रोकें", voiceLabel: "बोलें", voiceLabelStop: "रोकें", voiceUnsupported: "यहाँ आवाज़ से लिखना उपलब्ध नहीं है। आप लिख सकते हैं या शरीर का नक्शा चुन सकते हैं।",
          voiceListening: "सुन रहे हैं… अपने शब्दों में बोलें।", voiceDone: "आपके शब्द मिल गए। आगे बढ़ने से पहले उन्हें बदल सकते हैं।",
          continueHint: "कुछ शब्द लिखें या कोई उदाहरण चुनें ताकि हम आगे बढ़ सकें।", someoneHint: "किसके लिए है और उम्र का समूह चुनें।", notChosen: "नहीं चुना", notAsked: "नहीं पूछा गया", chooseDepartmentScreen: "विभाग खुद चुनें",
        },
      };

      Object.assign(copy.en, {
        howLink: "How It Works", hospitalsLink: "Hospitals", howTitle: "How Raahat works", howNote: "A short, visible journey from where it hurts to the right OPD counter.",
        howOneTitle: "Point, speak, or type", howOneNote: "Describe symptoms in any language, or point to a place on the interactive body map.", howTwoTitle: "Instant triage & honest wait", howTwoNote: "Code matches a verified hospital counter and shows simulated queue timing in plain language.", howThreeTitle: "Specimen slip & citizen rights", howThreeNote: "Print a clearly marked mock slip with what to carry and a PGPortal grievance safeguard.",
        helplinesLabel: "Emergency quick dial:", comparisonEmergency: "Emergency safety", orsEmergency: "Routine booking can hide a critical emergency", raahatEmergency: "One red flag → 24/7 Emergency now", triageSpine: "Spine", triage3dEyebrow: "3D body map", triage3dTitle: "Point at a place", triage3dNote: "Drag to rotate 360°. Tap any body part to select. Nothing is decided here.", stageHintText: "Drag to rotate 360° · Model holds your angle · Tap any part to select · Scroll to zoom", use2d: "Use accessible 2D map", use3d: "Show 3D map", workspaceUnsure: "Not sure where", workspaceEyebrow: "Read-back workspace", workspaceTitle: "Your choices stay visible", workspaceEmpty: "Choose any body part or use the 2D map.", workspaceAwaiting: "The department result appears only after you see and confirm the read-back.", workspacePrivacy: "One red flag is enough for Emergency. The model cannot clear a flag.", map3dUnavailable: "3D is not available on this device. The accessible 2D map is ready below.",
      });
      Object.assign(copy.hi, {
        howLink: "यह कैसे काम करता है", hospitalsLink: "अस्पताल", howTitle: "राहत कैसे काम करता है", howNote: "जहाँ तकलीफ़ है वहाँ से सही ओपीडी काउंटर तक एक साफ़ सफ़र।",
        howOneTitle: "चुनें, बोलें या लिखें", howOneNote: "किसी भी भाषा में बताइए या शरीर के नक्शे पर जगह चुनिए।", howTwoTitle: "तुरंत रास्ता और ईमानदार इंतज़ार", howTwoNote: "कोड सही अस्पताल काउंटर चुनता है और नकली कतार का समय साफ़ भाषा में दिखाता है।", howThreeTitle: "नमूना स्लिप और नागरिक अधिकार", howThreeNote: "क्या साथ ले जाना है और PGPortal शिकायत रास्ते के साथ साफ़ नकली स्लिप प्रिंट करें।",
        helplinesLabel: "इमरजेंसी के लिए जल्दी डायल करें:", comparisonEmergency: "इमरजेंसी सुरक्षा", orsEmergency: "साधारण बुकिंग गंभीर इमरजेंसी छिपा सकती है", raahatEmergency: "एक रेड फ्लैग → अभी 24/7 इमरजेंसी", triageSpine: "रीढ़", triage3dEyebrow: "3D शरीर का नक्शा", triage3dTitle: "किसी जगह पर चुनें", triage3dNote: "360° घुमाने के लिए खींचें। शरीर का कोई भी अंग चुनें। यहाँ कुछ तय नहीं होता।", stageHintText: "360° घुमाएँ · मॉडल आपके कोण पर रुकेगा · चुनने के लिए अंग छुएँ · ज़ूम करें", use2d: "आसान 2D नक्शा चुनें", use3d: "3D नक्शा दिखाएँ", workspaceUnsure: "जगह पता नहीं", workspaceEyebrow: "दोबारा पढ़ने की जगह", workspaceTitle: "आपकी पसंद सामने रहेगी", workspaceEmpty: "शरीर का कोई भी अंग या 2D नक्शा चुनें।", workspaceAwaiting: "विभाग का नतीजा आपकी पुष्टि के बाद ही दिखेगा।", workspacePrivacy: "एक रेड फ्लैग इमरजेंसी के लिए काफ़ी है। मॉडल फ्लैग हटा नहीं सकता।", map3dUnavailable: "इस डिवाइस पर 3D उपलब्ध नहीं है। आसान 2D नक्शा नीचे तैयार है।",
      });
      Object.assign(copy.en, {
        faqSafetyQ: "Does Raahat give medical advice or clinical diagnoses?", faqSafetyA: "No. Raahat is administrative triage only. It structures your words and points you to an OPD counter; it does not diagnose or say that you are fine.", faqRedFlagQ: "How do deterministic Red Flags work?", faqRedFlagA: "Red Flags are code-level safeguards. One marker is enough to route to Emergency now, and nothing can remove that safeguard.", faqAccessQ: "Can someone who cannot read use this platform?", faqAccessA: "Yes. Complaint entry has three equal routes: speak, type, or tap the labelled 3D/2D body map. Large buttons, keyboard focus and screen-reader labels are built into the flow.", faqPrivacyQ: "Is personal health data stored on a server?", faqPrivacyA: "No. This prototype keeps the complaint in the browser for this session and never stores it server-side. The body-map route keeps the complaint in this browser and sends nothing anywhere.", faqWaitQ: "How are the honest wait times calculated?", faqWaitA: "They are simulated from historical OPD throughput plus a morning-rounds delay: slot start plus estimated wait. This is not live queue data.", faqOrsQ: "How is Raahat different from the government's ORS portal?", faqOrsA: "ORS begins by asking you to choose a hospital and department. Raahat helps a citizen structure their own words first, then shows an honest simulated queue view. It does not connect to ORS.", faqAbdmQ: "How can Raahat integrate with real government infrastructure?", faqAbdmA: "This prototype does not connect to government systems. A future production gateway could integrate with ABDM and e-Hospital HMIS APIs only with explicit consent, security review and a public-service partnership."
      });
      Object.assign(copy.hi, {
        faqSafetyQ: "क्या राहत मेडिकल सलाह या बीमारी की पहचान करता है?", faqSafetyA: "नहीं। राहत केवल प्रशासनिक ट्रायेज है। यह आपकी बात को व्यवस्थित कर ओपीडी काउंटर तक पहुँचाता है; बीमारी की पहचान नहीं करता और यह नहीं कहता कि आप ठीक हैं।", faqRedFlagQ: "नियम से चलने वाले रेड फ्लैग कैसे काम करते हैं?", faqRedFlagA: "रेड फ्लैग एआई से अलग कोड के नियम हैं। एक निशान भी अभी इमरजेंसी भेजने के लिए काफ़ी है और मॉडल फ्लैग हटा नहीं सकता।", faqAccessQ: "क्या बिना पढ़े कोई इस प्लेटफ़ॉर्म का इस्तेमाल कर सकता है?", faqAccessA: "हाँ। परेशानी बताने के तीन बराबर रास्ते हैं: बोलना, लिखना या नाम वाले 3D/2D शरीर के नक्शे पर टैप करना।", faqPrivacyQ: "क्या मेरी निजी स्वास्थ्य जानकारी सर्वर पर सेव होती है?", faqPrivacyA: "नहीं। इस प्रोटोटाइप में परेशानी इसी ब्राउज़र में सत्र तक रहती है और सर्वर पर सेव नहीं होती। शरीर के नक्शे वाला रास्ता एआई सेवा को कुछ नहीं भेजता।", faqWaitQ: "ईमानदार इंतज़ार का समय कैसे निकाला जाता है?", faqWaitA: "यह नकली समय ओपीडी की पुरानी गति और सुबह के डॉक्टर राउंड से बनाया गया है: स्लॉट शुरू होने का समय और अनुमानित इंतज़ार। यह लाइव कतार नहीं है।", faqOrsQ: "राहत सरकारी ORS पोर्टल से कैसे अलग है?", faqOrsA: "ORS पहले अस्पताल और विभाग चुनने को कहता है। राहत पहले आपकी बात को व्यवस्थित करता है और फिर नकली कतार दिखाता है। यह ORS से जुड़ा नहीं है।", faqAbdmQ: "राहत असली सरकारी सिस्टम से कैसे जुड़ सकता है?", faqAbdmA: "यह प्रोटोटाइप सरकारी सिस्टम से नहीं जुड़ा है। भविष्य का प्रोडक्शन गेटवे साफ़ सहमति, सुरक्षा जाँच और सार्वजनिक सेवा साझेदारी के साथ ABDM और e-Hospital HMIS API से जुड़ सकता है।"
      });
      Object.assign(copy.en, {
        homeNav: "Home", triageNav: "OPD Triage", honestyNav: "Honesty", hospitalsLink: "Delhi Hospitals",
        comparisonKicker: "A clearer front door", hospitalsKicker: "Verified public directory", faqKicker: "Plain-language answers",
        ctaKicker: "Your next step stays yours", ctaTitle: "Ready to find the right OPD counter?", ctaNote: "Start with a sentence, your voice, or a point on the body map. You will see and confirm the read-back before any routing happens.",
      });
      Object.assign(copy.hi, {
        homeNav: "होम", triageNav: "ओपीडी ट्रायेज", honestyNav: "ईमानदारी", hospitalsLink: "दिल्ली अस्पताल",
        comparisonKicker: "एक साफ़ शुरुआत", hospitalsKicker: "सत्यापित सार्वजनिक सूची", faqKicker: "सीधे सवालों के जवाब",
        ctaKicker: "अगला कदम आपका है", ctaTitle: "सही ओपीडी काउंटर ढूँढने के लिए तैयार?", ctaNote: "एक वाक्य, अपनी आवाज़ या शरीर के नक्शे पर एक जगह से शुरू करें। किसी भी रास्ते से पहले आप दोबारा पढ़ा गया विवरण देखकर पुष्टि करेंगे।",
      });
      Object.assign(copy.en, {
        processingLabel: "Client-side browser processing:", modelDisclosure: "Your words are evaluated securely inside this browser to guide you to the right counter. Nothing is sent to a server.", browserProcessing: "This body map stays in your browser. Nothing is sent to a server.", browserProcessingReview: "These details were prepared in this browser from the choices you can see below.", modelBoundary: "Your words are handled in this browser for this prototype. The body-map route keeps the complaint on this device.", faqPrivacyA: "Your complaint stays in this browser for this session. Nothing is stored on a server.", raahatDepartment: "Start with where it hurts; we will show the counter that matches your confirmed details.", raahatWait: "Estimated consultation time, based on the slot and simulated queue throughput.", orsWait: "Slot time only",
        matchedCounter: "Matched Counter:", routeReference: "Route reference:", workspacePrivacy: "One red flag is enough for Emergency. The route always keeps that safety signal.", sortNote: "Sorted by earliest estimated consultation time, then travel time, then hospital name.",
        slipSubtitle: "Public Hospital OPD Specimen Slip", slipTokenLabel: "Mock token", slipTimeSummary: "Appointment timing:", slipAddress: "Hospital address", slipToken: "Token", slipSeenBy: "Estimated consultation", rightsCard: "If a hospital registration counter refuses to honor this valid online token: note your Appointment ID, file a grievance at pgportal.gov.in, or cite the Citizen's Charter.", qrTitle: "Sample security pattern", themeDark: "Use dark theme", themeLight: "Use light theme",
        stepPatient: "Patient", stepPatientHi: "Who is this for?", stepBody: "Body map", stepBodyHi: "Point to a place", stepCounter: "Matched counter", stepCounterHi: "Where to go?", stepHospital: "Hospital & wait", stepHospitalHi: "Choose honestly", stepSlip: "Specimen slip", stepSlipHi: "Keep your copy", upperView: "Upper body", lowerView: "Lower body",
      });
      Object.assign(copy.hi, {
        processingLabel: "ब्राउज़र में सुरक्षित स्थानीय प्रक्रिया:", modelDisclosure: "आपकी बात इसी ब्राउज़र में समझी जाती है ताकि आपको सही काउंटर तक पहुँचाया जा सके। कुछ भी सर्वर पर नहीं भेजा जाता।", browserProcessing: "शरीर का यह नक्शा इसी ब्राउज़र में चलता है। कुछ भी सर्वर पर नहीं भेजा जाता।", browserProcessingReview: "नीचे दिख रहे आपके जवाबों से यह विवरण इसी ब्राउज़र में तैयार हुआ है।", modelBoundary: "आपकी बात इस प्रोटोटाइप में इसी ब्राउज़र में संभाली जाती है। शरीर के नक्शे वाला रास्ता इसे इसी डिवाइस पर रखता है।", faqPrivacyA: "आपकी परेशानी इस सत्र में इसी ब्राउज़र में रहती है। सर्वर पर कुछ भी सेव नहीं होता।", raahatDepartment: "जहाँ परेशानी है वहाँ से शुरू करें; आपकी पुष्टि के बाद उसी से मेल खाता काउंटर दिखेगा।", raahatWait: "स्लॉट और नकली कतार की गति के आधार पर अनुमानित दिखने का समय।", orsWait: "सिर्फ स्लॉट का समय",
        matchedCounter: "मिलान हुआ काउंटर:", routeReference: "रूट संदर्भ:", workspacePrivacy: "एक रेड फ्लैग इमरजेंसी के लिए काफ़ी है। यह सुरक्षा संकेत हमेशा साथ रहता है।", sortNote: "पहले अनुमानित दिखने के समय, फिर यात्रा के समय और फिर अस्पताल के नाम से क्रम।",
        slipSubtitle: "सरकारी अस्पताल ओपीडी की नमूना स्लिप", slipTokenLabel: "नमूना टोकन", slipTimeSummary: "अपॉइंटमेंट का समय:", slipAddress: "अस्पताल का पता", slipToken: "टोकन", slipSeenBy: "अनुमानित दिखने का समय", rightsCard: "अगर अस्पताल का पंजीकरण काउंटर इस मान्य ऑनलाइन टोकन को मानने से इनकार करे: अपनी अपॉइंटमेंट आईडी लिखें, pgportal.gov.in पर शिकायत करें या सिटिज़न्स चार्टर का हवाला दें।", qrTitle: "नमूना सुरक्षा पैटर्न", themeDark: "डार्क थीम चुनें", themeLight: "लाइट थीम चुनें",
        stepPatient: "मरीज़", stepPatientHi: "किसके लिए?", stepBody: "शरीर का नक्शा", stepBodyHi: "जगह चुनें", stepCounter: "मिलान हुआ काउंटर", stepCounterHi: "कहाँ जाएँ?", stepHospital: "अस्पताल और इंतज़ार", stepHospitalHi: "ईमानदारी से चुनें", stepSlip: "नमूना स्लिप", stepSlipHi: "अपनी प्रति रखें", upperView: "ऊपरी हिस्सा", lowerView: "निचला हिस्सा",
      });
      Object.assign(copy.en, { modelDisclosure: "To read this in your own words we send this sentence to an AI service. Tap the body map instead if you would rather not." });
      Object.assign(copy.hi, { modelDisclosure: "आपकी बात पढ़ने के लिए यह वाक्य AI सेवा को भेजा जाता है। अगर आप ऐसा नहीं चाहते तो शरीर का नक्शा चुनें।" });
      Object.assign(copy.en, { modelBoundary: "Typed or spoken complaint text is sent to an AI service only after this disclosure. The body-map route sends nothing to that service; routing remains deterministic code." });
      Object.assign(copy.hi, { modelBoundary: "लिखी या बोली गई परेशानी इस सूचना के बाद ही AI सेवा को भेजी जाती है। शरीर के नक्शे वाला रास्ता उस सेवा को कुछ नहीं भेजता; रास्ता कोड के नियम तय करते हैं।" });
      Object.assign(copy.en, {
        labNav: "Lab Tests & Scans", bloodNav: "Blood Bank", backToServices: "← Back to services", startBooking: "Start OPD Triage & Book Slot →", serviceGridKicker: "Services at a glance", serviceGridTitle: "Choose the help you need today.", opdService: "OPD Counter Triage", opdServiceNote: "Find the right first counter", labService: "Book Lab & Scan Tests", labServiceNote: "See preparation and fees", bloodService: "Blood Bank Inventory", bloodServiceNote: "Check mock stock and donors", teleService: "Online Video Tele-OPD", teleServiceNote: "Start from home",
        patientDetailsKicker: "Step 1 · Patient details", patientDetailsTitle: "Tell us who needs the appointment", patientDetailsNote: "These details stay in this browser for this session. Please do not enter an Aadhaar, ABHA, UHID, OTP or real health record.", patientNameLabel: "Full Name of Patient", patientNamePlaceholder: "Enter the patient's name", patientPhoneLabel: "SMS contact", patientPhonePlaceholder: "No phone number is collected. Any reminder shown is simulated in this browser.", numericAgeLabel: "Age band", ageBabyNumeric: "0 to 1 year (Infant / Baby)", ageChildNumeric: "2 to 12 years (Child / Paediatric)", ageAdolescent: "13 to 17 years (Adolescent / Teen)", ageAdultNumeric: "18 to 44 years (Young Adult)", ageMiddle: "45 to 59 years (Middle-Aged Adult)", ageOlderNumeric: "60+ years (Senior Citizen)", exactAgeLabel: "Exact Age (optional)", exactAgePlaceholder: "e.g. 42", genderLabel: "Gender selection", genderMale: "Male", genderFemale: "Female", genderOther: "Other", conditionsLabel: "Pre-existing medical conditions", conditionDiabetes: "Diabetes", conditionHypertension: "Hypertension (BP)", conditionHeart: "Heart Condition", conditionAsthma: "Asthma / Respiratory", conditionPregnancy: "Pregnancy", conditionNone: "No pre-existing condition",
        appointmentStepLabel: "Step 4 · Appointment choices", consultationModeTitle: "How would you like to meet the OPD team?", teleModeSelected: "Online Video Consultation is selected. We will show the secure mock Tele-OPD details after you choose a hospital and slot.", inPersonMode: "In-Person Hospital Visit", inPersonModeNote: "Walk-in to OPD Counter", teleMode: "Online Video Consultation", teleModeNote: "e-Sanjeevani Tele-OPD from home", dateStripLabel: "Choose a date", shiftLabel: "Choose a session", morningShift: "Morning Session", morningShiftNote: "09:00 AM to 11:00 AM · 6 slots open", middayShift: "Mid-Day Session", middayShiftNote: "11:30 AM to 01:30 PM · 14 slots open", afternoonShift: "Afternoon Session", afternoonShiftNote: "02:30 PM to 04:30 PM · 8 slots open", appointmentWaitHint: "Choose a date and session to see the estimated consultation time.", appointmentWaitText: "Slot {slot} · Estimated doctor consultation {seen}", slipMode: "Mode", slipLink: "Tele-OPD link", voiceSilence: "No words were captured. Listening has stopped.",
        labEyebrow: "Diagnostic services", labTitle: "Book lab tests and scans", labIntro: "Choose a test, a public hospital diagnostic centre, and a simulated slot. Fees and availability are mock data for this prototype.", labMockNote: "No test is booked, no payment is taken, and no health record is created.", labBookingTitle: "Prepare a test request", labSelectionNote: "Your selections stay in this browser until you create a mock request.", labHospitalLabel: "Choose hospital lab", labDateLabel: "Select date", labTimeLabel: "Select time slot", beforeTestTitle: "Before test", beforeFasting: "Fasting: 10 to 12 hours overnight for sugar and lipid profiles. Plain water is permitted.", beforeMedication: "Medication: take regular BP medicines with water unless a doctor has instructed otherwise.", beforeScans: "Scans and MRI: wear loose cotton clothing without metal zippers or jewelry. Arrive with a full bladder for abdominal ultrasound.", afterTestTitle: "After test", afterSnack: "Have a light snack immediately after a blood draw.", afterReports: "Digital test reports are linked to your profile within 4 to 24 hours.", paymentTitle: "How would you pay?", paymentFree: "Free under Ayushman Bharat / PM-JAY / BPL Card", paymentCounter: "Pay Nominal Govt Fee at Hospital Counter (Cash/Card)", paymentUpi: "Instant Online Mock Payment (UPI / QR)", labBookButton: "Create mock test request", reportTitle: "Digital health record preview", reportReady: "Report Status: Ready for Download", reportDoctor: "Doctor sign-off shown for this mock preview.", downloadReport: "Download report preview",
        bloodEyebrow: "Delhi blood network", bloodTitle: "Blood bank stock and donor help", bloodIntro: "Check the sample stock monitor, create an emergency request slip, or offer to donate locally. Call the blood bank before travelling.", bloodMockNote: "Stock counts, request tokens and donor confirmation tokens are mock data. This page does not reserve blood.", stockTitle: "Live Delhi hospital blood stock monitor", stockNote: "Sample availability, checked for this demo.", bloodBankColumn: "Blood bank", emergencyBloodTitle: "Emergency blood request", emergencyBloodNote: "Use this mock slip to organise a call with the on-duty blood bank officer. It is not a reservation.", bloodPatientLabel: "Patient Name", bloodWardLabel: "Hospital Ward / ICU bed number", bloodGroupLabel: "Blood Group needed", bloodUnitsLabel: "Units required", bloodComponentLabel: "Component", doctorNameLabel: "Attending Doctor Name", doctorContactLabel: "Attending Doctor Contact", bloodRequestButton: "Generate emergency blood token slip", donorTitle: "Register as a voluntary donor", donorNote: "This mock registration stays in browser memory for this session and is not saved. A blood bank must confirm eligibility before donation.", donorNameLabel: "Name", donorAgeLabel: "Age", donorGroupLabel: "Blood Group", donorLocalityLabel: "Locality", donorLastDateLabel: "Last Donation Date", donorButton: "Save donor registration locally", helplineTitle: "24/7 national emergency helplines", helpline104: "Health & Blood Helpline", helpline1910: "National Blood Transfusion Council Helpline", helpline108: "Disaster Emergency",
        stockAvailable: "Stock Available", stockModerate: "Moderate", stockCritical: "Critical / Low Stock", bloodTokenTitle: "Emergency Blood Token Slip", bloodTokenCall: "Call the on-duty blood bank officer now.", donorSaved: "Donor registration saved locally. Confirmation token:", labRequestCreated: "Mock test request created. Keep this confirmation for the diagnostic counter.", labReportDownloaded: "A mock report preview has been downloaded."
      });
      Object.assign(copy.hi, {
        labNav: "लैब टेस्ट और स्कैन", bloodNav: "ब्लड बैंक", backToServices: "← सेवाओं पर वापस", startBooking: "ओपीडी ट्रायेज और स्लॉट बुक करें →", serviceGridKicker: "सेवाएँ एक नज़र में", serviceGridTitle: "आज आपको किस मदद की ज़रूरत है?", opdService: "ओपीडी काउंटर ट्रायेज", opdServiceNote: "पहला सही काउंटर खोजें", labService: "लैब और स्कैन बुक करें", labServiceNote: "तैयारी और शुल्क देखें", bloodService: "ब्लड बैंक सूची", bloodServiceNote: "नकली स्टॉक और डोनर देखें", teleService: "ऑनलाइन वीडियो टेली-ओपीडी", teleServiceNote: "घर से शुरू करें",
        patientDetailsKicker: "चरण 1 · मरीज़ की जानकारी", patientDetailsTitle: "बताइए अपॉइंटमेंट किसके लिए है", patientDetailsNote: "यह जानकारी इस सत्र में इसी ब्राउज़र में रहेगी। आधार, आभा, यूएचआईडी, ओटीपी या असली स्वास्थ्य रिकॉर्ड न लिखें।", patientNameLabel: "मरीज़ का पूरा नाम", patientNamePlaceholder: "मरीज़ का नाम लिखें", patientPhoneLabel: "एसएमएस संपर्क", patientPhonePlaceholder: "कोई फ़ोन नंबर नहीं लिया जाता। यहाँ दिखने वाली याददिहानी इसी ब्राउज़र में नकली है।", numericAgeLabel: "उम्र का वर्ग", ageBabyNumeric: "0 से 1 साल (शिशु)", ageChildNumeric: "2 से 12 साल (बच्चा)", ageAdolescent: "13 से 17 साल (किशोर)", ageAdultNumeric: "18 से 44 साल (युवा वयस्क)", ageMiddle: "45 से 59 साल (मध्यम उम्र)", ageOlderNumeric: "60 साल से अधिक (वरिष्ठ नागरिक)", exactAgeLabel: "सटीक उम्र (वैकल्पिक)", exactAgePlaceholder: "जैसे 42", genderLabel: "लिंग चुनें", genderMale: "पुरुष", genderFemale: "महिला", genderOther: "अन्य", conditionsLabel: "पहले से मौजूद स्वास्थ्य स्थिति", conditionDiabetes: "मधुमेह", conditionHypertension: "हाई ब्लड प्रेशर", conditionHeart: "हृदय की स्थिति", conditionAsthma: "अस्थमा / साँस", conditionPregnancy: "गर्भावस्था", conditionNone: "कोई पहले की स्थिति नहीं",
        appointmentStepLabel: "चरण 4 · अपॉइंटमेंट विकल्प", consultationModeTitle: "ओपीडी टीम से कैसे मिलना चाहेंगे?", teleModeSelected: "ऑनलाइन वीडियो सलाह चुनी गई है। अस्पताल और स्लॉट चुनने के बाद सुरक्षित नकली टेली-ओपीडी जानकारी दिखेगी।", inPersonMode: "अस्पताल में आमने-सामने", inPersonModeNote: "ओपीडी काउंटर पर जाएँ", teleMode: "ऑनलाइन वीडियो सलाह", teleModeNote: "घर से ई-संजीवनी टेली-ओपीडी", dateStripLabel: "तारीख चुनें", shiftLabel: "सत्र चुनें", morningShift: "सुबह का सत्र", morningShiftNote: "सुबह 09:00 से 11:00 · 6 स्लॉट खुले", middayShift: "दोपहर का सत्र", middayShiftNote: "11:30 से 01:30 · 14 स्लॉट खुले", afternoonShift: "शाम से पहले का सत्र", afternoonShiftNote: "02:30 से 04:30 · 8 स्लॉट खुले", appointmentWaitHint: "अनुमानित समय देखने के लिए तारीख और सत्र चुनें।", appointmentWaitText: "स्लॉट {slot} · डॉक्टर से मिलने का अनुमानित समय {seen}", slipMode: "तरीका", slipLink: "टेली-ओपीडी लिंक", voiceSilence: "कोई शब्द नहीं मिले। सुनना बंद हो गया है।",
        labEyebrow: "जाँच सेवाएँ", labTitle: "लैब टेस्ट और स्कैन बुक करें", labIntro: "टेस्ट, सार्वजनिक अस्पताल की जाँच जगह और नकली स्लॉट चुनें। शुल्क और उपलब्धता इस प्रोटोटाइप की नकली जानकारी है।", labMockNote: "कोई टेस्ट बुक नहीं होता, भुगतान नहीं लिया जाता और स्वास्थ्य रिकॉर्ड नहीं बनता।", labBookingTitle: "टेस्ट का अनुरोध तैयार करें", labSelectionNote: "नकली अनुरोध बनाने तक आपकी पसंद इसी ब्राउज़र में रहेगी।", labHospitalLabel: "अस्पताल की लैब चुनें", labDateLabel: "तारीख चुनें", labTimeLabel: "समय चुनें", beforeTestTitle: "टेस्ट से पहले", beforeFasting: "शुगर और लिपिड प्रोफ़ाइल के लिए रात में 10 से 12 घंटे खाली पेट रहें। सादा पानी पी सकते हैं।", beforeMedication: "डॉक्टर ने अलग न कहा हो तो नियमित बीपी की दवा पानी के साथ लें।", beforeScans: "स्कैन और एमआरआई में ढीले सूती कपड़े पहनें। पेट के अल्ट्रासाउंड के लिए मूत्राशय भरा रखें।", afterTestTitle: "टेस्ट के बाद", afterSnack: "खून लेने के बाद हल्का नाश्ता करें।", afterReports: "डिजिटल रिपोर्ट 4 से 24 घंटे में प्रोफ़ाइल पर जुड़ती है।", paymentTitle: "भुगतान कैसे करेंगे?", paymentFree: "आयुष्मान भारत / पीएम-जय / बीपीएल कार्ड में मुफ्त", paymentCounter: "अस्पताल काउंटर पर मामूली सरकारी शुल्क (नकद/कार्ड)", paymentUpi: "तुरंत ऑनलाइन नकली भुगतान (यूपीआई / क्यूआर)", labBookButton: "नकली टेस्ट अनुरोध बनाएँ", reportTitle: "डिजिटल स्वास्थ्य रिकॉर्ड का नमूना", reportReady: "रिपोर्ट स्थिति: डाउनलोड के लिए तैयार", reportDoctor: "इस नकली नमूने में सत्यापित डॉक्टर की स्वीकृति दिखाई गई है।", downloadReport: "रिपोर्ट का नमूना डाउनलोड करें",
        bloodEyebrow: "दिल्ली ब्लड नेटवर्क", bloodTitle: "ब्लड बैंक स्टॉक और डोनर सहायता", bloodIntro: "नमूना स्टॉक देखें, इमरजेंसी अनुरोध की स्लिप बनाएँ या स्थानीय रक्तदाता बनें। जाने से पहले ब्लड बैंक को फ़ोन करें।", bloodMockNote: "स्टॉक, अनुरोध टोकन और डोनर टोकन नकली हैं। यह पेज खून रिज़र्व नहीं करता।", stockTitle: "दिल्ली अस्पताल ब्लड स्टॉक मॉनिटर", stockNote: "इस डेमो के लिए जाँची गई नमूना उपलब्धता।", bloodBankColumn: "ब्लड बैंक", emergencyBloodTitle: "इमरजेंसी ब्लड अनुरोध", emergencyBloodNote: "ऑन-ड्यूटी ब्लड बैंक अधिकारी से बात करने के लिए यह नकली स्लिप बनाएँ। यह रिज़र्वेशन नहीं है।", bloodPatientLabel: "मरीज़ का नाम", bloodWardLabel: "अस्पताल वार्ड / आईसीयू बेड नंबर", bloodGroupLabel: "चाहिए ब्लड ग्रुप", bloodUnitsLabel: "कितनी यूनिट", bloodComponentLabel: "घटक", doctorNameLabel: "ड्यूटी डॉक्टर का नाम", doctorContactLabel: "ड्यूटी डॉक्टर का संपर्क", bloodRequestButton: "इमरजेंसी ब्लड टोकन स्लिप बनाएँ", donorTitle: "स्वैच्छिक रक्तदाता बनें", donorNote: "रजिस्ट्रेशन केवल इसी ब्राउज़र में सेव होगा। रक्तदान से पहले ब्लड बैंक पात्रता जाँचेगा।", donorNameLabel: "नाम", donorAgeLabel: "उम्र", donorGroupLabel: "ब्लड ग्रुप", donorLocalityLabel: "इलाका", donorLastDateLabel: "पिछली बार रक्तदान की तारीख", donorButton: "डोनर रजिस्ट्रेशन इसी ब्राउज़र में सेव करें", helplineTitle: "24/7 राष्ट्रीय इमरजेंसी हेल्पलाइन", helpline104: "स्वास्थ्य और ब्लड हेल्पलाइन", helpline1910: "राष्ट्रीय ब्लड ट्रांसफ्यूजन काउंसिल हेल्पलाइन", helpline108: "आपदा इमरजेंसी", stockAvailable: "स्टॉक उपलब्ध", stockModerate: "मध्यम", stockCritical: "बहुत कम स्टॉक", bloodTokenTitle: "इमरजेंसी ब्लड टोकन स्लिप", bloodTokenCall: "अभी ऑन-ड्यूटी ब्लड बैंक अधिकारी को फ़ोन करें।", donorSaved: "डोनर रजिस्ट्रेशन इसी ब्राउज़र में सेव हुआ। पुष्टि टोकन:", labRequestCreated: "नकली टेस्ट अनुरोध बन गया। इसे जाँच काउंटर के लिए रखें।", labReportDownloaded: "रिपोर्ट का नकली नमूना डाउनलोड हो गया।"
      });
      Object.assign(copy.en, {
        someoneElse: "Someone else (Caregiver)", whoLabel: "Caregiver relationship", parent: "My Parent", child: "My Child",
        patientNamePlaceholder: "e.g. Ramesh Kumar / Priya Sharma", patientPhonePlaceholder: "No phone number is collected. Any reminder shown is simulated in this browser.",
        regionEyes: "Eyes / vision", regionNose: "Nose / sinuses / breathing", regionEars: "Ears / hearing", regionTeeth: "Teeth / mouth / jaw", regionShoulder: "Shoulder joints", regionKnee: "Knee joints", regionHand: "Hands & wrists", regionFoot: "Feet & ankles", regionPelvis: "Pelvis, Groin & Reproductive", regionUpperBack: "Upper back & spine", regionLowerBack: "Lower back & lumbar", headView: "Head & Face", deptENT: "ENT", deptOphthalmology: "Ophthalmology",
        comparisonDepartment: "Department selection", orsDepartment: "Forces patients to guess a medical specialty before seeing open slots.", raahatDepartment: "Zero-Knowledge Triage starts with where it hurts, then shows the matching counter.", comparisonWait: "Queue transparency", orsWait: "Phantom morning slot times with zero wait context.", raahatWait: "Honest Queue Wait calculated around doctor morning rounds.", comparisonAuth: "Front-door access", orsAuth: "Blocks citizens with distorted CAPTCHAs and OTPs upfront.", raahatAuth: "Friction-free symptom discovery; 1-tap verification only when making a specimen slip.", comparisonEmergency: "Emergency safety", orsEmergency: "Allows routine booking for acute stroke or cardiac cases.", raahatEmergency: "Halts routine booking on Red Flags and escalates to 24/7 Emergency.", comparisonAccess: "Non-literate accessibility", orsAccess: "Requires desktop 1920×1080 resolution and text literacy.", raahatAccess: "100% mobile-first with a visual 3D/2D body map and spoken voice intake.",
        faqSafetyA: "No. Raahat is administrative triage, not a diagnosis or a doctor. You see and confirm the structured complaint before code applies the published rules; one Red Flag is enough to send you to Emergency.", faqRedFlagA: "Routine booking stops immediately. The result tells you to go to a 24/7 Emergency department now, shows the rule reference, and does not issue an OPD appointment.", faqPrivacyA: "No server stores this data. The complaint and patient details stay in this browser for this session; the body-map route sends nothing to an outside service. Do not enter Aadhaar, ABHA, UHID, OTPs or real health records.", faqWaitA: "The wait is simulated from the selected slot, doctor morning-round timing and sample queue throughput. It is an honest estimate for this prototype, not live hospital queue data.", faqOrsA: "ORS asks patients to choose a hospital and department first. Raahat offers Zero-Knowledge Triage from where it hurts, transparent simulated queue context, and emergency safeguards. It does not connect to ORS.", faqAbdmA: "Not today. This prototype does not connect to ABDM, e-Hospital HMIS or any government system. A future integration would require explicit consent, security review and a public-service partnership.",
        roadmapTitle: "What’s next for Raahat", roadmapNote: "A civic roadmap for turning this prototype into a more connected, accessible public-service front door.", roadmapAbdmTitle: "ABDM & e-Hospital integration", roadmapAbdmNote: "Link generated specimen tokens directly into the Ayushman Bharat Digital Mission (ABDM) and national Hospital Management Information Systems (HMIS).", roadmapIvrTitle: "AI Voice IVR for feature phones (104 integration)", roadmapIvrNote: "Let rural citizens dial a toll-free number, speak symptoms in 22 regional dialects—including Bhojpuri, Maithili, Tamil and Bengali—and receive an OPD appointment token by SMS.", roadmapQueueTitle: "Real-time hospital queue vision", roadmapQueueNote: "Integrate waiting-hall token counters to stream live consultation turnaround times before citizens leave home.", roadmapLanguagesTitle: "Pan-India vernacular expansion", roadmapLanguagesNote: "Build native voice and dialect support across all 22 scheduled Indian languages."
      });
      Object.assign(copy.hi, {
        someoneElse: "किसी और के लिए (केयरगिवर)", whoLabel: "देखभाल करने वाले का रिश्ता", parent: "मेरे माता-पिता", child: "मेरा बच्चा",
        patientNamePlaceholder: "उदा. रमेश कुमार / प्रिया शर्मा", patientPhonePlaceholder: "कोई फ़ोन नंबर नहीं लिया जाता। यहाँ दिखने वाली याददिहानी इसी ब्राउज़र में नकली है।",
        regionEyes: "आँखें / नज़र", regionNose: "नाक / साइनस / साँस नली", regionEars: "कान और गला", regionTeeth: "दाँत और मुँह / जबड़ा", regionShoulder: "कंधे", regionKnee: "घुटने", regionHand: "हाथ और कलाई", regionFoot: "पैर और टखने", regionPelvis: "पेल्विस, जननांग व प्रजनन स्वास्थ्य", regionUpperBack: "ऊपरी पीठ / रीढ़", regionLowerBack: "कमर / निचली पीठ", headView: "सिर व चेहरा", deptENT: "ईएनटी", deptOphthalmology: "नेत्र रोग",
        comparisonDepartment: "विभाग चुनना", orsDepartment: "खुले स्लॉट देखने से पहले मरीज को मेडिकल विभाग का अनुमान लगाना पड़ता है।", raahatDepartment: "जीरो-नॉलेज ट्रायेज जहाँ दर्द है वहाँ से शुरू होकर सही काउंटर दिखाता है।", comparisonWait: "कतार की पारदर्शिता", orsWait: "सुबह के नकली स्लॉट समय, बिना इंतज़ार के संदर्भ के।", raahatWait: "डॉक्टर के सुबह के राउंड के आधार पर ईमानदार कतार इंतज़ार।", comparisonAuth: "पहुँच की शुरुआत", orsAuth: "शुरुआत में टेढ़े CAPTCHA और OTP से नागरिक रुक जाते हैं।", raahatAuth: "परेशानी खोजने में कोई रुकावट नहीं; सिर्फ नमूना स्लिप बनाते समय एक-टैप पहचान।", comparisonEmergency: "इमरजेंसी सुरक्षा", orsEmergency: "तेज़ स्ट्रोक या हृदय की परेशानी में भी साधारण स्लॉट बुक हो सकता है।", raahatEmergency: "रेड फ्लैग पर साधारण बुकिंग तुरंत रोककर 24/7 इमरजेंसी तक पहुँचाता है।", comparisonAccess: "कम पढ़ने वालों की पहुँच", orsAccess: "1920×1080 डेस्कटॉप और टेक्स्ट पढ़ने की ज़रूरत।", raahatAccess: "100% मोबाइल-फर्स्ट: दृश्य 3D/2D शरीर का नक्शा और आवाज़ में जानकारी।",
        faqSafetyA: "नहीं। राहत प्रशासनिक ट्रायेज है, बीमारी की पहचान या डॉक्टर नहीं। आप नियम लागू होने से पहले व्यवस्थित विवरण देखकर पुष्टि करते हैं; एक रेड फ्लैग इमरजेंसी के लिए काफ़ी है।", faqRedFlagA: "साधारण बुकिंग तुरंत रुक जाती है। नतीजा अभी 24/7 इमरजेंसी जाने को कहता है, नियम संदर्भ दिखाता है और ओपीडी अपॉइंटमेंट जारी नहीं करता।", faqPrivacyA: "कोई सर्वर यह जानकारी सेव नहीं करता। परेशानी और मरीज की जानकारी इस सत्र में इसी ब्राउज़र में रहती है; शरीर के नक्शे वाला रास्ता किसी बाहरी सेवा को कुछ नहीं भेजता। आधार, आभा, यूएचआईडी, ओटीपी या असली स्वास्थ्य रिकॉर्ड न लिखें।", faqWaitA: "इंतज़ार का समय चुने गए स्लॉट, डॉक्टर के सुबह के राउंड और नमूना कतार की गति से नकली रूप में निकाला जाता है। यह इस प्रोटोटाइप का ईमानदार अनुमान है, लाइव अस्पताल कतार नहीं।", faqOrsA: "ORS पहले अस्पताल और विभाग चुनने को कहता है। राहत जहाँ दर्द है वहाँ से जीरो-नॉलेज ट्रायेज, साफ़ नकली कतार संदर्भ और इमरजेंसी सुरक्षा देता है। यह ORS से जुड़ा नहीं है।", faqAbdmA: "अभी नहीं। यह प्रोटोटाइप ABDM, e-Hospital HMIS या किसी सरकारी सिस्टम से नहीं जुड़ा है। भविष्य में जोड़ने के लिए साफ़ सहमति, सुरक्षा जाँच और सार्वजनिक सेवा साझेदारी ज़रूरी होगी।",
        roadmapTitle: "राहत के लिए आगे क्या?", roadmapNote: "इस प्रोटोटाइप को अधिक जुड़े हुए और आसान सार्वजनिक सेवा के दरवाज़े में बदलने का नागरिक रोडमैप।", roadmapAbdmTitle: "ABDM और e-Hospital इंटीग्रेशन", roadmapAbdmNote: "बनाए गए नमूना टोकन को आयुष्मान भारत डिजिटल मिशन (ABDM) और राष्ट्रीय हॉस्पिटल मैनेजमेंट इन्फॉर्मेशन सिस्टम (HMIS) से सीधे जोड़ना।", roadmapIvrTitle: "फीचर फोन के लिए AI वॉइस IVR (104 इंटीग्रेशन)", roadmapIvrNote: "ग्रामीण नागरिक टोल-फ्री नंबर पर 22 क्षेत्रीय बोलियों—भोजपुरी, मैथिली, तमिल और बंगाली सहित—में परेशानी बोलें और SMS से ओपीडी टोकन पाएँ।", roadmapQueueTitle: "अस्पताल की लाइव कतार की तस्वीर", roadmapQueueNote: "वेटिंग हॉल के टोकन काउंटर जोड़कर घर से निकलने से पहले परामर्श का लाइव समय दिखाना।", roadmapLanguagesTitle: "पूरे भारत में स्थानीय भाषाओं का विस्तार", roadmapLanguagesNote: "सभी 22 अनुसूचित भारतीय भाषाओं में मूल आवाज़ और बोली का समर्थन बनाना।"
      });
      
      
      Object.assign(copy.en, {
  "brandTagline": "Point at where it hurts. We'll do the rest.",
  "doctorNav": "Hospital Portal",
  "profileNav": "My Profile",
  "profileShort": "Profile",
  "footerDesc": "A citizen-first triage front door for Indian government hospitals. Helping citizens reach the right OPD counter through native voice, 22 regional languages, and interactive 3D body mapping.",
  "serviceDoctorTitle": "Hospital & Doctor Suite",
  "serviceDoctorDesc": "Live queue & SBAR handover",
  "serviceProfileTitle": "My Patient Profile",
  "serviceProfileDesc": "Live OPD pass & visit records",
  "serviceLabTitle": "Lab Tests & Scans",
  "serviceLabDesc": "e-Hospital rates & slots",
  "serviceBloodTitle": "Blood Bank",
  "serviceBloodDesc": "Real-time e-RaktKosh stock",
  "serviceTeleTitle": "Tele-Consultation",
  "serviceTeleDesc": "AIIMS Tele-OPD booth",
  "statOrsWait": "Avg. ORS Wait in Wrong Lines",
  "statRaahatWait": "Avg. Wait with Raahat Triage",
  "statReferralDrop": "Drop in Wrong Counter Referrals",
  "statVerifiedDirectory": "Pan-India Verified Directory",
  "filterByState": "Filter by State / Region:",
  "doctorTitle": "Hospital OPD Counter & Doctor Portal",
  "doctorSubtitle": "Live patient queue, 10-second SBAR clinical handover, and verified token verification.",
  "doctorQueueTitle": "Live Token Queue",
  "doctorCallNext": "Call Next Patient",
  "doctorMarkSeen": "Complete Consultation & Sign Rx",
  "doctorEscalateEmergency": "Escalate to 24/7 Emergency",
  "doctorOrderTests": "Order Hospital Lab Tests"
});
      Object.assign(copy.hi, {
  "brandTagline": "जहाँ दर्द है वहाँ बताइए। बाकी हम करेंगे।",
  "doctorNav": "अस्पताल पोर्टल",
  "profileNav": "मेरी प्रोफाइल",
  "profileShort": "प्रोफाइल",
  "footerDesc": "भारतीय सरकारी अस्पतालों के लिए नागरिक-प्रथम ट्रायेज फ्रंट डोर। देशी आवाज़, 22 क्षेत्रीय भाषाओं और इंटरैक्टिव 3D बॉडी मैप द्वारा सही काउंटर तक मार्गदर्शन।",
  "serviceDoctorTitle": "अस्पताल और डॉक्टर सुइट",
  "serviceDoctorDesc": "लाइव कतार और SBAR हैंडओवर",
  "serviceProfileTitle": "मेरी मरीज प्रोफाइल",
  "serviceProfileDesc": "लाइव ओपीडी पास और इतिहास",
  "serviceLabTitle": "लैब टेस्ट और स्कैन",
  "serviceLabDesc": "ई-हॉस्पिटल दरें और स्लॉट",
  "serviceBloodTitle": "ब्लड बैंक",
  "serviceBloodDesc": "रियल-टाइम ई-रक्तकोश स्टॉक",
  "serviceTeleTitle": "टेली-परामर्श",
  "serviceTeleDesc": "एम्स टेली-ओपीडी बूथ",
  "statOrsWait": "गलत लाइन में ORS का औसत इंतज़ार",
  "statRaahatWait": "राहत ट्रायेज के साथ औसत इंतज़ार",
  "statReferralDrop": "गलत काउंटर रेफरल में कमी",
  "statVerifiedDirectory": "अखिल भारतीय सत्यापित निर्देशिका",
  "filterByState": "राज्य / क्षेत्र अनुसार फ़िल्टर करें:",
  "doctorTitle": "अस्पताल ओपीडी काउंटर और डॉक्टर पोर्टल",
  "doctorSubtitle": "लाइव मरीज कतार, 10-सेकंड SBAR क्लिनिकल हैंडओवर और सत्यापित टोकन जाँच।",
  "doctorQueueTitle": "लाइव टोकन कतार",
  "doctorCallNext": "अगले मरीज को बुलाएँ",
  "doctorMarkSeen": "परामर्श पूरा करें और पर्ची साइन करें",
  "doctorEscalateEmergency": "24/7 इमरजेंसी में भेजें",
  "doctorOrderTests": "अस्पताल लैब टेस्ट ऑर्डर करें"
});

      // Complete 22 Scheduled Indian Languages Vernacular Pack
      if (typeof window !== "undefined" && window.VERNACULAR_PACK) {
        for (const [code, dict] of Object.entries(window.VERNACULAR_PACK)) {
          copy[code] = Object.assign({}, copy.en, dict);
        }
      }
      for (const code of Object.keys(copy)) {
        if (code !== "hi" && code !== "en") {
          copy[code].modelDisclosure = copy.en.modelDisclosure;
          copy[code].modelBoundary = copy.en.modelBoundary;
        }
      }

      const state = { language: "en", selectedDialect: "en", selectedDialectData: null, screen: "landing", previousScreen: "landing", booking: "myself", who: null, age: null, fullName: "", phone: "", exactAge: "", gender: null, conditions: [], listening: false, region: null, side: "both", noLocation: null, kind: null, duration: null, severity: null, complaint: null, routeResult: null, locality: "central-delhi",
        userCoords: null,
        hospitalStateFilter: "All India",
        hospitalSearchQuery: "", selectedHospital: null, visitType: null, consultationMode: "in-person", appointmentDate: null, appointmentShift: null, humanChecked: false, signedIn: false, editingField: null, entryRoute: "type", mapMode: "3d", threeAvailable: true };
      const text = (key) => {
        const lang = state.language || "en";
        if (copy[lang] && copy[lang][key]) return copy[lang][key];
        if (lang === "ur" && copy.hi && copy.hi[key]) return copy.hi[key];
        if (copy.en && copy.en[key]) return copy.en[key];
        return "";
      };
      const themeToggle = document.querySelector("#theme-toggle");
      const triageScreen = document.querySelector("#screen-triage");
      const status = document.querySelector("#status");
      const complaint = document.querySelector("#complaint");
      const voiceButton = document.querySelector("#voice-button");
      const sessionNote = document.querySelector("#session-note");
      const questionContent = document.querySelector("#question-content");
      const landingScreen = document.querySelector("#screen-home");
      const bodyMapScreen = document.querySelector("#body-map-screen");
      const bodyLocationPicker = document.querySelector("#body-location-picker");
      const map3dCanvas = document.querySelector("#body-3d-canvas");
      const map3dStage = document.querySelector("#body-3d-stage");
      const toggleMapMode = document.querySelector("#toggle-map-mode");
      const threeUnavailable = document.querySelector("#three-unavailable");
      const workspaceSummary = document.querySelector("#workspace-summary");
      const kindQuestion = document.querySelector("#kind-question");
      const kindTitle = document.querySelector("#kind-title");
      const kindStatus = document.querySelector("#kind-status");
      const followups = document.querySelector("#followups");
      const mapStatus = document.querySelector("#map-status");
      const mapReady = document.querySelector("#map-ready");
      const selectedRegionName = document.querySelector("#selected-region-name");
      const selectionMessage = document.querySelector("#selection-message");
      const selectedKindName = document.querySelector("#selected-kind-name");
      const kindSelectionMessage = document.querySelector("#kind-selection-message");
      const reviewScreen = document.querySelector("#review-screen");
      const resultScreen = document.querySelector("#result-screen");
      const reviewStatus = document.querySelector("#review-status");
      const readbackWords = document.querySelector("#readback-words");
      const readbackWordsValue = document.querySelector("#readback-words-value");
      const unclearNote = document.querySelector("#unclear-note");
      const unclearValue = document.querySelector("#unclear-value");
      const readbackEditor = document.querySelector("#readback-editor");
      const editorControls = document.querySelector("#editor-controls");
      const ordinaryResult = document.querySelector("#ordinary-result");
      const emergencyResult = document.querySelector("#emergency-result");
      const emergencyHospital = document.querySelector("#emergency-hospital");
      const findHospital = document.querySelector("#find-hospital");
      const appointmentScreen = document.querySelector("#appointment-screen");
      const bookingDepartment = document.querySelector("#booking-department");
      const localitySelect = document.querySelector("#locality-select");
      const hospitalList = document.querySelector("#hospital-list");
      const carryPanel = document.querySelector("#carry-panel");
      const carryList = document.querySelector("#carry-list");
      const feeLine = document.querySelector("#fee-line");
      const toSignIn = document.querySelector("#to-sign-in");
      const signInPanel = document.querySelector("#sign-in-panel");
      const humanCheck = document.querySelector("#human-check");
      const signInButton = document.querySelector("#sign-in-button");
      const signInStatus = document.querySelector("#sign-in-status");
      const slipPanel = document.querySelector("#slip-panel");
      const honestyScreen = document.querySelector("#screen-honesty");
      const appointmentOptions = document.querySelector("#appointment-options");
      const appointmentWait = document.querySelector("#appointment-wait");
      const dateStrip = document.querySelector("#date-strip");
      const shiftGrid = document.querySelector("#shift-grid");
      const labBookingPanel = document.querySelector("#lab-booking-panel");
      const labCatalog = document.querySelector("#lab-catalog");
      const labSelectionSummary = document.querySelector("#lab-selection-summary");
      const labHospital = document.querySelector("#lab-hospital");
      const labDate = document.querySelector("#lab-date");
      const labStatus = document.querySelector("#lab-status");
      const labReportCard = document.querySelector("#lab-report-card");
      const bloodStockBody = document.querySelector("#blood-stock-body");
      const teleModeNote = document.querySelector("#tele-mode-note");
      const exactAgeInput = document.querySelector("#exact-age");
      const teleModal = document.querySelector("#tele-modal");
      const teleModalClose = document.querySelector("#tele-modal-close");
      const joinTeleRoom = document.querySelector("#join-tele-room");
      const teleMuteButton = document.querySelector("#tele-mute-button");
      const teleCameraButton = document.querySelector("#tele-camera-button");
      const teleEndButton = document.querySelector("#tele-end-button");
      const teleCallStatus = document.querySelector("#tele-call-status");
      const teleNotes = document.querySelector("#tele-notes");
      const telePrescriptionPreview = document.querySelector("#tele-prescription-preview");
      const teleSelfFeed = document.querySelector("#tele-self-feed");
      let activeRecognition = null;
      let speechSilenceTimer = null;
      let triageAudioCapture = null;
      let labSelectedTest = null;
      let teleCloseTimer = null;
      let telePreviousFocus = null;
      let telePreviousBodyOverflow = "";

      const COMPLAINT_FIELDS = ["region", "kind", "duration", "severity", "age_band"];

      function blobToBase64(blob) {
        return blob.arrayBuffer().then((arrayBuffer) => {
          const bytes = new Uint8Array(arrayBuffer);
          let binary = "";
          const chunkSize = 0x8000;
          for (let index = 0; index < bytes.length; index += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
          }
          return btoa(binary);
        });
      }

      async function transcribeBrowserAudio(blob, language = state.language) {
        if (!blob || !blob.size) return "";
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 2500);
        try {
          const response = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({ audio: await blobToBase64(blob), mimeType: blob.type || "audio/webm", language })
          });
          const payload = await response.json();
          return payload?.success && typeof payload.text === "string" ? payload.text.trim() : "";
        } catch {
          return "";
        } finally {
          window.clearTimeout(timeout);
        }
      }

      function normalizeModelComplaint(value) {
        const result = { ...value };
        const aliases = {
          eye: "eyes", eyes: "eyes", abdomen: "upper-abdomen", stomach: "upper-abdomen",
          elderly: "older", senior: "older", infant: "baby", mild: "no", moderate: "no", severe: "yes"
        };
        if (typeof result.region === "string") result.region = aliases[result.region.toLowerCase()] || result.region;
        if (typeof result.age_band === "string") result.age_band = aliases[result.age_band.toLowerCase()] || result.age_band;
        if (typeof result.severity === "string") result.severity = aliases[result.severity.toLowerCase()] || result.severity;
        if (typeof result.kind === "string") {
          const kind = result.kind.toLowerCase();
          if (kind.includes("pain") || kind.includes("ache")) result.kind = "pain";
          else if (kind.includes("fever")) result.kind = "fever";
          else if (kind.includes("cough") || kind.includes("breath")) result.kind = "breathing";
          else if (kind.includes("swell")) result.kind = "swelling";
          else if (kind.includes("rash") || kind.includes("itch")) result.kind = "rash";
          else if (kind.includes("vomit") || kind.includes("stomach")) result.kind = "vomiting";
          else if (kind.includes("dizz")) result.kind = "dizziness";
          else if (kind.includes("bleed")) result.kind = "bleeding";
          else if (kind.includes("injur") || kind.includes("hurt")) result.kind = "injury";
        }
        return result;
      }

      async function extractComplaintWithFallback(rawText) {
        const fallback = makeComplaint(false);
        const textValue = String(rawText || "").trim();
        if (!textValue) return fallback;
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 2500);
        try {
          const response = await fetch("/api/extract-complaint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({ text: textValue, language: state.selectedDialect || state.language })
          });
          const payload = await response.json();
          if (!response.ok || !payload?.success || !payload.complaint) return fallback;
          const extracted = normalizeModelComplaint(payload.complaint);
          const valueTags = Object.fromEntries(COMPLAINT_FIELDS.map((field) => [field, extracted[field] ? "Generated" : "Rule"]));
          return makeComplaint(false, {
            ...fallback,
            ...extracted,
            unclear: extracted.unclear?.length ? extracted.unclear : fallback.unclear,
            parsed: true,
            value_tags: valueTags,
            source_tag: "Generated"
          });
        } catch {
          return fallback;
        } finally {
          window.clearTimeout(timeout);
        }
      }

      async function beginTriageAudioCapture() {
        if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return;
        const capture = { chunks: [], recorder: null, stream: null };
        triageAudioCapture = capture;
        try {
          capture.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (triageAudioCapture !== capture) return;
          capture.recorder = new MediaRecorder(capture.stream);
          capture.recorder.ondataavailable = (event) => { if (event.data.size) capture.chunks.push(event.data); };
          capture.recorder.start();
        } catch {
          capture.stream?.getTracks().forEach((track) => track.stop());
          if (triageAudioCapture === capture) triageAudioCapture = null;
        }
      }

      async function finishTriageAudioCapture() {
        const capture = triageAudioCapture;
        triageAudioCapture = null;
        if (!capture) return null;
        capture.stream?.getTracks().forEach((track) => track.stop());
        if (!capture.recorder || capture.recorder.state === "inactive") return null;
        return new Promise((resolve) => {
          capture.recorder.onstop = () => resolve(new Blob(capture.chunks, { type: capture.recorder.mimeType || "audio/webm" }));
          capture.recorder.stop();
        });
      }

      function discardTriageAudioCapture() {
        const capture = triageAudioCapture;
        triageAudioCapture = null;
        capture?.stream?.getTracks().forEach((track) => track.stop());
        if (capture?.recorder && capture.recorder.state !== "inactive") {
          try { capture.recorder.stop(); } catch {}
        }
      }

      const labTests = [
        { name: "Complete Blood Count (CBC)", turnaround: "Same Day", fasting: "Not required", fee: "₹0 to ₹30" },
        { name: "Lipid Profile & Cholesterol", turnaround: "24 Hours", fasting: "10 to 12 Hours", fee: "₹0 to ₹60" },
        { name: "HbA1c & Fasting Blood Sugar", turnaround: "Same Day", fasting: "8 to 10 Hours", fee: "₹0 to ₹50" },
        { name: "Liver Function Test (LFT) & Kidney Function (KFT)", turnaround: "24 Hours", fasting: "8 Hours", fee: "₹0 to ₹80" },
        { name: "Thyroid Profile (T3, T4, TSH)", turnaround: "24 Hours", fasting: "Not required", fee: "₹0 to ₹70" },
        { name: "Chest Digital X-Ray", turnaround: "2 Hours", fasting: "Not required", fee: "₹0 to ₹40" },
        { name: "Brain / Spine MRI (1.5T / 3T)", turnaround: "Next Day", fasting: "Not required", fee: "₹0 to ₹150" },
        { name: "Abdomen & Pelvis CT Scan", turnaround: "Same Day", fasting: "Not required", fee: "₹0 to ₹120" },
        { name: "Whole Abdomen Ultrasound (USG)", turnaround: "Same Day", fasting: "Not required", fee: "₹0 to ₹50" },
        { name: "12-Lead Electrocardiogram (ECG)", turnaround: "Instant 15 mins", fasting: "Not required", fee: "₹0" },
      ];
      const labSites = [
        { name: "AIIMS Diagnostic Wing", source: "AIIMS public department list", url: "https://www.aiims.edu/index.php/en/departments-and-centers/departments" },
        { name: "Safdarjung Central Lab", source: "Safdarjung medical departments", url: "https://www.vmmc-sjh.mohfw.gov.in/medical-departments" },
        { name: "Dr. RML Radiology", source: "RML Hospital public site", url: "https://rmlh.nic.in/" },
      ];
      const bloodBanks = [
        { name: "AIIMS Central Blood Bank", address: "Ansari Nagar", values: [24, 9, 24, 2, 9, 2, 24, 2] },
        { name: "VMMC & Safdarjung Rotary Blood Bank", address: "Ring Road", values: [9, 2, 24, 9, 2, 2, 24, 9] },
        { name: "Dr. RML Hospital Blood Bank", address: "BKS Marg", values: [24, 2, 9, 2, 9, 2, 24, 2] },
        { name: "Indian Red Cross Society Blood Bank", address: "Red Cross Road", values: [9, 2, 24, 2, 2, 2, 9, 2] },
      ];
      const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
      const shiftCatalog = {
        morning: { start: "09:30", seen: "12:15" },
        midday: { start: "11:30", seen: "13:00" },
        afternoon: { start: "14:30", seen: "15:45" },
      };
      const regionCopyKeys = {
        head: "regionHead", eyes: "regionEyes", nose: "regionNose", ears: "regionEars", teeth: "regionTeeth", face: "regionFace", neck: "regionNeck", chest: "regionChest",
        "upper-abdomen": "regionUpperAbdomen", "lower-abdomen": "regionLowerAbdomen", pelvis: "regionPelvis",
        back: "regionBack", "upper-back": "regionUpperBack", "lower-back": "regionLowerBack", shoulder: "regionShoulder", arm: "regionArm", hand: "regionHand", leg: "regionLeg", knee: "regionKnee", foot: "regionFoot", general: "regionGeneral",
      };
      const kindCopyKeys = {
        pain: "kindPain", fever: "kindFever", breathing: "kindBreathing", bleeding: "kindBleeding", swelling: "kindSwelling",
        rash: "kindRash", injury: "kindInjury", vomiting: "kindVomiting", dizziness: "kindDizziness", low: "kindLow",
      };
      const durationCopyKeys = { now: "durationNow", today: "durationToday", days: "durationDays", longer: "durationLonger", unsure: "durationUnsure" };
      const severityCopyKeys = { no: "severityNo", yes: "severityYes", unsure: "severityUnsure" };
      const whoCopyKeys = { self: "myself", parent: "parent", child: "child", other: "someoneElseShort" };
      const ageCopyKeys = { baby: "ageBabyNumeric", child: "ageChildNumeric", adolescent: "ageAdolescent", adult: "ageAdultNumeric", middle: "ageMiddle", older: "ageOlderNumeric" };
      const genderCopyKeys = { male: "genderMale", female: "genderFemale", other: "genderOther" };
      const conditionCopyKeys = { diabetes: "conditionDiabetes", hypertension: "conditionHypertension", heart: "conditionHeart", asthma: "conditionAsthma", pregnancy: "conditionPregnancy", none: "conditionNone" };
      const departmentCopyKeys = { Paediatrics: "deptPaediatrics", Cardiology: "deptCardiology", Neurology: "deptNeurology", Gastroenterology: "deptGastroenterology", Orthopaedics: "deptOrthopaedics", Dermatology: "deptDermatology", Dental: "deptDental", ENT: "deptENT", Ophthalmology: "deptOphthalmology", "General Medicine": "deptGeneralMedicine", "Choose a department yourself": "deptChoose" };
      const editOptions = {
        region: ["head", "eyes", "nose", "ears", "teeth", "face", "neck", "chest", "upper-abdomen", "lower-abdomen", "pelvis", "back", "upper-back", "lower-back", "shoulder", "arm", "hand", "leg", "knee", "foot", "general"].map((value) => ({ value, label: regionCopyKeys[value] })),
        kind: Object.keys(kindCopyKeys).map((value) => ({ value, label: kindCopyKeys[value] })),
        duration: Object.keys(durationCopyKeys).map((value) => ({ value, label: durationCopyKeys[value] })),
        severity: Object.keys(severityCopyKeys).map((value) => ({ value, label: severityCopyKeys[value] })),
        who_for: Object.keys(whoCopyKeys).map((value) => ({ value, label: whoCopyKeys[value] })),
        age_band: [null, ...Object.keys(ageCopyKeys)].map((value) => ({ value, label: value === null ? "notAsked" : ageCopyKeys[value] })),
      };

      function renderRegionLabels() {
        document.querySelectorAll("[data-region-copy]").forEach((button) => {
          button.setAttribute("aria-label", text(button.dataset.regionCopy));
        });
      }

      function renderKindLabels() {
        document.querySelectorAll("[data-kind-copy]").forEach((button) => {
          button.setAttribute("aria-label", text(button.dataset.kindCopy));
        });
        document.querySelectorAll("[data-no-location-copy]").forEach((button) => {
          button.setAttribute("aria-label", text(button.dataset.noLocationCopy));
        });
      }

      function getRegionDisplayName(region, side = state.side) {
        if (!region) return text("selectionNone");
        const isBilateral = BILATERAL_REGIONS.includes(region);
        let prefix = "";
        if (isBilateral) {
          if (side === "left") prefix = state.language === "hi" ? "बायाँ " : "Left ";
          else if (side === "right") prefix = state.language === "hi" ? "दायाँ " : "Right ";
          else if (side === "both") prefix = state.language === "hi" ? "दोनों तरफ: " : "Both: ";
        }
        return prefix + text(regionCopyKeys[region]);
      }

      function renderRegionSelection() {
        if (!state.region) {
          selectedRegionName.textContent = state.noLocation ? text("selectionNone") : text("selectionEmpty");
          selectionMessage.textContent = state.noLocation ? text("selectionChosen") : text("selectionHint");
          return;
        }
        selectedRegionName.textContent = getRegionDisplayName(state.region, state.side);
        selectionMessage.textContent = text("selectionChosen");
      }

      function renderKindSelection() {
        if (!state.kind) {
          selectedKindName.textContent = text("kindEmpty");
          kindSelectionMessage.textContent = text("kindHint");
          return;
        }
        selectedKindName.textContent = text(kindCopyKeys[state.kind]);
        kindSelectionMessage.textContent = text("kindChosen");
      }

      function renderMapMode() {
        if (!state.threeAvailable) state.mapMode = "2d";
        const using3d = state.mapMode === "3d";
        bodyLocationPicker.hidden = using3d;
        map3dStage.hidden = !using3d;
        toggleMapMode.textContent = text(using3d ? "use2d" : "use3d");
        toggleMapMode.setAttribute("aria-pressed", String(!using3d));
        toggleMapMode.disabled = !state.threeAvailable;
        threeUnavailable.hidden = using3d || state.threeAvailable;
      }

      function renderWorkspace() {
        if (!state.region && !state.noLocation) {
          workspaceSummary.replaceChildren();
          const strong = document.createElement("strong");
          strong.textContent = text("workspaceEmpty");
          const note = document.createElement("span");
          note.textContent = text("workspaceAwaiting");
          workspaceSummary.append(strong, note);
          return;
        }
        workspaceSummary.replaceChildren();
        const strong = document.createElement("strong");
        strong.textContent = state.region ? getRegionDisplayName(state.region, state.side) : text("selectionNone");
        const note = document.createElement("span");
        note.textContent = state.kind ? text("kindChosen") : text("workspaceAwaiting");
        workspaceSummary.append(strong, note);
      }

      function resetKindAndFollowups() {
        state.kind = null;
        state.duration = null;
        state.severity = null;
        state.sensations = [];
        document.querySelectorAll("[data-kind], [data-duration], [data-severity], [data-sensation]").forEach((item) => item.setAttribute("aria-pressed", "false"));
        renderKindSelection();
        kindStatus.textContent = "";
        followups.hidden = true;
        mapReady.classList.remove("is-visible");
        const somaticBadge = document.querySelector("#somatic-current-region");
        if (somaticBadge) {
          somaticBadge.textContent = "All Regions · संपूर्ण शरीर";
        }
      }

      function showKindQuestion(hideLocationPicker = false) {
        kindQuestion.hidden = false;
        if (hideLocationPicker) bodyLocationPicker.hidden = true;
        kindTitle.focus();
      }

      function renderLanguage() {
        const lang = state.language || "en";
        document.documentElement.lang = lang;
        if (lang === "ur" || lang === "ks" || lang === "sd") {
          document.documentElement.dir = "rtl";
        } else {
          document.documentElement.dir = "ltr";
        }
        document.querySelectorAll("[data-copy]").forEach((element) => {
          const key = element.dataset.copy;
          const translated = text(key);
          if (translated) element.textContent = translated;
        });
        document.querySelectorAll("[data-copy-placeholder]").forEach((element) => {
          const key = element.dataset.copyPlaceholder;
          const translated = text(key);
          if (translated) element.placeholder = translated;
        });
        document.querySelectorAll("[data-language]").forEach((button) => {
          button.setAttribute("aria-pressed", String(button.dataset.language === state.language));
        });

        const openLangBtn = document.querySelector("#btn-open-languages");
        const langBadge = document.querySelector("#current-lang-badge");
        if (openLangBtn && langBadge) {
          const isSpecial = state.language !== "en" && state.language !== "hi";
          openLangBtn.setAttribute("aria-pressed", String(isSpecial));
          if (isSpecial && state.selectedDialectData) {
            langBadge.textContent = `${state.selectedDialectData.nativeName} (${state.selectedDialectData.name}) ▾`;
          } else if (state.language === "hi") {
            langBadge.textContent = "22 भाषाएँ ▾";
          } else {
            langBadge.textContent = "22 Languages ▾";
          }
        }
        voiceButton.setAttribute("aria-label", state.listening ? text("voiceStop") : text("voiceStart"));
        document.querySelector("#voice-label").textContent = state.listening ? text("voiceLabelStop") : text("voiceLabel");
        renderRegionLabels();
        renderKindLabels();
        renderRegionSelection();
        renderKindSelection();
        renderMapMode();
        renderWorkspace();

      // Initialize smart location controls & listeners
      const btnAutoDetectLocation = document.querySelector("#btn-auto-detect-location");
      const locationSearchInput = document.querySelector("#location-search-input");
      const stateFilterSelect = document.querySelector("#state-filter-select");
      const btnToggleMap = document.querySelector("#btn-toggle-map");
      const hospitalMapPanel = document.querySelector("#hospital-map-panel");
      const districtSuggestions = document.querySelector("#district-suggestions");

      if (stateFilterSelect) {
        stateFilterSelect.replaceChildren();
        INDIAN_STATES.forEach((st) => {
          const opt = document.createElement("option");
          opt.value = st;
          opt.textContent = st === "All India" ? "All India (2,630+ Facilities)" : st;
          stateFilterSelect.append(opt);
        });
        stateFilterSelect.value = state.hospitalStateFilter || "All India";
        stateFilterSelect.addEventListener("change", () => {
          state.hospitalStateFilter = stateFilterSelect.value;
          state.selectedHospital = null;
          renderAppointment();
        });
      }

      if (districtSuggestions && typeof INDIAN_DISTRICTS !== "undefined") {
        districtSuggestions.replaceChildren();
        INDIAN_DISTRICTS.forEach((d) => {
          const opt = document.createElement("option");
          opt.value = d;
          districtSuggestions.append(opt);
        });
      }

      if (btnAutoDetectLocation) {
        btnAutoDetectLocation.addEventListener("click", () => {
          if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser. Please search your city or district in the box.");
            return;
          }
          const labelSpan = btnAutoDetectLocation.querySelector("span:nth-child(2)");
          if (labelSpan) labelSpan.textContent = "Detecting GPS location...";
          btnAutoDetectLocation.disabled = true;

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              btnAutoDetectLocation.disabled = false;
              if (labelSpan) labelSpan.textContent = "📍 Auto-Detect Nearest Hospital";
              state.userCoords = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                name: "Your Device Location (GPS)"
              };
              state.selectedHospital = null; // auto-select closest to this new location
              renderAppointment();
              if (hospitalLeafletMap) {
                hospitalLeafletMap.flyTo([pos.coords.latitude, pos.coords.longitude], 13);
              }
            },
            (err) => {
              btnAutoDetectLocation.disabled = false;
              if (labelSpan) labelSpan.textContent = "📍 Auto-Detect Nearest Hospital";
              console.warn("Geolocation request dismissed or unavailable:", err);
              if (locationSearchInput) {
                locationSearchInput.focus();
                locationSearchInput.placeholder = "GPS unavailable. Type your city or district here...";
              }
            },
            { timeout: 10000, maximumAge: 60000 }
          );
        });
      }

      if (locationSearchInput) {
        const handleSearch = () => {
          const q = locationSearchInput.value.trim().toLowerCase();
          if (!q) return;
          // Search in LOCALITIES or PAN_INDIA_HOSPITALS
          const matchedLoc = LOCALITIES.find((l) => l.label.toLowerCase().includes(q));
          if (matchedLoc) {
            state.userCoords = { lat: matchedLoc.lat, lng: matchedLoc.lng, name: matchedLoc.label };
            state.selectedHospital = null;
            renderAppointment();
            return;
          }
          const matchedHosp = PAN_INDIA_HOSPITALS.find((h) => 
            (h.city && h.city.toLowerCase().includes(q)) || 
            (h.district && h.district.toLowerCase().includes(q)) ||
            (h.state && h.state.toLowerCase().includes(q)) ||
            h.name.toLowerCase().includes(q)
          );
          if (matchedHosp && matchedHosp.lat != null) {
            state.userCoords = { lat: matchedHosp.lat, lng: matchedHosp.lng, name: matchedHosp.city || matchedHosp.state };
            state.selectedHospital = matchedHosp.id;
            renderAppointment();
          }
        };
        locationSearchInput.addEventListener("change", handleSearch);
        locationSearchInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
          }
        });
      }

      if (btnToggleMap && hospitalMapPanel) {
        let mapVisible = true;
        btnToggleMap.addEventListener("click", () => {
          mapVisible = !mapVisible;
          hospitalMapPanel.style.display = mapVisible ? "block" : "none";
          const toggleText = document.querySelector("#map-toggle-text");
          if (toggleText) toggleText.textContent = mapVisible ? "Hide Map" : "Show Map";
          if (mapVisible && hospitalLeafletMap) {
            setTimeout(() => hospitalLeafletMap.invalidateSize(), 150);
          }
        });
      }

        teleModeNote.hidden = state.consultationMode !== "tele";
        renderBloodStock();
        renderTheme();
        bodyMap3d?.setLanguage?.(state.language);
        if (!reviewScreen.hidden && state.complaint) {
          renderReadback();
          if (state.editingField) renderEditor(state.editingField);
        }
        if (!resultScreen.hidden && state.complaint) showResult();
        if (!appointmentScreen.hidden && state.complaint) renderAppointment();
        if (!status.dataset.persistent) status.textContent = "";
      }

      function renderTheme() {
        const dark = document.documentElement.dataset.theme === "dark";
        themeToggle?.setAttribute("aria-label", text(dark ? "themeLight" : "themeDark"));
        themeToggle?.setAttribute("title", text(dark ? "themeLight" : "themeDark"));
        if (themeToggle) themeToggle.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#icon-${dark ? "sun" : "moon"}"></use></svg>`;
      }

      function renderStepper(activeStep = 1) {
        document.querySelectorAll("[data-step]").forEach((step) => {
          const stepNumber = Number(step.dataset.step);
          step.classList.toggle("is-current", stepNumber === activeStep);
          step.classList.toggle("is-complete", stepNumber < activeStep);
          if (stepNumber === activeStep) step.setAttribute("aria-current", "step");
          else step.removeAttribute("aria-current");
        });
      }

      function showStatus(message, alert = false) {
        status.textContent = message;
        status.dataset.persistent = "true";
        if (alert) status.setAttribute("role", "alert"); else status.removeAttribute("role");
      }

      document.querySelectorAll("[data-language]").forEach((button) => {
        button.addEventListener("click", () => {
          state.language = button.dataset.language;
          state.selectedDialect = state.language;
          state.selectedDialectData = SCHEDULED_LANGUAGES_22.find((l) => l.code === state.language) || null;
          status.dataset.persistent = "";
          renderLanguage();
        });
      });
      themeToggle?.addEventListener("click", () => {
        const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        if (nextTheme === "dark") document.documentElement.dataset.theme = "dark";
        else document.documentElement.removeAttribute("data-theme");
        try { localStorage.setItem("raahat-theme", nextTheme); } catch { /* Keep working when storage is unavailable. */ }
        renderTheme();
      });

      document.querySelectorAll("[data-booking]").forEach((button) => {
        button.addEventListener("click", () => {
          state.booking = button.dataset.booking;
          document.querySelectorAll("[data-booking]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
          document.querySelector("[data-caregiver]").hidden = state.booking !== "someone";
          if (state.booking !== "someone") { state.who = null; state.age = null; }
        });
      });

      document.querySelectorAll("[data-who]").forEach((button) => {
        button.addEventListener("click", () => {
          state.who = button.dataset.who;
          document.querySelectorAll("[data-who]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        });
      });

      const ageBandRanges = Object.freeze({
        baby: { min: 0, max: 1, placeholder: "0 to 1 year" },
        child: { min: 2, max: 12, placeholder: "2 to 12 years" },
        adolescent: { min: 13, max: 17, placeholder: "13 to 17 years" },
        adult: { min: 18, max: 44, placeholder: "18 to 44 years" },
        middle: { min: 45, max: 59, placeholder: "45 to 59 years" },
        older: { min: 60, max: 120, placeholder: "60+ years" },
      });

      function ageBandForValue(rawValue) {
        if (String(rawValue).trim() === "") return null;
        const age = Number(rawValue);
        if (!Number.isInteger(age) || age < 0 || age > 120) return null;
        return Object.entries(ageBandRanges).find(([, range]) => age >= range.min && age <= range.max)?.[0] || null;
      }

      function renderAgeButtons() {
        document.querySelectorAll("[data-age]").forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.age === state.age)));
      }

      function syncAgeFromExactValue(rawValue) {
        state.exactAge = rawValue;
        state.age = ageBandForValue(rawValue);
        if (state.complaint) {
          state.complaint.exact_age = rawValue;
          state.complaint.age_band = state.age;
        }
        renderAgeButtons();
      }

      document.querySelectorAll("[data-age]").forEach((button) => {
        button.addEventListener("click", () => {
          state.age = button.dataset.age;
          const selectedRange = ageBandRanges[state.age];
          const exactAge = exactAgeInput.value.trim();
          const exactAgeBand = ageBandForValue(exactAge);
          if (exactAge && exactAgeBand !== state.age) {
            exactAgeInput.value = "";
            state.exactAge = "";
            if (state.complaint) state.complaint.exact_age = "";
          }
          exactAgeInput.placeholder = selectedRange.placeholder;
          if (state.complaint) state.complaint.age_band = state.age;
          renderAgeButtons();
        });
      });

      document.querySelector("#patient-name").addEventListener("input", (event) => { state.fullName = event.target.value; });
      exactAgeInput.addEventListener("input", (event) => syncAgeFromExactValue(event.target.value));
      document.querySelectorAll("[data-gender]").forEach((button) => button.addEventListener("click", () => {
        state.gender = button.dataset.gender;
        document.querySelectorAll("[data-gender]").forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.gender === state.gender)));
      }));
      document.querySelectorAll("[data-condition]").forEach((button) => button.addEventListener("click", () => {
        const condition = button.dataset.condition;
        if (condition === "none") state.conditions = state.conditions.includes("none") ? [] : ["none"];
        else if (state.conditions.includes(condition)) state.conditions = state.conditions.filter((item) => item !== condition);
        else state.conditions = [...state.conditions.filter((item) => item !== "none"), condition];
        document.querySelectorAll("[data-condition]").forEach((item) => item.setAttribute("aria-pressed", String(state.conditions.includes(item.dataset.condition))));
      }));

      function handleComplaintInput(rawText) {
        const text = String(rawText || "").trim();
        const emergencyBanner = document.querySelector("#emergency-sentinel-banner");
        const smartCard = document.querySelector("#smart-intake-card");
        const smartChips = document.querySelector("#smart-pill-chips");

        if (!text) {
          if (emergencyBanner) emergencyBanner.hidden = true;
          if (smartCard) smartCard.hidden = true;
          return;
        }

        // 1. Reactive Emergency Sentinel check
        const emCheck = checkRealtimeEmergency(text, state.language);
        if (emergencyBanner) {
          if (emCheck.isEmergency) {
            emergencyBanner.hidden = false;
            const ruleEl = document.querySelector("#sentinel-rule-id");
            const titleEl = document.querySelector("#sentinel-title");
            const adviceEl = document.querySelector("#sentinel-advice");
            if (ruleEl) ruleEl.textContent = emCheck.ruleId;
            if (titleEl) titleEl.textContent = emCheck.title?.[state.language] || emCheck.title?.en || emCheck.conditionName;
            if (adviceEl) adviceEl.textContent = emCheck.advice?.[state.language] || emCheck.advice?.en;
          } else {
            emergencyBanner.hidden = true;
          }
        }

        // 2. Multi-Entity AI Demographic & Clinical Extraction
        const extracted = parseFreeTextComplaint(text, state.language);

        // Auto-populate patient name
        if (extracted.patient_name) {
          state.fullName = extracted.patient_name;
          const nameInput = document.querySelector("#patient-name");
          if (nameInput && nameInput.value !== extracted.patient_name) {
            nameInput.value = extracted.patient_name;
          }
        }

        // Auto-populate exact age & age band
        if (extracted.exact_age) {
          state.exactAge = extracted.exact_age;
          const exactInput = document.querySelector("#exact-age");
          if (exactInput && exactInput.value !== String(extracted.exact_age)) {
            exactInput.value = extracted.exact_age;
          }
          syncAgeFromExactValue(extracted.exact_age);
        } else if (extracted.age_band) {
          state.age = extracted.age_band;
          renderAgeButtons();
        }

        // Auto-populate gender
        if (extracted.gender) {
          state.gender = extracted.gender;
          document.querySelectorAll("[data-gender]").forEach((btn) => {
            btn.setAttribute("aria-pressed", String(btn.dataset.gender === state.gender));
          });
        }

        // Auto-populate conditions
        if (extracted.conditions && extracted.conditions.length > 0) {
          state.conditions = extracted.conditions;
          document.querySelectorAll("[data-condition]").forEach((btn) => {
            btn.setAttribute("aria-pressed", String(state.conditions.includes(btn.dataset.condition)));
          });
        }

        // Auto-populate caregiver / who-for
        if (extracted.who_for) {
          if (extracted.who_for === "self") {
            state.booking = "myself";
            state.who = null;
          } else {
            state.booking = "someone";
            state.who = extracted.who_for;
          }
          document.querySelectorAll("[data-booking]").forEach((item) => {
            item.setAttribute("aria-pressed", String(item.dataset.booking === state.booking));
          });
          const caregiverBox = document.querySelector("[data-caregiver]");
          if (caregiverBox) caregiverBox.hidden = state.booking !== "someone";
          document.querySelectorAll("[data-who]").forEach((item) => {
            item.setAttribute("aria-pressed", String(item.dataset.who === state.who));
          });
        }

        // 3. Render AI Smart Profile Pill
        if (smartCard && smartChips) {
          const chips = [];
          const displayName = state.fullName || (state.booking === "myself" ? "Myself" : (state.who ? `Caregiver (${state.who})` : "Patient"));
          const genderChar = state.gender === "male" ? "M" : state.gender === "female" ? "F" : "";
          const ageInfo = state.exactAge ? `${state.exactAge}${genderChar}` : (state.age || "");
          chips.push(`<span class="smart-chip">👤 ${displayName}${ageInfo ? " · " + ageInfo : ""}</span>`);

          if (state.conditions && state.conditions.length > 0 && !state.conditions.includes("none")) {
            chips.push(`<span class="smart-chip">🩺 ${state.conditions.join(", ")}</span>`);
          }

          if (extracted.region) {
            const sideSuffix = extracted.side && extracted.side !== "both" ? ` (${extracted.side})` : "";
            chips.push(`<span class="smart-chip">📍 ${extracted.region}${sideSuffix}</span>`);
          }

          smartChips.innerHTML = chips.join("");
          smartCard.hidden = false;
        }
      }

      function setupPatientDetailsDrawer() {
        const drawer = document.querySelector("#patient-details-drawer");
        const toggleBtn = document.querySelector("#btn-toggle-drawer");
        const summaryBar = document.querySelector("#drawer-summary-toggle");

        function toggleDrawer() {
          if (!drawer) return;
          const isCollapsed = drawer.dataset.collapsed === "true";
          drawer.dataset.collapsed = String(!isCollapsed);
          if (toggleBtn) {
            toggleBtn.setAttribute("aria-expanded", String(isCollapsed));
            const txt = toggleBtn.querySelector("#drawer-toggle-text") || toggleBtn;
            txt.textContent = isCollapsed ? "Hide Details ▲" : "Review / Edit Details ✎";
          }
          if (summaryBar) {
            summaryBar.setAttribute("aria-expanded", String(isCollapsed));
          }
        }

        if (toggleBtn) toggleBtn.addEventListener("click", toggleDrawer);
        if (summaryBar) {
          summaryBar.addEventListener("click", toggleDrawer);
          summaryBar.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleDrawer();
            }
          });
        }
      }
      setupPatientDetailsDrawer();

      complaint.addEventListener("input", (e) => handleComplaintInput(e.target.value));

      document.querySelectorAll("[data-example]").forEach((button) => {
        button.addEventListener("click", () => {
          complaint.value = button.dataset.example;
          complaint.focus();
          sessionNote.classList.remove("is-visible");
          status.dataset.persistent = "";
          status.textContent = "";
          handleComplaintInput(complaint.value);
        });
      });

      document.querySelector("#hero-triage-action")?.addEventListener("click", () => switchView("triage"));

      const heroQuickInput = document.querySelector("#hero-quick-input");
      const heroVoiceBtn = document.querySelector("#hero-voice-btn");
      const heroMapBtn = document.querySelector("#hero-map-btn");
      const heroStartBtn = document.querySelector("#start-triage");

      if (heroQuickInput) {
        heroQuickInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const val = heroQuickInput.value.trim();
            switchView("triage");
            if (val) {
              complaint.value = val;
              handleComplaintInput(val);
            }
          }
        });
      }

      if (heroVoiceBtn) {
        heroVoiceBtn.addEventListener("click", () => {
          switchView("triage");
          setTimeout(() => {
            if (!state.listening && voiceButton) voiceButton.click();
          }, 150);
        });
      }

      if (heroMapBtn) {
        heroMapBtn.addEventListener("click", () => {
          showBodyMap();
        });
      }

      if (heroStartBtn) {
        heroStartBtn.addEventListener("click", () => {
          const val = heroQuickInput ? heroQuickInput.value.trim() : "";
          switchView("triage");
          if (val) {
            complaint.value = val;
            handleComplaintInput(val);
          }
        });
      }
      document.querySelectorAll("[data-service-view]").forEach((button) => button.addEventListener("click", () => {
        if (button.dataset.teleconsult === "true") state.consultationMode = "tele";
        switchView(button.dataset.serviceView);
      }));
      document.querySelectorAll("[data-service-back]").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.serviceBack)));
      document.querySelector("#brand-home").addEventListener("click", (event) => { event.preventDefault(); switchView("home"); });
      document.querySelector("#nav-start-triage").addEventListener("click", () => switchView("triage"));
      document.querySelectorAll("[data-view-link]").forEach((link) => link.addEventListener("click", (event) => {
        event.preventDefault();
        switchView(link.dataset.viewLink);
      }));

      function moveTo(element) {
        element.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      }

      function showBodyMap() {
        abortSpeechRecognition();
        hideAllScreens();
        triageScreen.hidden = false;
        state.screen = "body-map";
        renderStepper(2);
        questionContent.hidden = true;
        bodyMapScreen.hidden = false;
        renderMapMode();
        kindQuestion.hidden = true;
        followups.hidden = true;
        const words = complaint.value.trim();
        document.querySelector("#typed-handoff").hidden = !words;
        document.querySelector("#typed-words").textContent = words;
        document.querySelector("#body-map-title").focus();
      }

      document.querySelector("#body-map-button").addEventListener("click", showBodyMap);
      toggleMapMode.addEventListener("click", () => {
        state.mapMode = state.mapMode === "3d" ? "2d" : "3d";
        renderMapMode();
        if (state.mapMode === "2d") moveTo(bodyLocationPicker);
      });
      document.querySelector("#body-map-back").addEventListener("click", () => {
        bodyMapScreen.hidden = true;
        questionContent.hidden = false;
        document.querySelector("#body-map-button").focus();
      });

      function updateSideSelection(side) {
        state.side = side || "both";
        document.querySelectorAll(".side-pill").forEach((btn) => {
          const isActive = btn.dataset.side === state.side;
          btn.classList.toggle("is-active", isActive);
          btn.setAttribute("aria-pressed", String(isActive));
        });
        document.querySelectorAll("[data-region]").forEach((item) => {
          const isRegion = item.dataset.region === state.region;
          if (!isRegion) {
            item.setAttribute("aria-pressed", "false");
            return;
          }
          const itemSide = item.dataset.side;
          if (!itemSide || !BILATERAL_REGIONS.includes(state.region)) {
            item.setAttribute("aria-pressed", "true");
          } else {
            if (state.side === "both") {
              item.setAttribute("aria-pressed", "true");
            } else {
              item.setAttribute("aria-pressed", String(itemSide === state.side));
            }
          }
        });
        bodyMap3d?.setSide?.(state.side);
        renderRegionBadge();
        renderRegionSelection();
        renderWorkspace();
      }

      function renderRegionBadge() {
        const somaticBadge = document.querySelector("#somatic-current-region");
        if (!somaticBadge) return;
        if (!state.region) {
          somaticBadge.textContent = "All Regions · संपूर्ण शरीर";
          return;
        }
        const lbl = REGION_LABELS[state.region];
        if (!lbl) {
          somaticBadge.textContent = state.region;
          return;
        }
        const isBilateral = BILATERAL_REGIONS.includes(state.region);
        let prefixEn = "";
        let prefixHi = "";
        if (isBilateral) {
          if (state.side === "left") {
            prefixEn = "Left ";
            prefixHi = "बायाँ ";
          } else if (state.side === "right") {
            prefixEn = "Right ";
            prefixHi = "दायाँ ";
          } else if (state.side === "both") {
            prefixEn = "Both Sides: ";
            prefixHi = "दोनों तरफ: ";
          }
        }
        somaticBadge.textContent = `${prefixEn}${lbl.en} · ${prefixHi}${lbl.hi}`;
      }

      function selectRegion(region, focusKind = true, side = null) {
          state.region = region;
          if (side) {
            state.side = side;
          } else if (!BILATERAL_REGIONS.includes(region)) {
            state.side = "both";
          }
          
          document.querySelectorAll(".side-pill").forEach((btn) => {
            const isActive = btn.dataset.side === state.side;
            btn.classList.toggle("is-active", isActive);
            btn.setAttribute("aria-pressed", String(isActive));
          });

          bodyMap3d?.select?.(region, state.side);
          state.noLocation = null;
          document.querySelectorAll("[data-no-location]").forEach((item) => item.setAttribute("aria-pressed", "false"));
          document.querySelectorAll("[data-region]").forEach((item) => {
            const isRegion = item.dataset.region === state.region;
            if (!isRegion) {
              item.setAttribute("aria-pressed", "false");
              return;
            }
            const itemSide = item.dataset.side;
            if (!itemSide || !BILATERAL_REGIONS.includes(state.region)) {
              item.setAttribute("aria-pressed", "true");
            } else {
              if (state.side === "both") {
                item.setAttribute("aria-pressed", "true");
              } else {
                item.setAttribute("aria-pressed", String(itemSide === state.side));
              }
            }
          });
          resetKindAndFollowups();
          renderRegionSelection();
          renderWorkspace();
          mapStatus.textContent = "";
          mapStatus.removeAttribute("role");
          
          renderRegionBadge();

          const somaticPanel = document.querySelector("#somatic-lens-panel");
          if (somaticPanel) {
            somaticPanel.hidden = false;
            somaticPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          if (focusKind) showKindQuestion();
      }

      document.querySelectorAll(".side-pill").forEach((button) => {
        button.addEventListener("click", () => {
          updateSideSelection(button.dataset.side);
        });
      });

      document.querySelectorAll("[data-region]").forEach((button) => button.addEventListener("click", () => {
        const region = button.dataset.region;
        let side = button.dataset.side;
        const isBilateral = BILATERAL_REGIONS.includes(region);
        if (!side) {
          side = isBilateral ? (state.side || "both") : "both";
        } else if (isBilateral && state.region === region) {
          if ((state.side === "left" && side === "right") || (state.side === "right" && side === "left")) {
            side = "both";
          } else if (state.side === side) {
            side = "both";
          }
        }
        selectRegion(region, true, side);
      }));

      document.querySelectorAll("[data-no-location]").forEach((button) => {
        button.addEventListener("click", () => {
          state.region = null;
          state.noLocation = button.dataset.noLocation;
          document.querySelectorAll("[data-no-location]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
          document.querySelectorAll("[data-region]").forEach((item) => item.setAttribute("aria-pressed", "false"));
          resetKindAndFollowups();
          selectedRegionName.textContent = text("selectionNone");
          selectionMessage.textContent = text("selectionChosen");
          renderWorkspace();
          mapStatus.textContent = "";
          mapStatus.removeAttribute("role");
          showKindQuestion(true);
        });
      });

      document.querySelectorAll("[data-kind]").forEach((button) => {
        button.addEventListener("click", () => {
          state.kind = button.dataset.kind;
          document.querySelectorAll("[data-kind]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
          renderKindSelection();
          renderWorkspace();
          kindStatus.textContent = "";
          followups.hidden = false;
          mapReady.classList.remove("is-visible");
          moveTo(followups);
        });
      });

      document.querySelectorAll("[data-duration]").forEach((button) => {
        button.addEventListener("click", () => {
          state.duration = button.dataset.duration;
          document.querySelectorAll("[data-duration]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        });
      });

      
      // --- Somatic Clinical Lens Interaction ---
      document.querySelectorAll("[data-silhouette]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const silhouette = btn.dataset.silhouette;
          state.silhouette = silhouette;
          document.querySelectorAll("[data-silhouette]").forEach((b) => b.classList.toggle("is-active", b === btn));
          bodyMap3d?.setSilhouette?.(silhouette);
        });
      });

      document.querySelectorAll("[data-sensation]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const isPressed = btn.getAttribute("aria-pressed") === "true";
          btn.setAttribute("aria-pressed", String(!isPressed));
          if (!state.sensations) state.sensations = [];
          const sens = btn.dataset.sensation;
          if (!isPressed) {
            if (!state.sensations.includes(sens)) state.sensations.push(sens);
          } else {
            state.sensations = state.sensations.filter((s) => s !== sens);
          }
          if (sens === "bleeding") {
            state.kind = "bleeding";
          } else if (sens === "rash" || sens === "itching") {
            state.kind = "rash";
          } else if (sens === "swelling") {
            state.kind = "swelling";
          } else if (sens === "injury") {
            state.kind = "injury";
          } else if (!state.kind) {
            state.kind = "pain";
          }
          renderKindSelection();
          document.querySelectorAll("[data-kind]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.kind === state.kind)));
          followups.hidden = false;
          renderWorkspace();
        });
      });

      const intensitySlider = document.querySelector("#intensity-slider");
      const intensityBadge = document.querySelector("#intensity-badge");
      const intensityDesc = document.querySelector("#intensity-desc");
      const intensityTickElements = document.querySelectorAll(".intensity-ticks .tick");

      const INTENSITY_DESCRIPTIONS = {
        1: { en: "Level 1 · Mild / Distracting", hi: "स्तर 1 · हल्का / ध्यान भटकाने वाला", descEn: "Mild discomfort, easily manageable. Routine outpatient consultation.", descHi: "हल्की तकलीफ़, सामान्य दिनचर्या में कोई रुकावट नहीं। सामान्य ओपीडी।" },
        2: { en: "Level 2 · Moderate / Uncomfortable", hi: "स्तर 2 · मध्यम / असहज", descEn: "Noticeable during activities or sleep. Timely doctor assessment recommended.", descHi: "दैनिक काम या नींद में महसूस होता है। समय पर डॉक्टर को दिखाना चाहिए।" },
        3: { en: "Level 3 · Noticeable / Impairing", hi: "स्तर 3 · स्पष्ट / काम में बाधा", descEn: "Interferes with regular work. Requires formal clinical evaluation.", descHi: "कामकाज में रुकावट आ रही है। अस्पताल में ओपीडी जांच ज़रूरी है।" },
        4: { en: "Level 4 · Severe / Intense", hi: "स्तर 4 · तीव्र / गंभीर दर्द", descEn: "Severe distress, limits movement or speaking. Priority OPD routing.", descHi: "तेज़ असहजता, चलने या बोलने में तकलीफ़। प्राथमिकता ओपीडी काउंटर।" },
        5: { en: "Level 5 · Unbearable / Critical", hi: "स्तर 5 · असहनीय / अत्यंत गंभीर", descEn: "Intense, unbearable distress. Halts normal booking → Immediate 24/7 Emergency!", descHi: "असहनीय तकलीफ़। तुरंत इमरजेंसी (आपातकालीन) वार्ड में जाएँ!" },
      };

      function updateIntensityUI(level) {
        level = Math.max(1, Math.min(5, parseInt(level, 10) || 3));
        state.intensity = level;
        state.severity = level >= 4 ? "yes" : "no";
        document.querySelectorAll("[data-severity]").forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.severity === state.severity)));

        if (intensitySlider) intensitySlider.value = level;
        if (intensityBadge) {
          intensityBadge.dataset.level = level;
          intensityBadge.textContent = state.language === "hi" ? INTENSITY_DESCRIPTIONS[level].hi : INTENSITY_DESCRIPTIONS[level].en;
        }
        if (intensityDesc) {
          intensityDesc.textContent = state.language === "hi" ? INTENSITY_DESCRIPTIONS[level].descHi : INTENSITY_DESCRIPTIONS[level].descEn;
        }
        intensityTickElements.forEach((tick) => {
          tick.classList.toggle("is-active", parseInt(tick.dataset.tick, 10) === level);
        });

        // Real-time thermal glow reaction on the 3D body!
        bodyMap3d?.setRegionIntensity?.(level);

        // Emergency escalation warning if level 5 on chest or head
        if (level === 5 && (state.region === "chest" || state.region === "head")) {
          if ("vibrate" in navigator) navigator.vibrate?.([30, 50, 30]);
        }
      }

      intensitySlider?.addEventListener("input", (e) => updateIntensityUI(e.target.value));
      intensityTickElements.forEach((tick) => {
        tick.addEventListener("click", () => updateIntensityUI(tick.dataset.tick));
      });


      document.querySelectorAll("[data-severity]").forEach((button) => {
        button.addEventListener("click", () => {
          state.severity = button.dataset.severity;
          document.querySelectorAll("[data-severity]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        });
      });

      function selectedLabel(selector) {
        const selected = document.querySelector(`${selector}[aria-pressed="true"]`);
        return selected ? selected.textContent.trim().replace(/^•\s*/, "") : "";
      }

      function setObservedValue(id, value) {
        const element = document.querySelector(id);
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = "Observed";
        element.replaceChildren(tag, document.createTextNode(` ${value}`));
      }

      function makeComplaint(fromMap = false, parsedComplaint = null) {
        if (!fromMap) {
          const extracted = parsedComplaint || parseFreeTextComplaint(complaint.value.trim(), state.language);
          return {
            ...extracted,
            side: state.side || "both",
            age_band: extracted.age_band || state.age,
            who_for: extracted.who_for || (state.booking === "myself" ? "self" : state.who),
            patient_name: state.fullName,
            phone: state.phone,
            exact_age: state.exactAge,
            gender: state.gender,
            conditions: [...state.conditions],
            value_tags: extracted.value_tags || Object.fromEntries(COMPLAINT_FIELDS.map((field) => [field, extracted[field] ? "Rule" : "Observed"])),
          };
        }
        return {
          region: state.region,
          side: state.side || "both",
          kind: state.kind,
          duration: state.duration,
          severity: state.severity,
          age_band: state.age,
          who_for: state.booking === "myself" ? "self" : state.who,
          patient_name: state.fullName,
          phone: state.phone,
          exact_age: state.exactAge,
          gender: state.gender,
          conditions: [...state.conditions],
          severity_markers: [],
          parsed: true,
          unclear: [],
          language: state.language,
        };
      }

      function labelFor(field, value) {
        if (field === "region") {
          if (!value) return text("selectionNone");
          const isBilateral = BILATERAL_REGIONS.includes(value);
          const side = state.complaint?.side || state.side || "both";
          let prefix = "";
          if (isBilateral) {
            if (side === "left") prefix = state.language === "hi" ? "बायाँ " : "Left ";
            else if (side === "right") prefix = state.language === "hi" ? "दायाँ " : "Right ";
            else if (side === "both") prefix = state.language === "hi" ? "दोनों तरफ: " : "Both: ";
          }
          return prefix + (text(regionCopyKeys[value]) || value);
        }
        if (field === "kind") return value ? (text(kindCopyKeys[value]) || value) : text("notChosen");
        if (field === "duration") return value ? (text(durationCopyKeys[value]) || value) : text("notChosen");
        if (field === "severity") return value ? (text(severityCopyKeys[value]) || value) : text("notChosen");
        if (field === "who_for") return value ? (text(whoCopyKeys[value]) || value) : text("notChosen");
        if (field === "age_band") return value ? (text(ageCopyKeys[value]) || value) : text("notAsked");
        return text("notChosen");
      }

      function renderReadback() {
        const current = state.complaint;
        if (!current) return;
        const renderChipValue = (id, field) => {
          const element = document.querySelector(id);
          element.replaceChildren(makeTag(current.value_tags?.[field] || "Rule"), document.createTextNode(` ${labelFor(field, current[field])}`));
        };
        renderChipValue("#chip-region", "region");
        renderChipValue("#chip-kind", "kind");
        renderChipValue("#chip-duration", "duration");
        renderChipValue("#chip-severity", "severity");
        renderChipValue("#chip-who", "who_for");
        renderChipValue("#chip-age", "age_band");
        const rawWords = current.unclear?.[0] || complaint.value.trim();
        readbackWords.hidden = !rawWords;
        readbackWordsValue.textContent = rawWords;
        unclearNote.hidden = current.parsed || !current.unclear?.length;
        unclearValue.textContent = current.unclear?.join("; ") || "";
        const patientReadback = document.querySelector("#patient-readback");
        patientReadback.replaceChildren();
        const readbackLine = (label, value) => {
          const line = document.createElement("p");
          line.append(makeTag("Observed"), document.createTextNode(` ${label}: ${value || text("notChosen")}`));
          patientReadback.append(line);
        };
        readbackLine(text("patientNameLabel"), current.patient_name);
        readbackLine(text("exactAgeLabel"), current.exact_age);
        readbackLine(text("genderLabel"), current.gender ? text(genderCopyKeys[current.gender]) : "");
        const conditionText = current.conditions?.length ? current.conditions.map((condition) => text(conditionCopyKeys[condition])).join(", ") : "";
        readbackLine(text("conditionsLabel"), conditionText);
        reviewStatus.textContent = "";
        reviewStatus.removeAttribute("role");
      }

      function showReadback(complaintData = null) {
        state.complaint = complaintData || makeComplaint(false);
        state.screen = "review";
        triageScreen.hidden = false;
        renderStepper(2);
        bodyMapScreen.hidden = true;
        questionContent.hidden = true;
        resultScreen.hidden = true;
        reviewScreen.hidden = false;
        renderReadback();
        document.querySelector("#review-title").focus();
      }

      function syncComplaintToState() {
        const current = state.complaint;
        state.region = current.region;
        if (current.side) state.side = current.side;
        state.kind = current.kind;
        state.duration = current.duration;
        state.severity = current.severity;
        state.age = current.age_band;
        if (current.who_for === "self") { state.booking = "myself"; state.who = null; }
        else { state.booking = "someone"; state.who = current.who_for; }
      }

      function renderEditor(field) {
        const current = state.complaint?.[field];
        editorControls.replaceChildren();
        for (const option of editOptions[field]) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "editor-control";
          button.dataset.editorValue = option.value ?? "";
          button.setAttribute("aria-pressed", String(current === option.value));
          const tag = document.createElement("span");
          tag.className = "tag";
          tag.textContent = "Observed";
          button.append(tag, document.createTextNode(text(option.label)));
          button.addEventListener("click", () => {
            const nextValue = option.value === "" ? null : option.value;
            state.complaint[field] = nextValue;
            if (field === "region") state.noLocation = nextValue ? null : "unsure";
            const complete = Boolean(state.complaint.kind && state.complaint.duration && state.complaint.severity && (state.complaint.region || state.noLocation));
            state.complaint.parsed = state.complaint.parsed || complete;
            if (state.complaint.parsed) state.complaint.unclear = [];
            syncComplaintToState();
            renderReadback();
            renderEditor(field);
          });
          editorControls.append(button);
        }
        readbackEditor.hidden = false;
      }

      function makeTag(label) {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = label;
        return tag;
      }

      function formatClock(value) {
        const [hourValue, minuteValue] = String(value).split(":").map(Number);
        const suffix = hourValue >= 12 ? "PM" : "AM";
        const hour = hourValue % 12 || 12;
        return `${String(hour).padStart(2, "0")}:${String(minuteValue).padStart(2, "0")} ${suffix}`;
      }

      function honestWaitText(availability) {
        return `Estimated Doctor Consultation Time: ~${formatClock(availability.seenAt)} (Accounting for morning doctor rounds and token throughput)`;
      }

      function labelledValue(tagLabel, value) {
        const fragment = document.createDocumentFragment();
        fragment.append(makeTag(tagLabel), document.createTextNode(value));
        return fragment;
      }

      function appendFact(parent, label, tagLabel, value) {
        const wrapper = document.createElement("div");
        wrapper.className = "hospital-fact";
        const heading = document.createElement("dt");
        heading.textContent = label;
        const content = document.createElement("dd");
        content.append(labelledValue(tagLabel, value));
        wrapper.append(heading, content);
        parent.append(wrapper);
      }

      let hospitalLeafletMap = null;
      let hospitalMapMarkers = [];
      let userLocationMarker = null;

      function initOrUpdateHospitalMap(hospitals, selectedHospitalId, userLocation) {
        const mapContainer = document.querySelector("#interactive-hospital-map");
        if (!mapContainer || typeof window.L === "undefined") return;

        const centerCoords = (userLocation && userLocation.lat != null)
          ? userLocation
          : (hospitals[0] && hospitals[0].lat != null ? { lat: hospitals[0].lat, lng: hospitals[0].lng } : { lat: 28.6139, lng: 77.2090 });

        if (!hospitalLeafletMap) {
          try {
            hospitalLeafletMap = L.map("interactive-hospital-map", {
              zoomControl: true,
              scrollWheelZoom: false,
            }).setView([centerCoords.lat, centerCoords.lng], 12);

            L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
              subdomains: "abcd",
              maxZoom: 19
            }).addTo(hospitalLeafletMap);

            hospitalLeafletMap.on("click", (e) => {
              state.userCoords = { lat: e.latlng.lat, lng: e.latlng.lng, name: "Pinned Location" };
              state.selectedHospital = null;
              renderAppointment();
            });
          } catch (err) {
            console.warn("Leaflet map initialization notice:", err);
            return;
          }
        } else {
          hospitalLeafletMap.setView([centerCoords.lat, centerCoords.lng]);
        }

        // Clear previous markers
        hospitalMapMarkers.forEach((m) => hospitalLeafletMap.removeLayer(m));
        hospitalMapMarkers = [];
        if (userLocationMarker) {
          hospitalLeafletMap.removeLayer(userLocationMarker);
          userLocationMarker = null;
        }

        // Add user location beacon
        if (userLocation && userLocation.lat != null) {
          const userIcon = L.divIcon({
            className: "user-map-beacon-wrap",
            html: '<div class="user-map-beacon"><div class="beacon-pulse"></div><div class="beacon-dot"></div></div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          userLocationMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 2000 })
            .addTo(hospitalLeafletMap)
            .bindPopup("<strong>Your Location (Observed)</strong><br>Computed client-side in browser");
        }

        // Add hospital markers (top 15 nearest)
        hospitals.slice(0, 15).forEach((hospital) => {
          if (!hospital.lat || !hospital.lng) return;
          const isSelected = hospital.id === selectedHospitalId;
          const pinColor = isSelected ? "#10b981" : "#3b82f6";
          const distLabel = hospital.availability?.distanceKm ? `${hospital.availability.distanceKm.toFixed(1)} km` : "";

          const pinIcon = L.divIcon({
            className: "hospital-pin-wrap",
            html: `<div class="hospital-pin ${isSelected ? "is-selected-pin" : ""}" style="--pin-color: ${pinColor}">
              <span class="pin-symbol">🏥</span>
              <span class="pin-badge">${distLabel}</span>
            </div>`,
            iconSize: [36, 42],
            iconAnchor: [18, 42]
          });

          const marker = L.marker([hospital.lat, hospital.lng], { icon: pinIcon, zIndexOffset: isSelected ? 1500 : 100 })
            .addTo(hospitalLeafletMap)
            .bindPopup(`<strong>${hospital.name}</strong><br><small>${hospital.tier || "Hospital"}</small><br><span>Wait: ~${hospital.availability?.waitMinutes || 120}m · Next Slot: ${hospital.availability?.slot || "09:30"}</span><br><button type="button" class="pin-select-btn" data-pin-select="${hospital.id}">${isSelected ? "✓ Selected Hospital" : "Select This Hospital"}</button>`);

          marker.on("click", () => {
            state.selectedHospital = hospital.id;
            renderAppointment();
          });

          hospitalMapMarkers.push(marker);
        });

        setTimeout(() => {
          if (hospitalLeafletMap) hospitalLeafletMap.invalidateSize();
        }, 120);
      }

      
      function updateHeroHospitalCard(selectedHospital, department) {
        if (!selectedHospital) return;
        const heroName = document.querySelector("#hero-hospital-name");
        const heroTier = document.querySelector("#hero-hospital-tier");
        const heroAddress = document.querySelector("#hero-hospital-address");
        const heroDist = document.querySelector("#hero-hospital-distance");
        const heroWait = document.querySelector("#hero-hospital-wait");
        const heroSlot = document.querySelector("#hero-hospital-slot");
        const heroTransit = document.querySelector("#hero-transit-text");
        const heroLink = document.querySelector("#hero-source-link");

        if (heroName) heroName.textContent = selectedHospital.name;
        if (heroTier) heroTier.textContent = selectedHospital.tier || "Government Health Centre";
        if (heroAddress) heroAddress.textContent = selectedHospital.address || (selectedHospital.city ? `${selectedHospital.city}, ${selectedHospital.state || ""}` : "Public Hospital");
        if (heroDist) {
          const d = selectedHospital.availability?.distanceKm;
          heroDist.textContent = d != null ? `${d.toFixed(1)} km` : "2.4 km";
        }
        if (heroWait) {
          const w = selectedHospital.availability?.waitMinutes;
          heroWait.textContent = w != null ? `~${Math.round(w / 5) * 5}m` : "~25m";
        }
        if (heroSlot) {
          heroSlot.textContent = selectedHospital.availability?.slot ? formatClock(selectedHospital.availability.slot) : "09:30 AM";
        }
        if (heroTransit) {
          heroTransit.textContent = selectedHospital.transit || "Main OPD Registration Counter · Regular Hours";
        }
        if (heroLink) {
          heroLink.href = selectedHospital.sourceUrl || "https://ors.gov.in/";
          heroLink.textContent = selectedHospital.sourceLabel || "ORS Hospital Directory";
        }
      }

      function renderHospitalCards() {
        const department = state.routeResult?.department || "General Medicine";
        const userLocation = state.userCoords || LOCALITIES.find((l) => l.id === state.locality) || { lat: 28.6139, lng: 77.2090, name: "New Delhi" };
        
        const hospitals = hospitalsForDepartment(department, state.userCoords || state.locality, state.hospitalStateFilter);
        hospitalList.replaceChildren();

        const drawerCount = document.querySelector("#drawer-hospitals-count");
        if (drawerCount) {
          drawerCount.textContent = `Matching Facilities (${hospitals.length} Found):`;
        }

        if (!hospitals.length) {
          const empty = document.createElement("p");
          empty.className = "booking-panel-note";
          empty.textContent = text("noHospitals");
          hospitalList.append(empty);
          return;
        }

        // Auto-select #1 nearest facility if none selected or not in list
        if (!state.selectedHospital || !hospitals.some((h) => h.id === state.selectedHospital)) {
          state.selectedHospital = hospitals[0].id;
        }

        const selectedHospital = hospitals.find((h) => h.id === state.selectedHospital) || hospitals[0];
        
        // Update the clean Hero Card on top!
        updateHeroHospitalCard(selectedHospital, department);

        // Render Alternative Facilities inside the drawer
        const alternatives = hospitals.slice(0, 10);
        alternatives.forEach((hospital) => {
          const { availability } = hospital;
          const isSelected = state.selectedHospital === hospital.id;
          const card = document.createElement("article");
          card.className = `hospital-card${isSelected ? " is-selected" : ""}`;

          const topRow = document.createElement("div");
          topRow.className = "hospital-card-top";

          const titleBlock = document.createElement("div");
          const tierTag = document.createElement("span");
          tierTag.className = "hospital-tier-tag";
          tierTag.textContent = hospital.tier || "Government Hospital";
          
          const title = document.createElement("h3");
          title.className = "hospital-card-title";
          title.textContent = hospital.name;

          const address = document.createElement("p");
          address.className = "hospital-card-address";
          address.textContent = hospital.address || `${hospital.city || ""}, ${hospital.state || ""}`;

          titleBlock.append(tierTag, title, address);
          topRow.append(titleBlock);

          // Stat chips row
          const chipsRow = document.createElement("div");
          chipsRow.className = "stat-chips-row";

          const distChip = document.createElement("span");
          distChip.className = "stat-chip chip-distance";
          distChip.innerHTML = `<span class="tag">Observed</span> 📍 <strong>${availability.distanceKm.toFixed(1)} km</strong>`;

          const waitChip = document.createElement("span");
          waitChip.className = "stat-chip chip-wait";
          waitChip.innerHTML = `<span class="tag">Simulated</span> ⏱️ <strong>~${Math.round(availability.waitMinutes / 5) * 5}m wait</strong>`;

          const slotChip = document.createElement("span");
          slotChip.className = "stat-chip chip-slot";
          slotChip.innerHTML = `<span class="tag">Simulated</span> 🕒 <strong>Slot ${formatClock(availability.slot)}</strong>`;

          chipsRow.append(distChip, waitChip, slotChip);

          // Quiet verified line
          const verified = document.createElement("p");
          verified.className = "verified-quiet";
          verified.append(
            makeTag("Verified"),
            document.createTextNode(`${text("checked")} ${HOSPITAL_FACT_CHECKED_ON} · `),
            (() => {
              const a = document.createElement("a");
              a.href = hospital.sourceUrl;
              a.target = "_blank";
              a.rel = "noreferrer";
              a.textContent = hospital.sourceLabel || "ORS Directory";
              return a;
            })()
          );

          // Action button: Selecting updates hero card and scrolls gently to it without wiping choices
          const choose = document.createElement("button");
          choose.type = "button";
          choose.className = `large-button${isSelected ? " primary" : ""}`;
          choose.textContent = isSelected ? `✓ ${text("chosenHospital")}` : `Choose this hospital →`;
          choose.addEventListener("click", () => {
            state.selectedHospital = hospital.id;
            renderAppointment();
            const hero = document.querySelector("#hospital-hero-card");
            if (hero) hero.scrollIntoView({ behavior: "smooth", block: "nearest" });
          });

          card.append(topRow, chipsRow, verified, choose);
          hospitalList.append(card);
        });

        // Keep map synchronized
        initOrUpdateHospitalMap(hospitals, state.selectedHospital, userLocation);
      }

      function renderCarry() {
        document.querySelectorAll("[data-visit-type]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.visitType === state.visitType)));
        carryList.replaceChildren();
        if (!state.visitType) {
          carryList.hidden = true;
          feeLine.hidden = true;
          toSignIn.hidden = true;
          return;
        }
        const items = state.visitType === "first"
          ? [text("firstId")]
          : [text("returningUhid"), text("previousSlip")];
        items.forEach((item) => { const li = document.createElement("li"); li.textContent = item; carryList.append(li); });
        carryList.hidden = false;
        feeLine.hidden = false;
        feeLine.replaceChildren(makeTag("Simulated"), document.createTextNode(` ${text("feeLine")}: ${text("feeAmount")}`));
        toSignIn.hidden = !(state.consultationMode && state.appointmentDate && state.appointmentShift);
      }

      function renderSlip() {
        const department = state.routeResult?.department;
        const candidateHospitals = hospitalsForDepartment(department, state.userCoords || state.locality, state.hospitalStateFilter);
        const hospital = candidateHospitals.find((entry) => entry.id === state.selectedHospital) || candidateHospitals[0];
        if (!hospital) return;
        const { availability } = hospital;
        const appointment = state.appointmentShift ? shiftCatalog[state.appointmentShift] : { start: availability.slot, seen: availability.seenAt };
        const current = state.complaint || {};
        const report = current.unclear?.[0] || complaint.value.trim() || [
          labelFor("region", current.region), labelFor("kind", current.kind), labelFor("duration", current.duration), labelFor("severity", current.severity),
        ].join(", ");
        document.querySelector("#slip-patient").replaceChildren(makeTag("Observed"), document.createTextNode(` ${current.patient_name || labelFor("who_for", current.who_for)}`));
        document.querySelector("#slip-department").replaceChildren(makeTag("Rule"), document.createTextNode(` ${departmentCopyKeys[department] ? text(departmentCopyKeys[department]) : department}`));
        document.querySelector("#slip-hospital").replaceChildren(makeTag("Verified"), document.createTextNode(` ${hospital.shortName}`));
        document.querySelector("#slip-address").replaceChildren(makeTag("Verified"), document.createTextNode(` ${hospital.address}`));
        document.querySelector("#slip-slot").replaceChildren(makeTag("Simulated"), document.createTextNode(` ${formatClock(appointment.start)}`));
        document.querySelector("#slip-seen-by").replaceChildren(makeTag("Simulated"), document.createTextNode(` ~${formatClock(appointment.seen)}`));
        document.querySelector("#slip-token-detail").replaceChildren(makeTag("Simulated"), document.createTextNode(" #OPD-2026-4802"));
        document.querySelector("#slip-time-summary").replaceChildren(makeTag("Simulated"), document.createTextNode(` ${formatClock(appointment.start)} · Seen ~${formatClock(appointment.seen)}`));
        const mode = document.querySelector("#slip-mode");
        const linkField = document.querySelector("#slip-link-field");
        if (state.consultationMode === "tele") {
          mode.replaceChildren(makeTag("Simulated"), document.createTextNode(" Mode: Secure Video Tele-OPD (Room #OPD-702)"));
          document.querySelector("#slip-link").replaceChildren(makeTag("Simulated"), document.createTextNode(" "), joinTeleRoom);
          linkField.hidden = false;
        } else {
          mode.replaceChildren(makeTag("Simulated"), document.createTextNode(" Mode: In-Person Hospital Visit (Walk-in to OPD Counter)"));
          linkField.hidden = true;
        }
        document.querySelector("#slip-appointment-id").replaceChildren(makeTag("Simulated"), document.createTextNode(" APPT-DEMO-4802"));
        document.querySelector("#slip-uhid").replaceChildren(makeTag("Simulated"), document.createTextNode(" UHID-MOCK-7281"));
        document.querySelector("#slip-report").textContent = report;

        // Doctor Communication & Handover Card Population
        const handoverRegion = document.querySelector("#handover-region");
        const handoverSensations = document.querySelector("#handover-sensations");
        const handoverIntensity = document.querySelector("#handover-intensity");
        const handoverPromptHi = document.querySelector("#handover-prompt-hi");
        const handoverPromptEn = document.querySelector("#handover-prompt-en");

        const regKey = current.region || state.region;
        const regLabels = REGION_LABELS[regKey] || { en: regKey || "General", hi: "सामान्य" };
        const sensArr = state.sensations && state.sensations.length > 0 ? state.sensations : [(current.kind || "discomfort")];
        const intLevel = state.intensity || 3;
        const curSide = current.side || state.side || "both";
        const isBilateral = BILATERAL_REGIONS.includes(regKey);
        let sideEn = "";
        let sideHi = "";
        let sideEnScript = "";
        let sideHiScript = "";
        if (isBilateral) {
          if (curSide === "left") {
            sideEn = "Left ";
            sideHi = "बायाँ ";
            sideEnScript = "left ";
            sideHiScript = "बाएँ ";
          } else if (curSide === "right") {
            sideEn = "Right ";
            sideHi = "दायाँ ";
            sideEnScript = "right ";
            sideHiScript = "दाएँ ";
          } else if (curSide === "both") {
            sideEn = "Both Sides: ";
            sideHi = "दोनों तरफ: ";
            sideEnScript = "both ";
            sideHiScript = "दोनों ";
          }
        }

        if (handoverRegion) handoverRegion.textContent = `${sideEn}${regLabels.en} · ${sideHi}${regLabels.hi}`;
        if (handoverSensations) handoverSensations.textContent = sensArr.join(", ").toUpperCase();
        if (handoverIntensity) {
          handoverIntensity.textContent = `Level ${intLevel} / 5 (${INTENSITY_DESCRIPTIONS[intLevel]?.en || "Moderate"})`;
          handoverIntensity.className = "handover-intensity-pill intensity-badge";
          handoverIntensity.dataset.level = intLevel;
        }

        const promptHi = `डॉक्टर साहब, मुझे ${sideHiScript}${regLabels.hi} में ${sensArr.join(", ")} महसूस हो रहा है (तीव्रता ${intLevel}/5)। कृपया जाँच करें।`;
        const promptEn = `Doctor, I am experiencing ${sensArr.join(", ")} in my ${sideEnScript}${regLabels.en} (distress level ${intLevel}/5). Please examine.`;
        if (handoverPromptHi) handoverPromptHi.textContent = `"${promptHi}"`;
        if (handoverPromptEn) handoverPromptEn.textContent = `"${promptEn}"`;

        const shareWaBtn = document.querySelector("#share-whatsapp");
        if (shareWaBtn) {
          shareWaBtn.onclick = () => {
            const waMsg = `🏥 *Raahat Citizen OPD Handover Slip*\n• Hospital: ${hospital.shortName}\n• Counter: ${department}\n• Patient: ${current.patient_name || labelFor("who_for", current.who_for)}\n• Target Area: ${sideEn}${regLabels.en} (${sideHi}${regLabels.hi})\n• Sensations: ${sensArr.join(", ")}\n• Distress Level: ${intLevel}/5\n• Doctor Handover Script: "${promptHi}"\n\n_Independent Prototype · Public OPD Triage_`;
            window.open(`https://wa.me/?text=${encodeURIComponent(waMsg)}`, "_blank");
          };
        }

      }

      function renderTelePrescriptionPreview() {
        const notes = teleNotes.value.trim();
        const heading = document.createElement("strong");
        heading.textContent = "Digital prescription drawer";
        const note = document.createElement("p");
        note.textContent = notes ? `Consultation notes (Simulated): ${notes}` : "No consultation notes have been entered in this simulation.";
        const statusLine = document.createElement("p");
        statusLine.textContent = "Prescription status (Simulated): draft preview only; no medication has been prescribed.";
        telePrescriptionPreview.replaceChildren(heading, note, statusLine);
      }

      function setTeleCallStatus(message) {
        teleCallStatus.replaceChildren(makeTag("Simulated"), document.createTextNode(` ${message}`));
      }

      function drawTeleSelfFeed() {
        const context = teleSelfFeed.getContext("2d");
        if (!context) return;
        context.fillStyle = "#334155";
        context.fillRect(0, 0, teleSelfFeed.width, teleSelfFeed.height);
        context.fillStyle = "#64748b";
        context.beginPath();
        context.arc(teleSelfFeed.width / 2, teleSelfFeed.height * 0.38, 52, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#475569";
        context.beginPath();
        context.ellipse(teleSelfFeed.width / 2, teleSelfFeed.height * 0.78, 110, 82, 0, 0, Math.PI * 2);
        context.fill();
      }

      function openTeleModal() {
        if (teleCloseTimer) window.clearTimeout(teleCloseTimer);
        telePreviousFocus = document.activeElement;
        telePreviousBodyOverflow = document.body.style.overflow;
        teleModal.hidden = false;
        document.body.style.overflow = "hidden";
        teleMuteButton.setAttribute("aria-pressed", "false");
        teleMuteButton.textContent = "Mute Mic";
        teleCameraButton.setAttribute("aria-pressed", "false");
        setTeleCallStatus("Call connected · microphone and camera are on.");
        teleNotes.value = "";
        renderTelePrescriptionPreview();
        drawTeleSelfFeed();
        window.requestAnimationFrame(() => teleModal.classList.add("is-open"));
        teleModalClose.focus();
      }

      function closeTeleModal() {
        if (teleModal.hidden) return;
        teleModal.classList.remove("is-open");
        if (teleCloseTimer) window.clearTimeout(teleCloseTimer);
        teleCloseTimer = window.setTimeout(() => {
          teleModal.hidden = true;
          document.body.style.overflow = telePreviousBodyOverflow;
          telePreviousFocus?.focus?.();
          telePreviousFocus = null;
        }, 220);
      }

      joinTeleRoom.addEventListener("click", openTeleModal);
      teleModalClose.addEventListener("click", closeTeleModal);
      teleEndButton.addEventListener("click", closeTeleModal);
      teleModal.addEventListener("click", (event) => { if (event.target === teleModal) closeTeleModal(); });
      teleMuteButton.addEventListener("click", () => {
        const muted = teleMuteButton.getAttribute("aria-pressed") !== "true";
        teleMuteButton.setAttribute("aria-pressed", String(muted));
        teleMuteButton.textContent = muted ? "Unmute Mic" : "Mute Mic";
        setTeleCallStatus(`Call connected · microphone is ${muted ? "muted" : "on"}; camera is on.`);
      });
      teleCameraButton.addEventListener("click", () => {
        const cameraOff = teleCameraButton.getAttribute("aria-pressed") !== "true";
        teleCameraButton.setAttribute("aria-pressed", String(cameraOff));
        setTeleCallStatus(`Call connected · microphone is ${teleMuteButton.getAttribute("aria-pressed") === "true" ? "muted" : "on"}; camera is ${cameraOff ? "off" : "on"}.`);
      });
      teleNotes.addEventListener("input", renderTelePrescriptionPreview);
      document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !teleModal.hidden) closeTeleModal(); });

      function appointmentDates() {
        return Array.from({ length: 7 }, (_, offset) => {
          const date = new Date();
          date.setHours(0, 0, 0, 0);
          date.setDate(date.getDate() + offset);
          const iso = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
          return { iso, weekday: date.toLocaleDateString(state.language === "hi" ? "hi-IN" : "en-IN", { weekday: "short" }), label: date.toLocaleDateString(state.language === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short" }) };
        });
      }

      function renderAppointmentOptions() {
        appointmentOptions.hidden = !state.selectedHospital;
        document.querySelectorAll("[data-consultation-mode]").forEach((button) => 
          button.setAttribute("aria-pressed", String(button.dataset.consultationMode === state.consultationMode))
        );
        document.querySelectorAll("[data-visit-type]").forEach((button) => 
          button.setAttribute("aria-pressed", String(button.dataset.visitType === state.visitType))
        );
        document.querySelectorAll("[data-shift]").forEach((button) => 
          button.setAttribute("aria-pressed", String(button.dataset.shift === state.appointmentShift))
        );

        if (dateStrip) {
          dateStrip.replaceChildren();
          appointmentDates().slice(0, 4).forEach((date) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "date-button";
            button.dataset.appointmentDate = date.iso;
            button.setAttribute("aria-pressed", String(date.iso === state.appointmentDate));
            button.innerHTML = `<span class="tag">Simulated</span>${date.weekday} <strong>${date.label}</strong>`;
            button.addEventListener("click", () => { 
              state.appointmentDate = date.iso; 
              renderAppointment(); 
            });
            dateStrip.append(button);
          });
        }

        if (appointmentWait) {
          appointmentWait.replaceChildren(makeTag("Simulated"));
          if (state.appointmentDate && state.appointmentShift) {
            const shift = shiftCatalog[state.appointmentShift];
            const waitText = text("appointmentWaitText").replace("{slot}", formatClock(shift.start)).replace("{seen}", formatClock(shift.seen));
            appointmentWait.append(document.createTextNode(` ${waitText}`));
          } else {
            appointmentWait.append(document.createTextNode(` ${text("appointmentWaitHint")}`));
          }
        }
      }

      function renderLabCatalog() {
        labBookingPanel.hidden = !labSelectedTest;
        labSelectionSummary.replaceChildren();
        if (labSelectedTest) labSelectionSummary.replaceChildren(makeTag("Observed"), document.createTextNode(` ${labSelectedTest.name}`));
        labCatalog.replaceChildren();
        labTests.forEach((test, index) => {
          const card = document.createElement("article");
          card.className = "catalog-card";
          card.setAttribute("aria-pressed", String(labSelectedTest?.name === test.name));
          card.innerHTML = `<h2><span class="tag">Verified</span>${test.name}</h2><p><span class="tag">Simulated</span> Turnaround: ${test.turnaround}</p><p><span class="tag">Simulated</span> Fasting: ${test.fasting}</p><p><span class="tag">Simulated</span> Govt Fee: ${test.fee}</p>`;
          const choose = document.createElement("button");
          choose.type = "button";
          choose.className = "large-button";
          choose.textContent = labSelectedTest?.name === test.name ? "Selected test" : "Choose this test";
          choose.addEventListener("click", () => {
            labSelectedTest = test;
            labReportCard.hidden = true;
            renderLabCatalog();
            labBookingPanel.scrollIntoView({ behavior: "smooth", block: "start" });
          });
          card.append(choose);
          labCatalog.append(card);
        });
      }

      function renderLabDates() {
        labDate.replaceChildren();
        appointmentDates().slice(0, 4).forEach((date) => {
          const option = document.createElement("option");
          option.value = date.iso;
          option.textContent = `${date.weekday} ${date.label}`;
          labDate.append(option);
        });
      }

      function renderLabSites() {
        labHospital.replaceChildren();
        labSites.forEach((site) => {
          const option = document.createElement("option");
          option.value = site.name;
          option.textContent = site.name;
          labHospital.append(option);
        });
      }

      function renderBloodStock() {
        bloodStockBody.replaceChildren();
        bloodBanks.forEach((bank) => {
          const row = document.createElement("tr");
          const heading = document.createElement("th");
          heading.scope = "row";
          heading.innerHTML = `<span class="tag">Verified</span>${bank.name}<br><small>${bank.address}</small>`;
          row.append(heading);
          bank.values.forEach((count) => {
            const cell = document.createElement("td");
            cell.className = "stock-cell";
            const statusKey = count >= 20 ? "stockAvailable" : count >= 8 ? "stockModerate" : "stockCritical";
            const statusClass = count < 8 ? " stock-critical" : "";
            cell.innerHTML = `<span class="tag${statusClass}">${text(statusKey)}</span><span class="stock-count${statusClass}">${count} units</span>`;
            row.append(cell);
          });
          bloodStockBody.append(row);
        });
      }

      function renderAppointment() {
        if (!state.routeResult && state.complaint) state.routeResult = routeComplaint(state.complaint);
        const department = state.routeResult?.department || "General Medicine";
        bookingDepartment.textContent = departmentCopyKeys[department] ? text(departmentCopyKeys[department]) : department;
        
        // Ensure standard defaults are set so citizen is never left on empty state
        if (!state.appointmentShift) state.appointmentShift = "morning";
        if (!state.visitType) state.visitType = "first";
        if (!state.consultationMode) state.consultationMode = "in-person";
        if (!state.appointmentDate) {
          const dList = appointmentDates();
          if (dList.length > 0) state.appointmentDate = dList[0].iso;
        }

        localitySelect.value = state.locality;
        renderHospitalCards();
        renderAppointmentOptions();
        carryPanel.hidden = !state.selectedHospital;
        renderCarry();
        
        // Specimen pass visibility
        slipPanel.hidden = !state.signedIn;
        if (state.signedIn) {
          renderStepper(5);
          renderSlip();
        }
      }

      function renderLocalities() {
        localitySelect.replaceChildren();
        LOCALITIES.forEach((locality) => {
          const option = document.createElement("option");
          option.value = locality.id;
          option.textContent = locality.label;
          localitySelect.append(option);
        });
      }

      document.querySelector("#lab-book-button").addEventListener("click", () => {
        if (!labSelectedTest) return;
        labStatus.textContent = text("labRequestCreated");
        labStatus.removeAttribute("role");
        labReportCard.hidden = false;
        labReportCard.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      document.querySelector("#lab-download-button").addEventListener("click", () => {
        const content = `Raahat diagnostic report preview\nTest: ${labSelectedTest?.name || "Sample test"}\nStatus: Ready for Download\nThis is simulated data, not a medical report.`;
        const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "raahat-report-preview.txt";
        link.click();
        URL.revokeObjectURL(url);
        labStatus.textContent = text("labReportDownloaded");
      });
      document.querySelector("#emergency-blood-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const token = `EBT-DEMO-${String(Date.now()).slice(-4)}`;
        const slip = document.querySelector("#blood-token-slip");
        slip.hidden = false;
        slip.innerHTML = `<h3><span class="tag">Simulated</span>${text("bloodTokenTitle")}</h3><p><span class="tag">Simulated</span> Token: ${token}</p><p><span class="tag">Observed</span> ${document.querySelector("#blood-patient").value} · ${document.querySelector("#blood-group").value} · ${document.querySelector("#blood-units").value} units</p><p><span class="tag">Observed</span> ${document.querySelector("#blood-component").value} · Ward / ICU: ${document.querySelector("#blood-ward").value}</p><p><span class="tag">Simulated</span> ${text("bloodTokenCall")} <a href="tel:01126594405">011 2659 4405</a> or <a href="tel:01126731287">011 2673 1287</a></p>`;
        slip.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      document.querySelector("#donor-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const donor = { name: document.querySelector("#donor-name").value, age: document.querySelector("#donor-age").value, group: document.querySelector("#donor-group").value, locality: document.querySelector("#donor-locality").value, lastDonation: document.querySelector("#donor-last-date").value };
        const token = `DONOR-DEMO-${String(Date.now()).slice(-4)}`;
        document.querySelector("#donor-status").textContent = `${text("donorSaved")} ${token}`;
      });

      const viewHash = Object.freeze({ home: "screen-home", triage: "screen-triage", profile: "screen-profile", "lab-tests": "screen-lab-tests", "blood-bank": "screen-blood-bank", comparison: "screen-comparison", hospitals: "screen-hospitals", faqs: "screen-faqs", honesty: "screen-honesty", doctor: "screen-doctor" });

      function setActiveNav(viewId) {
        document.querySelectorAll("[data-view-link]").forEach((link) => {
          if (!link.matches(".site-nav a")) return;
          const active = link.dataset.viewLink === viewId;
          link.setAttribute("aria-current", active ? "page" : "false");
        });
        document.querySelectorAll("[data-sidebar-link]").forEach((link) => {
          const active = link.dataset.sidebarLink === viewId;
          link.setAttribute("aria-current", active ? "page" : "false");
        });
      }

      function setLandingView(viewId) {
        document.querySelectorAll("#screen-home [data-view], .service-screen[data-view]").forEach((section) => {
          section.hidden = section.dataset.view !== viewId;
        });
      }

      function hideAllScreens() {
        document.querySelectorAll(".service-screen").forEach((s) => s.hidden = true);
        landingScreen.hidden = true;
        triageScreen.hidden = true;
        honestyScreen.hidden = true;
        questionContent.hidden = true;
        bodyMapScreen.hidden = true;
        reviewScreen.hidden = true;
        resultScreen.hidden = true;
        appointmentScreen.hidden = true;
        ordinaryResult.hidden = true;
        emergencyResult.hidden = true;
      }

      function showQuestion() {
        hideAllScreens();
        triageScreen.hidden = false;
        state.screen = "question";
        renderStepper(1);
        questionContent.hidden = false;
        teleModeNote.hidden = state.consultationMode !== "tele";
        setActiveNav("triage");
        complaint.focus({ preventScroll: true });
        window.scrollTo({ top: Math.max(0, triageScreen.offsetTop - 8), behavior: "auto" });
      }

      function showLanding(targetId = "front-door", viewId = "home") {
        hideAllScreens();
        triageScreen.hidden = true;
        state.screen = "landing";
        landingScreen.hidden = false;
        setLandingView(viewId);
        setActiveNav(viewId);
        const target = document.querySelector(`#${targetId}`) || landingScreen;
        window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        if (targetId !== "front-door") target.scrollIntoView({ behavior: "auto", block: "start" });
      }

      function showHonesty() {
        if (state.screen !== "honesty") state.previousScreen = state.screen;
        hideAllScreens();
        triageScreen.hidden = true;
        state.screen = "honesty";
        honestyScreen.hidden = false;
        setActiveNav("honesty");
        window.scrollTo({ top: 0, behavior: "auto" });
        document.querySelector("#honesty-title").focus();
      }

      function switchView(viewId, { updateHash = true } = {}) {
        const nextView = viewHash[viewId] ? viewId : "home";
        abortSpeechRecognition();
        if (updateHash && window.location.hash !== `#${viewHash[nextView]}`) window.location.hash = viewHash[nextView];
        if (nextView === "triage") {
          showQuestion();
          return;
        }
        if (nextView === "honesty") {
          showHonesty();
          return;
        }
        if (nextView === "profile") {
          hideAllScreens();
          const profScreen = document.querySelector("#screen-profile");
          if (profScreen) profScreen.hidden = false;
          setActiveNav("profile");
          renderProfilePass();
          window.scrollTo({ top: 0, behavior: "auto" });
          document.querySelector("#profile-title")?.focus();
          return;
        }
        if (nextView === "doctor") {
          hideAllScreens();
          const docScreen = document.querySelector("#screen-doctor");
          if (docScreen) docScreen.hidden = false;
          setActiveNav("doctor");
          renderDoctorQueue();
          renderActiveDoctorSBAR();
          window.scrollTo({ top: 0, behavior: "auto" });
          document.querySelector("#doctor-title")?.focus();
          return;
        }
        if (nextView === "lab-tests") {
          hideAllScreens();
          const labScreen = document.querySelector("#screen-lab-tests");
          if (labScreen) labScreen.hidden = false;
          setActiveNav("lab-tests");
          renderLabCatalog();
          window.scrollTo({ top: 0, behavior: "auto" });
          document.querySelector("#lab-title")?.focus();
          return;
        }
        if (nextView === "blood-bank") {
          hideAllScreens();
          const bloodScreen = document.querySelector("#screen-blood-bank");
          if (bloodScreen) bloodScreen.hidden = false;
          setActiveNav("blood-bank");
          window.scrollTo({ top: 0, behavior: "auto" });
          document.querySelector("#blood-title")?.focus();
          return;
        }
        if (nextView === "hospitals") {
          renderPanIndiaDirectory();
        }
        showLanding(nextView === "home" ? "front-door" : nextView === "comparison" ? "screen-comparison" : nextView === "hospitals" ? "screen-hospitals" : "screen-faqs", nextView);
      }

      function handleHashChange() {
        const requestedView = Object.entries(viewHash).find(([, hash]) => hash === window.location.hash.slice(1))?.[0] || "home";
        switchView(requestedView, { updateHash: false });
      }

      window.addEventListener("hashchange", handleHashChange);
      window.addEventListener("beforeunload", abortSpeechRecognition);
      window.addEventListener("pagehide", abortSpeechRecognition);

      function restorePreviousScreen() {
        const previousScreen = state.previousScreen || "question";
        if (previousScreen === "body-map") {
          hideAllScreens();
          state.screen = "body-map";
          questionContent.hidden = true;
          bodyMapScreen.hidden = false;
          document.querySelector("#body-map-title").focus();
          return;
        }
        if (previousScreen === "review") {
          showReadback(state.complaint);
          return;
        }
        if (previousScreen === "result") {
          showResult();
          return;
        }
        if (previousScreen === "appointment") {
          hideAllScreens();
          triageScreen.hidden = false;
          state.screen = "appointment";
          renderStepper(state.signedIn ? 5 : 4);
          questionContent.hidden = true;
          bodyMapScreen.hidden = true;
          appointmentScreen.hidden = false;
          renderAppointment();
          document.querySelector("#booking-title").focus();
          return;
        }
        if (previousScreen === "landing") {
          showLanding();
          return;
        }
        showQuestion();
      }

      function renderEmergencyHospital() {
        const hospital = hospitalsForDepartment("Emergency", state.locality)[0];
        emergencyHospital.replaceChildren();
        if (!hospital) return;
        const title = document.createElement("h2");
        title.textContent = text("emergencyHospitalTitle");
        const name = document.createElement("p");
        name.append(makeTag("Verified"), document.createTextNode(` ${hospital.shortName}`));
        const address = document.createElement("p");
        address.append(makeTag("Verified"), document.createTextNode(` ${hospital.address}`));
        const travel = document.createElement("p");
        const availability = hospital.availability;
        travel.append(makeTag("Simulated"), document.createTextNode(` ${availability.travelMinutes} min · ${availability.distanceKm.toFixed(1)} km`));
        const note = document.createElement("p");
        note.textContent = text("emergencyHospitalNote");
        emergencyHospital.append(title, name, address, travel, note);
      }

      function showResult() {
        hideAllScreens();
        const result = routeComplaint(state.complaint);
        state.routeResult = result;
        state.screen = "result";
        triageScreen.hidden = false;
        renderStepper(3);
        reviewScreen.hidden = true;
        appointmentScreen.hidden = true;
        honestyScreen.hidden = true;
        resultScreen.hidden = false;
        ordinaryResult.hidden = result.urgency === "emergency";
        emergencyResult.hidden = result.urgency !== "emergency";
        resultScreen.setAttribute("aria-labelledby", result.urgency === "emergency" ? "emergency-title" : "result-title");
        findHospital.hidden = result.urgency === "emergency";
        const reason = (result.reason && (result.reason[state.language] || result.reason.hi || result.reason.en)) || "";
        if (result.urgency === "emergency") {
          document.querySelector("#emergency-reason").textContent = reason;
          document.querySelector("#emergency-rule-id").textContent = result.rule_id;
          renderEmergencyHospital();
          document.querySelector("#emergency-title").focus();
        } else {
          document.querySelector("#result-department").textContent = text(departmentCopyKeys[result.department] || result.department);
          document.querySelector("#result-reason").textContent = reason;
          document.querySelector("#result-rule-id").textContent = result.rule_id;
          document.querySelector("#result-title").focus();
        }
      }

      function showAppointment() {
        const result = routeComplaint(state.complaint);
        if (result.urgency === "emergency") return;
        hideAllScreens();
        state.routeResult = result;
        state.screen = "appointment";
        triageScreen.hidden = false;
        renderStepper(state.signedIn ? 5 : 4);
        resultScreen.hidden = true;
        appointmentScreen.hidden = false;
        renderAppointment();
        document.querySelector("#booking-title").focus();
      }

      findHospital.addEventListener("click", showAppointment);
      document.querySelectorAll("#honesty-back, #honesty-back-bottom").forEach((button) => button.addEventListener("click", restorePreviousScreen));
      document.querySelector("#booking-back").addEventListener("click", () => { appointmentScreen.hidden = true; slipPanel.hidden = true; showResult(); });
      localitySelect.addEventListener("change", () => {
        state.locality = localitySelect.value;
        state.selectedHospital = null;
        state.visitType = null;
        state.signInOpened = false;
        state.humanChecked = false;
        state.signedIn = false;
        renderAppointment();
      });
      // Streamlined Step 4 Interactions (Zero screen jumping, smooth top-to-bottom progression)
      document.querySelectorAll("[data-visit-type]").forEach((button) => {
        button.addEventListener("click", () => {
          state.visitType = button.dataset.visitType;
          renderAppointment();
          // Keep citizen focused in place without jumping up or down
        });
      });

      document.querySelectorAll("[data-consultation-mode]").forEach((button) => {
        button.addEventListener("click", () => {
          state.consultationMode = button.dataset.consultationMode;
          renderAppointment();
        });
      });

      document.querySelectorAll("[data-shift]").forEach((button) => {
        button.addEventListener("click", () => {
          state.appointmentShift = button.dataset.shift;
          renderAppointment();
        });
      });

      // Toggle Hospital Change Drawer & Map
      const btnToggleChangeHosp = document.querySelector("#btn-toggle-change-hospital");
      const hospChangeDrawer = document.querySelector("#hospital-change-drawer");
      const btnChangeHospText = document.querySelector("#btn-change-hospital-text");
      if (btnToggleChangeHosp && hospChangeDrawer) {
        btnToggleChangeHosp.addEventListener("click", () => {
          const isHidden = hospChangeDrawer.hidden;
          hospChangeDrawer.hidden = !isHidden;
          btnToggleChangeHosp.setAttribute("aria-expanded", String(isHidden));
          if (btnChangeHospText) {
            btnChangeHospText.textContent = isHidden ? "✕ Close Map & Alternatives" : "🔄 Change Hospital / View Map";
          }
          if (isHidden) {
            if (hospitalLeafletMap) {
              setTimeout(() => {
                hospitalLeafletMap.invalidateSize();
              }, 120);
            }
            hospChangeDrawer.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        });
      }

      // One-Tap OPD Specimen Pass Generator
      const btnGenPass = document.querySelector("#btn-generate-opd-pass");
      if (btnGenPass) {
        btnGenPass.addEventListener("click", () => {
          state.humanChecked = true;
          state.signedIn = true;
          renderAppointment();
          renderStepper(5);
          slipPanel.hidden = false;
          slipPanel.scrollIntoView({ behavior: "smooth", block: "start" });
          document.querySelector("#slip-heading")?.focus();
        });
      }

      toSignIn.addEventListener("click", () => {
        state.signInOpened = true;
        renderAppointment();
      });

      humanCheck.addEventListener("click", () => {
        state.humanChecked = !state.humanChecked;
        renderAppointment();
      });

      signInButton.addEventListener("click", () => {
        state.signedIn = true;
        renderStepper(5);
        renderAppointment();
        slipPanel.hidden = false;
        slipPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        document.querySelector("#slip-heading")?.focus();
      });
      document.querySelector("#print-slip").addEventListener("click", () => window.print());
      document.querySelector("#download-slip").addEventListener("click", () => {
        const candidateHospitals = hospitalsForDepartment(state.routeResult?.department, state.userCoords || state.locality, state.hospitalStateFilter);
        const hospital = candidateHospitals.find((entry) => entry.id === state.selectedHospital) || candidateHospitals[0];
        if (!hospital) return;
        const { availability } = hospital;
        const content = [
          "राहत · Raahat",
          "SPECIMEN , NOT A REAL APPOINTMENT",
          `Patient: ${labelFor("who_for", state.complaint?.who_for)}`,
          `Department: ${state.routeResult.department}`,
          `Hospital: ${hospital.shortName}`,
          `Slot: ${availability.slot}`,
          `Honest wait: ${honestWaitText(availability)}`,
          "Appointment ID: APPT-DEMO-4802",
          "UHID: UHID-MOCK-7281",
          `Patient reports: ${document.querySelector("#slip-report").textContent}`,
          "If you are turned away with this slip , note the appointment ID, raise a grievance at pgportal.gov.in, or file an RTI asking why a valid online appointment was not honoured.",
        ].join("\n");
        const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "raahat-specimen-slip.txt";
        link.click();
        URL.revokeObjectURL(url);
      });

      document.querySelector("#map-continue").addEventListener("click", () => {
        if (!state.kind || !state.duration || !state.severity) {
          mapStatus.textContent = text("mapIncomplete");
          mapStatus.setAttribute("role", "alert");
          return;
        }
        mapStatus.textContent = "";
        mapStatus.removeAttribute("role");
        mapReady.classList.add("is-visible");
        moveTo(mapReady);
      });

      document.querySelector("#review-map-button").addEventListener("click", () => showReadback(makeComplaint(true)));
      document.querySelectorAll("[data-edit-field]").forEach((chip) => chip.addEventListener("click", () => { state.editingField = chip.dataset.editField; renderEditor(state.editingField); }));
      document.querySelector("#confirm-button").addEventListener("click", showResult);
      document.querySelector("#change-button").addEventListener("click", showBodyMap);
      document.querySelector("#result-change").addEventListener("click", () => showReadback(state.complaint));
      document.querySelector("#review-back").addEventListener("click", showQuestion);
      document.querySelector("#choose-department").addEventListener("click", (event) => { event.preventDefault(); showQuestion(); });

      function speechRecognition() { return window.SpeechRecognition || window.webkitSpeechRecognition || null; }

      function resetVoiceButton() {
        state.listening = false;
        voiceButton.setAttribute("aria-pressed", "false");
        voiceButton.setAttribute("aria-label", text("voiceStart"));
        document.querySelector("#voice-label").textContent = text("voiceLabel");
      }

      function abortSpeechRecognition() {
        if (speechSilenceTimer) window.clearTimeout(speechSilenceTimer);
        speechSilenceTimer = null;
        discardTriageAudioCapture();
        if (activeRecognition) {
          try { activeRecognition.abort(); } catch { /* Recognition may already have ended. */ }
          activeRecognition = null;
        }
        if (state.listening) resetVoiceButton();
      }

      function stopSpeechRecognition() {
        if (speechSilenceTimer) window.clearTimeout(speechSilenceTimer);
        speechSilenceTimer = null;
        if (activeRecognition) {
          try { activeRecognition.stop(); } catch { /* Recognition may already have ended. */ }
          activeRecognition = null;
        }
        if (state.listening) resetVoiceButton();
      }

      voiceButton.addEventListener("click", () => {
        if (state.listening) { stopSpeechRecognition(); return; }
        const Recognition = speechRecognition();
        if (!Recognition) { showStatus(text("voiceUnsupported"), true); return; }
        void beginTriageAudioCapture();
        const recognizer = new Recognition();
        activeRecognition = recognizer;
        const targetBcp47 = state.selectedDialectData?.bcp47 || (state.language === "hi" ? "hi-IN" : "en-IN");
        recognizer.lang = targetBcp47;
        recognizer.interimResults = false;
        recognizer.maxAlternatives = 1;
        state.listening = true;
        voiceButton.setAttribute("aria-pressed", "true");
        voiceButton.setAttribute("aria-label", text("voiceStop"));
        document.querySelector("#voice-label").textContent = text("voiceLabelStop");
        const activeLangLabel = state.selectedDialectData ? `${state.selectedDialectData.nativeName} (${state.selectedDialectData.name})` : (state.language === "hi" ? "हिन्दी" : "English");
        showStatus(`Listening in ${activeLangLabel} — speak freely in your dialect...`);
        recognizer.onresult = (event) => {
          if (speechSilenceTimer) window.clearTimeout(speechSilenceTimer);
          complaint.value = event.results[0][0].transcript;
          showStatus(`Captured in ${activeLangLabel}: "${complaint.value}"`);
          handleComplaintInput(complaint.value);
        };
        recognizer.onerror = () => { showStatus(text("voiceUnsupported"), true); resetVoiceButton(); };
        recognizer.onend = async () => {
          if (activeRecognition === recognizer) activeRecognition = null;
          if (speechSilenceTimer) window.clearTimeout(speechSilenceTimer);
          speechSilenceTimer = null;
          resetVoiceButton();
          const audioBlob = await finishTriageAudioCapture();
          const transcription = await transcribeBrowserAudio(audioBlob, targetBcp47);
          if (transcription) {
            complaint.value = transcription;
            showStatus(`AI transcription captured: "${transcription}"`);
            handleComplaintInput(transcription);
          }
        };
        try {
          recognizer.start();
          speechSilenceTimer = window.setTimeout(() => { showStatus(text("voiceSilence"), true); abortSpeechRecognition(); }, 7000);
        } catch { resetVoiceButton(); showStatus(text("voiceUnsupported"), true); }
      });

      document.querySelector("#continue-button").addEventListener("click", async () => {
        const missingCaregiver = state.booking === "someone" && (!state.who || !state.age);
        if (missingCaregiver) {
          showStatus(text("someoneHint"), true);
          const drawer = document.querySelector("#patient-details-drawer");
          if (drawer) drawer.dataset.collapsed = "false";
          document.querySelector("[data-caregiver]").scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        if (!complaint.value.trim()) { showStatus(text("continueHint"), true); complaint.focus(); return; }
        sessionNote.classList.remove("is-visible");
        const continueButton = document.querySelector("#continue-button");
        continueButton.disabled = true;
        showStatus("Reading your words…");
        const extractedComplaint = await extractComplaintWithFallback(complaint.value.trim());
        continueButton.disabled = false;
        showReadback(extractedComplaint);
      });

      const introSplash = document.querySelector("#intro-splash");
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) {
        document.body.classList.add("intro-complete");
        introSplash?.remove();
      } else {
        window.setTimeout(() => {
          document.body.classList.add("intro-complete");
          introSplash?.classList.add("is-gliding");
        }, 600);
        window.setTimeout(() => introSplash?.remove(), 1120);
      }

      const bodyMap3d = await createBodyMap3D({
          canvas: map3dCanvas,
          stage: map3dStage,
          language: state.language,
          onSelect: (region, side) => selectRegion(region, true, side),
          onHover: (hit) => {
            if (hit) workspaceSummary.dataset.hoveredRegion = hit.region;
            else delete workspaceSummary.dataset.hoveredRegion;
          },
          onUnavailable: () => {
            state.threeAvailable = false;
            state.mapMode = "2d";
            renderMapMode();
          },
        });
      document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => bodyMap3d.setView?.(button.dataset.view)));
      state.threeAvailable = bodyMap3d.available;
      if (!state.threeAvailable) state.mapMode = "2d";
      
      // --- Pan-India Hospital Directory Logic (Fast Batched Rendering) ---
      let directoryCurrentPage = 1;
      const DIRECTORY_PAGE_SIZE = 12;
      let directoryFilteredList = [];

      function renderPanIndiaDirectory() {
        const stateSelect = document.querySelector("#state-directory-select");
        const searchInput = document.querySelector("#directory-search-input");
        const countSpan = document.querySelector("#state-hospital-count");
        const grid = document.querySelector("#pan-india-network-grid");
        const loadMoreWrap = document.querySelector("#directory-load-more-wrap");
        const loadMoreBtn = document.querySelector("#btn-load-more-hospitals");
        if (!stateSelect || !grid) return;

        // Initialize state options once
        if (stateSelect.options.length === 0) {
          INDIAN_STATES.forEach((st) => {
            const opt = document.createElement("option");
            opt.value = st;
            opt.textContent = st === "All India" ? "All India (2,630+ Facilities)" : st;
            stateSelect.appendChild(opt);
          });
          stateSelect.value = "All India";
          stateSelect.addEventListener("change", () => filterAndRender(true));
        }

        if (searchInput && !searchInput.dataset.wired) {
          searchInput.dataset.wired = "true";
          let searchTimer;
          searchInput.addEventListener("input", () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => filterAndRender(true), 250);
          });
        }

        if (loadMoreBtn && !loadMoreBtn.dataset.wired) {
          loadMoreBtn.dataset.wired = "true";
          loadMoreBtn.addEventListener("click", () => {
            directoryCurrentPage++;
            renderBatch(false);
          });
        }

        function filterAndRender(resetPage = true) {
          if (resetPage) directoryCurrentPage = 1;
          const selectedState = stateSelect.value || "All India";
          const q = (searchInput?.value || "").trim().toLowerCase();

          let list = hospitalsByState(selectedState);
          if (q) {
            list = list.filter((h) => 
              h.name.toLowerCase().includes(q) ||
              (h.city && h.city.toLowerCase().includes(q)) ||
              (h.district && h.district.toLowerCase().includes(q)) ||
              (h.state && h.state.toLowerCase().includes(q)) ||
              (h.tier && h.tier.toLowerCase().includes(q))
            );
          }

          directoryFilteredList = list;
          if (countSpan) {
            countSpan.textContent = `${list.length.toLocaleString()} Facilities Matching`;
          }

          renderBatch(true);
        }

        function renderBatch(clearGrid = false) {
          if (clearGrid) grid.innerHTML = "";
          
          if (directoryFilteredList.length === 0) {
            grid.innerHTML = `<p class="booking-panel-note" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">No facilities found matching your search. Try searching a different district or state.</p>`;
            if (loadMoreWrap) loadMoreWrap.hidden = true;
            return;
          }

          const startIndex = (directoryCurrentPage - 1) * DIRECTORY_PAGE_SIZE;
          const batch = directoryFilteredList.slice(clearGrid ? 0 : startIndex, directoryCurrentPage * DIRECTORY_PAGE_SIZE);

          batch.forEach((h) => {
            const card = document.createElement("article");
            card.className = "network-card";
            const deptsSnippet = h.departments ? h.departments.slice(0, 3).join(", ") : "General Medicine, OPD";
            card.innerHTML = `
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.4rem;">
                <h3 style="margin: 0; font-size: 1.15rem; line-height: 1.25;">${h.shortName || h.name}</h3>
                <span class="tier-pill" style="font-size: 0.72rem; padding: 0.15rem 0.55rem; white-space: nowrap;">${h.tier || "Govt Hospital"}</span>
              </div>
              <p style="margin: 0 0 0.5rem; font-size: 0.88rem; color: var(--muted);"><span class="tag">Verified</span> ${h.address || (h.city ? `${h.city}, ${h.state}` : h.state)}</p>
              <p class="network-access" style="margin: 0 0 0.5rem; font-size: 0.84rem;"><span class="tag">Verified</span> ${h.transit || "Main Registration Counter · Regular OPD"}</p>
              
              <div class="network-meta" style="margin-bottom: 0.75rem;">
                <span class="network-pill"><span class="tag">Verified</span> 24/7 Emergency</span>
                <span class="network-pill"><span class="tag">Verified</span> ${deptsSnippet}</span>
              </div>

              <div class="network-card-actions">
                <button type="button" class="large-button primary" data-book-hospital="${h.id}">
                  Book OPD Triage Here →
                </button>
                <a href="${h.sourceUrl || "https://ors.gov.in/"}" target="_blank" rel="noreferrer" class="large-button" style="text-align: center; text-decoration: none; display: inline-flex; align-items: center; justify-content: center;">
                  Official Portal ↗
                </a>
              </div>
            `;

            // Wire 1-tap booking
            card.querySelector("[data-book-hospital]").addEventListener("click", () => {
              state.selectedHospital = h.id;
              if (h.lat && h.lng) {
                state.userCoords = { lat: h.lat, lng: h.lng, name: h.city || h.state };
              }
              switchView("triage");
            });

            grid.appendChild(card);
          });

          // Show/hide load more button
          if (loadMoreWrap) {
            const hasMore = directoryCurrentPage * DIRECTORY_PAGE_SIZE < directoryFilteredList.length;
            loadMoreWrap.hidden = !hasMore;
            if (hasMore && loadMoreBtn) {
              const remaining = directoryFilteredList.length - (directoryCurrentPage * DIRECTORY_PAGE_SIZE);
              loadMoreBtn.textContent = `Load More Facilities (${remaining > DIRECTORY_PAGE_SIZE ? DIRECTORY_PAGE_SIZE : remaining} of ${remaining.toLocaleString()} remaining) ↓`;
            }
          }
        }

        filterAndRender(true);
      }

      // --- Doctor & Staff Portal Logic ---
      const doctorQueueData = [
        {
          token: "#OPD-2026-4802",
          patient: "Ramesh Kumar",
          age: "64y",
          gender: "Male",
          condition: "Type-2 Diabetes, HTN (5 yrs)",
          meds: "Metformin 500mg BD, Telmisartan 40mg OD",
          complaint: "Kal raat se seene mein dard aur bhaari-pan mehsoos ho raha hai",
          severity: "Severe right now (Pain 8/10)",
          department: "Cardiology",
          counter: "Counter 4 (Cardiology)",
          rule: "RULE-CARDIO-CHEST-PAIN",
          safety: "PASSED (No active loss of consciousness)",
          recommendation: "Perform 12-lead ECG immediately. Order Cardiac Troponin-I and Serum Electrolytes.",
          status: "Inside Consultation Room"
        },
        {
          token: "#OPD-2026-4803",
          patient: "Aarav Verma",
          age: "5y",
          gender: "Male",
          condition: "None",
          meds: "Paracetamol 250mg syrup",
          complaint: "Tez bukhaar 102°F kal subah se, khana nahi kha raha",
          severity: "Moderate fever",
          department: "Paediatrics",
          counter: "Counter 1 (Paediatrics)",
          rule: "RULE-PAED-FEVER",
          safety: "PASSED",
          recommendation: "Check temperature and hydration. Perform rapid CBC and Dengue NS1 if fever persists > 3 days.",
          status: "Waiting in Hall A"
        },
        {
          token: "#OPD-2026-4804",
          patient: "Sunita Devi",
          age: "32y",
          gender: "Female",
          condition: "Migraine history",
          meds: "Sumatriptan 50mg PRN",
          complaint: "Aadhe sar mein tez dard, ulti jaisa lag raha hai aur roshni chubhti hai",
          severity: "Severe headache",
          department: "Neurology",
          counter: "Counter 2 (Neurology)",
          rule: "RULE-NEURO-HEADACHE",
          safety: "PASSED (No focal neuro deficit)",
          recommendation: "Quiet room assessment, symptomatic anti-emetic + analgesic trial. Neuro exam normal.",
          status: "Waiting in Hall B"
        },
        {
          token: "#OPD-2026-4805",
          patient: "Rajesh Gupta",
          age: "54y",
          gender: "Male",
          condition: "None",
          meds: "None",
          complaint: "Ghutne mein sujan aur chalne mein takleef do hafte se",
          severity: "Moderate pain",
          department: "Orthopaedics",
          counter: "Counter 3 (Orthopaedics)",
          rule: "RULE-ORTHO-KNEE",
          safety: "PASSED",
          recommendation: "Weight-bearing bilateral knee X-ray (AP & Lat). NSAID gel prescription.",
          status: "Waiting in Hall B"
        }
      ];

      let activeDoctorQueueIndex = 0;

      function renderDoctorQueue() {
        const queueList = document.querySelector("#doctor-queue-list");
        const countSpan = document.querySelector("#doctor-queue-count");
        if (!queueList) return;

        const waitingCount = doctorQueueData.filter(item => item.status !== "Seen").length;
        if (countSpan) countSpan.textContent = `${waitingCount} Waiting`;

        queueList.innerHTML = "";
        doctorQueueData.forEach((item, idx) => {
          const li = document.createElement("li");
          li.className = `queue-item ${idx === activeDoctorQueueIndex ? "active" : ""} ${item.status === "Seen" ? "seen" : ""}`;
          li.innerHTML = `
            <div class="queue-item-top">
              <span class="queue-token-num">${item.token}</span>
              <span class="queue-badge" style="font-size:0.75rem;">${item.status}</span>
            </div>
            <div class="queue-patient-name">${item.patient} (${item.age}, ${item.gender})</div>
            <div class="queue-meta">${item.department} · ${item.complaint.slice(0, 36)}...</div>
          `;
          li.addEventListener("click", () => {
            activeDoctorQueueIndex = idx;
            renderActiveDoctorSBAR();
            renderDoctorQueue();
          });
          queueList.appendChild(li);
        });
      }

      function renderActiveDoctorSBAR() {
        const item = doctorQueueData[activeDoctorQueueIndex];
        if (!item) return;

        const tokenEl = document.querySelector("#sbar-active-token");
        const statusEl = document.querySelector("#sbar-status-tag");
        const sitEl = document.querySelector("#sbar-situation");
        const bgEl = document.querySelector("#sbar-background");
        const assessEl = document.querySelector("#sbar-assessment");
        const recEl = document.querySelector("#sbar-recommendation");

        if (tokenEl) tokenEl.textContent = `Token ${item.token}`;
        if (statusEl) {
          const isSeen = item.status === "Seen";
          statusEl.innerHTML = `<span class="queue-badge" style="background:${isSeen ? "var(--accent-soft)" : "var(--marigold-soft)"}; color:${isSeen ? "var(--accent-dark)" : "var(--ink)"};">${item.status}</span>`;
        }
        if (sitEl) sitEl.textContent = `"${item.complaint}" · ${item.severity}`;
        if (bgEl) bgEl.innerHTML = `Patient: <strong>${item.patient} (${item.age}, ${item.gender})</strong> · Conditions: ${item.condition} · Active Meds: <em>${item.meds}</em>`;
        if (assessEl) assessEl.innerHTML = `Matched Rule: <code>${item.rule}</code> · Counter: <strong>${item.counter}</strong> · Safety Check: <span style="color:var(--accent); font-weight:800;">${item.safety}</span>`;
        if (recEl) recEl.textContent = item.recommendation;
      }

      function updateSlipStatusDirectly(data) {
        const liveStatusPill = document.querySelector("#slip-live-status");
        const liveStatusText = document.querySelector("#slip-live-status-text");
        if (liveStatusPill && liveStatusText) {
          liveStatusPill.className = "slip-status-pill seen";
          liveStatusText.innerHTML = `<span class="scorecard-tag tag-positive"><svg class="icon-inline" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg> Seen</span> <strong>Doctor:</strong> ${data.doctor || "Dr. S. Mukherjee"} · Completed at ${data.timestamp || "Just now"}`;
        }
      }

      
      // --- Web Audio Synthesizer Chime (Hospital Calling Bell) ---
      let hospitalAudioCtx = null;
      function playHospitalChime() {
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtx) return;
          if (!hospitalAudioCtx || hospitalAudioCtx.state === "closed") {
            hospitalAudioCtx = new AudioCtx();
          }
          if (hospitalAudioCtx.state === "suspended") {
            hospitalAudioCtx.resume();
          }
          const ctx = hospitalAudioCtx;
          const now = ctx.currentTime;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = "sine";
          osc1.frequency.setValueAtTime(587.33, now); // D5
          osc1.frequency.exponentialRampToValueAtTime(880, now + 0.28); // A5

          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(440, now); // A4
          osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.28); // E5

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.65);
          osc2.stop(now + 0.65);
        } catch (e) {
          console.log("Audio chime error:", e);
        }
      }

      // --- Navigation to Specimen Slip (Fixing showSlip crash) ---
      function navigateToSpecimenSlip() {
        hideAllScreens();
        triageScreen.hidden = false;
        state.screen = "appointment";
        state.signedIn = true;
        renderStepper(5);
        questionContent.hidden = true;
        bodyMapScreen.hidden = true;
        reviewScreen.hidden = true;
        resultScreen.hidden = true;
        appointmentScreen.hidden = false;
        renderAppointment();
        slipPanel.hidden = false;
        slipPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        document.querySelector("#slip-heading")?.focus();
      }

      // --- Render Active Citizen Profile Pass ---
      function renderProfilePass() {
        const tokenEl = document.querySelector("#pass-active-token");
        const nameEl = document.querySelector("#pass-patient-name");
        const hospEl = document.querySelector("#pass-hospital-name");
        const counterEl = document.querySelector("#pass-counter-name");
        const pillEl = document.querySelector("#pass-status-pill");

        const activePatient = doctorQueueData[activeDoctorQueueIndex] || doctorQueueData[0];
        if (tokenEl) tokenEl.textContent = state.appointmentId ? `#${state.appointmentId}` : activePatient.token;

        // Resolve patient name accurately from triage state or family profile
        const resolvedName = state.complaint?.patient_name || state.patientName || state.fullName || activePatient.patient;
        const resolvedAge = state.exactAge || (state.complaint?.age_band === "child" ? "5" : "64");
        if (nameEl) nameEl.textContent = `${resolvedName} (${resolvedAge}y)`;

        // Resolve hospital name from state.selectedHospital ID string or object
        let resolvedHospitalName = "AIIMS New Delhi";
        if (state.selectedHospital) {
          if (typeof state.selectedHospital === "object" && state.selectedHospital.name) {
            resolvedHospitalName = state.selectedHospital.name;
          } else if (typeof state.selectedHospital === "string") {
            const matchHosp = PAN_INDIA_HOSPITALS.find((h) => h.id === state.selectedHospital);
            if (matchHosp) resolvedHospitalName = matchHosp.name;
          }
        }
        if (hospEl) hospEl.textContent = resolvedHospitalName;

        // Realistic Department-to-Counter Mapping
        const dept = state.routeResult?.department || activePatient.department || "Cardiology";
        const counterMap = {
          "Cardiology": "Cardiology · Counter 4 (Room 104)",
          "General Medicine": "General Medicine · Counter 2 (Room 102)",
          "Paediatrics": "Paediatrics · Counter 3 (Room 103)",
          "Neurology": "Neurology · Counter 1 (Room 101)",
          "Orthopaedics": "Orthopaedics · Counter 5 (Room 105)",
          "Emergency": "Emergency Trauma Bay · 24/7 Red Flag",
          "ENT": "ENT · Counter 6 (Room 106)",
          "Ophthalmology": "Ophthalmology · Counter 7 (Room 107)",
          "Obstetrics & Gynaecology": "Gynaecology · Counter 8 (Room 108)",
          "General Surgery": "General Surgery · Counter 9 (Room 109)",
          "Dental": "Dental Clinic · Counter 10 (Room 110)"
        };
        if (counterEl) counterEl.textContent = counterMap[dept] || `${dept} · Counter 1 (Room 101)`;

        if (pillEl) {
          if (activePatient.status === "Seen") {
            pillEl.className = "pass-status-pill seen";
            pillEl.innerHTML = `<span class="scorecard-tag tag-positive">✓ Done</span> Consultation Complete`;
          } else if (activePatient.status.includes("Consultation Room")) {
            pillEl.className = "pass-status-pill inside";
            pillEl.innerHTML = `<span class="status-indicator-dot mini"></span> Inside Consultation Room`;
          } else {
            pillEl.className = "pass-status-pill";
            pillEl.innerHTML = `<span class="scorecard-tag">Queued</span> Waiting in Hall (${activePatient.status})`;
          }
        }
      }

      // --- Wire Patient Profile Screen ---
      function wireProfileScreen() {
        document.querySelector("#pass-view-slip-btn")?.addEventListener("click", () => {
          navigateToSpecimenSlip();
        });

        document.querySelector("#pass-print-btn")?.addEventListener("click", () => {
          document.body.classList.add("printing-pass");
          window.print();
          setTimeout(() => document.body.classList.remove("printing-pass"), 1000);
        });

        // Past slip downloads
        document.querySelectorAll("[data-download-past]").forEach(btn => {
          btn.addEventListener("click", () => {
            const slipType = btn.dataset.downloadPast;
            const content = `Raahat Citizen Specimen Slip (Historical Record)\nReference: REF-${slipType.toUpperCase()}-2026\nPatient: Ramesh Kumar (64M)\nHospital: AIIMS New Delhi\nThis is simulated patient history for the Raahat civic prototype.`;
            const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `raahat-visit-${slipType}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          });
        });

        // Family profile quick triage
        document.querySelectorAll("[data-book-family]").forEach(btn => {
          btn.addEventListener("click", () => {
            const member = btn.dataset.bookFamily;
            if (member === "ramesh") {
              state.fullName = "Ramesh Kumar";
              state.patientName = "Ramesh Kumar";
              state.exactAge = "64";
              state.booking = "myself";
              state.age = "older";
            } else if (member === "sunita") {
              state.fullName = "Sunita Devi";
              state.patientName = "Sunita Devi";
              state.exactAge = "60";
              state.booking = "someoneElse";
              state.who = "parent";
              state.age = "older";
            } else if (member === "aarav") {
              state.fullName = "Aarav Verma";
              state.patientName = "Aarav Verma";
              state.exactAge = "5";
              state.booking = "someoneElse";
              state.who = "child";
              state.age = "child";
            }

            // Immediately populate the triage form inputs
            const nameInput = document.querySelector("#patient-name");
            if (nameInput) nameInput.value = state.fullName;
            const exactAgeInput = document.querySelector("#exact-age");
            if (exactAgeInput) exactAgeInput.value = state.exactAge;
            document.querySelectorAll(".age-button").forEach(b => {
              b.setAttribute("aria-pressed", String(b.dataset.age === state.age));
            });
            document.querySelectorAll("[data-landing-booking]").forEach(b => {
              b.setAttribute("aria-pressed", String(b.dataset.landingBooking === state.booking));
            });

            switchView("triage");
          });
        });

        document.querySelector("#btn-clear-profile-data")?.addEventListener("click", () => {
          if (confirm("Reset this session's demonstration view?")) {
            alert("No personal or health record was saved.");
            renderProfilePass();
          }
        });
      }

      // --- Wire Multi-Role Hospital Suite Tabs ---
      function wireHospitalRoleSuite() {
        const roleTabs = document.querySelectorAll(".role-tab");
        const rolePanels = {
          desk: document.querySelector("#role-panel-desk"),
          counter: document.querySelector("#role-panel-counter"),
          cmo: document.querySelector("#role-panel-cmo")
        };

        roleTabs.forEach(tab => {
          tab.addEventListener("click", () => {
            const targetRole = tab.dataset.roleView;
            roleTabs.forEach(t => {
              t.classList.remove("active");
              t.setAttribute("aria-selected", "false");
            });
            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");

            Object.entries(rolePanels).forEach(([role, panel]) => {
              if (panel) panel.hidden = role !== targetRole;
            });
          });
        });

        // Fast Rx & Lab Orders Chips
        const selectedRx = new Set();
        const rxSummaryBox = document.querySelector("#rx-selected-summary");
        const rxSummaryText = document.querySelector("#rx-selected-items-text");

        function updateRxSummary() {
          if (!rxSummaryBox || !rxSummaryText) return;
          if (selectedRx.size === 0) {
            rxSummaryBox.style.display = "none";
          } else {
            rxSummaryBox.style.display = "block";
            rxSummaryText.textContent = Array.from(selectedRx).join(" · ");
          }
        }

        document.querySelectorAll(".rx-chip").forEach(chip => {
          chip.addEventListener("click", () => {
            const val = chip.dataset.rx || chip.dataset.lab;
            if (chip.classList.contains("added")) {
              chip.classList.remove("added");
              selectedRx.delete(val);
            } else {
              chip.classList.add("added");
              selectedRx.add(val);
            }
            updateRxSummary();
          });
        });

        // Hospital Counter Select Change Listener
        const doctorHospSelect = document.querySelector("#doctor-hospital-select");
        doctorHospSelect?.addEventListener("change", () => {
          const selectedVal = doctorHospSelect.value;
          if (selectedVal.includes("safdarjung")) {
            activeDoctorQueueIndex = doctorQueueData.findIndex(item => item.department === "General Medicine");
          } else if (selectedVal.includes("rml")) {
            activeDoctorQueueIndex = doctorQueueData.findIndex(item => item.department === "Neurology");
          } else if (selectedVal.includes("nimhans")) {
            activeDoctorQueueIndex = doctorQueueData.findIndex(item => item.department === "Neurology");
          } else if (selectedVal.includes("pgimer")) {
            activeDoctorQueueIndex = doctorQueueData.findIndex(item => item.department === "Orthopaedics");
          } else {
            activeDoctorQueueIndex = 0; // AIIMS Cardiology
          }
          if (activeDoctorQueueIndex === -1) activeDoctorQueueIndex = 0;
          renderActiveDoctorSBAR();
          renderDoctorQueue();
          renderProfilePass();
        });

        // Registration Counter Terminal Logic
        const terminalForm = document.querySelector("#terminal-register-form");
        const terminalFeedback = document.querySelector("#terminal-feedback");

        terminalForm?.addEventListener("submit", (e) => {
          e.preventDefault();
          const name = document.querySelector("#terminal-name").value;
          const age = document.querySelector("#terminal-age").value;
          const gender = document.querySelector("#terminal-gender").value;
          const dept = document.querySelector("#terminal-department").value;
          const cat = document.querySelector("#terminal-category").value;
          const complaint = document.querySelector("#terminal-complaint").value;

          const newTokenNum = `#OPD-${Math.floor(1000 + Math.random() * 9000)}`;

          // Dynamic estimated seen time (current time + 18 mins)
          const now = new Date();
          const estDate = new Date(now.getTime() + 18 * 60000);
          const estTimeStr = estDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          // Update thermal slip display
          document.querySelector("#thermal-display-token").textContent = newTokenNum;
          document.querySelector("#thermal-display-patient").textContent = name;
          document.querySelector("#thermal-display-meta").textContent = `${age}Y / ${gender}`;
          document.querySelector("#thermal-display-counter").textContent = dept;
          document.querySelector("#thermal-display-fee").textContent = cat.includes("Free") ? "₹0 (WAIVED)" : "₹10 PAID";
          const seenTimeEl = document.querySelector("#thermal-display-seen");
          if (seenTimeEl) seenTimeEl.textContent = `~${estTimeStr} (18 min wait)`;

          // Add to live doctorQueueData
          doctorQueueData.push({
            token: newTokenNum,
            patient: name,
            age: `${age}y`,
            gender: gender,
            condition: "Registration Desk Walk-In",
            meds: "None recorded",
            complaint: complaint,
            severity: "Standard walk-in",
            department: dept.split("·")[0].trim(),
            counter: dept,
            rule: "RULE-WALKIN-DISPATCH",
            safety: "PASSED",
            recommendation: "Initial OPD assessment and vital signs check.",
            status: "Waiting in Hall"
          });

          renderDoctorQueue();
          playHospitalChime();

          if (terminalFeedback) {
            terminalFeedback.textContent = `[Confirmed] Token ${newTokenNum} dispatched for ${name}! Added to live queue.`;
          }
        });

        // Quick UHID search samples
        document.querySelectorAll("[data-quick-uhid]").forEach(chip => {
          chip.addEventListener("click", () => {
            const member = chip.dataset.quickUhid;
            if (member === "ramesh") {
              document.querySelector("#terminal-name").value = "Ramesh Kumar";
              document.querySelector("#terminal-age").value = "64";
              document.querySelector("#terminal-gender").value = "Male";
              document.querySelector("#terminal-category").value = "Senior Citizen (Free)";
              document.querySelector("#terminal-department").value = "Cardiology · Counter 4";
              document.querySelector("#terminal-complaint").value = "Seene mein dard aur thakan";
            } else if (member === "sunita") {
              document.querySelector("#terminal-name").value = "Sunita Devi";
              document.querySelector("#terminal-age").value = "60";
              document.querySelector("#terminal-gender").value = "Female";
              document.querySelector("#terminal-category").value = "Senior Citizen (Free)";
              document.querySelector("#terminal-department").value = "General Medicine · Counter 2";
              document.querySelector("#terminal-complaint").value = "Saans phoolna aur mausam ka asar";
            }
          });
        });

        document.querySelector("#terminal-print-btn")?.addEventListener("click", () => {
          document.body.classList.add("printing-thermal");
          window.print();
          setTimeout(() => document.body.classList.remove("printing-thermal"), 1000);
        });

        // Doctor Portal Actions Wiring
        const callNextBtn = document.querySelector("#doctor-call-next");
        const markSeenBtn = document.querySelector("#doctor-mark-seen");
        const emergencyBtn = document.querySelector("#doctor-escalate-emergency");
        const orderTestsBtn = document.querySelector("#doctor-order-tests");
        const feedbackEl = document.querySelector("#doctor-action-feedback");

        callNextBtn?.addEventListener("click", () => {
          playHospitalChime();
          const nextIdx = doctorQueueData.findIndex((item, i) => i > activeDoctorQueueIndex && item.status !== "Seen");
          const firstUnseen = doctorQueueData.findIndex(item => item.status !== "Seen");
          
          if (nextIdx === -1 && firstUnseen === -1) {
            if (feedbackEl) feedbackEl.textContent = "[Complete] All patients in current OPD session have been seen.";
            return;
          }

          if (nextIdx !== -1) {
            activeDoctorQueueIndex = nextIdx;
          } else if (firstUnseen !== -1) {
            activeDoctorQueueIndex = firstUnseen;
          }
          doctorQueueData[activeDoctorQueueIndex].status = "Inside Consultation Room";
          renderActiveDoctorSBAR();
          renderDoctorQueue();
          renderProfilePass();
          if (feedbackEl) feedbackEl.textContent = `[Calling] ${doctorQueueData[activeDoctorQueueIndex].patient} (${doctorQueueData[activeDoctorQueueIndex].token}) to Consultation Room.`;
        });

        markSeenBtn?.addEventListener("click", () => {
          const current = doctorQueueData[activeDoctorQueueIndex];
          current.status = "Seen";
          const orders = selectedRx.size > 0 ? Array.from(selectedRx).join(", ") : "Standard OPD Advice & Followup";
          current.signedRx = orders;
          renderActiveDoctorSBAR();
          renderDoctorQueue();

          const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const eventData = {
            token: current.token,
            patient: current.patient,
            status: "Seen",
            timestamp: timestamp,
            doctor: "Dr. S. Mukherjee, MD (Attending Specialist)",
            orders: orders
          };

          updateSlipStatusDirectly(eventData);
          renderProfilePass();

          if (feedbackEl) {
            feedbackEl.innerHTML = `<span class="scorecard-tag tag-positive">✓ Signed</span> <strong>${current.token}</strong> consultation complete at ${timestamp}. Orders: <em>${orders}</em>`;
          }
        });

        emergencyBtn?.addEventListener("click", () => {
          const current = doctorQueueData[activeDoctorQueueIndex];
          if (feedbackEl) {
            feedbackEl.textContent = `[EMERGENCY] Patient ${current.token} fast-tracked to 24/7 Red Flag Emergency. Stretcher & Triage Nurse dispatched.`;
          }
        });

        orderTestsBtn?.addEventListener("click", () => {
          switchView("lab-tests");
        });
      }

      function wireDoctorPortal() {
        // Handled cleanly in wireHospitalRoleSuite
      }

      // --- Prescription OCR Logic ---
      function wirePrescriptionOCR() {
        const ocrChips = document.querySelectorAll("[data-ocr-sample]");
        const fileInput = document.querySelector("#prescription-file-input");
        const feedbackEl = document.querySelector("#ocr-feedback-status");

        const sampleProfiles = {
          "elderly-cardio": {
            name: "Ramesh Kumar",
            age: 64,
            ageBand: "older",
            gender: "male",
            conditions: ["diabetes", "hypertension"],
            complaint: "seene mein dard aur bhaari pan kal raat se",
            meds: "Metformin 500mg BD, Telmisartan 40mg OD"
          },
          "paediatric-fever": {
            name: "Aarav Verma",
            age: 5,
            ageBand: "child",
            gender: "male",
            conditions: ["none"],
            complaint: "tez bukhaar 102°F kal subah se, thand lag rahi hai",
            meds: "Paracetamol 250mg syrup"
          },
          "young-neuro": {
            name: "Sunita Devi",
            age: 32,
            ageBand: "adult",
            gender: "female",
            conditions: ["none"],
            complaint: "aadhe sar mein tez dard, ulti aur roshni se pareshaani",
            meds: "Sumatriptan 50mg"
          }
        };

        function applyOcrProfile(profile) {
          if (!feedbackEl) return;
          feedbackEl.hidden = false;
          feedbackEl.textContent = "Scanning clinical prescription with multi-modal AI parser...";

          setTimeout(() => {
            const nameInput = document.querySelector("#patient-name");
            if (nameInput) {
              nameInput.value = profile.name;
              state.patientName = profile.name;
            }

            const exactAgeInput = document.querySelector("#exact-age");
            if (exactAgeInput) {
              exactAgeInput.value = profile.age;
              state.exactAge = profile.age;
            }

            document.querySelectorAll(".age-button").forEach((btn) => {
              if (btn.dataset.age === profile.ageBand) {
                btn.click();
              }
            });

            document.querySelectorAll("[data-gender]").forEach((btn) => {
              if (btn.dataset.gender === profile.gender) {
                btn.click();
              }
            });

            document.querySelectorAll(".condition-chip").forEach((btn) => {
              const cond = btn.dataset.condition;
              if (profile.conditions.includes(cond)) {
                if (btn.getAttribute("aria-pressed") !== "true") btn.click();
              } else if (cond !== "none" && profile.conditions.includes("none")) {
                if (btn.getAttribute("aria-pressed") === "true") btn.click();
              }
            });

            if (complaint) {
              complaint.value = profile.complaint;
              updateCharCounter();
              handleComplaintInput(complaint.value);
            }

            feedbackEl.innerHTML = `<span class="scorecard-tag tag-positive">Verified</span> <strong>Prescription Digitized Successfully!</strong> Auto-filled Patient Name (${profile.name}), Age (${profile.age}), Conditions &amp; Active Meds (${profile.meds}). Zero manual typing needed.`;
          }, 350);
        }

        ocrChips.forEach((chip) => {
          chip.addEventListener("click", () => {
            const key = chip.dataset.ocrSample;
            if (sampleProfiles[key]) applyOcrProfile(sampleProfiles[key]);
          });
        });

        fileInput?.addEventListener("change", (e) => {
          if (e.target.files && e.target.files[0]) {
            applyOcrProfile(sampleProfiles["elderly-cardio"]);
          }
        });
      }

      
      // --- WhatsApp Civic Gateway Simulator Logic (Track B) ---
      function wireWhatsAppSimulator() {
        const fab = document.querySelector("#whatsapp-fab");
        const modal = document.querySelector("#whatsapp-modal");
        const closeBtn = document.querySelector("#wa-close-btn");
        const chatBody = document.querySelector("#wa-chat-body");
        const chatForm = document.querySelector("#wa-chat-form");
        const chatInput = document.querySelector("#wa-chat-input");
        const micBtn = document.querySelector("#wa-mic-btn");
        const locBtn = document.querySelector("#wa-location-btn");
        const quickPrompts = document.querySelectorAll(".wa-prompt-btn");

        if (!fab || !modal) return;

        let session = createInitialSession("DEMO-CALLER");
        let isRecording = false;
        let mediaRecorder = null;
        let mediaStream = null;
        let audioChunks = [];
        let speechRecognition = null;
        let speechTranscript = "";

        // Web Audio Synthesized WhatsApp Sound Effects
        function playWaSendSound() {
          try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.07);
            gain.gain.setValueAtTime(0.14, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
          } catch (e) {}
        }

        function playWaReceiveSound() {
          try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            osc1.type = "sine";
            osc2.type = "sine";
            osc1.frequency.setValueAtTime(587.33, now);
            osc2.frequency.setValueAtTime(880, now + 0.06);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.06);
            osc2.start(now + 0.06);
            osc2.stop(now + 0.22);
          } catch (e) {}
        }

        const headerCallBtn = document.querySelector("#wa-header-call-btn");
        headerCallBtn?.addEventListener("click", () => {
          modal.hidden = true;
          const ivrFab = document.querySelector("#ivr-fab");
          ivrFab?.click();
        });

        let hasInitialized = false;
        function initConversation() {
          hasInitialized = true;
          chatBody.innerHTML = "";
          session = createInitialSession("DEMO-CALLER");
          const initRes = handleWhatsAppMessage(session, { text: "hi" });
          initRes.replies.forEach((reply) => {
            if (reply.type === "text") {
              appendWaMessage(reply.text, false, "Simulated");
            } else if (reply.type === "buttons") {
              appendWaMessage(reply.text, false, "Simulated");
              appendWaActionButtons(reply.buttons, (chosen) => {
                appendWaMessage(chosen.title, true);
                dispatchWaMessage({ buttonId: chosen.id, text: chosen.title });
              });
            }
          });

          // Quick symptom shortcuts
          const promptsDiv = document.createElement("div");
          promptsDiv.className = "wa-prompts";
          promptsDiv.style.marginTop = "0.75rem";
          promptsDiv.innerHTML = `
            <span style="font-size: 0.78rem; color: #667781; font-weight: 700;">1-Tap Quick Triage Samples:</span>
            <button type="button" class="wa-prompt-btn" data-wa-prompt="Chest pain with breathlessness">
              🚨 "Chest pain + breathlessness" (Emergency Red-Flag RF-01)
            </button>
            <button type="button" class="wa-prompt-btn" data-wa-prompt="Bachhe ko kal se tez bukhaar 103 degree hai">
              👶 "Bachhe ko tez bukhaar 103°F" (Paediatrics OPD)
            </button>
            <button type="button" class="wa-prompt-btn" data-wa-prompt="Pair mein sujan aur ghutne mein dard hai 3 hafte se">
              🦵 "Ghutne mein dard aur sujan" (Orthopaedics OPD)
            </button>
          `;
          promptsDiv.querySelectorAll(".wa-prompt-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              const prompt = btn.dataset.waPrompt;
              appendWaMessage(prompt, true);
              dispatchWaMessage({ text: prompt });
            });
          });
          chatBody.appendChild(promptsDiv);
        }

        fab.addEventListener("click", () => {
          modal.hidden = false;
          if (!hasInitialized) {
            initConversation();
          }
          chatInput?.focus();
        });

        closeBtn?.addEventListener("click", () => {
          modal.hidden = true;
        });

        modal.addEventListener("click", (e) => {
          if (e.target === modal) modal.hidden = true;
        });

        function formatWaText(txt) {
          if (!txt) return "";
          return txt
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\*([^*]+)\*/g, "<strong>$1</strong>")
            .replace(/_([^_]+)_/g, "<em>$1</em>")
            .replace(/`([^`]+)`/g, "<code>$1</code>")
            .replace(/\n/g, "<br>");
        }

        function appendWaMessage(content, isUser = false, tag = "Simulated", extraClass = "") {
          const bubble = document.createElement("div");
          bubble.className = `wa-bubble ${isUser ? "user" : "bot"} ${extraClass}`;
          const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          
          if (isUser) {
            playWaSendSound();
          } else {
            playWaReceiveSound();
          }

          let html = "";
          if (!isUser) {
            html += `<span class="tag">${tag}</span>`;
          }
          if (typeof content === "string") {
            html += `<div style="margin:0 0 0.25rem;">${formatWaText(content)}</div>`;
          } else if (content instanceof HTMLElement) {
            bubble.appendChild(content);
          }
          html += `<div class="wa-bubble-time">${time} ${isUser ? '<span class="wa-double-tick">✓✓</span>' : ''}</div>`;
          
          if (typeof content === "string") {
            bubble.innerHTML = html;
          } else {
            const timeEl = document.createElement("div");
            timeEl.className = "wa-bubble-time";
            timeEl.innerHTML = `${time} ${isUser ? '<span class="wa-double-tick">✓✓</span>' : ''}`;
            bubble.appendChild(timeEl);
          }

          chatBody.appendChild(bubble);
          chatBody.scrollTop = chatBody.scrollHeight;
          return bubble;
        }

        function appendWaActionButtons(buttons, onSelect) {
          const container = document.createElement("div");
          container.className = "wa-action-btns";

          buttons.forEach((b) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "wa-action-btn";
            btn.innerHTML = `<span>${formatWaText(b.title)}</span> <svg class="icon-inline" style="width:14px;height:14px;fill:currentColor;"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`;
            btn.addEventListener("click", () => {
              container.querySelectorAll("button").forEach(el => el.disabled = true);
              onSelect(b);
            });
            container.appendChild(btn);
          });

          chatBody.appendChild(container);
          chatBody.scrollTop = chatBody.scrollHeight;
        }

        function appendPassCard(sessionData) {
          const hosp = sessionData.selectedHospital || { name: "AIIMS New Delhi" };
          const dept = sessionData.routeResult?.department || "General Medicine";
          const token = sessionData.token || "#OPD-2026-4802";

          const card = document.createElement("div");
          card.className = "wa-pass-card";
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed #25d366; padding-bottom:0.4rem; margin-bottom:0.5rem;">
              <span style="font-size:0.75rem; font-weight:800; color:#059669; text-transform:uppercase;">Verified Public OPD Pass</span>
              <span class="tag">Simulated</span>
            </div>
            <div style="font-size:1.15rem; font-weight:850; color:var(--ink); margin-bottom:0.25rem;">${hosp.name}</div>
            <div style="font-size:0.88rem; color:#059669; font-weight:700;">🩺 ${dept} OPD · Counter 4</div>
            <div style="font-size:0.85rem; color:var(--muted); margin-top:0.2rem;">Token: <strong>${token}</strong> · Slot: 09:30 AM</div>

            <div class="wa-pass-qr-mock" title="Specimen Barcode">
              <div class="wa-qr-box"></div><div class="wa-qr-box white"></div><div class="wa-qr-box"></div><div class="wa-qr-box"></div><div class="wa-qr-box white"></div><div class="wa-qr-box"></div><div class="wa-qr-box"></div>
              <div class="wa-qr-box white"></div><div class="wa-qr-box"></div><div class="wa-qr-box white"></div><div class="wa-qr-box"></div><div class="wa-qr-box white"></div><div class="wa-qr-box"></div><div class="wa-qr-box white"></div>
              <div class="wa-qr-box"></div><div class="wa-qr-box"></div><div class="wa-qr-box white"></div><div class="wa-qr-box"></div><div class="wa-qr-box"></div><div class="wa-qr-box white"></div><div class="wa-qr-box"></div>
              <div class="wa-qr-box white"></div><div class="wa-qr-box"></div><div class="wa-qr-box white"></div><div class="wa-qr-box"></div><div class="wa-qr-box white"></div><div class="wa-qr-box"></div><div class="wa-qr-box white"></div>
              <div class="wa-qr-box"></div><div class="wa-qr-box white"></div><div class="wa-qr-box"></div><div class="wa-qr-box"></div><div class="wa-qr-box white"></div><div class="wa-qr-box"></div><div class="wa-qr-box"></div>
              <div class="wa-qr-box white"></div><div class="wa-qr-box"></div><div class="wa-qr-box white"></div><div class="wa-qr-box"></div><div class="wa-qr-box white"></div><div class="wa-qr-box"></div><div class="wa-qr-box white"></div>
              <div class="wa-qr-box"></div><div class="wa-qr-box"></div><div class="wa-qr-box"></div><div class="wa-qr-box white"></div><div class="wa-qr-box"></div><div class="wa-qr-box white"></div><div class="wa-qr-box"></div>
            </div>

            <div style="margin-top:0.5rem; text-align:center;">
              <button type="button" class="large-button primary" id="wa-view-full-slip-btn" style="width:100%; min-height:2.4rem; padding:0.4rem; font-size:0.85rem;">
                📄 Open Full Specimen Slip in Raahat
              </button>
            </div>
          `;

          chatBody.appendChild(card);
          chatBody.scrollTop = chatBody.scrollHeight;

          const viewBtn = card.querySelector("#wa-view-full-slip-btn");
          viewBtn?.addEventListener("click", () => {
            modal.hidden = true;
            if (typeof navigateToSpecimenSlip === "function") {
              navigateToSpecimenSlip(hosp.name, dept, token);
            } else {
              const navSlip = document.querySelector("#nav-slip") || document.querySelector("a[href=\"#screen-slip\"]");
              navSlip?.click();
            }
          });
        }

        function dispatchWaMessage(incoming) {
          const lower = (incoming.text || "").toLowerCase().trim();
          if (lower === "restart" || lower === "reset" || incoming.buttonId === "cmd_restart") {
            initConversation();
            return;
          }
          const { replies } = handleWhatsAppMessage(session, incoming);

          setTimeout(() => {
            replies.forEach((reply) => {
              if (reply.type === "text") {
                const isEmergency = session.stage === "EMERGENCY_RED_FLAG";
                appendWaMessage(reply.text, false, isEmergency ? "Rule" : "Simulated");
              } else if (reply.type === "buttons") {
                appendWaMessage(reply.text, false, "Simulated");
                appendWaActionButtons(reply.buttons, (chosen) => {
                  appendWaMessage(chosen.title, true);
                  dispatchWaMessage({ buttonId: chosen.id, text: chosen.title });
                });
              }
            });

            if (session.stage === "PASS") {
              appendPassCard(session);

              // 4-Second Simulated Live Queue Push Update
              setTimeout(() => {
                const hospName = session.selectedHospital?.name || "AIIMS New Delhi";
                const notifyText = `🔔 *WhatsApp Push Notification · ${hospName}*\n\nOPD Room 104 is moving smoothly. Current token being consulted: #OPD-2026-4798.\n\n📍 *Status Update:* 2 patients ahead of you (Your token: ${session.token}). Estimated entry in ~12 mins. Please be near the Counter 4 waiting bay.`;
                appendWaMessage(notifyText, false, "Simulated", "wa-notify-bubble");
              }, 4000);
            }
          }, 350);
        }

        // Voice Note Audio Recording Push-to-Talk
        if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
          const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
          speechRecognition = new SpeechRec();
          speechRecognition.continuous = false;
          speechRecognition.interimResults = false;
          speechRecognition.onresult = (evt) => {
            speechTranscript = evt.results[0][0].transcript;
          };
        }

        async function startVoiceRecording() {
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunks = [];
            speechTranscript = "";
            mediaRecorder = new MediaRecorder(mediaStream);

            mediaRecorder.ondataavailable = (e) => {
              if (e.data.size > 0) audioChunks.push(e.data);
            };

            mediaRecorder.onstop = async () => {
              const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
              const audioUrl = URL.createObjectURL(audioBlob);
              const whisperText = await transcribeBrowserAudio(audioBlob, session.language);
              const spokenText = whisperText || speechTranscript || (session.language === "en" ? "Chest discomfort since morning" : "सीने में दर्द और भारीपन है");
              mediaStream?.getTracks().forEach((track) => track.stop());
              mediaStream = null;

              // Append user voice bubble
              const voiceContainer = document.createElement("div");
              voiceContainer.innerHTML = `
                <div class="wa-voice-bubble">
                  <button type="button" class="wa-voice-play">▶</button>
                  <div class="wa-voice-waveform">
                    <span class="wa-wave-line" style="height:8px;"></span>
                    <span class="wa-wave-line" style="height:14px;"></span>
                    <span class="wa-wave-line" style="height:18px;"></span>
                    <span class="wa-wave-line" style="height:10px;"></span>
                    <span class="wa-wave-line" style="height:16px;"></span>
                    <span class="wa-wave-line" style="height:20px;"></span>
                    <span class="wa-wave-line" style="height:12px;"></span>
                    <span class="wa-wave-line" style="height:6px;"></span>
                  </div>
                  <span style="font-size:0.75rem; color:#54656f; font-weight:700;">0:03</span>
                  <audio src="${audioUrl}" class="wa-audio-elem"></audio>
                </div>
                <div style="font-size:0.82rem; margin-top:0.35rem; color:var(--ink);">🎤 <em>"${spokenText}"</em></div>
              `;

              const playBtn = voiceContainer.querySelector(".wa-voice-play");
              const audioEl = voiceContainer.querySelector(".wa-audio-elem");
              playBtn?.addEventListener("click", () => {
                if (audioEl.paused) {
                  audioEl.play();
                  playBtn.textContent = "⏸";
                } else {
                  audioEl.pause();
                  playBtn.textContent = "▶";
                }
              });
              audioEl?.addEventListener("ended", () => {
                playBtn.textContent = "▶";
              });

              appendWaMessage(voiceContainer, true);
              dispatchWaMessage({ text: spokenText, transcription: spokenText, sourceTag: whisperText ? "Generated" : "Observed" });
            };

            mediaRecorder.start();
            if (speechRecognition) {
              speechRecognition.lang = session.language === "hi" ? "hi-IN" : "en-IN";
              try { speechRecognition.start(); } catch (e) {}
            }

            isRecording = true;
            micBtn.classList.add("recording");
            chatInput.placeholder = "Recording... tap mic to send voice note";
          } catch (err) {
            console.warn("Microphone access denied or unavailable", err);
            // Simulated voice note fallback
            const sampleText = session.language === "en" ? "Chest pain and breathlessness since morning" : "सीने में दर्द और सांस लेने में दिक्कत है";
            appendWaMessage(`🎤 <em>[Voice Note · 0:04]</em>\n"${sampleText}"`, true);
            dispatchWaMessage({ text: sampleText, transcription: sampleText });
          }
        }

        function stopVoiceRecording() {
          if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
          }
          if (speechRecognition) {
            try { speechRecognition.stop(); } catch (e) {}
          }
          isRecording = false;
          micBtn.classList.remove("recording");
          chatInput.placeholder = "Type symptom / \x27STATUS\x27 / \x27HELP\x27...";
        }

        micBtn?.addEventListener("click", () => {
          if (!isRecording) {
            startVoiceRecording();
          } else {
            stopVoiceRecording();
          }
        });

        // Location sharing button
        locBtn?.addEventListener("click", () => {
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                appendWaMessage("📍 <strong>Current Location Shared</strong><br><small>Lat: " + pos.coords.latitude.toFixed(3) + ", Lng: " + pos.coords.longitude.toFixed(3) + "</small>", true);
                dispatchWaMessage({ location: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } });
              },
              () => {
                appendWaMessage("📍 <strong>Location Pin Shared</strong> (Central Delhi)", true);
                dispatchWaMessage({ buttonId: "loc_delhi", text: "Central Delhi" });
              }
            );
          } else {
            appendWaMessage("📍 <strong>Location Pin Shared</strong> (Central Delhi)", true);
            dispatchWaMessage({ buttonId: "loc_delhi", text: "Central Delhi" });
          }
        });

        // Quick prompts
        quickPrompts.forEach((btn) => {
          btn.addEventListener("click", () => {
            const prompt = btn.dataset.waPrompt;
            appendWaMessage(prompt, true);
            dispatchWaMessage({ text: prompt });
          });
        });

        // Form submit
        chatForm?.addEventListener("submit", (e) => {
          e.preventDefault();
          const val = chatInput.value.trim();
          if (!val) return;
          chatInput.value = "";
          appendWaMessage(val, true);
          dispatchWaMessage({ text: val });
        });
      }

      // --- Strictly Female Indian Voice Selector & Audio Pre-loader ---
      function selectBestIndianVoice(voices, langCode = "hi-IN") {
        if (!voices || !voices.length) return null;
        const target = (langCode || "hi-IN").toLowerCase().replace("_", "-");
        const prefix = target.split("-")[0];

        // Explicit ban on all male voices across macOS, Windows, Android, iOS, Linux
        const MALE_VOICE_EXCLUSIONS = [
          "rishi", "ravi", "hemant", "david", "mark", "george", "pradeep",
          "ajay", "male", "guy", "karthik", "mohan", "anil", "amit",
          "suresh", "ramesh", "raj", "vikram", "microsoft ravi", "microsoft hemant",
          "daniel", "oliver", "alex", "fred", "thomas"
        ];

        // Preferred authentic Indian female voice names
        const PREFERRED_FEMALE_INDIAN_VOICES = [
          "lekha", "veena", "neerja", "kajal", "heera", "kalpana", "swara",
          "aditi", "anjali", "priya", "shruti", "geeta", "pooja", "female",
          "google हिन्दी", "google english (india)", "google বাংলা", "google தமிழ்",
          "google తెలుగు", "google मराठी", "microsoft heera", "microsoft kalpana",
          "zira", "samantha", "karen", "victoria", "fiona"
        ];

        // Strictly filter out all male voices
        const femaleOrNeutralVoices = voices.filter(v => {
          const vName = (v.name || "").toLowerCase();
          return !MALE_VOICE_EXCLUSIONS.some(m => vName.includes(m));
        });

        const pool = femaleOrNeutralVoices.length > 0 ? femaleOrNeutralVoices : voices;

        // 1. Preferred Female Indian Voice Name match for this language
        let match = pool.find(v => {
          const vName = (v.name || "").toLowerCase();
          const vLang = (v.lang || "").toLowerCase().replace("_", "-");
          const isPreferred = PREFERRED_FEMALE_INDIAN_VOICES.some(pn => vName.includes(pn));
          return isPreferred && (vLang === target || vLang.startsWith(prefix) || (prefix === "hi" && (vLang.includes("hi") || vName.includes("hindi"))) || (prefix === "en" && (vLang.includes("en-in") || vName.includes("india"))));
        });
        if (match) return match;

        // 2. Any preferred female Indian voice even if lang differs slightly
        match = pool.find(v => {
          const vName = (v.name || "").toLowerCase();
          return PREFERRED_FEMALE_INDIAN_VOICES.some(pn => vName.includes(pn));
        });
        if (match) return match;

        // 3. Exact BCP-47 match with India locale in female pool
        match = pool.find(v => (v.lang || "").toLowerCase().replace("_", "-") === target);
        if (match) return match;

        // 4. Language prefix match with India locale in female pool
        match = pool.find(v => {
          const l = (v.lang || "").toLowerCase().replace("_", "-");
          return l.startsWith(prefix) && l.includes("-in");
        });
        if (match) return match;

        // 5. Any voice starting with language prefix in female pool
        match = pool.find(v => (v.lang || "").toLowerCase().startsWith(prefix));
        if (match) return match;

        // 6. Indian English or India-locale voice in female pool
        match = pool.find(v => {
          const l = (v.lang || "").toLowerCase();
          const n = (v.name || "").toLowerCase();
          return l.includes("-in") || n.includes("india") || n.includes("hindi");
        });
        if (match) return match;

        // 7. First available in female pool
        return pool.find(v => v.default) || pool[0] || voices[0] || null;
      }

      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.onvoiceschanged = () => {
            try { window.speechSynthesis.getVoices(); } catch (e) {}
          };
          window.speechSynthesis.getVoices();
        } catch (e) {}
      }

      // --- 22 Scheduled Indian Languages Registry & Audio Readback ---
      const SCHEDULED_LANGUAGES_22 = [
        { code: "en", bcp47: "en-IN", name: "English", nativeName: "English" },
        { code: "hi", bcp47: "hi-IN", name: "Hindi", nativeName: "हिन्दी" },
        { code: "bn", bcp47: "bn-IN", name: "Bengali", nativeName: "বাংলা" },
        { code: "te", bcp47: "te-IN", name: "Telugu", nativeName: "తెలుగు" },
        { code: "mr", bcp47: "mr-IN", name: "Marathi", nativeName: "मराठी" },
        { code: "ta", bcp47: "ta-IN", name: "Tamil", nativeName: "தமிழ்" },
        { code: "ur", bcp47: "ur-IN", name: "Urdu", nativeName: "اُردُو" },
        { code: "gu", bcp47: "gu-IN", name: "Gujarati", nativeName: "ગુજરાતી" },
        { code: "kn", bcp47: "kn-IN", name: "Kannada", nativeName: "ಕನ್ನಡ" },
        { code: "ml", bcp47: "ml-IN", name: "Malayalam", nativeName: "മലയാളം" },
        { code: "pa", bcp47: "pa-IN", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
        { code: "or", bcp47: "or-IN", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
        { code: "as", bcp47: "as-IN", name: "Assamese", nativeName: "অসমীয়া" },
        { code: "mai", bcp47: "mai-IN", name: "Maithili", nativeName: "मैथिली" },
        { code: "sa", bcp47: "sa-IN", name: "Sanskrit", nativeName: "संस्कृतम्" },
        { code: "ks", bcp47: "ks-IN", name: "Kashmiri", nativeName: "كٲشُر / कॉशुर" },
        { code: "ne", bcp47: "ne-IN", name: "Nepali", nativeName: "नेपाली" },
        { code: "sd", bcp47: "sd-IN", name: "Sindhi", nativeName: "سنڌي / सिंधी" },
        { code: "kok", bcp47: "kok-IN", name: "Konkani", nativeName: "कोंकणी" },
        { code: "doi", bcp47: "doi-IN", name: "Dogri", nativeName: "डोगरी" },
        { code: "mni", bcp47: "mni-IN", name: "Manipuri", nativeName: "ꯃৈতৈলোନ୍" },
        { code: "brx", bcp47: "brx-IN", name: "Bodo", nativeName: "बड़ो" },
        { code: "sat", bcp47: "sat-IN", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ" },
      ];

      let isSpeakingAloud = false;

      function speakTextAloud(textToSpeak, langCode = "en-IN") {
        if (!("speechSynthesis" in window)) {
          showStatus("Audio readback is not supported in this browser.", true);
          return;
        }
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          if (isSpeakingAloud) {
            isSpeakingAloud = false;
            updateSpeechButtons(false);
            return;
          }
        }
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = langCode;
        utterance.rate = 0.92; // Clear, comfortable tempo for non-literate citizens
        utterance.pitch = 1.08; // Warm, friendly female tone

        const voices = window.speechSynthesis.getVoices() || [];
        const matchingVoice = selectBestIndianVoice(voices, langCode);
        if (matchingVoice) utterance.voice = matchingVoice;

        utterance.onstart = () => {
          isSpeakingAloud = true;
          updateSpeechButtons(true);
        };
        utterance.onend = () => {
          isSpeakingAloud = false;
          updateSpeechButtons(false);
        };
        utterance.onerror = () => {
          isSpeakingAloud = false;
          updateSpeechButtons(false);
        };

        window.speechSynthesis.speak(utterance);
      }

      function updateSpeechButtons(speaking) {
        const readbackBtn = document.querySelector("#btn-audio-readback");
        const readbackText = document.querySelector("#audio-readback-text");
        if (readbackBtn) {
          readbackBtn.classList.toggle("is-speaking", speaking);
          if (readbackText) readbackText.textContent = speaking ? "Stop Audio · बोलना रोकें" : "अपनी भाषा में सुनें · Listen Spoken Aloud";
        }
      }

      function speakCounterReadback() {
        if (!state.routeResult) return;
        const dept = state.routeResult.department;
        const lang = state.selectedDialectData?.bcp47 || (state.language === "hi" ? "hi-IN" : "en-IN");
        const hosp = state.selectedHospital ? state.selectedHospital.name : "AIIMS New Delhi";
        
        let spokenMsg = "";
        if (state.routeResult.urgency === "emergency") {
          if (lang.startsWith("hi")) {
            spokenMsg = "आपातकालीन चेतावनी: कृपया तुरंत 24/7 आपातकालीन विभाग यानी इमरजेंसी जाएं। अपॉइंटमेंट का इंतज़ार न करें।";
          } else if (lang.startsWith("ur")) {
            spokenMsg = "ہنگامی انتباہ: برائے مہربانی فوری طور پر 24/7 ایمرجنسی وارڈ جائیں۔ اپائنٹمنٹ کا انتظار نہ کریں۔";
          } else if (lang.startsWith("ta")) {
            spokenMsg = "அவசர எச்சரிக்கை: தயவுசெய்து உடனடியாக அவசர சிகிச்சைப் பிரிவுக்கு செல்லவும். அப்பாயிண்ட்மெண்ட்டிற்கு காத்திருக்க வேண்டாம்.";
          } else if (lang.startsWith("bn")) {
            spokenMsg = "জরুরি সতর্কতা: অনুগ্রহ করে অবিলম্বে জরুরি বিভাগে যান। কোনো অ্যাপয়েন্টমেন্টের অপেক্ষা করবেন না।";
          } else if (lang.startsWith("te")) {
            spokenMsg = "అత్యవసర హెచ్చరిక: దయచేసి వెంటనే అత్యవసర విభాగానికి వెళ్ళండి. అపాయింట్‌మెంట్ కోసం వేచి ఉండకండి.";
          } else if (lang.startsWith("mr")) {
            spokenMsg = "तातडीची चेतावणी: कृपया त्वरित अपघात आणि आणीबाणी विभागात जा. अपॉइंटमेंटची वाट पाहू नका.";
          } else if (lang.startsWith("gu")) {
            spokenMsg = "કટોકટી ચેતવણી: કૃપા કરીને તાત્કાલિક ઇમરજન્સી વિભાગમાં જાઓ. એપોઇન્ટમેન્ટની રાહ ન જુઓ.";
          } else if (lang.startsWith("pa")) {
            spokenMsg = "ਐਮਰਜੈਂਸੀ ਚੇਤਾਵਨੀ: ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ ਹਸਪਤਾਲ ਦੇ ਐਮਰਜੈਂਸੀ ਵਿਭਾਗ ਜਾਓ। ਅਪੌਇੰਟਮੈਂਟ ਦੀ ਉਡੀਕ ਨਾ ਕਰੋ।";
          } else if (lang.startsWith("kn")) {
            spokenMsg = "ತುರ್ತು ಎಚ್ಚರಿಕೆ: ದಯವಿಟ್ಟು ತಕ್ಷಣವೇ ತುರ್ತು ಚಿಕಿತ್ಸಾ ವಿಭಾಗಕ್ಕೆ ತೆರಳಿ. ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಾಗಿ ಕಾಯಬೇಡಿ.";
          } else if (lang.startsWith("ml")) {
            spokenMsg = "അടിയന്തിര മുന്നറിയിപ്പ്: ദയവായി ഉടൻ തന്നെ അത്യാഹിത വിഭാഗത്തിലേക്ക് പോകുക. അപ്പോയിന്റ്മെന്റിനായി കാത്തിരിക്കരുത്.";
          } else {
            spokenMsg = "Emergency alert: Please proceed immediately to the hospital Emergency department. Do not wait for an appointment.";
          }
        } else {
          if (lang.startsWith("hi")) {
            spokenMsg = `आपका ओपीडी काउंटर: ${dept} विभाग, अस्पताल: ${hosp}। कृपया पिछला पर्चा और आधार कार्ड साथ रखें।`;
          } else if (lang.startsWith("ur")) {
            spokenMsg = `آپ کا او پی ڈی کاؤنٹر: شعبہ ${dept}، ہسپتال: ${hosp}۔ برائے مہربانی پرانا نسخہ اور شناختی کارڈ ساتھ لائیں۔`;
          } else if (lang.startsWith("ta")) {
            spokenMsg = `உங்கள் ஓபிடி கவுண்டர்: ${dept} பிரிவு, மருத்துவமனை: ${hosp}. பழைய மருத்துவ ஆவணங்களை உடன் கொண்டு வாருங்கள்.`;
          } else if (lang.startsWith("bn")) {
            spokenMsg = `আপনার ওপিডি কাউন্টার: ${dept} বিভাগ, হাসপাতাল: ${hosp}। পুরানো প্রেসক্রিপশন সাথে রাখুন।`;
          } else if (lang.startsWith("te")) {
            spokenMsg = `మీ ఓపీడీ కౌంటర్: ${dept} విభాగం, ఆసుపత్రి: ${hosp}. దయచేసి పాత వైద్య పత్రాలు తీసుకురండి.`;
          } else if (lang.startsWith("mr")) {
            spokenMsg = `तुमचा ओपीडी काउंटर: ${dept} विभाग, रुग्णालय: ${hosp}. कृपया जुनी कागदपत्रे सोबत आणा.`;
          } else if (lang.startsWith("gu")) {
            spokenMsg = `તમારું ઓપીડી કાઉન્ટર: ${dept} વિભાગ, હોસ્પિટલ: ${hosp}. કૃપા કરીને જૂની ફાઇલ સાથે લાવો.`;
          } else if (lang.startsWith("pa")) {
            spokenMsg = `ਤੁਹਾਡਾ ਓਪੀਡੀ ਕਾਊਂਟਰ: ${dept} ਵਿਭਾਗ, ਹਸਪਤਾਲ: ${hosp}। ਕਿਰਪਾ ਕਰਕੇ ਪੁਰਾਣੀ ਪਰਚੀ ਨਾਲ ਲਿਆਓ।`;
          } else if (lang.startsWith("kn")) {
            spokenMsg = `ನಿಮ್ಮ ಒಪಿಡಿ ಕೌಂಟರ್: ${dept} ವಿಭಾಗ, ಆಸ್ಪತ್ರೆ: ${hosp}. ಹಿಂದಿನ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳನ್ನು ತನ್ನಿ.`;
          } else if (lang.startsWith("ml")) {
            spokenMsg = `നിങ്ങളുടെ ಒಪಿഡി ಕೌಂಟర్: ${dept} വിഭാഗം, ആശുപത്രി: ${hosp}. പഴയ കുറിപ്പടികൾ കൊണ്ടുവരിക.`;
          } else {
            spokenMsg = `Your matched counter is ${dept} Department at ${hosp}. Please carry your previous medical prescription and identity card.`;
          }
        }
        speakTextAloud(spokenMsg, lang);
      }

      function wireVernacularExpansion() {
        const modal = document.querySelector("#modal-languages");
        const openBtn = document.querySelector("#btn-open-languages");
        const showcaseBrowseBtn = document.querySelector("#btn-showcase-all-langs");
        const closeBtn = document.querySelector("#btn-close-languages");
        const searchInput = document.querySelector("#lang-search-input");
        const gridContainer = document.querySelector("#lang-grid-container");
        const vernacularChips = document.querySelectorAll(".vernacular-chip");
        const audioReadbackBtn = document.querySelector("#btn-audio-readback");

        let searchQuery = "";

        function openModal() {
          if (!modal) return;
          modal.hidden = false;
          openBtn?.setAttribute("aria-expanded", "true");
          if (searchInput) {
            searchInput.value = "";
            searchQuery = "";
            searchInput.focus();
          }
          renderLanguageGrid();
        }

        function closeModal() {
          if (!modal) return;
          modal.hidden = true;
          openBtn?.setAttribute("aria-expanded", "false");
        }

        openBtn?.addEventListener("click", openModal);
        showcaseBrowseBtn?.addEventListener("click", openModal);
        closeBtn?.addEventListener("click", closeModal);
        modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
        document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal && !modal.hidden) closeModal(); });

        searchInput?.addEventListener("input", (e) => {
          searchQuery = e.target.value.toLowerCase().trim();
          renderLanguageGrid();
        });

        function renderLanguageGrid() {
          if (!gridContainer) return;
          gridContainer.innerHTML = "";

          const filtered = SCHEDULED_LANGUAGES_22.filter((lang) => {
            return !searchQuery ||
              lang.name.toLowerCase().includes(searchQuery) ||
              lang.nativeName.toLowerCase().includes(searchQuery) ||
              lang.code.toLowerCase().includes(searchQuery);
          });

          if (filtered.length === 0) {
            gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color: var(--muted); padding: 2rem;">No matching languages found for "${searchQuery}".</p>`;
            return;
          }

          filtered.forEach((lang) => {
            const card = document.createElement("button");
            card.type = "button";
            const isActive = state.language === lang.code;
            card.className = "lang-card" + (isActive ? " active" : "");
            card.innerHTML = `
              <div class="lang-card-main">
                <span class="lang-card-native">${lang.nativeName}</span>
                <span class="lang-card-name">${lang.name}</span>
              </div>
              <div class="lang-card-aside">
                <span class="lang-card-code">${lang.bcp47}</span>
                ${isActive ? '<span class="lang-check-badge">✓ Active</span>' : ''}
              </div>
            `;

            card.addEventListener("click", () => {
              state.selectedDialect = lang.code;
              state.selectedDialectData = lang;
              state.language = lang.code;
              renderLanguage();
              closeModal();
              showStatus(`Switched interface & voice to ${lang.nativeName} (${lang.name}). Microphone now listens in ${lang.bcp47}.`);
            });

            gridContainer.appendChild(card);
          });
        }

        // Vernacular 1-tap chips in Step 1
        vernacularChips.forEach((chip) => {
          chip.addEventListener("click", () => {
            const textToFill = chip.dataset.vernacularText;
            const langCode = chip.dataset.lang;
            const langName = chip.dataset.langName;
            if (complaint) {
              complaint.value = textToFill;
              complaint.focus();
            }
            const foundLang = SCHEDULED_LANGUAGES_22.find((l) => l.code === langCode);
            if (foundLang) {
              state.selectedDialect = foundLang.code;
              state.selectedDialectData = foundLang;
              state.language = foundLang.code;
              renderLanguage();
            }
            showStatus(`Loaded ${langName}: "${textToFill}". Interface updated.`);
            handleComplaintInput(complaint.value);
          });
        });

        // Audio readback button
        audioReadbackBtn?.addEventListener("click", () => {
          speakCounterReadback();
        });
      }


      function wireAccessibilitySuite() {
        const panel = document.querySelector("#a11y-panel");
        const backdrop = document.querySelector("#a11y-backdrop");
        const openBtn = document.querySelector("#btn-open-a11y");
        const sidebarOpenBtn = document.querySelector("#sidebar-btn-a11y");
        const closeBtn = document.querySelector("#a11y-close-btn");
        const contrastBtn = document.querySelector("#a11y-btn-contrast");
        const invertBtn = document.querySelector("#a11y-btn-invert");
        const satSlider = document.querySelector("#a11y-range-sat");
        const satReadout = document.querySelector("#a11y-sat-readout");
        const sizeReadout = document.querySelector("#a11y-size-readout");
        const fontDecBtn = document.querySelector("#a11y-font-dec");
        const fontResetBtn = document.querySelector("#a11y-font-reset");
        const fontIncBtn = document.querySelector("#a11y-font-inc");
        const resetAllBtn = document.querySelector("#a11y-btn-reset-all");

        const DEFAULT_A11Y = {
          contrast: false,
          invert: false,
          saturation: 100,
          fontScale: 100
        };

        let a11yState = { ...DEFAULT_A11Y };

        try {
          const saved = localStorage.getItem("raahat_a11y_prefs");
          if (saved) {
            a11yState = { ...DEFAULT_A11Y, ...JSON.parse(saved) };
          }
        } catch (e) {
          console.warn("Could not read a11y prefs", e);
        }

        function savePrefs() {
          try {
            localStorage.setItem("raahat_a11y_prefs", JSON.stringify(a11yState));
          } catch (e) {
            console.warn("Could not save a11y prefs", e);
          }
        }

        function applyA11y() {
          // Contrast
          if (a11yState.contrast) {
            document.documentElement.setAttribute("data-a11y-contrast", "high");
            if (contrastBtn) {
              contrastBtn.setAttribute("aria-pressed", "true");
              const textSpan = contrastBtn.querySelector(".a11y-btn-text");
              if (textSpan) textSpan.textContent = "Disable High Contrast";
            }
          } else {
            document.documentElement.removeAttribute("data-a11y-contrast");
            if (contrastBtn) {
              contrastBtn.setAttribute("aria-pressed", "false");
              const textSpan = contrastBtn.querySelector(".a11y-btn-text");
              if (textSpan) textSpan.textContent = "Enable High Contrast";
            }
          }

          // Invert
          if (a11yState.invert) {
            document.documentElement.setAttribute("data-a11y-invert", "true");
            if (invertBtn) {
              invertBtn.setAttribute("aria-pressed", "true");
              const textSpan = invertBtn.querySelector(".a11y-btn-text");
              if (textSpan) textSpan.textContent = "Disable Invert Colors";
            }
          } else {
            document.documentElement.removeAttribute("data-a11y-invert");
            if (invertBtn) {
              invertBtn.setAttribute("aria-pressed", "false");
              const textSpan = invertBtn.querySelector(".a11y-btn-text");
              if (textSpan) textSpan.textContent = "Enable Invert Colors";
            }
          }

          // Saturation
          document.documentElement.style.setProperty("--a11y-saturation", a11yState.saturation + "%");
          if (satSlider) satSlider.value = a11yState.saturation;
          if (satReadout) satReadout.textContent = "Saturation: " + a11yState.saturation + "%";

          // Font Scale
          document.documentElement.style.fontSize = a11yState.fontScale + "%";
          if (sizeReadout) sizeReadout.textContent = a11yState.fontScale + "%";

          savePrefs();
        }

        function openPanel() {
          if (!panel) return;
          panel.hidden = false;
          if (backdrop) backdrop.hidden = false;
          openBtn?.setAttribute("aria-expanded", "true");
        }

        function closePanel() {
          if (!panel) return;
          panel.hidden = true;
          if (backdrop) backdrop.hidden = true;
          openBtn?.setAttribute("aria-expanded", "false");
        }

        openBtn?.addEventListener("click", () => {
          if (panel.hidden) openPanel();
          else closePanel();
        });
        sidebarOpenBtn?.addEventListener("click", () => {
          if (typeof closeSidebar === "function") closeSidebar();
          openPanel();
        });
        closeBtn?.addEventListener("click", closePanel);
        backdrop?.addEventListener("click", closePanel);

        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && panel && !panel.hidden) {
            closePanel();
          }
        });

        contrastBtn?.addEventListener("click", () => {
          a11yState.contrast = !a11yState.contrast;
          applyA11y();
        });

        invertBtn?.addEventListener("click", () => {
          a11yState.invert = !a11yState.invert;
          applyA11y();
        });

        satSlider?.addEventListener("input", (e) => {
          a11yState.saturation = parseInt(e.target.value, 10);
          applyA11y();
        });

        fontDecBtn?.addEventListener("click", () => {
          if (a11yState.fontScale > 85) {
            a11yState.fontScale -= 15;
            applyA11y();
          }
        });

        fontResetBtn?.addEventListener("click", () => {
          a11yState.fontScale = 100;
          applyA11y();
        });

        fontIncBtn?.addEventListener("click", () => {
          if (a11yState.fontScale < 145) {
            a11yState.fontScale += 15;
            applyA11y();
          }
        });

        resetAllBtn?.addEventListener("click", () => {
          a11yState = { ...DEFAULT_A11Y };
          applyA11y();
        });

        applyA11y();
      }

      function wireSidebarDrawer() {
        const sidebar = document.querySelector("#site-sidebar");
        const backdrop = document.querySelector("#sidebar-backdrop");
        const openBtn = document.querySelector("#btn-open-sidebar");
        const closeBtn = document.querySelector("#sidebar-close-btn");
        const sidebarLangBtn = document.querySelector("#sidebar-btn-lang");
        const sidebarThemeBtn = document.querySelector("#sidebar-btn-theme");

        function openSidebar() {
          if (!sidebar) return;
          sidebar.hidden = false;
          requestAnimationFrame(() => {
            sidebar.classList.add("is-open");
          });
          if (backdrop) backdrop.hidden = false;
          openBtn?.setAttribute("aria-expanded", "true");
          document.body.style.overflow = "hidden";
        }

        function closeSidebar() {
          if (!sidebar) return;
          sidebar.classList.remove("is-open");
          setTimeout(() => {
            sidebar.hidden = true;
            if (backdrop) backdrop.hidden = true;
          }, 240);
          openBtn?.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        }

        window.closeSidebar = closeSidebar;
        window.openSidebar = openSidebar;

        openBtn?.addEventListener("click", openSidebar);
        closeBtn?.addEventListener("click", closeSidebar);
        backdrop?.addEventListener("click", closeSidebar);

        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && sidebar && !sidebar.hidden) {
            closeSidebar();
          }
        });

        // Sidebar internal nav cards
        document.querySelectorAll("[data-sidebar-link]").forEach((link) => {
          link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetView = link.dataset.sidebarLink;
            const roleTab = link.dataset.roleTab;
            closeSidebar();
            switchView(targetView);
            if (roleTab && typeof switchDoctorRole === "function") {
              setTimeout(() => switchDoctorRole(roleTab), 50);
            }
          });
        });

        sidebarLangBtn?.addEventListener("click", () => {
          closeSidebar();
          const openLangBtn = document.querySelector("#btn-open-languages");
          openLangBtn?.click();
        });

        sidebarThemeBtn?.addEventListener("click", () => {
          const themeBtn = document.querySelector("#theme-toggle");
          themeBtn?.click();
        });
      }

      wireVernacularExpansion();
      wireDoctorPortal();
      wirePrescriptionOCR();
      wireProfileScreen();
      wireHospitalRoleSuite();
      wireWhatsAppSimulator();
      wireAccessibilitySuite();
      wireSidebarDrawer();
      wireIvrSimulator();

        // Wire Hero Omnichannel Access Chips
        const heroWaTrigger = document.querySelector("#hero-wa-trigger");
        const heroIvrTrigger = document.querySelector("#hero-ivr-trigger");
        const waModal = document.querySelector("#whatsapp-modal");
        const ivrModal = document.querySelector("#ivr-modal");
        if (heroWaTrigger && waModal) {
          heroWaTrigger.addEventListener("click", () => {
            const waFab = document.querySelector("#whatsapp-fab");
            if (waFab) waFab.click();
            else waModal.hidden = false;
          });
        }
        if (heroIvrTrigger && ivrModal) {
          heroIvrTrigger.addEventListener("click", () => {
            ivrModal.hidden = false;
            const callBtn = document.querySelector("#ivr-call-btn");
            if (callBtn) callBtn.click();
          });
        }

        // --- Hackathon Judge Fast-Track Actions ---
        const navJudge = document.querySelector("#nav-judge-fasttrack");
        if (navJudge) {
          navJudge.addEventListener("click", (e) => {
            e.preventDefault();
            switchView("home");
            const target = document.querySelector("#judge-fasttrack");
            if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
          });
        }

        const resultBackHome = document.querySelector("#result-back-home");
        if (resultBackHome) {
          resultBackHome.addEventListener("click", () => {
            switchView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          });
        }

        const bookingHome = document.querySelector("#booking-home");
        if (bookingHome) {
          bookingHome.addEventListener("click", () => {
            switchView("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          });
        }

        const judgeRf01 = document.querySelector("#judge-btn-rf01");
        if (judgeRf01) {
          judgeRf01.addEventListener("click", () => {
            state.screen = "triage";
            const complaintInput = document.querySelector("#complaint");
            if (complaintInput) {
              complaintInput.value = "सीने में बहुत तेज़ दर्द है और ठंडा पसीना आ रहा है (Severe crushing chest pain & cold sweating)";
            }
            state.complaint = {
              region: "chest",
              side: "both",
              kind: "pain",
              duration: "1 hour",
              severity: "severe",
              age_band: "adult",
              who_for: "self",
              patient_name: "Ram Prasad",
              phone: "",
              exact_age: 52,
              gender: "male",
              conditions: ["hypertension"],
              severity_markers: ["sweating"],
              parsed: true,
              unclear: [],
              language: state.language || "hi",
              value_tags: { region: "Simulated", kind: "Simulated", duration: "Simulated", severity: "Simulated", age_band: "Simulated" }
            };
            history.replaceState(null, "", "#screen-triage");
            showReadback(state.complaint);
            window.scrollTo({ top: 0, behavior: "smooth" });
          });
        }

        const judgeWa = document.querySelector("#judge-btn-wa");
        if (judgeWa) {
          judgeWa.addEventListener("click", () => {
            const trigger = document.querySelector("#hero-wa-trigger");
            if (trigger) trigger.click();
          });
        }

        const judgeIvr = document.querySelector("#judge-btn-ivr");
        if (judgeIvr) {
          judgeIvr.addEventListener("click", () => {
            const trigger = document.querySelector("#hero-ivr-trigger");
            if (trigger) trigger.click();
          });
        }

        const judgeDoctor = document.querySelector("#judge-btn-doctor");
        if (judgeDoctor) {
          judgeDoctor.addEventListener("click", () => {
            switchView("doctor");
            window.scrollTo({ top: 0, behavior: "smooth" });
          });
        }

        const judgeRoutine = document.querySelector("#judge-btn-routine");
        if (judgeRoutine) {
          judgeRoutine.addEventListener("click", () => {
            state.screen = "triage";
            const complaintInput = document.querySelector("#complaint");
            if (complaintInput) {
              complaintInput.value = "3 साल के बच्चे को 2 दिन से 102°F बुखार और खाँसी है (3yo child with 2-day fever & cough)";
            }
            state.complaint = {
              region: "chest",
              side: "both",
              kind: "fever",
              duration: "2 days",
              severity: "moderate",
              age_band: "child",
              who_for: "child",
              patient_name: "Aarav Kumar",
              phone: "",
              exact_age: 3,
              gender: "male",
              conditions: [],
              severity_markers: [],
              parsed: true,
              unclear: [],
              language: state.language || "hi",
              value_tags: { region: "Simulated", kind: "Simulated", duration: "Simulated", severity: "Simulated", age_band: "Simulated" }
            };
            history.replaceState(null, "", "#screen-triage");
            showReadback(state.complaint);
            window.scrollTo({ top: 0, behavior: "smooth" });
          });
        }


      // --- Feature Phone 104 AI Voice IVR Simulator Logic ---
      function wireIvrSimulator() {
        const fab = document.querySelector("#ivr-fab");
        const modal = document.querySelector("#ivr-modal");
        const closeBtn = document.querySelector("#ivr-close-btn");
        const screen = document.querySelector("#ivr-screen");
        const screenBody = document.querySelector("#ivr-screen-body");
        const callStatus = document.querySelector("#ivr-call-status");
        const timerEl = document.querySelector("#ivr-timer");
        const audioInd = document.querySelector("#ivr-audio-indicator");
        const smsToast = document.querySelector("#ivr-sms-toast");
        const smsText = document.querySelector("#ivr-sms-text");
        const smsTime = document.querySelector("#ivr-sms-time");
        const smsDismiss = document.querySelector("#ivr-sms-dismiss-btn");
        const callBtn = document.querySelector("#ivr-call-btn");
        const endBtn = document.querySelector("#ivr-end-btn");
        const micBtn = document.querySelector("#ivr-mic-btn");
        const digits = document.querySelectorAll(".ivr-digit");
        const dialectButtons = document.querySelectorAll(".ivr-dialect-btn");

        if (!fab || !modal) return;

        let isInCall = false;
        let callTimer = null;
        let callSeconds = 0;
        let session = null;
        let isRecording = false;
        let speechRec = null;
        let ivrMediaRecorder = null;
        let ivrMediaStream = null;
        let ivrAudioChunks = [];

        // ITU-T Standard DTMF Dual-Frequency Pairs
        const dtmfFreqs = {
          "1": [697, 1209], "2": [697, 1336], "3": [697, 1477],
          "4": [770, 1209], "5": [770, 1336], "6": [770, 1477],
          "7": [852, 1209], "8": [852, 1336], "9": [852, 1477],
          "*": [941, 1209], "0": [941, 1336], "#": [941, 1477]
        };

        let sharedIvrAudioCtx = null;
        function getIvrAudioContext() {
          try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return null;
            if (!sharedIvrAudioCtx || sharedIvrAudioCtx.state === "closed") {
              sharedIvrAudioCtx = new AudioCtx();
            }
            if (sharedIvrAudioCtx.state === "suspended") {
              sharedIvrAudioCtx.resume().catch(() => {});
            }
            return sharedIvrAudioCtx;
          } catch (e) {
            return null;
          }
        }

        function playDtmfTone(char) {
          try {
            const ctx = getIvrAudioContext();
            if (!ctx) return;
            const freqs = dtmfFreqs[char] || [440, 480];
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            osc1.frequency.value = freqs[0];
            osc2.frequency.value = freqs[1];
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            osc1.start();
            osc2.start();
            osc1.stop(ctx.currentTime + 0.16);
            osc2.stop(ctx.currentTime + 0.16);
          } catch (e) {
            console.warn("DTMF tone error", e);
          }
        }

        function playEmergencySiren() {
          try {
            const ctx = getIvrAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.3);
            osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.6);
            osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.9);
            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 1.2);
          } catch (e) {
            console.warn("Siren tone error", e);
          }
        }

        function playSmsChime() {
          try {
            const ctx = getIvrAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
          } catch (e) {
            console.warn("SMS chime error", e);
          }
        }

        function playTelecomEarcon() {
          try {
            const ctx = getIvrAudioContext();
            if (!ctx) return;
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();
            osc1.type = "sine";
            osc2.type = "sine";
            osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);
            osc1.start();
            osc2.start();
            osc1.stop(ctx.currentTime + 0.16);
            osc2.stop(ctx.currentTime + 0.16);
          } catch (e) {}
        }

        let lastSpokenIvrText = "";
        let lastSpokenIvrBcp47 = "hi-IN";

        function speakIvrText(text, bcp47 = "hi-IN", onEnd) {
          lastSpokenIvrText = text;
          lastSpokenIvrBcp47 = bcp47;

          playTelecomEarcon();

          if (!("speechSynthesis" in window)) {
            if (audioInd) audioInd.textContent = "🔇 Audio N/A";
            if (onEnd) onEnd();
            return;
          }

          try {
            if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
              window.speechSynthesis.cancel();
            }
          } catch (e) {
            console.warn("speechSynthesis cancel error", e);
          }

          // Delay for Android Chromium to ensure cancel clears previous utterance
          setTimeout(() => {
            try {
              window.speechSynthesis.resume();
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.lang = bcp47;
              utterance.rate = 0.90; // Natural, respectful tempo for telecom IVR
              utterance.pitch = 1.08; // Warm, friendly female Indian operator tone

              const voices = window.speechSynthesis.getVoices() || [];
              const voice = selectBestIndianVoice(voices, bcp47);
              if (voice) utterance.voice = voice;

              // Prevent GC bug in Chrome/Chromium
              window._activeIvrUtterance = utterance;

              utterance.onstart = () => {
                if (audioInd) audioInd.textContent = "🔊 Speaking...";
              };
              utterance.onend = () => {
                window._activeIvrUtterance = null;
                if (audioInd) audioInd.textContent = "👂 Listening...";
                if (onEnd) onEnd();
              };
              utterance.onerror = (err) => {
                console.warn("speechSynthesis error event", err);
                window._activeIvrUtterance = null;
                if (audioInd) audioInd.textContent = "👂 Ready";
                if (onEnd) onEnd();
              };

              window.speechSynthesis.speak(utterance);
            } catch (err) {
              console.warn("speakIvrText exception", err);
              if (audioInd) audioInd.textContent = "👂 Ready";
              if (onEnd) onEnd();
            }
          }, 45);
        }

        async function startIvrMediaCapture() {
          if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return;
          try {
            ivrMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            ivrAudioChunks = [];
            ivrMediaRecorder = new MediaRecorder(ivrMediaStream);
            ivrMediaRecorder.ondataavailable = (event) => { if (event.data.size) ivrAudioChunks.push(event.data); };
            ivrMediaRecorder.start();
          } catch {
            ivrMediaStream?.getTracks().forEach((track) => track.stop());
            ivrMediaStream = null;
            ivrMediaRecorder = null;
          }
        }

        async function stopIvrMediaCapture() {
          const recorder = ivrMediaRecorder;
          ivrMediaRecorder = null;
          ivrMediaStream?.getTracks().forEach((track) => track.stop());
          ivrMediaStream = null;
          if (!recorder || recorder.state === "inactive") return null;
          return new Promise((resolve) => {
            recorder.onstop = () => resolve(new Blob(ivrAudioChunks, { type: recorder.mimeType || "audio/webm" }));
            try { recorder.stop(); } catch { resolve(null); }
          });
        }

        function startCall() {
          if (isInCall) return;
          isInCall = true;
          callSeconds = 0;
          getIvrAudioContext();
          const activeDist = (state.hospitalStateFilter && state.hospitalStateFilter !== "All India")
            ? state.hospitalStateFilter
            : (state.locality && state.locality.includes("delhi") ? "Delhi" : "Delhi");
          session = createInitialIvrSession("DEMO-CALLER", activeDist);
          screen.classList.remove("emergency");
          callStatus.textContent = "CONNECTED";
          callStatus.style.color = "#142814";
          smsToast.hidden = true;

          // Call timer
          clearInterval(callTimer);
          callTimer = setInterval(() => {
            callSeconds++;
            const m = String(Math.floor(callSeconds / 60)).padStart(2, "0");
            const s = String(callSeconds % 60).padStart(2, "0");
            timerEl.textContent = m + ":" + s;
          }, 1000);

          // Initial turn
          const turn = handleIvrTurn(session, {});
          renderIvrTurn(turn);
        }

        function endCall() {
          if (window.speechSynthesis) window.speechSynthesis.cancel();
          clearInterval(callTimer);
          isInCall = false;
          if (isRecording && speechRec) {
            try { speechRec.stop(); } catch(e){}
            isRecording = false;
            micBtn.classList.remove("recording");
          }
          void stopIvrMediaCapture();
          screen.classList.remove("emergency");
          callStatus.textContent = "CALL ENDED";
          timerEl.textContent = "00:00";
          audioInd.textContent = "🔇 Idle";
          screenBody.innerHTML = `
            <div style="text-align: center; margin-top: 0.85rem;">
              <div style="font-size: 1.15rem; font-weight: 900; letter-spacing: 1px;">104 HELPLINE</div>
              <div style="font-size: 0.75rem; margin-top: 0.35rem;">Call Disconnected · कॉल समाप्त</div>
              <div style="font-size: 0.72rem; color: #243824; margin-top: 0.5rem;">Press 📞 Green to Call 104</div>
            </div>
          `;
        }

        function triggerSmsDelivery(smsTextContent) {
          playSmsChime();
          smsText.textContent = smsTextContent;
          smsTime.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          smsToast.hidden = false;
        }

        function renderIvrTurn(turn) {
          screenBody.innerHTML = `
            <div style="margin-bottom: 0.35rem;">
              <span style="font-size: 0.7rem; font-weight: 800; background: rgba(0,0,0,0.12); padding: 1px 4px; border-radius: 3px;">
                ${session.isEmergency ? "🚨 EMERGENCY" : "104 IVR"}
              </span>
            </div>
            <div style="font-size: 0.82rem; line-height: 1.35;">${turn.spokenText}</div>
          `;

          if (turn.audioSiren) {
            screen.classList.add("emergency");
            callStatus.textContent = "🚨 108 EMERGENCY";
            playEmergencySiren();
          }

          speakIvrText(turn.spokenText, turn.bcp47, () => {
            if (turn.sms) {
              triggerSmsDelivery(turn.sms);
            }
          });
        }

        function dispatchIvrInput(inputObj) {
          if (!isInCall) {
            startCall();
            setTimeout(() => {
              const turn = handleIvrTurn(session, inputObj);
              renderIvrTurn(turn);
            }, 300);
            return;
          }
          const turn = handleIvrTurn(session, inputObj);
          renderIvrTurn(turn);
        }

        // Web Speech Recognition for Push-to-Talk Mic
        if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
          const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
          speechRec = new SpeechRec();
          speechRec.continuous = false;
          speechRec.interimResults = false;
          speechRec.onresult = async (e) => {
            const transcript = e.results[0][0].transcript;
            isRecording = false;
            micBtn.classList.remove("recording");
            const bcp47 = (SUPPORTED_DIALECTS[session?.dialectKey] || SUPPORTED_DIALECTS["1"]).bcp47;
            const audioBlob = await stopIvrMediaCapture();
            const whisperText = await transcribeBrowserAudio(audioBlob, bcp47);
            dispatchIvrInput({ speech: whisperText || transcript });
          };
          speechRec.onerror = () => {
            isRecording = false;
            micBtn.classList.remove("recording");
          };
        }

        // Event Listeners
        fab.addEventListener("click", () => {
          modal.hidden = false;
        });

        closeBtn?.addEventListener("click", () => {
          modal.hidden = true;
          endCall();
        });

        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            modal.hidden = true;
            endCall();
          }
        });

        callBtn?.addEventListener("click", () => {
          if (!isInCall) {
            startCall();
          }
        });

        endBtn?.addEventListener("click", () => {
          endCall();
        });

        micBtn?.addEventListener("click", () => {
          if (!isInCall) startCall();

          if (!isRecording) {
            if (speechRec) {
              try {
                void startIvrMediaCapture();
                speechRec.lang = (SUPPORTED_DIALECTS[session?.dialectKey] || SUPPORTED_DIALECTS["1"]).bcp47;
                speechRec.start();
                isRecording = true;
                micBtn.classList.add("recording");
                audioInd.textContent = "🎙️ Listening to speech...";
              } catch (e) {
                console.warn("SpeechRec start error", e);
              }
            } else {
              // Simulated voice fallback
              const sampleVoice = session?.dialectCode === "bho"
                ? "हमार छाती में बहुते दरद बा आ सांस फूले लागल बा"
                : "बच्चे को कल से तेज़ बुखार 103 डिग्री है";
              dispatchIvrInput({ speech: sampleVoice });
            }
          } else {
            if (speechRec) {
              try { speechRec.stop(); } catch(e){}
            }
            isRecording = false;
            micBtn.classList.remove("recording");
          }
        });

        digits.forEach((btn) => {
          btn.addEventListener("click", () => {
            const key = btn.dataset.key;
            playDtmfTone(key);
            if (isInCall) {
              if (isRecording && speechRec) {
                try { speechRec.stop(); } catch(e){}
                isRecording = false;
                micBtn.classList.remove("recording");
              }
              dispatchIvrInput({ dtmf: key });
            }
          });
        });

        dialectButtons.forEach((btn) => {
          btn.addEventListener("click", () => {
            const lang = btn.dataset.ivrLang;
            const phrase = btn.dataset.ivrPhrase;
            if (!isInCall) {
              startCall();
            }
            const matchedKey = Object.keys(SUPPORTED_DIALECTS).find(k => SUPPORTED_DIALECTS[k].code === lang) || "1";
            session.dialectKey = matchedKey;
            session.dialectCode = lang;
            session.state = "SYMPTOM_INPUT";

            dispatchIvrInput({ speech: phrase });
          });
        });

        smsDismiss?.addEventListener("click", () => {
          smsToast.hidden = true;
        });

        const replayBtn = document.querySelector("#ivr-replay-btn");
        replayBtn?.addEventListener("click", () => {
          if (lastSpokenIvrText) {
            speakIvrText(lastSpokenIvrText, lastSpokenIvrBcp47);
          }
        });
      }

      renderPanIndiaDirectory();
      renderLocalities();
      renderLabCatalog();
      renderLabDates();
      renderLabSites();
      renderBloodStock();
      renderLanguage();
      handleHashChange();