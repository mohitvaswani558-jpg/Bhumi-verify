import type { Announcement, LandRecord } from "./types";

/* ------------------------------------------------------------------ */
/*  Geography                                                          */
/* ------------------------------------------------------------------ */

export const GEO: Record<
  string,
  Record<string, Record<string, string[]>>
> = {
  "Uttar Pradesh": {
    Lucknow: { Malihabad: ["Kakori", "Bakshi Ka Talab", "Sarojini Nagar"], Mohanlalganj: ["Gosaiganj", "Amethi Kalan"] },
    Prayagraj: { Phulpur: ["Kaurihar", "Bahadurpur"], Bara: ["Jhusi", "Soraon"] },
    Varanasi: { Pindra: ["Babarpur", "Lohta"], Cholapur: ["Arajiline"] },
    Agra: { Etmadpur: ["Shamsabad", "Bah"] },
  },
  Maharashtra: {
    Pune: { Haveli: ["Manjari", "Wagholi", "Loni Kalbhor"], Baramati: ["Bhigwan", "Indapur"] },
    Nashik: { Dindori: ["Vani", "Pimpalgaon"], Niphad: ["Lasalgaon", "Ozar"] },
    Nagpur: { Kamptee: ["Kanhan", "Mauda"] },
    Aurangabad: { Paithan: ["Gangapur", "Sillod"] },
  },
  Karnataka: {
    Belagavi: { Chikodi: ["Nippani", "Ainapur"], Gokak: ["Konnur"] },
    Mysuru: { Nanjangud: ["Hullahalli", "Kavalande"], "T. Narasipura": ["Bannur"] },
    Kalaburagi: { Afzalpur: ["Mashal", "Jewargi"] },
    Shivamogga: { Tirthahalli: ["Araga", "Kargi"] },
  },
  Rajasthan: {
    Jaipur: { Chaksu: ["Sanganer", "Bassi"], Phulera: ["Sambhar"] },
    Jodhpur: { Bhopalgarh: ["Osian", "Phalodi"] },
    Kota: { Ladpura: ["Sangod", "Ramganj Mandi"] },
    Udaipur: { Mavli: ["Vallabhnagar", "Salumbar"] },
  },
  "Madhya Pradesh": {
    Bhopal: { Berasia: ["Ichhawar", "Ashta"], Huzur: ["Phanda"] },
    Indore: { Depalpur: ["Betma", "Sanwer"], Mhow: ["Manpur"] },
    Jabalpur: { Patan: ["Panagar", "Kundam"] },
  },
  Bihar: {
    Patna: { Bihta: ["Naubatpur", "Masaurhi"], Paliganj: ["Dulhin Bazar"] },
    Gaya: { Belaganj: ["Imamganj", "Tikari"] },
    Muzaffarpur: { Sakra: ["Katra", "Baruraj"] },
  },
  "Tamil Nadu": {
    Coimbatore: { Pollachi: ["Valparai", "Kinathukadavu"], Mettupalayam: ["Annur"] },
    Thanjavur: { Kumbakonam: ["Papanasam", "Thiruvaiyaru"] },
    Madurai: { Melur: ["Thirumangalam", "Usilampatti"] },
  },
  Telangana: {
    "Ranga Reddy": { Ibrahimpatnam: ["Shadnagar", "Chevella"] },
    Warangal: { Parkal: ["Mulugu", "Eturnagaram"] },
    Nizamabad: { Armoor: ["Balkonda", "Bodhan"] },
  },
};

export const STATES = Object.keys(GEO);

export const districtsOf = (state: string): string[] =>
  state && GEO[state] ? Object.keys(GEO[state]) : [];

export const tehsilsOf = (state: string, district: string): string[] =>
  state && district && GEO[state]?.[district] ? Object.keys(GEO[state][district]) : [];

export const villagesOf = (
  state: string,
  district: string,
  tehsil: string,
): string[] => (state && district && tehsil ? GEO[state]?.[district]?.[tehsil] ?? [] : []);

/* ------------------------------------------------------------------ */
/*  Land records                                                       */
/* ------------------------------------------------------------------ */

const OWNERS: [string, string][] = [
  ["Ramesh Chandra Tiwari", "रमेश चंद्र तिवारी"],
  ["Sunita Devi Yadav", "सुनीता देवी यादव"],
  ["Mahesh Patil", "महेश पाटिल"],
  ["Kavita Joshi", "कविता जोशी"],
  ["Abdul Rahman Sheikh", "अब्दुल रहमान शेख"],
  ["Vikram Singh Rathore", "विक्रम सिंह राठौर"],
  ["Lakshmi Narayanan", "लक्ष्मी नारायणन"],
  ["Gopal Krishna Reddy", "गोपाल कृष्णा रेड्डी"],
  ["Firoz Ahmad Ansari", "फ़िरोज़ अहमद अंसारी"],
  ["Meena Bai Gond", "मीना बाई गोंड"],
  ["Shivkumar Gowda", "शिवकुमार गौड़ा"],
  ["Prakash Chandra Mishra", "प्रकाश चंद्र मिश्रा"],
];

const LAND_TYPES: [string, string][] = [
  ["Agricultural – Irrigated", "कृषि – सिंचित"],
  ["Agricultural – Rainfed", "कृषि – असिंचित"],
  ["Grove Land (Bagicha)", "बाग़ भूमि"],
  ["Residential Plot (Abadi)", "आवासीय प्लॉट (आबादी)"],
  ["Commercial Plot", "व्यावसायिक प्लॉट"],
  ["Wasteland (Banjar)", "बंजर भूमि"],
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function buildRecords(): LandRecord[] {
  const out: LandRecord[] = [];
  let n = 0;
  for (const state of STATES) {
    for (const district of districtsOf(state)) {
      for (const tehsil of tehsilsOf(state, district)) {
        for (const village of villagesOf(state, district, tehsil)) {
          n += 1;
          const seed = n * 37 + village.length * 11;
          const owner = pick(OWNERS, seed);
          const lt = pick(LAND_TYPES, seed + 3);
          const area = Math.round((0.2 + ((seed * 13) % 420) / 100) * 100) / 100;
          const mutStatus =
            seed % 9 === 0 ? "Pending" : seed % 17 === 0 ? "Rejected" : "Approved";
          const enc =
            seed % 11 === 0 ? "Mortgage" : seed % 23 === 0 ? "Litigation" : "Clear";
          const year = 2016 + (seed % 9);
          const khasra = `${100 + (seed % 800)}/${(seed % 5) + 1}`;
          out.push({
            id: `LR-${state.slice(0, 2).toUpperCase()}${district.slice(0, 2).toUpperCase()}-${String(
              n,
            ).padStart(5, "0")}`,
            khasra,
            khata: `${50 + (seed % 400)}`,
            owner: owner[0],
            ownerHi: owner[1],
            fatherName: pick(
              ["Shri Ram Prasad", "Shri Dinesh Kumar", "Shri Baliram", "Late Shri Jagdish", "Shri Hanumantha"],
              seed + 5,
            ),
            village,
            tehsil,
            district,
            state,
            areaHa: area,
            landType: lt[0],
            landTypeHi: lt[1],
            irrigation: seed % 3 === 0 ? "Tubewell" : seed % 3 === 1 ? "Canal" : "Rain-fed",
            mutationNo: `MUT/${district.slice(0, 3).toUpperCase()}/${year}/${1000 + (seed % 8000)}`,
            mutationStatus: mutStatus as LandRecord["mutationStatus"],
            mutationDate: `${year}-${String((seed % 12) + 1).padStart(2, "0")}-${String(
              (seed % 27) + 1,
            ).padStart(2, "0")}`,
            encumbrance: enc as LandRecord["encumbrance"],
            taxPaid: seed % 7 !== 0,
            lastUpdated: `${year + 3}-${String((seed % 12) + 1).padStart(2, "0")}-${String(
              (seed % 27) + 1,
            ).padStart(2, "0")}`,
            history: [
              {
                date: `${year}-06-14`,
                event: "Sale Deed Registered",
                from: pick(["Shri Girdhari Lal", "Smt. Kamla Devi", "Shri Nathu Ram", "M/s Deccan Estates"], seed),
                to: owner[0],
              },
              {
                date: `${year}-08-02`,
                event: "Mutation Sanctioned (Dakhil-Kharij)",
                from: pick(["Shri Girdhari Lal", "Smt. Kamla Devi", "Shri Nathu Ram"], seed + 1),
                to: owner[0],
              },
              {
                date: `${year + 3}-01-19`,
                event: "RoR Digitised & Signed by Lekhpal",
                from: "Revenue Department",
                to: owner[0],
              },
            ],
          });
        }
      }
    }
  }
  return out;
}

export const LAND_RECORDS: LandRecord[] = buildRecords();

/* ------------------------------------------------------------------ */
/*  Announcements                                                      */
/* ------------------------------------------------------------------ */

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "A1",
    date: "2026-09-22",
    title: "BhoomiVerify AI v3.2 rolled out with tamper-detection for scanned mutation registers",
    titleHi: "स्कैन किए गए नामांतरण रजिस्टर हेतु छेड़छाड़-पहचान सहित भूमि सत्यापन एआई संस्करण 3.2 जारी",
    category: "Notification",
    body: "The upgraded engine adds error-level analysis for 300 DPI scans, supports 12 additional languages in the OCR layer and reduces average verification time to 4.2 seconds.",
    isNew: true,
  },
  {
    id: "A2",
    date: "2026-09-14",
    title: "Empanelment of State Nodal Agencies for cadastral data integration — expression of interest",
    titleHi: "कैडस्ट्रल डेटा एकीकरण हेतु राज्य नोडल एजेंसियों का पैनल — रुचि अभिव्यक्ति",
    category: "Tender",
    body: "Sealed bids are invited from eligible State Nodal Agencies for integration of village-level cadastral maps with the national land-record repository. Last date: 15 October 2026.",
    isNew: true,
  },
  {
    id: "A3",
    date: "2026-09-05",
    title: "Advisory: beware of fraudulent portals claiming to issue verified land documents",
    titleHi: "परामर्श: सत्यापित भूमि दस्तावेज़ जारी करने का दावा करने वाली धोखाधड़ी वेबसाइटों से सावधान रहें",
    category: "Advisory",
    body: "Citizens are advised that BhoomiVerify AI never charges any fee for document verification and never requests Aadhaar OTP over phone. Report suspicious activity on the cyber-crime helpline 1930.",
    isNew: false,
  },
  {
    id: "A4",
    date: "2026-08-28",
    title: "Circular on standardisation of Unique Land Parcel Identification Numbers (ULPIN)",
    titleHi: "यूनिक लैंड पार्सल आइडेंटिफिकेशन नंबर (ULPIN) के मानकीकरण पर परिपत्र",
    category: "Circular",
    body: "All District Land Records Officers shall ensure that every verified document carries a 14-digit ULPIN in the report header with effect from 01 October 2026.",
    isNew: false,
  },
  {
    id: "A5",
    date: "2026-08-12",
    title: "Recruitment: Junior Geospatial Analyst (Contractual) — 48 posts",
    titleHi: "भर्ती: कनिष्ठ भू-स्थानिक विश्लेषक (संविदात्मक) — 48 पद",
    category: "Recruitment",
    body: "Applications are invited from candidates with a degree in Geoinformatics / Remote Sensing. Online applications close on 30 September 2026 at 5:00 PM.",
    isNew: false,
  },
  {
    id: "A6",
    date: "2026-07-30",
    title: "MoU signed with NIC for blockchain anchoring of verification hashes",
    titleHi: "सत्यापन हैश के ब्लॉकचेन अंकुरण हेतु एनआईसी के साथ समझौता ज्ञापन हस्ताक्षरित",
    category: "Notification",
    body: "Every verification report generated on the portal will now be anchored to the National Blockchain Framework, making retrospective alteration of reports cryptographically detectable.",
    isNew: false,
  },
  {
    id: "A7",
    date: "2026-07-11",
    title: "Scheduled maintenance window — 20 July 2026, 00:00 to 04:00 IST",
    titleHi: "अनुसूचित अनुरक्षण अवधि — 20 जुलाई 2026, 00:00 से 04:00 IST",
    category: "Advisory",
    body: "Verification services will remain unavailable during the maintenance window. Land record search will continue to operate in read-only mode.",
    isNew: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Important links                                                    */
/* ------------------------------------------------------------------ */

export const IMPORTANT_LINKS = [
  { label: "Digital India Land Records Modernisation Programme", short: "DILRMP" },
  { label: "Bhulekh — State Land Records Portals", short: "Bhulekh" },
  { label: "SVAMITVA Scheme", short: "SVAMITVA" },
  { label: "PM-KISAN Samman Nidhi", short: "PM-KISAN" },
  { label: "Unique Land Parcel Identification Number", short: "ULPIN" },
  { label: "National Informatics Centre", short: "NIC" },
  { label: "e-Pramaan Authentication Framework", short: "e-Pramaan" },
];

/* ------------------------------------------------------------------ */
/*  Help / FAQ                                                         */
/* ------------------------------------------------------------------ */

export const FAQS: { q: string; qHi: string; a: string; aHi: string; cat: string }[] = [
  {
    cat: "Verification",
    q: "What kinds of land documents can I verify on BhoomiVerify AI?",
    qHi: "मैं भूमि सत्यापन एआई पर किस प्रकार के भूमि दस्तावेज़ सत्यापित कर सकता हूँ?",
    a: "You can verify Records of Rights (RoR / Khasra / Khatauni), registered sale deeds, mutation orders (Dakhil-Kharij), encumbrance certificates, power of attorney documents and partition deeds. Scanned copies in PDF, JPG, PNG or WEBP up to 10 MB are accepted.",
    aHi: "आप अधिकार अभिलेख (RoR / खसरा / खतौनी), पंजीकृत विक्रय विलेख, नामांतरण आदेश (दाखिल-खारिज), भारमुक्तता प्रमाणपत्र, मुख़्तारनामा और बँवारा पत्र सत्यापित कर सकते हैं। 10 MB तक की PDF, JPG, PNG या WEBP स्कैन प्रति स्वीकार्य हैं।",
  },
  {
    cat: "Verification",
    q: "How does the AI decide whether a document is genuine?",
    qHi: "एआई यह कैसे तय करता है कि दस्तावेज़ असली है या नहीं?",
    a: "Five independent signals are combined: OCR field extraction, error-level analysis to detect re-compressed or pasted regions, seal and signature template matching against the issuing office, cross-verification of the parcel identifier against the cadastral repository, and metadata/EXIF consistency. A weighted score above 90 is reported as Verified, 65–90 as Needs Review and below 65 as Flagged.",
    aHi: "पाँच स्वतंत्र संकेतों को मिलाया जाता है: ओसीआर फ़ील्ड निष्कर्षण, पुनः-संपीड़ित या चिपकाए गए क्षेत्रों की पहचान हेतु त्रुटि-स्तरीय विश्लेषण, जारीकर्ता कार्यालय के साँचे से मुहर एवं हस्ताक्षर मिलान, भू-अभिलेख भंडार से पार्सल पहचान की क्रॉस-जाँच, तथा मेटाडेटा/एक्ज़िफ़ संगति। 90 से ऊपर स्कोर 'सत्यापित', 65–90 'समीक्षा आवश्यक' और 65 से नीचे 'चिह्नित' माना जाता है।",
  },
  {
    cat: "Verification",
    q: "Is my uploaded document stored on government servers?",
    qHi: "क्या मेरा अपलोड किया गया दस्तावेज़ सरकारी सर्वर पर संग्रहीत होता है?",
    a: "The document is processed in an ephemeral session and only a cryptographic hash, the extracted fields and the verdict are retained for 90 days for audit purposes. The original file is purged automatically. You may also delete the record immediately from your dashboard.",
    aHi: "दस्तावेज़ अस्थायी सत्र में संसाधित किया जाता है और केवल क्रिप्टोग्राफिक हैश, निकाले गए फ़ील्ड एवं निर्णय 90 दिन तक लेखापरीक्षा हेतु सुरक्षित रखे जाते हैं। मूल फ़ाइल स्वतः हटा दी जाती है। आप अपने डैशबोर्ड से रिकॉर्ड तुरंत हटा भी सकते हैं।",
  },
  {
    cat: "Land Records",
    q: "Why does my Khasra number not appear in search results?",
    qHi: "मेरा खसरा नंबर खोज परिणाम में क्यों नहीं दिख रहा?",
    a: "Ensure the State, District and Tehsil cascade is selected correctly — the search is scoped to the selected geography. If the record was digitised recently it may take up to 7 working days to appear. For older records contact your Tehsil Lekhpal or raise an RTI application.",
    aHi: "सुनिश्चित करें कि राज्य, ज़िला और तहसील सही चुने गए हैं — खोज चयनित क्षेत्र तक सीमित होती है। यदि अभिलेख हाल ही में डिजिटाइज़ हुआ है तो दिखने में 7 कार्य-दिवस लग सकते हैं। पुराने अभिलेखों हेतु तहसील लेखपाल से संपर्क करें या आरटीआई आवेदन दें।",
  },
  {
    cat: "Land Records",
    q: "What is the difference between RoR, Khatauni and Khasra?",
    qHi: "RoR, खतौनी और खसरा में क्या अंतर है?",
    a: "Khasra (Girdawari) is the plot-wise crop and possession register. Khatauni is the holding-wise register of a family's plots. RoR is the consolidated Record of Rights that lists the owner, encumbrances and government dues for a parcel.",
    aHi: "खसरा (गिरदावरी) प्लॉट-वार फसल एवं कब्ज़ा रजिस्टर है। खतौनी किसी परिवार के प्लॉटों का खाता-वार रजिस्टर है। RoR समेकित अधिकार अभिलेख है जिसमें पार्सल के स्वामी, भार एवं सरकारी देय दर्ज होते हैं।",
  },
  {
    cat: "RTI",
    q: "How long does the Department take to reply to an RTI application?",
    qHi: "आरटीआई आवेदन का उत्तर देने में विभाग कितना समय लेता है?",
    a: "Under Section 7(1) of the RTI Act, 2005 the Public Information Officer must reply within 30 days of receipt. For information concerning the life or liberty of a person the limit is 48 hours. First appeal lies within 30 days of the reply or of the expiry of the 30-day period.",
    aHi: "आरटीआई अधिनियम, 2005 की धारा 7(1) के अंतर्गत लोक सूचना अधिकारी को प्राप्त होने के 30 दिनों में उत्तर देना होता है। किसी व्यक्ति के जीवन या स्वतंत्रता से संबंधित सूचना हेतु यह सीमा 48 घंटे है। प्रथम अपील उत्तर के 30 दिनों या अवधि समाप्ति के 30 दिनों में की जा सकती है।",
  },
  {
    cat: "RTI",
    q: "What is the fee and how can I pay it?",
    qHi: "शुल्क कितना है और मैं उसे कैसे भर सकता हूँ?",
    a: "The application fee is ₹10, payable through the portal via net banking, UPI or debit card. Applicants below the poverty line are exempt on production of a valid BPL certificate. Additional charges of ₹2 per page may apply for voluminous information.",
    aHi: "आवेदन शुल्क ₹10 है, जो पोर्टल पर नेट बैंकिंग, यूपीआई या डेबिट कार्ड से देय है। गरीबी रेखा से नीचे के आवेदक वैध बीपीएल प्रमाणपत्र पर छूट प्राप्त हैं। अधिक जानकारी हेतु ₹2 प्रति पृष्ठ अतिरिक्त शुल्क लग सकता है।",
  },
  {
    cat: "Account",
    q: "How do I log in without an Aadhaar number?",
    qHi: "आधार संख्या के बिना मैं कैसे लॉगिन करूँ?",
    a: "Use the Mobile OTP tab. Enter your registered 10-digit mobile number, request an OTP and enter the code. ePramaan (Aadhaar) login is optional and is only required for officer-role access.",
    aHi: "मोबाइल ओटीपी टैब का उपयोग करें। अपना पंजीकृत 10-अंकीय मोबाइल नंबर दर्ज करें, ओटीपी मँगवाएँ और कोड भरें। ई-प्रमाण (आधार) लॉगिन वैकल्पिक है और केवल अधिकारी-भूमिका हेतु आवश्यक है।",
  },
  {
    cat: "Account",
    q: "Can a Revenue Officer bulk-verify documents?",
    qHi: "क्या राजस्व अधिकारी थोक में दस्तावेज़ सत्यापित कर सकते हैं?",
    a: "Yes. Officers signed in with the Revenue Officer role can queue up to 50 documents at a time from the dashboard and export a consolidated CSV of verdicts for the district report.",
    aHi: "हाँ। राजस्व अधिकारी भूमिका से साइन इन अधिकारी डैशबोर्ड से एक साथ 50 दस्तावेज़ कतार में लगा सकते हैं और ज़िला रिपोर्ट हेतु समेकित CSV निर्यात कर सकते हैं।",
  },
  {
    cat: "Accessibility",
    q: "Is the portal compliant with GIGW accessibility guidelines?",
    qHi: "क्या पोर्टल GIGW सुगम्यता दिशानिर्देशों का पालन करता है?",
    a: "Yes. The portal follows GIGW 3.0 and WCAG 2.1 Level AA. It provides font scaling, high-contrast mode, dark theme, complete keyboard navigation, skip-to-content links, bilingual Hindi–English content and screen-reader friendly landmarks.",
    aHi: "हाँ। पोर्टल GIGW 3.0 एवं WCAG 2.1 स्तर AA का अनुसरण करता है। इसमें फ़ॉन्ट स्केलिंग, उच्च-कंट्रास्ट मोड, डार्क थीम, पूर्ण कीबोर्ड नेविगेशन, स्किप-टू-कंटेंट लिंक, द्विभाषी हिंदी-अंग्रेज़ी सामग्री और स्क्रीन-रीडर अनुकूल लैंडमार्क उपलब्ध हैं।",
  },
];

export const MANUALS = [
  { name: "Citizen User Manual", nameHi: "नागरिक उपयोगकर्ता मैनुअल", size: "2.4 MB", pages: 34 },
  { name: "Revenue Officer Handbook", nameHi: "राजस्व अधिकारी हैंडबुक", size: "5.1 MB", pages: 88 },
  { name: "RoR Search Quick Guide", nameHi: "RoR खोज त्वरित मार्गदर्शिका", size: "780 KB", pages: 8 },
  { name: "RTI Filing Handbook (Hindi)", nameHi: "आरटीआई दाखिल हैंडबुक (हिंदी)", size: "1.9 MB", pages: 26 },
  { name: "Accessibility Statement", nameHi: "सुगम्यता वक्तव्य", size: "310 KB", pages: 4 },
];

/* ------------------------------------------------------------------ */
/*  Offices                                                            */
/* ------------------------------------------------------------------ */

export const OFFICES = [
  {
    name: "BhoomiVerify AI Cell (Head Office)",
    addr: "Room No. 216, Krishi Bhavan, Dr. Rajendra Prasad Road, New Delhi – 110001",
    phone: "011-2307 2145",
    email: "bhumiverify-dlr@gov.in",
    hours: "Mon–Fri, 09:30 – 18:00 IST",
  },
  {
    name: "National Informatics Centre (Technical Helpdesk)",
    addr: "A-Wing, Electronics Niketan, 6 CGO Complex, Lodhi Road, New Delhi – 110003",
    phone: "1800-11-1551 (Toll Free)",
    email: "support-bhumiverify@nic.in",
    hours: "24 × 7",
  },
  {
    name: "Directorate of Land Records, Uttar Pradesh",
    addr: "Shastri Bhavan, 5 Ashok Marg, Lucknow – 226001",
    phone: "0522-2235 660",
    email: "dlr-up@gov.in",
    hours: "Mon–Sat, 10:00 – 17:00 IST",
  },
  {
    name: "Directorate of Settlement & Land Records, Maharashtra",
    addr: "3rd Floor, Administrative Building, Shivajinagar, Pune – 411005",
    phone: "020-2605 4411",
    email: "dslr-mh@gov.in",
    hours: "Mon–Fri, 10:00 – 17:30 IST",
  },
];

/* ------------------------------------------------------------------ */
/*  Dashboard seed analytics                                           */
/* ------------------------------------------------------------------ */

export const MONTHLY_TREND = [
  { month: "Oct '25", verified: 148200, review: 12400, flagged: 3100 },
  { month: "Nov '25", verified: 161800, review: 13100, flagged: 3640 },
  { month: "Dec '25", verified: 158400, review: 11900, flagged: 2980 },
  { month: "Jan '26", verified: 187600, review: 15200, flagged: 4120 },
  { month: "Feb '26", verified: 201300, review: 14800, flagged: 3760 },
  { month: "Mar '26", verified: 224900, review: 16400, flagged: 4380 },
  { month: "Apr '26", verified: 218700, review: 15100, flagged: 3520 },
  { month: "May '26", verified: 241500, review: 17300, flagged: 4610 },
  { month: "Jun '26", verified: 256800, review: 16900, flagged: 4240 },
  { month: "Jul '26", verified: 271400, review: 18200, flagged: 4890 },
  { month: "Aug '26", verified: 289600, review: 17600, flagged: 4410 },
  { month: "Sep '26", verified: 302100, review: 18900, flagged: 5020 },
];

export const TOP_DISTRICTS = [
  { name: "Prayagraj (UP)", value: 48210 },
  { name: "Pune (MH)", value: 44980 },
  { name: "Belagavi (KA)", value: 39120 },
  { name: "Jaipur (RJ)", value: 36470 },
  { name: "Bhopal (MP)", value: 31880 },
  { name: "Patna (BR)", value: 28640 },
  { name: "Coimbatore (TN)", value: 25310 },
  { name: "Ranga Reddy (TS)", value: 22760 },
];

export const DOC_TYPE_MIX = [
  { label: "Record of Rights", value: 38 },
  { label: "Sale Deed", value: 24 },
  { label: "Mutation Order", value: 17 },
  { label: "Encumbrance Cert.", value: 12 },
  { label: "Power of Attorney", value: 9 },
];

export const SYSTEM_HEALTH = [
  { name: "OCR Extraction Service", status: "Operational", uptime: "99.98%" },
  { name: "Tamper Analysis Engine", status: "Operational", uptime: "99.95%" },
  { name: "Cadastral Cross-Check API", status: "Operational", uptime: "99.91%" },
  { name: "Seal & Signature Registry", status: "Degraded", uptime: "98.40%" },
  { name: "Blockchain Anchor Node", status: "Operational", uptime: "99.99%" },
];

export const DOC_TYPES = [
  "Record of Rights (RoR)",
  "Sale Deed / Registry",
  "Mutation Order (Dakhil-Kharij)",
  "Encumbrance Certificate",
  "Power of Attorney",
  "Partition Deed",
  "Lease / Tenancy Agreement",
  "Other Land Document",
];
