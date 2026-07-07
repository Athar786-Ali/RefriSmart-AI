// src/lib/seo-config.ts
// ─── Central SEO Configuration for Golden Refrigeration ───────────────────────
// Update SITE_URL here to propagate across all pages instantly.

export const SITE_URL = "https://www.goldenrefrigeration.in";
export const BUSINESS_NAME = "Golden Refrigeration";
export const PHONE = "+917070494254";
export const PHONE_DISPLAY = "+91 7070494254";
export const WHATSAPP = "917070494254";
export const WHATSAPP_URL = `https://wa.me/917070494254?text=Hello%2C%20I%20need%20appliance%20repair%20service%20in%20Bhagalpur.`;
export const ADDRESS = "Sabour High School, Pani Tanki Sabour, Bhagalpur, Bihar 813210, India";
export const ADDRESS_SHORT = "Sabour High School, Pani Tanki, Sabour";
export const CITY = "Bhagalpur";
export const STATE = "Bihar";
export const PIN = "813210";
export const LAT = "25.2417";
export const LNG = "87.0765";
export const JUSTDIAL_URL =
  "https://www.justdial.com/Bhagalpur/Golden-Refrigeration-Sabour-High-School-Sabour/9999PX641-X641-190522080859-E5V9_BZDET";
export const MAPS_URL = "https://maps.app.goo.gl/vJ8CDd8nTpkZBG4EA";
export const GSTIN = "10EFRPM9155N1ZQ";

// ─── Target Service Areas ─────────────────────────────────────────────────────
export const TARGET_AREAS = [
  { name: "Sabour", slug: "sabour", pin: "813210" },
  { name: "Goradih", slug: "goradih", pin: "813210" },
  { name: "Hatt Road", slug: "hatt-road", pin: "812002" },
  { name: "Tilkamanjhi", slug: "tilkamanjhi", pin: "812001" },
  { name: "Barari", slug: "barari", pin: "812001" },
  { name: "Adampur", slug: "adampur", pin: "812001" },
  { name: "Nathnagar", slug: "nathnagar", pin: "812002" },
  { name: "Tatarpur", slug: "tatarpur", pin: "812002" },
  { name: "Khanjarpur", slug: "khanjarpur", pin: "812002" },
  { name: "Aliganj", slug: "aliganj", pin: "812002" },
  { name: "Champanagar", slug: "champanagar", pin: "812002" },
  { name: "Bhikhanpur", slug: "bhikhanpur", pin: "812002" },
  { name: "Zero Mile", slug: "zero-mile", pin: "812001" },
  { name: "Naugachia", slug: "naugachia", pin: "853204" },
  { name: "Kahalgaon", slug: "kahalgaon", pin: "813214" },
  { name: "Sultanganj", slug: "sultanganj", pin: "813222" },
  { name: "Jagdishpur", slug: "jagdishpur", pin: "812005" },
  { name: "Pirpainti", slug: "pirpainti", pin: "813214" },
  { name: "Bihpur", slug: "bihpur", pin: "853204" },
  { name: "Narayanpur", slug: "narayanpur", pin: "813210" },
  { name: "Rangra", slug: "rangra", pin: "813210" },
  { name: "Gopalpur", slug: "gopalpur", pin: "813210" },
  { name: "Sanhaula", slug: "sanhaula", pin: "813210" },
  { name: "Lodipur", slug: "lodipur", pin: "812002" },
  { name: "Habibpur", slug: "habibpur", pin: "812002" },
  { name: "Mirjanhat", slug: "mirjanhat", pin: "813210" },
  { name: "Mundichak", slug: "mundichak", pin: "813210" },
  { name: "University Area", slug: "university-area", pin: "813210" },
  { name: "Engineering College Area", slug: "engineering-college-area", pin: "813210" },
  { name: "Bhagalpur Station Area", slug: "bhagalpur-station-area", pin: "812001" },
] as const;

export type AreaSlug = (typeof TARGET_AREAS)[number]["slug"];

// ─── Brand Targets ────────────────────────────────────────────────────────────
export const BRANDS = [
  {
    name: "Samsung",
    slug: "samsung",
    type: "refrigerator" as const,
    tagline: "Samsung Refrigerator & AC Repair",
    description:
      "Samsung refrigerators and ACs are known for their digital inverter technology and Twin Cooling Plus systems. Our technicians are trained to handle all Samsung models including single-door, double-door, French door, and side-by-side refrigerators.",
  },
  {
    name: "LG",
    slug: "lg",
    type: "refrigerator" as const,
    tagline: "LG Refrigerator & AC Repair",
    description:
      "LG appliances feature Linear Compressor technology and Door-in-Door innovation. We expertly repair all LG refrigerators, ACs, and washing machines in Bhagalpur, covering all models from single-door to multi-door inverter units.",
  },
  {
    name: "Whirlpool",
    slug: "whirlpool",
    type: "refrigerator" as const,
    tagline: "Whirlpool Refrigerator Repair",
    description:
      "Whirlpool is a trusted brand for Indian households. Our technicians handle all Whirlpool refrigerator models including Intellifresh, Pro 355, and Protemp Elite series with original spare parts.",
  },
  {
    name: "Godrej",
    slug: "godrej",
    type: "refrigerator" as const,
    tagline: "Godrej Refrigerator Repair",
    description:
      "Godrej refrigerators are built for Indian conditions with features like Cool Shower technology and UV protection. We service all Godrej fridge models across Bhagalpur and surrounding districts.",
  },
  {
    name: "Haier",
    slug: "haier",
    type: "refrigerator" as const,
    tagline: "Haier Refrigerator Repair",
    description:
      "Haier offers innovative refrigerators with twin inverter technology and antibacterial features. Our expert team repairs Haier single-door, double-door, and multi-door refrigerators in Bhagalpur.",
  },
  {
    name: "Panasonic",
    slug: "panasonic",
    type: "refrigerator" as const,
    tagline: "Panasonic Refrigerator Repair",
    description:
      "Panasonic refrigerators feature ECONAVI technology and nanoe™ technology for freshness. We provide professional repair services for all Panasonic fridge models in Bhagalpur.",
  },
  {
    name: "Bosch",
    slug: "bosch",
    type: "refrigerator" as const,
    tagline: "Bosch Refrigerator Repair",
    description:
      "Bosch refrigerators are premium German-engineered appliances with VitaFresh and NoFrost technology. Our certified technicians expertly service all Bosch refrigerator models in Bhagalpur.",
  },
  {
    name: "IFB",
    slug: "ifb",
    type: "appliance" as const,
    tagline: "IFB Washing Machine & Appliance Repair",
    description:
      "IFB is India's leading washing machine brand with advanced features like Aqua Energie and 3D Wash System. We provide expert IFB washing machine and appliance repair services across Bhagalpur.",
  },
  {
    name: "Voltas",
    slug: "voltas",
    type: "ac" as const,
    tagline: "Voltas AC Repair & Service",
    description:
      "Voltas is India's #1 AC brand. Our technicians service all Voltas AC models — Split, Window, Cassette, and Tower ACs — across Bhagalpur with genuine spare parts and gas refilling.",
  },
  {
    name: "Blue Star",
    slug: "blue-star",
    type: "ac" as const,
    tagline: "Blue Star AC Repair & Service",
    description:
      "Blue Star ACs are trusted by businesses and homes across India. We provide expert Blue Star AC repair, gas filling, installation, and maintenance services throughout Bhagalpur district.",
  },
  {
    name: "Daikin",
    slug: "daikin",
    type: "ac" as const,
    tagline: "Daikin AC Repair & Service",
    description:
      "Daikin is a global leader in HVAC technology. Our technicians handle all Daikin inverter and non-inverter AC repairs, including PCB replacement, gas refilling, and compressor repair in Bhagalpur.",
  },
  {
    name: "Hitachi",
    slug: "hitachi",
    type: "ac" as const,
    tagline: "Hitachi AC Repair & Service",
    description:
      "Hitachi ACs feature advanced technologies like Frost Wash and Tropical Inverter. We provide comprehensive Hitachi AC repair and maintenance services across Bhagalpur and surrounding areas.",
  },
  {
    name: "Carrier",
    slug: "carrier",
    type: "ac" as const,
    tagline: "Carrier AC Repair & Service",
    description:
      "Carrier invented modern air conditioning and continues to lead in innovation. We service all Carrier AC models including split ACs, window units, and multi-split systems across Bhagalpur.",
  },
  {
    name: "Lloyd",
    slug: "lloyd",
    type: "ac" as const,
    tagline: "Lloyd AC Repair & Service",
    description:
      "Lloyd ACs offer reliable cooling at an affordable price point. Our expert team repairs all Lloyd AC models, handles gas refilling, and provides installation services across Bhagalpur district.",
  },
] as const;

export type BrandSlug = (typeof BRANDS)[number]["slug"];

// ─── Service Types ────────────────────────────────────────────────────────────
export const SERVICES = [
  {
    name: "AC Repair",
    slug: "ac-repair",
    category: "AC",
    shortDesc: "Expert AC repair for all brands & models. Same-day doorstep service in Bhagalpur.",
    icon: "❄️",
  },
  {
    name: "Refrigerator Repair",
    slug: "refrigerator-repair",
    category: "Refrigerator",
    shortDesc: "Compressor, PCB, gas, and thermostat repair for all fridge types in Bhagalpur.",
    icon: "🧊",
  },
  {
    name: "Refrigerator Gas Filling",
    slug: "refrigerator-gas-filling",
    category: "Refrigerator",
    shortDesc: "Professional refrigerant gas filling (R-134a, R-600a) for all refrigerator models.",
    icon: "💨",
  },
  {
    name: "AC Gas Refilling",
    slug: "ac-gas-refilling",
    category: "AC",
    shortDesc: "AC refrigerant gas refilling (R-22, R-32, R-410A) with leak detection service.",
    icon: "🌬️",
  },
  {
    name: "Washing Machine Repair",
    slug: "washing-machine-repair",
    category: "Washing Machine",
    shortDesc: "Top load and front load washing machine repair in Bhagalpur. All brands covered.",
    icon: "🌀",
  },
  {
    name: "Compressor Repair",
    slug: "compressor-repair",
    category: "Refrigerator",
    shortDesc: "Compressor diagnosis, repair, and replacement for AC and refrigerators in Bhagalpur.",
    icon: "⚙️",
  },
  {
    name: "AC Installation",
    slug: "ac-installation",
    category: "AC",
    shortDesc: "Professional split and window AC installation with piping and electrical work.",
    icon: "🔧",
  },
  {
    name: "Split AC Repair",
    slug: "split-ac-repair",
    category: "AC",
    shortDesc: "Complete split AC repair — indoor unit, outdoor unit, PCB, and refrigerant issues.",
    icon: "🏠",
  },
  {
    name: "Window AC Repair",
    slug: "window-ac-repair",
    category: "AC",
    shortDesc: "Window AC repair, cleaning, gas filling, and thermostat replacement in Bhagalpur.",
    icon: "🪟",
  },
  {
    name: "Deep Freezer Repair",
    slug: "deep-freezer-repair",
    category: "Refrigerator",
    shortDesc: "Commercial and domestic deep freezer repair, gas filling, and thermostat service.",
    icon: "🧊",
  },
  {
    name: "Microwave Repair",
    slug: "microwave-repair",
    category: "Electronics",
    shortDesc: "Microwave oven repair for all brands — magnetron, turntable, control board fixes.",
    icon: "📻",
  },
  {
    name: "Front Load Washing Machine Repair",
    slug: "front-load-washing-machine-repair",
    category: "Washing Machine",
    shortDesc: "Front load drum, bearing, motor, and PCB repair for all brands in Bhagalpur.",
    icon: "🔄",
  },
  {
    name: "Top Load Washing Machine Repair",
    slug: "top-load-washing-machine-repair",
    category: "Washing Machine",
    shortDesc: "Top load agitator, pump, lid switch, and control board repair across Bhagalpur.",
    icon: "⬆️",
  },
  {
    name: "AC Maintenance",
    slug: "ac-maintenance",
    category: "AC",
    shortDesc: "Annual AC servicing, deep cleaning, filter replacement, and performance check.",
    icon: "✅",
  },
  {
    name: "Electronic Appliance Repair",
    slug: "electronic-appliance-repair",
    category: "Electronics",
    shortDesc: "Logic board, PCB, and technical repair for all electronic home appliances.",
    icon: "⚡",
  },
] as const;

export type ServiceSlug = (typeof SERVICES)[number]["slug"];

// ─── Blog Posts ───────────────────────────────────────────────────────────────
export const BLOG_POSTS = [
  {
    title: "Refrigerator Not Cooling? Complete Troubleshooting Guide",
    slug: "refrigerator-not-cooling-complete-guide",
    excerpt:
      "Is your refrigerator not cooling properly? Learn the most common causes and how expert technicians in Bhagalpur diagnose and fix them fast.",
    publishDate: "2026-06-01",
    category: "Refrigerator",
  },
  {
    title: "AC Not Cooling? Common Causes & Expert Fixes in Bhagalpur",
    slug: "ac-not-cooling-common-causes",
    excerpt:
      "AC not cooling despite running? Discover the top reasons ACs lose cooling efficiency and how Golden Refrigeration fixes them same-day in Bhagalpur.",
    publishDate: "2026-06-05",
    category: "AC",
  },
  {
    title: "Best Refrigerator Brands in India 2026 – Buyer's Guide",
    slug: "best-refrigerator-brands-india",
    excerpt:
      "Comparing Samsung, LG, Whirlpool, Godrej, and Haier refrigerators for Indian households. Which brand is most repair-friendly in Bhagalpur?",
    publishDate: "2026-06-10",
    category: "Buying Guide",
  },
  {
    title: "How Often Should Your AC Be Serviced? A Complete Guide",
    slug: "how-often-should-ac-be-serviced",
    excerpt:
      "Learn the recommended AC servicing schedule to maintain performance, reduce electricity bills, and extend the life of your air conditioner in Bihar's climate.",
    publishDate: "2026-06-15",
    category: "AC",
  },
  {
    title: "Refrigerator Compressor Problems: Signs, Causes & Solutions",
    slug: "refrigerator-compressor-problems",
    excerpt:
      "Compressor is the heart of your fridge. Learn warning signs of compressor failure, repair options, and when to replace it — with Bhagalpur pricing.",
    publishDate: "2026-06-20",
    category: "Refrigerator",
  },
  {
    title: "AC Gas Leakage: Signs, Dangers & Repair in Bhagalpur",
    slug: "ac-gas-leakage-signs",
    excerpt:
      "AC refrigerant leaks reduce cooling and can be harmful. Identify the warning signs early and learn how Golden Refrigeration handles gas leak repairs across Bhagalpur.",
    publishDate: "2026-06-25",
    category: "AC",
  },
  {
    title: "Refrigerator Repair Cost in Bhagalpur – Complete Price List 2026",
    slug: "refrigerator-repair-cost-bhagalpur",
    excerpt:
      "Transparent pricing for refrigerator repair in Bhagalpur — gas filling, compressor replacement, PCB repair, thermostat, and more. No hidden charges.",
    publishDate: "2026-07-01",
    category: "Pricing",
  },
] as const;

export type BlogSlug = (typeof BLOG_POSTS)[number]["slug"];

// ─── Helper: All area names as string array ───────────────────────────────────
export const ALL_AREA_NAMES = TARGET_AREAS.map((a) => a.name);

// ─── Helper: Generate local business schema ───────────────────────────────────
export function buildLocalBusinessSchema(overrides?: {
  name?: string;
  url?: string;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
    "@id": `${SITE_URL}/#business`,
    name: overrides?.name ?? BUSINESS_NAME,
    alternateName: "Golden Refrigeration Bhagalpur",
    description:
      overrides?.description ??
      "Golden Refrigeration is Bhagalpur's most trusted appliance repair service. Expert AC repair, refrigerator repair, washing machine repair & installation at your doorstep with same-day certified technician visits.",
    url: overrides?.url ?? SITE_URL,
    telephone: PHONE,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Google Pay, PhonePe, Online Payment",
    image: `${SITE_URL}/logo.png`,
    logo: `${SITE_URL}/logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sabour High School, Pani Tanki Sabour",
      addressLocality: "Bhagalpur",
      addressRegion: "Bihar",
      postalCode: PIN,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: LAT,
      longitude: LNG,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "08:00",
        closes: "20:00",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
    hasMap: MAPS_URL,
    sameAs: [JUSTDIAL_URL, MAPS_URL],
    areaServed: TARGET_AREAS.map((a) => ({
      "@type": "Place",
      name: `${a.name}, Bhagalpur, Bihar`,
    })),
    serviceType: [
      "AC Repair",
      "Air Conditioner Installation",
      "AC Gas Filling",
      "Refrigerator Repair",
      "Refrigerator Gas Filling",
      "Compressor Repair",
      "Washing Machine Repair",
      "Microwave Oven Repair",
      "Deep Freezer Repair",
      "Electronic Appliance Repair",
      "Split AC Repair",
      "Window AC Repair",
    ],
    knowsAbout: BRANDS.map((b) => `${b.name} ${b.type === "ac" ? "AC" : "Refrigerator"} Repair Bhagalpur`),
  };
}
