import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Bot,
  CheckCircle2,
  ChevronDown,
  Download,
  Gavel,
  History,
  Info,
  Lock,
  RotateCcw,
  ScrollText,
  ShieldCheck,
  ShieldX,
  UserCog,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Badge, Button, Card, CardHeader, FieldError, Textarea, cx } from "./ui";
import { makeAuditEntry } from "../lib/verifyEngine";
import { MIN_FEEDBACK_CHARS, type OfficerDecision, type VerificationResult } from "../lib/types";

export type ResultUpdater = (
  updater: (prev: VerificationResult) => VerificationResult,
) => void;

/* ------------------------------------------------------------------ */
/*  1. KEY FINDINGS                                                    */
/* ------------------------------------------------------------------ */

const SEV = {
  positive: {
    icon: CheckCircle2,
    tone: "border-leaf-500/35 bg-leaf-500/8 text-leaf-700 dark:text-leaf-400",
    dot: "bg-leaf-500",
  },
  info: {
    icon: Info,
    tone: "border-gov-400/35 bg-gov-500/8 text-gov-700 dark:text-gov-300",
    dot: "bg-gov-500",
  },
  warning: {
    icon: AlertTriangle,
    tone: "border-saffron-500/40 bg-saffron-500/8 text-saffron-600 dark:text-saffron-400",
    dot: "bg-saffron-500",
  },
  critical: {
    icon: ShieldX,
    tone: "border-red-500/40 bg-red-500/8 text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
} as const;

export function KeyFindingsPanel({ result }: { result: VerificationResult }) {
  const { lang } = useApp();
  const counts = useMemo(() => {
    const c = { positive: 0, info: 0, warning: 0, critical: 0 };
    result.keyFindings.forEach((f) => (c[f.severity] += 1));
    return c;
  }, [result.keyFindings]);

  return (
    <Card>
      <CardHeader
        title={lang === "hi" ? "मुख्य निष्कर्ष" : "Key Findings"}
        icon={<ScrollText size={15} />}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            {(["critical", "warning", "positive", "info"] as const).map((s) =>
              counts[s] ? (
                <span
                  key={s}
                  className={cx(
                    "tabular rounded border px-1.5 py-0.5 text-[0.64rem] font-extrabold uppercase tracking-wide",
                    SEV[s].tone,
                  )}
                >
                  {counts[s]} {s}
                </span>
              ) : null,
            )}
          </div>
        }
      />
      <ul className="divide-y divide-slate-100 dark:divide-white/5">
        {result.keyFindings.map((f, i) => {
          const s = SEV[f.severity];
          const Icon = s.icon;
          return (
            <li key={f.id} className="flex gap-3.5 px-5 py-4">
              <span
                className={cx(
                  "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border",
                  s.tone,
                )}
              >
                <Icon size={14} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-2 text-[0.88rem] font-bold text-slate-800 dark:text-slate-100">
                  <span className="tabular text-[0.68rem] font-extrabold text-slate-400">
                    F{String(i + 1).padStart(2, "0")}
                  </span>
                  {lang === "hi" ? f.titleHi : f.title}
                </p>
                <p className="mt-1 text-[0.8rem] leading-relaxed text-slate-600 dark:text-slate-300">
                  {lang === "hi" ? f.detailHi : f.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  2. AI OPINION                                                      */
/* ------------------------------------------------------------------ */

export function AiOpinionPanel({ result }: { result: VerificationResult }) {
  const { lang } = useApp();
  const o = result.aiOpinion;

  const valid = useMemo(() => {
    const list: string[] = [];
    result.checks
      .filter((c) => c.passed)
      .forEach((c) => list.push(lang === "hi" ? c.labelHi : c.label));
    result.keyFindings
      .filter((f) => f.severity === "positive")
      .forEach((f) => list.push(lang === "hi" ? f.titleHi : f.title));
    return Array.from(new Set(list)).slice(0, 8);
  }, [result, lang]);

  const complaints = useMemo(() => {
    const list: string[] = [];
    result.checks
      .filter((c) => !c.passed)
      .forEach((c) => list.push(`${lang === "hi" ? c.labelHi : c.label} — ${lang === "hi" ? c.detailHi : c.detail}`));
    (lang === "hi" ? result.risksHi : result.risks).forEach((r) => list.push(r));
    result.keyFindings
      .filter((f) => f.severity === "warning" || f.severity === "critical")
      .forEach((f) => list.push(lang === "hi" ? f.titleHi : f.title));
    return Array.from(new Set(list)).slice(0, 8);
  }, [result, lang]);
  const rec =
    o.recommendation === "approve"
      ? { label: lang === "hi" ? "स्वीकृति की अनुशंसा" : "Recommend approval", cls: "bg-leaf-600", Icon: BadgeCheck }
      : o.recommendation === "reject"
        ? { label: lang === "hi" ? "अस्वीकृति की अनुशंसा" : "Recommend rejection", cls: "bg-red-600", Icon: ShieldX }
        : {
            label: lang === "hi" ? "मानव समीक्षा अनुशंसित" : "Manual review advised",
            cls: "bg-saffron-500",
            Icon: AlertTriangle,
          };

  return (
    <Card>
      <CardHeader
        title={lang === "hi" ? "एआई राय" : "AI Opinion"}
        icon={<Bot size={15} />}
        action={<Badge tone="blue">{o.band}</Badge>}
      />
      <div className="p-5">
        <div className={cx("flex items-start gap-3 rounded-md p-4 text-white shadow", rec.cls)}>
          <rec.Icon size={22} className="mt-0.5 shrink-0" aria-hidden />
          <div>
            <p className="text-[0.95rem] font-extrabold tracking-tight">{rec.label}</p>
            <p className="tabular mt-0.5 text-[0.72rem] uppercase tracking-wider opacity-90">
              {lang === "hi" ? "विश्वास स्तर" : "Confidence"} {result.confidence.toFixed(1)}% ·{" "}
              {lang === "hi" ? "निर्णय" : "Verdict"}{" "}
              {result.verdict === "verified"
                ? lang === "hi"
                  ? "सत्यापित"
                  : "VERIFIED"
                : result.verdict === "review"
                  ? lang === "hi"
                    ? "समीक्षा आवश्यक"
                    : "NEEDS REVIEW"
                  : lang === "hi"
                    ? "चिह्नित"
                    : "FLAGGED"}
            </p>
          </div>
        </div>

        <p className="mt-4 text-[0.85rem] leading-relaxed text-slate-700 dark:text-slate-200">
          {lang === "hi" ? o.summaryHi : o.summary}
        </p>

        <h4 className="mt-5 text-[0.72rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {lang === "hi" ? "तर्क" : "Reasoning"}
        </h4>
        <ul className="mt-2 space-y-1.5">
          {(lang === "hi" ? o.reasoningHi : o.reasoning).map((x, i) => (
            <li key={i} className="flex gap-2 text-[0.82rem] text-slate-600 dark:text-slate-300">
              <span className="tabular mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-gov-700 text-[0.6rem] font-bold text-white">
                {i + 1}
              </span>
              {x}
            </li>
          ))}
        </ul>

        {/* valid vs complaints */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-leaf-500/35 bg-leaf-500/6 p-3.5">
            <p className="flex items-center gap-1.5 text-[0.72rem] font-extrabold uppercase tracking-wider text-leaf-700 dark:text-leaf-400">
              <CheckCircle2 size={13} aria-hidden />
              {lang === "hi" ? "वैध / पुष्ट बिंदु" : "Valid / corroborated"} ({valid.length})
            </p>
            {valid.length ? (
              <ul className="mt-2 space-y-1.5">
                {valid.map((v, i) => (
                  <li key={i} className="flex gap-1.5 text-[0.78rem] leading-snug text-slate-700 dark:text-slate-200">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-leaf-500" />
                    {v}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[0.78rem] text-slate-500 dark:text-slate-400">
                {lang === "hi" ? "कोई वैध बिंदु नहीं मिला।" : "Nothing on this document could be corroborated."}
              </p>
            )}
          </div>

          <div className="rounded-md border border-red-500/35 bg-red-500/6 p-3.5">
            <p className="flex items-center gap-1.5 text-[0.72rem] font-extrabold uppercase tracking-wider text-red-700 dark:text-red-400">
              <AlertTriangle size={13} aria-hidden />
              {lang === "hi" ? "आपत्तियाँ / विसंगतियाँ" : "Complaints / exceptions"} ({complaints.length})
            </p>
            {complaints.length ? (
              <ul className="mt-2 space-y-1.5">
                {complaints.map((v, i) => (
                  <li key={i} className="flex gap-1.5 text-[0.78rem] leading-snug text-slate-700 dark:text-slate-200">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-500" />
                    {v}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[0.78rem] text-slate-500 dark:text-slate-400">
                {lang === "hi" ? "कोई आपत्ति या विसंगति नहीं पाई गई।" : "No complaint or exception was raised against this document."}
              </p>
            )}
          </div>
        </div>

        <p className="mt-5 flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[0.72rem] leading-relaxed text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          <Lock size={13} className="mt-0.5 shrink-0" aria-hidden />
          {lang === "hi"
            ? "एआई राय परामर्श स्वरूप है। अंतिम निर्णय सक्षम राजस्व अधिकारी द्वारा नीचे दिए गए समीक्षा पैनल में दर्ज किया जाना चाहिए।"
            : "The AI opinion is advisory. The binding decision must be recorded by a competent Revenue Officer in the review panel below."}
        </p>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  3. OFFICER FINAL REVIEW                                            */
/* ------------------------------------------------------------------ */

const DECISIONS: {
  id: OfficerDecision;
  en: string;
  hi: string;
  hint: string;
  hintHi: string;
  cls: string;
  Icon: typeof CheckCircle2;
}[] = [
  {
    id: "approved",
    en: "Approve & confirm record",
    hi: "स्वीकृत करें एवं अभिलेख पुष्ट करें",
    hint: "The land record details are accepted as genuine.",
    hintHi: "भूमि अभिलेख विवरण प्रामाणिक के रूप में स्वीकार किए जाते हैं।",
    cls: "border-leaf-500 bg-leaf-500/10 text-leaf-700 dark:text-leaf-400",
    Icon: CheckCircle2,
  },
  {
    id: "returned",
    en: "Return for correction",
    hi: "सुधार हेतु वापस करें",
    hint: "Send back to the applicant / Tehsil for clarification.",
    hintHi: "स्पष्टीकरण हेतु आवेदक / तहसील को वापस भेजें।",
    cls: "border-saffron-500 bg-saffron-500/10 text-saffron-600 dark:text-saffron-400",
    Icon: RotateCcw,
  },
  {
    id: "rejected",
    en: "Reject the document",
    hi: "दस्तावेज़ अस्वीकार करें",
    hint: "Record as forged / inadmissible and escalate.",
    hintHi: "जाली / अग्राह्य के रूप में दर्ज करें और अग्रसर करें।",
    cls: "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400",
    Icon: ShieldX,
  },
];

export function OfficerReviewPanel({
  result,
  onUpdate,
}: {
  result: VerificationResult;
  onUpdate: ResultUpdater;
}) {
  const { lang, toast, session } = useApp();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const [decision, setDecision] = useState<OfficerDecision>(
    result.officerReview?.decision ??
      (result.aiOpinion.recommendation === "approve"
        ? "approved"
        : result.aiOpinion.recommendation === "reject"
          ? "rejected"
          : "returned"),
  );
  const [remarks, setRemarks] = useState(result.officerReview?.remarks ?? "");
  const [officerId, setOfficerId] = useState(
    result.officerReview?.officerId ??
      (session?.role === "officer" ? "DLR-OFC-4471" : "DLR-OFC-0000"),
  );
  const [error, setError] = useState<string | null>(null);
  const [amending, setAmending] = useState(false);

  const remaining = MIN_FEEDBACK_CHARS - remarks.trim().length;
  const editing = !result.officerReview || amending;

  const submit = () => {
    if (remarks.trim().length < MIN_FEEDBACK_CHARS) {
      setError(
        L(
          `Feedback must be at least ${MIN_FEEDBACK_CHARS} characters — ${remaining} more required.`,
          `टिप्पणी कम से कम ${MIN_FEEDBACK_CHARS} अक्षरों की होनी चाहिए — ${remaining} और आवश्यक।`,
        ),
      );
      toast(
        L(
          `Feedback too short (minimum ${MIN_FEEDBACK_CHARS} characters)`,
          `टिप्पणी बहुत छोटी है (न्यूनतम ${MIN_FEEDBACK_CHARS} अक्षर)`,
        ),
        "error",
      );
      return;
    }
    setError(null);

    const officerName =
      session?.name?.trim() || L("Guest Revenue Officer", "अतिथि राजस्व अधिकारी");
    const officerRole = session
      ? session.role === "officer"
        ? L("Revenue Officer (authenticated)", "राजस्व अधिकारी (प्रमाणित)")
        : L("Citizen acting as reviewing officer", "समीक्षा अधिकारी के रूप में नागरिक")
      : L("Guest Revenue Officer (unauthenticated)", "अतिथि राजस्व अधिकारी (अप्रमाणित)");

    const isAmend = !!result.officerReview;
    const review = {
      decision,
      remarks: remarks.trim(),
      officerName,
      officerRole,
      officerId: officerId.trim() || "DLR-OFC-0000",
      decidedAt: new Date().toISOString(),
    };

    onUpdate((prev) => ({
      ...prev,
      officerReview: review,
      auditTrail: [
        ...prev.auditTrail,
        makeAuditEntry(
          officerName,
          officerRole,
          isAmend ? "REVIEW_AMENDED" : "OFFICER_DECISION_RECORDED",
          isAmend ? "समीक्षा संशोधित" : "अधिकारी निर्णय दर्ज",
          `Decision: ${decision.toUpperCase()} on reference ${prev.id}. Officer ID ${review.officerId}. Feedback (${review.remarks.length} chars): “${review.remarks}”`,
          `निर्णय: संदर्भ ${prev.id} पर ${decision.toUpperCase()}। अधिकारी आईडी ${review.officerId}। टिप्पणी (${review.remarks.length} अक्षर): “${review.remarks}”`,
          "Officer Review Console",
        ),
      ],
    }));

    setAmending(false);
    toast(
      isAmend
        ? L("Review amended and audit trail updated", "समीक्षा संशोधित एवं ऑडिट ट्रेल अद्यतन")
        : L("Final review recorded in the audit trail", "अंतिम समीक्षा ऑडिट ट्रेल में दर्ज"),
    );
  };

  const rv = result.officerReview;

  return (
    <Card>
      <CardHeader
        title={L("Officer Final Review", "अधिकारी अंतिम समीक्षा")}
        icon={<Gavel size={15} />}
        action={
          rv ? (
            <Badge tone={rv.decision === "approved" ? "green" : rv.decision === "returned" ? "amber" : "red"}>
              <UserCog size={11} />
              {rv.decision.toUpperCase()}
            </Badge>
          ) : (
            <Badge tone="neutral">{L("Awaiting decision", "निर्णय प्रतीक्षित")}</Badge>
          )
        }
      />

      {rv && !amending ? (
        <div className="p-5">
          <div
            className={cx(
              "rounded-md border p-4",
              rv.decision === "approved"
                ? "border-leaf-500/40 bg-leaf-500/8"
                : rv.decision === "returned"
                  ? "border-saffron-500/40 bg-saffron-500/8"
                  : "border-red-500/40 bg-red-500/8",
            )}
          >
            <p className="flex flex-wrap items-center gap-2 text-[0.95rem] font-extrabold text-gov-900 dark:text-white">
              <Gavel size={17} className="text-gov-600" aria-hidden />
              {DECISIONS.find((d) => d.id === rv.decision)?.[lang === "hi" ? "hi" : "en"]}
            </p>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-slate-700 dark:text-slate-200">
              <span className="font-bold">{L("Feedback", "टिप्पणी")}:</span> “{rv.remarks}”
            </p>
            <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-[0.76rem] sm:grid-cols-2">
              {[
                [L("Officer", "अधिकारी"), rv.officerName],
                [L("Officer ID", "अधिकारी आईडी"), rv.officerId],
                [L("Role", "भूमिका"), rv.officerRole],
                [
                  L("Decided on", "निर्णय तिथि"),
                  new Date(rv.decidedAt).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN"),
                ],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="shrink-0 text-slate-500 dark:text-slate-400">{k}:</dt>
                  <dd className="font-semibold text-slate-800 dark:text-slate-100">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {!session ? (
            <p className="mt-3 flex items-start gap-2 rounded-md border border-saffron-500/40 bg-saffron-500/8 px-3.5 py-2.5 text-[0.74rem] text-slate-600 dark:text-slate-300">
              <AlertTriangle size={14} className="mt-0.5 shrink-0 text-saffron-500" aria-hidden />
              {L(
                "This decision was recorded without an authenticated officer session. Sign in to attribute it to your account.",
                "यह निर्णय बिना प्रमाणित अधिकारी सत्र के दर्ज हुआ। अपने खाते से जोड़ने हेतु साइन इन करें।",
              )}
            </p>
          ) : null}

          <Button variant="secondary" className="mt-4" onClick={() => setAmending(true)}>
            <RotateCcw size={15} /> {L("Amend review", "समीक्षा संशोधित करें")}
          </Button>
        </div>
      ) : (
        <div className="space-y-4 p-5">
          {!session ? (
            <p className="flex items-start gap-2 rounded-md border border-gov-300 bg-gov-50/70 px-3.5 py-2.5 text-[0.76rem] text-slate-600 dark:border-gov-700 dark:bg-gov-900/40 dark:text-slate-300">
              <Info size={14} className="mt-0.5 shrink-0 text-gov-600" aria-hidden />
              {L(
                "You are reviewing as a guest officer. Sign in with the Revenue Officer role to attribute this decision to your authenticated account.",
                "आप अतिथि अधिकारी के रूप में समीक्षा कर रहे हैं। इस निर्णय को अपने प्रमाणित खाते से जोड़ने हेतु राजस्व अधिकारी भूमिका से साइन इन करें।",
              )}
            </p>
          ) : null}

          <fieldset>
            <legend className="mb-2 text-[0.72rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {L("Decision on the land record", "भूमि अभिलेख पर निर्णय")}
            </legend>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {DECISIONS.map((d) => {
                const active = decision === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDecision(d.id)}
                    aria-pressed={active}
                    className={cx(
                      "rounded-md border-2 p-3.5 text-left transition",
                      active
                        ? d.cls
                        : "border-slate-200 bg-white hover:border-gov-300 hover:bg-gov-50/60 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5",
                    )}
                  >
                    <d.Icon size={18} aria-hidden />
                    <p className="mt-2 text-[0.82rem] font-bold leading-tight">
                      {lang === "hi" ? d.hi : d.en}
                    </p>
                    <p
                      className={cx(
                        "mt-1 text-[0.7rem] leading-snug",
                        active ? "opacity-85" : "text-slate-500 dark:text-slate-400",
                      )}
                    >
                      {lang === "hi" ? d.hintHi : d.hint}
                    </p>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
            <div>
              <label
                htmlFor="officer-id"
                className="mb-1.5 block text-[0.8rem] font-semibold text-slate-700 dark:text-slate-300"
              >
                {L("Officer ID", "अधिकारी आईडी")}
              </label>
              <input
                id="officer-id"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                className="tabular w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-gov-500 focus:ring-2 focus:ring-gov-500/25 focus:outline-none dark:border-white/15 dark:bg-gov-950 dark:text-slate-100"
              />
            </div>
            <div>
              <label
                htmlFor="officer-name"
                className="mb-1.5 block text-[0.8rem] font-semibold text-slate-700 dark:text-slate-300"
              >
                {L("Recorded as", "इस नाम से दर्ज")}
              </label>
              <input
                id="officer-name"
                readOnly
                value={
                  session?.name?.trim() ||
                  L("Guest Revenue Officer", "अतिथि राजस्व अधिकारी")
                }
                className="w-full cursor-not-allowed rounded-md border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <label
                htmlFor="officer-remarks"
                className="text-[0.8rem] font-semibold text-slate-700 dark:text-slate-300"
              >
                {L("Officer feedback / remarks", "अधिकारी टिप्पणी")}
                <span className="ml-0.5 text-red-600">*</span>
              </label>
              <span
                className={cx(
                  "tabular text-[0.7rem] font-bold",
                  remaining > 0 ? "text-slate-400" : "text-leaf-600 dark:text-leaf-400",
                )}
              >
                {remarks.trim().length} / {MIN_FEEDBACK_CHARS} {L("min", "न्यूनतम")}
              </span>
            </div>
            <Textarea
              id="officer-remarks"
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                if (error) setError(null);
              }}
              invalid={!!error}
              aria-describedby="remarks-help"
              className="min-h-28"
              placeholder={L(
                "Record the basis of your decision — what was verified, what was compared, and any direction to the Tehsil…",
                "अपने निर्णय का आधार दर्ज करें — क्या सत्यापित किया गया, किससे तुलना हुई, और तहसील को कोई निर्देश…",
              )}
            />
            <p id="remarks-help" className="mt-1 text-[0.72rem] text-slate-500 dark:text-slate-400">
              {L(
                `Mandatory. Minimum ${MIN_FEEDBACK_CHARS} characters — this text is written verbatim into the immutable audit trail.`,
                `अनिवार्य। न्यूनतम ${MIN_FEEDBACK_CHARS} अक्षर — यह पाठ यथावत अपरिवर्तनीय ऑडिट ट्रेल में लिखा जाता है।`,
              )}
            </p>
            <FieldError>{error}</FieldError>
          </div>

          <div className="flex flex-wrap gap-2.5 border-t border-slate-200 pt-4 dark:border-white/10">
            <Button onClick={submit}>
              <ShieldCheck size={16} />
              {rv ? L("Save amended review", "संशोधित समीक्षा सहेजें") : L("Record final review", "अंतिम समीक्षा दर्ज करें")}
            </Button>
            {rv ? (
              <Button variant="ghost" onClick={() => setAmending(false)}>
                {L("Cancel", "रद्द करें")}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  4. AUDIT TRAIL                                                     */
/* ------------------------------------------------------------------ */

export function AuditTrailPanel({ result }: { result: VerificationResult }) {
  const { lang, toast, session } = useApp();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);
  const [expanded, setExpanded] = useState<string | null>(null);

  const entries = useMemo(
    () => [...result.auditTrail].sort((a, b) => (a.at < b.at ? 1 : -1)),
    [result.auditTrail],
  );

  const exportLog = () => {
    const text = [
      "=".repeat(78),
      "  BHOOMI VERIFY AI — IMMUTABLE AUDIT TRAIL",
      "  भूमि सत्यापन एआई — अपरिवर्तनीय ऑडिट ट्रेल",
      "=".repeat(78),
      `Reference ID : ${result.id}`,
      `Document     : ${result.fileName}`,
      `Record holder: ${result.ownerName} (${result.ownerNameHi})`,
      `AI verdict   : ${result.verdict.toUpperCase()} @ ${result.confidence.toFixed(1)}%`,
      `Officer      : ${
        result.officerReview
          ? `${result.officerReview.decision.toUpperCase()} by ${result.officerReview.officerName} (${result.officerReview.officerId})`
          : "PENDING"
      }`,
      "Entries      : " + entries.length,
      "",
      ...entries.map((e) =>
        [
          "-".repeat(78),
          `[${new Date(e.at).toLocaleString("en-IN")}]  ${e.action}`,
          `  actor   : ${e.actor} — ${e.role}`,
          `  channel : ${e.channel}`,
          `  entry   : ${e.id}`,
          `  detail  : ${lang === "hi" ? e.detailHi : e.detail}`,
        ].join("\n"),
      ),
      "-".repeat(78),
      "Log exported from the BhoomiVerify AI portal. Each entry is hash-chained to the",
      "preceding entry and anchored to the National Blockchain Framework.",
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AuditTrail-${result.id.replace(/\//g, "-")}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast(L("Audit trail exported", "ऑडिट ट्रेल निर्यात हुआ"));
  };

  return (
    <Card>
      <CardHeader
        title={L("Audit Trail", "ऑडिट ट्रेल")}
        icon={<History size={15} />}
        action={
          <div className="flex items-center gap-2">
            <Badge tone="neutral">
              <Lock size={10} /> {entries.length} {L("entries", "प्रविष्टियाँ")}
            </Badge>
            <Button size="sm" variant="secondary" onClick={exportLog}>
              <Download size={13} /> {L("Export log", "लॉग निर्यात")}
            </Button>
          </div>
        }
      />
      <ol className="relative space-y-0 p-5 pl-11">
        <span
          className="absolute bottom-7 left-[1.55rem] top-7 w-0.5 bg-slate-200 dark:bg-white/15"
          aria-hidden
        />
        {entries.map((e, i) => {
          const open = expanded === e.id;
          const isSystem = e.role.startsWith("System");
          return (
            <li key={e.id} className="relative pb-5 last:pb-0">
              <span
                className={cx(
                  "absolute -left-[1.72rem] top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-white text-white shadow dark:border-gov-950",
                  isSystem ? "bg-gov-600" : "bg-leaf-600",
                )}
              >
                {isSystem ? <Bot size={12} /> : <UserCog size={12} />}
              </span>
              <button
                type="button"
                onClick={() => setExpanded(open ? null : e.id)}
                aria-expanded={open}
                className="w-full rounded-md px-2 py-1 text-left transition hover:bg-gov-50/80 dark:hover:bg-white/5"
              >
                <p className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-gov-900 px-1.5 py-0.5 font-mono text-[0.62rem] font-bold tracking-wide text-white dark:bg-gov-700">
                    {e.action}
                  </span>
                  <span className="tabular text-[0.7rem] font-semibold text-slate-500 dark:text-slate-400">
                    {new Date(e.at).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cx(
                      "ml-auto text-slate-400 transition-transform",
                      open && "rotate-180",
                    )}
                    aria-hidden
                  />
                </p>
                <p className="mt-1 text-[0.82rem] font-bold text-slate-800 dark:text-slate-100">
                  {e.actor}
                  <span className="ml-2 text-[0.7rem] font-medium text-slate-500 dark:text-slate-400">
                    {e.role} · {e.channel}
                  </span>
                </p>
                {!open ? (
                  <p className="mt-0.5 line-clamp-1 text-[0.76rem] text-slate-500 dark:text-slate-400">
                    {lang === "hi" ? e.detailHi : e.detail}
                  </p>
                ) : null}
              </button>
              {open ? (
                <div className="mx-2 mt-1.5 rounded-md border border-slate-200 bg-slate-50 p-3.5 dark:border-white/10 dark:bg-white/5">
                  <p className="text-[0.78rem] leading-relaxed text-slate-700 dark:text-slate-200">
                    {lang === "hi" ? e.detailHi : e.detail}
                  </p>
                  <p className="tabular mt-2 font-mono text-[0.66rem] text-slate-400">
                    entry {e.id} · seq {entries.length - i}/{entries.length}
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="border-t border-slate-200 bg-slate-50 px-5 py-3.5 text-[0.72rem] leading-relaxed text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
        {L(
          "Every entry is hash-chained and anchored to the National Blockchain Framework; entries cannot be edited or deleted after they are written. Officer feedback is stored verbatim.",
          "प्रत्येक प्रविष्टि हैश-श्रृंखलाबद्ध है और राष्ट्रीय ब्लॉकचेन फ्रेमवर्क पर अंकुरित होती है; लिखे जाने के बाद प्रविष्टियाँ संपादित या हटाई नहीं जा सकतीं। अधिकारी टिप्पणी यथावत संग्रहीत होती है।",
        )}
        {session ? (
          <span className="mt-1 block">
            {L("Signed in as", "इस रूप में साइन इन")}:{" "}
            <strong className="text-slate-700 dark:text-slate-200">
              {session.name} ({session.role})
            </strong>
          </span>
        ) : null}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  5. DOSSIER — the four review stages in one prominent block         */
/* ------------------------------------------------------------------ */

type DossierTab = "findings" | "ai" | "review" | "audit";

export function DossierTabs({
  result,
  onUpdate,
}: {
  result: VerificationResult;
  onUpdate: ResultUpdater;
}) {
  const { lang, session } = useApp();
  const [tab, setTab] = useState<DossierTab>("findings");
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const rv = result.officerReview;
  const counts: Record<DossierTab, number | null> = {
    findings: result.keyFindings.length,
    ai: null,
    review: rv ? 1 : 0,
    audit: result.auditTrail.length,
  };

  const TABS: { id: DossierTab; en: string; hi: string; Icon: typeof ScrollText }[] = [
    { id: "findings", en: "Key Findings", hi: "मुख्य निष्कर्ष", Icon: ScrollText },
    { id: "ai", en: "AI Opinion", hi: "एआई राय", Icon: Bot },
    { id: "review", en: "Human / Officer Review", hi: "मानव / अधिकारी समीक्षा", Icon: Gavel },
    { id: "audit", en: "Audit Trail", hi: "ऑडिट ट्रेल", Icon: History },
  ];

  const summary = [
    {
      label: L("AI Verdict", "एआई निर्णय"),
      value:
        result.verdict === "verified"
          ? L("VERIFIED", "सत्यापित")
          : result.verdict === "review"
            ? L("NEEDS REVIEW", "समीक्षा आवश्यक")
            : L("FLAGGED", "चिह्नित"),
      sub: `${result.confidence.toFixed(1)}% ${L("confidence", "विश्वास")}`,
      cls:
        result.verdict === "verified"
          ? "border-leaf-500/40 bg-leaf-500/10 text-leaf-700 dark:text-leaf-400"
          : result.verdict === "review"
            ? "border-saffron-500/40 bg-saffron-500/10 text-saffron-600 dark:text-saffron-400"
            : "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400",
      Icon:
        result.verdict === "verified"
          ? ShieldCheck
          : result.verdict === "review"
            ? AlertTriangle
            : ShieldX,
    },
    {
      label: L("AI Recommendation", "एआई अनुशंसा"),
      value:
        result.aiOpinion.recommendation === "approve"
          ? L("Approve", "स्वीकृत करें")
          : result.aiOpinion.recommendation === "reject"
            ? L("Reject", "अस्वीकार करें")
            : L("Manual review", "मानव समीक्षा"),
      sub: result.aiOpinion.band,
      cls: "border-gov-400/40 bg-gov-500/10 text-gov-700 dark:text-gov-300",
      Icon: Bot,
    },
    {
      label: L("Human Review", "मानव समीक्षा"),
      value: rv
        ? rv.decision === "approved"
          ? L("APPROVED", "स्वीकृत")
          : rv.decision === "returned"
            ? L("RETURNED", "वापस किया")
            : L("REJECTED", "अस्वीकृत")
        : L("PENDING", "प्रतीक्षित"),
      sub: rv
        ? `${rv.officerName} · ${new Date(rv.decidedAt).toLocaleDateString(
            lang === "hi" ? "hi-IN" : "en-IN",
          )}`
        : session
          ? L("Awaiting your decision below", "नीचे आपके निर्णय की प्रतीक्षा")
          : L("Awaiting a Revenue Officer", "राजस्व अधिकारी प्रतीक्षित"),
      cls: rv
        ? rv.decision === "approved"
          ? "border-leaf-500/40 bg-leaf-500/10 text-leaf-700 dark:text-leaf-400"
          : rv.decision === "returned"
            ? "border-saffron-500/40 bg-saffron-500/10 text-saffron-600 dark:text-saffron-400"
            : "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400"
        : "border-slate-300 bg-slate-100 text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-slate-300",
      Icon: rv ? Gavel : UserCog,
    },
  ];

  return (
    <section
      aria-label={L("Verification dossier", "सत्यापन डोज़ियर")}
      className="overflow-hidden rounded-lg border-2 border-gov-700 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.07)] dark:border-gov-600 dark:bg-gov-950/70"
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-gov-950/40 bg-gov-800 px-5 py-3.5 dark:bg-gov-900">
        <h2 className="flex items-center gap-2 text-[0.98rem] font-extrabold tracking-tight text-white">
          <Gavel size={17} className="text-saffron-400" aria-hidden />
          {L("Verification Dossier", "सत्यापन डोज़ियर")}
        </h2>
        <span className="rounded bg-white/15 px-2 py-0.5 text-[0.66rem] font-bold uppercase tracking-wider text-gov-100">
          {L("Findings · AI Opinion · Human Review · Audit", "निष्कर्ष · एआई राय · मानव समीक्षा · ऑडिट")}
        </span>
        <span className="tabular ml-auto text-[0.72rem] font-semibold text-gov-200">{result.id}</span>
      </div>

      {/* at-a-glance summary */}
      <div className="grid gap-3 border-b border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-3 dark:border-white/10 dark:bg-white/5">
        {summary.map((s) => (
          <div key={s.label} className={cx("rounded-md border px-3.5 py-3", s.cls)}>
            <p className="flex items-center gap-1.5 text-[0.66rem] font-extrabold uppercase tracking-wider opacity-85">
              <s.Icon size={12} aria-hidden />
              {s.label}
            </p>
            <p className="mt-1 text-[1.05rem] font-extrabold leading-tight">{s.value}</p>
            <p className="mt-0.5 truncate text-[0.7rem] font-medium opacity-80">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* tabs */}
      <div
        role="tablist"
        aria-label={L("Dossier sections", "डोज़ियर अनुभाग")}
        className="flex flex-wrap gap-1 border-b border-slate-200 bg-white px-3 pt-3 dark:border-white/10 dark:bg-gov-950/70"
      >
        {TABS.map((x) => {
          const active = tab === x.id;
          const n = counts[x.id];
          return (
            <button
              key={x.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(x.id)}
              className={cx(
                "flex items-center gap-2 rounded-t-md border border-b-0 px-3.5 py-2.5 text-[0.8rem] font-bold transition",
                active
                  ? "-mb-px border-gov-700 bg-gov-700 text-white shadow-sm dark:border-gov-500 dark:bg-gov-600"
                  : "border-transparent text-slate-500 hover:bg-gov-50 hover:text-gov-700 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white",
              )}
            >
              <x.Icon size={15} aria-hidden />
              {lang === "hi" ? x.hi : x.en}
              {n !== null ? (
                <span
                  className={cx(
                    "tabular rounded-full px-1.5 py-0.5 text-[0.62rem] font-extrabold",
                    active
                      ? "bg-white/25 text-white"
                      : x.id === "review" && !n
                        ? "bg-saffron-500/20 text-saffron-600 dark:text-saffron-400"
                        : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300",
                  )}
                >
                  {n}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="bg-slate-50/40 p-4 dark:bg-transparent">
        {tab === "findings" ? <KeyFindingsPanel result={result} /> : null}
        {tab === "ai" ? <AiOpinionPanel result={result} /> : null}
        {tab === "review" ? <OfficerReviewPanel result={result} onUpdate={onUpdate} /> : null}
        {tab === "audit" ? <AuditTrailPanel result={result} /> : null}
      </div>
    </section>
  );
}
