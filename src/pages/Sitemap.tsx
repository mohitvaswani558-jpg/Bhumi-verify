import { Link } from "react-router-dom";
import { ChevronRight, Compass } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, CardHeader, PageHeader } from "../components/ui";

const GROUPS: { title: string; titleHi: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Main Sections",
    titleHi: "मुख्य अनुभाग",
    links: [
      { label: "Home", to: "/" },
      { label: "Verify Document", to: "/verify" },
      { label: "Land Records Search", to: "/land-records" },
      { label: "Analytics Dashboard", to: "/dashboard" },
      { label: "Right to Information", to: "/rti" },
      { label: "Help & Support", to: "/help" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
  {
    title: "Citizen Services",
    titleHi: "नागरिक सेवाएँ",
    links: [
      { label: "Mutation Status (Dakhil-Kharij)", to: "/mutation" },
      { label: "Encumbrance Certificate", to: "/encumbrance" },
      { label: "Cadastral Maps", to: "/cadastral-maps" },
      { label: "Announcements & Circulars", to: "/announcements" },
      { label: "Citizen / Officer Login", to: "/login" },
    ],
  },
  {
    title: "Policies & Legal",
    titleHi: "नीतियाँ एवं विधिक",
    links: [
      { label: "Terms & Conditions", to: "/policies/terms" },
      { label: "Privacy Policy", to: "/policies/privacy" },
      { label: "Copyright Policy", to: "/policies/copyright" },
      { label: "Hyperlinking Policy", to: "/policies/hyperlinking" },
      { label: "Accessibility Statement", to: "/policies/accessibility" },
    ],
  },
];

export default function Sitemap() {
  const { t, lang } = useApp();
  return (
    <>
      <PageHeader
        title={t("foot.sitemap")}
        subtitle={
          lang === "hi"
            ? "पोर्टल पर उपलब्ध सभी पृष्ठों एवं सेवाओं का संरचित अवलोकन।"
            : "A structured overview of every page and service available on the portal."
        }
        icon={<Compass size={22} />}
        breadcrumb={[{ label: t("nav.home"), to: "/" }, { label: t("foot.sitemap") }]}
      />
      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {GROUPS.map((g) => (
            <Card key={g.title}>
              <CardHeader title={lang === "hi" ? g.titleHi : g.title} icon={<Compass size={15} />} />
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
                {g.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="group flex items-center gap-2 px-5 py-3 text-[0.84rem] font-medium text-slate-700 transition hover:bg-gov-50 hover:text-gov-700 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <ChevronRight
                        size={14}
                        className="shrink-0 text-gov-400 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
