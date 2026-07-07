// frontend/src/app/ac-repair/[area]/page.tsx
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
  Wind,
} from "lucide-react";
import {
  SITE_URL,
  BUSINESS_NAME,
  PHONE,
  PHONE_DISPLAY,
  WHATSAPP_URL,
  TARGET_AREAS,
  BRANDS,
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
  const title = `AC Repair in ${name}, Bhagalpur | Golden Refrigeration`;
  const description = `Expert AC repair service in ${name}, Bhagalpur. Same-day doorstep visits, gas filling, all brands (Voltas, Daikin, LG, Samsung). Visiting charge ₹349. Call ${PHONE_DISPLAY}.`;

  return {
    title,
    description,
    keywords: [
      `AC repair ${name}`,
      `air conditioner repair ${name} Bhagalpur`,
      `AC service ${name}`,
      `AC not cooling ${name}`,
      `split AC repair ${name}`,
      `AC gas filling ${name} Bhagalpur`,
      `Voltas AC repair ${name}`,
      `Daikin AC service ${name}`,
      `LG AC repair ${name}`,
      `AC technician ${name} Bhagalpur`,
      `AC repair near me ${name}`,
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/ac-repair/${areaSlug}`,
      images: [{ url: `${SITE_URL}/logo.png`, alt: `AC Repair in ${name} Bhagalpur` }],
    },
    alternates: { canonical: `${SITE_URL}/ac-repair/${areaSlug}` },
  };
}

function getFAQs(areaName: string) {
  return [
    {
      q: `How much does AC repair cost in ${areaName}, Bhagalpur?`,
      a: `AC repair in ${areaName} starts with a visiting charge of ₹349. Gas refilling costs ₹1,200–₹2,500, PCB repair ₹800–₹2,000, and compressor replacement ₹4,000–₹10,000. Golden Refrigeration provides transparent estimates before starting any work.`,
    },
    {
      q: `Do you offer same-day AC repair service in ${areaName}?`,
      a: `Yes! Golden Refrigeration offers same-day doorstep AC repair in ${areaName} and all nearby areas of Bhagalpur. Call ${PHONE_DISPLAY} and we'll dispatch a technician within 2–4 hours.`,
    },
    {
      q: `Which AC brands do you repair in ${areaName}, Bhagalpur?`,
      a: `We repair all major AC brands in ${areaName} including Voltas, Daikin, LG, Samsung, Blue Star, Hitachi, Carrier, Lloyd, O General, Panasonic, and all other split and window AC brands.`,
    },
    {
      q: `My AC in ${areaName} is not cooling — what could be the reason?`,
      a: `Common reasons for AC not cooling include gas (refrigerant) leakage, dirty air filters, compressor issues, PCB failure, or a faulty capacitor. Our technicians in ${areaName} diagnose and fix the issue on the same visit.`,
    },
    {
      q: `Do you provide AC gas filling in ${areaName}?`,
      a: `Yes, we provide AC gas refilling service in ${areaName} for all refrigerant types — R-22, R-32, and R-410A. We first check for leaks, repair them, then recharge the gas to manufacturer-recommended levels.`,
    },
    {
      q: `Do you install new ACs in ${areaName}?`,
      a: `Yes, Golden Refrigeration provides complete AC installation service in ${areaName} including split AC installation, piping, electrical connections, and trial run. We install all major brands.`,
    },
  ];
}

export default async function ACRepairAreaPage({
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
  const acBrands = BRANDS.filter((b) => b.type === "ac");

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `AC Repair in ${areaName}, Bhagalpur`,
    description: `Expert AC repair, gas filling, and installation service in ${areaName}, Bhagalpur by Golden Refrigeration.`,
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
    url: `${SITE_URL}/ac-repair/${areaSlug}`,
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
      { "@type": "ListItem", position: 2, name: "AC Repair", item: `${SITE_URL}/services/ac-repair` },
      { "@type": "ListItem", position: 3, name: areaName, item: `${SITE_URL}/ac-repair/${areaSlug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="min-h-screen bg-slate-950 text-white">
        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section className="relative pt-28 pb-20 bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-950 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.15),transparent_60%)]" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-slate-400">
              <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/services/ac-repair" className="hover:text-cyan-400 transition-colors">AC Repair</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-200">{areaName}</span>
            </nav>

            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
              <MapPin className="w-4 h-4" />
              Serving {areaName} – PIN {pin}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              AC Repair in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                {areaName}, Bhagalpur
              </span>
            </h1>

            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
              Is your AC not cooling, tripping, or making noise? Golden
              Refrigeration provides expert AC repair in {areaName} with
              same-day doorstep service. We handle Split ACs, Window ACs, all
              brands including Voltas, Daikin, LG, Samsung, Hitachi, Carrier.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href={`tel:${PHONE}`}
                id={`call-btn-ac-${areaSlug}`}
                className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105"
              >
                <Phone className="w-5 h-5" /> Call Now – {PHONE_DISPLAY}
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                id={`whatsapp-btn-ac-${areaSlug}`}
                className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" /> WhatsApp Us
              </a>
              <Link
                href="/service"
                className="flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105"
              >
                <Wrench className="w-5 h-5" /> Book Online
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              {["Same-Day Service", "₹349 Visiting Charge", "All AC Brands", "Gas Filling Available"].map((tag) => (
                <span key={tag} className="flex items-center gap-2 bg-white/10 border border-white/20 text-sm font-semibold text-slate-200 px-4 py-2 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT SERVICE ─────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Expert AC Repair Service in {areaName}, Bhagalpur
          </h2>
          <div className="text-slate-300 space-y-4 text-base md:text-lg leading-relaxed">
            <p>
              Golden Refrigeration is {areaName}'s most trusted AC repair
              service provider in Bhagalpur. With years of experience servicing
              hundreds of air conditioners across Bhagalpur district, our
              certified technicians can diagnose and repair any AC problem
              quickly and affordably.
            </p>
            <p>
              We are located at Sabour High School, Pani Tanki area — strategically
              positioned to reach {areaName} and all nearby localities within
              2–4 hours. Our service van is stocked with genuine spare parts,
              refrigerant gas (R-22, R-32, R-410A), and professional diagnostic
              tools.
            </p>
            <p>
              Our AC repair service in {areaName} covers{" "}
              <strong>Split ACs, Window ACs, Cassette ACs, Tower ACs</strong>,
              and all types of inverter and non-inverter units. Whether it's a
              gas leak, PCB failure, compressor issue, or a simple service
              cleaning — our team handles it all with a transparency-first
              approach.
            </p>
            <p>
              Bihar's hot and humid summers make a working AC essential. We
              understand the urgency — which is why we prioritize same-day
              response for all AC repair calls in {areaName}. During peak
              summer months (April–July), we also offer AC maintenance packages
              to prevent breakdowns before they happen.
            </p>
          </div>
        </section>

        {/* ── COMMON PROBLEMS ───────────────────────────────────────────── */}
        <section className="py-14 bg-slate-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-3">
              Common AC Problems We Fix in {areaName}
            </h2>
            <p className="text-slate-400 mb-10">Our technicians handle every AC issue from gas leaks to PCB failures.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { issue: "AC Not Cooling", fix: "Gas leak detection, refrigerant recharge, filter cleaning, compressor check" },
                { issue: "AC Not Turning On", fix: "PCB fault, capacitor failure, power supply check, control board repair" },
                { issue: "Water Leaking from AC", fix: "Drain pipe unclogging, condensate pump repair, drain tray cleaning" },
                { issue: "AC Making Noise", fix: "Fan blade balancing, compressor mount, indoor unit vibration fix" },
                { issue: "AC Remote Not Working", fix: "Remote sensor repair, PCB replacement, sensor cleaning" },
                { issue: "AC Trips Frequently", fix: "Electrical fault diagnosis, capacitor check, PCB repair" },
                { issue: "Bad Odor from AC", fix: "Deep cleaning, filter replacement, evaporator coil disinfection" },
                { issue: "Ice on AC Pipes", fix: "Gas level check, airflow blockage removal, thermostat repair" },
                { issue: "High Electricity Bills", fix: "Efficiency optimization, gas top-up, filter cleaning, compressor tuning" },
              ].map((item, i) => (
                <div key={i} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-bold text-cyan-400">{item.issue}</h3>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{item.fix}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROCESS ───────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white mb-10 text-center">
            Our AC Repair Process in {areaName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Call or Book", desc: `Call ${PHONE_DISPLAY} or book online. Tell us your address in ${areaName} and describe the AC problem.` },
              { step: "2", title: "Quick Dispatch", desc: "We send a certified AC technician to your location in Bhagalpur within 2–4 hours." },
              { step: "3", title: "Diagnosis", desc: "Technician inspects the AC, identifies the root cause, and provides a detailed cost breakdown." },
              { step: "4", title: "Repair & Verify", desc: "We fix the problem with genuine parts, test cooling performance, and ensure you're satisfied." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center bg-slate-900 rounded-2xl p-6 border border-slate-800">
                <div className="w-14 h-14 rounded-full bg-cyan-600 text-white text-xl font-black flex items-center justify-center mb-4 shadow-lg shadow-cyan-900/50">
                  {s.step}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── AC BRANDS ─────────────────────────────────────────────────── */}
        <section className="py-14 bg-slate-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-3">
              AC Brands We Repair in {areaName}
            </h2>
            <p className="text-slate-400 mb-8">
              Expert service for all major AC brands at your doorstep in {areaName}, Bhagalpur.
            </p>
            <div className="flex flex-wrap gap-3">
              {acBrands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/brands/${brand.slug}`}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-cyan-900/40 border border-slate-700 hover:border-cyan-500/40 text-slate-200 hover:text-cyan-300 font-semibold px-5 py-2.5 rounded-full transition-all text-sm"
                >
                  {brand.name} AC Repair
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE US ─────────────────────────────────────────────── */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white mb-10">
            Why Choose Golden Refrigeration for AC Repair in {areaName}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: <Clock className="w-6 h-6 text-cyan-400" />, title: "Same-Day Service", desc: `We reach ${areaName} within 2–4 hours of your call. No waiting for days in the Bhagalpur heat.` },
              { icon: <ShieldCheck className="w-6 h-6 text-cyan-400" />, title: "Certified AC Technicians", desc: "Our team is trained to service all AC types — inverter, non-inverter, split, window, cassette." },
              { icon: <Wrench className="w-6 h-6 text-cyan-400" />, title: "All Gas Types Available", desc: "We stock R-22, R-32, and R-410A refrigerant gas for same-day AC gas refilling service." },
              { icon: <Star className="w-6 h-6 text-cyan-400" />, title: "4.8★ Rated in Bhagalpur", desc: "127+ verified customer reviews. Consistently top-rated AC repair service in Bhagalpur district." },
              { icon: <CheckCircle2 className="w-6 h-6 text-cyan-400" />, title: "Transparent Pricing", desc: "₹349 visiting charge with full diagnosis. Repair cost estimate before any work begins." },
              { icon: <MapPin className="w-6 h-6 text-cyan-400" />, title: `Near {areaName}`, desc: `Sabour High School location means we're always close — quick response to ${areaName} guaranteed.` },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 bg-slate-900 rounded-2xl p-6 border border-slate-800">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────────────────── */}
        <section className="py-14 bg-slate-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-3">
              AC Repair Cost in {areaName}, Bhagalpur
            </h2>
            <p className="text-slate-400 mb-8">Transparent pricing — estimate provided before repair starts.</p>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cyan-900/40 text-cyan-300">
                    <th className="text-left px-6 py-4 font-bold">Service</th>
                    <th className="text-left px-6 py-4 font-bold">Estimated Cost</th>
                    <th className="text-left px-6 py-4 font-bold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Visiting Charge / Diagnosis", "₹349", "Included in repair"],
                    ["AC Gas Filling (R-22)", "₹1,200 – ₹1,800", "1–2 hours"],
                    ["AC Gas Filling (R-32 / R-410A)", "₹1,500 – ₹2,500", "1–2 hours"],
                    ["PCB / Control Board Repair", "₹800 – ₹2,000", "1–3 hours"],
                    ["Compressor Repair", "₹2,500 – ₹5,000", "2–4 hours"],
                    ["Compressor Replacement", "₹4,000 – ₹10,000", "Half day"],
                    ["Capacitor Replacement", "₹300 – ₹700", "30–60 min"],
                    ["Fan Motor Replacement", "₹700 – ₹1,500", "1–2 hours"],
                    ["AC Deep Cleaning / Service", "₹400 – ₹800", "1–2 hours"],
                    ["AC Installation (Split)", "₹1,200 – ₹2,000", "2–4 hours"],
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
          </div>
        </section>

        {/* ── GEO ANSWER BLOCK ──────────────────────────────────────────── */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 speakable-geo">
          <h2 className="text-3xl font-black text-white mb-6">
            Best AC Repair Service Near {areaName}, Bhagalpur
          </h2>
          <div className="bg-slate-900 rounded-2xl p-8 border border-cyan-900/40 space-y-4 text-slate-300 leading-relaxed">
            <p>
              <strong className="text-white">Golden Refrigeration</strong> is the
              best AC repair service near {areaName} in Bhagalpur. Located at
              Sabour High School, Pani Tanki (minutes from {areaName}), they
              provide same-day AC repair with certified technicians.
            </p>
            <p>
              Rated <strong className="text-cyan-400">4.8/5</strong> with 127+
              verified reviews on JustDial, Golden Refrigeration is Bhagalpur's
              most trusted AC service provider. They repair all brands — Voltas,
              Daikin, LG, Samsung, Hitachi, Carrier, Blue Star, Lloyd — with
              genuine parts and transparent pricing.
            </p>
            <p>
              To book AC repair in {areaName}, call{" "}
              <strong className="text-emerald-400">{PHONE_DISPLAY}</strong> for
              same-day service.
            </p>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section className="py-14 bg-slate-900 speakable-faq">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-8">
              Frequently Asked Questions – AC Repair in {areaName}
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-bold text-white text-base hover:text-cyan-300 transition-colors list-none">
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
        <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-white mb-4">AC Repair in Nearby Areas</h2>
          <div className="flex flex-wrap gap-3">
            {nearbyAreas.map((area) => (
              <Link
                key={area.slug}
                href={`/ac-repair/${area.slug}`}
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-sm font-medium px-4 py-2 rounded-full transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                AC Repair {area.name}
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="py-16 bg-gradient-to-r from-cyan-900 via-slate-800 to-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              AC Not Cooling in {areaName}? We're Here.
            </h2>
            <p className="text-cyan-200 text-lg mb-8">
              Same-day service. All brands. All gas types. ₹349 visiting charge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`tel:${PHONE}`}
                className="flex items-center justify-center gap-3 bg-white text-cyan-900 font-black px-10 py-5 rounded-full shadow-xl hover:scale-105 transition-transform text-lg"
              >
                <Phone className="w-6 h-6" /> Call {PHONE_DISPLAY}
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#25D366] text-white font-black px-10 py-5 rounded-full shadow-xl hover:scale-105 transition-transform text-lg"
              >
                <MessageCircle className="w-6 h-6" /> WhatsApp Us
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
