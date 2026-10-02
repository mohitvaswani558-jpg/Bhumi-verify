import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Home,
  FileSearch,
  Map,
  LayoutDashboard,
  FileText,
  LifeBuoy,
  Phone,
  LogIn,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { cx } from "./ui";

const ITEMS = [
  { to: "/", key: "nav.home", icon: Home },
  { to: "/verify", key: "nav.verify", icon: FileSearch },
  { to: "/land-records", key: "nav.land", icon: Map },
  { to: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { to: "/rti", key: "nav.rti", icon: FileText },
  { to: "/help", key: "nav.help", icon: LifeBuoy },
  { to: "/contact", key: "nav.contact", icon: Phone },
];

export default function NavBar() {
  const { t, session, logout, toast } = useApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav
      aria-label="Primary navigation"
      className="sticky top-0 z-50 border-b border-gov-950/60 bg-gov-800 shadow-md dark:bg-gov-950"
    >
      <div className="mx-auto flex max-w-[1240px] items-center gap-2 px-2 sm:px-4">
        {/* mobile toggle */}
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded text-white transition hover:bg-white/10 lg:hidden"
          aria-expanded={open}
          aria-controls="primary-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <ul
          id="primary-menu"
          className={cx(
            "flex-1 flex-col gap-0.5 py-1 lg:flex lg:flex-row lg:items-center lg:py-0",
            open ? "flex" : "hidden",
          )}
        >
          {ITEMS.map(({ to, key, icon: Icon }) => (
            <li key={to} className="w-full lg:w-auto">
              <NavLink
                to={to}
                end={to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cx(
                    "flex items-center gap-2 rounded-t px-3.5 py-3 text-[0.86rem] font-semibold transition-colors lg:rounded-none lg:px-4 lg:py-3.5",
                    isActive
                      ? "bg-white text-gov-800 shadow-inner lg:bg-gov-600 lg:text-white lg:shadow-[inset_0_-3px_0_#f5a623]"
                      : "text-gov-100 hover:bg-gov-700 hover:text-white dark:text-slate-300 dark:hover:bg-white/10",
                  )
                }
              >
                <Icon size={16} className="shrink-0" aria-hidden />
                <span>{t(key)}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className={cx("ml-auto pb-1.5 lg:pb-0", open ? "" : "hidden lg:block")}>
          {session ? (
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-white sm:flex">
                <User size={14} aria-hidden />
                <span className="max-w-[10rem] truncate">{session.name}</span>
                <span className="rounded bg-saffron-500/90 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wide">
                  {session.role === "officer" ? "Officer" : "Citizen"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  toast(t("lg.signedOut"), "info");
                }}
                className="flex items-center gap-2 rounded-md border border-white/30 px-3 py-2 text-[0.82rem] font-semibold text-white transition hover:bg-white hover:text-gov-800"
              >
                <LogOut size={15} aria-hidden />
                <span className="hidden sm:inline">{t("nav.logout")}</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              state={{ from: location.pathname }}
              className="flex items-center gap-2 rounded-md border border-white/35 bg-white/12 px-4 py-2 text-[0.84rem] font-bold text-white shadow-sm transition hover:border-white hover:bg-white hover:text-gov-800"
            >
              <LogIn size={15} aria-hidden />
              {t("nav.login")}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
