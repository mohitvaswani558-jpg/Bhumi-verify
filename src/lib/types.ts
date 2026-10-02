export type Verdict = "verified" | "review" | "flagged";

export interface SecurityCheck {
  id: string;
  label: string;
  labelHi: string;
  passed: boolean;
  detail: string;
  detailHi: string;
}

export interface ExtractedField {
  label: string;
  labelHi: string;
  value: string;
  confidence: number;
  /** where the value came from: engine OCR, the submitter's declaration, or the indexed record */
  source?: "ocr" | "declared" | "indexed" | "none";
}

export type FindingSeverity = "positive" | "info" | "warning" | "critical";

export interface KeyFinding {
  id: string;
  severity: FindingSeverity;
  title: string;
  titleHi: string;
  detail: string;
  detailHi: string;
}

export interface AiOpinion {
  recommendation: "approve" | "manual_review" | "reject";
  band: string;
  summary: string;
  summaryHi: string;
  reasoning: string[];
  reasoningHi: string[];
}

export type OfficerDecision = "approved" | "returned" | "rejected";

export interface OfficerReview {
  decision: OfficerDecision;
  remarks: string;
  officerName: string;
  officerRole: string;
  officerId: string;
  decidedAt: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  role: string;
  action: string;
  actionHi: string;
  detail: string;
  detailHi: string;
  channel: string;
}

export interface VerificationResult {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  docType: string;
  state: string;
  uploadedAt: string;
  confidence: number;
  verdict: Verdict;
  checks: SecurityCheck[];
  fields: ExtractedField[];
  risks: string[];
  risksHi: string[];
  processingMs: number;
  sha256: string;
  previewUrl?: string;
  /** exact owner name read by OCR from the document face */
  ownerName: string;
  ownerNameHi: string;
  /** "demo" = one of the six indexed sample records, "upload" = arbitrary file */
  source: "demo" | "upload";
  demoId?: string;
  keyFindings: KeyFinding[];
  aiOpinion: AiOpinion;
  officerReview?: OfficerReview;
  auditTrail: AuditEntry[];
}

/** Minimum characters required for any human feedback / remark. */
export const MIN_FEEDBACK_CHARS = 12;

export interface LandRecord {
  id: string;
  khasra: string;
  khata: string;
  owner: string;
  ownerHi: string;
  fatherName: string;
  village: string;
  tehsil: string;
  district: string;
  state: string;
  areaHa: number;
  landType: string;
  landTypeHi: string;
  irrigation: string;
  mutationNo: string;
  mutationStatus: "Approved" | "Pending" | "Rejected";
  mutationDate: string;
  encumbrance: "Clear" | "Mortgage" | "Litigation";
  taxPaid: boolean;
  lastUpdated: string;
  history: { date: string; event: string; from: string; to: string }[];
}

export interface Announcement {
  id: string;
  date: string;
  title: string;
  titleHi: string;
  category: "Circular" | "Tender" | "Notification" | "Recruitment" | "Advisory";
  body: string;
  isNew: boolean;
}

export interface RtiApplication {
  id: string;
  regNo: string;
  applicant: string;
  subject: string;
  filedOn: string;
  status: "Received" | "Under Review" | "Info Provided" | "Rejected";
  fee: number;
  timeline: { date: string; label: string; done: boolean }[];
}

export interface SupportTicket {
  id: string;
  ref: string;
  name: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface Session {
  name: string;
  identifier: string;
  role: "citizen" | "officer";
  method: string;
  loggedInAt: string;
}
