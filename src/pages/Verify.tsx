import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSearch,
  FileStack,
  FileText,
  HardDriveDownload,
  Loader2,
  Printer,
  RotateCcw,
  Save,
  ScanLine,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  FieldError,
  Input,
  Label,
  PageHeader,
  Select,
  Spinner,
  cx,
} from "../components/ui";
import { type ResultUpdater } from "../components/ReviewPanels";
import { DOC_TYPES, STATES } from "../lib/data";
import { DEMO_DOCS, demoDocSvgUrl, demoDocToFile, type DemoDoc } from "../lib/demoDocs";
import { runOcr, type OcrOutput } from "../lib/ocr";
import {
  VERDICT_META,
  analyzeDocument,
  buildReportText,
  formatBytes,
  makeAuditEntry,
} from "../lib/verifyEngine";
import type { VerificationResult } from "../lib/types";

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const STEPS = ["v.step1", "v.step2", "v.step3", "v.step4", "v.step5"];

type Phase = "idle" | "analyzing" | "done";

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function Verify() {
  const {
    t,
    lang,
    toast,
    session,
    addVerification,
    verifications,
    removeVerification,
    updateVerification,
    setLastResult,
  } = useApp();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [state, setState] = useState(STATES[0]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [demo, setDemo] = useState<DemoDoc | null>(null);
  const [loadingDemo, setLoadingDemo] = useState<string | null>(null);
  const [declared, setDeclared] = useState({ owner: "", khasra: "", village: "", areaHa: "" });
  const [ocrStatus, setOcrStatus] = useState("");
  const cancelled = useRef(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);
  const previewUrl = useRef<string | null>(null);
  const verificationsRef = useRef(verifications);
  const updateRef = useRef(updateVerification);
  verificationsRef.current = verifications;
  updateRef.current = updateVerification;

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  /* Deep link: /verify#samples scrolls straight to the six sample documents. */
  const location = useLocation();
  useEffect(() => {
    if (location.hash !== "#samples") return;
    const id = window.setTimeout(
      () =>
        document
          .getElementById("samples")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      160,
    );
    return () => window.clearTimeout(id);
  }, [location.hash]);

  /* Keep an already-saved report in sync with review / audit changes. */
  useEffect(() => {
    if (!result) return;
    if (verificationsRef.current.some((v) => v.id === result.id)) {
      updateRef.current(result.id, result);
    }
  }, [result]);

  /** Applies a mutation to the in-flight result (used by the review panels). */
  const mutateResult = useCallback<ResultUpdater>((updater) => {
    setResult((prev) => (prev ? updater(prev) : prev));
  }, []);

  const actorName = session?.name?.trim() || (lang === "hi" ? "अनाम नागरिक" : "Anonymous Citizen");
  const actorRole = session
    ? session.role === "officer"
      ? "Revenue Officer (authenticated)"
      : "Citizen (authenticated)"
    : "Citizen (unauthenticated)";

  const acceptFile = useCallback(
    (f: File | undefined | null) => {
      setError(null);
      if (!f) return;
      const okType =
        ACCEPTED.includes(f.type) || /\.(pdf|jpe?g|png|webp)$/i.test(f.name);
      if (!okType) {
        setError(t("v.errType"));
        toast(t("v.errType"), "error");
        return;
      }
      if (f.size > MAX_SIZE) {
        setError(t("v.errSize"));
        toast(t("v.errSize"), "error");
        return;
      }
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      const url = URL.createObjectURL(f);
      previewUrl.current = f.type.startsWith("image/") ? url : null;
      setDemo(null);
      setDeclared({ owner: "", khasra: "", village: "", areaHa: "" });
      setFile(f);
      setPreview(previewUrl.current);
      setPhase("idle");
      setResult(null);
      toast(
        lang === "hi"
          ? `फ़ाइल "${f.name}" संलग्न की गई`
          : `File "${f.name}" attached`,
        "info",
      );
    },
    [t, toast, lang],
  );

  /** Loads one of the six indexed sample documents as a real PNG File. */
  const loadDemo = useCallback(
    async (doc: DemoDoc) => {
      setLoadingDemo(doc.id);
      setError(null);
      try {
        const f = await demoDocToFile(doc);
        if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
        const url = URL.createObjectURL(f);
        previewUrl.current = url;
        setDemo(doc);
        setDeclared({
          owner: doc.owner,
          khasra: doc.khasra,
          village: doc.village,
          areaHa: doc.areaHa.toFixed(2),
        });
        setFile(f);
        setPreview(url);
        setDocType(doc.docType);
        setState(doc.state);
        setPhase("idle");
        setResult(null);
        if (inputRef.current) inputRef.current.value = "";
        toast(
          lang === "hi"
            ? `नमूना दस्तावेज़ लोड हुआ — ${doc.formTitleHi}`
            : `Sample document loaded — ${doc.formTitle}`,
          "info",
        );
      } catch {
        setError(
          lang === "hi"
            ? "नमूना दस्तावेज़ लोड नहीं हो सका। कृपया पुनः प्रयास करें।"
            : "Could not render the sample document. Please try again.",
        );
        toast(lang === "hi" ? "नमूना लोड विफल" : "Sample load failed", "error");
      } finally {
        setLoadingDemo(null);
      }
    },
    [lang, toast],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const start = async () => {
    if (!file) {
      setError(lang === "hi" ? "कृपया पहले एक दस्तावेज़ चुनें।" : "Please choose a document first.");
      toast(lang === "hi" ? "कृपया पहले एक दस्तावेज़ चुनें।" : "Please choose a document first.", "error");
      return;
    }
    if (!demo && !declared.owner.trim()) {
      const msg =
        lang === "hi"
          ? "कृपया दस्तावेज़ पर अंकित खातेदार का नाम भरें, अथवा छह नमूना दस्तावेज़ों में से कोई लोड करें।"
          : "Enter the record-holder name exactly as printed on the document, or load one of the six sample documents.";
      setError(msg);
      toast(msg, "error");
      return;
    }

    setError(null);
    setPhase("analyzing");
    setStep(0);
    setResult(null);
    cancelled.current = false;
    timers.current.forEach(window.clearTimeout);
    timers.current = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(resolve, ms);
        timers.current.push(id);
      });

    /* ---- stage 1: genuine on-device OCR (tesseract.js) ---- */
    setOcrStatus(
      lang === "hi"
        ? "ओसीआर इंजन प्रारंभ हो रहा है (पहली बार में मॉडल डाउनलोड होगा)…"
        : "Starting on-device OCR engine (first run downloads the language model)…",
    );
    let ocr: OcrOutput | null = null;
    try {
      ocr = await runOcr(file, (p) => {
        const pct = Math.round((p.progress || 0) * 100);
        setOcrStatus(
          lang === "hi"
            ? `ओसीआर — ${p.status} ${pct}%`
            : `OCR — ${p.status.replace(/^recognizing/, "recognising text")} ${pct}%`,
        );
      });
    } catch {
      ocr = null;
    }
    if (cancelled.current) return;
    setStep(1);
    setOcrStatus(
      ocr?.ok
        ? lang === "hi"
          ? `ओसीआर पूर्ण — ${ocr.chars} अक्षर, ${ocr.confidence.toFixed(1)}% विश्वास`
          : `OCR complete — ${ocr.chars} characters at ${ocr.confidence.toFixed(1)}% confidence`
        : lang === "hi"
          ? "ओसीआर उपलब्ध नहीं — घोषित मान उपयोग होंगे"
          : "OCR unavailable — declared values will be used",
    );

    await wait(650);
    if (cancelled.current) return;
    setStep(2);
    await wait(650);
    if (cancelled.current) return;
    setStep(3);
    await wait(650);
    if (cancelled.current) return;
    setStep(4);
    await wait(550);
    if (cancelled.current) return;
    setStep(5);

    const r = analyzeDocument({
      file,
      docType,
      state,
      previewUrl: previewUrl.current ?? undefined,
      demo: demo ?? undefined,
      ocr,
      declared,
    });
    setResult(r);
    setPhase("done");
    setLastResult(r);
    toast(
      lang === "hi"
        ? `विश्लेषण पूर्ण — निर्णय: ${VERDICT_META[r.verdict].hi}`
        : `Analysis complete — verdict: ${VERDICT_META[r.verdict].en}`,
      r.verdict === "flagged" ? "error" : "success",
    );
    /* Verification is finished — open the dedicated full-page report. */
    navigate(`/report/${encodeURIComponent(r.id)}`);
  };

  const reset = () => {
    cancelled.current = true;
    timers.current.forEach(window.clearTimeout);
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setFile(null);
    setPreview(null);
    setPhase("idle");
    setStep(0);
    setResult(null);
    setError(null);
    setDemo(null);
    setOcrStatus("");
    setDeclared({ owner: "", khasra: "", village: "", areaHa: "" });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <PageHeader
        title={t("v.title")}
        subtitle={t("v.sub")}
        icon={<FileSearch size={22} />}
        breadcrumb={[
          { label: t("nav.home"), to: "/" },
          { label: t("nav.verify") },
        ]}
        actions={
          <Badge tone="green">
            <ShieldCheck size={12} /> Engine v3.2 · Online
          </Badge>
        }
      />

      {/* --------------------- indexed sample documents --------------------- */}
      <section
        id="samples"
        aria-labelledby="sample-docs"
        className="scroll-mt-24 border-b border-slate-200 bg-white dark:border-white/10 dark:bg-gov-950/60"
      >
        <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="sample-docs"
                className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-gov-900 dark:text-white"
              >
                <FileStack size={19} className="text-gov-600" aria-hidden />
                {lang === "hi" ? "नमूना भूमि दस्तावेज़ (6)" : "Sample Land Documents (6)"}
              </h2>
              <p className="mt-1 max-w-3xl text-[0.82rem] leading-relaxed text-slate-600 dark:text-slate-300">
                {lang === "hi"
                  ? "कोई भी नमूना चुनें — वह वास्तविक स्कैन के रूप में तैयार होकर अपलोडर में संलग्न हो जाता है। ओसीआर ठीक वही खातेदार का नाम, खसरा एवं क्षेत्रफल लौटाता है जो दस्तावेज़ पर अंकित है।"
                  : "Pick any sample — it is rendered as a real scan and attached to the uploader below. OCR then returns exactly the record-holder name, Khasra and extent printed on that document."}
              </p>
            </div>
            <Badge tone="blue">
              <Sparkles size={11} />
              {lang === "hi" ? "अनुक्रमित ग्राउंड ट्रुथ" : "Indexed ground truth"}
            </Badge>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {DEMO_DOCS.map((doc) => {
              const loaded = demo?.id === doc.id;
              const busyDoc = loadingDemo === doc.id;
              return (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => loadDemo(doc)}
                    disabled={loadingDemo !== null}
                    aria-pressed={loaded}
                    className={cx(
                      "group flex h-full w-full flex-col rounded-lg border bg-white p-2.5 text-left transition-all duration-200",
                      "hover:-translate-y-1 hover:shadow-[0_12px_26px_-12px_rgba(16,44,88,0.4)] disabled:cursor-wait disabled:opacity-70",
                      loaded
                        ? "border-leaf-500 ring-2 ring-leaf-500/30 dark:bg-gov-900"
                        : "border-slate-200 hover:border-gov-400 dark:border-white/10 dark:bg-gov-950/70 dark:hover:border-gov-600",
                    )}
                  >
                    <span className="relative block h-32 overflow-hidden rounded border border-slate-200 bg-slate-100 dark:border-white/10">
                      <img
                        src={demoDocSvgUrl(doc)}
                        alt={`${doc.formTitle} — ${doc.owner}`}
                        className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.05]"
                        loading="lazy"
                      />
                      {busyDoc ? (
                        <span className="absolute inset-0 grid place-items-center bg-white/75 text-gov-700">
                          <Loader2 size={22} className="animate-spin" />
                        </span>
                      ) : null}
                      {loaded ? (
                        <span className="absolute right-1 top-1 rounded bg-leaf-600 px-1.5 py-0.5 text-[0.55rem] font-extrabold uppercase tracking-wider text-white shadow">
                          {lang === "hi" ? "लोड हुआ" : "Loaded"}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-2 block min-w-0">
                      <span className="block truncate text-[0.8rem] font-extrabold text-gov-900 dark:text-white">
                        {lang === "hi" ? doc.ownerHi : doc.owner}
                      </span>
                      <span className="mt-0.5 block truncate text-[0.68rem] font-medium text-slate-500 dark:text-slate-400">
                        {doc.formTitle}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge
                          tone={
                            doc.verdict === "verified"
                              ? "green"
                              : doc.verdict === "review"
                                ? "amber"
                                : "red"
                          }
                        >
                          {doc.confidence.toFixed(1)}%
                        </Badge>
                        <span className="tabular text-[0.64rem] font-semibold text-slate-500 dark:text-slate-400">
                          Kh. {doc.khasra} · {doc.areaHa.toFixed(2)} Ha
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)]">
          {/* ----------------------------- uploader ----------------------------- */}
          <div className="space-y-5">
            <Card>
              <CardHeader title={t("hero.cta1")} icon={<UploadCloud size={15} />} />
              <div className="p-5">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={cx(
                    "relative rounded-lg border-2 border-dashed p-6 text-center transition",
                    dragging
                      ? "border-leaf-500 bg-leaf-500/10"
                      : "border-gov-300 bg-gov-50/60 hover:border-gov-500 hover:bg-gov-50 dark:border-gov-600 dark:bg-white/5 dark:hover:bg-white/10",
                  )}
                >
                  <input
                    ref={inputRef}
                    id="doc-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                    className="sr-only"
                    onChange={(e) => acceptFile(e.target.files?.[0])}
                  />

                  {file ? (
                    <div className="space-y-3">
                      <div className="mx-auto grid h-16 w-16 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow dark:border-white/15 dark:bg-gov-900">
                        {preview ? (
                          <img src={preview} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <FileText size={28} className="text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="break-all text-[0.85rem] font-bold text-gov-900 dark:text-white">
                          {file.name}
                        </p>
                        <p className="mt-0.5 text-[0.74rem] text-slate-500 dark:text-slate-400">
                          {formatBytes(file.size)} · {file.type || "unknown"}
                        </p>
                      </div>
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
                          <RotateCcw size={14} />
                          {lang === "hi" ? "बदलें" : "Replace"}
                        </Button>
                        <Button size="sm" variant="danger" onClick={reset}>
                          <Trash2 size={14} />
                          {lang === "hi" ? "हटाएँ" : "Remove"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gov-700 text-white shadow-lg">
                        <Upload size={24} />
                      </span>
                      <p className="mt-3.5 text-[0.9rem] font-bold text-gov-900 dark:text-white">
                        {t("v.drop")}
                      </p>
                      <p className="mt-1 text-[0.78rem] text-slate-500 dark:text-slate-400">
                        {t("v.or")}
                      </p>
                      <Button className="mt-3" onClick={() => inputRef.current?.click()}>
                        <Upload size={16} />
                        {t("v.browse")}
                      </Button>
                    </>
                  )}
                </div>

                <label
                  htmlFor="doc-upload"
                  className="mt-2 block cursor-pointer text-center text-[0.72rem] text-slate-500 underline-offset-2 hover:underline dark:text-slate-400"
                >
                  {t("v.formats")}
                </label>
                <FieldError>{error}</FieldError>

                <div className="mt-5 space-y-4">
                  <div>
                    <Label htmlFor="docType" required>
                      {t("v.docType")}
                    </Label>
                    <Select
                      id="docType"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      disabled={phase === "analyzing"}
                    >
                      {DOC_TYPES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="stateSel" required>
                      {t("v.state")}
                    </Label>
                    <Select
                      id="stateSel"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      disabled={phase === "analyzing"}
                    >
                      {STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="rounded-md border border-gov-200 bg-gov-50/60 p-3.5 dark:border-gov-700 dark:bg-gov-900/40">
                    <Label htmlFor="declOwner" required={!demo}>
                      {lang === "hi"
                        ? "खातेदार का नाम (दस्तावेज़ पर अंकित रूप में)"
                        : "Record-holder name (exactly as printed on the document)"}
                    </Label>
                    <Input
                      id="declOwner"
                      value={declared.owner}
                      disabled={phase === "analyzing"}
                      onChange={(e) => setDeclared({ ...declared, owner: e.target.value })}
                      placeholder={
                        lang === "hi" ? "जैसे रमेश चंद्र तिवारी" : "e.g. Ramesh Chandra Tiwari"
                      }
                    />
                    <p className="mt-1.5 text-[0.7rem] leading-relaxed text-slate-500 dark:text-slate-400">
                      {lang === "hi"
                        ? "ओसीआर इंजन दस्तावेज़ से नाम स्वयं पढ़ता है और उसी को प्राथमिकता देता है। यह मान केवल तब उपयोग होता है जब ओसीआर नाम न पढ़ सके — कभी भी कोई नाम अनुमान से नहीं भरा जाता।"
                        : "The OCR engine reads the name off the document itself and that reading always wins. This value is used only when OCR cannot read a name — nothing is ever invented."}
                    </p>

                    <p className="mt-2.5 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {lang === "hi" ? "सुझाए गए नाम (नमूना अभिलेख)" : "Suggested names (sample records)"}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {DEMO_DOCS.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          disabled={phase === "analyzing"}
                          onClick={() => setDeclared({ ...declared, owner: d.owner })}
                          className={cx(
                            "rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold transition",
                            declared.owner === d.owner
                              ? "border-gov-700 bg-gov-700 text-white"
                              : "border-slate-300 bg-white text-slate-600 hover:border-gov-500 hover:text-gov-700 dark:border-white/15 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/10",
                          )}
                        >
                          {d.owner}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <Label htmlFor="declKhasra">
                        {lang === "hi" ? "खसरा नं." : "Khasra No."}
                      </Label>
                      <Input
                        id="declKhasra"
                        value={declared.khasra}
                        disabled={phase === "analyzing"}
                        onChange={(e) => setDeclared({ ...declared, khasra: e.target.value })}
                        placeholder="142/2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="declVillage">{t("lr.village")}</Label>
                      <Input
                        id="declVillage"
                        value={declared.village}
                        disabled={phase === "analyzing"}
                        onChange={(e) => setDeclared({ ...declared, village: e.target.value })}
                        placeholder="Kakori"
                      />
                    </div>
                    <div>
                      <Label htmlFor="declArea">{lang === "hi" ? "क्षेत्रफल (हे.)" : "Extent (Ha)"}</Label>
                      <Input
                        id="declArea"
                        inputMode="decimal"
                        value={declared.areaHa}
                        disabled={phase === "analyzing"}
                        onChange={(e) => setDeclared({ ...declared, areaHa: e.target.value })}
                        placeholder="1.84"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={start}
                    disabled={phase === "analyzing"}
                  >
                    {phase === "analyzing" ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {t("v.progress")}…
                      </>
                    ) : (
                      <>
                        <FileSearch size={18} />
                        {t("v.start")}
                      </>
                    )}
                  </Button>
                  {phase !== "idle" ? (
                    <Button variant="secondary" size="lg" onClick={reset}>
                      <X size={18} />
                      {t("c.cancel")}
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>

            {/* history */}
            <Card>
              <CardHeader
                title={t("db.mine")}
                icon={<HardDriveDownload size={15} />}
                action={
                  <span className="rounded bg-gov-50 px-2 py-0.5 text-[0.7rem] font-bold text-gov-700 dark:bg-gov-800 dark:text-gov-200">
                    {verifications.length}
                  </span>
                }
              />
              {verifications.length === 0 ? (
                <p className="px-5 py-6 text-center text-[0.8rem] text-slate-500 dark:text-slate-400">
                  {t("db.empty")}
                </p>
              ) : (
                <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto dark:divide-white/5">
                  {verifications.map((r) => {
                    const m = VERDICT_META[r.verdict];
                    return (
                      <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[0.8rem] font-semibold text-slate-800 dark:text-slate-100">
                            {r.fileName}
                          </p>
                          <p className="tabular mt-0.5 text-[0.68rem] text-slate-500 dark:text-slate-400">
                            {r.id} · {r.confidence}%
                          </p>
                        </div>
                        <Badge
                          tone={r.verdict === "verified" ? "green" : r.verdict === "review" ? "amber" : "red"}
                        >
                          {lang === "hi" ? m.hi : m.en}
                        </Badge>
                        <Link to={`/report/${encodeURIComponent(r.id)}`} aria-label={`Open report ${r.id}`}>
                          <Button size="sm" variant="ghost" className="px-2">
                            <FileSearch size={15} />
                          </Button>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            removeVerification(r.id);
                            toast(lang === "hi" ? "रिकॉर्ड हटाया गया" : "Record removed", "info");
                          }}
                          aria-label={`Delete ${r.id}`}
                          className="rounded p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/15"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>

          {/* ------------------------------ results ------------------------------ */}
          <div className="space-y-5">
            {phase === "idle" && !result ? (
              <Card className="grid place-items-center px-6 py-20 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-gov-50 text-gov-400 dark:bg-white/5">
                  <ShieldCheck size={38} />
                </span>
                <h2 className="mt-5 text-lg font-bold text-gov-900 dark:text-white">
                  {lang === "hi"
                    ? "सत्यापन रिपोर्ट यहाँ प्रदर्शित होगी"
                    : "Your verification report will appear here"}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {lang === "hi"
                    ? "बाईं ओर से दस्तावेज़ अपलोड करें, दस्तावेज़ प्रकार और राज्य चुनें, फिर “एआई सत्यापन प्रारंभ करें” पर क्लिक करें।"
                    : "Upload a document on the left, choose the document type and state, then click “Start AI Verification”. The engine runs OCR, tamper analysis, seal matching and cadastral cross-checks."}
                </p>
                <ul className="mt-6 grid w-full max-w-lg gap-2 text-left sm:grid-cols-2">
                  {STEPS.map((s, i) => (
                    <li
                      key={s}
                      className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[0.76rem] font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gov-700 text-[0.65rem] font-bold text-white">
                        {i + 1}
                      </span>
                      {t(s)}
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}

            {phase === "analyzing" ? (
              <Card>
                <CardHeader
                  title={t("v.progress")}
                  icon={<Spinner className="h-4 w-4 text-gov-700" />}
                  action={
                    <span className="tabular text-[0.75rem] font-bold text-gov-700 dark:text-gov-300">
                      {Math.round((step / STEPS.length) * 100)}%
                    </span>
                  }
                />
                <div className="p-5">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-gov-600 to-leaf-500"
                      animate={{ width: `${(step / STEPS.length) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  {ocrStatus ? (
                    <p className="mt-2.5 flex items-center gap-2 rounded-md border border-gov-200 bg-gov-50/70 px-3 py-2 text-[0.76rem] font-semibold text-gov-800 dark:border-gov-700 dark:bg-gov-900/40 dark:text-gov-200">
                      <ScanLine size={14} className="shrink-0 text-leaf-600" aria-hidden />
                      {ocrStatus}
                    </p>
                  ) : null}
                  <ul className="mt-5 space-y-2.5">
                    {STEPS.map((s, i) => {
                      const done = step > i;
                      const active = step === i;
                      return (
                        <li
                          key={s}
                          className={cx(
                            "flex items-center gap-3 rounded-md border px-4 py-3 transition",
                            done
                              ? "border-leaf-500/40 bg-leaf-500/8"
                              : active
                                ? "border-gov-400 bg-gov-50"
                                : "border-slate-200 bg-slate-50 opacity-60 dark:border-white/10 dark:bg-white/5",
                          )}
                        >
                          <span
                            className={cx(
                              "grid h-6 w-6 shrink-0 place-items-center rounded-full text-white",
                              done ? "bg-leaf-600" : active ? "bg-gov-600" : "bg-slate-400",
                            )}
                          >
                            {done ? (
                              <CheckCircle2 size={14} />
                            ) : active ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <span className="text-[0.65rem] font-bold">{i + 1}</span>
                            )}
                          </span>
                          <span className="text-[0.83rem] font-semibold text-slate-700 dark:text-slate-200">
                            {t(s)}
                          </span>
                          <span className="ml-auto text-[0.68rem] font-bold uppercase tracking-wide text-slate-500">
                            {done ? (lang === "hi" ? "पूर्ण" : "Done") : active ? (lang === "hi" ? "चल रहा है" : "Running") : ""}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Card>
            ) : null}

            {phase === "done" && result ? (
              <CompletionCard
                result={result}
                onReset={reset}
                onUpdate={mutateResult}
                actorName={actorName}
                actorRole={actorRole}
              />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
/* ------------------------------------------------------------------ */
/*  Completion summary — the detailed document lives on /report/:id    */
/* ------------------------------------------------------------------ */

function CompletionCard({
  result: r,
  onReset,
  onUpdate,
  actorName,
  actorRole,
}: {
  result: VerificationResult;
  onReset: () => void;
  onUpdate: ResultUpdater;
  actorName: string;
  actorRole: string;
}) {
  const { t, lang, toast, verifications, addVerification } = useApp();
  const [saved, setSaved] = useState(false);
  const meta = VERDICT_META[r.verdict];
  const VerdictIcon =
    r.verdict === "verified" ? ShieldCheck : r.verdict === "review" ? AlertTriangle : ShieldAlert;

  const counts = [
    { label: lang === "hi" ? "मुख्य निष्कर्ष" : "Key Findings", n: r.keyFindings.length, to: "findings" },
    {
      label: lang === "hi" ? "फ़ोरेंसिक जाँच पास" : "Forensic checks passed",
      n: `${r.checks.filter((c) => c.passed).length}/${r.checks.length}`,
      to: "checks",
    },
    {
      label: lang === "hi" ? "मानव समीक्षा" : "Human review",
      n: r.officerReview ? r.officerReview.decision.toUpperCase() : lang === "hi" ? "प्रतीक्षित" : "PENDING",
      to: "review",
    },
    { label: lang === "hi" ? "ऑडिट प्रविष्टियाँ" : "Audit entries", n: r.auditTrail.length, to: "audit" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Card className="overflow-hidden">
        {/* verdict banner */}
        <div
          className={cx(
            "flex flex-wrap items-center gap-4 border-b px-5 py-5",
            r.verdict === "verified"
              ? "border-leaf-500/30 bg-leaf-500/10"
              : r.verdict === "review"
                ? "border-saffron-500/30 bg-saffron-500/10"
                : "border-red-500/30 bg-red-500/10",
          )}
        >
          <span
            className={cx(
              "grid h-14 w-14 shrink-0 place-items-center rounded-full text-white shadow-lg",
              r.verdict === "verified"
                ? "bg-leaf-600"
                : r.verdict === "review"
                  ? "bg-saffron-500"
                  : "bg-red-600",
            )}
          >
            <VerdictIcon size={28} />
          </span>
          <div className="min-w-0">
            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {lang === "hi" ? "सत्यापन पूर्ण" : "Verification complete"}
            </p>
            <h2 className={cx("text-2xl font-extrabold tracking-tight", meta.color)}>
              {lang === "hi" ? meta.hi : meta.en}
            </h2>
            <p className="tabular mt-0.5 text-[0.75rem] text-slate-600 dark:text-slate-300">
              {t("v.ref")}: <strong>{r.id}</strong> · {r.fileName}
            </p>
          </div>
          <div className="ml-auto text-center">
            <p className="tabular text-4xl font-extrabold leading-none text-gov-900 dark:text-white">
              {r.confidence.toFixed(1)}
              <span className="text-xl">%</span>
            </p>
            <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("card.confidence")}
            </p>
          </div>
        </div>

        {/* OCR holder + counters */}
        <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-5 dark:bg-white/10">
          <div className="bg-white px-5 py-4 sm:col-span-2 lg:col-span-2 dark:bg-gov-950">
            <p className="text-[0.66rem] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              OCR · {lang === "hi" ? "खातेदार का नाम" : "Record-holder name"}
            </p>
            <p className="mt-1 text-[1.05rem] font-extrabold leading-tight text-gov-900 dark:text-white">
              {lang === "hi" ? r.ownerNameHi : r.ownerName}
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge tone={r.source === "demo" ? "green" : "blue"}>
                {r.source === "demo"
                  ? lang === "hi"
                    ? "अनुक्रमित नमूना"
                    : "Indexed sample"
                  : lang === "hi"
                    ? "आपकी अपलोड"
                    : "Your upload"}
              </Badge>
              <Badge tone="neutral">{r.docType}</Badge>
            </p>
          </div>
          {counts.map((c) => (
            <div key={c.label} className="bg-white px-5 py-4 dark:bg-gov-950">
              <p className="text-[0.66rem] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {c.label}
              </p>
              <p className="tabular mt-1 text-xl font-extrabold text-gov-900 dark:text-white">{c.n}</p>
            </div>
          ))}
        </div>

        {/* actions */}
        <div className="flex flex-wrap items-center gap-2.5 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-white/5">
          <Link to={`/report/${encodeURIComponent(r.id)}`}>
            <Button size="lg">
              <FileText size={17} />
              {lang === "hi" ? "पूर्ण-पृष्ठ रिपोर्ट देखें" : "View Full Page Report"}
            </Button>
          </Link>
          <Button
            variant="secondary"
            disabled={saved}
            onClick={() => {
              if (verifications.some((x) => x.id === r.id)) {
                setSaved(true);
                toast(
                  lang === "hi" ? "यह रिपोर्ट पहले से सहेजी गई है" : "This report is already saved",
                  "info",
                );
                return;
              }
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
                    `रिपोर्ट ${r.id} बाद में अधिकारी समीक्षा हेतु उपयोगकर्ता के डैशबोर्ड में सहेजी गई।`,
                  ),
                ],
              };
              addVerification(stamped);
              onUpdate(() => stamped);
              setSaved(true);
              toast(lang === "hi" ? "डैशबोर्ड में सहेजा गया" : "Saved to your dashboard");
            }}
          >
            <Save size={16} />
            {saved ? (lang === "hi" ? "सहेजा गया ✓" : "Saved ✓") : t("v.save")}
          </Button>
          <Button variant="ghost" onClick={onReset}>
            <RotateCcw size={16} />
            {t("v.another")}
          </Button>
          <p className="ml-auto text-[0.74rem] text-slate-500 dark:text-slate-400">
            {lang === "hi"
              ? "मुख्य निष्कर्ष, एआई राय, मानव समीक्षा एवं ऑडिट ट्रेल पूर्ण-पृष्ठ रिपोर्ट पर हैं।"
              : "Key findings, AI opinion, human review and the audit trail are on the full page report."}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
