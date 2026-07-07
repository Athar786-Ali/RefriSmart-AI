// frontend/src/app/services/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Wrench,
  Clock,
  ShieldCheck,
  Star,
} from "lucide-react";
import {
  SITE_URL,
  BUSINESS_NAME,
  PHONE,
  PHONE_DISPLAY,
  WHATSAPP_URL,
  SERVICES,
  BRANDS,
  TARGET_AREAS,
} from "@/lib/seo-config";

export async function generateStaticParams() {
  return SERVICES.map((svc) => ({ slug: svc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return {};

  const title = `${service.name} in Bhagalpur, Bihar | Golden Refrigeration`;
  const description = `Expert ${service.name.toLowerCase()} in Bhagalpur, Bihar. Same-day doorstep service with certified technicians. All brands covered. ₹349 visiting charge. Call ${PHONE_DISPLAY}.`;

  return {
    title,
    description,
    keywords: [
      `${service.name.toLowerCase()} Bhagalpur`,
      `${service.name.toLowerCase()} Sabour`,
      `${service.name.toLowerCase()} near me Bhagalpur`,
      `${service.name.toLowerCase()} Bihar`,
      `best ${service.name.toLowerCase()} Bhagalpur`,
      `${service.category.toLowerCase()} repair Bhagalpur`,
      `affordable ${service.name.toLowerCase()} Bhagalpur`,
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/services/${slug}`,
      images: [{ url: `${SITE_URL}/logo.png`, alt: `${service.name} Bhagalpur` }],
    },
    alternates: { canonical: `${SITE_URL}/services/${slug}` },
  };
}

// ─── Service-specific content ─────────────────────────────────────────────────
function getServiceContent(slug: string, serviceName: string, category: string) {
  const contentMap: Record<string, { intro: string; details: string[]; problems: { issue: string; fix: string }[]; pricing: string[][] }> = {
    "ac-repair": {
      intro: `Golden Refrigeration provides expert AC repair in Bhagalpur, Bihar. Our certified technicians handle all types of air conditioner problems — from gas leaks and PCB failures to compressor issues and water leaks. We serve all areas of Bhagalpur district with same-day doorstep service.`,
      details: [
        `We repair all AC brands including Voltas, Daikin, LG, Samsung, Blue Star, Hitachi, Carrier, Lloyd, O General, and Panasonic.`,
        `Our technicians are trained to service Split ACs, Window ACs, Cassette ACs, and Tower ACs.`,
        `We stock all types of AC refrigerant gas: R-22, R-32, and R-410A for same-day gas refilling.`,
        `All repairs are backed by a service warranty and transparent pricing with no hidden charges.`,
      ],
      problems: [
        { issue: "AC Not Cooling", fix: "Gas refilling, filter cleaning, compressor check, thermostat calibration" },
        { issue: "AC Not Starting", fix: "PCB repair, capacitor replacement, power supply diagnostic" },
        { issue: "Water Leaking", fix: "Drain line unclogging, condensate tray repair, seal replacement" },
        { issue: "AC Making Noise", fix: "Fan blade balancing, compressor mount repair, vibration damper fix" },
        { issue: "Foul Smell", fix: "Deep cleaning, evaporator coil disinfection, filter replacement" },
        { issue: "AC Tripping", fix: "Electrical diagnostic, overload protection check, PCB repair" },
      ],
      pricing: [
        ["Visiting Charge / Diagnosis", "₹349", "Included in repair"],
        ["Gas Filling (R-22)", "₹1,200 – ₹1,800", "1–2 hours"],
        ["Gas Filling (R-32/R-410A)", "₹1,500 – ₹2,500", "1–2 hours"],
        ["PCB Repair", "₹800 – ₹2,000", "1–3 hours"],
        ["Compressor Repair", "₹2,500 – ₹5,000", "2–4 hours"],
        ["Capacitor Replacement", "₹300 – ₹700", "30–60 min"],
        ["AC Deep Cleaning", "₹400 – ₹800", "1–2 hours"],
      ],
    },
    "refrigerator-repair": {
      intro: `Golden Refrigeration is Bhagalpur's most trusted refrigerator repair service. Our certified technicians repair all types of refrigerators — single-door, double-door, side-by-side, French door — from all major brands. Same-day doorstep service across Bhagalpur district.`,
      details: [
        `We repair all brands: LG, Samsung, Whirlpool, Godrej, Haier, Panasonic, Bosch, Videocon, and all others.`,
        `Expert in compressor diagnosis, PCB repair, gas filling, thermostat calibration, and door seal replacement.`,
        `We carry R-134a and R-600a refrigerant gas for all refrigerator models.`,
        `Our technicians arrive equipped with genuine spare parts to complete most repairs in a single visit.`,
      ],
      problems: [
        { issue: "Fridge Not Cooling", fix: "Gas refilling, compressor check, thermostat calibration, condenser cleaning" },
        { issue: "Compressor Not Starting", fix: "Capacitor, relay, start device, compressor overhaul" },
        { issue: "Water Leaking Inside", fix: "Defrost drain unclogging, drain pan repair, door seal replacement" },
        { issue: "Excessive Frost Buildup", fix: "Defrost heater, timer, thermostat inspection and replacement" },
        { issue: "PCB Failure", fix: "Board-level diagnostics, component repair, full board replacement" },
        { issue: "Noise from Fridge", fix: "Fan motor, compressor mount, vibration damper repair" },
      ],
      pricing: [
        ["Visiting Charge / Diagnosis", "₹349", "Included in repair"],
        ["Gas Filling (R-134a)", "₹800 – ₹1,200", "1–2 hours"],
        ["Gas Filling (R-600a)", "₹1,000 – ₹1,500", "1–2 hours"],
        ["Compressor Repair", "₹2,000 – ₹4,500", "2–4 hours"],
        ["PCB Repair", "₹800 – ₹2,000", "1–3 hours"],
        ["Thermostat Replacement", "₹400 – ₹800", "30–60 min"],
        ["Door Seal Replacement", "₹300 – ₹600", "30 min"],
      ],
    },
  };

  return (
    contentMap[slug] ?? {
      intro: `Golden Refrigeration provides expert ${serviceName.toLowerCase()} in Bhagalpur, Bihar. Our certified technicians offer same-day doorstep service for all brands and models. ${serviceName} done right — the first time.`,
      details: [
        `We cover all major brands for ${serviceName.toLowerCase()} in Bhagalpur.`,
        `Our technicians carry genuine spare parts for same-day repair completion.`,
        `Transparent pricing — estimate provided before work begins. No hidden charges.`,
        `Serving 30+ areas across Bhagalpur district including Sabour, Nathnagar, Barari, Adampur, and more.`,
      ],
      problems: [
        { issue: `${category} Not Working`, fix: "Full diagnostic, component-level repair, part replacement as needed" },
        { issue: "Poor Performance", fix: "Efficiency check, cleaning, calibration, part replacement" },
        { issue: "Making Unusual Sounds", fix: "Component inspection, vibration fixes, mount repair" },
        { issue: "Error Codes Showing", fix: "PCB diagnostic, sensor replacement, software reset" },
        { issue: "Power Issues", fix: "Electrical diagnostic, board repair, power component replacement" },
        { issue: "Leaking", fix: "Seal inspection, pipe repair, drain system cleaning" },
      ],
      pricing: [
        ["Visiting Charge / Diagnosis", "₹349", "Included in repair"],
        ["Minor Repair", "₹400 – ₹900", "30–90 min"],
        ["Medium Repair", "₹900 – ₹2,000", "1–3 hours"],
        ["Major Repair / Part Replacement", "₹2,000 – ₹6,000", "2–5 hours"],
      ],
    }
  );
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();

  const content = getServiceContent(slug, service.name, service.category);
  const topAreas = TARGET_AREAS.slice(0, 12);
  const relatedBrands = BRANDS.filter((b) =>
    service.category === "AC"
      ? b.type === "ac"
      : service.category === "Washing Machine"
      ? b.type === "appliance"
      : b.type === "refrigerator"
  );
  const relatedServices = SERVICES.filter(
    (s) => s.slug !== slug && s.category === service.category
  ).slice(0, 4);

  const faqs = [
    {
      q: `How much does ${service.name.toLowerCase()} cost in Bhagalpur?`,
      a: `${service.name} in Bhagalpur starts with a ₹349 visiting charge. The total cost depends on the problem and parts needed. Golden Refrigeration provides a full estimate before starting work — no surprises.`,
    },
    {
      q: `Do you offer same-day ${service.name.toLowerCase()} in Bhagalpur?`,
      a: `Yes! Call ${PHONE_DISPLAY} and we dispatch a certified technician the same day. Most ${service.name.toLowerCase()} jobs in Bhagalpur are completed in a single visit.`,
    },
    {
      q: `Which brands do you cover for ${service.name.toLowerCase()} in Bhagalpur?`,
      a: `We cover all major brands including ${BRANDS.slice(0, 6).map((b) => b.name).join(", ")}, and all other brands available in the Indian market.`,
    },
    {
      q: `Which areas in Bhagalpur do you cover for ${service.name.toLowerCase()}?`,
      a: `We serve 30+ areas including Sabour, Nathnagar, Barari, Adampur, Tilkamanjhi, Tatarpur, Khanjarpur, Kahalgaon, Sultanganj, and all major localities of Bhagalpur district.`,
    },
    {
      q: `Do you use genuine spare parts for ${service.name.toLowerCase()}?`,
      a: `Yes, Golden Refrigeration uses only original, manufacturer-approved spare parts for all repairs. This ensures your appliance runs reliably for years after the repair.`,
    },
  ];

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.name} in Bhagalpur, Bihar`,
    description: content.intro,
    provider: { "@type": "LocalBusiness", name: BUSINESS_NAME, telephone: PHONE },
    areaServed: { "@type": "City", name: "Bhagalpur, Bihar" },
    url: `${SITE_URL}/services/${slug}`,
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
      { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
      { "@type": "ListItem", position: 3, name: service.name, item: `${SITE_URL}/services/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="min-h-screen bg-slate-950 text-white">
        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section className="relative pt-28 pb-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_60%)]" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-slate-400">
              <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-200">{service.name}</span>
            </nav>

            <div className="text-4xl mb-4">{service.icon}</div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              {service.name} in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Bhagalpur, Bihar
              </span>
            </h1>

            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
              {content.intro}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a href={`tel:${PHONE}`} id={`call-btn-service-${slug}`} className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105">
                <Phone className="w-5 h-5" /> Call Now – {PHONE_DISPLAY}
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" id={`whatsapp-btn-service-${slug}`} className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105">
                <MessageCircle className="w-5 h-5" /> WhatsApp Us
              </a>
              <Link href="/service" className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105">
                <Wrench className="w-5 h-5" /> Book Service
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              {["Same-Day Service", "₹349 Visiting Charge", "Certified Technicians", "All Brands Covered"].map((tag) => (
                <span key={tag} className="flex items-center gap-2 bg-white/10 border border-white/20 text-sm font-semibold text-slate-200 px-4 py-2 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT SERVICE ─────────────────────────────────────────────── */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white mb-6">
            About Our {service.name} Service in Bhagalpur
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.details.map((detail, i) => (
              <div key={i} className="flex gap-3 bg-slate-900 rounded-2xl p-5 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                <p className="text-slate-300 text-sm leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROBLEMS WE FIX ───────────────────────────────────────────── */}
        <section className="py-14 bg-slate-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-8">
              Problems We Fix – {service.name} in Bhagalpur
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {content.problems.map((item, i) => (
                <div key={i} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <h3 className="font-bold text-blue-400 text-base mb-2">{item.issue}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{item.fix}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE US ─────────────────────────────────────────────── */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white mb-10">
            Why Choose Golden Refrigeration for {service.name} in Bhagalpur?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Clock className="w-6 h-6 text-blue-400" />, title: "Same-Day Response", desc: `Technician dispatched within 2–4 hours. ${service.name} completed the same day in most cases.` },
              { icon: <ShieldCheck className="w-6 h-6 text-blue-400" />, title: "Certified Technicians", desc: `Our team has years of experience in ${service.name.toLowerCase()} across all brands.` },
              { icon: <Wrench className="w-6 h-6 text-blue-400" />, title: "Genuine Spare Parts", desc: "We use only original, manufacturer-approved replacement parts for lasting results." },
              { icon: <Star className="w-6 h-6 text-blue-400" />, title: "4.8★ Rated Service", desc: "127+ verified reviews on JustDial. Bhagalpur's most trusted repair service." },
              { icon: <CheckCircle2 className="w-6 h-6 text-blue-400" />, title: "Transparent Pricing", desc: "₹349 visiting charge. Complete estimate before repair. No hidden charges ever." },
              { icon: <MapPin className="w-6 h-6 text-blue-400" />, title: "30+ Areas Covered", desc: "We serve all major localities of Bhagalpur — from Sabour to Kahalgaon." },
            ].map((item, i) => (
              <div key={i} className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-white mb-2 text-sm">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────────────────── */}
        <section className="py-14 bg-slate-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-3">
              {service.name} Cost in Bhagalpur
            </h2>
            <p className="text-slate-400 mb-8">Transparent pricing — estimate before work starts. No hidden charges.</p>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-900/40 text-blue-300">
                    <th className="text-left px-6 py-4 font-bold">Service Type</th>
                    <th className="text-left px-6 py-4 font-bold">Estimated Cost</th>
                    <th className="text-left px-6 py-4 font-bold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {content.pricing.map(([svcName, cost, dur], i) => (
                    <tr key={i} className={`border-t border-slate-800 ${i % 2 === 0 ? "bg-slate-950" : "bg-slate-900"}`}>
                      <td className="px-6 py-4 text-slate-200 font-medium">{svcName}</td>
                      <td className="px-6 py-4 text-emerald-400 font-bold">{cost}</td>
                      <td className="px-6 py-4 text-slate-400">{dur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── BRANDS ────────────────────────────────────────────────────── */}
        {relatedBrands.length > 0 && (
          <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-white mb-6">
              Brands We Cover for {service.name} in Bhagalpur
            </h2>
            <div className="flex flex-wrap gap-3">
              {relatedBrands.map((brand) => (
                <Link key={brand.slug} href={`/brands/${brand.slug}`} className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 text-sm font-semibold px-5 py-2.5 rounded-full transition-all">
                  {brand.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── SERVICE AREAS ─────────────────────────────────────────────── */}
        <section className="py-14 bg-slate-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-white mb-6">
              {service.name} Service Areas in Bhagalpur
            </h2>
            <div className="flex flex-wrap gap-3">
              {topAreas.map((area) => (
                <Link
                  key={area.slug}
                  href={
                    service.category === "AC"
                      ? `/ac-repair/${area.slug}`
                      : service.category === "Washing Machine"
                      ? `/washing-machine-repair/${area.slug}`
                      : `/refrigerator-repair/${area.slug}`
                  }
                  className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 text-sm font-medium px-4 py-2 rounded-full transition-all"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  {service.name} {area.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section className="py-14 speakable-faq">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-8">
              FAQs – {service.name} in Bhagalpur
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-slate-800 rounded-2xl border border-slate-700">
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-bold text-white text-base hover:text-blue-300 transition-colors list-none">
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

        {/* ── RELATED SERVICES ──────────────────────────────────────────── */}
        {relatedServices.length > 0 && (
          <section className="py-14 bg-slate-900">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-black text-white mb-6">Related Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedServices.map((svc) => (
                  <Link key={svc.slug} href={`/services/${svc.slug}`} className="flex items-center gap-3 bg-slate-800 hover:bg-blue-900/30 border border-slate-700 hover:border-blue-500/40 rounded-xl p-4 transition-all group">
                    <span className="text-2xl">{svc.icon}</span>
                    <div>
                      <p className="font-bold text-white text-sm group-hover:text-blue-300">{svc.name}</p>
                      <p className="text-slate-400 text-xs">{svc.shortDesc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 ml-auto shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="py-16 bg-gradient-to-r from-blue-900 via-slate-800 to-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Need {service.name} in Bhagalpur?
            </h2>
            <p className="text-blue-200 text-lg mb-8">
              Same-day service. Certified technicians. ₹349 visiting charge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`tel:${PHONE}`} className="flex items-center justify-center gap-3 bg-white text-blue-900 font-black px-10 py-5 rounded-full shadow-xl hover:scale-105 transition-transform text-lg">
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
