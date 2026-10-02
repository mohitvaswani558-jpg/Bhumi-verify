import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Map,
  RotateCcw,
  Search,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  PageHeader,
  Select,
  cx,
} from "../components/ui";
import {
  LAND_RECORDS,
  STATES,
  districtsOf,
  tehsilsOf,
  villagesOf,
} from "../lib/data";
import type { LandRecord } from "../lib/types";

const PAGE_SIZE = 10;

function statusTone(s: LandRecord["mutationStatus"]) {
  return s === "Approved" ? "green" : s === "Pending" ? "amber" : "red";
}

function encTone(s: LandRecord["encumbrance"]) {
  return s === "Clear" ? "green" : s === "Mortgage" ? "amber" : "red";
}

export default function LandRecords() {
  const { t, lang, toast } = useApp();

  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [tehsil, setTehsil] = useState("");
  const [village, setVillage] = useState("");
  const [khasra, setKhasra] = useState("");
  const [owner, setOwner] = useState("");
  const [page, setPage] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(() => {
    if (!submitted) return [];
    const q = owner.trim().toLowerCase();
    return LAND_RECORDS.filter((r) => {
      if (state && r.state !== state) return false;
      if (district && r.district !== district) return false;
      if (tehsil && r.tehsil !== tehsil) return false;
      if (village && r.village !== village) return false;
      if (khasra.trim() && !r.khasra.includes(khasra.trim())) return false;
      if (q && !r.owner.toLowerCase().includes(q) && !r.ownerHi.includes(owner.trim()))
        return false;
      return true;
    });
  }, [submitted, state, district, tehsil, village, khasra, owner]);

  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const reset = () => {
    setState("");
    setDistrict("");
    setTehsil("");
    setVillage("");
    setKhasra("");
    setOwner("");
    setPage(1);
    setSubmitted(false);
  };

  const exportCsv = () => {
    const head = [
      "Record ID",
      "Khasra",
      "Khata",
      "Owner",
      "Village",
      "Tehsil",
      "District",
      "State",
      "Area (Ha)",
      "Land Type",
      "Mutation Status",
      "Encumbrance",
    ];
    const rows = results.map((r) => [
      r.id,
      r.khasra,
      r.khata,
      r.owner,
      r.village,
      r.tehsil,
      r.district,
      r.state,
      String(r.areaHa),
      r.landType,
      r.mutationStatus,
      r.encumbrance,
    ]);
    const csv = [head, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bhoomiverify-land-records.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast(lang === "hi" ? "CSV निर्यात डाउनलोड हो रहा है" : "CSV export downloaded");
  };

  return (
    <>
      <PageHeader
        title={t("lr.title")}
        subtitle={t("lr.sub")}
        icon={<Map size={22} />}
        breadcrumb={[{ label: t("nav.home"), to: "/" }, { label: t("nav.land") }]}
        actions={
          <Badge tone="blue">
            <FileSpreadsheet size={12} />
            {LAND_RECORDS.length.toLocaleString("en-IN")} records
          </Badge>
        }
      />

      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
        {/* search panel */}
        <Card className="mb-6">
          <div className="border-b border-slate-200 bg-gov-50/60 px-5 py-3 dark:border-white/10 dark:bg-white/5">
            <h2 className="flex items-center gap-2 text-[0.95rem] font-bold text-gov-900 dark:text-white">
              <Search size={16} className="text-gov-600" aria-hidden />
              {lang === "hi" ? "अभिलेख खोज फ़ॉर्म" : "Record Search Form"}
            </h2>
          </div>
          <form
            className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSubmitted(true);
              if (!state && !khasra.trim() && !owner.trim()) {
                toast(
                  lang === "hi"
                    ? "कृपया कम से कम राज्य, खसरा संख्या या खातेदार का नाम भरें"
                    : "Please provide at least a State, Khasra number or owner name",
                  "error",
                );
              }
            }}
          >
            <div>
              <Label htmlFor="st" required>
                {t("v.state")}
              </Label>
              <Select
                id="st"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setDistrict("");
                  setTehsil("");
                  setVillage("");
                }}
              >
                <option value="">{lang === "hi" ? "— राज्य चुनें —" : "— Select State —"}</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="dt">{t("lr.district")}</Label>
              <Select
                id="dt"
                value={district}
                disabled={!state}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setTehsil("");
                  setVillage("");
                }}
              >
                <option value="">{lang === "hi" ? "— ज़िला चुनें —" : "— Select District —"}</option>
                {districtsOf(state).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="th">{t("lr.tehsil")}</Label>
              <Select
                id="th"
                value={tehsil}
                disabled={!district}
                onChange={(e) => {
                  setTehsil(e.target.value);
                  setVillage("");
                }}
              >
                <option value="">{lang === "hi" ? "— तहसील चुनें —" : "— Select Tehsil —"}</option>
                {tehsilsOf(state, district).map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="vg">{t("lr.village")}</Label>
              <Select id="vg" value={village} disabled={!tehsil} onChange={(e) => setVillage(e.target.value)}>
                <option value="">{lang === "hi" ? "— गाँव चुनें —" : "— Select Village —"}</option>
                {villagesOf(state, district, tehsil).map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="ks">{t("lr.khasra")}</Label>
              <Input
                id="ks"
                value={khasra}
                onChange={(e) => setKhasra(e.target.value)}
                placeholder={lang === "hi" ? "जैसे 142/2" : "e.g. 142/2"}
              />
            </div>

            <div>
              <Label htmlFor="ow">{t("lr.owner")}</Label>
              <Input
                id="ow"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder={lang === "hi" ? "खातेदार का नाम" : "Record holder name"}
              />
            </div>

            <div className="flex flex-wrap items-end gap-2.5 sm:col-span-2 lg:col-span-3">
              <Button type="submit" size="lg">
                <Search size={17} />
                {t("c.search")}
              </Button>
              <Button type="button" variant="secondary" size="lg" onClick={reset}>
                <RotateCcw size={17} />
                {t("c.reset")}
              </Button>
              {results.length > 0 ? (
                <Button type="button" variant="outline" size="lg" className="ml-auto" onClick={exportCsv}>
                  <Download size={17} />
                  {lang === "hi" ? "CSV निर्यात" : "Export CSV"}
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        {/* results */}
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5 dark:border-white/10">
            <h2 className="text-[0.95rem] font-bold text-gov-900 dark:text-white">
              {t("lr.results")}
              {submitted ? (
                <span className="tabular ml-2 rounded bg-gov-50 px-2 py-0.5 text-[0.72rem] font-bold text-gov-700 dark:bg-gov-800 dark:text-gov-200">
                  {results.length.toLocaleString("en-IN")}
                </span>
              ) : null}
            </h2>
            {submitted && page > 1 ? (
              <span className="text-[0.75rem] text-slate-500">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, results.length)}
              </span>
            ) : null}
          </div>

          {!submitted ? (
            <div className="grid place-items-center px-6 py-16 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-gov-50 text-gov-400 dark:bg-white/5">
                <Map size={30} />
              </span>
              <p className="mt-4 max-w-md text-sm text-slate-600 dark:text-slate-300">
                {lang === "hi"
                  ? "अभिलेख खोजने के लिए ऊपर दिया गया फ़ॉर्म भरें और “खोजें” पर क्लिक करें।"
                  : "Fill in the search form above and press “Search” to query the consolidated national land-record repository."}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="grid place-items-center px-6 py-16 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-saffron-500/10 text-saffron-500">
                <Search size={30} />
              </span>
              <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("c.none")}
              </p>
              <p className="mt-1 max-w-md text-[0.8rem] text-slate-500 dark:text-slate-400">
                {lang === "hi"
                  ? "कृपया खोज मापदंड बदलकर पुनः प्रयास करें।"
                  : "Try broadening the geography filters or check the Khasra number format."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[54rem] border-collapse text-left text-[0.82rem]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[0.7rem] uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                      <th className="px-4 py-3 font-bold">{t("lr.khasra")}</th>
                      <th className="px-4 py-3 font-bold">{t("lr.owner")}</th>
                      <th className="px-4 py-3 font-bold">{t("lr.village")} / {t("lr.tehsil")}</th>
                      <th className="px-4 py-3 font-bold">{t("lr.district")}</th>
                      <th className="px-4 py-3 text-right font-bold">{t("lr.area")}</th>
                      <th className="px-4 py-3 font-bold">{t("lr.type")}</th>
                      <th className="px-4 py-3 font-bold">{t("lr.mutation")}</th>
                      <th className="px-4 py-3 font-bold">{t("lr.encumbrance")}</th>
                      <th className="px-4 py-3 text-center font-bold">{t("c.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {current.map((r) => (
                      <tr
                        key={r.id}
                        className="transition hover:bg-gov-50/70 dark:hover:bg-white/5"
                      >
                        <td className="tabular px-4 py-3 font-bold text-gov-800 dark:text-gov-200">
                          {r.khasra}
                          <span className="mt-0.5 block text-[0.66rem] font-medium text-slate-400">
                            Kh. {r.khata}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {lang === "hi" ? r.ownerHi : r.owner}
                          </span>
                          <span className="mt-0.5 block text-[0.68rem] text-slate-500">
                            S/o {r.fatherName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {r.village}
                          <span className="block text-[0.7rem] text-slate-400">{r.tehsil}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {r.district}
                          <span className="block text-[0.7rem] text-slate-400">{r.state}</span>
                        </td>
                        <td className="tabular px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                          {r.areaHa.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {lang === "hi" ? r.landTypeHi : r.landType}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={statusTone(r.mutationStatus) as "green" | "amber" | "red"}>
                            {r.mutationStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={encTone(r.encumbrance) as "green" | "amber" | "red"}>
                            {r.encumbrance}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link to={`/land-records/${r.id}`}>
                            <Button size="sm" variant="secondary">
                              {t("c.view")}
                              <ChevronRight size={13} />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pages > 1 ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3.5 dark:border-white/10">
                  <p className="text-[0.76rem] text-slate-500 dark:text-slate-400">
                    {lang === "hi" ? "पृष्ठ" : "Page"} {page} / {pages}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={14} /> {lang === "hi" ? "पिछला" : "Prev"}
                    </Button>
                    {Array.from({ length: Math.min(5, pages) }).map((_, i) => {
                      const start = Math.max(1, Math.min(page - 2, pages - 4));
                      const n = start + i;
                      if (n > pages) return null;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPage(n)}
                          className={cx(
                            "tabular h-8 w-8 rounded border text-[0.78rem] font-bold transition",
                            n === page
                              ? "border-gov-700 bg-gov-700 text-white"
                              : "border-slate-300 bg-white text-slate-600 hover:border-gov-500 hover:text-gov-700 dark:border-white/15 dark:bg-transparent dark:text-slate-300",
                          )}
                        >
                          {n}
                        </button>
                      );
                    })}
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={page === pages}
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    >
                      {lang === "hi" ? "अगला" : "Next"} <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </Card>
      </div>
    </>
  );
}
