import { useId, useState } from "react";
import { cx } from "./ui";

/* ------------------------------------------------------------------ */
/*  Stacked area / line chart                                          */
/* ------------------------------------------------------------------ */

export interface Series {
  key: string;
  label: string;
  color: string;
}

export function AreaChart({
  data,
  xKey,
  series,
  height = 240,
  formatValue = (n: number) => n.toLocaleString("en-IN"),
}: {
  data: Record<string, number | string>[];
  xKey: string;
  series: Series[];
  height?: number;
  formatValue?: (n: number) => string;
}) {
  const gid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = height;
  const padL = 56;
  const padR = 16;
  const padT = 16;
  const padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const totals = data.map((d) => series.reduce((s, sr) => s + Number(d[sr.key]), 0));
  const max = Math.max(...totals) * 1.12 || 1;
  const x = (i: number) => padL + (innerW * i) / Math.max(1, data.length - 1);
  const y = (v: number) => padT + innerH - (innerH * v) / max;

  // stacked paths
  const stacked: { key: string; color: string; d: string }[] = [];
  let cumulative = new Array(data.length).fill(0);
  for (const sr of series) {
    const vals = data.map((d) => Number(d[sr.key]));
    const top = vals.map((v, i) => cumulative[i] + v);
    const line = top.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    const base = [...cumulative].reverse().map((v, idx) => {
      const i = data.length - 1 - idx;
      return `L${x(i).toFixed(1)},${y(v).toFixed(1)}`;
    });
    stacked.push({ key: sr.key, color: sr.color, d: `${line} ${base.join(" ")} Z` });
    cumulative = top;
  }

  const ticks = 4;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label="Monthly verification trend"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          {series.map((sr, i) => (
            <linearGradient key={sr.key} id={`${gid}-g${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={sr.color} stopOpacity="0.55" />
              <stop offset="100%" stopColor={sr.color} stopOpacity="0.06" />
            </linearGradient>
          ))}
        </defs>

        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const v = (max / ticks) * i;
          return (
            <g key={i}>
              <line
                x1={padL}
                x2={W - padR}
                y1={y(v)}
                y2={y(v)}
                stroke="currentColor"
                className="text-slate-200 dark:text-white/10"
                strokeWidth="1"
              />
              <text
                x={padL - 8}
                y={y(v) + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px] dark:fill-slate-500"
              >
                {v >= 1000 ? `${Math.round(v / 1000)}k` : Math.round(v)}
              </text>
            </g>
          );
        })}

        {stacked.map((s, i) => (
          <path key={s.key} d={s.d} fill={`url(#${gid}-g${i})`} stroke={s.color} strokeWidth="1.6" />
        ))}

        {data.map((d, i) => (
          <g key={String(d[xKey])}>
            <text
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-slate-400 text-[9.5px] dark:fill-slate-500"
            >
              {String(d[xKey])}
            </text>
            <rect
              x={x(i) - innerW / (data.length * 2)}
              y={padT}
              width={innerW / data.length}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
            {hover === i ? (
              <line
                x1={x(i)}
                x2={x(i)}
                y1={padT}
                y2={padT + innerH}
                stroke="#1f56b0"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
            ) : null}
          </g>
        ))}
      </svg>

      {hover !== null ? (
        <div
          className="pointer-events-none absolute top-2 z-10 w-44 rounded-md border border-slate-200 bg-white/95 p-2.5 text-[0.7rem] shadow-lg backdrop-blur dark:border-white/15 dark:bg-gov-950/95"
          style={{
            left: `calc(${((padL + (innerW * hover) / Math.max(1, data.length - 1)) / W) * 100}% - 5.5rem)`,
          }}
        >
          <p className="mb-1.5 font-bold text-slate-800 dark:text-slate-100">
            {String(data[hover][xKey])}
          </p>
          {series.map((sr) => (
            <p key={sr.key} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="h-2 w-2 rounded-full" style={{ background: sr.color }} />
                {sr.label}
              </span>
              <span className="tabular font-bold text-slate-800 dark:text-slate-100">
                {formatValue(Number(data[hover][sr.key]))}
              </span>
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Donut                                                              */
/* ------------------------------------------------------------------ */

export function Donut({
  data,
  size = 190,
  centerLabel,
  centerValue,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="13" className="text-slate-100 dark:text-white/10" />
          {data.map((d, i) => {
            const len = (d.value / total) * c;
            const el = (
              <circle
                key={d.label}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={active === i ? 16 : 13}
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                className="transition-all duration-200"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="tabular text-xl font-extrabold text-gov-900 dark:text-white">
              {active !== null ? `${Math.round((data[active].value / total) * 100)}%` : centerValue}
            </p>
            <p className="mt-0.5 max-w-[6.5rem] text-[0.62rem] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {active !== null ? data[active].label : centerLabel}
            </p>
          </div>
        </div>
      </div>

      <ul className="min-w-[10rem] space-y-2">
        {data.map((d, i) => (
          <li
            key={d.label}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className={cx(
              "flex cursor-default items-center gap-2 rounded px-2 py-1 text-[0.78rem] transition",
              active === i && "bg-slate-100 dark:bg-white/10",
            )}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
            <span className="flex-1 text-slate-600 dark:text-slate-300">{d.label}</span>
            <span className="tabular font-bold text-slate-800 dark:text-slate-100">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Horizontal bar list                                                */
/* ------------------------------------------------------------------ */

export function BarList({
  data,
  formatValue = (n: number) => n.toLocaleString("en-IN"),
}: {
  data: { name: string; value: number }[];
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <ul className="space-y-2.5">
      {data.map((d, i) => (
        <li key={d.name} className="group">
          <div className="mb-1 flex items-baseline justify-between gap-3 text-[0.78rem]">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              <span className="tabular mr-1.5 text-slate-400">{String(i + 1).padStart(2, "0")}</span>
              {d.name}
            </span>
            <span className="tabular font-bold text-gov-700 dark:text-gov-300">
              {formatValue(d.value)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gov-600 to-gov-400 transition-all duration-700 group-hover:from-leaf-600 group-hover:to-leaf-400"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
