/**
 * Real, in-browser OCR powered by tesseract.js.
 *
 * The engine, WASM core and language data are pulled from the CDN on first
 * use, so every call is wrapped in a timeout and a try/catch: if OCR is
 * unavailable the verification pipeline degrades gracefully to the name the
 * user declared on the form — it never invents one.
 */

export interface ParsedFields {
  owner?: string;
  khasra?: string;
  areaHa?: string;
  village?: string;
  tehsil?: string;
  district?: string;
  state?: string;
  regNo?: string;
  issueDate?: string;
  authority?: string;
  khata?: string;
}

export interface OcrOutput {
  ok: boolean;
  text: string;
  confidence: number;
  chars: number;
  lines: number;
  engine: string;
  ms: number;
  parsed: ParsedFields;
  error?: string;
}

const STOP = new Set(
  [
    "record", "holder", "owner", "father", "husband", "village", "tehsil", "taluka", "district",
    "state", "total", "extent", "land", "classification", "khasra", "survey", "khata", "no",
    "number", "form", "government", "revenue", "department", "office", "registered", "sale",
    "deed", "rights", "encumbrance", "certificate", "mutation", "order", "power", "attorney",
    "partition", "digitally", "signed", "signing", "date", "computer", "code", "page",
    "irrigation", "source", "annual", "paid", "nil", "consideration", "stamp", "paper",
    "vendor", "executant", "hearing", "objections", "passed", "by", "applicant", "succession",
    "legal", "heir", "period", "covered", "declared", "status", "issuing", "officer", "scope",
    "authority", "co", "sharers", "share", "sub", "division", "approved", "yes", "ocr",
    "target", "field", "this", "is", "generated", "extract", "issued", "under", "modernisation",
    "programme", "seal", "goi", "bhumiverify", "ai", "section", "rules", "act", "registration",
    "the", "of", "and", "for", "with", "general", "roar", "tehsildar", "registrar", "ministry", "purchaser", "principal", "mukhtar", "lessee", "lessor", "buyer", "seller",
    "department", "uttar", "pradesh", "maharashtra", "karnataka", "rajasthan", "bihar",
    "verification", "verified", "engine", "v3", "block", "sha",
  ].map((w) => w.toLowerCase()),
);

function pickName(raw: string): string | undefined {
  const clean = raw
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = clean.split(/[^A-Za-z]+/).filter((w) => w.length > 1 && w.length < 16);
  const out: string[] = [];
  for (const w of words) {
    const first = w[0];
    const isCap = first === first.toUpperCase() && first !== first.toLowerCase();
    const isShout = w.length > 2 && w === w.toUpperCase();
    // Leading noise (headings, labels) is skipped; once a name has started,
    // anything that is not another capitalised word ends it.
    if (!isCap || isShout || STOP.has(w.toLowerCase())) {
      if (out.length) break;
      continue;
    }
    out.push(w);
    if (out.length >= 4) break;
  }
  return out.length >= 2 ? out.join(" ") : undefined;
}

function afterLabel(lines: string[], re: RegExp): string | undefined {
  for (const line of lines) {
    if (!re.test(line)) continue;
    const rest = line.replace(re, " ");
    const cleaned = rest.replace(/^[^A-Za-z0-9]*/, "").trim();
    if (cleaned.length > 1) return cleaned;
  }
  return undefined;
}

export function parseOcrText(text: string): ParsedFields {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const out: ParsedFields = {};

  const holderLine = lines.find((l) => /record\s*holder|owner|executant|purchaser|applicant/i.test(l));
  out.owner =
    (holderLine ? pickName(holderLine.replace(/^(record\s*holder|owner|executant|purchaser|applicant)[^A-Za-z]*/i, "")) : undefined) ??
    pickName(holderLine ?? "") ??
    lines.map(pickName).find(Boolean);

  const khasraLine = afterLabel(lines, /khasra|survey\s*no/i) ?? text.match(/\b\d{1,4}\s*\/\s*\d{1,3}\b/)?.[0];
  if (khasraLine) {
    const m = khasraLine.match(/(\d{1,4}\s*\/\s*\d{1,3})/);
    if (m) out.khasra = m[1].replace(/\s+/g, "");
  }

  const khataLine = afterLabel(lines, /khata\s*(no|number)?/i);
  if (khataLine) {
    const m = khataLine.match(/\b(\d{1,5})\b/);
    if (m) out.khata = m[1];
  }

  const areaLine = afterLabel(lines, /total\s*extent|extent|area/i) ?? text;
  const am = areaLine.match(/(\d+\.\d{1,3})\s*ha/i);
  if (am) out.areaHa = am[1];

  out.village = afterLabel(lines, /village|मौजा/i)?.split(/[,(]/)[0]?.trim();
  out.tehsil = afterLabel(lines, /tehsil|taluka/i)?.split(/[,(]/)[0]?.trim();
  out.district = afterLabel(lines, /district|ज़िला/i)?.split(/[,(]/)[0]?.trim();
  out.state = afterLabel(lines, /\bstate\b|राज्य/i)?.split(/[,(]/)[0]?.trim();
  out.authority = afterLabel(lines, /office of the|issuing authority/i);

  const reg = text.match(/\b(?:ROR|REG|MUT|EC|POA|PRT)\/[A-Z]{2}\/[A-Z]{3}\/\d{4}\/\d{4,8}\b/);
  if (reg) out.regNo = reg[0];

  const dt = text.match(/\b\d{2}\s+[A-Za-z]{3}\s+\d{4}\b/);
  if (dt) out.issueDate = dt[0];

  // Trim noisy values
  (Object.keys(out) as (keyof ParsedFields)[]).forEach((k) => {
    const v = out[k];
    if (typeof v === "string" && (v.length < 2 || v.length > 90)) delete out[k];
  });

  return out;
}

type ProgressFn = (p: { status: string; progress: number }) => void;

/**
 * Runs tesseract.js over an image file. Returns `ok:false` (never throws) when
 * the engine or its language data cannot be loaded.
 */
export async function runOcr(
  file: File,
  onProgress?: ProgressFn,
  timeoutMs = 75000,
): Promise<OcrOutput> {
  const started = Date.now();
  const base = {
    ok: false,
    text: "",
    confidence: 0,
    chars: 0,
    lines: 0,
    engine: "Tesseract.js 7 (eng)",
    ms: 0,
    parsed: {} as ParsedFields,
  };

  if (!file.type.startsWith("image/")) {
    return {
      ...base,
      ms: Date.now() - started,
      error:
        "In-browser OCR rasterises images only. PDF uploads are analysed by the forensic stages; declare the record-holder name on the form so it is used verbatim.",
    };
  }

  try {
    const mod = await import("tesseract.js");
    const createWorker = (mod as unknown as { createWorker: (...a: unknown[]) => Promise<Worker> })
      .createWorker as unknown as (
      langs: string,
      oem?: number,
      opts?: { logger?: (m: { status: string; progress: number }) => void },
    ) => Promise<Worker>;

    type Worker = {
      recognize: (img: File | string) => Promise<{ data: { text: string; confidence: number } }>;
      terminate: () => Promise<void>;
    };

    const work = async (): Promise<OcrOutput> => {
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (onProgress && typeof m?.progress === "number") onProgress(m);
        },
      });
      try {
        const { data } = await worker.recognize(file);
        const text = data.text ?? "";
        const parsed = parseOcrText(text);
        return {
          ok: true,
          text,
          confidence: Math.round((data.confidence ?? 0) * 10) / 10,
          chars: text.replace(/\s/g, "").length,
          lines: text.split(/\r?\n/).filter((l) => l.trim()).length,
          engine: "Tesseract.js 7 (eng)",
          ms: Date.now() - started,
          parsed,
        };
      } finally {
        await worker.terminate().catch(() => undefined);
      }
    };

    return await Promise.race([
      work(),
      new Promise<OcrOutput>((resolve) =>
        setTimeout(
          () =>
            resolve({
              ...base,
              ms: Date.now() - started,
              error: "OCR timed out — the declared record-holder name was used instead.",
            }),
          timeoutMs,
        ),
      ),
    ]);
  } catch (err) {
    return {
      ...base,
      ms: Date.now() - started,
      error: `OCR engine unavailable (${(err as Error)?.message ?? "network"}). The declared record-holder name was used instead.`,
    };
  }
}
