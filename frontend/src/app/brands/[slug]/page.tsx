// frontend/src/app/brands/[slug]/page.tsx
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
  ShieldCheck,
  Clock,
} from "lucide-react";
import {
  SITE_URL,
  BUSINESS_NAME,
  PHONE,
  PHONE_DISPLAY,
  WHATSAPP_URL,
  BRANDS,
  TARGET_AREAS,
  SERVICES,
} from "@/lib/seo-config";

export async function generateStaticParams() {
  return BRANDS.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = BRANDS.find((b) => b.slug === slug);
  if (!brand) return {};

  const serviceType = brand.type === "ac" ? "AC" : brand.type === "appliance" ? "Appliance" : "Refrigerator";
  const title = `${brand.name} ${serviceType} Repair in Bhagalpur | Golden Refrigeration`;
  const description = `Expert ${brand.name} ${serviceType.toLowerCase()} repair in Bhagalpur, Bihar. Certified technicians, genuine ${brand.name} parts, same-day doorstep service. ₹349 visiting charge. Call ${PHONE_DISPLAY}.`;

  return {
    title,
    description,
    keywords: [
      `${brand.name} ${serviceType.toLowerCase()} repair Bhagalpur`,
      `${brand.name} repair Bhagalpur`,
      `${brand.name} service center Bhagalpur`,
      `${brand.name} repair Sabour`,
      `${brand.name} technician Bhagalpur`,
      `${brand.name} repair near me Bhagalpur`,
      `${brand.name} spare parts Bhagalpur`,
    ],
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/brands/${slug}`,
      images: [{ url: `${SITE_URL}/logo.png`, alt: `${brand.name} Repair Bhagalpur` }],
    },
    alternates: { canonical: `${SITE_URL}/brands/${slug}` },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = BRANDS.find((b) => b.slug === slug);
  if (!brand) notFound();

  const serviceType = brand.type === "ac" ? "AC" : brand.type === "appliance" ? "Washing Machine" : "Refrigerator";
  const serviceTypeLC = serviceType.toLowerCase();

  const relevantServices = SERVICES.filter((s) =>
    brand.type === "ac"
      ? s.category === "AC"
      : brand.type === "appliance"
      ? s.category === "Washing Machine"
      : s.category === "Refrigerator"
  );

  const faqs = [
    {
      q: `Do you repair ${brand.name} ${serviceTypeLC} in Bhagalpur?`,
      a: `Yes! Golden Refrigeration provides expert ${brand.name} ${serviceTypeLC} repair in Bhagalpur. Our technicians are experienced with all ${brand.name} models and carry genuine ${brand.name} spare parts.`,
    },
    {
      q: `Is there a ${brand.name} service center in Bhagalpur?`,
      a: `Golden Refrigeration at Sabour High School, Pani Tanki, Bhagalpur is your trusted local repair partner for all ${brand.name} appliances. We provide doorstep service across all areas of Bhagalpur district.`,
    },
    {
      q: `How much does ${brand.name} ${serviceTypeLC} repair cost in Bhagalpur?`,
      a: `${brand.name} ${serviceTypeLC} repair in Bhagalpur starts with a ₹349 visiting charge. The total cost depends on the issue — parts and labor estimate is provided transparently before any work begins.`,
    },
    {
      q: `Do you carry genuine ${brand.name} spare parts?`,
      a: `Yes, we stock genuine ${brand.name} spare parts for the most common repair needs. For rare parts, we source them quickly from authorized distributors to minimize repair time.`,
    },
    {
      q: `Do you offer same-day ${brand.name} repair in Bhagalpur?`,
      a: `Yes! Call ${PHONE_DISPLAY} and we'll dispatch a certified technician to your location in Bhagalpur the same day. Most ${brand.name} repairs are completed in a single visit.`,
    },
    {
      q: `Which areas in Bhagalpur do you cover for ${brand.name} repair?`,
      a: `We serve all areas of Bhagalpur including Sabour, Nathnagar, Barari, Adampur, Tilkamanjhi, Tatarpur, Kahalgaon, Sultanganj, and 30+ locations across Bhagalpur district.`,
    },
  ];

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${brand.name} ${serviceType} Repair in Bhagalpur`,
    description: brand.description,
    provider: { "@type": "LocalBusiness", name: BUSINESS_NAME, telephone: PHONE },
    areaServed: { "@type": "City", name: "Bhagalpur, Bihar" },
    url: `${SITE_URL}/brands/${slug}`,
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
      { "@type": "ListItem", position: 2, name: "Brands", item: `${SITE_URL}/brands` },
      { "@type": "ListItem", position: 3, name: brand.name, item: `${SITE_URL}/brands/${slug}` },
    ],
  };

  const otherBrands = BRANDS.filter((b) => b.slug !== slug && b.type === brand.type);
  const topAreas = TARGET_AREAS.slice(0, 10);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="min-h-screen bg-slate-950 text-white">
        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <section className="relative pt-28 pb-20 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.15),transparent_60%)]" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-slate-400">
              <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-200">{brand.name} Repair</span>
            </nav>

            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
              <ShieldCheck className="w-4 h-4" />
              Genuine {brand.name} Parts Available
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              {brand.name}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {serviceType} Repair
              </span>{" "}
              in Bhagalpur
            </h1>

            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
              {brand.description} Same-day doorstep service in Bhagalpur with
              certified technicians. Visiting charge ₹349 only.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href={`tel:${PHONE}`}
                id={`call-btn-brand-${slug}`}
                className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105"
              >
                <Phone className="w-5 h-5" /> Call Now – {PHONE_DISPLAY}
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                id={`whatsapp-btn-brand-${slug}`}
                className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" /> WhatsApp Us
              </a>
              <Link href="/service" className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105">
                <Wrench className="w-5 h-5" /> Book Service
              </Link>
            </div>

            <div className="flex flex-wrap gap-3">
              {[`Genuine ${brand.name} Parts`, "Same-Day Service", "Certified Technicians", "₹349 Visiting Charge"].map((tag) => (
                <span key={tag} className="flex items-center gap-2 bg-white/10 border border-white/20 text-sm font-semibold text-slate-200 px-4 py-2 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT BRAND SERVICE ───────────────────────────────────────── */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white mb-6">
            Why Trust Golden Refrigeration for {brand.name} Repair in Bhagalpur?
          </h2>
          <div className="text-slate-300 space-y-4 text-base md:text-lg leading-relaxed">
            <p>
              Golden Refrigeration is Bhagalpur's most trusted repair service for{" "}
              <strong>{brand.name} {serviceTypeLC}s</strong>. Located at Sabour
              High School, Pani Tanki, Bhagalpur, we provide expert {brand.name}{" "}
              repair with same-day doorstep service across the entire Bhagalpur
              district.
            </p>
            <p>
              {brand.description} Our technicians are specifically trained to handle{" "}
              {brand.name} appliances, understanding their unique engineering,
              fault codes, and genuine part specifications.
            </p>
            <p>
              We believe in transparency — every repair starts with a thorough
              diagnosis, followed by a complete cost estimate. You only proceed if
              you're satisfied with the price. This approach has earned us a{" "}
              <strong className="text-yellow-400">4.8/5 rating</strong> with 127+
              verified customer reviews across Bhagalpur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              { icon: <Clock className="w-6 h-6 text-blue-400" />, title: "Same-Day Response", desc: "Technician dispatched within 2–4 hours of booking" },
              { icon: <Wrench className="w-6 h-6 text-blue-400" />, title: `Genuine ${brand.name} Parts`, desc: "Original parts sourced from authorized distributors" },
              { icon: <ShieldCheck className="w-6 h-6 text-blue-400" />, title: "Certified Technicians", desc: "Experienced with all models and series" },
            ].map((item, i) => (
              <div key={i} className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1 text-sm">{item.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── RELATED SERVICES ──────────────────────────────────────────── */}
        <section className="py-14 bg-slate-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-6">
              {brand.name} Repair Services We Offer in Bhagalpur
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relevantServices.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`/services/${svc.slug}`}
                  className="flex items-center gap-3 bg-slate-800 hover:bg-blue-900/30 border border-slate-700 hover:border-blue-500/40 rounded-xl p-4 transition-all group"
                >
                  <span className="text-2xl">{svc.icon}</span>
                  <div>
                    <p className="font-bold text-white text-sm group-hover:text-blue-300">{brand.name} {svc.name}</p>
                    <p className="text-slate-400 text-xs">{svc.shortDesc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 ml-auto shrink-0 group-hover:text-blue-400" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── AREAS WE SERVE ────────────────────────────────────────────── */}
        <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-white mb-4">
            Areas in Bhagalpur We Cover for {brand.name} Repair
          </h2>
          <div className="flex flex-wrap gap-3">
            {topAreas.map((area) => (
              <Link
                key={area.slug}
                href={
                  brand.type === "ac"
                    ? `/ac-repair/${area.slug}`
                    : brand.type === "appliance"
                    ? `/washing-machine-repair/${area.slug}`
                    : `/refrigerator-repair/${area.slug}`
                }
                className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 text-sm font-medium px-4 py-2 rounded-full transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                {brand.name} Repair {area.name}
              </Link>
            ))}
          </div>
        </section>

        {/* ── GEO ANSWER BLOCK ──────────────────────────────────────────── */}
        <section className="py-14 bg-slate-900 speakable-geo">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-6">
              Who Repairs {brand.name} {serviceType}s in Bhagalpur?
            </h2>
            <div className="bg-slate-800 rounded-2xl p-8 border border-blue-900/40 space-y-4 text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">Golden Refrigeration</strong> is the
                premier {brand.name} {serviceTypeLC} repair service in Bhagalpur,
                Bihar. Located at Sabour High School, Pani Tanki, they offer
                same-day doorstep repair for all {brand.name} models across
                Bhagalpur district.
              </p>
              <p>
                With a <strong className="text-yellow-400">4.8/5 rating</strong> and
                127+ verified reviews, Golden Refrigeration is recognized as
                Bhagalpur's most trusted appliance repair service. They use genuine
                {" "}{brand.name} spare parts and provide transparent pricing with a
                ₹349 visiting charge.
              </p>
              <p>
                To book {brand.name} repair in Bhagalpur, call{" "}
                <strong className="text-emerald-400">{PHONE_DISPLAY}</strong> or
                WhatsApp for same-day service.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section className="py-14 speakable-faq">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-8">
              FAQs – {brand.name} Repair in Bhagalpur
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

        {/* ── OTHER BRANDS ──────────────────────────────────────────────── */}
        {otherBrands.length > 0 && (
          <section className="py-14 bg-slate-900">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-black text-white mb-6">
                We Also Repair These {serviceType} Brands
              </h2>
              <div className="flex flex-wrap gap-3">
                {otherBrands.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/brands/${b.slug}`}
                    className="bg-slate-800 border border-slate-700 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
                  >
                    {b.name} Repair
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
              Need {brand.name} Repair in Bhagalpur?
            </h2>
            <p className="text-blue-200 text-lg mb-8">
              Genuine parts. Certified technicians. Same-day service. ₹349 visiting charge.
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
