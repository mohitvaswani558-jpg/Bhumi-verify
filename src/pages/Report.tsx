import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Gavel,
  LayoutDashboard,
  Printer,
  RotateCcw,
  Save,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  XCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Badge, Button, cx } from "../components/ui";
import {
  AiOpinionPanel,
  AuditTrailPanel,
  KeyFindingsPanel,
  OfficerReviewPanel,
  type ResultUpdater,
} from "../components/ReviewPanels";
import { BhoomiLogo, NationalEmblem } from "../components/Emblems";
import { VERDICT_META, buildReportText, formatBytes, makeAuditEntry } from "../lib/verifyEngine";
import type { VerificationResult } from "../lib/types";
import NotFound from "./NotFound";

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function PreviewImage({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className="grid h-40 place-items-center rounded border border-dashed border-slate-300 bg-slate-50 px-3 text-center text-[0.72rem] text-slate-500 dark:border-white/15 dark:bg-white/5">
        Preview expired — the original file is not retained on our servers.
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
      className="max-h-80 w-full rounded border border-slate-300 object-contain dark:border-white/15"
    />
  );
}

function SectionHead({
  n,
  title,
  titleHi,
  icon: Icon,
}: {
  n: number;
  title: string;
  titleHi: string;
  icon: typeof ScrollText;
}) {
  const { lang } = useApp();
  return (
    <div className="mb-3 flex items-center gap-3 border-b-2 border-gov-800 pb-2">
      <span className="tabular grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gov-800 text-[0.78rem] font-extrabold text-white">
        {n}
      </span>
      <h2 className="flex items-center gap-2 text-[1rem] font-extrabold uppercase tracking-wide text-gov-900 dark:text-white">
        <Icon size={16} className="text-gov-600 dark:text-gov-300" aria-hidden />
        {lang === "hi" ? titleHi : title}
      </h2>
    </div>
  );
}

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    verifications,
    lastResult,
    setLastResult,
    updateVerification,
    addVerification,
    t,
    lang,
    toast,
    session,
  } = useApp();

  const decoded = id ? decodeURIComponent(id) : "";
  const r =
    verifications.find((v) => v.id === decoded) ??
    (lastResult && lastResult.id === decoded ? lastResult : null);

  if (!r) return <NotFound />;

  const onUpdate: ResultUpdater = (updater) => {
    const next = updater(r);
    setLastResult(next);
    if (verifications.some((v) => v.id === r.id)) updateVerification(r.id, next);
  };

  const saved = verifications.some((v) => v.id === r.id);
  const actorName = session?.name?.trim() || (lang === "hi" ? "अनाम नागरिक" : "Anonymous Citizen");
  const actorRole = session
    ? session.role === "officer"
      ? "Revenue Officer (authenticated)"
      : "Citizen (authenticated)"
    : "Citizen (unauthenticated)";

  const meta = VERDICT_META[r.verdict];
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);
  const VerdictIcon =
    r.verdict === "verified" ? ShieldCheck : r.verdict === "review" ? AlertTriangle : ShieldAlert;

  const generated = new Date(r.uploadedAt);
  const ocrField = r.fields.find((f) => f.label === "Record Holder / Owner");

  const metaRows: [string, string][] = [
    [L("Reference ID", "संदर्भ आईडी"), r.id],
    [
      L("Generated On", "निर्माण तिथि"),
      generated.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN"),
    ],
    [
      L("Report Source", "रिपोर्ट स्रोत"),
      r.source === "demo"
        ? L("Indexed sample document", "अनुक्रमित नमूना दस्तावेज़")
        : L("User upload", "उपयोगकर्ता अपलोड"),
    ],
    [L("File Name", "फ़ाइल नाम"), r.fileName],
    [L("File Size", "फ़ाइल आकार"), formatBytes(r.fileSize)],
    [L("MIME Type", "एमआईएमई प्रकार"), r.fileType],
    [L("Declared Document Type", "घोषित दस्तावेज़ प्रकार"), r.docType],
    [L("Declared State", "घोषित राज्य"), r.state],
    [L("Processing Time", "प्रसंस्करण समय"), `${(r.processingMs / 1000).toFixed(2)} s`],
    [L("Engine", "इंजन"), "BhoomiVerify AI v3.2 · Tesseract.js 7 (eng)"],
    [L("SHA-256 Digest", "SHA-256 डाइजेस्ट"), r.sha256],
    [L("Blockchain Anchor", "ब्लॉकचेन अंकुर"), "NBF Block #4,82,119"],
  ];

  return (
    <>
      {/* ---------------------------- toolbar ---------------------------- */}
      <div className="no-print sticky top-[3.25rem] z-30 border-b border-gov-900/40 bg-gov-800 shadow-md dark:bg-gov-950">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/verify")}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[0.78rem] font-bold text-gov-100 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={15} /> {L("Verify another", "और सत्यापित करें")}
          </button>
          <span className="tabular hidden rounded bg-white/12 px-2.5 py-1.5 text-[0.74rem] font-bold text-white sm:inline">
            {r.id}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => window.print()}>
              <Printer size={14} /> {t("c.print")}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                downloadText(
                  `BhoomiVerify-Report-${r.id.replace(/\//g, "-")}.txt`,
                  buildReportText(r, lang),
                );
                onUpdate((prev) => ({
                  ...prev,
                  auditTrail: [
                    ...prev.auditTrail,
                    makeAuditEntry(
                      actorName,
                      actorRole,
                      "REPORT_DOWNLOADED",
                      "रिपोर्ट डाउनलोड की गई",
                      `Full page verification report for ${prev.id} downloaded as a text file.`,
                      `${prev.id} की पूर्ण-पृष्ठ सत्यापन रिपोर्ट पाठ फ़ाइल के रूप में डाउनलोड की गई।`,
                    ),
                  ],
                }));
                toast(L("Report downloaded", "रिपोर्ट डाउनलोड हुई"));
              }}
            >
              <Download size={14} /> {t("v.report")}
            </Button>
            {!saved ? (
              <Button
                size="sm"
                onClick={() => {
                  const stamped: VerificationResult = {
                    ...r,
                    auditTrail: [
                      ...r.auditTrail,
                      makeAuditEntry(
                        actorName,
                        actorRole,
                        "REPORT_SAVED_TO_DASHBOARD",
                        "रिपोर्ट डैशबोर्ड में सहेजी गई",
                        `Report ${r.id} persisted to the user's dashboard for later officer review.`,
                        `रिपोर्ट ${r.id} बाद में अधिकारी समीक्षा हेतु डैशबोर्ड में सहेजी गई।`,
                      ),
                    ],
                  };
                  addVerification(stamped);
                  setLastResult(stamped);
                  toast(L("Saved to your dashboard", "डैशबोर्ड में सहेजा गया"));
                }}
              >
                <Save size={14} /> {t("v.save")}
              </Button>
            ) : (
              <Badge tone="green">
                <CheckCircle2 size={11} /> {L("Saved", "सहेजा गया")}
              </Badge>
            )}
            <Button size="sm" variant="outline" onClick={() => navigate("/verify")}>
              <RotateCcw size={14} /> {t("v.another")}
            </Button>
          </div>
        </div>
      </div>

      {/* ------------------------- report sheet ------------------------- */}
      <article className="mx-auto max-w-[1080px] px-3 py-7 sm:px-6">
        <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-[0_2px_14px_rgba(15,23,42,0.08)] print:border-0 print:shadow-none dark:border-white/15 dark:bg-gov-950">
          {/* letterhead */}
          <header className="px-6 pt-6 sm:px-9 sm:pt-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <NationalEmblem className="h-16 w-auto" />
                <div className="leading-tight">
                  <p className="text-[0.95rem] font-bold text-slate-900 dark:text-white" lang="hi">
                    भारत सरकार
                  </p>
                  <p className="text-[0.88rem] font-semibold text-slate-700 dark:text-slate-200">
                    {t("gov.india")}
                  </p>
                  <p className="mt-0.5 text-[0.7rem] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("gov.dept")}
                  </p>
                  <p className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("gov.ministry")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right leading-tight">
                  <p className="text-[0.95rem] font-extrabold tracking-tight text-gov-800 dark:text-white">
                    {L("Bhoomi Verify AI", "भूमि सत्यापन एआई")}
                  </p>
                  <p className="tabular text-[0.7rem] font-bold text-slate-500 dark:text-slate-400">
                    {r.id}
                  </p>
                  <p className="tabular text-[0.7rem] text-slate-500 dark:text-slate-400">
                    {generated.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <BhoomiLogo className="h-14 w-14" />
              </div>
            </div>

            <div className="mt-4 flex h-1 w-full" aria-hidden>
              <span className="flex-1 bg-[#e07b00]" />
              <span className="flex-1 bg-slate-200" />
              <span className="flex-1 bg-[#138808]" />
            </div>

            <div className="mt-5 text-center">
              <h1 className="text-[1.35rem] font-extrabold uppercase tracking-[0.06em] text-gov-900 dark:text-white sm:text-[1.55rem]">
                {L("Document Verification Report", "दस्तावेज़ सत्यापन रिपोर्ट")}
              </h1>
              <p className="mt-1 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {L(
                  "AI Forensic Analysis · Cadastral Cross-Verification · Officer Adjudication",
                  "एआई फ़ोरेंसिक विश्लेषण · भू-अभिलेख क्रॉस-सत्यापन · अधिकारी निर्णय",
                )}
              </p>
            </div>
          </header>

          {/* verdict band */}
          <div
            className={cx(
              "mx-6 mt-6 flex flex-wrap items-center gap-4 rounded-md border-2 px-5 py-4 sm:mx-9",
              r.verdict === "verified"
                ? "border-leaf-500/50 bg-leaf-500/10"
                : r.verdict === "review"
                  ? "border-saffron-500/50 bg-saffron-500/10"
                  : "border-red-500/50 bg-red-500/10",
            )}
          >
            <span
              className={cx(
                "grid h-16 w-16 shrink-0 place-items-center rounded-full text-white shadow-lg",
                r.verdict === "verified"
                  ? "bg-leaf-600"
                  : r.verdict === "review"
                    ? "bg-saffron-500"
                    : "bg-red-600",
              )}
            >
              <VerdictIcon size={32} />
            </span>
            <div className="min-w-0">
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                {L("Final AI Verdict", "अंतिम एआई निर्णय")}
              </p>
              <p className={cx("text-3xl font-extrabold leading-tight tracking-tight", meta.color)}>
                {lang === "hi" ? meta.hi : meta.en}
              </p>
              <p className="mt-0.5 text-[0.78rem] text-slate-600 dark:text-slate-300">
                {L("Authenticity confidence", "प्रामाणिकता विश्वास")}{" "}
                <strong className="tabular">{r.confidence.toFixed(1)}%</strong> ·{" "}
                {L("AI recommends", "एआई अनुशंसा")}{" "}
                <strong>
                  {r.aiOpinion.recommendation === "approve"
                    ? L("Approval", "स्वीकृति")
                    : r.aiOpinion.recommendation === "reject"
                      ? L("Rejection", "अस्वीकृति")
                      : L("Manual review", "मानव समीक्षा")}
                </strong>{" "}
                · {L("Human review", "मानव समीक्षा")}{" "}
                <strong>
                  {r.officerReview
                    ? r.officerReview.decision.toUpperCase()
                    : L("PENDING", "प्रतीक्षित")}
                </strong>
              </p>
            </div>
            <div className="ml-auto hidden text-right sm:block">
              <p className="text-[0.66rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {L("Checks passed", "जाँच पास")}
              </p>
              <p className="tabular text-2xl font-extrabold text-gov-900 dark:text-white">
                {r.checks.filter((c) => c.passed).length}
                <span className="text-base text-slate-400">/{r.checks.length}</span>
              </p>
            </div>
          </div>

          {/* body */}
          <div className="space-y-8 px-6 py-7 sm:px-9">
            {/* 1 — record holder & document */}
            <section>
              <SectionHead n={1} title="Record Holder & Submitted Document" titleHi="खातेदार एवं प्रस्तुत दस्तावेज़" icon={FileText} />
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_15rem]">
                <div>
                  <div className="rounded-md border-2 border-gov-200 bg-gov-50/60 p-4 dark:border-gov-700 dark:bg-gov-900/40">
                    <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      {L("Record holder read from the document", "दस्तावेज़ से पढ़ा गया खातेदार")}
                    </p>
                    <p className="mt-1 text-[1.4rem] font-extrabold leading-tight text-gov-900 dark:text-white">
                      {lang === "hi" ? r.ownerNameHi : r.ownerName}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge tone={ocrField?.source === "ocr" ? "green" : ocrField?.source === "indexed" ? "blue" : "amber"}>
                        {ocrField?.source === "ocr"
                          ? L("OCR-confirmed", "ओसीआर-पुष्ट")
                          : ocrField?.source === "indexed"
                            ? L("Indexed ground truth", "अनुक्रमित ग्राउंड ट्रुथ")
                            : L("Declared by submitter", "प्रस्तुतकर्ता द्वारा घोषित")}
                      </Badge>
                      {ocrField && ocrField.confidence > 0 ? (
                        <Badge tone="neutral">
                          {L("Field confidence", "फ़ील्ड विश्वास")} {ocrField.confidence}%
                        </Badge>
                      ) : null}
                      <Badge tone={r.source === "demo" ? "blue" : "neutral"}>
                        {r.source === "demo"
                          ? L("Sample document", "नमूना दस्तावेज़")
                          : L("User upload", "उपयोगकर्ता अपलोड")}
                      </Badge>
                    </p>
                  </div>

                  <dl className="mt-4 grid gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 sm:grid-cols-2 dark:border-white/10 dark:bg-white/10">
                    {metaRows.map(([k, v]) => (
                      <div key={k} className="bg-white px-3.5 py-2.5 dark:bg-gov-950">
                        <dt className="text-[0.64rem] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {k}
                        </dt>
                        <dd
                          className={cx(
                            "mt-0.5 text-[0.8rem] font-semibold text-slate-900 dark:text-slate-100",
                            v.length > 40 && "break-all font-mono text-[0.68rem]",
                          )}
                        >
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div>
                  <p className="mb-1.5 text-[0.66rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {L("Submitted scan", "प्रस्तुत स्कैन")}
                  </p>
                  {r.previewUrl ? (
                    <PreviewImage src={r.previewUrl} alt={r.fileName} />
                  ) : (
                    <div className="grid h-40 place-items-center rounded border border-dashed border-slate-300 bg-slate-50 px-3 text-center text-[0.72rem] text-slate-500 dark:border-white/15 dark:bg-white/5">
                      {L(
                        "No preview retained for this submission.",
                        "इस प्रस्तुति हेतु कोई पूर्वावलोकन सुरक्षित नहीं।",
                      )}
                    </div>
                  )}
                  <p className="mt-2 break-all text-[0.7rem] font-semibold text-slate-600 dark:text-slate-300">
                    {r.fileName}
                  </p>
                  <p className="tabular text-[0.68rem] text-slate-500 dark:text-slate-400">
                    {formatBytes(r.fileSize)} · {r.fileType}
                  </p>
                </div>
              </div>
            </section>

            {/* 2 — key findings */}
            <section>
              <SectionHead n={2} title="Key Findings" titleHi="मुख्य निष्कर्ष" icon={ScrollText} />
              <KeyFindingsPanel result={r} />
            </section>

            {/* 3 — AI opinion */}
            <section>
              <SectionHead n={3} title="AI Opinion" titleHi="एआई राय" icon={ShieldAlert} />
              <AiOpinionPanel result={r} />
            </section>

            {/* 4 — forensic checks */}
            <section>
              <SectionHead n={4} title="Forensic Security Checks" titleHi="फ़ोरेंसिक सुरक्षा जाँच" icon={ShieldCheck} />
              <ul className="space-y-2">
                {r.checks.map((c) => (
                  <li
                    key={c.id}
                    className={cx(
                      "rounded-md border px-4 py-3",
                      c.passed ? "border-leaf-500/30 bg-leaf-500/5" : "border-red-500/30 bg-red-500/5",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {c.passed ? (
                        <CheckCircle2 size={16} className="shrink-0 text-leaf-600" aria-hidden />
                      ) : (
                        <XCircle size={16} className="shrink-0 text-red-600" aria-hidden />
                      )}
                      <span className="text-[0.85rem] font-bold text-slate-800 dark:text-slate-100">
                        {lang === "hi" ? c.labelHi : c.label}
                      </span>
                      <span
                        className={cx(
                          "ml-auto text-[0.64rem] font-extrabold uppercase tracking-wider",
                          c.passed ? "text-leaf-600 dark:text-leaf-400" : "text-red-600 dark:text-red-400",
                        )}
                      >
                        {c.passed ? "PASS" : "FAIL"}
                      </span>
                    </div>
                    <p className="mt-1 pl-7 text-[0.78rem] leading-relaxed text-slate-600 dark:text-slate-300">
                      {lang === "hi" ? c.detailHi : c.detail}
                    </p>
                  </li>
                ))}
              </ul>

              {r.risks.length ? (
                <div className="mt-4 rounded-md border border-saffron-500/40 bg-saffron-500/8 p-4">
                  <h3 className="flex items-center gap-2 text-[0.85rem] font-bold text-saffron-600 dark:text-saffron-400">
                    <AlertTriangle size={15} aria-hidden /> {t("v.risk")}
                  </h3>
                  <ul className="mt-2 space-y-1.5">
                    {(lang === "hi" ? r.risksHi : r.risks).map((x, i) => (
                      <li key={i} className="flex gap-2 text-[0.8rem] text-slate-700 dark:text-slate-200">
                        <span className="font-bold text-saffron-600">{i + 1}.</span>
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>

            {/* 5 — extracted fields */}
            <section>
              <SectionHead n={5} title="Extracted Fields (OCR)" titleHi="निकाले गए फ़ील्ड (ओसीआर)" icon={FileText} />
              <div className="overflow-hidden rounded-md border border-slate-200 dark:border-white/10">
                <table className="w-full text-left text-[0.82rem]">
                  <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                    {r.fields.map((f) => (
                      <tr
                        key={f.label}
                        className="odd:bg-slate-50 even:bg-white dark:odd:bg-white/5 dark:even:bg-transparent"
                      >
                        <th
                          scope="row"
                          className="w-[34%] px-4 py-2.5 align-top text-[0.76rem] font-semibold text-slate-600 dark:text-slate-300"
                        >
                          {lang === "hi" ? f.labelHi : f.label}
                        </th>
                        <td className="px-4 py-2.5 align-top font-medium text-slate-900 dark:text-slate-100">
                          {f.value}
                          {f.source && f.source !== "none" ? (
                            <span
                              className={cx(
                                "ml-2 rounded border px-1 py-px text-[0.56rem] font-extrabold uppercase tracking-wider align-middle",
                                f.source === "ocr"
                                  ? "border-leaf-500/40 bg-leaf-500/10 text-leaf-700 dark:text-leaf-400"
                                  : f.source === "indexed"
                                    ? "border-gov-400/40 bg-gov-500/10 text-gov-700 dark:text-gov-300"
                                    : "border-saffron-500/40 bg-saffron-500/10 text-saffron-600 dark:text-saffron-400",
                              )}
                            >
                              {f.source}
                            </span>
                          ) : null}
                          {f.confidence > 0 ? (
                            <span className="tabular ml-2 text-[0.66rem] font-bold text-leaf-600 dark:text-leaf-400">
                              {f.confidence}%
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 6 — officer final review */}
            <section>
              <SectionHead n={6} title="Officer Final Review" titleHi="अधिकारी अंतिम समीक्षा" icon={Gavel} />
              <OfficerReviewPanel result={r} onUpdate={onUpdate} />
            </section>

            {/* 7 — audit trail */}
            <section>
              <SectionHead n={7} title="Audit Trail" titleHi="ऑडिट ट्रेल" icon={ScrollText} />
              <AuditTrailPanel result={r} />
            </section>

            {/* advisory + signature */}
            <section className="rounded-md border border-gov-200 bg-gov-50/60 p-5 dark:border-gov-700 dark:bg-gov-900/40">
              <h3 className="text-[0.8rem] font-extrabold uppercase tracking-wider text-gov-800 dark:text-gov-200">
                {L("Advisory & Limitation", "परामर्श एवं सीमा")}
              </h3>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-slate-600 dark:text-slate-300">
                {L(
                  "This is a computer-generated advisory report produced by the BhoomiVerify AI engine. It does not by itself confer or extinguish any right, title or interest in the property. The binding decision on a land record rests with the competent Revenue Officer, whose adjudication is recorded in Section 6 and immutably logged in Section 7. For a legally conclusive opinion please approach the competent Revenue Authority.",
                  "यह भूमि सत्यापन एआई इंजन द्वारा निर्मित कंप्यूटर-जनित परामर्श रिपोर्ट है। यह स्वयं किसी अधिकार, स्वामित्व या हित का सृजन या हनन नहीं करती। भूमि अभिलेख पर बाध्यकारी निर्णय सक्षम राजस्व अधिकारी का होता है, जिसका निर्णय अनुभाग 6 में दर्ज और अनुभाग 7 में अपरिवर्तनीय रूप से लॉग होता है। वैधानिक रूप से निर्णायक राय हेतु कृपया सक्षम राजस्व प्राधिकारी से संपर्क करें।",
                )}
              </p>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
                <div className="text-[0.72rem] text-slate-500 dark:text-slate-400">
                  <p className="tabular font-mono break-all">
                    SHA-256: {r.sha256}
                  </p>
                  <p className="mt-1">
                    {L("Anchored at", "अंकुरण")}: National Blockchain Framework · Block #4,82,119
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto h-10 w-44 border-b border-slate-400" />
                  <p className="mt-1.5 text-[0.72rem] font-bold text-slate-700 dark:text-slate-200">
                    {r.officerReview ? r.officerReview.officerName : L("Revenue Officer", "राजस्व अधिकारी")}
                  </p>
                  <p className="text-[0.66rem] text-slate-500 dark:text-slate-400">
                    {L("Competent Authority · Dept. of Land Resources", "सक्षम प्राधिकारी · भूमि संसाधन विभाग")}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* sheet footer */}
          <footer className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-center dark:border-white/10 dark:bg-white/5 sm:px-9">
            <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
              {L(
                "BhoomiVerify AI · Department of Land Resources, Ministry of Rural Development, Government of India · Hosted by NIC",
                "भूमि सत्यापन एआई · भूमि संसाधन विभाग, ग्रामीण विकास मंत्रालय, भारत सरकार · एनआईसी द्वारा होस्टेड",
              )}
            </p>
            <p className="tabular mt-1 text-[0.68rem] font-semibold text-slate-400">
              {r.id} · {L("Page 1 of 1", "पृष्ठ 1 / 1")} ·{" "}
              {L("Computer generated — no manual signature required", "कंप्यूटर जनित — हस्त हस्ताक्षर आवश्यक नहीं")}
            </p>
          </footer>
        </div>

        <div className="no-print mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/verify">
            <Button variant="secondary">
              <RotateCcw size={16} /> {t("v.another")}
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary">
              <LayoutDashboard size={16} /> {t("nav.dashboard")}
            </Button>
          </Link>
          <p className="self-center rounded-md border border-slate-200 bg-white px-4 py-2.5 text-[0.78rem] text-slate-600 dark:border-white/10 dark:bg-gov-950/70 dark:text-slate-300">
            {L(
              "This full page report is generated only for the document you just verified.",
              "यह पूर्ण-पृष्ठ रिपोर्ट केवल आपके अभी सत्यापित दस्तावेज़ हेतु बनाई गई है।",
            )}
          </p>
        </div>
      </article>
    </>
  );
}
