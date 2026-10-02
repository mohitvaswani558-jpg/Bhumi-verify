import {
  useEffect,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { X } from "lucide-react";

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/*  Button                                                             */
/* ------------------------------------------------------------------ */

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gov-700 text-white hover:bg-gov-600 active:bg-gov-800 shadow-sm border border-gov-800/40",
  secondary:
    "bg-white text-gov-800 border border-gov-300 hover:bg-gov-50 hover:border-gov-400 dark:bg-gov-900 dark:text-gov-100 dark:border-gov-700 dark:hover:bg-gov-800",
  outline:
    "bg-transparent text-gov-700 border border-gov-400 hover:bg-gov-700 hover:text-white dark:text-gov-200 dark:border-gov-600 dark:hover:bg-gov-600 dark:hover:text-white",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10",
  danger: "bg-red-700 text-white hover:bg-red-600 border border-red-800/40",
  success: "bg-leaf-600 text-white hover:bg-leaf-500 border border-leaf-700/40",
};

const SIZES: Record<Size, string> = {
  sm: "text-[0.78rem] px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
  lg: "text-base px-6 py-3 gap-2.5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center rounded-md font-semibold transition-all duration-150",
        "focus-visible:outline-3 focus-visible:outline-saffron-400 disabled:cursor-not-allowed disabled:opacity-55",
        "active:translate-y-px",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */

export function Card({
  className,
  children,
  id,
  as: As = "div",
}: {
  className?: string;
  children: ReactNode;
  id?: string;
  as?: "div" | "section" | "article" | "aside";
}) {
  return (
    <As
      id={id}
      className={cx(
        "rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]",
        "dark:border-white/10 dark:bg-gov-950/70",
        className,
      )}
    >
      {children}
    </As>
  );
}

export function CardHeader({
  title,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5 dark:border-white/10",
        className,
      )}
    >
      <h2 className="flex items-center gap-2.5 text-[0.95rem] font-bold text-gov-900 dark:text-white">
        {icon ? (
          <span className="grid h-7 w-7 place-items-center rounded bg-gov-50 text-gov-700 dark:bg-gov-800 dark:text-gov-200">
            {icon}
          </span>
        ) : null}
        {title}
      </h2>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Badge                                                              */
/* ------------------------------------------------------------------ */

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "blue";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-white/10 dark:text-slate-200 dark:border-white/15",
    green: "bg-leaf-500/12 text-leaf-700 border-leaf-500/35 dark:text-leaf-400",
    amber: "bg-saffron-500/12 text-saffron-600 border-saffron-500/35 dark:text-saffron-400",
    red: "bg-red-500/12 text-red-700 border-red-500/35 dark:text-red-400",
    blue: "bg-gov-500/12 text-gov-700 border-gov-500/35 dark:text-gov-300",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Form controls                                                      */
/* ------------------------------------------------------------------ */

const FIELD_BASE =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 " +
  "transition focus:border-gov-500 focus:ring-2 focus:ring-gov-500/25 focus:outline-none " +
  "dark:border-white/15 dark:bg-gov-950 dark:text-slate-100 dark:placeholder:text-slate-500";

export function Label({
  children,
  htmlFor,
  required,
}: {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[0.8rem] font-semibold text-slate-700 dark:text-slate-300"
    >
      {children}
      {required ? <span className="ml-0.5 text-red-600">*</span> : null}
    </label>
  );
}

export function Input({
  className,
  invalid,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cx(FIELD_BASE, invalid && "border-red-500 ring-2 ring-red-500/20", className)}
      {...rest}
    />
  );
}

export function Textarea({
  className,
  invalid,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cx(FIELD_BASE, "min-h-28 resize-y", invalid && "border-red-500", className)}
      {...rest}
    />
  );
}

export function Select({
  className,
  invalid,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      className={cx(FIELD_BASE, "cursor-pointer pr-8", invalid && "border-red-500", className)}
      {...rest}
    >
      {children}
    </select>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{children}</p>;
}

/* ------------------------------------------------------------------ */
/*  Modal                                                              */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={cx(
          "my-8 w-full animate-rise rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-gov-950",
          wide ? "max-w-4xl" : "max-w-xl",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-gov-50/60 px-5 py-3.5 dark:border-white/10 dark:bg-white/5">
          <h3 className="text-base font-bold text-gov-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Accordion                                                          */
/* ------------------------------------------------------------------ */

export function Accordion({
  items,
}: {
  items: { id: string; title: ReactNode; body: ReactNode }[];
}) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-gov-950/70">
      {items.map((it) => {
        const isOpen = open === it.id;
        return (
          <div key={it.id}>
            <button
              onClick={() => setOpen(isOpen ? null : it.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-gov-50/70 dark:hover:bg-white/5"
            >
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {it.title}
              </span>
              <span
                className={cx(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gov-300 text-gov-700 transition-transform duration-200 dark:border-gov-600 dark:text-gov-300",
                  isOpen && "rotate-45 bg-gov-700 text-white dark:bg-gov-600",
                )}
                aria-hidden
              >
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            <div
              className={cx(
                "grid transition-all duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {it.body}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page header (inner pages)                                          */
/* ------------------------------------------------------------------ */

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; to?: string }[];
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-gov-800/40 bg-gradient-to-r from-gov-900 via-gov-800 to-gov-700 text-white">
      <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6">
        {breadcrumb ? (
          <nav aria-label="Breadcrumb" className="mb-2.5 flex flex-wrap items-center gap-1.5 text-xs text-gov-200">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {b.to ? (
                  <a href={b.to} className="transition hover:text-white hover:underline">
                    {b.label}
                  </a>
                ) : (
                  <span className="text-white">{b.label}</span>
                )}
                {i < breadcrumb.length - 1 ? <span aria-hidden>/</span> : null}
              </span>
            ))}
          </nav>
        ) : null}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {icon ? (
              <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white/12 ring-1 ring-white/20">
                {icon}
              </span>
            ) : null}
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">{title}</h1>
              {subtitle ? (
                <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-gov-100/90">{subtitle}</p>
              ) : null}
            </div>
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Misc                                                               */
/* ------------------------------------------------------------------ */

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-gov-900 dark:text-white sm:text-2xl">
          {title}
        </h2>
        <div className="mt-1.5 h-1 w-16 rounded-full bg-gradient-to-r from-saffron-500 to-leaf-500" />
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={cx("animate-spin", className)} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function useAutoId(prefix: string) {
  const id = useId();
  return `${prefix}${id.replace(/:/g, "")}`;
}
