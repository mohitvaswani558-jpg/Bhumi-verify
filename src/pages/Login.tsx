import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Smartphone,
  User,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  Button,
  Card,
  FieldError,
  Input,
  Label,
  PageHeader,
  Select,
  cx,
} from "../components/ui";
import { BhoomiLogo } from "../components/Emblems";

const DEMO_OTP = "481926";
type Tab = "mobile" | "email" | "epramaan";

export default function Login() {
  const { t, lang, login, toast, session } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [tab, setTab] = useState<Tab>("mobile");
  const [role, setRole] = useState<"citizen" | "officer">("citizen");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (session) navigate(from, { replace: true });
  }, [session, navigate, from]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [countdown]);

  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const sendOtp = () => {
    setError(null);
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError(L("Enter a valid 10-digit Indian mobile number.", "मान्य 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें।"));
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setOtpSent(true);
      setCountdown(30);
      toast(L(`OTP sent to +91-${mobile}`, `ओटीपी +91-${mobile} पर भेजा गया`), "info");
      window.setTimeout(() => otpRefs.current[0]?.focus(), 60);
    }, 900);
  };

  const finish = (identifier: string, method: string, displayName: string) => {
    setBusy(true);
    window.setTimeout(() => {
      login({
        name: displayName,
        identifier,
        role,
        method,
        loggedInAt: new Date().toISOString(),
      });
      setBusy(false);
      toast(`${t("lg.welcome")}, ${displayName}!`);
      navigate(from, { replace: true });
    }, 800);
  };

  const verifyOtp = () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError(L("Enter the complete 6-digit OTP.", "पूर्ण 6-अंकीय ओटीपी दर्ज करें।"));
      return;
    }
    if (code !== DEMO_OTP) {
      setError(
        L(
          `Incorrect OTP. Use the demo code ${DEMO_OTP} for this prototype.`,
          `गलत ओटीपी। इस प्रोटोटाइप हेतु डेमो कोड ${DEMO_OTP} उपयोग करें।`,
        ),
      );
      toast(L("OTP verification failed", "ओटीपी सत्यापन विफल"), "error");
      return;
    }
    setError(null);
    const displayName =
      name.trim() || (role === "officer" ? "Revenue Officer" : "Registered Citizen");
    finish(`+91-${mobile}`, "Mobile OTP", displayName);
  };

  const onOtpChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    setOtp((prev) => prev.map((x, idx) => (idx === i ? digit : x)));
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const onOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const TABS: { id: Tab; label: string; icon: typeof Smartphone }[] = [
    { id: "mobile", label: t("lg.mobile"), icon: Smartphone },
    { id: "email", label: t("lg.email"), icon: Mail },
    { id: "epramaan", label: t("lg.epramaan"), icon: Fingerprint },
  ];

  return (
    <>
      <PageHeader
        title={t("lg.title")}
        subtitle={t("lg.sub")}
        icon={<LogIn size={22} />}
        breadcrumb={[{ label: t("nav.home"), to: "/" }, { label: t("nav.login") }]}
      />

      <div className="mx-auto grid max-w-[1240px] gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-200 bg-gov-50/60 px-5 py-4 dark:border-white/10 dark:bg-white/5">
            <BhoomiLogo className="h-10 w-10" />
            <div>
              <h2 className="text-[0.98rem] font-bold text-gov-900 dark:text-white">
                {L("Secure Sign-in", "सुरक्षित साइन-इन")}
              </h2>
              <p className="text-[0.72rem] text-slate-500 dark:text-slate-400">
                {L(
                  "Authentication is proxied through ePramaan, the Government of India digital identity framework.",
                  "प्रमाणीकरण भारत सरकार के डिजिटल पहचान ढाँचे ई-प्रमाण के माध्यम से किया जाता है।",
                )}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* tabs */}
            <div
              role="tablist"
              aria-label="Login method"
              className="mb-6 grid gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1.5 sm:grid-cols-3 dark:border-white/10 dark:bg-white/5"
            >
              {TABS.map((x) => {
                const Icon = x.icon;
                const active = tab === x.id;
                return (
                  <button
                    key={x.id}
                    role="tab"
                    aria-selected={active}
                    type="button"
                    onClick={() => {
                      setTab(x.id);
                      setError(null);
                      setOtpSent(false);
                    }}
                    className={cx(
                      "flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-[0.82rem] font-bold transition",
                      active
                        ? "bg-white text-gov-800 shadow dark:bg-gov-800 dark:text-white"
                        : "text-slate-500 hover:text-gov-700 dark:text-slate-400 dark:hover:text-white",
                    )}
                  >
                    <Icon size={16} aria-hidden />
                    {x.label}
                  </button>
                );
              })}
            </div>

            {/* role */}
            <div className="mb-5 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="role">{t("lg.role")}</Label>
                <Select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as "citizen" | "officer")}
                >
                  <option value="citizen">{t("lg.citizen")}</option>
                  <option value="officer">{t("lg.officer")}</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">{t("c.name")}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={L("e.g. Anil Kumar Sharma", "जैसे अनिल कुमार शर्मा")}
                />
              </div>
            </div>

            {tab === "mobile" ? (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="mobile" required>
                    {t("c.phone")}
                  </Label>
                  <div className="flex">
                    <span className="tabular grid place-items-center rounded-l-md border border-r-0 border-slate-300 bg-slate-100 px-3 text-sm font-bold text-slate-600 dark:border-white/15 dark:bg-white/10 dark:text-slate-300">
                      +91
                    </span>
                    <Input
                      id="mobile"
                      inputMode="numeric"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="98XXXXXXXX"
                      className="rounded-l-none"
                      disabled={otpSent}
                    />
                  </div>
                </div>

                {otpSent ? (
                  <div className="rounded-lg border border-gov-200 bg-gov-50/70 p-4 dark:border-gov-700 dark:bg-gov-900/40">
                    <p className="flex items-center gap-2 text-[0.82rem] font-bold text-gov-900 dark:text-white">
                      <ShieldCheck size={15} className="text-leaf-600" />
                      {L(`OTP sent to +91-${mobile}`, `ओटीपी +91-${mobile} पर भेजा गया`)}
                    </p>
                    <p className="mt-1 text-[0.75rem] text-slate-600 dark:text-slate-300">
                      {t("lg.demo")}
                      <button
                        type="button"
                        onClick={() => setOtp(DEMO_OTP.split(""))}
                        className="tabular ml-1.5 rounded bg-saffron-500 px-2 py-0.5 font-mono font-extrabold tracking-widest text-white transition hover:bg-saffron-400"
                      >
                        {DEMO_OTP}
                      </button>
                    </p>

                    <div className="mt-4 flex gap-2" role="group" aria-label={t("lg.otp")}>
                      {otp.map((d, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            otpRefs.current[i] = el;
                          }}
                          value={d}
                          onChange={(e) => onOtpChange(i, e.target.value)}
                          onKeyDown={(e) => onOtpKey(i, e)}
                          onPaste={(e) => {
                            const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                            if (txt.length) {
                              e.preventDefault();
                              setOtp(txt.split("").concat(["", "", "", "", "", ""]).slice(0, 6));
                            }
                          }}
                          inputMode="numeric"
                          maxLength={1}
                          aria-label={`OTP digit ${i + 1}`}
                          className="tabular h-12 w-full rounded-md border border-slate-300 bg-white text-center text-lg font-extrabold text-gov-900 transition focus:border-gov-600 focus:ring-2 focus:ring-gov-500/25 focus:outline-none dark:border-white/15 dark:bg-gov-950 dark:text-white"
                        />
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2.5">
                      <Button onClick={verifyOtp} disabled={busy}>
                        {busy ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                        {t("lg.verifyOtp")}
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={countdown > 0 || busy}
                        onClick={sendOtp}
                      >
                        {countdown > 0
                          ? L(`Resend OTP in ${countdown}s`, `${countdown}s में पुनः भेजें`)
                          : L("Resend OTP", "ओटीपी पुनः भेजें")}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp(["", "", "", "", "", ""]);
                          setError(null);
                        }}
                      >
                        {L("Change number", "नंबर बदलें")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="lg" className="w-full" onClick={sendOtp} disabled={busy}>
                    {busy ? <Loader2 size={17} className="animate-spin" /> : <Smartphone size={17} />}
                    {t("lg.sendOtp")}
                  </Button>
                )}
              </div>
            ) : null}

            {tab === "email" ? (
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setError(null);
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    setError(L("Enter a valid email address.", "मान्य ईमेल पता दर्ज करें।"));
                    return;
                  }
                  if (password.length < 6) {
                    setError(L("Password must be at least 6 characters.", "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।"));
                    return;
                  }
                  finish(email, "Email / Password", name.trim() || email.split("@")[0]);
                }}
              >
                <div>
                  <Label htmlFor="email" required>
                    {t("c.email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="citizen@example.gov.in"
                  />
                </div>
                <div>
                  <Label htmlFor="pwd" required>
                    {t("lg.password")}
                  </Label>
                  <Input
                    id="pwd"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={busy}>
                  {busy ? <Loader2 size={17} className="animate-spin" /> : <Lock size={17} />}
                  {t("nav.login")}
                </Button>
              </form>
            ) : null}

            {tab === "epramaan" ? (
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  const digits = aadhaar.replace(/\D/g, "");
                  if (digits.length !== 12) {
                    setError(L("Aadhaar number must be 12 digits.", "आधार संख्या 12 अंकों की होनी चाहिए।"));
                    return;
                  }
                  setError(null);
                  finish(`XXXX XXXX ${digits.slice(-4)}`, "ePramaan (Aadhaar)", name.trim() || "Aadhaar Holder");
                }}
              >
                <div>
                  <Label htmlFor="aadhaar" required>
                    {L("Aadhaar Number", "आधार संख्या")}
                  </Label>
                  <Input
                    id="aadhaar"
                    inputMode="numeric"
                    value={aadhaar}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, "").slice(0, 12);
                      setAadhaar(d.replace(/(\d{4})(?=\d)/g, "$1 "));
                    }}
                    placeholder="XXXX XXXX XXXX"
                  />
                  <p className="mt-1.5 text-[0.72rem] text-slate-500 dark:text-slate-400">
                    {L(
                      "Only the last 4 digits are retained for display. Authentication is performed by UIDAI via ePramaan.",
                      "केवल अंतिम 4 अंक प्रदर्शन हेतु सुरक्षित रखे जाते हैं। प्रमाणीकरण यूआईडीएआई द्वारा ई-प्रमाण के माध्यम से किया जाता है।",
                    )}
                  </p>
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={busy}>
                  {busy ? <Loader2 size={17} className="animate-spin" /> : <Fingerprint size={17} />}
                  {L("Authenticate with ePramaan", "ई-प्रमाण से प्रमाणित करें")}
                </Button>
              </form>
            ) : null}

            <FieldError>{error}</FieldError>
          </div>
        </Card>

        {/* side info */}
        <aside className="space-y-5">
          <Card className="border-saffron-500/40 bg-saffron-500/8">
            <div className="p-5">
              <h3 className="flex items-center gap-2 text-[0.9rem] font-bold text-saffron-600 dark:text-saffron-400">
                <ShieldCheck size={16} />
                {L("Demo credentials", "डेमो क्रेडेंशियल")}
              </h3>
              <ul className="mt-3 space-y-2 text-[0.8rem] text-slate-700 dark:text-slate-200">
                <li>
                  <strong>{L("Mobile", "मोबाइल")}:</strong>{" "}
                  {L("any valid 10-digit number", "कोई भी मान्य 10-अंकीय संख्या")}
                </li>
                <li>
                  <strong>OTP:</strong> <code className="tabular font-mono font-bold">{DEMO_OTP}</code>
                </li>
                <li>
                  <strong>{L("Email", "ईमेल")}:</strong>{" "}
                  {L("any address, password ≥ 6 chars", "कोई भी पता, पासवर्ड ≥ 6 अक्षर")}
                </li>
                <li>
                  <strong>ePramaan:</strong> {L("any 12-digit Aadhaar", "कोई भी 12-अंकीय आधार")}
                </li>
              </ul>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <h3 className="flex items-center gap-2 text-[0.9rem] font-bold text-gov-900 dark:text-white">
                <User size={16} className="text-gov-600" />
                {L("Why sign in?", "साइन इन क्यों करें?")}
              </h3>
              <ul className="mt-3 space-y-2.5 text-[0.8rem] text-slate-600 dark:text-slate-300">
                {[
                  L("Save verification reports to your dashboard", "सत्यापन रिपोर्ट अपने डैशबोर्ड में सहेजें"),
                  L("File and track RTI applications", "आरटीआई आवेदन दर्ज करें और ट्रैक करें"),
                  L("Watchlist parcels for mutation alerts", "नामांतरण अलर्ट हेतु पार्सल वॉचलिस्ट बनाएँ"),
                  L("Officers can bulk-verify up to 50 documents", "अधिकारी 50 तक दस्तावेज़ थोक में सत्यापित कर सकते हैं"),
                ].map((x) => (
                  <li key={x} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-500" />
                    {x}
                  </li>
                ))}
              </ul>
              <Link to="/help" className="mt-4 inline-block text-[0.78rem] font-bold text-gov-700 hover:underline dark:text-gov-300">
                {L("Read the login FAQ", "लॉगिन संबंधी सामान्य प्रश्न पढ़ें")} →
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
