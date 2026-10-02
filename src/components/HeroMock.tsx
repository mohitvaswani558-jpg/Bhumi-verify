import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  Fingerprint,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const TARGET = 96.4;

function Gauge({ value }: { value: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="relative grid h-24 w-24 place-items-center">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)" }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#34c46f" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center leading-none">
        <p className="tabular text-xl font-extrabold text-gov-900 dark:text-white">
          {value.toFixed(1)}%
        </p>
        <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Score
        </p>
      </div>
    </div>
  );
}

export default function HeroMock() {
  const { t } = useApp();
  const [value, setValue] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setValue(TARGET), 350));
    timers.push(window.setTimeout(() => setStep(1), 900));
    timers.push(window.setTimeout(() => setStep(2), 1300));
    timers.push(window.setTimeout(() => setStep(3), 1700));
    timers.push(window.setTimeout(() => setStep(4), 2100));
    return () => timers.forEach(window.clearTimeout);
  }, []);

  const checks = [
    { icon: Fingerprint, label: t("card.c1") },
    { icon: ShieldCheck, label: t("card.c2") },
    { icon: ScanLine, label: t("card.c3") },
  ];

  return (
    <div className="relative">
      {/* floating chips */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute -left-3 top-16 z-20 hidden items-center gap-2 rounded-full border border-gov-200 bg-white px-3 py-1.5 text-[0.7rem] font-bold text-gov-700 shadow-lg sm:flex dark:border-white/15 dark:bg-gov-900 dark:text-gov-200"
      >
        <ScanLine size={13} className="text-leaf-600" aria-hidden />
        {t("card.chip2")}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75, duration: 0.5 }}
        className="absolute -right-2 bottom-24 z-20 hidden items-center gap-2 rounded-full border border-gov-200 bg-white px-3 py-1.5 text-[0.7rem] font-bold text-gov-700 shadow-lg sm:flex dark:border-white/15 dark:bg-gov-900 dark:text-gov-200"
      >
        <Sparkles size={13} className="text-saffron-500" aria-hidden />
        {t("card.chip1")}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute -bottom-4 left-10 z-20 hidden items-center gap-2 rounded-full border border-gov-200 bg-white px-3 py-1.5 text-[0.7rem] font-bold text-gov-700 shadow-lg md:flex dark:border-white/15 dark:bg-gov-900 dark:text-gov-200"
      >
        <ShieldCheck size={13} className="text-gov-600" aria-hidden />
        {t("card.chip3")}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 26, rotateX: 6 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-xl border border-white/70 bg-white shadow-[0_24px_60px_-18px_rgba(16,44,88,0.45)] dark:border-white/10 dark:bg-gov-950"
      >
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-white/10 dark:bg-white/5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-leaf-500" />
          <p className="ml-2 flex items-center gap-1.5 text-[0.72rem] font-bold text-slate-600 dark:text-slate-300">
            <FileText size={12} aria-hidden />
            {t("card.title")}
          </p>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-leaf-500/12 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-leaf-700 dark:text-leaf-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-leaf-500" />
            Live
          </span>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] sm:p-5">
          {/* document preview */}
          <div>
            <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">
              <img
                src="/images/record-scan.jpg"
                alt="Scanned Record of Rights being analysed"
                className="h-56 w-full object-cover object-top sm:h-64"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gov-950/45 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 h-14 animate-scan bg-gradient-to-b from-transparent via-leaf-400/35 to-transparent">
                <div className="absolute bottom-0 h-px w-full bg-leaf-400 shadow-[0_0_12px_2px_rgba(52,196,111,0.9)]" />
              </div>
              {/* detected region boxes */}
              <div className="pointer-events-none absolute left-[12%] top-[22%] h-9 w-[46%] rounded border-2 border-leaf-400/80" />
              <div className="pointer-events-none absolute right-[10%] top-[54%] h-12 w-12 rounded-full border-2 border-saffron-400/90" />
              <span className="absolute left-2 top-2 rounded bg-gov-900/85 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white">
                OCR · 1,482 chars
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
              <FileText size={15} className="shrink-0 text-red-600" aria-hidden />
              <span className="truncate text-[0.72rem] font-semibold text-slate-700 dark:text-slate-200">
                {t("card.file")}
              </span>
              <span className="ml-auto shrink-0 text-[0.65rem] font-medium text-slate-500">
                1.8 MB
              </span>
            </div>
          </div>

          {/* analysis panel */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-wider text-gov-700 dark:text-gov-300">
              <Sparkles size={13} aria-hidden />
              {t("card.analysis")}
            </p>

            <div className="mt-3 flex items-center gap-4">
              <Gauge value={value} />
              <div className="min-w-0">
                <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t("card.confidence")}
                </p>
                <p className="mt-0.5 text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">
                  Authenticity Score
                </p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={step >= 4 ? { opacity: 1, scale: 1 } : {}}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-leaf-600 px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-widest text-white shadow"
                >
                  <ShieldCheck size={13} aria-hidden />
                  {t("card.verified")}
                </motion.div>
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {checks.map((c, i) => {
                const on = step > i;
                const Icon = c.icon;
                return (
                  <motion.li
                    key={c.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={on ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.35 }}
                    className="flex items-center gap-2.5 rounded-md border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-gov-900/60"
                  >
                    <span
                      className={
                        on
                          ? "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf-500 text-white"
                          : "grid h-5 w-5 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-400 dark:bg-white/10"
                      }
                    >
                      {on ? <CheckCircle2 size={13} /> : <Icon size={11} />}
                    </span>
                    <span className="text-[0.76rem] font-semibold text-slate-700 dark:text-slate-200">
                      {c.label}
                    </span>
                    <span className="ml-auto text-[0.65rem] font-bold text-leaf-600 dark:text-leaf-400">
                      {on ? "PASS" : "…"}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200 bg-white px-5 py-3 dark:border-white/10 dark:bg-gov-950">
          <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-slate-600 dark:text-slate-300">
            <ShieldCheck size={13} className="text-gov-600" aria-hidden />
            {t("card.cross")}
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-[0.7rem] font-semibold text-slate-500 dark:text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-leaf-500" />
            Engine v3.2 · 4.2s avg
          </span>
        </div>
      </motion.div>
    </div>
  );
}
