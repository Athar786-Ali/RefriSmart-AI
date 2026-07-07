// frontend/src/app/washing-machine-repair/[area]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Wrench,
  ChevronRight,
  Star,
} from "lucide-react";
import {
  SITE_URL,
  BUSINESS_NAME,
  PHONE,
  PHONE_DISPLAY,
  WHATSAPP_URL,
  TARGET_AREAS,
} from "@/lib/seo-config";

export async function generateStaticParams() {
  return TARGET_AREAS.map((area) => ({ area: area.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ area: string }>;
}): Promise<Metadata> {
  const { area: areaSlug } = await params;
  const areaData = TARGET_AREAS.find((a) => a.slug === areaSlug);
  if (!areaData) return {};

  const { name } = areaData;
  const title = `Washing Machine Repair in ${name}, Bhagalpur | Golden Refrigeration`;
  const description = `Expert washing machine repair in ${name}, Bhagalpur. Top load & front load repair, all brands (LG, Samsung, Whirlpool, IFB). Same-day service. ₹349 visiting charge. Call ${PHONE_DISPLAY}.`;

  return {
    title,
    description,
    keywords: [
      `washing machine repair ${name}`,
      `washer repair ${name} Bhagalpur`,
      `top load washing machine repair ${name}`,
      `front load washing machine repair ${name}`,
      `LG washing machine repair ${name}`,
      `Samsung washer repair ${name}`,
      `Whirlpool washing machine repair ${name}`,
      `IFB washing machine repair ${name}`,
      `washing machine technician ${name}`,
      `washer not spinning ${name}`,
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/washing-machine-repair/${areaSlug}`,
      images: [{ url: `${SITE_URL}/logo.png`, alt: `Washing Machine Repair ${name} Bhagalpur` }],
    },
    alternates: { canonical: `${SITE_URL}/washing-machine-repair/${areaSlug}` },
  };
}

function getFAQs(areaName: string) {
  return [
    {
      q: `How much does washing machine repair cost in ${areaName}, Bhagalpur?`,
      a: `Washing machine repair in ${areaName} starts with ₹349 visiting charge. Motor repair costs ₹800–₹2,000, PCB ₹600–₹1,800, pump ₹400–₹900, and drum bearing ₹1,500–₹3,500. Transparent estimates provided before work starts.`,
    },
    {
      q: `Do you repair both top load and front load washing machines in ${areaName}?`,
      a: `Yes, we repair all types — top load semi-automatic, top load fully automatic, and front load washing machines from all major brands in ${areaName}, Bhagalpur.`,
    },
    {
      q: `My washing machine in ${areaName} is not spinning — can you fix it?`,
      a: `Yes! Common reasons for a washer not spinning include motor failure, belt issues, PCB fault, lid switch problem (top load), or door lock failure (front load). Our technicians diagnose and fix it the same day.`,
    },
    {
      q: `Which washing machine brands do you repair in ${areaName}?`,
      a: `We repair all major brands in ${areaName} including LG, Samsung, Whirlpool, IFB, Bosch, Haier, Godrej, Panasonic, Videocon, Onida, and all other washing machine brands.`,
    },
    {
      q: `Do you offer same-day washing machine repair in ${areaName}?`,
      a: `Yes! Call ${PHONE_DISPLAY} and we'll dispatch a technician to ${areaName} the same day. Most washing machine repairs are completed in a single visit.`,
    },
    {
      q: `My washing machine in ${areaName} is leaking — what should I do?`,
      a: `A leaking washing machine could be due to a damaged door seal (front load), clogged drain pump, loose hose connection, or cracked drum. Call us at ${PHONE_DISPLAY} — our technicians will diagnose and fix the leak the same day in ${areaName}.`,
    },
  ];
}

export default async function WashingMachineRepairAreaPage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area: areaSlug } = await params;
  const areaData = TARGET_AREAS.find((a) => a.slug === areaSlug);
  if (!areaData) notFound();

  const { name: areaName, pin } = areaData;
  const faqs = getFAQs(areaName);
  const nearbyAreas = TARGET_AREAS.filter((a) => a.slug !== areaSlug).slice(0, 8);

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Washing Machine Repair in ${areaName}, Bhagalpur`,
    description: `Expert washing machine repair in ${areaName}, Bhagalpur by Golden Refrigeration. Same-day service for all brands and types.`,
    provider: {
      "@type": "LocalBusiness",
      name: BUSINESS_NAME,
      telephone: PHONE,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bhagalpur",
        addressRegion: "Bihar",
        postalCode: "813210",
        addressCountry: "IN",
      },
    },
    areaServed: { "@type": "Place", name: `${areaName}, Bhagalpur, Bihar` },
    url: `${SITE_URL}/washing-machine-repair/${areaSlug}`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Washing Machine Repair", item: `${SITE_URL}/services/washing-machine-repair` },
      { "@type": "ListItem", position: 3, name: areaName, item: `${SITE_URL}/washing-machine-repair/${areaSlug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="min-h-screen bg-slate-950 text-white">
        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section className="relative pt-28 pb-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_60%)]" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-slate-400">
              <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/services/washing-machine-repair" className="hover:text-indigo-400 transition-colors">Washing Machine Repair</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-200">{areaName}</span>
            </nav>

            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
              <MapPin className="w-4 h-4" />
              Serving {areaName} – PIN {pin}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              Washing Machine Repair in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {areaName}, Bhagalpur
              </span>
            </h1>

            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
              Washing machine not spinning, leaking, or showing error codes?
              Golden Refrigeration provides expert washing machine repair in{" "}
              {areaName} with same-day doorstep service. Top load, front load,
              semi-automatic — all brands, all types.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href={`tel:${PHONE}`}
                id={`call-btn-washing-${areaSlug}`}
                className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105"
              >
                <Phone className="w-5 h-5" /> Call Now – {PHONE_DISPLAY}
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                id={`whatsapp-btn-washing-${areaSlug}`}
                className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" /> WhatsApp Us
              </a>
              <Link
                href="/service"
                className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105"
              >
                <Wrench className="w-5 h-5" /> Book Online
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              {["Same-Day Service", "₹349 Visiting Charge", "Top & Front Load", "All Brands Covered"].map((tag) => (
                <span key={tag} className="flex items-center gap-2 bg-white/10 border border-white/20 text-sm font-semibold text-slate-200 px-4 py-2 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" /> {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT ─────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Expert Washing Machine Repair in {areaName}
          </h2>
          <div className="text-slate-300 space-y-4 text-base md:text-lg leading-relaxed">
            <p>
              Golden Refrigeration provides reliable and affordable washing
              machine repair service in {areaName}, Bhagalpur. Whether your
              machine is not spinning, not draining, making noise, or showing
              error codes — our certified technicians can diagnose and fix the
              problem quickly.
            </p>
            <p>
              We handle <strong>all types of washing machines</strong>: top load
              semi-automatic (single tub and twin tub), top load fully automatic,
              and front load fully automatic. Our technicians are experienced with
              drum bearings, motor drives, PCBs, inlet valves, drain pumps, and
              door seals.
            </p>
            <p>
              From our Sabour High School base, we cover {areaName} and all
              nearby areas of Bhagalpur with same-day or next-day service. Most
              washing machine repairs are completed in a single visit, using
              genuine spare parts sourced directly from manufacturers.
            </p>
          </div>
        </section>

        {/* ── COMMON PROBLEMS ───────────────────────────────────────────── */}
        <section className="py-14 bg-slate-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-3">
              Common Washing Machine Problems We Fix in {areaName}
            </h2>
            <p className="text-slate-400 mb-10">Every washing machine issue solved with expertise.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { issue: "Not Spinning", fix: "Motor diagnosis, belt/drive check, PCB repair, capacitor replacement" },
                { issue: "Not Draining", fix: "Drain pump cleaning/replacement, hose unclogging, pump filter service" },
                { issue: "Water Leaking", fix: "Door seal replacement, hose connection repair, drum seal fix" },
                { issue: "Not Starting", fix: "Power board, lid switch, door lock, motor control repair" },
                { issue: "Making Noise", fix: "Drum bearing replacement, shock absorber, suspension spring repair" },
                { issue: "Error Codes", fix: "PCB diagnostics, sensor replacement, software reset, board repair" },
                { issue: "Not Washing Properly", fix: "Water inlet valve, detergent dispenser, agitator, drum seal repair" },
                { issue: "Overheating", fix: "Motor thermal protection, PCB fault diagnosis, ventilation check" },
                { issue: "Vibrating Excessively", fix: "Balance weights, suspension rod, drum bearing, leveling adjustment" },
              ].map((item, i) => (
                <div key={i} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-indigo-400 mb-2">{item.issue}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{item.fix}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────────────────── */}
        <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white mb-3">
            Washing Machine Repair Cost in {areaName}, Bhagalpur
          </h2>
          <p className="text-slate-400 mb-8">Transparent pricing with estimates before work begins.</p>
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-900/40 text-indigo-300">
                  <th className="text-left px-6 py-4 font-bold">Service</th>
                  <th className="text-left px-6 py-4 font-bold">Estimated Cost</th>
                  <th className="text-left px-6 py-4 font-bold">Duration</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Visiting Charge / Diagnosis", "₹349", "Included in repair"],
                  ["Motor Repair", "₹800 – ₹2,000", "1–3 hours"],
                  ["Motor Replacement", "₹2,000 – ₹4,000", "2–4 hours"],
                  ["PCB / Control Board Repair", "₹600 – ₹1,800", "1–3 hours"],
                  ["Drum Bearing Replacement", "₹1,500 – ₹3,500", "Half day"],
                  ["Drain Pump Replacement", "₹400 – ₹900", "1 hour"],
                  ["Door Seal (Front Load)", "₹600 – ₹1,200", "1–2 hours"],
                  ["Water Inlet Valve", "₹300 – ₹700", "30–60 min"],
                  ["Carbon Brushes Replacement", "₹400 – ₹800", "1 hour"],
                  ["Suspension Spring / Rod", "₹500 – ₹1,000", "1–2 hours"],
                ].map(([service, cost, duration], i) => (
                  <tr key={i} className={`border-t border-slate-800 ${i % 2 === 0 ? "bg-slate-950" : "bg-slate-900"}`}>
                    <td className="px-6 py-4 text-slate-200 font-medium">{service}</td>
                    <td className="px-6 py-4 text-emerald-400 font-bold">{cost}</td>
                    <td className="px-6 py-4 text-slate-400">{duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── WHY CHOOSE US ─────────────────────────────────────────────── */}
        <section className="py-14 bg-slate-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-10">
              Why Choose Us for Washing Machine Repair in {areaName}?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: <Clock className="w-6 h-6 text-indigo-400" />, title: "Same-Day Doorstep", desc: `Fast response in ${areaName}. Most repairs done in a single visit.` },
                { icon: <ShieldCheck className="w-6 h-6 text-indigo-400" />, title: "Certified Technicians", desc: "Experienced with all washing machine types — top load, front load, semi-auto." },
                { icon: <Wrench className="w-6 h-6 text-indigo-400" />, title: "Genuine Spare Parts", desc: "Original parts for all major brands — no cheap substitutes that fail again." },
                { icon: <Star className="w-6 h-6 text-indigo-400" />, title: "4.8★ Customer Rating", desc: "127+ verified reviews. Bhagalpur's most trusted appliance repair service." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-700">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section className="py-14 speakable-faq">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-8">
              FAQs – Washing Machine Repair in {areaName}
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-slate-800 rounded-2xl border border-slate-700">
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-bold text-white text-base hover:text-indigo-300 transition-colors list-none">
                    {faq.q}
                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 text-slate-300 text-sm md:text-base leading-relaxed border-t border-slate-700 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── NEARBY AREAS ─────────────────────────────────────────────── */}
        <section className="py-14 bg-slate-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-white mb-4">Washing Machine Repair in Nearby Areas</h2>
            <div className="flex flex-wrap gap-3">
              {nearbyAreas.map((area) => (
                <Link
                  key={area.slug}
                  href={`/washing-machine-repair/${area.slug}`}
                  className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 text-sm font-medium px-4 py-2 rounded-full transition-all"
                >
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  Washer Repair {area.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="py-16 bg-gradient-to-r from-indigo-900 via-slate-800 to-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Washing Machine Problem in {areaName}?
            </h2>
            <p className="text-indigo-200 text-lg mb-8">
              Same-day service. All brands. Starting at ₹349.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`tel:${PHONE}`} className="flex items-center justify-center gap-3 bg-white text-indigo-900 font-black px-10 py-5 rounded-full shadow-xl hover:scale-105 transition-transform text-lg">
                <Phone className="w-6 h-6" /> Call {PHONE_DISPLAY}
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-[#25D366] text-white font-black px-10 py-5 rounded-full shadow-xl hover:scale-105 transition-transform text-lg">
                <MessageCircle className="w-6 h-6" /> WhatsApp Us
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
