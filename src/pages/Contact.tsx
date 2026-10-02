import { useState } from "react";
import {
  Building2,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  Button,
  Card,
  CardHeader,
  FieldError,
  Input,
  Label,
  PageHeader,
  Select,
  Textarea,
} from "../components/ui";
import { OFFICES } from "../lib/data";

const SUBJECTS = [
  "General Enquiry",
  "Document Verification Support",
  "Land Records Discrepancy",
  "Mutation / Dakhil-Kharij",
  "RTI / Appeal",
  "Technical / Portal Issue",
  "Feedback & Suggestions",
];

export default function Contact() {
  const { t, lang, toast, addTicket, session } = useApp();
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  const [form, setForm] = useState({
    name: session?.name ?? "",
    email: "",
    phone: "",
    subject: SUBJECTS[0],
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ref, setRef] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (form.name.trim().length < 3) err.name = t("c.required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = L("Enter a valid email address.", "मान्य ईमेल पता दर्ज करें।");
    if (!/^[6-9]\d{9}$/.test(form.phone))
      err.phone = L("Enter a valid 10-digit mobile number.", "मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।");
    if (form.message.trim().length < 15)
      err.message = L("Message must be at least 15 characters.", "संदेश कम से कम 15 अक्षरों का हो।");
    setErrors(err);
    if (Object.keys(err).length) return;

    setBusy(true);
    window.setTimeout(() => {
      const r = `MSG/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 90000) + 10000)}`;
      addTicket({
        id: r,
        ref: r,
        name: form.name,
        subject: form.subject,
        message: form.message,
        createdAt: new Date().toISOString(),
      });
      setRef(r);
      setBusy(false);
      setForm({ name: session?.name ?? "", email: "", phone: "", subject: SUBJECTS[0], message: "" });
      toast(L("Message submitted successfully", "संदेश सफलतापूर्वक जमा हुआ"));
    }, 900);
  };

  return (
    <>
      <PageHeader
        title={t("ct.title")}
        subtitle={t("ct.sub")}
        icon={<Phone size={22} />}
        breadcrumb={[{ label: t("nav.home"), to: "/" }, { label: t("nav.contact") }]}
      />

      <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* form */}
          <Card>
            <CardHeader title={t("ct.form")} icon={<MessageSquare size={15} />} />
            {ref ? (
              <div className="m-5 rounded-lg border border-leaf-500/40 bg-leaf-500/10 p-5">
                <p className="flex items-center gap-2 text-[0.95rem] font-extrabold text-leaf-700 dark:text-leaf-400">
                  <Send size={17} />
                  {t("ct.success")}
                  <span className="tabular">{ref}</span>
                </p>
                <p className="mt-2 text-[0.82rem] text-slate-600 dark:text-slate-300">
                  {L(
                    "An acknowledgement has been sent to your email. Our helpdesk responds within 24 working hours.",
                    "आपके ईमेल पर पावती भेज दी गई है। हमारा हेल्पडेस्क 24 कार्य-घंटों में उत्तर देता है।",
                  )}
                </p>
                <Button variant="secondary" className="mt-4" onClick={() => setRef(null)}>
                  {L("Send another message", "एक और संदेश भेजें")}
                </Button>
              </div>
            ) : (
              <form className="grid gap-4 p-5 sm:grid-cols-2" onSubmit={submit}>
                <div>
                  <Label htmlFor="c-name" required>
                    {t("c.name")}
                  </Label>
                  <Input
                    id="c-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    invalid={!!errors.name}
                  />
                  <FieldError>{errors.name}</FieldError>
                </div>
                <div>
                  <Label htmlFor="c-email" required>
                    {t("c.email")}
                  </Label>
                  <Input
                    id="c-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    invalid={!!errors.email}
                  />
                  <FieldError>{errors.email}</FieldError>
                </div>
                <div>
                  <Label htmlFor="c-phone" required>
                    {t("c.phone")}
                  </Label>
                  <Input
                    id="c-phone"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                    }
                    invalid={!!errors.phone}
                  />
                  <FieldError>{errors.phone}</FieldError>
                </div>
                <div>
                  <Label htmlFor="c-subject" required>
                    {t("ct.subject")}
                  </Label>
                  <Select
                    id="c-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="c-msg" required>
                    {t("ct.message")}
                  </Label>
                  <Textarea
                    id="c-msg"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    invalid={!!errors.message}
                    className="min-h-36"
                  />
                  <FieldError>{errors.message}</FieldError>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" size="lg" disabled={busy}>
                    <Send size={17} />
                    {busy ? L("Sending…", "भेजा जा रहा है…") : t("c.submit")}
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* offices */}
          <div className="space-y-5">
            <Card>
              <CardHeader title={t("ct.offices")} icon={<Building2 size={15} />} />
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
                {OFFICES.map((o) => (
                  <li key={o.name} className="p-5">
                    <h3 className="text-[0.86rem] font-bold text-gov-900 dark:text-white">{o.name}</h3>
                    <p className="mt-1.5 flex gap-2 text-[0.78rem] leading-relaxed text-slate-600 dark:text-slate-300">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-saffron-500" aria-hidden />
                      {o.addr}
                    </p>
                    <p className="mt-1.5 flex gap-2 text-[0.78rem] text-slate-600 dark:text-slate-300">
                      <Phone size={14} className="mt-0.5 shrink-0 text-leaf-600" aria-hidden />
                      <a href={`tel:${o.phone.replace(/[^0-9+]/g, "")}`} className="hover:underline">
                        {o.phone}
                      </a>
                    </p>
                    <p className="mt-1.5 flex gap-2 text-[0.78rem] text-slate-600 dark:text-slate-300">
                      <Mail size={14} className="mt-0.5 shrink-0 text-gov-500" aria-hidden />
                      <a href={`mailto:${o.email}`} className="break-all hover:underline">
                        {o.email}
                      </a>
                    </p>
                    <p className="mt-1.5 flex gap-2 text-[0.75rem] text-slate-500 dark:text-slate-400">
                      <Clock size={14} className="mt-0.5 shrink-0" aria-hidden />
                      {o.hours}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-44">
                <img
                  src="/images/land-aerial.jpg"
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gov-950/55" />
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <MapPin size={28} className="mx-auto text-saffron-400" aria-hidden />
                    <p className="mt-2 text-[0.85rem] font-bold text-white">Krishi Bhavan, New Delhi</p>
                    <p className="tabular text-[0.72rem] text-gov-200">28.6139° N, 77.2090° E</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-[0.8rem] leading-relaxed text-slate-600 dark:text-slate-300">
                  {L(
                    "Visitors may attend the BhoomiVerify AI facilitation counter on the second floor of Krishi Bhavan on all working days between 11:00 and 16:00 IST with a valid photo identity proof.",
                    "आगंतुक सभी कार्य-दिवसों पर प्रातः 11:00 से 16:00 IST के बीच कृषि भवन की दूसरी मंज़िल पर स्थित भूमि सत्यापन एआई सुविधा काउंटर पर वैध फोटो पहचान पत्र के साथ उपस्थित हो सकते हैं।",
                  )}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
