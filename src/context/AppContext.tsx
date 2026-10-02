import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { translate, type Lang } from "../lib/i18n";
import type {
  RtiApplication,
  Session,
  SupportTicket,
  VerificationResult,
} from "../lib/types";

export type FontScale = "small" | "normal" | "large";

const SCALE_MAP: Record<FontScale, string> = {
  small: "90%",
  normal: "100%",
  large: "112.5%",
};

export interface Toast {
  id: number;
  kind: "success" | "error" | "info";
  message: string;
}

interface AppState {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string) => string;

  theme: "light" | "dark";
  toggleTheme: () => void;

  highContrast: boolean;
  toggleContrast: () => void;

  fontScale: FontScale;
  setFontScale: (s: FontScale) => void;
  bumpFont: (dir: -1 | 1) => void;

  session: Session | null;
  login: (s: Session) => void;
  logout: () => void;

  verifications: VerificationResult[];
  addVerification: (v: VerificationResult) => void;
  removeVerification: (id: string) => void;
  updateVerification: (
    id: string,
    patch: Partial<VerificationResult> | ((prev: VerificationResult) => VerificationResult),
  ) => void;
  hasVerification: (id: string) => boolean;

  /** The most recently completed verification — lets the full-page report open
      immediately after analysis, before the user has saved anything. */
  lastResult: VerificationResult | null;
  setLastResult: (r: VerificationResult | null) => void;

  rtis: RtiApplication[];
  addRti: (r: RtiApplication) => void;

  tickets: SupportTicket[];
  addTicket: (t: SupportTicket) => void;

  toasts: Toast[];
  toast: (message: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: number) => void;

  visitors: number;
}

const Ctx = createContext<AppState | null>(null);

const LS_KEY = "bhumiverify.state.v1";

interface Persisted {
  lang: Lang;
  theme: "light" | "dark";
  highContrast: boolean;
  fontScale: FontScale;
  session: Session | null;
  verifications: VerificationResult[];
  lastResult: VerificationResult | null;
  rtis: RtiApplication[];
  tickets: SupportTicket[];
  visitors: number;
}

function loadPersisted(): Partial<Persisted> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    if (Array.isArray(parsed.verifications)) {
      parsed.verifications = parsed.verifications.map(normalizeVerification);
    }
    return parsed;
  } catch {
    return {};
  }
}

/** Back-fills fields added after v1 so older saved reports still render. */
function normalizeVerification(v: VerificationResult): VerificationResult {
  const holder = v.fields?.find((f) => f.label === "Record Holder / Owner")?.value;
  const ownerName = v.ownerName ?? holder ?? "—";
  return {
    ...v,
    ownerName,
    ownerNameHi: v.ownerNameHi ?? ownerName,
    source: v.source ?? "upload",
    keyFindings: Array.isArray(v.keyFindings) ? v.keyFindings : [],
    aiOpinion: v.aiOpinion ?? {
      recommendation:
        v.verdict === "verified" ? "approve" : v.verdict === "flagged" ? "reject" : "manual_review",
      band: "—",
      summary: "",
      summaryHi: "",
      reasoning: [],
      reasoningHi: [],
    },
    auditTrail: Array.isArray(v.auditTrail) ? v.auditTrail : [],
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const saved = useMemo(loadPersisted, []);

  const [lang, setLang] = useState<Lang>(saved.lang ?? "en");
  const [theme, setTheme] = useState<"light" | "dark">(saved.theme ?? "light");
  const [highContrast, setHighContrast] = useState<boolean>(saved.highContrast ?? false);
  const [fontScale, setFontScale] = useState<FontScale>(saved.fontScale ?? "normal");
  const [session, setSession] = useState<Session | null>(saved.session ?? null);
  const [verifications, setVerifications] = useState<VerificationResult[]>(
    saved.verifications ?? [],
  );
  const [lastResult, setLastResult] = useState<VerificationResult | null>(
    saved.lastResult ? normalizeVerification(saved.lastResult) : null,
  );
  const [rtis, setRtis] = useState<RtiApplication[]>(saved.rtis ?? []);
  const [tickets, setTickets] = useState<SupportTicket[]>(saved.tickets ?? []);
  const [visitors, setVisitors] = useState<number>(saved.visitors ?? 0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  /* ---------- persistence ---------- */
  useEffect(() => {
    const payload: Persisted = {
      lang,
      theme,
      highContrast,
      fontScale,
      session,
      verifications: verifications.slice(0, 40),
      lastResult,
      rtis,
      tickets,
      visitors,
    };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
    } catch {
      /* quota — ignore */
    }
  }, [
    lang,
    theme,
    highContrast,
    fontScale,
    session,
    verifications,
    lastResult,
    rtis,
    tickets,
    visitors,
  ]);

  /* ---------- apply to <html> ---------- */
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = SCALE_MAP[fontScale];
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("hc", highContrast);
    root.lang = lang === "hi" ? "hi" : "en";
  }, [fontScale, theme, highContrast, lang]);

  /* ---------- visitor counter (once per session) ---------- */
  useEffect(() => {
    const key = "bhumiverify.visited";
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      setVisitors((v) => (v || 18472913) + 1);
    } else if (!visitors) {
      setVisitors(18472914);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = useCallback((key: string) => translate(key, lang), [lang]);

  const toast = useCallback((message: string, kind: Toast["kind"] = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const bumpFont = useCallback(
    (dir: -1 | 1) => {
      setFontScale((cur) => {
        const order: FontScale[] = ["small", "normal", "large"];
        const i = order.indexOf(cur);
        const next = Math.min(order.length - 1, Math.max(0, i + dir));
        return order[next];
      });
    },
    [],
  );

  const value: AppState = {
    lang,
    setLang,
    toggleLang: () => setLang(lang === "en" ? "hi" : "en"),
    t,
    theme,
    toggleTheme: () => setTheme(theme === "light" ? "dark" : "light"),
    highContrast,
    toggleContrast: () => setHighContrast(!highContrast),
    fontScale,
    setFontScale,
    bumpFont,
    session,
    login: (s) => setSession(s),
    logout: () => setSession(null),
    verifications,
    addVerification: (v) => setVerifications((prev) => [v, ...prev].slice(0, 40)),
    removeVerification: (id) =>
      setVerifications((prev) => prev.filter((v) => v.id !== id)),
    updateVerification: (id, patch) =>
      setVerifications((prev) =>
        prev.map((v) =>
          v.id !== id ? v : typeof patch === "function" ? patch(v) : { ...v, ...patch },
        ),
      ),
    hasVerification: (id) => verifications.some((v) => v.id === id),
    lastResult,
    setLastResult,
    rtis,
    addRti: (r) => setRtis((prev) => [r, ...prev]),
    tickets,
    addTicket: (tk) => setTickets((prev) => [tk, ...prev]),
    toasts,
    toast,
    dismissToast,
    visitors,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
