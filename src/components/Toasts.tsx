import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { cx } from "./ui";

export default function Toasts() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[200] flex w-[min(23rem,calc(100vw-2.5rem))] flex-col gap-2.5"
      role="status"
      aria-live="polite"
    >
      {toasts.map((tst) => {
        const Icon =
          tst.kind === "success" ? CheckCircle2 : tst.kind === "error" ? AlertTriangle : Info;
        const tone =
          tst.kind === "success"
            ? "border-leaf-500/50 bg-leaf-50 text-leaf-700 dark:bg-leaf-700/20 dark:text-leaf-400"
            : tst.kind === "error"
              ? "border-red-500/50 bg-red-50 text-red-700 dark:bg-red-700/20 dark:text-red-400"
              : "border-gov-500/50 bg-gov-50 text-gov-800 dark:bg-gov-800/40 dark:text-gov-200";
        return (
          <div
            key={tst.id}
            className={cx(
              "pointer-events-auto flex animate-rise items-start gap-2.5 rounded-md border px-4 py-3 shadow-lg backdrop-blur",
              tone,
            )}
          >
            <Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
            <p className="flex-1 text-[0.82rem] font-medium leading-snug">{tst.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(tst.id)}
              aria-label="Dismiss notification"
              className="rounded p-0.5 opacity-60 transition hover:opacity-100"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
