import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Layers,
  Map as MapIcon,
  Maximize2,
  Ruler,
  Search,
  ZoomIn,
  ZoomOut,
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
import {
  LAND_RECORDS,
  STATES,
  districtsOf,
  tehsilsOf,
  villagesOf,
} from "../lib/data";
import { hashString, pseudoRandom } from "../lib/verifyEngine";

interface Parcel {
  id: string;
  khasra: string;
  points: string;
  areaHa: number;
  owner: string;
  landType: string;
  cx: number;
  cy: number;
  recordId?: string;
}

function buildParcels(seedStr: string): Parcel[] {
  const rnd = pseudoRandom(hashString(seedStr) || 7);
  const cols = 6;
  const rows = 4;
  const W = 400;
  const H = 300;
  const cellW = W / cols;
  const cellH = H / rows;
  const out: Parcel[] = [];

  // jittered lattice points
  const pts: { x: number; y: number }[][] = [];
  for (let r = 0; r <= rows; r++) {
    const row: { x: number; y: number }[] = [];
    for (let c = 0; c <= cols; c++) {
      const edge = r === 0 || c === 0 || r === rows || c === cols;
      row.push({
        x: c * cellW + (edge ? 0 : (rnd() - 0.5) * cellW * 0.42),
        y: r * cellH + (edge ? 0 : (rnd() - 0.5) * cellH * 0.42),
      });
    }
    pts.push(row);
  }

  let k = 100 + Math.floor(rnd() * 400);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = pts[r][c];
      const b = pts[r][c + 1];
      const cc = pts[r + 1][c + 1];
      const d = pts[r + 1][c];
      const area = Math.round((0.25 + rnd() * 3.4) * 100) / 100;
      out.push({
        id: `${r}-${c}`,
        khasra: `${k++}/${Math.floor(rnd() * 4) + 1}`,
        points: `${a.x.toFixed(1)},${a.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)} ${cc.x
          .toFixed(1)},${cc.y.toFixed(1)} ${d.x.toFixed(1)},${d.y.toFixed(1)}`,
        areaHa: area,
        owner: "",
        landType: "",
        cx: (a.x + b.x + cc.x + d.x) / 4,
        cy: (a.y + b.y + cc.y + d.y) / 4,
      });
    }
  }
  return out;
}

const SHEETS = ["Sheet 1 (North)", "Sheet 2 (South)", "Sheet 3 (East)", "Sheet 4 (West)"];

export default function CadastralMaps() {
  const { t, lang, toast } = useApp();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const [state, setState] = useState(STATES[0]);
  const [district, setDistrict] = useState(districtsOf(STATES[0])[0]);
  const [tehsil, setTehsil] = useState(tehsilsOf(STATES[0], districtsOf(STATES[0])[0])[0]);
  const [village, setVillage] = useState(villagesOf(STATES[0], districtsOf(STATES[0])[0], tehsilsOf(STATES[0], districtsOf(STATES[0])[0])[0])[0]);
  const [sheet, setSheet] = useState(SHEETS[0]);
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<Parcel | null>(null);
  const [q, setQ] = useState("");
  const [layers, setLayers] = useState({ bounds: true, roads: true, labels: true, water: true });

  const base = useMemo(
    () => buildParcels(`${state}|${district}|${tehsil}|${village}|${sheet}`),
    [state, district, tehsil, village, sheet],
  );

  const records = useMemo(
    () => LAND_RECORDS.filter((r) => r.village === village && r.tehsil === tehsil),
    [village, tehsil],
  );

  const parcels = useMemo(
    () =>
      base.map((p, i) => {
        const rec = records[i % Math.max(1, records.length)];
        return {
          ...p,
          owner: rec ? (lang === "hi" ? rec.ownerHi : rec.owner) : L("Government Land", "सरकारी भूमि"),
          landType: rec ? (lang === "hi" ? rec.landTypeHi : rec.landType) : L("Common / Waste", "सामान्य / बंजर"),
          recordId: rec?.id,
        };
      }),
    [base, records, lang],
  );

  const filtered = q.trim()
    ? parcels.filter((p) => p.khasra.includes(q.trim()))
    : parcels;

  const totalArea = parcels.reduce((s, p) => s + p.areaHa, 0);

  return (
    <>
      <PageHeader
        title={t("svc.s5t")}
        subtitle={L(
          "Browse geo-referenced village cadastral sheets, inspect parcel boundaries and read the Record of Rights linked to each plot.",
          "भू-संदर्भित ग्राम भू-नक़्शा शीट देखें, पार्सल सीमाओं का निरीक्षण करें और प्रत्येक प्लॉट से जुड़ा अधिकार अभिलेख पढ़ें।",
        )}
        icon={<MapIcon size={22} />}
        breadcrumb={[{ label: t("nav.home"), to: "/" }, { label: t("svc.s5t") }]}
        actions={
          <Badge tone="blue">
            <Layers size={12} /> {L("DILRMP Layer", "DILRMP परत")}
          </Badge>
        }
      />

      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
          {/* controls */}
          <div className="space-y-5">
            <Card>
              <CardHeader title={L("Select Locality", "क्षेत्र चुनें")} icon={<Search size={15} />} />
              <div className="space-y-3.5 p-5">
                <div>
                  <Label htmlFor="cm-st">{t("v.state")}</Label>
                  <Select
                    id="cm-st"
                    value={state}
                    onChange={(e) => {
                      const s = e.target.value;
                      setState(s);
                      const d = districtsOf(s)[0];
                      setDistrict(d);
                      const th = tehsilsOf(s, d)[0];
                      setTehsil(th);
                      setVillage(villagesOf(s, d, th)[0]);
                      setSelected(null);
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
                  <Label htmlFor="cm-dt">{t("lr.district")}</Label>
                  <Select
                    id="cm-dt"
                    value={district}
                    onChange={(e) => {
                      const d = e.target.value;
                      setDistrict(d);
                      const th = tehsilsOf(state, d)[0];
                      setTehsil(th);
                      setVillage(villagesOf(state, d, th)[0]);
                      setSelected(null);
                    }}
                  >
                    {districtsOf(state).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cm-th">{t("lr.tehsil")}</Label>
                  <Select
                    id="cm-th"
                    value={tehsil}
                    onChange={(e) => {
                      const th = e.target.value;
                      setTehsil(th);
                      setVillage(villagesOf(state, district, th)[0]);
                      setSelected(null);
                    }}
                  >
                    {tehsilsOf(state, district).map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cm-vg">{t("lr.village")}</Label>
                  <Select
                    id="cm-vg"
                    value={village}
                    onChange={(e) => {
                      setVillage(e.target.value);
                      setSelected(null);
                    }}
                  >
                    {villagesOf(state, district, tehsil).map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cm-sheet">{L("Map Sheet", "नक़्शा शीट")}</Label>
                  <Select id="cm-sheet" value={sheet} onChange={(e) => { setSheet(e.target.value); setSelected(null); }}>
                    {SHEETS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cm-q">{L("Find Khasra", "खसरा खोजें")}</Label>
                  <Input
                    id="cm-q"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={L("e.g. 214", "जैसे 214")}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title={L("Map Layers", "नक़्शा परतें")} icon={<Layers size={15} />} />
              <ul className="space-y-1 p-3">
                {(
                  [
                    ["bounds", L("Parcel boundaries", "पार्सल सीमाएँ")],
                    ["roads", L("Roads & tracks", "सड़कें एवं पगडंडियाँ")],
                    ["water", L("Water bodies", "जल स्रोत")],
                    ["labels", L("Khasra labels", "खसरा लेबल")],
                  ] as const
                ).map(([key, label]) => (
                  <li key={key}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-2 transition hover:bg-gov-50 dark:hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={layers[key]}
                        onChange={(e) => setLayers({ ...layers, [key]: e.target.checked })}
                        className="h-4 w-4 accent-gov-700"
                      />
                      <span className="text-[0.82rem] font-medium text-slate-700 dark:text-slate-200">
                        {label}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <div className="space-y-2.5 p-5 text-[0.8rem]">
                <p className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{L("Parcels on sheet", "शीट पर पार्सल")}</span>
                  <span className="tabular font-bold text-gov-800 dark:text-white">{parcels.length}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{L("Total area", "कुल क्षेत्रफल")}</span>
                  <span className="tabular font-bold text-gov-800 dark:text-white">
                    {totalArea.toFixed(2)} Ha
                  </span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{L("Scale", "मापनी")}</span>
                  <span className="tabular font-bold text-gov-800 dark:text-white">1:4000</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{L("Projection", "प्रक्षेपण")}</span>
                  <span className="tabular font-bold text-gov-800 dark:text-white">WGS84 / UTM 43N</span>
                </p>
              </div>
            </Card>
          </div>

          {/* map + details */}
          <div className="space-y-5">
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-white/10">
                <h2 className="text-[0.9rem] font-bold text-gov-900 dark:text-white">
                  {village}, {tehsil} — {district}
                </h2>
                <Badge tone="neutral">{sheet}</Badge>
                <div className="ml-auto flex items-center gap-1.5">
                  <Button size="sm" variant="secondary" onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))} aria-label={L("Zoom out", "ज़ूम आउट")}>
                    <ZoomOut size={15} />
                  </Button>
                  <span className="tabular w-14 text-center text-[0.75rem] font-bold text-slate-600 dark:text-slate-300">
                    {(zoom * 100).toFixed(0)}%
                  </span>
                  <Button size="sm" variant="secondary" onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))} aria-label={L("Zoom in", "ज़ूम इन")}>
                    <ZoomIn size={15} />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setZoom(1)} aria-label={L("Reset zoom", "ज़ूम रीसेट")}>
                    <Maximize2 size={15} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const text = [
                        `Cadastral parcel list — ${village}, ${tehsil}, ${district}, ${state}`,
                        `${sheet} · Scale 1:4000 · Generated ${new Date().toLocaleString("en-IN")}`,
                        "=".repeat(60),
                        ...parcels.map(
                          (p) =>
                            `Khasra ${p.khasra.padEnd(10)} ${p.areaHa.toFixed(2).padStart(6)} Ha   ${p.owner}`,
                        ),
                        "=".repeat(60),
                        `Total: ${parcels.length} parcels, ${totalArea.toFixed(2)} Ha`,
                      ].join("\n");
                      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `Cadastral-${village}-${sheet.split(" ")[1]}.txt`;
                      a.click();
                      setTimeout(() => URL.revokeObjectURL(url), 1500);
                      toast(L("Parcel list exported", "पार्सल सूची निर्यात हुई"));
                    }}
                  >
                    <Download size={15} /> {L("Export", "निर्यात")}
                  </Button>
                </div>
              </div>

              <div className="relative overflow-hidden bg-slate-900">
                <div
                  className="relative mx-auto transition-transform duration-300"
                  style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                >
                  <img
                    src="/images/land-aerial.jpg"
                    alt={`Aerial cadastral base map of ${village}`}
                    className="h-[22rem] w-full object-cover sm:h-[30rem]"
                  />
                  <svg
                    viewBox="0 0 400 300"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full"
                  >
                    {layers.water ? (
                      <path
                        d="M0 236 C60 224 96 250 150 240 C206 230 240 258 300 246 C344 237 372 250 400 244 L400 300 L0 300 Z"
                        fill="#3b82f6"
                        fillOpacity="0.28"
                        stroke="#60a5fa"
                        strokeWidth="1"
                      />
                    ) : null}

                    {filtered.map((p) => {
                      const isSel = selected?.id === p.id;
                      return (
                        <g key={p.id}>
                          <polygon
                            points={p.points}
                            fill={isSel ? "#f5a623" : "#ffffff"}
                            fillOpacity={isSel ? 0.45 : 0.1}
                            stroke={isSel ? "#f5a623" : "#ffffff"}
                            strokeWidth={isSel ? 2.4 : 1.1}
                            className="cursor-pointer transition-all hover:fill-[#34c46f] hover:fill-opacity-35"
                            onClick={() => setSelected(p)}
                          />
                        </g>
                      );
                    })}

                    {layers.roads ? (
                      <g stroke="#f8fafc" strokeWidth="2.6" fill="none" opacity="0.55">
                        <path d="M0 150 C80 142 140 168 210 156 C280 144 330 168 400 158" />
                        <path d="M196 0 C204 70 188 140 202 210 C210 250 200 276 206 300" />
                      </g>
                    ) : null}

                    {layers.labels
                      ? filtered.map((p) => (
                          <text
                            key={`t-${p.id}`}
                            x={p.cx}
                            y={p.cy}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="700"
                            fill="#ffffff"
                            stroke="#0a1c3a"
                            strokeWidth="2"
                            paintOrder="stroke"
                            className="pointer-events-none select-none"
                          >
                            {p.khasra}
                          </text>
                        ))
                      : null}

                    {/* scale bar */}
                    <g transform="translate(16,272)">
                      <rect x="-6" y="-12" width="96" height="24" rx="3" fill="#0a1c3a" fillOpacity="0.7" />
                      <line x1="0" y1="0" x2="80" y2="0" stroke="#ffffff" strokeWidth="2" />
                      <line x1="0" y1="-4" x2="0" y2="4" stroke="#ffffff" strokeWidth="2" />
                      <line x1="40" y1="-3" x2="40" y2="3" stroke="#ffffff" strokeWidth="1.4" />
                      <line x1="80" y1="-4" x2="80" y2="4" stroke="#ffffff" strokeWidth="2" />
                      <text x="40" y="-6" textAnchor="middle" fontSize="7" fill="#ffffff" fontWeight="700">
                        200 m
                      </text>
                    </g>
                  </svg>
                </div>

                <div className="pointer-events-none absolute right-3 top-3 rounded bg-gov-950/85 px-2.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                  {L("Ortho-rectified", "ऑर्थो-रेक्टिफाइड")} · {new Date().getFullYear()}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 px-5 py-3 text-[0.75rem] text-slate-600 dark:border-white/10 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm border-2 border-white bg-white/20 ring-1 ring-slate-300" />
                  {L("Parcel", "पार्सल")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm border-2 border-saffron-500 bg-saffron-500/40" />
                  {L("Selected", "चयनित")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-5 bg-slate-100 ring-1 ring-slate-300" />
                  {L("Road", "सड़क")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-blue-500/40 ring-1 ring-blue-400" />
                  {L("Water body", "जल स्रोत")}
                </span>
                <span className="ml-auto flex items-center gap-1.5 text-slate-500">
                  <Ruler size={13} /> {L("Click a parcel for details", "विवरण हेतु पार्सल पर क्लिक करें")}
                </span>
              </div>
            </Card>

            {/* parcel table + details */}
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
              <Card>
                <CardHeader
                  title={L("Parcel Register", "पार्सल रजिस्टर")}
                  icon={<MapIcon size={15} />}
                  action={
                    <span className="tabular rounded bg-gov-50 px-2 py-0.5 text-[0.72rem] font-bold text-gov-700 dark:bg-gov-800 dark:text-gov-200">
                      {filtered.length}
                    </span>
                  }
                />
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-[0.8rem]">
                    <thead className="sticky top-0 bg-slate-50 text-[0.66rem] uppercase tracking-wider text-slate-500 dark:bg-gov-900 dark:text-slate-400">
                      <tr className="border-b border-slate-200 dark:border-white/10">
                        <th className="px-4 py-2.5 font-bold">{t("lr.khasra")}</th>
                        <th className="px-4 py-2.5 text-right font-bold">{t("lr.area")}</th>
                        <th className="px-4 py-2.5 font-bold">{t("lr.owner")}</th>
                        <th className="px-4 py-2.5 font-bold">{t("lr.type")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {filtered.map((p) => (
                        <tr
                          key={p.id}
                          onClick={() => setSelected(p)}
                          className={cx(
                            "cursor-pointer transition",
                            selected?.id === p.id
                              ? "bg-saffron-500/12"
                              : "hover:bg-gov-50/70 dark:hover:bg-white/5",
                          )}
                        >
                          <td className="tabular px-4 py-2.5 font-bold text-gov-700 dark:text-gov-300">
                            {p.khasra}
                          </td>
                          <td className="tabular px-4 py-2.5 text-right text-slate-700 dark:text-slate-200">
                            {p.areaHa.toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{p.owner}</td>
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{p.landType}</td>
                        </tr>
                      ))}
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                            {t("c.none")}
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="h-fit">
                <CardHeader title={L("Parcel Details", "पार्सल विवरण")} icon={<Ruler size={15} />} />
                {selected ? (
                  <div className="space-y-3 p-5 text-[0.82rem]">
                    <div className="rounded-md border border-saffron-500/40 bg-saffron-500/8 p-3">
                      <p className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {t("lr.khasra")}
                      </p>
                      <p className="tabular text-xl font-extrabold text-gov-900 dark:text-white">
                        {selected.khasra}
                      </p>
                    </div>
                    {[
                      [L("Area", "क्षेत्रफल"), `${selected.areaHa.toFixed(2)} Ha`],
                      [t("lr.owner"), selected.owner],
                      [t("lr.type"), selected.landType],
                      [t("lr.village"), village],
                      [t("lr.tehsil"), tehsil],
                      [t("lr.district"), `${district}, ${state}`],
                    ].map(([k, v]) => (
                      <p key={k} className="flex justify-between gap-3">
                        <span className="shrink-0 text-slate-500 dark:text-slate-400">{k}</span>
                        <span className="text-right font-semibold text-slate-800 dark:text-slate-100">
                          {v}
                        </span>
                      </p>
                    ))}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selected.recordId ? (
                        <Link to={`/land-records/${selected.recordId}`} className="flex-1">
                          <Button className="w-full">
                            <Search size={15} /> {L("View RoR", "RoR देखें")}
                          </Button>
                        </Link>
                      ) : null}
                      <Link to="/verify" className="flex-1">
                        <Button variant="secondary" className="w-full">
                          {t("nav.verify")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="px-5 py-10 text-center text-[0.82rem] text-slate-500 dark:text-slate-400">
                    {L(
                      "Select a parcel on the map or in the register to view its details.",
                      "विवरण देखने हेतु नक़्शे या रजिस्टर में एक पार्सल चुनें।",
                    )}
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
