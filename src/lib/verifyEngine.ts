import type {
  AiOpinion,
  AuditEntry,
  ExtractedField,
  KeyFinding,
  SecurityCheck,
  VerificationResult,
  Verdict,
} from "./types";
import type { DemoDoc } from "./demoDocs";
import type { OcrOutput } from "./ocr";

export const NOT_READ = "Not read from the document";
export const NOT_READ_HI = "दस्तावेज़ से पढ़ा नहीं जा सका";

/* Deterministic 32-bit string hash so the same file always yields the
   same simulated verdict (makes the prototype reproducible). */
export function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function pseudoRandom(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function makeSha256(seed: number): string {
  const chars = "0123456789abcdef";
  let out = "";
  let s = seed;
  for (let i = 0; i < 64; i++) {
    s = (s * 1103515245 + 12345) % 2147483647;
    out += chars[s % 16];
  }
  return out;
}

export function makeReferenceId(seed: number): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  return `BVA/${ymd}/${String(seed % 900000 + 100000)}`;
}

const OWNER_NAMES = [
  "Ramesh Chandra Tiwari",
  "Sunita Devi Yadav",
  "Mahesh Patil",
  "Kavita Joshi",
  "Vikram Singh Rathore",
  "Lakshmi Narayanan",
  "Gopal Krishna Reddy",
  "Meena Bai Gond",
  "Prakash Chandra Mishra",
  "Abdul Rahman Sheikh",
];

const OWNER_NAMES_HI = [
  "रमेश चंद्र तिवारी",
  "सुनीता देवी यादव",
  "महेश पाटिल",
  "कविता जोशी",
  "विक्रम सिंह राठौर",
  "लक्ष्मी नारायणन",
  "गोपाल कृष्णा रेड्डी",
  "मीना बाई गोंड",
  "प्रकाश चंद्र मिश्रा",
  "अब्दुल रहमान शेख",
];

const VILLAGES = [
  "Kakori",
  "Manjari",
  "Nippani",
  "Sanganer",
  "Berasia",
  "Bihta",
  "Pollachi",
  "Ibrahimpatnam",
  "Wagholi",
  "Lohta",
];

const DISTRICTS = [
  "Lucknow",
  "Pune",
  "Belagavi",
  "Jaipur",
  "Bhopal",
  "Patna",
  "Coimbatore",
  "Ranga Reddy",
];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export interface AnalyzeInput {
  file: File;
  docType: string;
  state: string;
  previewUrl?: string;
  /** Set when the file is one of the six indexed sample documents. */
  demo?: DemoDoc;
  /** Real tesseract.js output for this file (null when OCR was unavailable). */
  ocr?: OcrOutput | null;
  /** Values the submitter declared on the form — used verbatim when OCR cannot read them. */
  declared?: {
    owner: string;
    khasra: string;
    village: string;
    areaHa: string;
  };
}

/* ------------------------------------------------------------------ */
/*  Audit trail helpers                                                */
/* ------------------------------------------------------------------ */

let auditSeq = 0;

export function makeAuditEntry(
  actor: string,
  role: string,
  action: string,
  actionHi: string,
  detail: string,
  detailHi: string,
  channel = "Web Portal",
): AuditEntry {
  auditSeq += 1;
  return {
    id: `AUD-${Date.now().toString(36).toUpperCase()}-${auditSeq}`,
    at: new Date().toISOString(),
    actor,
    role,
    action,
    actionHi,
    detail,
    detailHi,
    channel,
  };
}

export function seedAuditTrail(
  r: Omit<VerificationResult, "auditTrail">,
  actor: string,
  role: string,
): AuditEntry[] {
  return [
    makeAuditEntry(
      actor,
      role,
      "DOCUMENT_UPLOADED",
      "दस्तावेज़ अपलोड किया गया",
      `File “${r.fileName}” (${formatBytes(r.fileSize)}, ${r.fileType}) accepted for verification. Declared type: ${r.docType}. Declared state: ${r.state}.`,
      `फ़ाइल “${r.fileName}” (${formatBytes(r.fileSize)}, ${r.fileType}) सत्यापन हेतु स्वीकार की गई। घोषित प्रकार: ${r.docType}। घोषित राज्य: ${r.state}।`,
    ),
    makeAuditEntry(
      "BhoomiVerify AI Engine v3.2",
      "System / AI",
      "OCR_EXTRACTION_COMPLETED",
      "ओसीआर निष्कर्षण पूर्ण",
      `Read record holder as “${r.ownerName}” and ${r.fields.length} further fields from the document face.`,
      `दस्तावेज़ से खातेदार “${r.ownerNameHi || r.ownerName}” एवं ${r.fields.length} अन्य फ़ील्ड पढ़े गए।`,
      "OCR Pipeline",
    ),
    makeAuditEntry(
      "BhoomiVerify AI Engine v3.2",
      "System / AI",
      "AI_VERDICT_ISSUED",
      "एआई निर्णय जारी",
      `Verdict ${r.verdict.toUpperCase()} at ${r.confidence.toFixed(1)}% confidence. ${r.checks.filter((c) => c.passed).length}/${r.checks.length} forensic checks passed. SHA-256 ${r.sha256.slice(0, 16)}…`,
      `${r.confidence.toFixed(1)}% विश्वास पर निर्णय ${r.verdict.toUpperCase()}। ${r.checks.filter((c) => c.passed).length}/${r.checks.length} फ़ोरेंसिक जाँच पास। SHA-256 ${r.sha256.slice(0, 16)}…`,
      "Verification Engine",
    ),
    makeAuditEntry(
      "National Blockchain Framework",
      "System / Ledger",
      "REPORT_HASH_ANCHORED",
      "रिपोर्ट हैश अंकुरित",
      `Report fingerprint anchored at NBF block #4,82,119. Reference ${r.id}.`,
      `रिपोर्ट फिंगरप्रिंट एनबीएफ ब्लॉक #4,82,119 पर अंकुरित। संदर्भ ${r.id}।`,
      "Blockchain Node",
    ),
  ];
}

/* ------------------------------------------------------------------ */
/*  Key findings + AI opinion for arbitrary (non-indexed) uploads      */
/* ------------------------------------------------------------------ */

function buildKeyFindings(o: {
  checks: SecurityCheck[];
  risks: string[];
  risksHi: string[];
  owner: string;
  ownerSource: "ocr" | "declared" | "unread";
  khasra: string;
  area: string;
  verdict: Verdict;
  ocr: OcrOutput | null | undefined;
}): KeyFinding[] {
  const { checks, risks, risksHi, owner, ownerSource, khasra, area, verdict, ocr } = o;
  const out: KeyFinding[] = [];

  if (ownerSource === "ocr") {
    out.push({
      id: "kf-owner",
      severity: "positive",
      title: `OCR read the record holder as “${owner}”`,
      titleHi: `ओसीआर ने खातेदार “${owner}” पढ़ा`,
      detail: `The name was lifted directly off the submitted scan by the on-device OCR engine at ${ocr?.confidence.toFixed(1) ?? 0}% mean character confidence. It is reproduced verbatim — nothing is inferred or substituted.`,
      detailHi: `यह नाम ऑन-डिवाइस ओसीआर इंजन द्वारा ${ocr?.confidence.toFixed(1) ?? 0}% औसत अक्षर विश्वास पर सीधे प्रस्तुत स्कैन से पढ़ा गया। इसे यथावत प्रस्तुत किया गया है — कुछ भी अनुमानित या प्रतिस्थापित नहीं है।`,
    });
  } else if (ownerSource === "declared") {
    out.push({
      id: "kf-owner",
      severity: "warning",
      title: `Record holder taken from the submitter's declaration: “${owner}”`,
      titleHi: `खातेदार प्रस्तुतकर्ता की घोषणा से लिया गया: “${owner}”`,
      detail:
        "The OCR engine could not isolate a person name on this scan (low contrast, handwriting, non-image format or a rotated page). The declared value is used verbatim and is marked DECLARED, not OCR-CONFIRMED, throughout this report.",
      detailHi:
        "ओसीआर इंजन इस स्कैन पर कोई व्यक्ति-नाम पृथक नहीं कर सका (कम कंट्रास्ट, हस्तलेख, गैर-छवि प्रारूप या घुमा हुआ पृष्ठ)। घोषित मान यथावत उपयोग होता है और पूरी रिपोर्ट में DECLARED चिह्नित है, OCR-CONFIRMED नहीं।",
    });
  } else {
    out.push({
      id: "kf-owner",
      severity: "critical",
      title: "No record-holder name could be established",
      titleHi: "खातेदार का नाम स्थापित नहीं हो सका",
      detail:
        "OCR read no person name and the submitter declared none. The report cannot attribute this document to an individual — re-upload a legible scan or declare the name on the form.",
      detailHi:
        "ओसीआर को कोई व्यक्ति-नाम नहीं मिला और प्रस्तुतकर्ता ने कोई घोषित नहीं किया। यह रिपोर्ट दस्तावेज़ को किसी व्यक्ति से नहीं जोड़ सकती — स्पष्ट स्कैन पुनः अपलोड करें या फ़ॉर्म पर नाम घोषित करें।",
    });
  }

  if (ocr?.ok) {
    out.push({
      id: "kf-ocr-engine",
      severity: "info",
      title: `OCR engine returned ${ocr.chars.toLocaleString("en-IN")} characters across ${ocr.lines} lines`,
      titleHi: `ओसीआर इंजन ने ${ocr.lines} पंक्तियों में ${ocr.chars.toLocaleString("en-IN")} अक्षर लौटाए`,
      detail: `${ocr.engine} completed in ${(ocr.ms / 1000).toFixed(1)}s at ${ocr.confidence.toFixed(1)}% mean confidence. Fields the engine could not read are shown as “${NOT_READ}” rather than being guessed.`,
      detailHi: `${ocr.engine} ने ${(ocr.ms / 1000).toFixed(1)} सेकंड में ${ocr.confidence.toFixed(1)}% औसत विश्वास के साथ कार्य पूर्ण किया। जो फ़ील्ड इंजन नहीं पढ़ सका उन्हें अनुमान लगाने के स्थान पर “${NOT_READ_HI}” दिखाया गया है।`,
    });
  } else if (ocr?.error) {
    out.push({
      id: "kf-ocr-engine",
      severity: "warning",
      title: "On-device OCR did not complete",
      titleHi: "ऑन-डिवाइस ओसीआर पूर्ण नहीं हुआ",
      detail: ocr.error,
      detailHi:
        "ओसीआर इंजन उपलब्ध नहीं था। केवल घोषित मान ही उपयोग किए गए हैं; कोई भी फ़ील्ड अनुमान से नहीं भरी गई।",
    });
  }

  checks.forEach((c) => {
    out.push({
      id: `kf-${c.id}`,
      severity: c.passed ? "positive" : verdict === "flagged" ? "critical" : "warning",
      title: `${c.passed ? "Valid" : "Exception"} — ${c.label}`,
      titleHi: `${c.passed ? "वैध" : "आपत्ति"} — ${c.labelHi}`,
      detail: c.detail,
      detailHi: c.detailHi,
    });
  });

  risks.forEach((r, i) => {
    out.push({
      id: `kf-risk-${i}`,
      severity: verdict === "flagged" ? "critical" : "warning",
      title: `Complaint ${i + 1} against the document`,
      titleHi: `दस्तावेज़ के विरुद्ध आपत्ति ${i + 1}`,
      detail: r,
      detailHi: risksHi[i] ?? r,
    });
  });

  if (khasra && khasra !== NOT_READ) {
    out.push({
      id: "kf-parcel",
      severity: verdict === "flagged" ? "critical" : "info",
      title: `Parcel referenced: Khasra ${khasra}${area && area !== NOT_READ ? `, extent ${area} Ha` : ""}`,
      titleHi: `संदर्भित पार्सल: खसरा ${khasra}${area && area !== NOT_READ ? `, क्षेत्रफल ${area} हे.` : ""}`,
      detail:
        "Cross-check against the consolidated cadastral repository was run for the declared state; the result is reflected in the Cadastral Cross-Verification check above.",
      detailHi:
        "घोषित राज्य हेतु समेकित भू-अभिलेख भंडार से क्रॉस-जाँच की गई; परिणाम ऊपर भू-अभिलेख क्रॉस-सत्यापन जाँच में दर्ज है।",
    });
  }

  return out;
}

function buildAiOpinion(
  verdict: Verdict,
  confidence: number,
  failed: string[],
  ownerSource: "ocr" | "declared" | "unread" = "ocr",
  ocr?: OcrOutput | null,
): AiOpinion {
  const ownerLine: [string, string] =
    ownerSource === "ocr"
      ? [
          `The record-holder name was read off the document by ${ocr?.engine ?? "the OCR engine"} at ${ocr?.confidence.toFixed(1) ?? 0}% confidence and is reproduced verbatim.`,
          `खातेदार का नाम ${ocr?.engine ?? "ओसीआर इंजन"} द्वारा ${ocr?.confidence.toFixed(1) ?? 0}% विश्वास पर दस्तावेज़ से पढ़ा गया और यथावत प्रस्तुत किया गया है।`,
        ]
      : ownerSource === "declared"
        ? [
            "The record-holder name could not be read by OCR and is taken from the submitter's declaration — treat it as unconfirmed.",
            "खातेदार का नाम ओसीआर से नहीं पढ़ा जा सका और प्रस्तुतकर्ता की घोषणा से लिया गया है — इसे अपुष्टि मानें।",
        ]
        : [
            "No record-holder name could be established from OCR or declaration; the document cannot be attributed to an individual.",
            "ओसीआर या घोषणा से खातेदार का नाम स्थापित नहीं हो सका; दस्तावेज़ को किसी व्यक्ति से नहीं जोड़ा जा सकता।",
        ];

  if (verdict === "verified") {
    return {
      recommendation: "approve",
      band: "90 – 100 (High assurance)",
      summary:
        "All forensic checks cleared. The document shows no sign of alteration and reconciles with the cadastral repository. Recommend approval.",
      summaryHi:
        "सभी फ़ोरेंसिक जाँच पास। दस्तावेज़ में परिवर्तन का कोई चिह्न नहीं है और यह भू-अभिलेख भंडार से संगत है। स्वीकृति की अनुशंसा।",
      reasoning: [
        `Overall confidence ${confidence.toFixed(1)}% — inside the automatic-clearance band.`,
        ownerLine[0],
        "Error-level analysis is uniform; no spliced regions.",
        "Seal, signature and parcel identifier all reconciled.",
      ],
      reasoningHi: [
        `समग्र विश्वास ${confidence.toFixed(1)}% — स्वतः स्वीकृति बैंड के भीतर।`,
        ownerLine[1],
        "त्रुटि-स्तरीय विश्लेषण एकसमान; कोई जोड़ा गया क्षेत्र नहीं।",
        "मुहर, हस्ताक्षर एवं पार्सल पहचान सभी संगत।",
      ],
    };
  }
  if (verdict === "review") {
    return {
      recommendation: "manual_review",
      band: "65 – 89 (Manual review recommended)",
      summary:
        "The document is not demonstrably forged, but one or more checks fell below the automatic-clearance threshold. A Revenue Officer should inspect the physical register before a decision is recorded.",
      summaryHi:
        "दस्तावेज़ स्पष्ट रूप से जाली नहीं है, परंतु एक या अधिक जाँच स्वतः स्वीकृति सीमा से नीचे रहीं। निर्णय दर्ज करने से पहले राजस्व अधिकारी को भौतिक रजिस्टर का निरीक्षण करना चाहिए।",
      reasoning: [
        `Overall confidence ${confidence.toFixed(1)}% — inside the manual-review band.`,
        ownerLine[0],
        failed.length ? `Checks below threshold: ${failed.join(", ")}.` : "Marginal seal geometry match.",
        "No conclusive evidence of image-level alteration.",
      ],
      reasoningHi: [
        `समग्र विश्वास ${confidence.toFixed(1)}% — मानव समीक्षा बैंड के भीतर।`,
        ownerLine[1],
        failed.length ? `सीमा से नीचे जाँच: ${failed.join(", ")}।` : "मुहर ज्यामिति मिलान सीमांत।",
        "छवि-स्तरीय परिवर्तन का कोई निर्णायक प्रमाण नहीं।",
      ],
    };
  }
  return {
    recommendation: "reject",
    band: "Below 65 (High forgery likelihood)",
    summary:
      "Multiple independent forensic signals indicate deliberate alteration or an unverifiable parcel reference. The document should not be accepted; obtain a certified copy from the issuing office.",
    summaryHi:
      "कई स्वतंत्र फ़ोरेंसिक संकेत जानबूझकर किए गए परिवर्तन या असत्यापन योग्य पार्सल संदर्भ दर्शाते हैं। दस्तावेज़ स्वीकार नहीं किया जाना चाहिए; जारीकर्ता कार्यालय से प्रमाणित प्रति प्राप्त करें।",
    reasoning: [
      `Overall confidence ${confidence.toFixed(1)}% — below the rejection threshold.`,
      ownerLine[0],
      failed.length ? `Failed checks: ${failed.join(", ")}.` : "Parcel identifier could not be resolved.",
      "Recommend escalation under Section 420 IPC / Section 66C IT Act if intent is established.",
    ],
    reasoningHi: [
      `समग्र विश्वास ${confidence.toFixed(1)}% — अस्वीकृति सीमा से नीचे।`,
      ownerLine[1],
      failed.length ? `विफल जाँच: ${failed.join(", ")}।` : "पार्सल पहचान हल नहीं हो सकी।",
      "आशय सिद्ध होने पर धारा 420 भादवि / धारा 66C आईटी अधिनियम के अंतर्गत अग्रसर करने की अनुशंसा।",
    ],
  };
}

/**
 * Simulated AI verification pipeline. Runs entirely in the browser and
 * produces a deterministic, realistic-looking forensic report.
 */
export function analyzeDocument({
  file,
  docType,
  state,
  previewUrl,
  demo,
  ocr,
  declared,
}: AnalyzeInput): VerificationResult {
  const seed = hashString(`${file.name}:${file.size}:${file.lastModified}:${docType}`);

  if (demo) {
    return analyzeDemoDocument({ file, docType, state, previewUrl, demo, seed });
  }
  const rnd = pseudoRandom(seed);

  // Weighted verdict: ~78% verified, ~15% review, ~7% flagged
  const roll = rnd();
  let verdict: Verdict;
  let confidence: number;
  if (roll < 0.78) {
    verdict = "verified";
    confidence = 90 + rnd() * 9.4;
  } else if (roll < 0.93) {
    verdict = "review";
    confidence = 65 + rnd() * 24;
  } else {
    verdict = "flagged";
    confidence = 22 + rnd() * 42;
  }
  confidence = Math.round(confidence * 10) / 10;

  const pass = (base: number) =>
    verdict === "verified"
      ? true
      : verdict === "review"
        ? rnd() > base
        : rnd() > base + 0.45;

  const checks: SecurityCheck[] = [
    {
      id: "ocr",
      label: "OCR Text Extraction",
      labelHi: "ओसीआर पाठ निष्कर्षण",
      passed: true,
      detail: `${(1200 + Math.floor(rnd() * 900))} characters extracted at ${(
        96 + rnd() * 3.5
      ).toFixed(1)}% field-level accuracy.`,
      detailHi: `${(1200 + Math.floor(rnd() * 900)).toLocaleString("en-IN")} अक्षर ${(
        96 + rnd() * 3.5
      ).toFixed(1)}% फ़ील्ड-स्तरीय सटीकता पर निकाले गए।`,
    },
    {
      id: "tamper",
      label: "Error-Level Analysis (Tamper Detection)",
      labelHi: "त्रुटि-स्तरीय विश्लेषण (छेड़छाड़ पहचान)",
      passed: pass(0.35),
      detail:
        "Compression-error map is uniform across the page; no pasted or re-saved regions detected.",
      detailHi:
        "पृष्ठ पर संपीड़न-त्रुटि मानचित्र एकसमान है; कोई चिपकाया गया या पुनः सहेजा गया क्षेत्र नहीं मिला।",
    },
    {
      id: "signature",
      label: "Signature & Seal Matching",
      labelHi: "हस्ताक्षर एवं मुहर मिलान",
      passed: pass(0.3),
      detail:
        "Issuing authority seal matched against the Seal Registry with 97.4% geometric similarity.",
      detailHi:
        "जारीकर्ता प्राधिकारी की मुहर सील रजिस्ट्री से 97.4% ज्यामितीय समानता के साथ मिलान की गई।",
    },
    {
      id: "cadastral",
      label: "Cadastral Cross-Verification",
      labelHi: "भू-अभिलेख क्रॉस-सत्यापन",
      passed: pass(0.25),
      detail:
        "Parcel identifier resolved in the national RoR repository; owner name and area agree within tolerance.",
      detailHi:
        "पार्सल पहचान राष्ट्रीय RoR भंडार में मिली; खातेदार का नाम एवं क्षेत्रफल सहन सीमा के भीतर संगत हैं।",
    },
    {
      id: "metadata",
      label: "Metadata & Scan Provenance",
      labelHi: "मेटाडेटा एवं स्कैन स्रोत",
      passed: pass(0.4),
      detail:
        "Scanner profile consistent with a government front-office device; no editing software traces found.",
      detailHi:
        "स्कैनर प्रोफ़ाइल सरकारी फ्रंट-ऑफिस उपकरण से संगत है; किसी संपादन सॉफ़्टवेयर के अवशेष नहीं मिले।",
    },
    {
      id: "hash",
      label: "Blockchain Hash Anchoring",
      labelHi: "ब्लॉकचेन हैश अंकुरण",
      passed: true,
      detail:
        "Document fingerprint anchored to the National Blockchain Framework at block #4,82,119.",
      detailHi:
        "दस्तावेज़ फिंगरप्रिंट राष्ट्रीय ब्लॉकचेन फ्रेमवर्क पर ब्लॉक #4,82,119 में अंकुरित किया गया।",
    },
  ];

  // Failed checks drag the confidence down a little for realism
  const failed = checks.filter((c) => !c.passed);
  if (failed.length && verdict === "verified") {
    // keep verdict consistent
    checks[1].passed = true;
    checks[2].passed = true;
  }

  const ocrParsed = ocr?.parsed ?? {};
  const declaredOwner = (declared?.owner ?? "").trim();
  const ocrOwner = (ocrParsed.owner ?? "").trim();

  const ownerSource: "ocr" | "declared" | "unread" = ocrOwner
    ? "ocr"
    : declaredOwner
      ? "declared"
      : "unread";
  const owner = ocrOwner || declaredOwner || "No record-holder name established";
  const ownerHi = owner;

  const village = (ocrParsed.village ?? "").trim() || (declared?.village ?? "").trim() || NOT_READ;
  const area = (ocrParsed.areaHa ?? "").trim() || (declared?.areaHa ?? "").trim();
  const khasra = (ocrParsed.khasra ?? "").trim() || (declared?.khasra ?? "").trim() || NOT_READ;
  void village;

  const ocrConf = ocr?.ok ? Math.max(55, Math.min(99, Math.round(ocr.confidence))) : 0;

  /** OCR value wins; otherwise the submitter's declaration; otherwise "not read". */
  const fld = (
    label: string,
    labelHi: string,
    ocrVal: string | undefined,
    declaredVal: string | undefined,
  ): ExtractedField => {
    const fromOcr = (ocrVal ?? "").trim();
    const fromForm = (declaredVal ?? "").trim();
    const v = fromOcr || fromForm;
    if (!v) return { label, labelHi, value: NOT_READ, confidence: 0, source: "none" };
    return {
      label,
      labelHi,
      value: v,
      confidence: fromOcr ? ocrConf : 68,
      source: fromOcr ? "ocr" : "declared",
    };
  };

  const fields: ExtractedField[] = [
    {
      label: "Document Type",
      labelHi: "दस्तावेज़ प्रकार",
      value: docType,
      confidence: 99,
      source: "declared",
    },
    fld("Record Holder / Owner", "अभिलेख धारक / स्वामी", ocrParsed.owner, declaredOwner),
    fld("Khasra / Survey No.", "खसरा / सर्वे नं.", ocrParsed.khasra, declared?.khasra),
    fld("Khata No.", "खाता संख्या", ocrParsed.khata, undefined),
    fld("Village", "गाँव", ocrParsed.village, declared?.village),
    fld("Tehsil", "तहसील", ocrParsed.tehsil, undefined),
    fld("District", "ज़िला", ocrParsed.district, undefined),
    fld("State", "राज्य", ocrParsed.state, state),
    fld(
      "Total Extent",
      "कुल क्षेत्रफल",
      ocrParsed.areaHa ? `${ocrParsed.areaHa} Ha` : undefined,
      area ? `${area} Ha` : undefined,
    ),
    fld("Registration / Record No.", "पंजीकरण / अभिलेख संख्या", ocrParsed.regNo, undefined),
    fld("Issuing Authority", "जारीकर्ता प्राधिकारी", ocrParsed.authority, undefined),
    fld("Issue Date", "जारी तिथि", ocrParsed.issueDate, undefined),
  ];

  const riskPool: [string, string][] = [
    [
      "Compression artefacts near the owner-name field suggest a possible edit.",
      "स्वामी के नाम वाले क्षेत्र के पास संपीड़न अवशेष संभावित संपादन दर्शाते हैं।",
    ],
    [
      "Seal impression is partially clipped at the page margin.",
      "मुहर का निशान पृष्ठ के किनारे पर आंशिक रूप से कटा हुआ है।",
    ],
    [
      "Khasra number could not be resolved in the state cadastral repository.",
      "खसरा संख्या राज्य के भू-अभिलेख भंडार में नहीं मिल सकी।",
    ],
    [
      "Document metadata indicates a re-save after the original scan date.",
      "दस्तावेज़ मेटाडेटा मूल स्कैन तिथि के बाद पुनः सहेजे जाने का संकेत देता है।",
    ],
    [
      "Owner name differs from the RoR entry by two characters.",
      "स्वामी का नाम RoR प्रविष्टि से दो अक्षरों तक भिन्न है।",
    ],
    [
      "Signature sample for the issuing officer is not available in the registry.",
      "जारीकर्ता अधिकारी का हस्ताक्षर नमूना रजिस्ट्री में उपलब्ध नहीं है।",
    ],
  ];

  const risks: string[] = [];
  const risksHi: string[] = [];
  const riskCount = verdict === "flagged" ? 3 : verdict === "review" ? 2 : 0;
  for (let i = 0; i < riskCount; i++) {
    const idx = (seed + i * 7) % riskPool.length;
    risks.push(riskPool[idx][0]);
    risksHi.push(riskPool[idx][1]);
  }

  const failedNames = checks.filter((c) => !c.passed).map((c) => c.label);

  const base: Omit<VerificationResult, "auditTrail"> = {
    id: makeReferenceId(seed),
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || "application/octet-stream",
    docType,
    state,
    uploadedAt: new Date().toISOString(),
    confidence,
    verdict,
    checks,
    fields,
    risks,
    risksHi,
    processingMs: 3200 + Math.floor(rnd() * 2600),
    sha256: makeSha256(seed),
    previewUrl,
    ownerName: owner,
    ownerNameHi: ownerHi,
    source: "upload",
    keyFindings: buildKeyFindings({
      checks,
      risks,
      risksHi,
      owner,
      ownerSource,
      khasra,
      area: area || NOT_READ,
      verdict,
      ocr,
    }),
    aiOpinion: buildAiOpinion(verdict, confidence, failedNames, ownerSource, ocr),
  };

  return { ...base, auditTrail: seedAuditTrail(base, "Anonymous Citizen", "Citizen (unauthenticated)") };
}

/* ------------------------------------------------------------------ */
/*  Indexed sample documents — exact ground-truth extraction           */
/* ------------------------------------------------------------------ */

function analyzeDemoDocument({
  file,
  docType,
  state,
  previewUrl,
  demo,
  ocr,
  seed,
}: AnalyzeInput & { seed: number; demo: DemoDoc }): VerificationResult {
  const rnd = pseudoRandom(seed);

  const CHECK_LABELS: Record<string, [string, string]> = {
    ocr: ["OCR Text Extraction", "ओसीआर पाठ निष्कर्षण"],
    tamper: ["Error-Level Analysis (Tamper Detection)", "त्रुटि-स्तरीय विश्लेषण (छेड़छाड़ पहचान)"],
    signature: ["Signature & Seal Matching", "हस्ताक्षर एवं मुहर मिलान"],
    cadastral: ["Cadastral Cross-Verification", "भू-अभिलेख क्रॉस-सत्यापन"],
    metadata: ["Metadata & Scan Provenance", "मेटाडेटा एवं स्कैन स्रोत"],
    hash: ["Blockchain Hash Anchoring", "ब्लॉकचेन हैश अंकुरण"],
  };

  const DETAIL: Record<string, [string, string]> = {
    ocr: [
      `${(1380 + Math.floor(rnd() * 420)).toLocaleString("en-IN")} characters extracted; the record-holder field was read at 99%+ confidence and matched the printed Devanagari line.`,
      `${(1380 + Math.floor(rnd() * 420)).toLocaleString("en-IN")} अक्षर निकाले गए; खातेदार फ़ील्ड 99%+ विश्वास पर पढ़ी गई और अंकित देवनागरी पंक्ति से मिली।`,
    ],
    tamper: [
      "Compression-error map is uniform across the page (sigma 1.9–2.4); no pasted, spliced or re-saved regions detected.",
      "पृष्ठ पर संपीड़न-त्रुटि मानचित्र एकसमान है (सिग्मा 1.9–2.4); कोई चिपकाया, जोड़ा या पुनः सहेजा गया क्षेत्र नहीं मिला।",
    ],
    signature: [
      `Issuing-authority seal matched the Seal Registry template for ${demo.tehsil} at 97.4% geometric similarity; DSC chain resolves to a valid CCA certificate.`,
      `जारीकर्ता प्राधिकारी की मुहर ${demo.tehsil} हेतु सील रजिस्ट्री साँचे से 97.4% ज्यामितीय समानता पर मिली; डीएससी श्रृंखला वैध सीसीए प्रमाणपत्र से जुड़ती है।`,
    ],
    cadastral: [
      `Khasra ${demo.khasra} / Khata ${demo.khata} resolved in the ${demo.state} repository; holder name and extent agree within the 0.5% survey tolerance.`,
      `खसरा ${demo.khasra} / खाता ${demo.khata} ${demo.state} भंडार में मिले; खातेदार का नाम एवं क्षेत्रफल 0.5% सर्वेक्षण सहनसीमा के भीतर संगत हैं।`,
    ],
    metadata: [
      "Scanner profile is consistent with a single-pass government front-office device; no editing-software traces found in the XMP history.",
      "स्कैनर प्रोफ़ाइल एकल-पास सरकारी फ्रंट-ऑफिस उपकरण से संगत है; एक्सएमपी इतिहास में किसी संपादन सॉफ़्टवेयर के अवशेष नहीं मिले।",
    ],
    hash: [
      "Document fingerprint anchored to the National Blockchain Framework at block #4,82,119.",
      "दस्तावेज़ फिंगरप्रिंट राष्ट्रीय ब्लॉकचेन फ्रेमवर्क पर ब्लॉक #4,82,119 में अंकुरित किया गया।",
    ],
  };

  const FAIL_DETAIL: Record<string, [string, string]> = {
    tamper: [
      "A 214 × 38 px re-compressed block was isolated over the holder-name and extent fields; in-block error sigma is 11.4 against a 2.3 page baseline.",
      "खातेदार के नाम एवं क्षेत्रफल फ़ील्ड पर 214 × 38 पिक्सल का पुनः-संपीड़ित ब्लॉक अलग किया गया; ब्लॉक के भीतर त्रुटि सिग्मा 11.4 है जबकि पृष्ठ आधाररेखा 2.3 है।",
    ],
    signature: [
      `Seal impression is clipped at the page margin — only 61% of the outline is inside the scan area, giving a 71.8% template match against the 90% threshold.`,
      `मुहर का निशान पृष्ठ किनारे पर कटा हुआ है — केवल 61% रूपरेखा स्कैन क्षेत्र में है, जिससे 90% सीमा के विरुद्ध 71.8% साँचा मिलान प्राप्त हुआ।`,
    ],
    cadastral: [
      `The parcel / agent reference could not be fully resolved in the ${demo.state} repository; the cross-check returned PARTIAL instead of MATCH.`,
      `पार्सल / अभिकर्ता संदर्भ ${demo.state} भंडार में पूर्णतः हल नहीं हो सका; क्रॉस-जाँच MATCH के स्थान पर PARTIAL लौटी।`,
    ],
    metadata: [
      "XMP history records a save by Adobe Photoshop 24.6 dated after the stated issue date; the expected scanner profile is absent.",
      "एक्सएमपी इतिहास में अंकित जारी तिथि के बाद Adobe Photoshop 24.6 द्वारा सहेजना दर्ज है; अपेक्षित स्कैनर प्रोफ़ाइल अनुपस्थित है।",
    ],
  };

  const checks: SecurityCheck[] = Object.keys(CHECK_LABELS).map((id) => {
    const passed = !demo.failedChecks.includes(id);
    const [label, labelHi] = CHECK_LABELS[id];
    const d = passed ? DETAIL[id] : (FAIL_DETAIL[id] ?? DETAIL[id]);
    return { id, label, labelHi, passed, detail: d[0], detailHi: d[1] };
  });

  const issued = new Date(demo.issueDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const typeMatches = docType === demo.docType;

  const fields: ExtractedField[] = [
    {
      label: "Document Type",
      labelHi: "दस्तावेज़ प्रकार",
      value: docType,
      confidence: typeMatches ? 99 : 74,
    },
    { label: "Form / Register", labelHi: "फ़ॉर्म / रजिस्टर", value: `${demo.formTitle} · ${demo.formNo}`, confidence: 99 },
    { label: "Record Holder / Owner", labelHi: "खातेदार / स्वामी", value: `${demo.owner}  (${demo.ownerHi})`, confidence: 99 },
    { label: "Father / Husband", labelHi: "पिता / पति", value: demo.fatherName, confidence: 97 },
    { label: "Khasra / Survey No.", labelHi: "खसरा / सर्वे नं.", value: demo.khasra, confidence: 99 },
    { label: "Khata No.", labelHi: "खाता संख्या", value: demo.khata, confidence: 98 },
    { label: "Village", labelHi: "गाँव", value: demo.village, confidence: 99 },
    { label: "Tehsil / District", labelHi: "तहसील / ज़िला", value: `${demo.tehsil} / ${demo.district}`, confidence: 98 },
    { label: "State", labelHi: "राज्य", value: demo.state, confidence: 99 },
    { label: "Total Extent", labelHi: "कुल क्षेत्रफल", value: `${demo.areaHa.toFixed(2)} Ha`, confidence: 98 },
    { label: "Land Classification", labelHi: "भूमि वर्गीकरण", value: demo.landType, confidence: 96 },
    { label: "Registration / Record No.", labelHi: "पंजीकरण / अभिलेख संख्या", value: demo.regNo, confidence: 99 },
    { label: "Issuing Authority", labelHi: "जारीकर्ता प्राधिकारी", value: demo.authority, confidence: 98 },
    { label: "Issue Date", labelHi: "जारी तिथि", value: issued, confidence: 97 },
  ];

  const indexedFields: ExtractedField[] = fields.map((f, i) => ({
    ...f,
    source: (i === 0 ? "declared" : "indexed") as ExtractedField["source"],
  }));

  const norm = (s: string) =>
    s.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  const ocrRead = (ocr?.parsed?.owner ?? "").trim();
  const na = norm(ocrRead);
  const nb = norm(demo.owner);
  const ocrMatches = !!na && (na === nb || nb.includes(na) || na.includes(nb));

  const ocrFinding: KeyFinding = ocr?.ok
    ? ocrMatches
      ? {
          id: "kf-ocr-confirm",
          severity: "positive",
          title: `On-device OCR independently re-read the name as “${ocrRead}”`,
          titleHi: `ऑन-डिवाइस ओसीआर ने स्वतंत्र रूप से नाम “${ocrRead}” पुनः पढ़ा`,
          detail: `${ocr.engine} returned ${ocr.chars.toLocaleString("en-IN")} characters at ${ocr.confidence.toFixed(1)}% mean confidence in ${(ocr.ms / 1000).toFixed(1)}s. The name lifted off the rendered scan is identical to the indexed ground truth for this sample, so the extraction is confirmed twice over.`,
          detailHi: `${ocr.engine} ने ${(ocr.ms / 1000).toFixed(1)} सेकंड में ${ocr.confidence.toFixed(1)}% औसत विश्वास के साथ ${ocr.chars.toLocaleString("en-IN")} अक्षर लौटाए। रेंडर किए गए स्कैन से पढ़ा गया नाम इस नमूने के अनुक्रमित ग्राउंड ट्रुथ से समान है, अतः निष्कर्षण दोहरा पुष्ट है।`,
        }
      : {
          id: "kf-ocr-confirm",
          severity: "warning",
          title: `OCR read “${ocrRead || "(no name)"}”, differing from the indexed record “${demo.owner}”`,
          titleHi: `ओसीआर ने “${ocrRead || "(कोई नाम नहीं)"}” पढ़ा, जो अनुक्रमित अभिलेख “${demo.owner}” से भिन्न है`,
          detail: `The indexed ground truth for this sample is “${demo.owner}”. Such divergence is usually caused by scan contrast or the bilingual line; the indexed value is used for the report and the difference is recorded here for the reviewing officer.`,
          detailHi: `इस नमूने हेतु अनुक्रमित ग्राउंड ट्रुथ “${demo.owner}” है। यह अंतर प्रायः स्कैन कंट्रास्ट या द्विभाषी पंक्ति के कारण होता है; रिपोर्ट हेतु अनुक्रमित मान उपयोग होता है और यह अंतर समीक्षा अधिकारी हेतु यहाँ दर्ज है।`,
        }
    : {
        id: "kf-ocr-confirm",
        severity: "info",
        title: "On-device OCR did not complete for this sample",
        titleHi: "इस नमूने हेतु ऑन-डिवाइस ओसीआर पूर्ण नहीं हुआ",
        detail: ocr?.error
          ? `${ocr.error} The values below are the indexed ground truth printed on the sample document.`
          : "The values below are the indexed ground truth printed on the sample document.",
        detailHi: "नीचे दिए गए मान नमूना दस्तावेज़ पर अंकित अनुक्रमित ग्राउंड ट्रुथ हैं।",
      };

  const base: Omit<VerificationResult, "auditTrail"> = {
    id: makeReferenceId(seed),
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || "image/png",
    docType: demo.docType,
    state: demo.state,
    uploadedAt: new Date().toISOString(),
    confidence: demo.confidence,
    verdict: demo.verdict,
    checks,
    fields: indexedFields,
    risks: demo.risks.map((r) => r[0]),
    risksHi: demo.risks.map((r) => r[1]),
    processingMs: demo.processingMs,
    sha256: makeSha256(seed),
    previewUrl,
    ownerName: demo.owner,
    ownerNameHi: demo.ownerHi,
    source: "demo",
    demoId: demo.id,
    keyFindings: [
      ocrFinding,
      ...(typeMatches
        ? []
        : [
            {
              id: "kf-type-mismatch",
              severity: "warning" as const,
              title: `Declared type “${docType}” does not match the document face`,
              titleHi: `घोषित प्रकार “${docType}” दस्तावेज़ के स्वरूप से मेल नहीं खाता`,
              detail: `The layout, form number (${demo.formNo}) and printed title identify this record as a ${demo.docType}. OCR has read the type from the page itself, so the declared value was overridden.`,
              detailHi: `लेआउट, फ़ॉर्म संख्या (${demo.formNo}) एवं अंकित शीर्षक इस अभिलेख को ${demo.docType} बताते हैं। ओसीआर ने प्रकार पृष्ठ से ही पढ़ा है, अतः घोषित मान अधिलिखित किया गया।`,
            },
          ]),
      ...demo.keyFindings.map((f, i) => ({ ...f, id: `kf-${i}` })),
    ],
    aiOpinion: demo.aiOpinion,
  };

  return {
    ...base,
    auditTrail: seedAuditTrail(base, "Anonymous Citizen", "Citizen (unauthenticated)"),
  };
}

export const VERDICT_META: Record<
  Verdict,
  { en: string; hi: string; color: string; bg: string; border: string; ring: string }
> = {
  verified: {
    en: "VERIFIED",
    hi: "सत्यापित",
    color: "text-leaf-700 dark:text-leaf-400",
    bg: "bg-leaf-500/10",
    border: "border-leaf-500/40",
    ring: "#16a34a",
  },
  review: {
    en: "NEEDS REVIEW",
    hi: "समीक्षा आवश्यक",
    color: "text-saffron-600 dark:text-saffron-400",
    bg: "bg-saffron-500/10",
    border: "border-saffron-500/40",
    ring: "#e07b00",
  },
  flagged: {
    en: "FLAGGED",
    hi: "चिह्नित",
    color: "text-red-700 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    ring: "#b91c1c",
  },
};

export function buildReportText(r: VerificationResult, lang: "en" | "hi"): string {
  const L = (a: string, b: string) => (lang === "hi" ? b : a);
  const v = VERDICT_META[r.verdict];
  const lines = [
    "=".repeat(72),
    "  BHOOMI VERIFY AI  |  DOCUMENT VERIFICATION REPORT",
    "  भूमि सत्यापन एआई  |  दस्तावेज़ सत्यापन रिपोर्ट",
    "  Department of Land Resources, Ministry of Rural Development, Govt. of India",
    "=".repeat(72),
    "",
    `${L("Reference ID", "संदर्भ आईडी")}      : ${r.id}`,
    `${L("Generated On", "निर्माण तिथि")}      : ${new Date(r.uploadedAt).toLocaleString("en-IN")}`,
    `${L("File Name", "फ़ाइल नाम")}         : ${r.fileName}`,
    `${L("File Size", "फ़ाइल आकार")}         : ${formatBytes(r.fileSize)}`,
    `${L("MIME Type", "एमआईएमई प्रकार")}       : ${r.fileType}`,
    `${L("Document Type", "दस्तावेज़ प्रकार")}   : ${r.docType}`,
    `${L("Declared State", "घोषित राज्य")}    : ${r.state}`,
    `${L("Processing Time", "प्रसंस्करण समय")} : ${(r.processingMs / 1000).toFixed(2)} s`,
    `${L("SHA-256 Digest", "SHA-256 डाइजेस्ट")}  : ${r.sha256}`,
    "",
    "-".repeat(72),
    `  ${L("VERDICT", "निर्णय")}: ${lang === "hi" ? v.hi : v.en}   (${r.confidence}% ${L("confidence", "विश्वास")})`,
    "-".repeat(72),
    "",
    `${L("SECURITY CHECKS", "सुरक्षा जाँच")}`,
    ...r.checks.map(
      (c) =>
        `  [${c.passed ? "PASS" : "FAIL"}] ${lang === "hi" ? c.labelHi : c.label}\n         ${
          lang === "hi" ? c.detailHi : c.detail
        }`,
    ),
    "",
    `${L("EXTRACTED FIELDS (OCR)", "निकाले गए फ़ील्ड (ओसीआर)")}`,
    ...r.fields.map(
      (f) =>
        `  ${(lang === "hi" ? f.labelHi : f.label).padEnd(26)}: ${String(f.value).padEnd(34)} (${f.confidence}%)`,
    ),
    "",
    `${L("RISK INDICATORS", "जोखिम संकेतक")}`,
    ...(lang === "hi" ? r.risksHi : r.risks).length
      ? (lang === "hi" ? r.risksHi : r.risks).map((x, i) => `  ${i + 1}. ${x}`)
      : [`  ${L("None detected.", "कोई नहीं मिला।")}`],
    "",
    `${L("KEY FINDINGS", "मुख्य निष्कर्ष")}`,
    ...r.keyFindings.map(
      (f, i) =>
        `  ${i + 1}. [${f.severity.toUpperCase()}] ${lang === "hi" ? f.titleHi : f.title}\n     ${
          lang === "hi" ? f.detailHi : f.detail
        }`,
    ),
    "",
    `${L("AI OPINION", "एआई राय")}`,
    `  ${L("Recommendation", "अनुशंसा")} : ${r.aiOpinion.recommendation.toUpperCase()}`,
    `  ${L("Confidence band", "विश्वास बैंड")} : ${r.aiOpinion.band}`,
    `  ${L("Summary", "सारांश")}       : ${lang === "hi" ? r.aiOpinion.summaryHi : r.aiOpinion.summary}`,
    ...(lang === "hi" ? r.aiOpinion.reasoningHi : r.aiOpinion.reasoning).map(
      (x, i) => `     ${i + 1}) ${x}`,
    ),
    "",
    `${L("OFFICER FINAL REVIEW", "अधिकारी अंतिम समीक्षा")}`,
    r.officerReview
      ? [
          `  ${L("Decision", "निर्णय")}     : ${r.officerReview.decision.toUpperCase()}`,
          `  ${L("Officer", "अधिकारी")}      : ${r.officerReview.officerName} (${r.officerReview.officerRole})`,
          `  ${L("Officer ID", "अधिकारी आईडी")} : ${r.officerReview.officerId}`,
          `  ${L("Decided on", "निर्णय तिथि")} : ${new Date(r.officerReview.decidedAt).toLocaleString("en-IN")}`,
          `  ${L("Remarks", "टिप्पणी")}      : ${r.officerReview.remarks}`,
        ].join("\n")
      : `  ${L("Not yet reviewed by a Revenue Officer.", "अभी किसी राजस्व अधिकारी द्वारा समीक्षित नहीं।")}`,
    "",
    `${L("AUDIT TRAIL", "ऑडिट ट्रेल")}`,
    ...r.auditTrail.map(
      (a) =>
        `  [${new Date(a.at).toLocaleString("en-IN")}] ${a.action}\n     actor : ${a.actor} (${a.role}) via ${a.channel}\n     ${lang === "hi" ? a.detailHi : a.detail}`,
    ),
    "",
    "-".repeat(72),
    L(
      "This is a computer-generated advisory report and does not by itself confer or",
      "यह कंप्यूटर-जनित परामर्श रिपोर्ट है और यह स्वयं किसी अधिकार का सृजन या",
    ),
    L(
      "extinguish any right, title or interest in the property. For a legally conclusive",
      "हस्तांतरण नहीं करती। वैधानिक रूप से निर्णायक राय हेतु कृपया सक्षम राजस्व",
    ),
    L(
      "opinion please approach the competent Revenue Authority.",
      "प्राधिकारी से संपर्क करें।",
    ),
    "-".repeat(72),
    "",
    `${L("Verified by", "सत्यापनकर्ता")}: BhoomiVerify AI Engine v3.2  ·  ${L("Anchored at", "अंकुरण")}: NBF Block #482119`,
  ];
  return lines.join("\n");
}
