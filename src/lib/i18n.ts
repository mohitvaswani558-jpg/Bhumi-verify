export type Lang = "en" | "hi";

/**
 * Bilingual string catalogue. Every entry is [english, hindi].
 * Keys are looked up with `t()` from the app context.
 */
export const STRINGS: Record<string, [string, string]> = {
  /* ---------- header / accessibility ---------- */
  "gov.india": ["Government of India", "भारत सरकार"],
  "gov.ministry": ["Ministry of Rural Development", "ग्रामीण विकास मंत्रालय"],
  "gov.dept": ["Department of Land Resources", "भूमि संसाधन विभाग"],
  "a11y.skip": ["Skip to main content", "मुख्य सामग्री पर जाएँ"],
  "a11y.tools": ["Accessibility Tools", "सुगम्यता उपकरण"],
  "a11y.decrease": ["Decrease font size", "फ़ॉन्ट आकार घटाएँ"],
  "a11y.reset": ["Reset font size", "फ़ॉन्ट आकार रीसेट करें"],
  "a11y.increase": ["Increase font size", "फ़ॉन्ट आकार बढ़ाएँ"],
  "a11y.lang": ["Language", "भाषा"],
  "a11y.dark": ["Dark mode", "डार्क मोड"],
  "a11y.light": ["Light mode", "लाइट मोड"],
  "a11y.contrast": ["High contrast", "उच्च कंट्रास्ट"],
  "a11y.skipMain": ["Skip to Main Content", "मुख्य सामग्री पर जाएँ"],

  /* ---------- navigation ---------- */
  "nav.home": ["Home", "होम"],
  "nav.verify": ["Verify Document", "दस्तावेज़ सत्यापन"],
  "nav.land": ["Land Records", "भूमि अभिलेख"],
  "nav.dashboard": ["Dashboard", "डैशबोर्ड"],
  "nav.rti": ["RTI", "आरटीआई"],
  "nav.help": ["Help", "सहायता"],
  "nav.contact": ["Contact", "संपर्क"],
  "nav.login": ["Login", "लॉगिन"],
  "nav.logout": ["Logout", "लॉगआउट"],
  "nav.account": ["My Account", "मेरा खाता"],

  /* ---------- hero ---------- */
  "hero.badge1": ["Secure", "सुरक्षित"],
  "hero.badge2": ["Trusted", "विश्वसनीय"],
  "hero.badge3": ["Transparent", "पारदर्शी"],
  "hero.title1": ["Verify Land Documents with", "भूमि दस्तावेज़ों का सत्यापन करें"],
  "hero.title2": ["AI-Powered Confidence", "एआई-संचालित विश्वास के साथ"],
  "hero.sub": [
    "BhoomiVerify AI uses advanced machine learning to detect forged land records, verify ownership claims and cross-check government cadastral data in real time.",
    "भूमि सत्यापन एआई उन्नत मशीन लर्निंग का उपयोग करके जाली भूमि अभिलेखों का पता लगाता है, स्वामित्व दावों को सत्यापित करता है और सरकारी भू-नक़्शा डेटा की रीयल-टाइम में क्रॉस-जाँच करता है।",
  ],
  "hero.cta1": ["Upload Document", "दस्तावेज़ अपलोड करें"],
  "hero.cta2": ["Verify Record", "रिकॉर्ड सत्यापित करें"],
  "hero.stat1v": ["2.4 Cr+", "2.4 करोड़+"],
  "hero.stat1l": ["Documents Verified", "दस्तावेज़ सत्यापित"],
  "hero.stat2v": ["99.2%", "99.2%"],
  "hero.stat2l": ["Accuracy", "सटीकता"],
  "hero.stat3v": ["640+", "640+"],
  "hero.stat3l": ["Districts Covered", "ज़िले शामिल"],

  /* ---------- hero mock card ---------- */
  "card.title": ["Document Verification", "दस्तावेज़ सत्यापन"],
  "card.file": ["RoR_Scan_2024.pdf", "RoR_Scan_2024.pdf"],
  "card.analysis": ["AI Analysis", "एआई विश्लेषण"],
  "card.confidence": ["Confidence", "विश्वास स्तर"],
  "card.c1": ["Signature Verified", "हस्ताक्षर सत्यापित"],
  "card.c2": ["Stamp Detected", "मुहर पहचानी गई"],
  "card.c3": ["Tamper Check Passed", "छेड़छाड़ जाँच पास"],
  "card.verified": ["VERIFIED", "सत्यापित"],
  "card.chip1": ["OCR Engine", "ओसीआर इंजन"],
  "card.chip2": ["Tamper Detection", "छेड़छाड़ पहचान"],
  "card.chip3": ["Blockchain Hash", "ब्लॉकचेन हैश"],
  "card.cross": ["Cross-checked with 3 databases", "3 डेटाबेस से क्रॉस-चेक किया गया"],

  /* ---------- quick services ---------- */
  "svc.title": ["Quick Services", "त्वरित सेवाएँ"],
  "svc.sub": [
    "Citizen services offered by the Department of Land Resources",
    "भूमि संसाधन विभाग द्वारा प्रदान की जाने वाली नागरिक सेवाएँ",
  ],
  "svc.open": ["Open Service", "सेवा खोलें"],
  "svc.s1t": ["Verify Document", "दस्तावेज़ सत्यापन"],
  "svc.s1d": [
    "Upload land deeds, sale agreements and mutation records for instant AI-powered authenticity checks.",
    "तत्काल एआई-संचालित प्रामाणिकता जाँच के लिए भूमि विलेख, विक्रय विलेख और नामांतरण अभिलेख अपलोड करें।",
  ],
  "svc.s2t": ["Land Records", "भूमि अभिलेख"],
  "svc.s2d": [
    "Search Records of Rights (RoR), Khasra and Khatauni details across all states and districts.",
    "सभी राज्यों और ज़िलों के अधिकार अभिलेख (RoR), खसरा और खतौनी विवरण खोजें।",
  ],
  "svc.s3t": ["Mutation Status", "नामांतरण स्थिति"],
  "svc.s3d": [
    "Track Dakhil-Kharij applications, view approval history and download mutation certificates.",
    "दाखिल-खारिज आवेदनों को ट्रैक करें, स्वीकृति इतिहास देखें और प्रमाणपत्र डाउनलोड करें।",
  ],
  "svc.s4t": ["Encumbrance Certificate", "भारमुक्तता प्रमाणपत्र"],
  "svc.s4d": [
    "Obtain EC details and check liens, mortgages and litigation status on any survey number.",
    "किसी भी सर्वे नंबर पर ईसी विवरण प्राप्त करें और बंधक, भार एवं मुक़दमे की स्थिति जाँचें।",
  ],
  "svc.s5t": ["Cadastral Maps", "भू-नक़्शे"],
  "svc.s5d": [
    "View village cadastral maps sheet-wise with geo-referenced plot boundaries and area calculation.",
    "भू-संदर्भित प्लॉट सीमाओं और क्षेत्रफल गणना के साथ गाँव के भू-नक़्शे देखें।",
  ],
  "svc.s6t": ["Grievance & RTI", "शिकायत एवं आरटीआई"],
  "svc.s6d": [
    "File grievances and RTI applications online and track their resolution status in real time.",
    "ऑनलाइन शिकायतें और आरटीआई आवेदन दर्ज करें और उनकी निपटान स्थिति ट्रैक करें।",
  ],

  /* ---------- sidebar ---------- */
  "side.announcements": ["Announcements", "घोषणाएँ"],
  "side.viewAll": ["View All", "सभी देखें"],
  "side.links": ["Important Links", "महत्वपूर्ण कड़ियाँ"],
  "side.helpline": ["Kisan Call Centre", "किसान कॉल सेंटर"],
  "side.helplineSub": [
    "Toll free, 6:00 AM – 10:00 PM (all days)",
    "टोल फ्री, प्रातः 6:00 – रात्रि 10:00 (सभी दिन)",
  ],
  "side.new": ["NEW", "नया"],

  /* ---------- footer ---------- */
  "foot.about": ["About BhoomiVerify AI", "भूमि सत्यापन एआई के बारे में"],
  "foot.aboutText": [
    "BhoomiVerify AI is a flagship digital-governance initiative of the Department of Land Resources for AI-assisted verification of land records, delivered in partnership with the National Informatics Centre.",
    "भूमि सत्यापन एआई भूमि अभिलेखों के एआई-सहायता प्राप्त सत्यापन हेतु भूमि संसाधन विभाग की एक प्रमुख डिजिटल-गवर्नेंस पहल है, जिसे राष्ट्रीय सूचना विज्ञान केंद्र के सहयोग से प्रदान किया गया है।",
  ],
  "foot.services": ["Services", "सेवाएँ"],
  "foot.quick": ["Quick Links", "त्वरित कड़ियाँ"],
  "foot.contact": ["Contact Us", "संपर्क करें"],
  "foot.address": [
    "BhoomiVerify AI Cell, Department of Land Resources, Krishi Bhavan, New Delhi – 110001",
    "भूमि सत्यापन एआई प्रकोष्ठ, भूमि संसाधन विभाग, कृषि भवन, नई दिल्ली – 110001",
  ],
  "foot.policies": ["Policies", "नीतियाँ"],
  "foot.terms": ["Terms & Conditions", "नियम एवं शर्तें"],
  "foot.privacy": ["Privacy Policy", "गोपनीयता नीति"],
  "foot.copyright": ["Copyright Policy", "कॉपीराइट नीति"],
  "foot.hyperlink": ["Hyperlinking Policy", "हाइपरलिंकिंग नीति"],
  "foot.access": ["Accessibility Statement", "सुगम्यता वक्तव्य"],
  "foot.sitemap": ["Sitemap", "साइटमैप"],
  "foot.owned": [
    "Content Owned by Department of Land Resources, Ministry of Rural Development, Government of India",
    "सामग्री स्वामित्व: भूमि संसाधन विभाग, ग्रामीण विकास मंत्रालय, भारत सरकार",
  ],
  "foot.updated": ["Last Updated", "अंतिम अद्यतन"],
  "foot.visitors": ["Visitors", "आगंतुक"],
  "foot.bestViewed": [
    "Best viewed in latest versions of Google Chrome, Mozilla Firefox, Microsoft Edge & Safari",
    "गूगल क्रोम, मोज़िला फ़ायरफ़ॉक्स, माइक्रोसॉफ़्ट एज एवं सफ़ारी के नवीनतम संस्करणों में सर्वोत्तम दृश्य",
  ],
  "foot.hosted": ["Hosted & Maintained by National Informatics Centre (NIC)", "राष्ट्रीय सूचना विज्ञान केंद्र (NIC) द्वारा होस्ट एवं अनुरक्षित"],
  "foot.rights": ["All Rights Reserved", "सर्वाधिकार सुरक्षित"],

  /* ---------- common ---------- */
  "c.search": ["Search", "खोजें"],
  "c.reset": ["Reset", "रीसेट"],
  "c.submit": ["Submit", "जमा करें"],
  "c.next": ["Next", "आगे"],
  "c.back": ["Back", "पीछे"],
  "c.cancel": ["Cancel", "रद्द करें"],
  "c.download": ["Download", "डाउनलोड"],
  "c.view": ["View", "देखें"],
  "c.close": ["Close", "बंद करें"],
  "c.status": ["Status", "स्थिति"],
  "c.actions": ["Actions", "कार्रवाई"],
  "c.name": ["Full Name", "पूरा नाम"],
  "c.email": ["Email Address", "ईमेल पता"],
  "c.phone": ["Mobile Number", "मोबाइल नंबर"],
  "c.required": ["This field is required", "यह फ़ील्ड आवश्यक है"],
  "c.optional": ["Optional", "वैकल्पिक"],
  "c.loading": ["Loading…", "लोड हो रहा है…"],
  "c.all": ["All", "सभी"],
  "c.none": ["No records found", "कोई रिकॉर्ड नहीं मिला"],
  "c.print": ["Print", "प्रिंट"],
  "c.copy": ["Copy", "कॉपी"],
  "c.copied": ["Copied to clipboard", "क्लिपबोर्ड पर कॉपी हो गया"],
  "c.date": ["Date", "तिनांक"],
  "c.category": ["Category", "श्रेणी"],
  "c.title": ["Title", "शीर्षक"],
  "c.backHome": ["Back to Home", "होम पर वापस"],

  /* ---------- verify page ---------- */
  "v.title": ["Document Verification", "दस्तावेज़ सत्यापन"],
  "v.sub": [
    "Upload a scanned land document. Our AI engine performs OCR, tamper analysis, seal & signature matching and cadastral cross-verification.",
    "स्कैन किया गया भूमि दस्तावेज़ अपलोड करें। हमारा एआई इंजन ओसीआर, छेड़छाड़ विश्लेषण, मुहर एवं हस्ताक्षर मिलान और भू-नक़्शा क्रॉस-सत्यापन करता है।",
  ],
  "v.drop": ["Drag & drop your document here", "अपना दस्तावेज़ यहाँ खींचकर छोड़ें"],
  "v.or": ["or", "अथवा"],
  "v.browse": ["Browse Files", "फ़ाइल चुनें"],
  "v.formats": ["Supported: PDF, JPG, PNG, WEBP · Max 10 MB", "समर्थित: PDF, JPG, PNG, WEBP · अधिकतम 10 MB"],
  "v.docType": ["Document Type", "दस्तावेज़ प्रकार"],
  "v.state": ["State", "राज्य"],
  "v.start": ["Start AI Verification", "एआई सत्यापन प्रारंभ करें"],
  "v.another": ["Verify Another Document", "एक और दस्तावेज़ सत्यापित करें"],
  "v.progress": ["Analysis in progress", "विश्लेषण प्रगति पर है"],
  "v.result": ["Verification Result", "सत्यापन परिणाम"],
  "v.extracted": ["Extracted Fields (OCR)", "निकाले गए फ़ील्ड (ओसीआर)"],
  "v.checks": ["Security Checks", "सुरक्षा जाँच"],
  "v.risk": ["Risk Indicators", "जोखिम संकेतक"],
  "v.report": ["Download Report", "रिपोर्ट डाउनलोड करें"],
  "v.save": ["Save to Dashboard", "डैशबोर्ड में सहेजें"],
  "v.ref": ["Reference ID", "संदर्भ आईडी"],
  "v.errType": ["Unsupported file type. Please upload PDF, JPG, PNG or WEBP.", "असमर्थित फ़ाइल प्रकार। कृपया PDF, JPG, PNG या WEBP अपलोड करें।"],
  "v.errSize": ["File exceeds the 10 MB limit.", "फ़ाइल 10 MB की सीमा से अधिक है।"],
  "v.step1": ["Reading document & OCR extraction", "दस्तावेज़ पठन एवं ओसीआर निष्कर्षण"],
  "v.step2": ["Error-level analysis (tamper detection)", "त्रुटि-स्तरीय विश्लेषण (छेड़छाड़ पहचान)"],
  "v.step3": ["Signature & seal matching", "हस्ताक्षर एवं मुहर मिलान"],
  "v.step4": ["Cadastral database cross-check", "भू-नक़्शा डेटाबेस क्रॉस-जाँच"],
  "v.step5": ["Risk scoring & verdict generation", "जोखिम स्कोरिंग एवं निर्णय निर्माण"],

  /* ---------- land records ---------- */
  "lr.title": ["Land Records Search", "भूमि अभिलेख खोज"],
  "lr.sub": [
    "Search Records of Rights, Khasra and Khatauni details from the consolidated national land-record repository.",
    "समेकित राष्ट्रीय भूमि-अभिलेख भंडार से अधिकार अभिलेख, खसरा एवं खतौनी विवरण खोजें।",
  ],
  "lr.district": ["District", "ज़िला"],
  "lr.tehsil": ["Tehsil / Taluka", "तहसील / तालुका"],
  "lr.village": ["Village", "गाँव"],
  "lr.khasra": ["Khasra / Survey No.", "खसरा / सर्वे नंबर"],
  "lr.owner": ["Owner Name", "खसरा / खातेदार का नाम"],
  "lr.results": ["Search Results", "खोज परिणाम"],
  "lr.area": ["Area (Ha)", "क्षेत्रफल (हे.)"],
  "lr.type": ["Land Type", "भूमि प्रकार"],
  "lr.mutation": ["Mutation", "नामांतरण"],
  "lr.detail": ["Record of Rights (RoR)", "अधिकार अभिलेख (RoR)"],
  "lr.history": ["Ownership History", "स्वामित्व इतिहास"],
  "lr.encumbrance": ["Encumbrance Status", "भारमुक्तता स्थिति"],
  "lr.map": ["Cadastral Map Preview", "भू-नक़्शे का पूर्वावलोकन"],
  "lr.downloadRor": ["Download RoR", "RoR डाउनलोड करें"],
  "lr.clear": ["Clear", "साफ़ करें"],

  /* ---------- dashboard ---------- */
  "db.title": ["Analytics Dashboard", "एनालिटिक्स डैशबोर्ड"],
  "db.sub": [
    "Live operational statistics of the BhoomiVerify AI verification pipeline.",
    "भूमि सत्यापन एआई सत्यापन पाइपलाइन के लाइव संचालन आँकड़े।",
  ],
  "db.total": ["Total Documents", "कुल दस्तावेज़"],
  "db.verified": ["Verified", "सत्यापित"],
  "db.review": ["Needs Review", "समीक्षा आवश्यक"],
  "db.flagged": ["Flagged / Forged", "चिह्नित / जाली"],
  "db.avgTime": ["Avg. Processing Time", "औसत प्रसंस्करण समय"],
  "db.trend": ["Monthly Verification Trend", "मासिक सत्यापन प्रवृत्ति"],
  "db.districts": ["Top Districts by Volume", "मात्रा अनुसार शीर्ष ज़िले"],
  "db.verdicts": ["Verdict Distribution", "निर्णय वितरण"],
  "db.types": ["Document Type Mix", "दस्तावेज़ प्रकार मिश्रण"],
  "db.recent": ["Recent Verifications", "हाल के सत्यापन"],
  "db.mine": ["Your Verifications", "आपके सत्यापन"],
  "db.empty": [
    "You have not verified any document yet. Upload one to see it here.",
    "आपने अभी तक कोई दस्तावेज़ सत्यापित नहीं किया है। यहाँ देखने के लिए एक अपलोड करें।",
  ],
  "db.system": ["System Health", "सिस्टम स्वास्थ्य"],

  /* ---------- rti ---------- */
  "rti.title": ["Right to Information (RTI)", "सूचना का अधिकार (आरटीआई)"],
  "rti.sub": [
    "File an online RTI application with the Department of Land Resources under the RTI Act, 2005 and track its disposal.",
    "आरटीआई अधिनियम, 2005 के अंतर्गत भूमि संसाधन विभाग के साथ ऑनलाइन आरटीआई आवेदन दर्ज करें और उसका अनुसरण करें।",
  ],
  "rti.new": ["File New RTI", "नया आरटीआई दर्ज करें"],
  "rti.track": ["Track Application", "आवेदन ट्रैक करें"],
  "rti.mine": ["My Applications", "मेरे आवेदन"],
  "rti.step1": ["Applicant Details", "आवेदक विवरण"],
  "rti.step2": ["Information Sought", "मांगी गई सूचना"],
  "rti.step3": ["Fee & Declaration", "शुल्क एवं घोषणा"],
  "rti.step4": ["Acknowledgement", "पावती"],
  "rti.regNo": ["Registration Number", "पंजीकरण संख्या"],
  "rti.fee": ["Application Fee", "आवेदन शुल्क"],
  "rti.feeNote": [
    "₹10 for Indian citizens. Applicants below the poverty line are exempt — attach a valid BPL certificate.",
    "भारतीय नागरिकों हेतु ₹10। गरीबी रेखा से नीचे के आवेदक छूट प्राप्त हैं — वैध बीपीएल प्रमाणपत्र संलग्न करें।",
  ],
  "rti.bpl": ["I am a BPL applicant (fee exempt)", "मैं बीपीएल आवेदक हूँ (शुल्क मुक्त)"],
  "rti.declare": [
    "I declare that I am a citizen of India and the information sought is not exempt under Sections 8 & 9 of the RTI Act, 2005.",
    "मैं घोषणा करता/करती हूँ कि मैं भारत का नागरिक हूँ और मांगी गई सूचना आरटीआई अधिनियम, 2005 की धारा 8 एवं 9 के अंतर्गत छूट प्राप्त नहीं है।",
  ],
  "rti.subject": ["Subject of Information", "सूचना का विषय"],
  "rti.details": ["Details of Information Required", "आवश्यक सूचना का विवरण"],
  "rti.period": ["Period of Information", "सूचना की अवधि"],
  "rti.pio": ["Public Information Officer", "लोक सूचना अधिकारी"],
  "rti.success": [
    "Your RTI application has been registered successfully. A copy has been sent to your registered email.",
    "आपका आरटीआई आवेदन सफलतापूर्वक पंजीकृत हो गया है। एक प्रति आपके पंजीकृत ईमेल पर भेज दी गई है।",
  ],
  "rti.replyDays": [
    "Statutory reply period: 30 days from the date of receipt.",
    "वैधानिक उत्तर अवधि: प्राप्त होने की तिथि से 30 दिन।",
  ],

  /* ---------- help ---------- */
  "h.title": ["Help & Support", "सहायता एवं समर्थन"],
  "h.sub": [
    "Frequently asked questions, user manuals and step-by-step guides for using BhoomiVerify AI.",
    "भूमि सत्यापन एआई के उपयोग हेतु अक्सर पूछे जाने वाले प्रश्न, उपयोगकर्ता मैनुअल एवं चरण-दर-चरण मार्गदर्शिका।",
  ],
  "h.faq": ["Frequently Asked Questions", "अक्सर पूछे जाने वाले प्रश्न"],
  "h.docs": ["Downloads & Manuals", "डाउनलोड एवं मैनुअल"],
  "h.ticket": ["Raise a Support Ticket", "सहायता टिकट दर्ज करें"],
  "h.ticketSub": [
    "Describe your issue and our helpdesk will respond within 24 working hours.",
    "अपनी समस्या का विवरण दें और हमारा हेल्पडेस्क 24 कार्य-घंटों में उत्तर देगा।",
  ],

  /* ---------- contact ---------- */
  "ct.title": ["Contact Us", "संपर्क करें"],
  "ct.sub": [
    "Reach the BhoomiVerify AI helpdesk, the Department of Land Resources or your State Land Records Directorate.",
    "भूमि सत्यापन एआई हेल्पडेस्क, भूमि संसाधन विभाग या अपने राज्य भूमि अभिलेख निदेशालय से संपर्क करें।",
  ],
  "ct.form": ["Send us a Message", "हमें संदेश भेजें"],
  "ct.subject": ["Subject", "विषय"],
  "ct.message": ["Message", "संदेश"],
  "ct.offices": ["Offices & Directorates", "कार्यालय एवं निदेशालय"],
  "ct.success": ["Your message has been submitted. Reference: ", "आपका संदेश जमा हो गया है। संदर्भ: "],

  /* ---------- login ---------- */
  "lg.title": ["Citizen / Officer Login", "नागरिक / अधिकारी लॉगिन"],
  "lg.sub": [
    "Sign in to save verifications, file RTI applications and access your land-record watchlist.",
    "सत्यापन सहेजने, आरटीआई आवेदन दर्ज करने और अपनी भूमि-अभिलेख वॉचलिस्ट तक पहुँचने के लिए साइन इन करें।",
  ],
  "lg.mobile": ["Mobile OTP", "मोबाइल ओटीपी"],
  "lg.email": ["Email / Password", "ईमेल / पासवर्ड"],
  "lg.epramaan": ["ePramaan (Aadhaar)", "ई-प्रमाण (आधार)"],
  "lg.sendOtp": ["Send OTP", "ओटीपी भेजें"],
  "lg.verifyOtp": ["Verify & Login", "सत्यापित करें एवं लॉगिन"],
  "lg.otp": ["One Time Password", "वन टाइम पासवर्ड"],
  "lg.password": ["Password", "पासवर्ड"],
  "lg.role": ["Sign in as", "इस रूप में साइन इन करें"],
  "lg.citizen": ["Citizen", "नागरिक"],
  "lg.officer": ["Revenue Officer", "राजस्व अधिकारी"],
  "lg.demo": ["Demo OTP for this prototype: ", "इस प्रोटोटाइप हेतु डेमो ओटीपी: "],
  "lg.welcome": ["Welcome back", "पुनः स्वागत है"],
  "lg.signedIn": ["Signed in successfully", "सफलतापूर्वक साइन इन हो गया"],
  "lg.signedOut": ["You have been logged out", "आप लॉगआउट हो गए हैं"],

  /* ---------- announcements ---------- */
  "an.title": ["Announcements & Circulars", "घोषणाएँ एवं परिपत्र"],
  "an.sub": [
    "Official notifications, circulars and tender notices issued by the Department of Land Resources.",
    "भूमि संसाधन विभाग द्वारा जारी आधिकारिक अधिसूचनाएँ, परिपत्र एवं निविदा सूचनाएँ।",
  ],
};

export function translate(key: string, lang: Lang): string {
  const entry = STRINGS[key];
  if (!entry) return key;
  return lang === "hi" ? entry[1] : entry[0];
}
