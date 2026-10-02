/**
 * Moves focus to the <main id="main-content"> landmark without touching the
 * URL. A plain `href="#main-content"` anchor would be parsed by the router as
 * a route change (and land on the 404 view), so the skip control is a button
 * that performs the focus + scroll itself — the standard GIGW/WCAG 2.4.1
 * "bypass blocks" pattern.
 */
export function skipToMainContent(): void {
  const el = document.getElementById("main-content");
  if (!el) return;
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  el.scrollIntoView({ behavior: "smooth", block: "start" });

  // Let assistive technology know where the reader landed.
  const live = document.getElementById("skip-live-region");
  if (live) {
    const heading = el.querySelector("h1, h2");
    live.textContent = heading
      ? `Main content: ${heading.textContent?.trim() ?? ""}`
      : "Main content";
    window.setTimeout(() => {
      live.textContent = "";
    }, 3000);
  }
}
