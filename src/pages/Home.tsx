import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  FileSearch,
  FileStack,
  Map,
  Megaphone,
  Phone,
  ScrollText,
  ShieldCheck,
  Upload,
  Search,
  Link2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import HeroMock from "../components/HeroMock";
import { Badge, Button, Card, CardHeader, cx } from "../components/ui";
import { ANNOUNCEMENTS, IMPORTANT_LINKS } from "../lib/data";

const SERVICES = [
  {
    to: "/verify",
    key: 1,
    icon: FileSearch,
    tint: "bg-gov-600",
    ring: "group-hover:ring-gov-300",
  },
  {
    to: "/land-records",
    key: 2,
    icon: Map,
    tint: "bg-leaf-600",
    ring: "group-hover:ring-leaf-300",
  },
  {
    to: "/mutation",
    key: 3,
    icon: FileStack,
    tint: "bg-saffron-500",
    ring: "group-hover:ring-saffron-400/60",
  },
  {
    to: "/encumbrance",
    key: 4,
    icon: ScrollText,
    tint: "bg-purple-600",
    ring: "group-hover:ring-purple-300",
  },
  {
    to: "/cadastral-maps",
    key: 5,
    icon: Map,
    tint: "bg-teal-600",
    ring: "group-hover:ring-teal-300",
  },
  {
    to: "/rti",
    key: 6,
    icon: Megaphone,
    tint: "bg-red-600",
    ring: "group-hover:ring-red-300",
  },
];

const STATS = [
  { v: "hero.stat1v", l: "hero.stat1l" },
  { v: "hero.stat2v", l: "hero.stat2l" },
  { v: "hero.stat3v", l: "hero.stat3l" },
];

export default function Home() {
  const { t, lang } = useApp();

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden border-b border-gov-200/70 bg-gradient-to-br from-gov-50 via-white to-gov-100 dark:border-white/10 dark:from-gov-950 dark:via-gov-950 dark:to-gov-900">
        <div className="gov-grid-bg pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-leaf-400/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-gov-400/20 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-[1240px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-gov-200 bg-white/85 px-3.5 py-1.5 text-[0.72rem] font-bold uppercase tracking-wider text-gov-700 shadow-sm backdrop-blur dark:border-white/15 dark:bg-white/10 dark:text-gov-200">
              <ShieldCheck size={14} className="text-leaf-600" aria-hidden />
              {t("hero.badge1")}
              <span className="text-gov-300">•</span>
              {t("hero.badge2")}
              <span className="text-gov-300">•</span>
              {t("hero.badge3")}
            </span>

            <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.15] tracking-tight text-gov-950 sm:text-[2.6rem] lg:text-[2.9rem] dark:text-white">
              {t("hero.title1")}{" "}
              <span className="bg-gradient-to-r from-gov-600 to-leaf-600 bg-clip-text text-transparent dark:from-gov-300 dark:to-leaf-400">
                {t("hero.title2")}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-slate-600 dark:text-slate-300">
              {t("hero.sub")}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/verify">
                <Button size="lg" className="min-w-[13rem] shadow-lg shadow-gov-900/20">
                  <Upload size={18} aria-hidden />
                  {t("hero.cta1")}
                </Button>
              </Link>
              <Link to="/land-records">
                <Button size="lg" variant="secondary" className="min-w-[13rem]">
                  <Search size={18} aria-hidden />
                  {t("hero.cta2")}
                </Button>
              </Link>
            </div>

            <p className="mt-3.5 text-[0.82rem]">
              <Link
                to="/verify#samples"
                className="inline-flex items-center gap-1.5 font-bold text-gov-700 underline decoration-saffron-500 decoration-2 underline-offset-4 transition hover:text-gov-500 dark:text-gov-300"
              >
                <FileStack size={15} aria-hidden />
                {lang === "hi"
                  ? "6 नमूना भूमि दस्तावेज़ आज़माएँ — ओसीआर ठीक वही नाम पढ़ता है जो दस्तावेज़ पर अंकित है"
                  : "Try the 6 sample land documents — OCR reads back the exact name printed on each one"}
                <ArrowRight size={14} aria-hidden />
              </Link>
            </p>

            <dl className="mt-9 flex flex-wrap items-stretch gap-x-8 gap-y-4 border-t border-gov-200/80 pt-6 dark:border-white/10">
              {STATS.map((s, i) => (
                <div key={s.v} className={cx("min-w-[7rem]", i > 0 && "sm:border-l sm:border-gov-200/80 sm:pl-8 dark:sm:border-white/10")}>
                  <dt className="tabular text-2xl font-extrabold text-gov-800 dark:text-white">
                    {t(s.v)}
                  </dt>
                  <dd className="mt-0.5 text-[0.78rem] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t(s.l)}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="lg:pl-4"
          >
            <HeroMock />
          </motion.div>
        </div>
      </section>

      {/* ======================= MAIN + SIDEBAR ======================= */}
      <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20.5rem]">
          {/* Quick services */}
          <section aria-labelledby="quick-services">
            <div className="mb-5">
              <h2
                id="quick-services"
                className="text-xl font-extrabold tracking-tight text-gov-900 dark:text-white sm:text-2xl"
              >
                {t("svc.title")}
              </h2>
              <div className="mt-1.5 h-1 w-16 rounded-full bg-gradient-to-r from-saffron-500 to-leaf-500" />
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("svc.sub")}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {SERVICES.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.to}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Link
                      to={s.to}
                      className="group flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-gov-300 hover:shadow-[0_14px_30px_-12px_rgba(16,44,88,0.35)] dark:border-white/10 dark:bg-gov-950/70 dark:hover:border-gov-600"
                    >
                      <span
                        className={cx(
                          "mb-4 grid h-12 w-12 place-items-center rounded-lg text-white shadow-md ring-4 ring-transparent transition",
                          s.tint,
                          s.ring,
                        )}
                      >
                        <Icon size={22} aria-hidden />
                      </span>
                      <h3 className="text-[0.98rem] font-bold text-gov-900 transition group-hover:text-gov-600 dark:text-white dark:group-hover:text-gov-300">
                        {t(`svc.s${s.key}t`)}
                      </h3>
                      <p className="mt-1.5 flex-1 text-[0.82rem] leading-relaxed text-slate-600 dark:text-slate-300">
                        {t(`svc.s${s.key}d`)}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[0.76rem] font-bold uppercase tracking-wide text-gov-600 dark:text-gov-300">
                        {t("svc.open")}
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-1"
                          aria-hidden
                        />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* trust strip */}
            <Card className="mt-6 overflow-hidden">
              <div className="grid divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-white/10">
                {[
                  {
                    icon: BadgeCheck,
                    title: lang === "hi" ? "GIGW 3.0 अनुपालक" : "GIGW 3.0 Compliant",
                    body:
                      lang === "hi"
                        ? "भारत सरकार वेब दिशानिर्देश एवं WCAG 2.1 AA सुगम्यता मानकों का पालन।"
                        : "Built to Government of India web guidelines and WCAG 2.1 AA accessibility standards.",
                  },
                  {
                    icon: ShieldCheck,
                    title: lang === "hi" ? "एन्क्रिप्टेड पाइपलाइन" : "Encrypted Pipeline",
                    body:
                      lang === "hi"
                        ? "AES-256 एन्क्रिप्शन, इफ़ेमरल प्रसंस्करण और 90-दिन ऑडिट प्रतिधारण।"
                        : "AES-256 encryption, ephemeral processing and 90-day audit retention.",
                  },
                  {
                    icon: FileSearch,
                    title: lang === "hi" ? "ऑडिट-योग्य रिपोर्ट" : "Auditable Reports",
                    body:
                      lang === "hi"
                        ? "प्रत्येक रिपोर्ट राष्ट्रीय ब्लॉकचेन फ्रेमवर्क पर हैश-अंकुरित होती है।"
                        : "Every report is hash-anchored to the National Blockchain Framework.",
                  },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="flex gap-3 p-5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-gov-50 text-gov-700 dark:bg-gov-800 dark:text-gov-200">
                        <Icon size={18} aria-hidden />
                      </span>
                      <div>
                        <p className="text-[0.85rem] font-bold text-gov-900 dark:text-white">
                          {f.title}
                        </p>
                        <p className="mt-1 text-[0.78rem] leading-relaxed text-slate-600 dark:text-slate-300">
                          {f.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5" aria-label="Announcements and important links">
            <Card>
              <CardHeader
                title={t("side.announcements")}
                icon={<Megaphone size={15} />}
                action={
                  <Link
                    to="/announcements"
                    className="flex items-center gap-1 text-[0.72rem] font-bold uppercase tracking-wide text-gov-600 transition hover:text-gov-800 hover:underline dark:text-gov-300 dark:hover:text-white"
                  >
                    {t("side.viewAll")}
                    <ArrowRight size={12} aria-hidden />
                  </Link>
                }
              />
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
                {ANNOUNCEMENTS.slice(0, 5).map((a) => (
                  <li key={a.id}>
                    <Link
                      to={`/announcements#${a.id}`}
                      className="group block px-5 py-3.5 transition hover:bg-gov-50/70 dark:hover:bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="tabular rounded bg-gov-50 px-1.5 py-0.5 text-[0.65rem] font-bold text-gov-700 dark:bg-gov-800 dark:text-gov-200">
                          {new Date(a.date).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <Badge tone={a.category === "Tender" ? "amber" : "blue"}>{a.category}</Badge>
                        {a.isNew ? (
                          <span className="ml-auto rounded bg-red-600 px-1.5 py-0.5 text-[0.58rem] font-extrabold uppercase tracking-wider text-white">
                            {t("side.new")}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-[0.82rem] font-semibold leading-snug text-slate-700 transition group-hover:text-gov-700 dark:text-slate-200 dark:group-hover:text-white">
                        {lang === "hi" ? a.titleHi : a.title}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader title={t("side.links")} icon={<Link2 size={15} />} />
              <ul className="divide-y divide-slate-100 p-0 dark:divide-white/5">
                {IMPORTANT_LINKS.map((l) => (
                  <li key={l.short}>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(
                        l.label + " Government of India official site",
                      )}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group flex items-center gap-2 px-5 py-2.5 text-[0.8rem] font-medium text-slate-700 transition hover:bg-gov-50 hover:text-gov-700 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <ArrowUpRight
                        size={13}
                        className="shrink-0 text-gov-400 transition group-hover:text-saffron-500"
                        aria-hidden
                      />
                      <span className="flex-1">{l.label}</span>
                      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[0.62rem] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                        {l.short}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="overflow-hidden border-leaf-500/30 bg-gradient-to-br from-leaf-50 to-white dark:from-leaf-700/15 dark:to-gov-950/70">
              <div className="p-5">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-leaf-600 text-white shadow-md">
                  <Phone size={20} aria-hidden />
                </span>
                <h3 className="mt-3.5 text-[0.95rem] font-bold text-gov-900 dark:text-white">
                  {t("side.helpline")}
                </h3>
                <p className="mt-1 text-[0.78rem] text-slate-600 dark:text-slate-300">
                  {t("side.helplineSub")}
                </p>
                <a
                  href="tel:1800111551"
                  className="tabular mt-3 block rounded-md bg-leaf-600 px-4 py-2.5 text-center text-base font-extrabold tracking-wide text-white shadow transition hover:bg-leaf-500"
                >
                  1800-11-1551
                </a>
                <Link
                  to="/help"
                  className="mt-2.5 flex items-center justify-center gap-1.5 rounded-md border border-leaf-600/40 px-4 py-2 text-[0.78rem] font-bold text-leaf-700 transition hover:bg-leaf-600 hover:text-white dark:text-leaf-400"
                >
                  {t("h.title")}
                  <ArrowRight size={13} aria-hidden />
                </Link>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
