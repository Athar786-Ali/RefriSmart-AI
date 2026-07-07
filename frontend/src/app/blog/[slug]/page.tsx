// frontend/src/app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, MessageCircle, ChevronRight, Clock, Tag } from "lucide-react";
import {
  SITE_URL,
  BUSINESS_NAME,
  PHONE,
  PHONE_DISPLAY,
  WHATSAPP_URL,
  BLOG_POSTS,
} from "@/lib/seo-config";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: `${post.title} | Golden Refrigeration Bhagalpur`,
    description: post.excerpt,
    keywords: [
      post.category.toLowerCase(),
      "appliance repair Bhagalpur",
      "Golden Refrigeration blog",
      post.slug.replace(/-/g, " "),
    ],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishDate,
      authors: [BUSINESS_NAME],
      images: [{ url: `${SITE_URL}/logo.png`, alt: post.title }],
    },
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
  };
}

// ─── Full Blog Content ────────────────────────────────────────────────────────
const blogContent: Record<string, { body: string[] }> = {
  "refrigerator-not-cooling-complete-guide": {
    body: [
      `## Why Is My Refrigerator Not Cooling?`,
      `A refrigerator that isn't cooling properly is one of the most common appliance problems in Bhagalpur households. This issue can stem from several causes — from something as simple as a dirty condenser coil to a serious compressor failure. Understanding the root cause is the first step to an effective repair.`,
      `## Common Causes of Refrigerator Not Cooling`,
      `**1. Refrigerant Gas Leak**\nThe most frequent cause of poor cooling is a refrigerant leak. Refrigerators use refrigerant gas (R-134a or R-600a) to transfer heat. If this gas leaks, the fridge loses its cooling capacity. Signs include: fridge running constantly without cooling, warm interior, or hissing sounds. Solution: Our technicians locate the leak, repair it, and recharge the gas to factory specifications.`,
      `**2. Dirty Condenser Coils**\nCondenser coils (usually at the back or bottom of the fridge) dissipate heat. When covered in dust and debris — common in Bhagalpur's dusty environment — they can't release heat efficiently. This forces the compressor to work harder and the fridge to under-cool. Solution: Professional coil cleaning restores efficiency and reduces electricity bills.`,
      `**3. Faulty Compressor**\nThe compressor is the heart of the refrigerator. If it fails to start, makes clicking noises, or runs but doesn't cool, you likely have a compressor problem. Signs: fridge running silently (no compressor hum) or clicking noise every few minutes. Compressor repair or replacement is a complex job requiring a certified technician.`,
      `**4. Defective Evaporator Fan**\nThe evaporator fan circulates cold air inside the refrigerator. If it fails, the fridge won't cool evenly. You may notice: one compartment cold, other warm; or no airflow from vents. Solution: Fan motor replacement, typically completed in 1–2 hours.`,
      `**5. PCB (Control Board) Failure**\nModern refrigerators have electronic control boards that manage temperature, defrost cycles, and compressor operation. A faulty PCB can cause erratic behavior or complete failure to cool. Solution: Board-level diagnostics and repair by a certified technician.`,
      `**6. Blocked Air Vents**\nIf items inside the fridge block the air vents (especially in the freezer compartment), cold air can't circulate. This causes warm spots. Solution: Rearrange food items and ensure vents are clear.`,
      `**7. Damaged Door Gasket/Seal**\nA worn or torn door gasket allows warm air to enter constantly. Signs: condensation on the outer edges, fridge running continuously, or visible cracks in the rubber seal. Solution: Door gasket replacement, a straightforward repair.`,
      `**8. Faulty Thermostat or Temperature Sensor**\nIf the thermostat fails, the fridge may not maintain the correct temperature. It may be too warm, too cold, or inconsistent. Solution: Thermostat calibration or replacement.`,
      `## When to Call a Professional in Bhagalpur`,
      `While some issues (like clearing blocked vents or cleaning coils) can be DIY fixes, most refrigerator cooling problems require a professional technician. In Bhagalpur, **Golden Refrigeration** provides expert fridge repair with same-day doorstep service. We carry genuine spare parts, refrigerant gas, and diagnostic tools to fix your fridge in a single visit.`,
      `## Refrigerator Repair Cost in Bhagalpur`,
      `The cost depends on the issue: gas filling costs ₹800–₹1,500, PCB repair ₹800–₹2,000, and compressor replacement ₹3,500–₹8,000. All repairs start with a ₹349 visiting charge and a transparent estimate — you only pay for what you approve.`,
      `## How to Book Fridge Repair in Bhagalpur`,
      `Call **+91 7070494254** or WhatsApp us to book a same-day refrigerator repair appointment anywhere in Bhagalpur — including Sabour, Nathnagar, Barari, Adampur, Tilkamanjhi, Tatarpur, Kahalgaon, Sultanganj, and 30+ other locations.`,
    ],
  },
  "ac-not-cooling-common-causes": {
    body: [
      `## AC Not Cooling in Bhagalpur? Here's Why`,
      `During Bihar's brutal summer months (April–July), a malfunctioning AC is a serious problem. When your AC runs but doesn't cool, there are several possible causes — and most can be fixed the same day by a certified technician from Golden Refrigeration in Bhagalpur.`,
      `## Top Reasons Your AC Is Not Cooling`,
      `**1. Low Refrigerant (Gas Leakage)**\nThe most common cause. AC refrigerant (R-22, R-32, or R-410A) is the substance that absorbs heat from your room. If it leaks, cooling efficiency drops dramatically. Signs: AC running but room stays warm, ice on outdoor unit pipes, hissing sounds. Solution: Leak detection, repair, and gas refilling by our certified technicians in Bhagalpur.`,
      `**2. Dirty Air Filter**\nA clogged filter restricts airflow, reducing cooling capacity significantly. Most homeowners in Bhagalpur don't know filters should be cleaned every month in heavy-use periods. Solution: Clean or replace the air filter — can prevent 30–40% efficiency loss.`,
      `**3. Frozen Evaporator Coil**\nIce buildup on the evaporator coil blocks heat absorption. Causes include dirty filters, low refrigerant, or poor airflow. Signs: reduced airflow, visible ice on indoor unit, water dripping. Solution: Defrosting the coil and fixing the root cause (usually low gas or dirty filter).`,
      `**4. Faulty Compressor**\nThe compressor is the engine of your AC. If it fails to start or runs weakly, cooling output drops. Signs: AC running but no cooling, outdoor unit silent, warm air from vents. Solution: Compressor diagnosis, repair, or replacement by a certified technician.`,
      `**5. Capacitor Failure**\nCapacitors start and run the compressor and fan motors. A bad capacitor can prevent the AC from starting or reduce its performance. Signs: AC struggling to start, humming noise, or shutting off quickly. Solution: Capacitor replacement — quick, affordable fix.`,
      `**6. Dirty Condenser Coil**\nThe outdoor unit's condenser coil releases heat outside. If it's dirty, heat can't escape, reducing cooling efficiency. In Bhagalpur's dusty conditions, this is common. Solution: Professional outdoor unit cleaning (jet washing of condenser coil).`,
      `**7. PCB or Control Board Failure**\nElectronic boards control all AC functions. A faulty board can cause erratic behavior or complete cooling failure. Solution: Board-level diagnostics and repair or replacement.`,
      `**8. Thermostat Problems**\nIf the thermostat fails, the AC may not cycle on/off at the right temperatures. Solution: Thermostat sensor inspection, cleaning, or replacement.`,
      `## AC Repair Cost in Bhagalpur`,
      `Gas refilling: ₹1,200–₹2,500. Capacitor: ₹300–₹700. PCB repair: ₹800–₹2,000. Compressor: ₹4,000–₹10,000. All starting with ₹349 visiting charge and transparent estimate.`,
      `## Book Same-Day AC Repair in Bhagalpur`,
      `Golden Refrigeration provides same-day AC repair across Bhagalpur — Sabour, Nathnagar, Barari, Adampur, Tilkamanjhi, and all 30+ service areas. Call **+91 7070494254** for immediate assistance.`,
    ],
  },
  "best-refrigerator-brands-india": {
    body: [
      `## Best Refrigerator Brands in India 2026 – A Bhagalpur Buyer's Guide`,
      `Choosing the right refrigerator for your home in Bhagalpur is an important decision. With brands like LG, Samsung, Whirlpool, Godrej, and Haier competing in the Indian market, it can be confusing. This guide, compiled by Golden Refrigeration's expert technicians who repair hundreds of refrigerators in Bhagalpur every year, will help you make an informed choice.`,
      `## 1. LG Refrigerators – Best Overall`,
      `LG consistently tops Indian refrigerator sales. Their Linear Compressor technology offers better efficiency, lower noise, and longer compressor life. LG's Door-in-Door and Smart Diagnosis features make them a premium choice. **Repairability in Bhagalpur**: LG parts are widely available, making repairs faster and more affordable. Our technicians in Bhagalpur are highly experienced with all LG models.`,
      `## 2. Samsung Refrigerators – Best for Technology`,
      `Samsung offers innovative features like Twin Cooling Plus (separate cooling for fridge and freezer), Digital Inverter Compressor, and SpaceMax technology for maximum storage. **Repairability**: Samsung boards and compressors are serviced regularly by our Bhagalpur technicians. Good parts availability.`,
      `## 3. Whirlpool Refrigerators – Best Value`,
      `Whirlpool offers reliable performance at competitive prices. Their Intellifresh technology maintains freshness longer, and their 6th Sense technology provides intelligent temperature control. **Repairability**: Whirlpool parts are commonly stocked by our Bhagalpur workshop. Affordable repair costs.`,
      `## 4. Godrej Refrigerators – Best for Indian Conditions`,
      `Godrej refrigerators are specifically designed for Indian conditions — handling voltage fluctuations and high ambient temperatures better than most imports. Their Cool Shower technology and hard steel doors make them durable. **Repairability**: As an Indian brand, Godrej parts are easily available in Bhagalpur.`,
      `## 5. Haier Refrigerators – Best Budget-Friendly`,
      `Haier offers Twin Inverter technology and Antibacterial features at competitive prices. Their deep cooling and 4-star energy ratings make them an excellent value choice. **Repairability**: Haier is growing rapidly in Bhagalpur, and parts are increasingly available.`,
      `## Which Brand is Easiest to Repair in Bhagalpur?`,
      `From our experience repairing hundreds of refrigerators across Bhagalpur, LG and Whirlpool offer the easiest and most affordable repair experience — parts are widely available and well-documented. Samsung follows closely. Bosch and Panasonic, while excellent appliances, can have longer part sourcing times.`,
      `## Bottom Line`,
      `For Bhagalpur households, we recommend LG (best overall), Whirlpool (best value), or Godrej (most India-friendly). Whatever brand you choose, Golden Refrigeration is here to repair it. Call **+91 7070494254** for same-day refrigerator service in Bhagalpur.`,
    ],
  },
  "how-often-should-ac-be-serviced": {
    body: [
      `## How Often Should Your AC Be Serviced? A Complete Guide for Bhagalpur`,
      `Air conditioning maintenance is often neglected until the AC breaks down completely — usually on the hottest day of summer. Understanding the right service schedule can save you significant money on repairs and electricity bills, especially in Bhagalpur's demanding climate.`,
      `## Recommended AC Servicing Schedule`,
      `**Every Month (Heavy Use Period):**\nDuring April–July in Bhagalpur, clean or replace the air filter monthly. A clogged filter is responsible for 30–40% efficiency loss and can cause the AC to freeze or stop cooling.`,
      `**Every 3 Months (Quarterly):**\nProfessional cleaning of indoor unit coils, fan blades, and drain pan. Check refrigerant levels, electrical connections, and thermostat calibration.`,
      `**Every 6 Months (Bi-Annual):**\nComplete service including outdoor unit (condenser coil) cleaning, compressor efficiency check, gas pressure verification, and electrical component inspection.`,
      `**Annually (Before Summer):**\nFull AC health check — gas level, compressor performance, capacitor condition, PCB diagnosis, and all connections. Annual servicing in March (before summer) prevents breakdown during peak need.`,
      `## Why Regular AC Servicing Matters`,
      `1. **Energy Savings**: A well-serviced AC uses 15–25% less electricity. In Bhagalpur's 5–6 months of heavy AC use, this translates to significant savings on your electricity bill.\n2. **Longer Lifespan**: Regular maintenance extends AC life by 3–5 years.\n3. **Prevents Major Breakdowns**: Small issues caught early prevent costly repairs.\n4. **Better Air Quality**: Clean filters and coils mean healthier indoor air.`,
      `## Cost of AC Servicing in Bhagalpur`,
      `Basic AC cleaning and service: ₹400–₹800. Full annual service with gas check: ₹800–₹1,500. Annual maintenance contract (2 services + priority support): ₹1,500–₹2,500 per AC unit.`,
      `## Book AC Service in Bhagalpur`,
      `Golden Refrigeration offers AC servicing across all Bhagalpur areas including Sabour, Nathnagar, Barari, Adampur, and 30+ locations. Call **+91 7070494254** to schedule your service.`,
    ],
  },
  "refrigerator-compressor-problems": {
    body: [
      `## Refrigerator Compressor Problems: Complete Guide for Bhagalpur`,
      `The compressor is the heart of your refrigerator. Without a working compressor, the fridge simply cannot cool. Compressor problems are one of the most serious (and most costly) refrigerator issues. This guide helps you identify compressor problems early and understand your repair options in Bhagalpur.`,
      `## What Does a Refrigerator Compressor Do?`,
      `The compressor pumps refrigerant gas through the cooling system, compressing it from low pressure to high pressure. This compression cycle is what enables heat to be removed from inside the fridge and released outside. Without it, there's no cooling.`,
      `## Warning Signs of Compressor Failure`,
      `**1. Clicking or Buzzing Sound**: The compressor is trying to start but failing. This is often caused by a faulty start relay or capacitor — which are inexpensive fixes. If the compressor itself is failed, clicking continues until the thermal protector shuts it down.\n**2. Fridge Not Cooling at All**: If the fridge is completely warm and the compressor is silent, it may have failed.\n**3. Fridge Running Constantly**: If the compressor runs non-stop without reaching the set temperature, it may be weak (worn compressor or low gas).\n**4. Warm Compressor to the Touch**: While compressors do get warm, an unusually hot compressor indicates overheating — possibly due to bad ventilation, dirty coils, or an overworked motor.\n**5. High Electricity Bills**: A struggling compressor draws more power while delivering less cooling.`,
      `## Is Compressor Repair or Replacement Better?`,
      `**Repair (Overhaul)**: For relatively new refrigerators (under 5 years old) with specific compressor faults, a rebuild or internal repair may be cost-effective (₹2,000–₹4,500). **Replacement**: If the compressor has completely failed and the fridge is over 7 years old, replacement may make more sense (₹3,500–₹8,000 including labor). Our technicians in Bhagalpur evaluate both options and recommend the most cost-effective solution.`,
      `## Compressor Repair Cost in Bhagalpur`,
      `Start relay replacement: ₹300–₹600. Compressor overhaul: ₹2,000–₹4,500. New compressor installation: ₹3,500–₹8,000 (depending on brand and model). All with transparent pricing and ₹349 visiting charge.`,
      `## Emergency Compressor Repair in Bhagalpur`,
      `If your fridge compressor has failed, call Golden Refrigeration at **+91 7070494254** for same-day diagnosis. We serve all Bhagalpur areas with emergency repair services.`,
    ],
  },
  "ac-gas-leakage-signs": {
    body: [
      `## AC Gas Leakage: Warning Signs, Causes & Repair in Bhagalpur`,
      `AC gas (refrigerant) leakage is one of the most common causes of poor cooling in Bhagalpur. As ACs age, fittings can loosen and coils can develop micro-cracks, allowing refrigerant to escape. Understanding the warning signs can save you from costly compressor damage caused by running an AC with low gas.`,
      `## Warning Signs of AC Gas Leakage`,
      `**1. AC Running But Not Cooling**: The most obvious sign. If the AC runs continuously but the room doesn't reach the set temperature, low gas is likely.\n**2. Ice Formation on Pipes**: When refrigerant is low, the pressure drops and ice forms on the evaporator coil or suction line outside. You may notice ice on the copper pipes.\n**3. Hissing or Bubbling Sound**: Sometimes a leak is large enough to produce a hissing sound near the refrigerant connections.\n**4. Higher Electricity Bills**: Low refrigerant forces the compressor to work harder, increasing power consumption.\n**5. Warm Air from Vents**: Instead of cold air, the AC blows room-temperature or slightly cool air.\n**6. Increased Humidity Inside**: Gas-deficient ACs struggle to dehumidify the air, making the room feel muggy.`,
      `## Why AC Gas Leaks Are Dangerous`,
      `Beyond just poor cooling, running your AC with low refrigerant can permanently damage the compressor — an expensive component costing ₹4,000–₹10,000 to replace. If you notice any of the warning signs above, stop running the AC and call for professional service immediately.`,
      `## What to Expect During AC Gas Leak Repair in Bhagalpur`,
      `1. **Leak Detection**: Our technician uses electronic leak detectors and UV dye to find the exact location of the leak.\n2. **Leak Repair**: The leak point is repaired using silver brazing or sealant, depending on location and severity.\n3. **Vacuum Test**: The system is evacuated to remove moisture and air.\n4. **Gas Refilling**: Refrigerant (R-22, R-32, or R-410A as appropriate) is recharged to the manufacturer-specified pressure.\n5. **Performance Test**: The AC is run to verify proper cooling.`,
      `## AC Gas Refilling Cost in Bhagalpur`,
      `R-22 gas refilling: ₹1,200–₹1,800. R-32 or R-410A gas refilling: ₹1,500–₹2,500. Leak detection and repair (additional): ₹300–₹800. Golden Refrigeration offers transparent pricing with ₹349 visiting charge.`,
      `## Book AC Gas Refilling in Bhagalpur`,
      `Golden Refrigeration provides AC gas refilling across all Bhagalpur areas — Sabour, Nathnagar, Barari, Adampur, Tilkamanjhi, and 30+ locations. Call **+91 7070494254** for same-day service.`,
    ],
  },
  "refrigerator-repair-cost-bhagalpur": {
    body: [
      `## Refrigerator Repair Cost in Bhagalpur – Complete Price List 2026`,
      `One of the most common questions we receive at Golden Refrigeration is: "How much will my fridge repair cost?" We believe in complete transparency, so here is our comprehensive refrigerator repair cost guide for Bhagalpur, Bihar.`,
      `## Visiting Charge – ₹349`,
      `All our refrigerator repair calls begin with a ₹349 visiting charge. This covers the technician's transport to your location anywhere in Bhagalpur and a thorough diagnosis of the problem. If you proceed with the repair, this charge is included in the overall service cost.`,
      `## Refrigerant Gas Filling Cost in Bhagalpur`,
      `**R-134a Gas Refilling**: ₹800–₹1,200 (most common in double-door and single-door fridges)\n**R-600a Gas Refilling**: ₹1,000–₹1,500 (newer, more efficient fridges)\nNote: If there's a leak, leak detection and repair adds ₹300–₹600 to the above.`,
      `## Compressor Repair/Replacement Cost in Bhagalpur`,
      `**Start Relay Replacement**: ₹300–₹600 (often mistaken for compressor failure)\n**Capacitor Replacement**: ₹400–₹800\n**Compressor Overhaul**: ₹2,000–₹4,500\n**New Compressor Installation**: ₹3,500–₹8,000 (depending on brand and model)`,
      `## PCB and Electronic Repair Cost`,
      `**PCB/Control Board Repair**: ₹800–₹2,000\n**PCB Replacement**: ₹1,500–₹3,500\n**Temperature Sensor Replacement**: ₹300–₹700\n**Thermostat Replacement**: ₹400–₹800`,
      `## Mechanical Repair Costs`,
      `**Fan Motor Replacement**: ₹600–₹1,200\n**Defrost Heater Replacement**: ₹500–₹900\n**Defrost Timer Replacement**: ₹400–₹700\n**Door Gasket/Seal Replacement**: ₹300–₹600\n**Drain Pan Replacement**: ₹400–₹800`,
      `## Factors That Affect Repair Cost`,
      `1. **Brand**: Premium brands (Bosch, Panasonic) may have higher part costs than domestic brands (Godrej, Videocon).\n2. **Model Age**: Older models may have harder-to-source parts.\n3. **Type**: Side-by-side and French door fridges have more components and can cost more to repair.\n4. **Complexity**: PCB failures and compressor replacements are more labor-intensive than simple gas fills.`,
      `## Why Choose Golden Refrigeration in Bhagalpur?`,
      `✅ No hidden charges — all costs disclosed upfront\n✅ Same-day service across 30+ Bhagalpur areas\n✅ Genuine spare parts — no cheap alternatives\n✅ 4.8/5 rating with 127+ verified reviews\n✅ ₹349 flat visiting charge\n\nCall **+91 7070494254** to book your refrigerator repair in Bhagalpur today.`,
    ],
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  const content = blogContent[slug];
  if (!content) notFound();

  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Organization", name: BUSINESS_NAME },
    publisher: {
      "@type": "Organization",
      name: BUSINESS_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    url: `${SITE_URL}/blog/${slug}`,
    image: `${SITE_URL}/logo.png`,
    mainEntityOfPage: `${SITE_URL}/blog/${slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="min-h-screen bg-slate-950 text-white pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/blog" className="hover:text-blue-400 transition-colors">Blog</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-300 truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold px-3 py-1 rounded-full border bg-blue-500/20 text-blue-300 border-blue-500/30">
                <Tag className="w-3 h-3 inline mr-1" />
                {post.category}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(post.publishDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-5">
              {post.title}
            </h1>

            <p className="text-slate-300 text-lg leading-relaxed italic border-l-4 border-blue-500 pl-5">
              {post.excerpt}
            </p>
          </div>

          {/* Article Body */}
          <article className="prose prose-invert prose-lg max-w-none">
            {content.body.map((block, i) => {
              if (block.startsWith("## ")) {
                return (
                  <h2 key={i} className="text-2xl font-black text-white mt-10 mb-4">
                    {block.replace("## ", "")}
                  </h2>
                );
              }
              if (block.startsWith("**") && block.includes("**:")) {
                const [boldPart, ...rest] = block.split("**:");
                const title = boldPart.replace("**", "");
                const bodyText = rest.join("").trim();
                return (
                  <div key={i} className="mb-6 bg-slate-900 rounded-2xl p-6 border border-slate-800">
                    <h3 className="text-lg font-bold text-blue-300 mb-2">{title}</h3>
                    <p className="text-slate-300 text-base leading-relaxed">{bodyText}</p>
                  </div>
                );
              }
              return (
                <p key={i} className="text-slate-300 text-base leading-relaxed mb-5 whitespace-pre-line">
                  {block.replace(/\*\*(.*?)\*\*/g, "$1")}
                </p>
              );
            })}
          </article>

          {/* Author Box */}
          <div className="mt-14 bg-slate-900 rounded-3xl p-8 border border-slate-800 flex gap-6 items-start">
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-black text-white">
              GR
            </div>
            <div>
              <p className="font-black text-white text-lg mb-1">Golden Refrigeration</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Bhagalpur's most trusted appliance repair service. Located at Sabour High
                School, Pani Tanki, Sabour, Bhagalpur – 813210. Serving 30+ areas across
                Bhagalpur district with same-day doorstep repair.
              </p>
              <div className="flex gap-3 mt-4">
                <a href={`tel:${PHONE}`} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold px-4 py-2 rounded-full transition-all">
                  <Phone className="w-4 h-4" /> Call Now
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366] text-white text-sm font-bold px-4 py-2 rounded-full transition-all">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* More Articles */}
          <div className="mt-14">
            <h2 className="text-2xl font-black text-white mb-6">More Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {otherPosts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 transition-all"
                >
                  <span className="text-xs text-slate-500">{p.category}</span>
                  <p className="font-bold text-white text-sm mt-2 mb-3 group-hover:text-blue-300 transition-colors leading-snug">
                    {p.title}
                  </p>
                  <span className="text-cyan-400 text-xs font-semibold">Read →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
