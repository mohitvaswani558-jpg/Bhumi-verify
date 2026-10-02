import { Link } from "react-router-dom";
import { Contrast, Minus, Moon, Plus, Sun, Accessibility } from "lucide-react";
import { BhoomiLogo, NationalEmblem } from "./Emblems";
import { useApp } from "../context/AppContext";
import { skipToMainContent } from "../lib/a11y";
import { cx } from "./ui";

function A11yButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick: () => void;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cx(
        "grid h-8 w-8 place-items-center rounded border text-xs font-bold transition",
        active
          ? "border-gov-700 bg-gov-700 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-gov-500 hover:bg-gov-50 hover:text-gov-700",
        "dark:border-white/20 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/15",
      )}
    >
      {children}
    </button>
  );
}

export default function TopHeader() {
  const {
    t,
    lang,
    setLang,
    theme,
    toggleTheme,
    highContrast,
    toggleContrast,
    fontScale,
    bumpFont,
    setFontScale,
  } = useApp();

  return (
    <header className="relative z-40 bg-white dark:bg-gov-950">
      {/* tricolour strip */}
      <div className="flex h-1 w-full" aria-hidden>
        <span className="flex-1 bg-[#e07b00]" />
        <span className="flex-1 bg-white ring-1 ring-inset ring-slate-200" />
        <span className="flex-1 bg-[#138808]" />
      </div>

      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        {/* Government of India identity */}
        <div className="flex items-center gap-3">
          <NationalEmblem className="h-14 w-auto shrink-0" />
          <div className="leading-tight">
            <p className="text-[1.05rem] font-bold text-slate-900 dark:text-white" lang="hi">
              भारत सरकार
            </p>
            <p className="text-[0.95rem] font-semibold text-slate-700 dark:text-slate-200">
              {t("gov.india")}
            </p>
            <p className="mt-0.5 text-[0.68rem] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("gov.dept")} · {t("gov.ministry")}
            </p>
          </div>
        </div>

        {/* Portal identity */}
        <Link
          to="/"
          className="group flex items-center gap-3 rounded-md py-1 pr-3 transition focus-visible:outline-3 focus-visible:outline-saffron-400"
        >
          <BhoomiLogo className="h-13 w-13 shrink-0 transition-transform duration-300 group-hover:scale-105" />
          <span className="leading-tight">
            <span className="block text-[1.05rem] font-extrabold tracking-tight text-gov-800 dark:text-white" lang="hi">
              भूमि सत्यापन <span className="text-leaf-600 dark:text-leaf-400">एआई</span>
            </span>
            <span className="block text-[0.78rem] font-bold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
              Bhoomi Verify AI
            </span>
            <span className="mt-0.5 block text-[0.62rem] font-medium uppercase tracking-wide text-saffron-600 dark:text-saffron-400">
              National Land Document Verification Portal
            </span>
          </span>
        </Link>

        <div className="ml-auto" />

        {/* Accessibility controls */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="mr-1 hidden text-[0.68rem] font-semibold uppercase tracking-wide text-slate-500 lg:inline dark:text-slate-400">
              {t("a11y.tools")}
            </span>
            <A11yButton
              onClick={() => bumpFont(-1)}
              label={t("a11y.decrease")}
              active={fontScale === "small"}
            >
              <span className="flex items-center gap-0.5">
                <Minus size={11} strokeWidth={3} /> A
              </span>
            </A11yButton>
            <A11yButton
              onClick={() => setFontScale("normal")}
              label={t("a11y.reset")}
              active={fontScale === "normal"}
            >
              <span className="text-[0.8rem]">A</span>
            </A11yButton>
            <A11yButton
              onClick={() => bumpFont(1)}
              label={t("a11y.increase")}
              active={fontScale === "large"}
            >
              <span className="flex items-center gap-0.5">
                A <Plus size={11} strokeWidth={3} />
              </span>
            </A11yButton>

            <span className="mx-1 h-6 w-px bg-slate-300 dark:bg-white/20" aria-hidden />

            <div className="flex overflow-hidden rounded border border-slate-300 dark:border-white/20">
              {(["hi", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={cx(
                    "px-2.5 py-1.5 text-[0.72rem] font-bold transition",
                    lang === l
                      ? "bg-gov-700 text-white"
                      : "bg-white text-slate-600 hover:bg-gov-50 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/15",
                  )}
                >
                  {l === "hi" ? "हिंदी" : "English"}
                </button>
              ))}
            </div>

            <A11yButton
              onClick={toggleTheme}
              label={theme === "dark" ? t("a11y.light") : t("a11y.dark")}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </A11yButton>
            <A11yButton
              onClick={toggleContrast}
              label={t("a11y.contrast")}
              active={highContrast}
            >
              <Contrast size={15} />
            </A11yButton>
          </div>

          <button
            type="button"
            onClick={skipToMainContent}
            className="flex items-center gap-1.5 rounded border border-dashed border-gov-400 px-2 py-1 text-[0.68rem] font-semibold text-gov-700 transition hover:bg-gov-50 dark:border-gov-600 dark:text-gov-300 dark:hover:bg-white/10"
          >
            <Accessibility size={12} />
            {t("a11y.skipMain")}
          </button>
        </div>
      </div>
    </header>
  );
}
