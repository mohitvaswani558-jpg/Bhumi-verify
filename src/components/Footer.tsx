import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  ChevronRight,
  Clock,
  Eye,
  ExternalLink,
} from "lucide-react";
import { BhoomiLogo, NicMark } from "./Emblems";
import { useApp } from "../context/AppContext";
import { IMPORTANT_LINKS } from "../lib/data";

const SERVICES = [
  { label: "Verify Document", to: "/verify" },
  { label: "Land Records Search", to: "/land-records" },
  { label: "Analytics Dashboard", to: "/dashboard" },
  { label: "RTI Online", to: "/rti" },
  { label: "Help & Support", to: "/help" },
  { label: "Announcements", to: "/announcements" },
];

const QUICK = [
  { label: "Home", to: "/" },
  { label: "Login", to: "/login" },
  { label: "Contact Us", to: "/contact" },
  { label: "Sitemap", to: "/sitemap" },
  { label: "Terms & Conditions", to: "/policies/terms" },
  { label: "Privacy Policy", to: "/policies/privacy" },
  { label: "Accessibility Statement", to: "/policies/accessibility" },
];

export default function Footer() {
  const { t, lang, visitors } = useApp();
  const updated = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <footer className="mt-auto bg-gov-950 text-gov-100">
      <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <BhoomiLogo className="h-11 w-11" />
              <div className="leading-tight">
                <p className="text-sm font-extrabold text-white">भूमि सत्यापन एआई</p>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-gov-300">
                  Bhoomi Verify AI
                </p>
              </div>
            </div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-saffron-400">
              {t("foot.about")}
            </h3>
            <p className="text-[0.8rem] leading-relaxed text-gov-200/85">{t("foot.aboutText")}</p>
            <div className="mt-4 flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2">
              <Clock size={14} className="text-leaf-400" aria-hidden />
              <span className="text-[0.72rem] text-gov-200">
                {t("foot.updated")}: <strong className="text-white">{updated}</strong>
              </span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 border-b border-white/15 pb-2 text-sm font-bold text-white">
              {t("foot.services")}
            </h3>
            <ul className="space-y-2.5">
              {SERVICES.map((s) => (
                <li key={s.to}>
                  <Link
                    to={s.to}
                    className="group flex items-center gap-1.5 text-[0.82rem] text-gov-200/85 transition hover:text-white"
                  >
                    <ChevronRight
                      size={13}
                      className="text-gov-400 transition-transform group-hover:translate-x-0.5 group-hover:text-saffron-400"
                      aria-hidden
                    />
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links + important links */}
          <div>
            <h3 className="mb-4 border-b border-white/15 pb-2 text-sm font-bold text-white">
              {t("foot.quick")}
            </h3>
            <ul className="space-y-2.5">
              {QUICK.map((s) => (
                <li key={s.label}>
                  <Link
                    to={s.to}
                    className="group flex items-center gap-1.5 text-[0.82rem] text-gov-200/85 transition hover:text-white"
                  >
                    <ChevronRight
                      size={13}
                      className="text-gov-400 transition-transform group-hover:translate-x-0.5 group-hover:text-saffron-400"
                      aria-hidden
                    />
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 mb-3 border-b border-white/15 pb-2 text-xs font-bold uppercase tracking-wider text-saffron-400">
              {t("side.links")}
            </h3>
            <ul className="space-y-2">
              {IMPORTANT_LINKS.slice(0, 4).map((l) => (
                <li key={l.short}>
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(l.label + " Government of India")}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-start gap-1.5 text-[0.78rem] text-gov-200/85 transition hover:text-white"
                  >
                    <ExternalLink
                      size={12}
                      className="mt-0.5 shrink-0 text-gov-400 group-hover:text-leaf-400"
                      aria-hidden
                    />
                    <span>{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 border-b border-white/15 pb-2 text-sm font-bold text-white">
              {t("foot.contact")}
            </h3>
            <ul className="space-y-3.5 text-[0.82rem] text-gov-200/85">
              <li className="flex gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-saffron-400" aria-hidden />
                <span>{t("foot.address")}</span>
              </li>
              <li className="flex gap-2.5">
                <Phone size={15} className="mt-0.5 shrink-0 text-leaf-400" aria-hidden />
                <span>
                  <a href="tel:1800111551" className="font-semibold text-white hover:underline">
                    1800-11-1551
                  </a>
                  <span className="block text-[0.72rem] text-gov-300">Toll Free · 24 × 7</span>
                </span>
              </li>
              <li className="flex gap-2.5">
                <Mail size={15} className="mt-0.5 shrink-0 text-gov-300" aria-hidden />
                <a
                  href="mailto:bhumiverify-dlr@gov.in"
                  className="break-all hover:text-white hover:underline"
                >
                  bhumiverify-dlr@gov.in
                </a>
              </li>
            </ul>
            <div className="mt-5 rounded border border-white/10 bg-white/5 p-3">
              <NicMark className="h-8 w-auto text-gov-200" />
              <p className="mt-2 text-[0.68rem] leading-snug text-gov-300">{t("foot.hosted")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* policy strip */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-3 text-[0.74rem] sm:px-6">
          {[
            { label: t("foot.terms"), to: "/policies/terms" },
            { label: t("foot.privacy"), to: "/policies/privacy" },
            { label: t("foot.copyright"), to: "/policies/copyright" },
            { label: t("foot.hyperlink"), to: "/policies/hyperlinking" },
            { label: t("foot.access"), to: "/policies/accessibility" },
            { label: t("foot.sitemap"), to: "/sitemap" },
          ].map((p) => (
            <Link key={p.to} to={p.to} className="text-gov-200/85 transition hover:text-white hover:underline">
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-white/10 bg-gov-950">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-3 px-4 py-4 text-center sm:px-6 md:flex-row md:justify-between md:text-left">
          <p className="text-[0.74rem] text-gov-300">{t("foot.owned")}</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[0.74rem]">
            <span className="flex items-center gap-1.5 text-gov-300">
              <Eye size={14} className="text-leaf-400" aria-hidden />
              {t("foot.visitors")}:{" "}
              <strong className="tabular text-white">{visitors.toLocaleString("en-IN")}</strong>
            </span>
            <span className="text-gov-400">|</span>
            <span className="text-gov-300">
              © {new Date().getFullYear()} GoI. {t("foot.rights")}.
            </span>
          </div>
        </div>
        <p className="border-t border-white/5 px-4 pb-4 pt-3 text-center text-[0.68rem] text-gov-400">
          {t("foot.bestViewed")}
        </p>
      </div>
    </footer>
  );
}
