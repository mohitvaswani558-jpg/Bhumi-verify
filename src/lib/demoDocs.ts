import type { AiOpinion, KeyFinding, Verdict } from "./types";

/* ------------------------------------------------------------------ */
/*  Six indexed sample land documents.                                 */
/*                                                                     */
/*  Each one is rendered in-browser as a realistic government "scan"   */
/*  and carries the ground-truth field values printed on its face, so  */
/*  the OCR stage of the verification pipeline returns exactly the     */
/*  owner name / khasra / extent that the user can read on the page.   */
/* ------------------------------------------------------------------ */

export interface DemoDoc {
  id: string;
  fileName: string;
  docType: string;
  formTitle: string;
  formTitleHi: string;
  formNo: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  khasra: string;
  khata: string;
  owner: string;
  ownerHi: string;
  fatherName: string;
  areaHa: number;
  landType: string;
  issueDate: string;
  regNo: string;
  authority: string;
  verdict: Verdict;
  confidence: number;
  processingMs: number;
  failedChecks: string[];
  risks: [string, string][];
  keyFindings: Omit<KeyFinding, "id">[];
  aiOpinion: AiOpinion;
  extraRows: [string, string][];
  lastModified: number;
}

export const DEMO_DOCS: DemoDoc[] = [
  {
    id: "demo-ror-tiwari",
    fileName: "RoR_Khasra142-2_Kakori_Tiwari.png",
    docType: "Record of Rights (RoR)",
    formTitle: "RECORD OF RIGHTS (ROAR)",
    formTitleHi: "अधिकार अभिलेख (रोअर)",
    formNo: "Form IV-A",
    state: "Uttar Pradesh",
    district: "Lucknow",
    tehsil: "Malihabad",
    village: "Kakori",
    khasra: "142/2",
    khata: "218",
    owner: "Ramesh Chandra Tiwari",
    ownerHi: "रमेश चंद्र तिवारी",
    fatherName: "Shri Ram Prasad Tiwari",
    areaHa: 1.84,
    landType: "Agricultural – Irrigated (Tubewell)",
    issueDate: "2024-11-18",
    regNo: "ROR/UP/LKN/2024/118442",
    authority: "Office of the Tehsildar, Malihabad",
    verdict: "verified",
    confidence: 96.8,
    processingMs: 4120,
    failedChecks: [],
    risks: [],
    extraRows: [
      ["Irrigation Source", "Tubewell (State Electricity Connection No. 4471203)"],
      ["Land Revenue (Annual)", "Rs. 486.00 — Paid up to FY 2025-26"],
      ["Encumbrance", "NIL"],
    ],
    keyFindings: [
      {
        severity: "positive",
        title: "Owner name matches the state RoR repository exactly",
        titleHi: "स्वामी का नाम राज्य RoR भंडार से पूर्णतः मिलता है",
        detail:
          "OCR read “Ramesh Chandra Tiwari” at 99.1% field confidence; the same string is present against Khasra 142/2, Khata 218, Village Kakori in the Uttar Pradesh RoR repository (sync 2026-09-24).",
        detailHi:
          "ओसीआर ने 99.1% फ़ील्ड विश्वास पर “रमेश चंद्र तिवारी” पढ़ा; यही नाम खसरा 142/2, खाता 218, ग्राम काकोरी के विरुद्ध उत्तर प्रदेश RoR भंडार में उपलब्ध है (सिंक 2026-09-24)।",
      },
      {
        severity: "positive",
        title: "Extent and land classification agree with the cadastral sheet",
        titleHi: "क्षेत्रफल एवं भूमि वर्गीकरण भू-नक़्शा शीट से संगत हैं",
        detail:
          "Printed extent 1.84 Ha equals the digitised parcel area on Sheet 12 (1.838 Ha) within the 0.5% survey tolerance.",
        detailHi:
          "अंकित क्षेत्रफल 1.84 हे. शीट 12 पर डिजिटाइज़्ड पार्सल क्षेत्रफल (1.838 हे.) के 0.5% सर्वेक्षण सहनसीमा के भीतर बराबर है।",
      },
      {
        severity: "positive",
        title: "Tehsildar seal and digital signature validated",
        titleHi: "तहसीलदार मुहर एवं डिजिटल हस्ताक्षर सत्यापित",
        detail:
          "Circular seal geometry matched the Seal Registry template for Malihabad at 97.4%; the DSC certificate chain resolves to a valid CCA-issued signing certificate.",
        detailHi:
          "गोल मुहर की ज्यामिति मलिहाबाद हेतु सील रजिस्ट्री साँचे से 97.4% मिली; डीएससी प्रमाणपत्र श्रृंखला वैध सीसीए-जारी हस्ताक्षर प्रमाणपत्र से जुड़ती है।",
      },
      {
        severity: "info",
        title: "No error-level anomalies on the scanned surface",
        titleHi: "स्कैन पृष्ठ पर कोई त्रुटि-स्तरीय विसंगति नहीं",
        detail:
          "ELA histogram is uniform (sigma 2.1). No re-compressed, pasted or spliced regions were detected.",
        detailHi:
          "ईएलए हिस्टोग्राम एकसमान है (सिग्मा 2.1)। कोई पुनः-संपीड़ित, चिपकाया या जोड़ा गया क्षेत्र नहीं मिला।",
      },
      {
        severity: "info",
        title: "Land revenue is paid and the parcel is unencumbered",
        titleHi: "भूमि राजस्व भुगतान किया गया है और पार्सल भारमुक्त है",
        detail:
          "Treasury challan for FY 2025-26 is recorded; the encumbrance register returns NIL for the requested period.",
        detailHi:
          "वित्त वर्ष 2025-26 का कोषागार चालान दर्ज है; भारमुक्तता रजिस्टर अनुरोधित अवधि हेतु शून्य लौटाता है।",
      },
    ],
    aiOpinion: {
      recommendation: "approve",
      band: "90 – 100 (High assurance)",
      summary:
        "The document is a genuine, untampered Record of Rights. Every printed field reconciles with the state repository and the issuing office seal is authentic. Recommend approval without further enquiry.",
      summaryHi:
        "यह दस्तावेज़ एक प्रामाणिक, अछेड़ा अधिकार अभिलेख है। प्रत्येक अंकित फ़ील्ड राज्य भंडार से मेल खाता है और जारीकर्ता कार्यालय की मुहर प्रामाणिक है। बिना आगे जाँच स्वीकृति की अनुशंसा।",
      reasoning: [
        "All six forensic checks passed with no exception.",
        "Owner name, Khasra, Khata and extent match the RoR repository exactly.",
        "Seal and DSC both resolve to the Malihabad Tehsildar office.",
        "No ELA anomaly, no metadata re-save, no registry mismatch.",
      ],
      reasoningHi: [
        "सभी छह फ़ोरेंसिक जाँच बिना अपवाद के पास हुईं।",
        "स्वामी का नाम, खसरा, खाता एवं क्षेत्रफल RoR भंडार से पूर्णतः मिलते हैं।",
        "मुहर एवं डीएससी दोनों मलिहाबाद तहसीलदार कार्यालय से जुड़ते हैं।",
        "कोई ईएलए विसंगति, मेटाडेटा पुनः-सेव या रजिस्ट्री बेमेल नहीं।",
      ],
    },
    lastModified: 1731900000000,
  },

  {
    id: "demo-saledeed-yadav",
    fileName: "SaleDeed_Reg8881_Wagholi_Yadav.png",
    docType: "Sale Deed / Registry",
    formTitle: "REGISTERED SALE DEED",
    formTitleHi: "पंजीकृत विक्रय विलेख",
    formNo: "Form 31 · Registration Act, 1908",
    state: "Maharashtra",
    district: "Pune",
    tehsil: "Haveli",
    village: "Wagholi",
    khasra: "310/1",
    khata: "94",
    owner: "Sunita Devi Yadav",
    ownerHi: "सुनीता देवी यादव",
    fatherName: "Shri Baliram Yadav",
    areaHa: 0.92,
    landType: "Agricultural – Rainfed",
    issueDate: "2025-03-07",
    regNo: "REG/MH/PUN/2025/008881",
    authority: "Office of the Sub-Registrar, Haveli (Pune)",
    verdict: "verified",
    confidence: 93.4,
    processingMs: 4860,
    failedChecks: [],
    risks: [],
    extraRows: [
      ["Vendor / Executant", "Mahesh Patil, S/o Dattatray Patil"],
      ["Consideration", "Rs. 39,10,000 (Stamp duty Rs. 2,73,700 paid)"],
      ["Stamp Paper No.", "MH-ST-4471902 · e-Stamp UTR 250307114422"],
    ],
    keyFindings: [
      {
        severity: "positive",
        title: "Purchaser name extracted exactly as printed on the deed",
        titleHi: "क्रयकर्ता का नाम विलेख पर अंकित रूप में ही निकाला गया",
        detail:
          "OCR read “Sunita Devi Yadav” from Clause 4 (Purchaser) at 98.6% confidence and the identical string appears in the IGR Maharashtra registration index for document 008881/2025.",
        detailHi:
          "ओसीआर ने खंड 4 (क्रयकर्ता) से 98.6% विश्वास पर “सुनीता देवी यादव” पढ़ा और यही नाम दस्तावेज़ 008881/2025 हेतु आईजीआर महाराष्ट्र पंजीकरण अनुक्रमणिका में उपलब्ध है।",
      },
      {
        severity: "positive",
        title: "e-Stamp UTR validated against the stock-holding report",
        titleHi: "ई-स्टांप यूटीआर स्टॉक-होल्डिंग रिपोर्ट से सत्यापित",
        detail:
          "UTR 250307114422 resolves to a Rs. 2,73,700 e-stamp purchased on 07-03-2025 and consumed by this deed; no duplicate usage found.",
        detailHi:
          "यूटीआर 250307114422 ₹2,73,700 के ई-स्टांप से जुड़ता है जो 07-03-2025 को खरीदा गया और इस विलेख में उपयोग हुआ; कोई दोहराव नहीं मिला।",
      },
      {
        severity: "info",
        title: "Mutation is still pending on this parcel",
        titleHi: "इस पार्सल पर नामांतरण अभी लंबित है",
        detail:
          "The RoR still lists the vendor. A Dakhil-Kharij application must be filed within 90 days of registration for the title to be reflected in the revenue record.",
        detailHi:
          "RoR में अभी भी विक्रेता का नाम है। शीर्षक राजस्व अभिलेख में दर्ज करने हेतु पंजीकरण के 90 दिनों में दाखिल-खारिज आवेदन देना आवश्यक है।",
      },
      {
        severity: "warning",
        title: "Second page carries a lower scan resolution",
        titleHi: "दूसरे पृष्ठ का स्कैन रिज़ॉल्यूशन कम है",
        detail:
          "Page 2 was scanned at 180 DPI against 300 DPI for the rest. Field confidence for the witness block is therefore 88.4% instead of 97%.",
        detailHi:
          "पृष्ठ 2 शेष दस्तावेज़ के 300 डीपीआई के विरुद्ध 180 डीपीआई पर स्कैन किया गया। अतः साक्षी ब्लॉक हेतु फ़ील्ड विश्वास 97% के स्थान पर 88.4% है।",
      },
    ],
    aiOpinion: {
      recommendation: "approve",
      band: "90 – 100 (High assurance)",
      summary:
        "A validly registered sale deed with matching stamp duty, consideration and parties. Title transfer is genuine; only the revenue mutation remains to be effected.",
      summaryHi:
        "मान्य रूप से पंजीकृत विक्रय विलेख जिसमें स्टाम्प शुल्क, प्रतिफल एवं पक्षकार संगत हैं। शीर्षक हस्तांतरण प्रामाणिक है; केवल राजस्व नामांतरण शेष है।",
      reasoning: [
        "Registration number resolves in the IGR index with identical parties.",
        "e-Stamp UTR is genuine and not reused.",
        "Seal of the Sub-Registrar, Haveli matched at 96.1%.",
        "Low-resolution page 2 lowers overall confidence marginally but raises no suspicion of tampering.",
      ],
      reasoningHi: [
        "पंजीकरण संख्या आईजीआर अनुक्रमणिका में समान पक्षकारों के साथ मिलती है।",
        "ई-स्टांप यूटीआर प्रामाणिक है और पुनः उपयोग नहीं हुआ।",
        "उप-पंजीयक, हवेली की मुहर 96.1% पर मिली।",
        "कम रिज़ॉल्यूशन वाला पृष्ठ 2 समग्र विश्वास थोड़ा घटाता है परंतु छेड़छाड़ का संदेह नहीं जगाता।",
      ],
    },
    lastModified: 1741300000000,
  },

  {
    id: "demo-mutation-gowda",
    fileName: "MutationOrder_2214_Nippani_Gowda.png",
    docType: "Mutation Order (Dakhil-Kharij)",
    formTitle: "MUTATION ORDER (DAKHIL-KHARIJ)",
    formTitleHi: "नामांतरण आदेश (दाखिल-खारिज)",
    formNo: "Form 6 · Karnataka Land Revenue Rules",
    state: "Karnataka",
    district: "Belagavi",
    tehsil: "Chikodi",
    village: "Nippani",
    khasra: "77/3",
    khata: "311",
    owner: "Shivkumar Gowda",
    ownerHi: "शिवकुमार गौड़ा",
    fatherName: "Late Shri Basavaraj Gowda",
    areaHa: 2.35,
    landType: "Agricultural – Irrigated (Canal)",
    issueDate: "2026-01-22",
    regNo: "MUT/KA/BGM/2026/002214",
    authority: "Office of the Revenue Inspector, Chikodi",
    verdict: "review",
    confidence: 74.2,
    processingMs: 5240,
    failedChecks: ["signature"],
    risks: [
      [
        "The Revenue Inspector seal impression is partially clipped at the left page margin, so only 61% of the seal geometry could be matched.",
        "राजस्व निरीक्षक की मुहर बाएँ पृष्ठ किनारे पर आंशिक रूप से कटी हुई है, अतः केवल 61% मुहर ज्यामिति का मिलान हो सका।",
      ],
      [
        "The order was issued 11 days after the statutory 30-day hearing window closed without a recorded dispensation note.",
        "आदेश वैधानिक 30-दिन सुनवाई अवधि समाप्त होने के 11 दिन बाद बिना दर्ज छूट टिप्पणी के जारी किया गया।",
      ],
    ],
    extraRows: [
      ["Applicant", "Shivkumar Gowda (Succession — legal heir)"],
      ["Hearing Date", "12-12-2025 · Objections: Nil"],
      ["Order Passed By", "Revenue Inspector, Chikodi (Sri H. Kulkarni)"],
    ],
    keyFindings: [
      {
        severity: "positive",
        title: "Applicant name extracted exactly as printed",
        titleHi: "आवेदक का नाम अंकित रूप में ही निकाला गया",
        detail:
          "OCR read “Shivkumar Gowda” at 97.2% confidence from the applicant block and from the order operative clause.",
        detailHi:
          "ओसीआर ने आवेदक ब्लॉक एवं आदेश के क्रियात्मक खंड से 97.2% विश्वास पर “शिवकुमार गौड़ा” पढ़ा।",
      },
      {
        severity: "warning",
        title: "Seal impression is clipped — geometric match incomplete",
        titleHi: "मुहर का निशान कटा हुआ है — ज्यामितीय मिलान अधूरा",
        detail:
          "Only 61% of the seal outline is inside the scan area. Template matching returned 71.8%, below the 90% acceptance threshold for automatic clearance.",
        detailHi:
          "मुहर की रूपरेखा का केवल 61% भाग स्कैन क्षेत्र में है। साँचा मिलान 71.8% लौटा, जो स्वतः स्वीकृति हेतु 90% सीमा से कम है।",
      },
      {
        severity: "warning",
        title: "Order date falls outside the recorded hearing window",
        titleHi: "आदेश तिथि दर्ज सुनवाई अवधि के बाहर है",
        detail:
          "Hearing concluded on 12-12-2025; the order is dated 22-01-2026. No condonation-of-delay note appears on the face of the document.",
        detailHi:
          "सुनवाई 12-12-2025 को समाप्त हुई; आदेश दिनांक 22-01-2026 है। दस्तावेज़ पर विलंब-क्षमा टिप्पणी उपलब्ध नहीं है।",
      },
      {
        severity: "positive",
        title: "Succession chain is consistent with the death certificate reference",
        titleHi: "उत्तराधिकार श्रृंखला मृत्यु प्रमाणपत्र संदर्भ से संगत है",
        detail:
          "The declared predecessor “Late Shri Basavaraj Gowda” matches the RoR entry superseded by this mutation.",
        detailHi:
          "घोषित पूर्ववर्ती “स्व. श्री बसवराज गौड़ा” इस नामांतरण द्वारा प्रतिस्थापित RoR प्रविष्टि से मेल खाते हैं।",
      },
      {
        severity: "info",
        title: "No tampering detected in the scanned image",
        titleHi: "स्कैन छवि में कोई छेड़छाड़ नहीं मिली",
        detail:
          "ELA and metadata provenance are clean; the concerns are procedural, not forensic.",
        detailHi:
          "ईएलए एवं मेटाडेटा स्रोत स्वच्छ हैं; चिंताएँ प्रक्रियागत हैं, फ़ोरेंसिक नहीं।",
      },
    ],
    aiOpinion: {
      recommendation: "manual_review",
      band: "65 – 89 (Manual review recommended)",
      summary:
        "The content of the mutation order is internally consistent and free of tampering, but the issuing seal is clipped and the order date sits outside the recorded hearing window. Human verification of the physical register is advised before approval.",
      summaryHi:
        "नामांतरण आदेश की सामग्री आंतरिक रूप से संगत और छेड़छाड़-मुक्त है, परंतु जारीकर्ता मुहर कटी हुई है और आदेश तिथि दर्ज सुनवाई अवधि के बाहर है। स्वीकृति से पहले भौतिक रजिस्टर का मानव सत्यापन अनुशंसित है।",
      reasoning: [
        "Seal template match 71.8% — below the automatic-clearance threshold.",
        "11-day gap between hearing and order without a condonation note.",
        "Owner name, Khasra and extent reconcile with the Karnataka Bhoomi repository.",
        "ELA, metadata and hash anchoring are clean.",
      ],
      reasoningHi: [
        "मुहर साँचा मिलान 71.8% — स्वतः स्वीकृति सीमा से कम।",
        "सुनवाई एवं आदेश के बीच 11 दिन का अंतर, बिना क्षमा टिप्पणी।",
        "स्वामी का नाम, खसरा एवं क्षेत्रफल कर्नाटक भूमि भंडार से संगत हैं।",
        "ईएलए, मेटाडेटा एवं हैश अंकुरण स्वच्छ हैं।",
      ],
    },
    lastModified: 1769040000000,
  },

  {
    id: "demo-ec-rathore",
    fileName: "EC_Survey214-3_Sanganer_Rathore.png",
    docType: "Encumbrance Certificate",
    formTitle: "ENCUMBRANCE CERTIFICATE",
    formTitleHi: "भारमुक्तता प्रमाणपत्र",
    formNo: "Form 15 · Registration Rules",
    state: "Rajasthan",
    district: "Jaipur",
    tehsil: "Chaksu",
    village: "Sanganer",
    khasra: "214/3",
    khata: "57",
    owner: "Vikram Singh Rathore",
    ownerHi: "विक्रम सिंह राठौर",
    fatherName: "Shri Bhawani Singh Rathore",
    areaHa: 3.1,
    landType: "Agricultural – Irrigated (Canal)",
    issueDate: "2019-08-14",
    regNo: "EC/RJ/JAI/2019/004417",
    authority: "Office of the Sub-Registrar, Chaksu",
    verdict: "flagged",
    confidence: 38.5,
    processingMs: 6180,
    failedChecks: ["tamper", "cadastral", "metadata"],
    risks: [
      [
        "Error-level analysis shows a re-compressed rectangular region covering the owner-name and extent fields — a strong indicator of digital alteration.",
        "त्रुटि-स्तरीय विश्लेषण में स्वामी के नाम एवं क्षेत्रफल फ़ील्ड पर पुनः-संपीड़ित आयताकार क्षेत्र दिखा, जो डिजिटल परिवर्तन का प्रबल संकेत है।",
      ],
      [
        "Survey number 214/3 does not resolve to any parcel in the Rajasthan cadastral repository for Village Sanganer.",
        "सर्वे संख्या 214/3 ग्राम सांगानेर हेतु राजस्थान भू-अभिलेख भंडार में किसी पार्सल से नहीं मिलती।",
      ],
      [
        "File metadata records a save by “Adobe Photoshop 24.6” on 03-09-2026, three years after the stated issue date.",
        "फ़ाइल मेटाडेटा में 03-09-2026 को “Adobe Photoshop 24.6” द्वारा सहेजना दर्ज है, जो अंकित जारी तिथि के तीन वर्ष बाद है।",
      ],
    ],
    extraRows: [
      ["Period Covered", "01-04-2012 to 14-08-2019"],
      ["Declared Status", "NIL ENCUMBRANCE"],
      ["Issuing Officer", "Sub-Registrar, Chaksu (Smt. R. Sharma)"],
    ],
    keyFindings: [
      {
        severity: "critical",
        title: "Tampering detected over the owner-name and extent fields",
        titleHi: "स्वामी के नाम एवं क्षेत्रफल फ़ील्ड पर छेड़छाड़ पाई गई",
        detail:
          "ELA isolates a 214 × 38 px re-compressed block exactly covering “Vikram Singh Rathore” and “3.10 Ha”. Compression-error sigma inside the block is 11.4 against 2.3 for the surrounding page.",
        detailHi:
          "ईएलए 214 × 38 पिक्सल के पुनः-संपीड़ित ब्लॉक को अलग करता है जो ठीक “विक्रम सिंह राठौर” एवं “3.10 हे.” को ढँकता है। ब्लॉक के भीतर संपीड़न-त्रुटि सिग्मा 11.4 है जबकि आसपास के पृष्ठ पर 2.3 है।",
      },
      {
        severity: "critical",
        title: "Survey number does not exist in the state cadastral repository",
        titleHi: "सर्वे संख्या राज्य भू-अभिलेख भंडार में विद्यमान नहीं है",
        detail:
          "No parcel 214/3 is registered for Village Sanganer, Tehsil Chaksu. The nearest valid survey numbers in that block are 214/1 and 214/2.",
        detailHi:
          "ग्राम सांगानेर, तहसील चाकसू हेतु कोई पार्सल 214/3 पंजीकृत नहीं है। उस ब्लॉक में निकटतम वैध सर्वे संख्याएँ 214/1 एवं 214/2 हैं।",
      },
      {
        severity: "critical",
        title: "Metadata proves post-issue editing",
        titleHi: "मेटाडेटा जारी तिथि के बाद संपादन सिद्ध करता है",
        detail:
          "The XMP history records a Photoshop save on 03-09-2026 while the certificate claims issue on 14-08-2019. The scanner profile of a Kyocera M4125idfx is absent.",
        detailHi:
          "एक्सएमपी इतिहास में 03-09-2026 को फ़ोटोशॉप सेव दर्ज है जबकि प्रमाणपत्र 14-08-2019 को जारी होने का दावा करता है। कायोसेरा M4125idfx स्कैनर प्रोफ़ाइल अनुपस्थित है।",
      },
      {
        severity: "warning",
        title: "Seal is genuine but the signature does not match the registry",
        titleHi: "मुहर प्रामाणिक है परंतु हस्ताक्षर रजिस्ट्री से नहीं मिलते",
        detail:
          "The office seal matched at 94.2%, however the signature stroke profile differs from all three specimens on file for Smt. R. Sharma.",
        detailHi:
          "कार्यालय मुहर 94.2% पर मिली, तथापि हस्ताक्षर रेखा प्रोफ़ाइल श्रीमती आर. शर्मा हेतु उपलब्ध तीनों नमूनों से भिन्न है।",
      },
      {
        severity: "info",
        title: "Recommended action",
        titleHi: "अनुशंसित कार्रवाई",
        detail:
          "Do not accept this certificate. Obtain a fresh Form 15 directly from the Sub-Registrar and consider reporting the submission under Section 420 IPC / Section 66C IT Act.",
        detailHi:
          "इस प्रमाणपत्र को स्वीकार न करें। उप-पंजीयक से नया फ़ॉर्म 15 सीधे प्राप्त करें और धारा 420 भादवि / धारा 66C आईटी अधिनियम के अंतर्गत प्रस्तुति की रिपोर्ट पर विचार करें।",
      },
    ],
    aiOpinion: {
      recommendation: "reject",
      band: "Below 65 (High forgery likelihood)",
      summary:
        "This certificate is almost certainly forged. Three independent signals — a localised re-compression over the owner and extent fields, a non-existent survey number, and Photoshop metadata dated seven years after issue — converge on deliberate alteration.",
      summaryHi:
        "यह प्रमाणपत्र लगभग निश्चित रूप से जाली है। तीन स्वतंत्र संकेत — स्वामी एवं क्षेत्रफल फ़ील्ड पर स्थानीयकृत पुनः-संपीड़न, अस्तित्वहीन सर्वे संख्या, और जारी तिथि के सात वर्ष बाद का फ़ोटोशॉप मेटाडेटा — जानबूझकर किए गए परिवर्तन पर मिलते हैं।",
      reasoning: [
        "ELA sigma inside the altered block is 5× the page baseline.",
        "Survey number 214/3 is absent from the Rajasthan cadastral index.",
        "XMP history shows a 2026 Photoshop save on a 2019 document.",
        "Signature stroke profile does not match any specimen on file.",
      ],
      reasoningHi: [
        "परिवर्तित ब्लॉक के भीतर ईएलए सिग्मा पृष्ठ आधाररेखा का 5 गुना है।",
        "सर्वे संख्या 214/3 राजस्थान भू-अभिलेख अनुक्रमणिका में अनुपस्थित है।",
        "एक्सएमपी इतिहास 2019 के दस्तावेज़ पर 2026 का फ़ोटोशॉप सेव दर्शाता है।",
        "हस्ताक्षर रेखा प्रोफ़ाइल किसी भी उपलब्ध नमूने से नहीं मिलती।",
      ],
    },
    lastModified: 1788000000000,
  },

  {
    id: "demo-poa-gond",
    fileName: "PoA_7712_Bihta_Gond.png",
    docType: "Power of Attorney",
    formTitle: "GENERAL POWER OF ATTORNEY",
    formTitleHi: "सामान्य मुख़्तारनामा",
    formNo: "Form 32 · Registration Act, 1908",
    state: "Bihar",
    district: "Patna",
    tehsil: "Bihta",
    village: "Bihta",
    khasra: "58/2",
    khata: "142",
    owner: "Meena Bai Gond",
    ownerHi: "मीना बाई गोंड",
    fatherName: "Shri Sukhram Gond",
    areaHa: 0.65,
    landType: "Agricultural – Rainfed",
    issueDate: "2025-07-19",
    regNo: "POA/BR/PAT/2025/007712",
    authority: "Office of the Sub-Registrar, Bihta",
    verdict: "review",
    confidence: 81.6,
    processingMs: 4480,
    failedChecks: ["cadastral"],
    risks: [
      [
        "The attorney named in the deed could not be resolved against the state advocate/agent registry, so the scope of authority is unverified.",
        "विलेख में नामित मुख़्तार राज्य अधिवक्ता/अभिकर्ता रजिस्ट्री से नहीं मिल सका, अतः प्राधिकार का दायरा असत्यापित है।",
      ],
    ],
    extraRows: [
      ["Attorney (Mukhtar)", "Firoz Ahmad Ansari, S/o Late Abdul Gaffar"],
      ["Scope of Authority", "Mutation, EC retrieval, sale (co-sharer consent)"],
      ["Consideration", "Irrevocable · Registered for Rs. 500 fee"],
    ],
    keyFindings: [
      {
        severity: "positive",
        title: "Principal name extracted exactly as printed",
        titleHi: "मुख्य का नाम अंकित रूप में ही निकाला गया",
        detail:
          "OCR read “Meena Bai Gond” at 98.9% confidence from the executant block; the Devanagari line “मीना बाई गोंड” was also recognised on the bilingual page.",
        detailHi:
          "ओसीआर ने प्रस्तुतकर्ता ब्लॉक से 98.9% विश्वास पर “मीना बाई गोंड” पढ़ा; द्विभाषी पृष्ठ पर देवनागरी पंक्ति “मीना बाई गोंड” भी पहचानी गई।",
      },
      {
        severity: "positive",
        title: "Registration is genuine and the stamp duty is adequate",
        titleHi: "पंजीकरण प्रामाणिक है और स्टाम्प शुल्क पर्याप्त है",
        detail:
          "Document 007712/2025 resolves in the Bihar registration index; Rs. 500 fee plus Rs. 100 stamp is the correct head for an irrevocable GPA.",
        detailHi:
          "दस्तावेज़ 007712/2025 बिहार पंजीकरण अनुक्रमणिका में मिलता है; ₹500 शुल्क एवं ₹100 स्टाम्प अपरिवर्तनीय जीपीए हेतु सही शीर्ष है।",
      },
      {
        severity: "warning",
        title: "Attorney could not be resolved in the agent registry",
        titleHi: "मुख़्तार अभिकर्ता रजिस्ट्री में नहीं मिल सका",
        detail:
          "No record of “Firoz Ahmad Ansari” exists against Bihta tehsil in the state agent registry. The parcel cross-check therefore returned PARTIAL instead of MATCH.",
        detailHi:
          "राज्य अभिकर्ता रजिस्ट्री में तहसील बिहटा हेतु “फ़िरोज़ अहमद अंसारी” का कोई अभिलेख नहीं है। अतः पार्सल क्रॉस-जाँच MATCH के स्थान पर PARTIAL लौटी।",
      },
      {
        severity: "warning",
        title: "Co-sharer consent clause is unsigned on the scanned copy",
        titleHi: "स्कैन प्रति पर सह-हिस्सेदार सहमति खंड अहस्ताक्षरित है",
        detail:
          "Clause 9 requires the signatures of two co-sharers for a sale. The scanned page shows blank signature lines in that block.",
        detailHi:
          "खंड 9 विक्रय हेतु दो सह-हिस्सेदारों के हस्ताक्षर अपेक्षित करता है। स्कैन पृष्ठ पर उस ब्लॉक में हस्ताक्षर रेखाएँ रिक्त हैं।",
      },
      {
        severity: "info",
        title: "No image-level tampering",
        titleHi: "छवि-स्तरीय कोई छेड़छाड़ नहीं",
        detail:
          "ELA is uniform and the metadata chain is consistent with a single-pass government scanner.",
        detailHi:
          "ईएलए एकसमान है और मेटाडेटा श्रृंखला एकल-पास सरकारी स्कैनर से संगत है।",
      },
    ],
    aiOpinion: {
      recommendation: "manual_review",
      band: "65 – 89 (Manual review recommended)",
      summary:
        "The power of attorney itself is authentic and untampered, but the authority it confers cannot be fully verified: the attorney is not in the agent registry and the mandatory co-sharer consent block is unsigned on this copy.",
      summaryHi:
        "मुख़्तारनामा स्वयं प्रामाणिक और अछेड़ा है, परंतु उससे प्रदत्त प्राधिकार पूर्णतः सत्यापित नहीं हो सकता: मुख़्तार अभिकर्ता रजिस्ट्री में नहीं है और इस प्रति पर अनिवार्य सह-हिस्सेदार सहमति ब्लॉक अहस्ताक्षरित है।",
      reasoning: [
        "Registration index and stamp duty both validate.",
        "Attorney name unresolved in the state agent registry.",
        "Co-sharer consent signatures absent on the scanned page.",
        "No forensic evidence of image alteration.",
      ],
      reasoningHi: [
        "पंजीकरण अनुक्रमणिका एवं स्टाम्प शुल्क दोनों वैध हैं।",
        "मुख़्तार का नाम राज्य अभिकर्ता रजिस्ट्री में नहीं मिला।",
        "स्कैन पृष्ठ पर सह-हिस्सेदार सहमति हस्ताक्षर अनुपस्थित हैं।",
        "छवि परिवर्तन का कोई फ़ोरेंसिक प्रमाण नहीं।",
      ],
    },
    lastModified: 1752900000000,
  },

  {
    id: "demo-partition-narayanan",
    fileName: "PartitionDeed_310-4A_Pollachi_Narayanan.png",
    docType: "Partition Deed",
    formTitle: "DEED OF PARTITION",
    formTitleHi: "बँवारा पत्र (विभाजन विलेख)",
    formNo: "Form 33 · Registration Act, 1908",
    state: "Tamil Nadu",
    district: "Coimbatore",
    tehsil: "Pollachi",
    village: "Pollachi",
    khasra: "310/4A",
    khata: "66",
    owner: "Lakshmi Narayanan",
    ownerHi: "लक्ष्मी नारायणन",
    fatherName: "Late Shri Srinivasa Iyer",
    areaHa: 1.28,
    landType: "Grove Land (Bagicha) — Coconut",
    issueDate: "2026-02-11",
    regNo: "PRT/TN/CBE/2026/001904",
    authority: "Office of the Sub-Registrar, Pollachi",
    verdict: "verified",
    confidence: 98.1,
    processingMs: 3940,
    failedChecks: [],
    risks: [],
    extraRows: [
      ["Co-sharers", "4 co-sharers — see Schedule A"],
      ["Share of Executant", "0.32 Ha out of 1.28 Ha (Schedule B, Item 3)"],
      ["Sub-division Approved", "Yes — TSLR/PAL/2026/118 dated 04-02-2026"],
    ],
    keyFindings: [
      {
        severity: "positive",
        title: "Executant name extracted exactly as printed",
        titleHi: "प्रस्तुतकर्ता का नाम अंकित रूप में ही निकाला गया",
        detail:
          "OCR read “Lakshmi Narayanan” at 99.4% confidence from Schedule B, Item 3 and from the executant signature block.",
        detailHi:
          "ओसीआर ने अनुसूची बी, मद 3 एवं प्रस्तुतकर्ता हस्ताक्षर ब्लॉक से 99.4% विश्वास पर “लक्ष्मी नारायणन” पढ़ा।",
      },
      {
        severity: "positive",
        title: "Sub-division sanction corroborates the split extent",
        titleHi: "उप-विभाजन स्वीकृति विभाजित क्षेत्रफल की पुष्टि करती है",
        detail:
          "TSLR/PAL/2026/118 sanctions the division of survey 310/4 into 4A–4D; the 0.32 Ha share recorded here matches the sanctioned schedule.",
        detailHi:
          "TSLR/PAL/2026/118 सर्वे 310/4 को 4A–4D में विभाजित करने की स्वीकृति देता है; यहाँ दर्ज 0.32 हे. हिस्सा स्वीकृत अनुसूची से मिलता है।",
      },
      {
        severity: "positive",
        title: "All four co-sharer signatures are present and distinct",
        titleHi: "चारों सह-हिस्सेदारों के हस्ताक्षर उपस्थित एवं भिन्न हैं",
        detail:
          "Signature clustering separated four distinct stroke profiles, each matching a specimen in the family settlement register.",
        detailHi:
          "हस्ताक्षर क्लस्टरिंग ने चार भिन्न रेखा प्रोफ़ाइल अलग कीं, प्रत्येक पारिवारिक समझौता रजिस्टर के नमूने से मिलती है।",
      },
      {
        severity: "info",
        title: "Clean forensic profile",
        titleHi: "स्वच्छ फ़ोरेंसिक प्रोफ़ाइल",
        detail:
          "ELA sigma 1.9, metadata shows a single Canon DR-C240 pass, and the document hash anchored successfully to NBF block #4,82,119.",
        detailHi:
          "ईएलए सिग्मा 1.9, मेटाडेटा एकल कैनन DR-C240 पास दर्शाता है, और दस्तावेज़ हैश एनबीएफ ब्लॉक #4,82,119 पर सफलतापूर्वक अंकुरित हुआ।",
      },
    ],
    aiOpinion: {
      recommendation: "approve",
      band: "90 – 100 (High assurance)",
      summary:
        "A properly executed and registered partition deed, fully corroborated by the sub-division sanction order and the co-sharer signature set. Recommend approval and immediate mutation of the 0.32 Ha share.",
      summaryHi:
        "उचित रूप से निष्पादित एवं पंजीकृत बँवारा पत्र, जो उप-विभाजन स्वीकृति आदेश एवं सह-हिस्सेदार हस्ताक्षर समूह से पूर्णतः पुष्ट है। स्वीकृति एवं 0.32 हे. हिस्से के तत्काल नामांतरण की अनुशंसा।",
      reasoning: [
        "All six forensic checks passed at the highest band.",
        "Sub-division sanction number resolves and matches the schedule.",
        "Four distinct signatures reconcile with the settlement register.",
        "Extent, survey number and village all reconcile with the TN cadastral index.",
      ],
      reasoningHi: [
        "सभी छह फ़ोरेंसिक जाँच उच्चतम बैंड में पास हुईं।",
        "उप-विभाजन स्वीकृति संख्या मिलती है और अनुसूची से संगत है।",
        "चार भिन्न हस्ताक्षार समझौता रजिस्टर से मेल खाते हैं।",
        "क्षेत्रफल, सर्वे संख्या एवं गाँव सभी तमिलनाडु भू-अभिलेख अनुक्रमणिका से संगत हैं।",
      ],
    },
    lastModified: 1770768000000,
  },
];

export const demoById = (id: string) => DEMO_DOCS.find((d) => d.id === id);

/* ------------------------------------------------------------------ */
/*  Rendering                                                          */
/* ------------------------------------------------------------------ */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const DOC_W = 700;
export const DOC_H = 990;

function rows(doc: DemoDoc): [string, string][] {
  return [
    ["Record Holder / खातेदार", `${doc.owner}  (${doc.ownerHi})`],
    ["Father / Husband", doc.fatherName],
    ["Khasra / Survey No.", doc.khasra],
    ["Khata No.", doc.khata],
    ["Village / मौजा", doc.village],
    ["Tehsil / तहसील", doc.tehsil],
    ["District / ज़िला", doc.district],
    ["State / राज्य", doc.state],
    ["Total Extent / क्षेत्रफल", `${doc.areaHa.toFixed(2)} Ha`],
    ["Land Classification", doc.landType],
    ...doc.extraRows,
  ];
}

/** Renders the sample document as a print-like SVG string. */
export function renderDemoDocument(doc: DemoDoc): string {
  const data = rows(doc);
  const tableTop = 300;
  const rowH = 30;
  const uid = doc.id;
  const sealCy = tableTop + data.length * rowH + 126;
  const issued = new Date(doc.issueDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const body = data
    .map((r, i) => {
      const y = tableTop + i * rowH;
      const highlight = i === 0;
      return `
      <g>
        ${highlight ? `<rect x="52" y="${y}" width="596" height="${rowH}" fill="#fff8e1" stroke="#c8a44a" stroke-width="1.4"/>` : ""}
        <line x1="52" y1="${y + rowH}" x2="648" y2="${y + rowH}" stroke="#9aa6b6" stroke-width="0.7"/>
        <line x1="292" y1="${y}" x2="292" y2="${y + rowH}" stroke="#9aa6b6" stroke-width="0.7"/>
        <text x="62" y="${y + 20}" font-family="Georgia, serif" font-size="11.5" fill="#3d4a5c" font-weight="${highlight ? "700" : "600"}">${esc(r[0])}</text>
        <text x="302" y="${y + 20}" font-family="Georgia, serif" font-size="${highlight ? "14.5" : "12.5"}" fill="#101a2b" font-weight="${highlight ? "800" : "600"}">${esc(r[1])}</text>
      </g>`;
    })
    .join("");

  const tableBottom = tableTop + data.length * rowH;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${DOC_W}" height="${DOC_H}" viewBox="0 0 ${DOC_W} ${DOC_H}" font-family="Georgia, 'Times New Roman', serif">
  <defs>
    <linearGradient id="paper-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fdfcf6"/>
      <stop offset="55%" stop-color="#f8f5ea"/>
      <stop offset="100%" stop-color="#f2eddd"/>
    </linearGradient>
    <path id="arcTop-${uid}" d="M 560,${sealCy} m -46,0 a 46,46 0 1,1 92,0"/>
    <path id="arcBot-${uid}" d="M 560,${sealCy} m 38,0 a 38,38 0 1,1 -76,0"/>
  </defs>

  <rect width="${DOC_W}" height="${DOC_H}" fill="url(#paper-${uid})"/>
  <rect x="14" y="14" width="672" height="962" fill="none" stroke="#b9ae8c" stroke-width="1.6"/>
  <rect x="20" y="20" width="660" height="950" fill="none" stroke="#d8cfb2" stroke-width="0.8"/>

  <!-- header -->
  <g>
    <circle cx="72" cy="72" r="27" fill="none" stroke="#5a4a2a" stroke-width="1.6"/>
    <circle cx="72" cy="72" r="20" fill="none" stroke="#5a4a2a" stroke-width="0.9"/>
    <path d="M60 82 L66 66 L72 76 L78 62 L84 82 Z" fill="#5a4a2a" opacity="0.85"/>
    <text x="72" y="108" text-anchor="middle" font-size="8" fill="#5a4a2a" letter-spacing="1">GOI</text>

    <text x="350" y="56" text-anchor="middle" font-size="17" font-weight="700" fill="#1b2a44" letter-spacing="1.6">GOVERNMENT OF ${esc(doc.state.toUpperCase())}</text>
    <text x="350" y="76" text-anchor="middle" font-size="11.5" fill="#3d4a5c" letter-spacing="0.6">REVENUE &amp; LAND RECORDS DEPARTMENT</text>
    <text x="350" y="94" text-anchor="middle" font-size="11.5" fill="#3d4a5c">${esc(doc.authority)}</text>

    <text x="648" y="52" text-anchor="end" font-size="9.5" fill="#6b7688">${esc(doc.formNo)}</text>
    <text x="648" y="66" text-anchor="end" font-size="9.5" fill="#6b7688">Computer Code ${esc(doc.khata.padStart(6, "0"))}</text>
    <text x="648" y="80" text-anchor="end" font-size="9.5" fill="#6b7688">Page 1 of 1</text>
  </g>

  <line x1="40" y1="118" x2="660" y2="118" stroke="#1b2a44" stroke-width="2.2"/>
  <line x1="40" y1="122" x2="660" y2="122" stroke="#1b2a44" stroke-width="0.8"/>

  <!-- title -->
  <rect x="40" y="136" width="620" height="46" fill="#1b2a44"/>
  <text x="350" y="158" text-anchor="middle" font-size="16.5" font-weight="700" fill="#ffffff" letter-spacing="1.4">${esc(doc.formTitle)}</text>
  <text x="350" y="174" text-anchor="middle" font-size="10.5" fill="#c9d6ea" letter-spacing="0.8">${esc(doc.formTitleHi)}</text>

  <!-- reference strip -->
  <g font-size="11.5" fill="#26344a">
    <text x="52" y="208" font-weight="700">Record No.:</text>
    <text x="130" y="208">${esc(doc.regNo)}</text>
    <text x="430" y="208" font-weight="700">Date of Issue:</text>
    <text x="524" y="208">${esc(issued)}</text>
    <text x="52" y="230" font-weight="700">Issued under:</text>
    <text x="140" y="230">Section 33 of the Land Revenue Code</text>
    <text x="430" y="230" font-weight="700">Verified by AI:</text>
    <text x="536" y="230">BhoomiVerify AI v3.2</text>
  </g>
  <line x1="40" y1="248" x2="660" y2="248" stroke="#9aa6b6" stroke-width="0.8" stroke-dasharray="4 3"/>

  <!-- OCR anchor marker -->
  <g>
    <rect x="40" y="258" width="620" height="30" fill="#eef3fa" stroke="#b9c9de" stroke-width="0.8"/>
    <text x="52" y="278" font-size="10.5" fill="#1b4b8a" font-weight="700" letter-spacing="0.6">OCR TARGET FIELD — RECORD HOLDER NAME (मूल खातेदार का नाम)</text>
    <text x="648" y="278" text-anchor="end" font-size="10.5" fill="#15803d" font-weight="700">FIELD 01</text>
  </g>

  <!-- table -->
  <rect x="52" y="${tableTop}" width="596" height="${data.length * rowH}" fill="#ffffff" stroke="#5a6a80" stroke-width="1.2"/>
  ${body}

  <!-- signature -->
  <g transform="translate(60, ${tableBottom + 70})">
    <path d="M0 44 C 14 8, 26 62, 40 26 C 50 2, 60 54, 74 22 C 84 2, 96 48, 112 18 C 122 0, 132 40, 146 24"
          fill="none" stroke="#1a3d8f" stroke-width="2.1" stroke-linecap="round"/>
    <line x1="-6" y1="60" x2="176" y2="60" stroke="#3d4a5c" stroke-width="1"/>
    <text x="85" y="78" text-anchor="middle" font-size="11" fill="#26344a" font-weight="700">Tehsildar / Sub-Registrar</text>
    <text x="85" y="93" text-anchor="middle" font-size="9.5" fill="#6b7688">${esc(doc.authority)}</text>
  </g>

  <!-- seal -->
  <g transform="translate(0,0)" opacity="0.82">
    <circle cx="560" cy="${sealCy}" r="52" fill="none" stroke="#6b2d8f" stroke-width="2.6"/>
    <circle cx="560" cy="${sealCy}" r="44" fill="none" stroke="#6b2d8f" stroke-width="1"/>
    <text font-size="8.4" fill="#6b2d8f" letter-spacing="1.4" font-weight="700">
      <textPath href="#arcTop-${uid}" startOffset="50%" text-anchor="middle">OFFICE OF THE ${esc(doc.tehsil.toUpperCase())}</textPath>
    </text>
    <text font-size="8" fill="#6b2d8f" letter-spacing="1" font-weight="700">
      <textPath href="#arcBot-${uid}" startOffset="50%" text-anchor="middle">${esc(doc.state.toUpperCase())} · REVENUE</textPath>
    </text>
    <text x="560" y="${sealCy - 4}" text-anchor="middle" font-size="15" fill="#6b2d8f" font-weight="800">SEAL</text>
    <text x="560" y="${sealCy + 12}" text-anchor="middle" font-size="8.6" fill="#6b2d8f" font-weight="700">${esc(doc.district.toUpperCase())}</text>
  </g>

  <!-- footer -->
  <line x1="40" y1="${DOC_H - 96}" x2="660" y2="${DOC_H - 96}" stroke="#9aa6b6" stroke-width="0.8"/>
  <g font-size="9.6" fill="#5c6878">
    <text x="52" y="${DOC_H - 74}">Digitally signed by ${esc(doc.authority)} · DN: cn=${esc(doc.authority)}, o=NIC, c=IN</text>
    <text x="52" y="${DOC_H - 58}">Signing date: ${esc(issued)} · SHA-1: 9F 2C 41 ${esc(doc.khasra.replace("/", " "))} 7B D0 55 AE</text>
    <text x="52" y="${DOC_H - 42}">This is a computer generated extract issued under the Land Records Modernisation Programme.</text>
    <text x="648" y="${DOC_H - 42}" text-anchor="end" font-weight="700" fill="#1b2a44">${esc(doc.regNo)}</text>
  </g>
</svg>`;
}

/** data: URL usable directly in an <img> tag (for thumbnails / previews). */
export function demoDocSvgUrl(doc: DemoDoc): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderDemoDocument(doc))}`;
}

/**
 * Rasterises the sample document to a real PNG File object so that it flows
 * through the exact same upload → preview → verify path as a user's own file.
 */
export async function demoDocToFile(doc: DemoDoc): Promise<File> {
  const svg = renderDemoDocument(doc);
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.decoding = "sync";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("svg load failed"));
      img.src = url;
    });
    const scale = 1.6;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(DOC_W * scale);
    canvas.height = Math.round(DOC_H * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d context unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
    });
    return new File([png], doc.fileName, {
      type: "image/png",
      lastModified: doc.lastModified,
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
