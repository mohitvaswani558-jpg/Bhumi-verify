import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileSearch,
  Gauge,
  LayoutDashboard,
  ServerCog,
  ShieldAlert,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Badge, Button, Card, CardHeader, PageHeader, cx } from "../components/ui";
import { AreaChart, BarList, Donut } from "../components/charts";
import {
  DOC_TYPE_MIX,
  MONTHLY_TREND,
  SYSTEM_HEALTH,
  TOP_DISTRICTS,
} from "../lib/data";
import { VERDICT_META } from "../lib/verifyEngine";
import type { Verdict } from "../lib/types";

const SEED_RECENT: {
  id: string;
  file: string;
  type: string;
  state: string;
  verdict: Verdict;
  confidence: number;
  at: string;
}[] = [
  { id: "BVA/20260926/481220", file: "RoR_Kakori_142-2.pdf", type: "Record of Rights", state: "Uttar Pradesh", verdict: "verified", confidence: 97.4, at: "2026-09-26T09:14:00" },
  { id: "BVA/20260926/481187", file: "SaleDeed_Wagholi.jpg", type: "Sale Deed", state: "Maharashtra", verdict: "review", confidence: 78.1, at: "2026-09-26T08:52:00" },
  { id: "BVA/20260926/481154", file: "Mutation_Nippani_88.pdf", type: "Mutation Order", state: "Karnataka", verdict: "verified", confidence: 95.2, at: "2026-09-26T08:31:00" },
  { id: "BVA/20260925/480992", file: "EC_Sanganer_2019.png", type: "Encumbrance Cert.", state: "Rajasthan", verdict: "flagged", confidence: 34.6, at: "2026-09-25T18:07:00" },
  { id: "BVA/20260925/480941", file: "PoA_Bihta_77.pdf", type: "Power of Attorney", state: "Bihar", verdict: "verified", confidence: 92.8, at: "2026-09-25T16:44:00" },
  { id: "BVA/20260925/480903", file: "RoR_Pollachi_310.pdf", type: "Record of Rights", state: "Tamil Nadu", verdict: "verified", confidence: 98.1, at: "2026-09-25T15:12:00" },
  { id: "BVA/20260925/480871", file: "Partition_Berasia.pdf", type: "Partition Deed", state: "Madhya Pradesh", verdict: "review", confidence: 71.9, at: "2026-09-25T13:38:00" },
];

function Kpi({
  label,
  value,
  delta,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: typeof Activity;
  tone: string;
}) {
  return (
    <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.74rem] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="tabular mt-1.5 text-2xl font-extrabold text-gov-900 dark:text-white">
            {value}
          </p>
          {delta ? (
            <p className="mt-1.5 flex items-center gap-1 text-[0.72rem] font-bold text-leaf-600 dark:text-leaf-400">
              <TrendingUp size={12} aria-hidden />
              {delta}
            </p>
          ) : null}
        </div>
        <span className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-lg text-white shadow", tone)}>
          <Icon size={20} aria-hidden />
        </span>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { t, lang, verifications } = useApp();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const totals = useMemo(() => {
    const last = MONTHLY_TREND[MONTHLY_TREND.length - 1];
    const prev = MONTHLY_TREND[MONTHLY_TREND.length - 2];
    const total = MONTHLY_TREND.reduce(
      (s, m) => s + m.verified + m.review + m.flagged,
      0,
    );
    const verified = MONTHLY_TREND.reduce((s, m) => s + m.verified, 0);
    const review = MONTHLY_TREND.reduce((s, m) => s + m.review, 0);
    const flagged = MONTHLY_TREND.reduce((s, m) => s + m.flagged, 0);
    const growth = (((last.verified - prev.verified) / prev.verified) * 100).toFixed(1);
    return { total, verified, review, flagged, growth };
  }, []);

  const merged = useMemo(() => {
    const mine = verifications.map((v) => ({
      id: v.id,
      file: v.fileName,
      type: v.docType,
      state: v.state,
      verdict: v.verdict,
      confidence: v.confidence,
      at: v.uploadedAt,
      mine: true,
    }));
    return [...mine, ...SEED_RECENT.map((s) => ({ ...s, mine: false }))];
  }, [verifications]);

  return (
    <>
      <PageHeader
        title={t("db.title")}
        subtitle={t("db.sub")}
        icon={<LayoutDashboard size={22} />}
        breadcrumb={[{ label: t("nav.home"), to: "/" }, { label: t("nav.dashboard") }]}
        actions={
          <Badge tone="green">
            <Activity size={12} /> {L("Live", "लाइव")} · 26 Sep 2026
          </Badge>
        }
      />

      <div className="mx-auto max-w-[1240px] space-y-6 px-4 py-8 sm:px-6">
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Kpi
            label={t("db.total")}
            value={`${(totals.total / 100000).toFixed(2)} L`}
            delta={`+${totals.growth}% MoM`}
            icon={FileSearch}
            tone="bg-gov-600"
          />
          <Kpi
            label={t("db.verified")}
            value={`${((totals.verified / totals.total) * 100).toFixed(1)}%`}
            delta={totals.verified.toLocaleString("en-IN")}
            icon={CheckCircle2}
            tone="bg-leaf-600"
          />
          <Kpi
            label={t("db.review")}
            value={totals.review.toLocaleString("en-IN")}
            delta={`${((totals.review / totals.total) * 100).toFixed(1)}% of volume`}
            icon={Clock}
            tone="bg-saffron-500"
          />
          <Kpi
            label={t("db.flagged")}
            value={totals.flagged.toLocaleString("en-IN")}
            delta={`${((totals.flagged / totals.total) * 100).toFixed(1)}% of volume`}
            icon={ShieldAlert}
            tone="bg-red-600"
          />
          <Kpi
            label={t("db.avgTime")}
            value="4.2 s"
            delta="-0.8 s vs last quarter"
            icon={Gauge}
            tone="bg-purple-600"
          />
        </div>

        {/* charts row */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader
              title={t("db.trend")}
              icon={<TrendingUp size={15} />}
              action={
                <div className="flex flex-wrap items-center gap-3 text-[0.7rem] font-semibold text-slate-500 dark:text-slate-400">
                  {[
                    { c: "#16a34a", l: t("db.verified") },
                    { c: "#e07b00", l: t("db.review") },
                    { c: "#b91c1c", l: t("db.flagged") },
                  ].map((x) => (
                    <span key={x.l} className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: x.c }} />
                      {x.l}
                    </span>
                  ))}
                </div>
              }
            />
            <div className="p-4">
              <AreaChart
                data={MONTHLY_TREND as unknown as Record<string, number | string>[]}
                xKey="month"
                series={[
                  { key: "verified", label: t("db.verified"), color: "#16a34a" },
                  { key: "review", label: t("db.review"), color: "#e07b00" },
                  { key: "flagged", label: t("db.flagged"), color: "#b91c1c" },
                ]}
              />
            </div>
          </Card>

          <Card>
            <CardHeader title={t("db.verdicts")} icon={<Gauge size={15} />} />
            <div className="p-5">
              <Donut
                data={[
                  { label: t("db.verified"), value: totals.verified, color: "#16a34a" },
                  { label: t("db.review"), value: totals.review, color: "#e07b00" },
                  { label: t("db.flagged"), value: totals.flagged, color: "#b91c1c" },
                ]}
                centerValue={`${((totals.verified / totals.total) * 100).toFixed(1)}%`}
                centerLabel={L("Authenticity rate", "प्रामाणिकता दर")}
              />
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title={t("db.districts")} icon={<ArrowUpRight size={15} />} />
            <div className="p-5">
              <BarList data={TOP_DISTRICTS} />
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader title={t("db.types")} icon={<FileSearch size={15} />} />
              <div className="space-y-3 p-5">
                {DOC_TYPE_MIX.map((d) => (
                  <div key={d.label}>
                    <div className="mb-1 flex items-baseline justify-between text-[0.78rem]">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {d.label}
                      </span>
                      <span className="tabular font-bold text-gov-700 dark:text-gov-300">
                        {d.value}%
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gov-700 via-gov-500 to-leaf-500"
                        style={{ width: `${d.value * 2.4}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title={t("db.system")} icon={<ServerCog size={15} />} />
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
                {SYSTEM_HEALTH.map((s) => (
                  <li key={s.name} className="flex items-center gap-3 px-5 py-3">
                    <span
                      className={cx(
                        "h-2.5 w-2.5 shrink-0 rounded-full",
                        s.status === "Operational" ? "bg-leaf-500" : "bg-saffron-500",
                      )}
                      aria-hidden
                    />
                    <span className="flex-1 text-[0.82rem] font-medium text-slate-700 dark:text-slate-200">
                      {s.name}
                    </span>
                    <Badge tone={s.status === "Operational" ? "green" : "amber"}>{s.status}</Badge>
                    <span className="tabular w-16 text-right text-[0.75rem] font-bold text-slate-500 dark:text-slate-400">
                      {s.uptime}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* recent verifications */}
        <Card>
          <CardHeader
            title={t("db.recent")}
            icon={<Clock size={15} />}
            action={
              <Link to="/verify">
                <Button size="sm" variant="secondary">
                  <Upload size={14} />
                  {t("hero.cta1")}
                </Button>
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-[0.82rem]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[0.68rem] uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  <th className="px-4 py-3 font-bold">{t("v.ref")}</th>
                  <th className="px-4 py-3 font-bold">{L("File", "फ़ाइल")}</th>
                  <th className="px-4 py-3 font-bold">{t("v.docType")}</th>
                  <th className="px-4 py-3 font-bold">{t("v.state")}</th>
                  <th className="px-4 py-3 text-right font-bold">{t("card.confidence")}</th>
                  <th className="px-4 py-3 font-bold">{L("Verdict", "निर्णय")}</th>
                  <th className="px-4 py-3 font-bold">{L("Timestamp", "समय")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {merged.slice(0, 12).map((r) => {
                  const m = VERDICT_META[r.verdict];
                  return (
                    <tr key={r.id} className="transition hover:bg-gov-50/70 dark:hover:bg-white/5">
                      <td className="tabular px-4 py-3 font-semibold text-gov-700 dark:text-gov-300">
                        {r.mine ? (
                          <Link to={`/report/${encodeURIComponent(r.id)}`} className="hover:underline">
                            {r.id}
                          </Link>
                        ) : (
                          r.id
                        )}
                      </td>
                      <td className="max-w-[14rem] truncate px-4 py-3 text-slate-700 dark:text-slate-200">
                        {r.file}
                        {r.mine ? (
                          <span className="ml-2 rounded bg-leaf-500/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-leaf-700 dark:text-leaf-400">
                            {L("Yours", "आपका")}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.type}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.state}</td>
                      <td className="tabular px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-100">
                        {r.confidence.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            r.verdict === "verified" ? "green" : r.verdict === "review" ? "amber" : "red"
                          }
                        >
                          {r.verdict === "flagged" ? (
                            <AlertTriangle size={11} />
                          ) : (
                            <CheckCircle2 size={11} />
                          )}
                          {lang === "hi" ? m.hi : m.en}
                        </Badge>
                      </td>
                      <td className="tabular px-4 py-3 text-slate-500 dark:text-slate-400">
                        {new Date(r.at).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {verifications.length === 0 ? (
            <div className="border-t border-slate-200 bg-gov-50/50 px-5 py-4 text-center text-[0.8rem] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {t("db.empty")}{" "}
              <Link to="/verify" className="font-bold text-gov-700 underline dark:text-gov-300">
                {t("hero.cta1")}
              </Link>
            </div>
          ) : null}
        </Card>
      </div>
    </>
  );
}
