import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  FileStack,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  Modal,
  PageHeader,
  Select,
  cx,
} from "../components/ui";
import { LAND_RECORDS, STATES, districtsOf } from "../lib/data";
import type { LandRecord } from "../lib/types";

const SAMPLE_APPS = [
  { no: "MUT/LKN/2026/4412", stage: 3 },
  { no: "MUT/PUN/2026/8830", stage: 1 },
  { no: "MUT/BGM/2026/2214", stage: 4 },
];

const STAGES = [
  { en: "Application submitted at Tehsil", hi: "तहसील में आवेदन प्रस्तुत" },
  { en: "Patwari field verification", hi: "पटवारी द्वारा मौक़ा सत्यापन" },
  { en: "Objections invited (15 days)", hi: "आपत्ति आमंत्रित (15 दिन)" },
  { en: "Tehsildar hearing & order", hi: "तहसीलदार सुनवाई एवं आदेश" },
  { en: "RoR updated (Dakhil-Kharij)", hi: "अधिकार अभिलेख अद्यतन (दाखिल-खारिज)" },
];

export default function Mutation() {
  const { t, lang, toast } = useApp();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState<LandRecord | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newForm, setNewForm] = useState({ khasra: "", village: "", reason: "Sale / Purchase", applicant: "" });
  const [newRef, setNewRef] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return LAND_RECORDS.filter((r) => {
      if (state && r.state !== state) return false;
      if (district && r.district !== district) return false;
      if (status !== "All" && r.mutationStatus !== status) return false;
      if (!needle) return true;
      return (
        r.mutationNo.toLowerCase().includes(needle) ||
        r.khasra.includes(needle) ||
        r.owner.toLowerCase().includes(needle) ||
        r.village.toLowerCase().includes(needle)
      );
    }).slice(0, 60);
  }, [state, district, q, status]);

  const stageFor = (r: LandRecord) =>
    r.mutationStatus === "Approved" ? 5 : r.mutationStatus === "Rejected" ? 4 : 2;

  return (
    <>
      <PageHeader
        title={L("Mutation Status (Dakhil-Kharij)", "नामांतरण स्थिति (दाखिल-खारिज)")}
        subtitle={L(
          "Track mutation applications, view the sanction history and download mutation certificates for any parcel.",
          "नामांतरण आवेदनों को ट्रैक करें, स्वीकृति इतिहास देखें और किसी भी पार्सल हेतु नामांतरण प्रमाणपत्र डाउनलोड करें।",
        )}
        icon={<FileStack size={22} />}
        breadcrumb={[{ label: t("nav.home"), to: "/" }, { label: t("svc.s3t") }]}
        actions={
          <Button size="sm" onClick={() => setNewOpen(true)}>
            <Plus size={15} /> {L("New Application", "नया आवेदन")}
          </Button>
        }
      />

      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
        <Card className="mb-6">
          <form
            className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <Label htmlFor="m-st">{t("v.state")}</Label>
              <Select
                id="m-st"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setDistrict("");
                }}
              >
                <option value="">{L("All States", "सभी राज्य")}</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="m-dt">{t("lr.district")}</Label>
              <Select id="m-dt" value={district} disabled={!state} onChange={(e) => setDistrict(e.target.value)}>
                <option value="">{L("All Districts", "सभी ज़िले")}</option>
                {districtsOf(state).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="m-q">{L("Application / Khasra / Owner", "आवेदन / खसरा / खातेदार")}</Label>
              <Input
                id="m-q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={L("e.g. MUT/LKN/2026/4412", "जैसे MUT/LKN/2026/4412")}
              />
            </div>
            <div>
              <Label htmlFor="m-status">{t("c.status")}</Label>
              <Select id="m-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                {["All", "Approved", "Pending", "Rejected"].map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? t("c.all") : s}
                  </option>
                ))}
              </Select>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader
            title={L("Mutation Register", "नामांतरण रजिस्टर")}
            icon={<Search size={15} />}
            action={
              <span className="tabular rounded bg-gov-50 px-2 py-0.5 text-[0.72rem] font-bold text-gov-700 dark:bg-gov-800 dark:text-gov-200">
                {rows.length}
              </span>
            }
          />
          {rows.length === 0 ? (
            <p className="px-5 py-14 text-center text-sm text-slate-500 dark:text-slate-400">
              {t("c.none")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] text-left text-[0.82rem]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[0.68rem] uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    <th className="px-4 py-3 font-bold">{L("Mutation No.", "नामांतरण संख्या")}</th>
                    <th className="px-4 py-3 font-bold">{t("lr.khasra")}</th>
                    <th className="px-4 py-3 font-bold">{t("lr.owner")}</th>
                    <th className="px-4 py-3 font-bold">{t("lr.village")}</th>
                    <th className="px-4 py-3 font-bold">{L("Progress", "प्रगति")}</th>
                    <th className="px-4 py-3 font-bold">{t("c.status")}</th>
                    <th className="px-4 py-3 text-center font-bold">{t("c.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {rows.map((r) => {
                    const stage = stageFor(r);
                    return (
                      <tr key={r.id} className="transition hover:bg-gov-50/70 dark:hover:bg-white/5">
                        <td className="tabular px-4 py-3 font-semibold text-gov-700 dark:text-gov-300">
                          {r.mutationNo}
                        </td>
                        <td className="tabular px-4 py-3 font-bold text-slate-800 dark:text-slate-100">
                          {r.khasra}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                          {lang === "hi" ? r.ownerHi : r.owner}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {r.village}, {r.tehsil}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={cx(
                                  "h-1.5 w-6 rounded-full",
                                  i < stage
                                    ? r.mutationStatus === "Rejected"
                                      ? "bg-red-500"
                                      : "bg-leaf-500"
                                    : "bg-slate-200 dark:bg-white/15",
                                )}
                              />
                            ))}
                            <span className="tabular ml-2 text-[0.7rem] font-bold text-slate-500">
                              {stage}/5
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            tone={
                              r.mutationStatus === "Approved"
                                ? "green"
                                : r.mutationStatus === "Pending"
                                  ? "amber"
                                  : "red"
                            }
                          >
                            {r.mutationStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button size="sm" variant="secondary" onClick={() => setSelected(r)}>
                            {t("c.view")} <ChevronRight size={13} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${L("Mutation", "नामांतरण")} · ${selected.mutationNo}` : ""}
        wide
      >
        {selected ? (
          <div className="space-y-5">
            <dl className="grid gap-px overflow-hidden rounded-md bg-slate-200 sm:grid-cols-2 dark:bg-white/10">
              {[
                [t("lr.khasra"), selected.khasra],
                [L("Khata No.", "खाता संख्या"), selected.khata],
                [t("lr.owner"), lang === "hi" ? selected.ownerHi : selected.owner],
                [t("lr.village"), `${selected.village}, ${selected.tehsil}`],
                [t("lr.district"), `${selected.district}, ${selected.state}`],
                [L("Mutation date", "नामांतरण तिथि"), selected.mutationDate],
              ].map(([k, v]) => (
                <div key={k} className="bg-white px-4 py-3 dark:bg-gov-950">
                  <dt className="text-[0.7rem] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {k}
                  </dt>
                  <dd className="mt-0.5 text-[0.86rem] font-semibold text-slate-900 dark:text-slate-100">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>

            <div>
              <h4 className="mb-3 text-[0.82rem] font-bold uppercase tracking-wide text-gov-800 dark:text-gov-200">
                {L("Stage-wise progress", "चरण-वार प्रगति")}
              </h4>
              <ol className="relative space-y-4 pl-8">
                <span className="absolute bottom-2 left-[0.68rem] top-2 w-0.5 bg-slate-200 dark:bg-white/15" aria-hidden />
                {STAGES.map((s, i) => {
                  const done = i < stageFor(selected);
                  const rejected = selected.mutationStatus === "Rejected" && i === 3;
                  return (
                    <li key={s.en} className="relative">
                      <span
                        className={cx(
                          "absolute -left-8 top-0.5 grid h-6 w-6 place-items-center rounded-full border-2 border-white text-white shadow dark:border-gov-950",
                          rejected ? "bg-red-600" : done ? "bg-leaf-600" : "bg-slate-300 dark:bg-white/20",
                        )}
                      >
                        {rejected ? (
                          <XCircle size={13} />
                        ) : done ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <Clock size={12} />
                        )}
                      </span>
                      <p className="text-[0.85rem] font-bold text-slate-800 dark:text-slate-100">
                        {lang === "hi" ? s.hi : s.en}
                      </p>
                      <p className="text-[0.72rem] text-slate-500 dark:text-slate-400">
                        {done || rejected
                          ? new Date(selected.mutationDate).toLocaleDateString(
                              lang === "hi" ? "hi-IN" : "en-IN",
                            )
                          : L("Pending", "लंबित")}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="flex flex-wrap gap-2.5 border-t border-slate-200 pt-4 dark:border-white/10">
              <Link to={`/land-records/${selected.id}`}>
                <Button>
                  <FileStack size={16} /> {L("View Record of Rights", "अधिकार अभिलेख देखें")}
                </Button>
              </Link>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                {t("c.close")}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* new application modal */}
      <Modal
        open={newOpen}
        onClose={() => {
          setNewOpen(false);
          setNewRef(null);
        }}
        title={L("New Mutation Application", "नया नामांतरण आवेदन")}
      >
        {newRef ? (
          <div className="py-4 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-leaf-500/15 text-leaf-600">
              <CheckCircle2 size={30} />
            </span>
            <h3 className="mt-4 text-lg font-extrabold text-gov-900 dark:text-white">
              {L("Application submitted", "आवेदन प्रस्तुत")}
            </h3>
            <p className="tabular mt-2 text-sm font-bold text-gov-700 dark:text-gov-300">{newRef}</p>
            <p className="mx-auto mt-2 max-w-sm text-[0.8rem] text-slate-600 dark:text-slate-300">
              {L(
                "The Patwari will conduct field verification within 15 working days. Track progress using the reference number above.",
                "पटवारी 15 कार्य-दिवसों में मौक़ा सत्यापन करेंगे। ऊपर दिए गए संदर्भ संख्या से प्रगति ट्रैक करें।",
              )}
            </p>
            <Button className="mt-5" onClick={() => setNewOpen(false)}>
              {t("c.close")}
            </Button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newForm.khasra.trim() || !newForm.applicant.trim()) {
                toast(L("Khasra number and applicant name are required", "खसरा संख्या एवं आवेदक का नाम आवश्यक है"), "error");
                return;
              }
              const ref = `MUT/${new Date().getFullYear()}/${String(
                Math.floor(Math.random() * 900000) + 100000,
              )}`;
              setNewRef(ref);
              toast(L("Mutation application registered", "नामांतरण आवेदन पंजीकृत"));
            }}
          >
            <div>
              <Label htmlFor="n-app" required>
                {L("Applicant Name", "आवेदक का नाम")}
              </Label>
              <Input
                id="n-app"
                value={newForm.applicant}
                onChange={(e) => setNewForm({ ...newForm, applicant: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="n-ks" required>
                  {t("lr.khasra")}
                </Label>
                <Input
                  id="n-ks"
                  value={newForm.khasra}
                  onChange={(e) => setNewForm({ ...newForm, khasra: e.target.value })}
                  placeholder="142/2"
                />
              </div>
              <div>
                <Label htmlFor="n-vg">{t("lr.village")}</Label>
                <Input
                  id="n-vg"
                  value={newForm.village}
                  onChange={(e) => setNewForm({ ...newForm, village: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="n-reason">{L("Reason for Mutation", "नामांतरण का कारण")}</Label>
              <Select
                id="n-reason"
                value={newForm.reason}
                onChange={(e) => setNewForm({ ...newForm, reason: e.target.value })}
              >
                {[
                  "Sale / Purchase",
                  "Inheritance / Succession",
                  "Gift Deed",
                  "Partition",
                  "Lease (10+ years)",
                  "Court Decree",
                ].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex gap-2.5 pt-2">
              <Button type="submit">
                <Plus size={16} /> {L("Submit Application", "आवेदन जमा करें")}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setNewOpen(false)}>
                {t("c.cancel")}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* sample reference strip */}
      <div className="mx-auto max-w-[1240px] px-4 pb-10 sm:px-6">
        <p className="text-[0.76rem] text-slate-500 dark:text-slate-400">
          {L("Sample application numbers you can search:", "खोजने योग्य नमूना आवेदन संख्याएँ:")}{" "}
          {SAMPLE_APPS.map((s) => (
            <button
              key={s.no}
              type="button"
              onClick={() => setQ(s.no.replace(/^MUT\//, ""))}
              className="tabular ml-1.5 rounded border border-gov-300 px-2 py-0.5 font-bold text-gov-700 transition hover:bg-gov-700 hover:text-white dark:border-gov-600 dark:text-gov-300"
            >
              {s.no}
            </button>
          ))}
        </p>
      </div>
    </>
  );
}
