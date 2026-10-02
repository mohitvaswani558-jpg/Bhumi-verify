import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import TopHeader from "./TopHeader";
import NavBar from "./NavBar";
import Footer from "./Footer";
import Toasts from "./Toasts";
import { useApp } from "../context/AppContext";
import { skipToMainContent } from "../lib/a11y";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

export default function Layout() {
  const { t } = useApp();
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />

      {/* Screen-reader announcement target for the skip control. */}
      <div id="skip-live-region" aria-live="polite" aria-atomic="true" className="sr-only" />

      <button type="button" onClick={skipToMainContent} className="skip-link">
        {t("a11y.skip")}
      </button>

      <TopHeader />
      <NavBar />
      <main
        id="main-content"
        tabIndex={-1}
        aria-label={t("a11y.skipMain")}
        className="flex-1 outline-none"
      >
        <Outlet />
      </main>
      <Footer />
      <Toasts />
    </div>
  );
}
