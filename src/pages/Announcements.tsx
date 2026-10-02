import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Download,
  Megaphone,
  Search,
  Tag,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Badge, Button, Card, Input, PageHeader, cx } from "../components/ui";
import { ANNOUNCEMENTS } from "../lib/data";

const CATEGORIES = ["All", "Notification", "Circular", "Tender", "Advisory", "Recruitment"];

export default function Announcements() {
  const { t, lang, toast } = useApp();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ANNOUNCEMENTS.filter((a) => {
      if (cat !== "All" && a.category !== cat) return false;
      if (!needle) return true;
      return (
        a.title.toLowerCase().includes(needle) ||
        a.titleHi.includes(needle) ||
        a.body.toLowerCase().includes(needle)
      );
    });
  }, [cat, q]);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      setOpen(id);
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
    }
  }, []);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      <PageHeader
        title={t("an.title")}
        subtitle={t("an.sub")}
        icon={<Megaphone size={22} />}
        breadcrumb={[{ label: t("nav.home"), to: "/" }, { label: t("an.title") }]}
      />

      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
        <Card className="mb-6 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[15rem] flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={lang === "hi" ? "घोषणा खोजें…" : "Search announcements…"}
                className="pl-9"
                aria-label="Search announcements"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  aria-pressed={cat === c}
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-[0.75rem] font-bold transition",
                    cat === c
                      ? "border-gov-700 bg-gov-700 text-white"
                      : "border-slate-300 bg-white text-slate-600 hover:border-gov-400 hover:text-gov-700 dark:border-white/15 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/10",
                  )}
                >
                  {c === "All" ? t("c.all") : c}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {list.length === 0 ? (
          <Card className="grid place-items-center px-6 py-16 text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t("c.none")}</p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => {
                setQ("");
                setCat("All");
              }}
            >
              {t("lr.clear")}
            </Button>
          </Card>
        ) : (
          <ul className="space-y-4">
            {list.map((a) => {
              const isOpen = open === a.id;
              return (
                <li key={a.id}>
                  <Card id={a.id} className={cx("scroll-mt-28 transition", isOpen && "border-gov-400 shadow-md")}>
                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-5 py-3 dark:border-white/10">
                      <span className="tabular flex items-center gap-1.5 rounded bg-gov-50 px-2 py-1 text-[0.7rem] font-bold text-gov-700 dark:bg-gov-800 dark:text-gov-200">
                        <CalendarDays size={12} aria-hidden />
                        {fmt(a.date)}
                      </span>
                      <Badge tone={a.category === "Tender" ? "amber" : a.category === "Recruitment" ? "green" : "blue"}>
                        <Tag size={10} />
                        {a.category}
                      </Badge>
                      {a.isNew ? (
                        <span className="rounded bg-red-600 px-1.5 py-0.5 text-[0.58rem] font-extrabold uppercase tracking-wider text-white">
                          {t("side.new")}
                        </span>
                      ) : null}
                      <span className="tabular ml-auto text-[0.68rem] font-semibold text-slate-400">
                        Ref: DLR/BVA/{a.id}
                      </span>
                    </div>
                    <div className="p-5">
                      <h2 className="text-[1rem] font-bold leading-snug text-gov-900 dark:text-white">
                        {lang === "hi" ? a.titleHi : a.title}
                      </h2>
                      <div
                        className={cx(
                          "grid transition-all duration-300",
                          isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <div className="overflow-hidden">
                          <p className="text-[0.85rem] leading-relaxed text-slate-600 dark:text-slate-300">
                            {a.body}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setOpen(isOpen ? null : a.id)}>
                          {isOpen ? (
                            <>
                              <ChevronDown size={14} className="rotate-180" />
                              {lang === "hi" ? "संक्षिप्त करें" : "Collapse"}
                            </>
                          ) : (
                            <>
                              <ChevronDown size={14} />
                              {lang === "hi" ? "विवरण पढ़ें" : "Read details"}
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const text = [
                              "GOVERNMENT OF INDIA",
                              "Department of Land Resources — BhoomiVerify AI",
                              "=".repeat(60),
                              `Reference : DLR/BVA/${a.id}`,
                              `Date      : ${fmt(a.date)}`,
                              `Category  : ${a.category}`,
                              "",
                              lang === "hi" ? a.titleHi : a.title,
                              "",
                              a.body,
                              "",
                              "-".repeat(60),
                              "Computer generated copy — no signature required.",
                            ].join("\n");
                            const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                            const url = URL.createObjectURL(blob);
                            const el = document.createElement("a");
                            el.href = url;
                            el.download = `Announcement-${a.id}.txt`;
                            el.click();
                            setTimeout(() => URL.revokeObjectURL(url), 1500);
                            toast(lang === "hi" ? "प्रति डाउनलोड हुई" : "Copy downloaded");
                          }}
                        >
                          <Download size={14} />
                          {t("c.download")}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
