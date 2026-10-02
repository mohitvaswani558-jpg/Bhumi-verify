import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  IndianRupee,
  Loader2,
  PartyPopper,
  Search,
  Send,
  User,
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
  Textarea,
  cx,
} from "../components/ui";
import { STATES } from "../lib/data";
import type { RtiApplication } from "../lib/types";

const PIOS = [
  "PIO — BhoomiVerify AI Cell, Dept. of Land Resources, New Delhi",
  "PIO — Directorate of Land Records, Uttar Pradesh",
  "PIO — Directorate of Settlement & Land Records, Maharashtra",
  "PIO — Directorate of Land Records, Karnataka",
  "PIO — Directorate of Land Records, Rajasthan",
  "PIO — Directorate of Land Records, Bihar",
];

const SEED: RtiApplication[] = [
  {
    id: "r1",
    regNo: "RTI/DLR/2026/004821",
    applicant: "Anil Kumar Sharma",
    subject: "Status of mutation application MUT/LKN/2025/4412",
    filedOn: "2026-08-19",
    status: "Info Provided",
    fee: 10,
    timeline: [
      { date: "2026-08-19", label: "Application received by CPIO", done: true },
      { date: "2026-08-21", label: "Forwarded to Tehsil Office, Malihabad", done: true },
      { date: "2026-09-02", label: "Information compiled & vetted", done: true },
      { date: "2026-09-09", label: "Reply dispatched by speed post", done: true },
    ],
  },
  {
    id: "r2",
    regNo: "RTI/DLR/2026/005190",
    applicant: "Sunita Devi Yadav",
    subject: "Certified copy of Khasra 214/3, Village Kakori",
    filedOn: "2026-09-11",
    status: "Under Review",
    fee: 10,
    timeline: [
      { date: "2026-09-11", label: "Application received by CPIO", done: true },
      { date: "2026-09-14", label: "Forwarded to District Land Records Officer", done: true },
      { date: "", label: "Information compiled & vetted", done: false },
      { date: "", label: "Reply dispatched", done: false },
    ],
  },
];

export default function RTI() {
  const { t, lang, toast, rtis, addRti, session } = useApp();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const [tab, setTab] = useState<"new" | "track" | "mine">("new");
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<RtiApplication | null>(null);

  const [form, setForm] = useState({
    name: session?.name ?? "",
    email: "",
    phone: "",
    address: "",
    state: STATES[0],
    pincode: "",
    pio: PIOS[0],
    subject: "",
    details: "",
    period: "",
    bpl: false,
    payMode: "UPI",
    declared: false,
  });

  const [trackNo, setTrackNo] = useState("");
  const [trackResult, setTrackResult] = useState<RtiApplication | null | "none">("none");

  const all = useMemo(() => [...rtis, ...SEED], [rtis]);

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (form.name.trim().length < 3) e.name = t("c.required");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = L("Enter a valid email address.", "मान्य ईमेल पता दर्ज करें।");
      if (!/^[6-9]\d{9}$/.test(form.phone))
        e.phone = L("Enter a valid 10-digit mobile number.", "मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।");
      if (form.address.trim().length < 10)
        e.address = L("Complete postal address is required.", "पूर्ण डाक पता आवश्यक है।");
      if (!/^\d{6}$/.test(form.pincode)) e.pincode = L("PIN code must be 6 digits.", "पिन कोड 6 अंकों का होना चाहिए।");
    }
    if (s === 1) {
      if (form.subject.trim().length < 8)
        e.subject = L("Subject must be at least 8 characters.", "विषय कम से कम 8 अक्षरों का हो।");
      if (form.details.trim().length < 30)
        e.details = L("Please describe the information sought (min. 30 characters).", "कृपया मांगी गई सूचना का विवरण दें (न्यूनतम 30 अक्षर)।");
    }
    if (s === 2) {
      if (!form.declared) e.declared = L("Declaration must be accepted.", "घोषणा स्वीकार करना आवश्यक है।");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validateStep(2)) return;
    setBusy(true);
    window.setTimeout(() => {
      const now = new Date();
      const regNo = `RTI/DLR/${now.getFullYear()}/${String(
        Math.floor(Math.random() * 900000) + 100000,
      )}`;
      const app: RtiApplication = {
        id: `rti-${now.getTime()}`,
        regNo,
        applicant: form.name,
        subject: form.subject,
        filedOn: now.toISOString().slice(0, 10),
        status: "Received",
        fee: form.bpl ? 0 : 10,
        timeline: [
          {
            date: now.toISOString().slice(0, 10),
            label: "Application received by CPIO",
            done: true,
          },
          { date: "", label: "Forwarded to the concerned public authority", done: false },
          { date: "", label: "Information compiled & vetted", done: false },
          { date: "", label: "Reply dispatched to the applicant", done: false },
        ],
      };
      addRti(app);
      setCreated(app);
      setStep(3);
      setBusy(false);
      toast(L("RTI application registered successfully", "आरटीआई आवेदन सफलतापूर्वक पंजीकृत"));
    }, 1100);
  };

  const steps = [t("rti.step1"), t("rti.step2"), t("rti.step3"), t("rti.step4")];

  return (
    <>
      <PageHeader
        title={t("rti.title")}
        subtitle={t("rti.sub")}
        icon={<FileText size={22} />}
        breadcrumb={[{ label: t("nav.home"), to: "/" }, { label: t("nav.rti") }]}
        actions={
          <Badge tone="blue">
            <Clock size={12} /> {L("30-day statutory reply", "30-दिन वैधानिक उत्तर")}
          </Badge>
        }
      />

      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
        {/* tabs */}
        <div
          role="tablist"
          className="mb-6 inline-flex flex-wrap gap-1.5 rounded-lg border border-slate-200 bg-white p-1.5 dark:border-white/10 dark:bg-gov-950/70"
        >
          {(
            [
              { id: "new", label: t("rti.new"), icon: Send },
              { id: "track", label: t("rti.track"), icon: Search },
              { id: "mine", label: t("rti.mine"), icon: FileText },
            ] as const
          ).map((x) => {
            const Icon = x.icon;
            return (
              <button
                key={x.id}
                role="tab"
                aria-selected={tab === x.id}
                type="button"
                onClick={() => setTab(x.id)}
                className={cx(
                  "flex items-center gap-2 rounded-md px-4 py-2.5 text-[0.84rem] font-bold transition",
                  tab === x.id
                    ? "bg-gov-700 text-white shadow"
                    : "text-slate-600 hover:bg-gov-50 hover:text-gov-700 dark:text-slate-300 dark:hover:bg-white/10",
                )}
              >
                <Icon size={15} aria-hidden />
                {x.label}
              </button>
            );
          })}
        </div>

        {/* ---------------------------- FILE NEW ---------------------------- */}
        {tab === "new" ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Card>
              {/* stepper */}
              <ol className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50/70 px-5 py-4 dark:border-white/10 dark:bg-white/5">
                {steps.map((s, i) => (
                  <li key={s} className="flex items-center gap-2">
                    <span
                      className={cx(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[0.72rem] font-extrabold transition",
                        i < step
                          ? "bg-leaf-600 text-white"
                          : i === step
                            ? "bg-gov-700 text-white ring-4 ring-gov-500/20"
                            : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400",
                      )}
                    >
                      {i < step ? <CheckCircle2 size={14} /> : i + 1}
                    </span>
                    <span
                      className={cx(
                        "text-[0.78rem] font-bold",
                        i === step ? "text-gov-800 dark:text-white" : "text-slate-500 dark:text-slate-400",
                      )}
                    >
                      {s}
                    </span>
                    {i < steps.length - 1 ? (
                      <ChevronRight size={14} className="mx-1 text-slate-300 dark:text-white/20" aria-hidden />
                    ) : null}
                  </li>
                ))}
              </ol>

              <div className="p-5 sm:p-6">
                {step === 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="r-name" required>
                        {t("c.name")}
                      </Label>
                      <Input
                        id="r-name"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        invalid={!!errors.name}
                      />
                      <FieldError>{errors.name}</FieldError>
                    </div>
                    <div>
                      <Label htmlFor="r-email" required>
                        {t("c.email")}
                      </Label>
                      <Input
                        id="r-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        invalid={!!errors.email}
                      />
                      <FieldError>{errors.email}</FieldError>
                    </div>
                    <div>
                      <Label htmlFor="r-phone" required>
                        {t("c.phone")}
                      </Label>
                      <Input
                        id="r-phone"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                        invalid={!!errors.phone}
                      />
                      <FieldError>{errors.phone}</FieldError>
                    </div>
                    <div>
                      <Label htmlFor="r-pin" required>
                        {L("PIN Code", "पिन कोड")}
                      </Label>
                      <Input
                        id="r-pin"
                        inputMode="numeric"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
                        invalid={!!errors.pincode}
                      />
                      <FieldError>{errors.pincode}</FieldError>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="r-addr" required>
                        {L("Postal Address", "डाक पता")}
                      </Label>
                      <Textarea
                        id="r-addr"
                        value={form.address}
                        onChange={(e) => set("address", e.target.value)}
                        invalid={!!errors.address}
                        className="min-h-20"
                      />
                      <FieldError>{errors.address}</FieldError>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="r-state" required>
                        {t("v.state")}
                      </Label>
                      <Select id="r-state" value={form.state} onChange={(e) => set("state", e.target.value)}>
                        {STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                ) : null}

                {step === 1 ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="r-pio" required>
                        {t("rti.pio")}
                      </Label>
                      <Select id="r-pio" value={form.pio} onChange={(e) => set("pio", e.target.value)}>
                        {PIOS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="r-subject" required>
                        {t("rti.subject")}
                      </Label>
                      <Input
                        id="r-subject"
                        value={form.subject}
                        onChange={(e) => set("subject", e.target.value)}
                        invalid={!!errors.subject}
                        placeholder={L(
                          "e.g. Certified copy of Khasra 214/3, Village Kakori",
                          "जैसे खसरा 214/3, ग्राम काकोरी की प्रमाणित प्रति",
                        )}
                      />
                      <FieldError>{errors.subject}</FieldError>
                    </div>
                    <div>
                      <Label htmlFor="r-details" required>
                        {t("rti.details")}
                      </Label>
                      <Textarea
                        id="r-details"
                        value={form.details}
                        onChange={(e) => set("details", e.target.value)}
                        invalid={!!errors.details}
                        className="min-h-40"
                        placeholder={L(
                          "Describe point-wise the information you require…",
                          "बिंदुवार वर्णन करें कि आपको कौन-सी सूचना चाहिए…",
                        )}
                      />
                      <FieldError>{errors.details}</FieldError>
                      <p className="tabular mt-1 text-right text-[0.7rem] text-slate-400">
                        {form.details.length} / 3000
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="r-period">{t("rti.period")}</Label>
                      <Input
                        id="r-period"
                        value={form.period}
                        onChange={(e) => set("period", e.target.value)}
                        placeholder={L("e.g. January 2024 to August 2026", "जैसे जनवरी 2024 से अगस्त 2026")}
                      />
                    </div>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="space-y-5">
                    <div className="rounded-lg border border-gov-200 bg-gov-50/70 p-4 dark:border-gov-700 dark:bg-gov-900/40">
                      <h3 className="flex items-center gap-2 text-[0.88rem] font-bold text-gov-900 dark:text-white">
                        <IndianRupee size={15} className="text-leaf-600" />
                        {t("rti.fee")}
                      </h3>
                      <p className="mt-1.5 text-[0.78rem] leading-relaxed text-slate-600 dark:text-slate-300">
                        {t("rti.feeNote")}
                      </p>
                      <label className="mt-3 flex cursor-pointer items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 py-2.5 dark:border-white/15 dark:bg-gov-950">
                        <input
                          type="checkbox"
                          checked={form.bpl}
                          onChange={(e) => set("bpl", e.target.checked)}
                          className="h-4 w-4 accent-leaf-600"
                        />
                        <span className="text-[0.82rem] font-medium text-slate-700 dark:text-slate-200">
                          {t("rti.bpl")}
                        </span>
                      </label>
                    </div>

                    <div>
                      <Label htmlFor="r-pay">{L("Payment Mode", "भुगतान माध्यम")}</Label>
                      <Select
                        id="r-pay"
                        value={form.payMode}
                        disabled={form.bpl}
                        onChange={(e) => set("payMode", e.target.value)}
                      >
                        {["UPI", "Net Banking", "Debit Card", "Credit Card", "IPO / DD"].map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </Select>
                      <div className="mt-3 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                        <span className="text-[0.82rem] font-semibold text-slate-600 dark:text-slate-300">
                          {L("Amount payable", "देय राशि")}
                        </span>
                        <span className="tabular text-lg font-extrabold text-gov-800 dark:text-white">
                          ₹{form.bpl ? 0 : 10}.00
                        </span>
                      </div>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-white p-4 dark:border-white/15 dark:bg-gov-950">
                      <input
                        type="checkbox"
                        checked={form.declared}
                        onChange={(e) => set("declared", e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-gov-700"
                      />
                      <span className="text-[0.82rem] leading-relaxed text-slate-700 dark:text-slate-200">
                        {t("rti.declare")}
                      </span>
                    </label>
                    <FieldError>{errors.declared}</FieldError>
                  </div>
                ) : null}

                {step === 3 && created ? (
                  <div className="py-4 text-center">
                    <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-leaf-500/15 text-leaf-600">
                      <PartyPopper size={32} />
                    </span>
                    <h3 className="mt-4 text-xl font-extrabold text-gov-900 dark:text-white">
                      {L("Application Registered", "आवेदन पंजीकृत")}
                    </h3>
                    <p className="mx-auto mt-2 max-w-lg text-[0.85rem] leading-relaxed text-slate-600 dark:text-slate-300">
                      {t("rti.success")}
                    </p>
                    <div className="mx-auto mt-5 max-w-md rounded-lg border-2 border-dashed border-gov-300 bg-gov-50/70 p-4 dark:border-gov-600 dark:bg-gov-900/40">
                      <p className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {t("rti.regNo")}
                      </p>
                      <p className="tabular mt-1 text-xl font-extrabold tracking-wide text-gov-800 dark:text-white">
                        {created.regNo}
                      </p>
                      <p className="mt-2 text-[0.75rem] text-slate-500 dark:text-slate-400">
                        {t("rti.replyDays")}
                      </p>
                    </div>
                    <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                      <Button
                        onClick={() => {
                          setTrackNo(created.regNo);
                          setTrackResult(created);
                          setTab("track");
                        }}
                      >
                        <Search size={16} /> {t("rti.track")}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setStep(0);
                          setCreated(null);
                          setForm((f) => ({ ...f, subject: "", details: "", declared: false }));
                        }}
                      >
                        {L("File another RTI", "एक और आरटीआई दर्ज करें")}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {step < 3 ? (
                  <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-white/10">
                    <Button
                      variant="secondary"
                      disabled={step === 0}
                      onClick={() => setStep((s) => Math.max(0, s - 1))}
                    >
                      <ChevronLeft size={16} /> {t("c.back")}
                    </Button>
                    {step < 2 ? (
                      <Button
                        onClick={() => {
                          if (validateStep(step)) setStep((s) => s + 1);
                        }}
                      >
                        {t("c.next")} <ChevronRight size={16} />
                      </Button>
                    ) : (
                      <Button onClick={submit} disabled={busy}>
                        {busy ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Send size={16} />
                        )}
                        {L("Pay ₹10 & Submit", "₹10 भुगतान करें एवं जमा करें")}
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>
            </Card>

            <aside className="space-y-5">
              <Card>
                <CardHeader title={L("Before you file", "दर्ज करने से पहले")} icon={<User size={15} />} />
                <ul className="space-y-3 p-5 text-[0.8rem] leading-relaxed text-slate-600 dark:text-slate-300">
                  {[
                    L(
                      "Only Indian citizens may file an RTI application under Section 3 of the Act.",
                      "अधिनियम की धारा 3 के अंतर्गत केवल भारतीय नागरिक आरटीआई आवेदन दे सकते हैं।",
                    ),
                    L(
                      "Information exempt under Sections 8 and 9 cannot be sought.",
                      "धारा 8 एवं 9 के अंतर्गत छूट प्राप्त सूचना नहीं मांगी जा सकती।",
                    ),
                    L(
                      "Give the period and the specific records you need — vague requests are usually rejected.",
                      "अवधि और विशिष्ट अभिलेख अवश्य बताएँ — अस्पष्ट अनुरोध प्रायः अस्वीकृत होते हैं।",
                    ),
                    L(
                      "Additional charges of ₹2 per page may apply for voluminous information.",
                      "अधिक जानकारी हेतु ₹2 प्रति पृष्ठ अतिरिक्त शुल्क लग सकता है।",
                    ),
                  ].map((x, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gov-700 text-[0.65rem] font-bold text-white">
                        {i + 1}
                      </span>
                      {x}
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="border-saffron-500/40 bg-saffron-500/8">
                <div className="p-5 text-[0.8rem] leading-relaxed text-slate-700 dark:text-slate-200">
                  <p className="font-bold text-saffron-600 dark:text-saffron-400">
                    {L("First Appeal", "प्रथम अपील")}
                  </p>
                  <p className="mt-1.5">
                    {L(
                      "If no reply is received within 30 days, or the reply is unsatisfactory, file a first appeal before the Appellate Authority within 30 days.",
                      "यदि 30 दिनों में उत्तर न मिले या उत्तर असंतोषजनक हो, तो 30 दिनों के भीतर अपीलीय प्राधिकारी के समक्ष प्रथम अपील करें।",
                    )}
                  </p>
                  <Link to="/help" className="mt-3 inline-block font-bold text-gov-700 hover:underline dark:text-gov-300">
                    {L("Read the RTI handbook", "आरटीआई हैंडबुक पढ़ें")} →
                  </Link>
                </div>
              </Card>
            </aside>
          </div>
        ) : null}

        {/* ------------------------------ TRACK ------------------------------ */}
        {tab === "track" ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Card>
              <CardHeader title={t("rti.track")} icon={<Search size={15} />} />
              <div className="p-5">
                <form
                  className="flex flex-wrap items-end gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const found = all.find(
                      (a) => a.regNo.toLowerCase() === trackNo.trim().toLowerCase(),
                    );
                    setTrackResult(found ?? "none");
                    if (!found)
                      toast(L("No application found with that number", "इस संख्या से कोई आवेदन नहीं मिला"), "error");
                  }}
                >
                  <div className="min-w-[16rem] flex-1">
                    <Label htmlFor="track" required>
                      {t("rti.regNo")}
                    </Label>
                    <Input
                      id="track"
                      value={trackNo}
                      onChange={(e) => setTrackNo(e.target.value)}
                      placeholder="RTI/DLR/2026/004821"
                    />
                  </div>
                  <Button type="submit" size="lg">
                    <Search size={17} /> {t("rti.track")}
                  </Button>
                </form>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-[0.75rem] text-slate-500 dark:text-slate-400">
                    {L("Try a sample:", "नमूना आज़माएँ:")}
                  </span>
                  {SEED.map((s) => (
                    <button
                      key={s.regNo}
                      type="button"
                      onClick={() => {
                        setTrackNo(s.regNo);
                        setTrackResult(s);
                      }}
                      className="tabular rounded border border-gov-300 px-2 py-0.5 text-[0.72rem] font-bold text-gov-700 transition hover:bg-gov-700 hover:text-white dark:border-gov-600 dark:text-gov-300"
                    >
                      {s.regNo}
                    </button>
                  ))}
                </div>

                {trackResult === "none" && trackNo ? (
                  <p className="mt-6 rounded-md border border-red-500/40 bg-red-500/8 px-4 py-3 text-[0.82rem] font-semibold text-red-700 dark:text-red-400">
                    {L(
                      "No application matches this registration number. Please verify the number printed on your acknowledgement.",
                      "इस पंजीकरण संख्या से कोई आवेदन मेल नहीं खाता। कृपया अपनी पावती पर अंकित संख्या जाँचें।",
                    )}
                  </p>
                ) : null}

                {trackResult && trackResult !== "none" ? (
                  <div className="mt-6">
                    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="min-w-0 flex-1">
                        <p className="tabular text-[0.95rem] font-extrabold text-gov-900 dark:text-white">
                          {trackResult.regNo}
                        </p>
                        <p className="mt-0.5 truncate text-[0.8rem] text-slate-600 dark:text-slate-300">
                          {trackResult.subject}
                        </p>
                        <p className="mt-1 text-[0.72rem] text-slate-500 dark:text-slate-400">
                          {L("Applicant", "आवेदक")}: <strong>{trackResult.applicant}</strong> ·{" "}
                          {L("Filed on", "दाखिल तिथि")}: {trackResult.filedOn} ·{" "}
                          {L("Fee", "शुल्क")}: ₹{trackResult.fee}
                        </p>
                      </div>
                      <Badge
                        tone={
                          trackResult.status === "Info Provided"
                            ? "green"
                            : trackResult.status === "Rejected"
                              ? "red"
                              : "amber"
                        }
                      >
                        {trackResult.status}
                      </Badge>
                    </div>

                    <ol className="relative mt-6 space-y-5 pl-8">
                      <span
                        className="absolute bottom-3 left-[0.68rem] top-3 w-0.5 bg-slate-200 dark:bg-white/15"
                        aria-hidden
                      />
                      {trackResult.timeline.map((tl, i) => (
                        <li key={i} className="relative">
                          <span
                            className={cx(
                              "absolute -left-8 top-0.5 grid h-6 w-6 place-items-center rounded-full border-2 border-white shadow dark:border-gov-950",
                              tl.done ? "bg-leaf-600 text-white" : "bg-slate-200 text-slate-500 dark:bg-white/10",
                            )}
                          >
                            {tl.done ? <CheckCircle2 size={13} /> : <Clock size={12} />}
                          </span>
                          <p className="text-[0.85rem] font-bold text-slate-800 dark:text-slate-100">
                            {tl.label}
                          </p>
                          <p className="tabular mt-0.5 text-[0.72rem] text-slate-500 dark:text-slate-400">
                            {tl.date || L("Pending", "लंबित")}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </div>
            </Card>

            <Card className="h-fit">
              <CardHeader title={L("Statutory timelines", "वैधानिक समय-सीमा")} icon={<Clock size={15} />} />
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
                {[
                  [L("Normal reply", "सामान्य उत्तर"), L("30 days", "30 दिन")],
                  [L("Life & liberty matters", "जीवन एवं स्वतंत्रता"), L("48 hours", "48 घंटे")],
                  [L("Transfer to another PIO", "अन्य PIO को अंतरण"), L("5 days", "5 दिन")],
                  [L("First appeal", "प्रथम अपील"), L("30 days", "30 दिन")],
                  [L("Second appeal (CIC)", "द्वितीय अपील (CIC)"), L("90 days", "90 दिन")],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between gap-3 px-5 py-3 text-[0.8rem]">
                    <span className="text-slate-600 dark:text-slate-300">{k}</span>
                    <span className="font-bold text-gov-800 dark:text-gov-200">{v}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        ) : null}

        {/* ------------------------------ MINE ------------------------------ */}
        {tab === "mine" ? (
          <Card>
            <CardHeader
              title={t("rti.mine")}
              icon={<FileText size={15} />}
              action={
                <span className="rounded bg-gov-50 px-2 py-0.5 text-[0.72rem] font-bold text-gov-700 dark:bg-gov-800 dark:text-gov-200">
                  {all.length}
                </span>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] text-left text-[0.82rem]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[0.68rem] uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    <th className="px-4 py-3 font-bold">{t("rti.regNo")}</th>
                    <th className="px-4 py-3 font-bold">{t("rti.subject")}</th>
                    <th className="px-4 py-3 font-bold">{L("Filed on", "दाखिल तिथि")}</th>
                    <th className="px-4 py-3 font-bold">{t("rti.fee")}</th>
                    <th className="px-4 py-3 font-bold">{t("c.status")}</th>
                    <th className="px-4 py-3 text-center font-bold">{t("c.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {all.map((a) => (
                    <tr key={a.id} className="transition hover:bg-gov-50/70 dark:hover:bg-white/5">
                      <td className="tabular px-4 py-3 font-bold text-gov-700 dark:text-gov-300">
                        {a.regNo}
                      </td>
                      <td className="max-w-[22rem] px-4 py-3 text-slate-700 dark:text-slate-200">
                        {a.subject}
                        <span className="mt-0.5 block text-[0.7rem] text-slate-400">
                          {L("Applicant", "आवेदक")}: {a.applicant}
                        </span>
                      </td>
                      <td className="tabular px-4 py-3 text-slate-600 dark:text-slate-300">{a.filedOn}</td>
                      <td className="tabular px-4 py-3 text-slate-600 dark:text-slate-300">₹{a.fee}</td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            a.status === "Info Provided"
                              ? "green"
                              : a.status === "Rejected"
                                ? "red"
                                : "amber"
                          }
                        >
                          {a.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setTrackNo(a.regNo);
                            setTrackResult(a);
                            setTab("track");
                          }}
                        >
                          {t("rti.track")} <ChevronRight size={13} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : null}
      </div>
    </>
  );
}
