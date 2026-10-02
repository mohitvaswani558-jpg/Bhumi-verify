import { Link } from "react-router-dom";
import {
  Compass,
  FileSearch,
  FileStack,
  Home,
  LayoutDashboard,
  Map,
  Megaphone,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Button, Card } from "../components/ui";
import { BhoomiLogo } from "../components/Emblems";

const SERVICES = [
  { to: "/verify", icon: FileSearch, en: "Verify Document", hi: "दस्तावेज़ सत्यापन" },
  { to: "/land-records", icon: Map, en: "Land Records", hi: "भूमि अभिलेख" },
  { to: "/mutation", icon: FileStack, en: "Mutation Status", hi: "नामांतरण स्थिति" },
  { to: "/encumbrance", icon: ScrollText, en: "Encumbrance Certificate", hi: "भारमुक्तता प्रमाणपत्र" },
  { to: "/cadastral-maps", icon: Map, en: "Cadastral Maps", hi: "भू-नक़्शे" },
  { to: "/dashboard", icon: LayoutDashboard, en: "Dashboard", hi: "डैशबोर्ड" },
];

export default function NotFound() {
  const { lang, t } = useApp();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6">
      {/* ------------------------- 404 notice ------------------------- */}
      <div className="text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gov-50 text-gov-500 dark:bg-white/5">
          <Compass size={38} />
        </span>
        <p className="tabular mt-6 text-6xl font-extrabold text-gov-800 dark:text-gov-300">404</p>
        <h1 className="mt-2 text-2xl font-extrabold text-gov-950 dark:text-white">
          {L("Page Not Found", "पृष्ठ नहीं मिला")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {L(
            "The page you requested has been moved, renamed or removed. Nothing is lost — the vision, the services and every report you have generated are one click away below.",
            "आपका अनुरोधित पृष्ठ स्थानांतरित, पुनर्नामित या हटाया जा चुका है। कुछ भी नहीं खोया — विचार, सेवाएँ और आपकी सभी निर्मित रिपोर्ट नीचे एक क्लिक की दूरी पर हैं।",
          )}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/">
            <Button size="lg">
              <Home size={17} /> {L("Go to Home", "होम पर जाएँ")}
            </Button>
          </Link>
          <Link to="/verify">
            <Button size="lg" variant="secondary">
              <FileSearch size={17} /> {t("nav.verify")}
            </Button>
          </Link>
          <Link to="/help">
            <Button size="lg" variant="outline">
              {L("Help Centre", "सहायता केंद्र")}
            </Button>
          </Link>
        </div>
      </div>

      {/* --------------------- the vision of the idea --------------------- */}
      <Card className="mt-12 overflow-hidden border-gov-300 dark:border-gov-700">
        <div className="flex flex-wrap items-center gap-3 border-b border-gov-200 bg-gov-50/70 px-6 py-4 dark:border-gov-700 dark:bg-gov-900/50">
          <BhoomiLogo className="h-11 w-11" />
          <div>
            <h2 className="text-[1.05rem] font-extrabold tracking-tight text-gov-900 dark:text-white">
              {L("The Vision Behind BhoomiVerify AI", "भूमि सत्यापन एआई के पीछे का विज़न")}
            </h2>
            <p className="text-[0.76rem] font-semibold uppercase tracking-wider text-saffron-600 dark:text-saffron-400">
              {L(
                "Department of Land Resources · Ministry of Rural Development · Government of India",
                "भूमि संसाधन विभाग · ग्रामीण विकास मंत्रालय · भारत सरकार",
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2 sm:p-8">
          <div>
            <p className="text-[0.9rem] leading-relaxed text-slate-700 dark:text-slate-200">
              {L(
                "Land is the most disputed asset in India. A farmer, a first-time buyer or a bank officer today has no way to know whether the record in their hand is genuine until a court tells them otherwise — often years later. BhoomiVerify AI exists to close that gap in seconds, not years.",
                "भारत में भूमि सबसे अधिक विवादित संपत्ति है। आज एक किसान, पहली बार खरीदने वाला व्यक्ति या बैंक अधिकारी यह नहीं जान सकता कि उसके हाथ का अभिलेख प्रामाणिक है या नहीं, जब तक न्यायालय न कहे — वह भी प्रायः वर्षों बाद। भूमि सत्यापन एआई इस अंतर को वर्षों के स्थान पर सेकंडों में पाटने हेतु बना है।",
              )}
            </p>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-slate-700 dark:text-slate-200">
              {L(
                "We put a forensic laboratory in the hands of every citizen: on-device OCR reads exactly what is printed on the page, error-level analysis exposes tampering, seals and signatures are matched against the issuing office, and every parcel is cross-checked against the national cadastral repository. Then — and only then — a human Revenue Officer adjudicates, and the whole chain is written to an immutable audit trail.",
                "हम हर नागरिक के हाथ में एक फ़ोरेंसिक प्रयोगशाला देते हैं: ऑन-डिवाइस ओसीआर ठीक वही पढ़ता है जो पृष्ठ पर अंकित है, त्रुटि-स्तरीय विश्लेषण छेड़छाड़ उजागर करता है, मुहर एवं हस्ताक्षर जारीकर्ता कार्यालय से मिलाए जाते हैं, और प्रत्येक पार्सल की राष्ट्रीय भू-अभिलेख भंडार से क्रॉस-जाँच होती है। इसके बाद — और केवल तभी — एक मानव राजस्व अधिकारी निर्णय देता है, और पूरी श्रृंखला अपरिवर्तनीय ऑडिट ट्रेल में लिखी जाती है।",
              )}
            </p>
            <p className="mt-4 rounded-md border-l-4 border-saffron-500 bg-saffron-500/8 px-4 py-3 text-[0.86rem] font-semibold leading-relaxed text-slate-800 dark:text-slate-100">
              {L(
                "AI proposes. The officer disposes. The audit trail remembers. That is the whole idea — trust in land records that a citizen can verify themselves, in their own language, in under ten seconds.",
                "एआई प्रस्ताव देता है। अधिकारी निर्णय लेता है। ऑडिट ट्रेल स्मरण रखता है। यही सम्पूर्ण विचार है — भूमि अभिलेखों में ऐसा विश्वास जिसे नागरिक स्वयं, अपनी भाषा में, दस सेकंड से भी कम में सत्यापित कर सके।",
              )}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2.5 flex items-center gap-2 text-[0.8rem] font-extrabold uppercase tracking-wider text-gov-800 dark:text-gov-200">
                <Sparkles size={14} className="text-saffron-500" aria-hidden />
                {L("What the portal delivers", "पोर्टल क्या प्रदान करता है")}
              </h3>
              <ul className="space-y-2">
                {[
                  L(
                    "Six indexed sample land documents whose OCR extraction returns the exact name printed on the page",
                    "छह अनुक्रमित नमूना भूमि दस्तावेज़, जिनका ओसीआर निष्कर्षण पृष्ठ पर अंकित ठीक वही नाम लौटाता है",
                  ),
                  L(
                    "Key Findings, AI Opinion (valid vs complaints), Human Review and an immutable Audit Trail on every report",
                    "प्रत्येक रिपोर्ट पर मुख्य निष्कर्ष, एआई राय (वैध बनाम आपत्तियाँ), मानव समीक्षा एवं अपरिवर्तनीय ऑडिट ट्रेल",
                  ),
                  L(
                    "A dedicated full page verification report generated only for the document you submitted",
                    "केवल आपके प्रस्तुत दस्तावेज़ हेतु निर्मित समर्पित पूर्ण-पृष्ठ सत्यापन रिपोर्ट",
                  ),
                  L(
                    "Officer feedback is mandatory and gated at a 12-character minimum, stored verbatim",
                    "अधिकारी टिप्पणी अनिवार्य है और न्यूनतम 12 अक्षरों पर नियंत्रित, यथावत संग्रहीत",
                  ),
                  L(
                    "Bilingual Hindi–English, font scaling, high contrast, dark theme and full keyboard access",
                    "द्विभाषी हिंदी-अंग्रेज़ी, फ़ॉन्ट स्केलिंग, उच्च कंट्रास्ट, डार्क थीम एवं पूर्ण कीबोर्ड पहुँच",
                  ),
                ].map((x, i) => (
                  <li key={i} className="flex gap-2.5 text-[0.82rem] leading-relaxed text-slate-600 dark:text-slate-300">
                    <ShieldCheck size={15} className="mt-0.5 shrink-0 text-leaf-600" aria-hidden />
                    {x}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2.5 flex items-center gap-2 text-[0.8rem] font-extrabold uppercase tracking-wider text-gov-800 dark:text-gov-200">
                <Megaphone size={14} className="text-gov-600" aria-hidden />
                {L("Jump straight to a service", "सीधे किसी सेवा पर जाएँ")}
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {SERVICES.map((s) => (
                  <Link
                    key={s.to + s.en}
                    to={s.to}
                    className="group flex items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[0.8rem] font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-gov-400 hover:text-gov-700 hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-white"
                  >
                    <s.icon size={15} className="shrink-0 text-gov-600 dark:text-gov-300" aria-hidden />
                    {L(s.en, s.hi)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
