import { useMemo, useState } from "react";
import {
  Download,
  FileCheck2,
  ScrollText,
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  PageHeader,
  Select,
  cx,
} from "../components/ui";
import { LAND_RECORDS, STATES, districtsOf, tehsilsOf, villagesOf } from "../lib/data";
import type { LandRecord } from "../lib/types";

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function Encumbrance() {
  const { t, lang, toast } = useApp();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const [state, setState] = useState(STATES[0]);
  const [district, setDistrict] = useState("");
  const [tehsil, setTehsil] = useState("");
  const [village, setVillage] = useState("");
  const [survey, setSurvey] = useState("");
  const [from, setFrom] = useState("2016-01-01");
  const [to, setTo] = useState("2026-09-26");
  const [searched, setSearched] = useState(false);

  const match = useMemo(() => {
    return (
      LAND_RECORDS.find(
        (r) =>
          r.state === state &&
          (!district || r.district === district) &&
          (!tehsil || r.tehsil === tehsil) &&
          (!village || r.village === village) &&
          (!survey.trim() || r.khasra.includes(survey.trim())),
      ) ?? null
    );
  }, [state, district, tehsil, village, survey]);

  const transactions = useMemo(() => {
    if (!match) return [];
    const base = [
      {
        date: match.history[0].date,
        doc: "Sale Deed",
        no: `REG/${match.district.slice(0, 3).toUpperCase()}/${match.history[0].date.slice(0, 4)}/${2200 + (match.areaHa * 7 | 0)}`,
        party: match.history[0].from,
        amount: `₹${(match.areaHa * 425000).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
        type: "Transfer",
      },
      {
        date: match.history[1].date,
        doc: "Mutation Order",
        no: match.mutationNo,
        party: match.owner,
        amount: "—",
        type: "Revenue Entry",
      },
    ];
    if (match.encumbrance === "Mortgage") {
      base.push({
        date: `${Number(match.mutationDate.slice(0, 4)) + 1}-04-18`,
        doc: "Mortgage Deed",
        no: `MRT/${match.district.slice(0, 3).toUpperCase()}/${7741 + (match.areaHa | 0)}`,
        party: "State Bank of India, " + match.tehsil + " Branch",
        amount: `₹${(match.areaHa * 180000).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
        type: "Charge",
      });
    }
    if (match.encumbrance === "Litigation") {
      base.push({
        date: `${Number(match.mutationDate.slice(0, 4)) + 2}-08-02`,
        doc: "Civil Suit Notice",
        no: `OS/${118 + (match.areaHa | 0)}/${Number(match.mutationDate.slice(0, 4)) + 2}`,
        party: "Court of Civil Judge (Senior Division), " + match.district,
        amount: "—",
        type: "Litigation",
      });
    }
    return base;
  }, [match]);

  const ecText = () => {
    if (!match) return "";
    return [
      "=".repeat(72),
      "  ENCUMBRANCE CERTIFICATE (FORM No. 15)",
      "  भारमुक्तता प्रमाणपत्र",
      "  Department of Land Resources, Government of India",
      "=".repeat(72),
      "",
      `Certificate No. : EC/${match.district.slice(0, 3).toUpperCase()}/${match.id.slice(-6)}`,
      `Period Covered  : ${from} to ${to}`,
      `Survey / Khasra : ${match.khasra}`,
      `Village         : ${match.village}`,
      `Tehsil          : ${match.tehsil}`,
      `District        : ${match.district}`,
      `State           : ${match.state}`,
      `Extent          : ${match.areaHa.toFixed(2)} Ha`,
      `Record Holder   : ${match.owner}`,
      "",
      `STATUS: ${match.encumbrance === "Clear" ? "NIL ENCUMBRANCE" : match.encumbrance.toUpperCase()}`,
      "",
      "TRANSACTIONS ON RECORD",
      ...transactions.map(
        (x) => `  ${x.date} | ${x.doc} | ${x.no} | ${x.party} | ${x.amount} | ${x.type}`,
      ),
      "",
      "-".repeat(72),
      "  Computer generated certificate issued under Rule 57 of the",
      "  Registration Rules. Verify at the BhoomiVerify AI portal.",
      "-".repeat(72),
    ].join("\n");
  };

  return (
    <>
      <PageHeader
        title={t("svc.s4t")}
        subtitle={L(
          "Generate a period-wise Encumbrance Certificate and inspect every registered transaction, charge and litigation entry against a survey number.",
          "अवधि-वार भारमुक्तता प्रमाणपत्र बनाएँ और किसी सर्वे संख्या पर पंजीकृत सभी लेन-देन, भार एवं मुक़दमा प्रविष्टियाँ देखें।",
        )}
        icon={<ScrollText size={22} />}
        breadcrumb={[{ label: t("nav.home"), to: "/" }, { label: t("svc.s4t") }]}
      />

      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[21rem_minmax(0,1fr)]">
          <Card className="h-fit">
            <CardHeader title={L("EC Request", "ईसी अनुरोध")} icon={<Search size={15} />} />
            <form
              className="space-y-4 p-5"
              onSubmit={(e) => {
                e.preventDefault();
                setSearched(true);
                if (!match)
                  toast(L("No parcel found for these filters", "इन फ़िल्टर के लिए कोई पार्सल नहीं मिला"), "error");
              }}
            >
              <div>
                <Label htmlFor="e-st" required>
                  {t("v.state")}
                </Label>
                <Select
                  id="e-st"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setDistrict("");
                    setTehsil("");
                    setVillage("");
                  }}
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="e-dt">{t("lr.district")}</Label>
                <Select
                  id="e-dt"
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setTehsil("");
                    setVillage("");
                  }}
                >
                  <option value="">{L("Any", "कोई भी")}</option>
                  {districtsOf(state).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="e-th">{t("lr.tehsil")}</Label>
                <Select id="e-th" value={tehsil} disabled={!district} onChange={(e) => { setTehsil(e.target.value); setVillage(""); }}>
                  <option value="">{L("Any", "कोई भी")}</option>
                  {tehsilsOf(state, district).map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="e-vg">{t("lr.village")}</Label>
                <Select id="e-vg" value={village} disabled={!tehsil} onChange={(e) => setVillage(e.target.value)}>
                  <option value="">{L("Any", "कोई भी")}</option>
                  {villagesOf(state, district, tehsil).map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="e-sv">{t("lr.khasra")}</Label>
                <Input
                  id="e-sv"
                  value={survey}
                  onChange={(e) => setSurvey(e.target.value)}
                  placeholder={L("Leave blank for the first match", "पहले मिलान हेतु खाली छोड़ें")}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="e-from">{L("Period From", "अवधि से")}</Label>
                  <Input id="e-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="e-to">{L("Period To", "अवधि तक")}</Label>
                  <Input id="e-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full">
                <FileCheck2 size={17} />
                {L("Generate Certificate", "प्रमाणपत्र बनाएँ")}
              </Button>
            </form>
          </Card>

          <div>
            {!searched ? (
              <Card className="grid place-items-center px-6 py-20 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-gov-50 text-gov-400 dark:bg-white/5">
                  <ScrollText size={30} />
                </span>
                <p className="mt-4 max-w-md text-sm text-slate-600 dark:text-slate-300">
                  {L(
                    "Select the geography and the period, then generate the certificate. The register covers all documents registered under the Registration Act, 1908.",
                    "क्षेत्र एवं अवधि चुनें, फिर प्रमाणपत्र बनाएँ। यह रजिस्टर पंजीकरण अधिनियम, 1908 के अंतर्गत पंजीकृत सभी दस्तावेज़ों को शामिल करता है।",
                  )}
                </p>
              </Card>
            ) : !match ? (
              <Card className="grid place-items-center px-6 py-20 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-saffron-500/10 text-saffron-500">
                  <TriangleAlert size={30} />
                </span>
                <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {t("c.none")}
                </p>
                <p className="mt-1 max-w-md text-[0.8rem] text-slate-500 dark:text-slate-400">
                  {L(
                    "Try widening the district or tehsil filter, or clear the survey number field.",
                    "ज़िला या तहसील फ़िल्टर विस्तृत करें, अथवा सर्वे संख्या फ़ील्ड खाली करें।",
                  )}
                </p>
                <Button variant="secondary" className="mt-5" onClick={() => setSearched(false)}>
                  {t("c.reset")}
                </Button>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div
                  className={cx(
                    "flex flex-wrap items-center gap-4 border-b px-5 py-5",
                    match.encumbrance === "Clear"
                      ? "border-leaf-500/30 bg-leaf-500/10"
                      : "border-saffron-500/30 bg-saffron-500/10",
                  )}
                >
                  <span
                    className={cx(
                      "grid h-14 w-14 shrink-0 place-items-center rounded-full text-white shadow-lg",
                      match.encumbrance === "Clear" ? "bg-leaf-600" : "bg-saffron-500",
                    )}
                  >
                    {match.encumbrance === "Clear" ? (
                      <ShieldCheck size={28} />
                    ) : (
                      <TriangleAlert size={28} />
                    )}
                  </span>
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      {L("Encumbrance Certificate", "भारमुक्तता प्रमाणपत्र")} · Form 15
                    </p>
                    <h2
                      className={cx(
                        "text-xl font-extrabold tracking-tight",
                        match.encumbrance === "Clear"
                          ? "text-leaf-700 dark:text-leaf-400"
                          : "text-saffron-600 dark:text-saffron-400",
                      )}
                    >
                      {match.encumbrance === "Clear"
                        ? L("NIL ENCUMBRANCE", "भारमुक्त")
                        : match.encumbrance.toUpperCase()}
                    </h2>
                    <p className="tabular mt-0.5 text-[0.75rem] text-slate-600 dark:text-slate-300">
                      EC/{match.district.slice(0, 3).toUpperCase()}/{match.id.slice(-6)} · {from} → {to}
                    </p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        downloadText(`EC-${match.id}.txt`, ecText());
                        toast(L("Certificate downloaded", "प्रमाणपत्र डाउनलोड हुआ"));
                      }}
                    >
                      <Download size={15} /> {t("c.download")}
                    </Button>
                  </div>
                </div>

                <dl className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4 dark:bg-white/10">
                  {[
                    [t("lr.khasra"), match.khasra],
                    [L("Extent", "क्षेत्रफल"), `${match.areaHa.toFixed(2)} Ha`],
                    [L("Record Holder", "खातेदार"), lang === "hi" ? match.ownerHi : match.owner],
                    [L("Village / Tehsil", "गाँव / तहसील"), `${match.village}, ${match.tehsil}`],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-white px-4 py-3 dark:bg-gov-950">
                      <dt className="text-[0.68rem] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {k}
                      </dt>
                      <dd className="mt-0.5 text-[0.85rem] font-semibold text-slate-900 dark:text-slate-100">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="p-5">
                  <h3 className="mb-3 text-[0.85rem] font-bold uppercase tracking-wide text-gov-800 dark:text-gov-200">
                    {L("Registered Transactions", "पंजीकृत लेन-देन")} ({transactions.length})
                  </h3>
                  <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-white/10">
                    <table className="w-full min-w-[46rem] text-left text-[0.8rem]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[0.66rem] uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                          <th className="px-3 py-2.5 font-bold">{t("c.date")}</th>
                          <th className="px-3 py-2.5 font-bold">{L("Document", "दस्तावेज़")}</th>
                          <th className="px-3 py-2.5 font-bold">{L("Registration No.", "पंजीकरण संख्या")}</th>
                          <th className="px-3 py-2.5 font-bold">{L("Party / Authority", "पक्षकार / प्राधिकारी")}</th>
                          <th className="px-3 py-2.5 text-right font-bold">{L("Consideration", "प्रतिफल")}</th>
                          <th className="px-3 py-2.5 font-bold">{L("Nature", "प्रकृति")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {transactions.map((x, i) => (
                          <tr key={i} className="odd:bg-white even:bg-slate-50/60 dark:odd:bg-transparent dark:even:bg-white/5">
                            <td className="tabular px-3 py-2.5 text-slate-600 dark:text-slate-300">{x.date}</td>
                            <td className="px-3 py-2.5 font-semibold text-slate-800 dark:text-slate-100">{x.doc}</td>
                            <td className="tabular px-3 py-2.5 text-slate-600 dark:text-slate-300">{x.no}</td>
                            <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{x.party}</td>
                            <td className="tabular px-3 py-2.5 text-right font-semibold text-slate-800 dark:text-slate-100">
                              {x.amount}
                            </td>
                            <td className="px-3 py-2.5">
                              <Badge
                                tone={
                                  x.type === "Charge"
                                    ? "amber"
                                    : x.type === "Litigation"
                                      ? "red"
                                      : "blue"
                                }
                              >
                                {x.type}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 text-[0.75rem] leading-relaxed text-slate-500 dark:text-slate-400">
                    {L(
                      "This certificate reflects entries recorded in the digitised encumbrance register for the selected period. Documents registered but not yet digitised may not appear; please confirm with the concerned Sub-Registrar.",
                      "यह प्रमाणपत्र चयनित अवधि हेतु डिजिटाइज़्ड भारमुक्तता रजिस्टर में दर्ज प्रविष्टियों को दर्शाता है। पंजीकृत लेकिन अभी तक डिजिटाइज़ न हुए दस्तावेज़ नहीं दिख सकते; कृपया संबंधित उप-पंजीयक से पुष्टि करें।",
                    )}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
