import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Download,
  FileSearch,
  History,
  LandPlot,
  MapPin,
  Printer,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Badge, Button, Card, CardHeader, PageHeader } from "../components/ui";
import { LAND_RECORDS } from "../lib/data";
import NotFound from "./NotFound";

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function RecordDetail() {
  const { id } = useParams();
  const { t, lang, toast } = useApp();
  const rec = LAND_RECORDS.find((r) => r.id === id);

  if (!rec) return <NotFound />;

  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const rorText = [
    "=".repeat(70),
    "  RECORD OF RIGHTS (RoR) — KHASRA / KHATAUNI EXTRACT",
    "  अधिकार अभिलेख — खसरा / खतौनी उद्धरण",
    "  Department of Land Resources, Government of India",
    "=".repeat(70),
    "",
    `Record ID          : ${rec.id}`,
    `State              : ${rec.state}`,
    `District           : ${rec.district}`,
    `Tehsil             : ${rec.tehsil}`,
    `Village            : ${rec.village}`,
    `Khasra / Survey No : ${rec.khasra}`,
    `Khata No.          : ${rec.khata}`,
    "",
    `Record Holder      : ${rec.owner}  (${rec.ownerHi})`,
    `Father / Husband   : ${rec.fatherName}`,
    `Total Area         : ${rec.areaHa.toFixed(2)} Ha`,
    `Land Type          : ${rec.landType}`,
    `Irrigation Source  : ${rec.irrigation}`,
    "",
    `Mutation No.       : ${rec.mutationNo}`,
    `Mutation Status    : ${rec.mutationStatus}`,
    `Mutation Date      : ${rec.mutationDate}`,
    `Encumbrance        : ${rec.encumbrance}`,
    `Land Revenue Paid  : ${rec.taxPaid ? "Yes" : "No (arrears)"}`,
    `Last Updated       : ${rec.lastUpdated}`,
    "",
    "OWNERSHIP HISTORY",
    ...rec.history.map(
      (h) => `  ${h.date}  ${h.event}\n             from: ${h.from}  ->  to: ${h.to}`,
    ),
    "",
    "-".repeat(70),
    "  Computer-generated extract. Verify authenticity at BhoomiVerify AI",
    "  using the record ID printed above.",
    "-".repeat(70),
  ].join("\n");

  const fields: [string, string][] = [
    [L("Record ID", "अभिलेख आईडी"), rec.id],
    [L("State", "राज्य"), rec.state],
    [L("District", "ज़िला"), rec.district],
    [L("Tehsil", "तहसील"), rec.tehsil],
    [L("Village", "गाँव"), rec.village],
    [L("Khasra / Survey No.", "खसरा / सर्वे नं."), rec.khasra],
    [L("Khata No.", "खाता संख्या"), rec.khata],
    [L("Record Holder", "खातेदार"), `${lang === "hi" ? rec.ownerHi : rec.owner}`],
    [L("Father / Husband", "पिता / पति"), rec.fatherName],
    [L("Total Area", "कुल क्षेत्रफल"), `${rec.areaHa.toFixed(2)} Ha`],
    [L("Land Type", "भूमि प्रकार"), lang === "hi" ? rec.landTypeHi : rec.landType],
    [L("Irrigation Source", "सिंचाई स्रोत"), rec.irrigation],
    [L("Mutation No.", "नामांतरण संख्या"), rec.mutationNo],
    [L("Mutation Date", "नामांतरण तिथि"), rec.mutationDate],
    [L("Land Revenue", "भूमि राजस्व"), rec.taxPaid ? L("Paid", "भुगतान किया") : L("Arrears", "बकाया")],
    [L("Last Updated", "अंतिम अद्यतन"), rec.lastUpdated],
  ];

  return (
    <>
      <PageHeader
        title={`${L("Record of Rights", "अधिकार अभिलेख")} — Khasra ${rec.khasra}`}
        subtitle={`${rec.village}, ${rec.tehsil}, ${rec.district}, ${rec.state}`}
        icon={<LandPlot size={22} />}
        breadcrumb={[
          { label: t("nav.home"), to: "/" },
          { label: t("nav.land"), to: "/land-records" },
          { label: rec.id },
        ]}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer size={15} /> {t("c.print")}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                downloadText(`RoR-${rec.id}.txt`, rorText);
                toast(L("RoR extract downloaded", "RoR उद्धरण डाउनलोड हुआ"));
              }}
            >
              <Download size={15} /> {t("lr.downloadRor")}
            </Button>
          </>
        }
      />

      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
        <Link
          to="/land-records"
          className="mb-5 inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-gov-700 transition hover:underline dark:text-gov-300"
        >
          <ArrowLeft size={15} /> {L("Back to search results", "खोज परिणामों पर वापस")}
        </Link>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            {/* RoR fields */}
            <Card>
              <CardHeader
                title={t("lr.detail")}
                icon={<BadgeCheck size={15} />}
                action={
                  <Badge tone={rec.encumbrance === "Clear" ? "green" : rec.encumbrance === "Mortgage" ? "amber" : "red"}>
                    {rec.encumbrance === "Clear" ? (
                      <ShieldCheck size={12} />
                    ) : (
                      <TriangleAlert size={12} />
                    )}
                    {rec.encumbrance}
                  </Badge>
                }
              />
              <dl className="grid gap-px overflow-hidden rounded-b-lg bg-slate-200 sm:grid-cols-2 dark:bg-white/10">
                {fields.map(([k, v]) => (
                  <div key={k} className="bg-white px-5 py-3.5 dark:bg-gov-950">
                    <dt className="text-[0.7rem] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {k}
                    </dt>
                    <dd className="mt-1 text-[0.88rem] font-semibold text-slate-900 dark:text-slate-100">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>

            {/* map */}
            <Card>
              <CardHeader title={t("lr.map")} icon={<MapPin size={15} />} />
              <div className="p-5">
                <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
                  <img
                    src="/images/land-aerial.jpg"
                    alt={`Cadastral preview for Khasra ${rec.khasra}, ${rec.village}`}
                    className="h-72 w-full object-cover sm:h-96"
                    loading="lazy"
                  />
                  <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden>
                    <g stroke="#ffffff" strokeWidth="1.1" fill="none" opacity="0.75">
                      <path d="M0 60 L120 44 L250 66 L400 40" />
                      <path d="M0 130 L110 118 L240 140 L400 112" />
                      <path d="M0 205 L130 190 L260 214 L400 186" />
                      <path d="M70 0 L86 300" />
                      <path d="M160 0 L176 300" />
                      <path d="M250 0 L268 300" />
                      <path d="M330 0 L344 300" />
                    </g>
                    <path
                      d="M176 118 L250 128 L262 196 L182 208 Z"
                      fill="#16a34a"
                      fillOpacity="0.35"
                      stroke="#16a34a"
                      strokeWidth="3"
                    />
                    <circle cx="219" cy="163" r="5" fill="#ffffff" stroke="#15803d" strokeWidth="2.5" />
                    <text
                      x="219"
                      y="236"
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="700"
                      fill="#ffffff"
                      stroke="#0a1c3a"
                      strokeWidth="3"
                      paintOrder="stroke"
                    >
                      Khasra {rec.khasra}
                    </text>
                  </svg>
                  <span className="absolute left-3 top-3 rounded bg-gov-950/85 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                    Sheet 12 · Scale 1:4000
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-[0.75rem] text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm border-2 border-leaf-600 bg-leaf-500/40" />
                    {L("Selected parcel", "चयनित पार्सल")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-5 bg-white ring-1 ring-slate-300" />
                    {L("Parcel boundary", "पार्सल सीमा")}
                  </span>
                  <span className="tabular ml-auto font-semibold text-gov-700 dark:text-gov-300">
                    {rec.areaHa.toFixed(2)} Ha · ULPIN IN{rec.state.slice(0, 2).toUpperCase()}
                    {String(rec.khata).padStart(4, "0")}
                  </span>
                </div>
              </div>
            </Card>

            {/* history */}
            <Card>
              <CardHeader title={t("lr.history")} icon={<History size={15} />} />
              <ol className="relative space-y-6 p-5 pl-9">
                <span
                  className="absolute bottom-6 left-[1.15rem] top-6 w-0.5 bg-gov-200 dark:bg-white/15"
                  aria-hidden
                />
                {rec.history.map((h, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[1.55rem] top-1 grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-gov-600 text-[0.6rem] font-bold text-white shadow dark:border-gov-950">
                      {i + 1}
                    </span>
                    <p className="tabular text-[0.72rem] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {new Date(h.date).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-0.5 text-[0.9rem] font-bold text-gov-900 dark:text-white">
                      {h.event}
                    </p>
                    <p className="mt-1 text-[0.8rem] text-slate-600 dark:text-slate-300">
                      {L("From", "से")}: <strong>{h.from}</strong> → {L("To", "को")}:{" "}
                      <strong>{h.to}</strong>
                    </p>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          {/* sidebar */}
          <aside className="space-y-5">
            <Card>
              <CardHeader title={L("Encumbrance Status", "भारमुक्तता स्थिति")} icon={<ShieldCheck size={15} />} />
              <div className="space-y-3 p-5">
                <div
                  className={
                    rec.encumbrance === "Clear"
                      ? "rounded-md border border-leaf-500/40 bg-leaf-500/8 p-4"
                      : "rounded-md border border-saffron-500/40 bg-saffron-500/8 p-4"
                  }
                >
                  <p className="flex items-center gap-2 text-[0.95rem] font-extrabold text-gov-900 dark:text-white">
                    {rec.encumbrance === "Clear" ? (
                      <ShieldCheck size={18} className="text-leaf-600" />
                    ) : (
                      <TriangleAlert size={18} className="text-saffron-500" />
                    )}
                    {rec.encumbrance}
                  </p>
                  <p className="mt-1.5 text-[0.78rem] leading-relaxed text-slate-600 dark:text-slate-300">
                    {rec.encumbrance === "Clear"
                      ? L(
                          "No mortgage, lien, attachment or civil litigation is recorded against this parcel as on the last update date.",
                          "अंतिम अद्यतन तिथि तक इस पार्सल पर कोई बंधक, भार, कुर्की या सिविल मुक़दमा दर्ज नहीं है।",
                        )
                      : L(
                          "An entry exists in the encumbrance register. Obtain a certified Encumbrance Certificate before any transaction.",
                          "भारमुक्तता रजिस्टर में एक प्रविष्टि विद्यमान है। किसी भी लेन-देन से पहले प्रमाणित भारमुक्तता प्रमाणपत्र प्राप्त करें।",
                        )}
                  </p>
                </div>
                <Link to="/encumbrance">
                  <Button variant="secondary" className="w-full">
                    <FileSearch size={16} />
                    {L("Generate full EC", "पूर्ण ईसी बनाएँ")}
                  </Button>
                </Link>
              </div>
            </Card>

            <Card>
              <CardHeader title={L("Mutation (Dakhil-Kharij)", "नामांतरण (दाखिल-खारिज)")} icon={<BadgeCheck size={15} />} />
              <div className="space-y-3 p-5 text-[0.82rem]">
                <p className="flex justify-between gap-3">
                  <span className="text-slate-500 dark:text-slate-400">{L("Application", "आवेदन")}</span>
                  <span className="tabular font-semibold text-slate-800 dark:text-slate-100">
                    {rec.mutationNo}
                  </span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 dark:text-slate-400">{t("c.status")}</span>
                  <Badge
                    tone={
                      rec.mutationStatus === "Approved"
                        ? "green"
                        : rec.mutationStatus === "Pending"
                          ? "amber"
                          : "red"
                    }
                  >
                    {rec.mutationStatus}
                  </Badge>
                </p>
                <Link to="/mutation">
                  <Button variant="outline" className="mt-2 w-full">
                    {L("Track mutation status", "नामांतरण स्थिति देखें")}
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="border-gov-300 bg-gradient-to-br from-gov-50 to-white dark:border-gov-700 dark:from-gov-900/60 dark:to-gov-950">
              <div className="p-5">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-gov-700 text-white shadow">
                  <FileSearch size={20} />
                </span>
                <h3 className="mt-3 text-[0.95rem] font-bold text-gov-900 dark:text-white">
                  {L("Verify a scanned copy with AI", "एआई से स्कैन प्रति सत्यापित करें")}
                </h3>
                <p className="mt-1.5 text-[0.78rem] leading-relaxed text-slate-600 dark:text-slate-300">
                  {L(
                    "Hold a printed or scanned copy of this record? Run it through BhoomiVerify AI to detect tampering and confirm the seal of the issuing office.",
                    "इस अभिलेख की मुद्रित या स्कैन प्रति आपके पास है? छेड़छाड़ पहचानने और जारीकर्ता कार्यालय की मुहर पुष्टि हेतु उसे भूमि सत्यापन एआई पर जाँचें।",
                  )}
                </p>
                <Link to="/verify" className="mt-3.5 block">
                  <Button className="w-full">
                    <FileSearch size={16} />
                    {t("nav.verify")}
                  </Button>
                </Link>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
