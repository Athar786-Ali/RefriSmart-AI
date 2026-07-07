// frontend/src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

const SITE_URL = "https://www.goldenrefrigeration.in";
const BUSINESS_NAME = "Golden Refrigeration";
const PHONE = "+917070494254";
const ADDRESS = "Sabour High School, Pani Tanki Sabour, Bhagalpur, Bihar 813210, India";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Golden Refrigeration – #1 AC & Fridge Repair in Bhagalpur | ₹349 Visiting Charge",
    template: "%s | Golden Refrigeration Bhagalpur",
  },
  description:
    "Golden Refrigeration – Bhagalpur's most trusted appliance repair service since 2019. Expert AC repair, refrigerator repair, washing machine repair for LG, Samsung, Whirlpool, Voltas, Godrej, Haier, Daikin & all brands. Same-day certified technician at your doorstep. Visiting charge ₹349. Call +91 7070494254. Serving Sabour, Nathnagar, Barari, Adampur & all Bhagalpur areas.",
  keywords: [
    // Core service + city
    "AC repair Bhagalpur", "AC repair in Bhagalpur", "AC repair near me Bhagalpur",
    "refrigerator repair Bhagalpur", "fridge repair Bhagalpur", "fridge repair near me Bhagalpur",
    "washing machine repair Bhagalpur", "washing machine service Bhagalpur",
    "appliance repair Bhagalpur", "home appliance repair Bhagalpur",
    // Brand + fridge
    "Samsung refrigerator repair Bhagalpur", "LG fridge repair Bhagalpur",
    "Whirlpool refrigerator repair Bhagalpur", "Godrej fridge repair Bhagalpur",
    "Haier refrigerator repair Bhagalpur", "Voltas fridge repair Bhagalpur",
    "Panasonic refrigerator repair Bhagalpur", "Bosch fridge repair Bhagalpur",
    "IFB refrigerator repair Bhagalpur", "Blue Star fridge repair Bhagalpur",
    // Brand + AC
    "LG AC repair Bhagalpur", "Samsung AC repair Bhagalpur",
    "Voltas AC service Bhagalpur", "Daikin AC repair Bhagalpur",
    "Hitachi AC repair Bhagalpur", "Carrier AC service Bhagalpur",
    "Blue Star AC repair Bhagalpur", "Lloyd AC repair Bhagalpur",
    "Godrej AC service Bhagalpur", "Panasonic AC repair Bhagalpur",
    // Brand + washing machine
    "LG washing machine repair Bhagalpur", "Samsung washing machine service Bhagalpur",
    "Whirlpool washing machine repair Bhagalpur", "IFB washing machine repair Bhagalpur",
    "Bosch washing machine service Bhagalpur", "Haier washing machine repair Bhagalpur",
    // Service types
    "AC gas filling Bhagalpur", "AC gas refilling Bhagalpur",
    "split AC repair Bhagalpur", "window AC repair Bhagalpur",
    "AC installation Bhagalpur", "AC servicing Bhagalpur",
    "compressor repair Bhagalpur", "fridge compressor repair Bhagalpur",
    "refrigerator not cooling Bhagalpur", "fridge not cooling fix Bhagalpur",
    "AC not cooling Bhagalpur", "AC water leaking Bhagalpur",
    "washing machine not spinning Bhagalpur",
    // Area specific
    "AC repair Sabour", "fridge repair Sabour", "appliance repair Nathnagar",
    "AC repair Barari Bhagalpur", "appliance repair Adampur Bhagalpur",
    "AC repair Khalifabagh", "repair service Sultanganj",
    // Business
    "Golden Refrigeration Bhagalpur", "golden refrigeration Sabour",
    "same day repair Bhagalpur", "doorstep repair service Bhagalpur",
    "technician near me Bhagalpur", "certified technician Bhagalpur",
  ],
  authors: [{ name: BUSINESS_NAME }],
  creator: BUSINESS_NAME,
  publisher: BUSINESS_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: BUSINESS_NAME,
    title: "Golden Refrigeration – #1 AC & Fridge Repair in Bhagalpur | ₹349 Visiting Charge",
    description:
      "Bhagalpur's most trusted appliance repair service. AC repair, fridge repair & washing machine repair for ALL brands — LG, Samsung, Whirlpool, Voltas, Godrej & more. Same-day doorstep service. ₹349 visiting charge. Call +91 7070494254.",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: "Golden Refrigeration – Best Appliance Repair Service in Bhagalpur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Golden Refrigeration – AC & Fridge Repair in Bhagalpur | Same-Day Service",
    description:
      "Same-day doorstep repair for AC, refrigerator & washing machine in Bhagalpur. All brands. ₹349 visiting charge. Call +91 7070494254.",
    images: [`${SITE_URL}/logo.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // Paste your Google Search Console verification code here:
    // google: "YOUR_GOOGLE_VERIFICATION_CODE",
  },
  category: "Home Appliance Repair Service",
};

// ─── JSON-LD Schema: LocalBusiness (HomeAndConstructionBusiness) ───────────────
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
  "@id": `${SITE_URL}/#business`,
  name: BUSINESS_NAME,
  alternateName: [
    "Golden Refrigeration Bhagalpur",
    "Golden Refrigeration Sabour",
    "Golden Fridge Repair Bhagalpur",
  ],
  description:
    "Golden Refrigeration is Bhagalpur's most trusted appliance repair service. We provide expert AC repair, refrigerator repair, washing machine repair, and electronic appliance servicing for all brands including LG, Samsung, Whirlpool, Voltas, Godrej, Haier, Daikin, Hitachi, Carrier, Blue Star, and Lloyd. Same-day doorstep service with visiting charge ₹349.",
  url: SITE_URL,
  telephone: PHONE,
  priceRange: "₹349 – ₹8000",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI, GPay, PhonePe, Online Payment",
  image: `${SITE_URL}/logo.png`,
  logo: `${SITE_URL}/logo.png`,
  foundingDate: "2019",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Sabour High School, Pani Tanki Sabour",
    addressLocality: "Bhagalpur",
    addressRegion: "Bihar",
    postalCode: "813210",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "25.2417",
    longitude: "87.0765",
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
  hasMap: "https://maps.app.goo.gl/vJ8CDd8nTpkZBG4EA",
  sameAs: [
    "https://www.justdial.com/Bhagalpur/Golden-Refrigeration-Sabour-High-School-Sabour/9999PX641-X641-190522080859-E5V9_BZDET",
    "https://maps.app.goo.gl/vJ8CDd8nTpkZBG4EA",
  ],
  areaServed: [
    { "@type": "City", name: "Bhagalpur", containedInPlace: { "@type": "State", name: "Bihar" } },
    { "@type": "Place", name: "Sabour",        description: "PIN 813210" },
    { "@type": "Place", name: "Nathnagar",     description: "PIN 812002" },
    { "@type": "Place", name: "Barari",        description: "PIN 812001" },
    { "@type": "Place", name: "Adampur",       description: "PIN 812001" },
    { "@type": "Place", name: "Khalifabagh",   description: "PIN 812002" },
    { "@type": "Place", name: "Tatarpur",      description: "Bhagalpur" },
    { "@type": "Place", name: "Sultanganj",    description: "PIN 813213" },
    { "@type": "Place", name: "Kahalgaon",     description: "PIN 813214" },
    { "@type": "Place", name: "Naugachhia",    description: "PIN 853204" },
    { "@type": "Place", name: "Bihpur",        description: "PIN 853204" },
    { "@type": "Place", name: "Jagdishpur",    description: "PIN 812005" },
    { "@type": "Place", name: "Akbarnagar",    description: "PIN 813223" },
    { "@type": "Place", name: "Sahkund",       description: "PIN 813108" },
  ],
  // All services as individual Service schema nodes
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Appliance Repair & Service Catalog – Bhagalpur",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "AC Repair Bhagalpur",
          description: "Same-day split AC & window AC repair for all brands. Gas filling, PCB repair, compressor replacement. ₹349 visiting charge.",
          areaServed: "Bhagalpur, Bihar",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Refrigerator Repair Bhagalpur",
          description: "Expert fridge repair for LG, Samsung, Whirlpool, Godrej, Haier, Voltas, Bosch & all brands. Cooling issues, compressor, gas filling.",
          areaServed: "Bhagalpur, Bihar",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Washing Machine Repair Bhagalpur",
          description: "Top load & front load washing machine repair for LG, Samsung, Whirlpool, IFB, Bosch & all brands. Drum, motor, PCB repair.",
          areaServed: "Bhagalpur, Bihar",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "AC Gas Filling Bhagalpur",
          description: "R22, R32, R410A AC gas refilling for all split & window AC units in Bhagalpur. Certified technicians.",
          areaServed: "Bhagalpur, Bihar",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Refrigerator Gas Filling Bhagalpur",
          description: "R600a & R134a refrigerator gas refilling service for all fridge brands at your doorstep in Bhagalpur.",
          areaServed: "Bhagalpur, Bihar",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Compressor Repair & Replacement Bhagalpur",
          description: "AC and refrigerator compressor diagnosis, repair & replacement. All brands serviced at Bhagalpur.",
          areaServed: "Bhagalpur, Bihar",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "AC Installation Bhagalpur",
          description: "Professional split AC and window AC installation service at your home or office in Bhagalpur.",
          areaServed: "Bhagalpur, Bihar",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Microwave Oven Repair Bhagalpur",
          description: "Microwave oven repair for all brands. Heating element, PCB, door mechanism, and turntable repair.",
          areaServed: "Bhagalpur, Bihar",
        },
      },
    ],
  },
};

// ─── JSON-LD Schema: WebSite with SearchAction (Sitelinks Search Box) ─────────
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Golden Refrigeration",
  description: "AC repair, refrigerator repair & washing machine repair service in Bhagalpur, Bihar.",
  publisher: { "@id": `${SITE_URL}/#business` },
  inLanguage: "en-IN",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/service?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

// ─── JSON-LD Schema: FAQPage (12 high-intent Q&As) ────────────────────────────
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much does AC repair cost in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AC repair in Bhagalpur starts with a visiting charge of ₹349. The total cost depends on the issue — gas refill costs ₹1500–₹2500, PCB repair ₹800–₹2000, compressor replacement ₹3000–₹8000. Golden Refrigeration provides a transparent estimate before any repair.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer same-day AC repair service in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Golden Refrigeration offers same-day doorstep AC repair in Bhagalpur including Sabour, Nathnagar, Barari, Adampur, and Khalifabagh. Book online or call +91 7070494254.",
      },
    },
    {
      "@type": "Question",
      name: "Which refrigerator brands do you repair in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Golden Refrigeration repairs all refrigerator brands in Bhagalpur including Samsung, LG, Whirlpool, Godrej, Haier, Voltas, Bosch, IFB, Panasonic, Blue Star, and all other brands — single door, double door, and side-by-side models.",
      },
    },
    {
      "@type": "Question",
      name: "Which AC brands do you repair in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We repair all AC brands in Bhagalpur including LG, Samsung, Voltas, Daikin, Hitachi, Carrier, Blue Star, Lloyd, Godrej, Panasonic, O General, and more. Both split AC and window AC units are serviced.",
      },
    },
    {
      "@type": "Question",
      name: "Which washing machine brands do you service in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Golden Refrigeration services all washing machine brands in Bhagalpur — LG, Samsung, Whirlpool, IFB, Bosch, Haier, Godrej, Panasonic. Both top-load and front-load machines are repaired.",
      },
    },
    {
      "@type": "Question",
      name: "My fridge is not cooling — can you fix it in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Our certified technicians can fix refrigerators not cooling due to gas leaks, compressor failure, PCB faults, thermostat issues, or dirty condenser coils. We service all brands with same-day visits in Bhagalpur.",
      },
    },
    {
      "@type": "Question",
      name: "Do you provide AC gas filling in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Golden Refrigeration provides AC gas filling (R22, R32, R410A) for all split and window AC units in Bhagalpur at your doorstep. Call +91 7070494254 to book a gas refill appointment.",
      },
    },
    {
      "@type": "Question",
      name: "What areas of Bhagalpur do you serve?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We serve all Bhagalpur areas including Sabour (813210), Nathnagar (812002), Barari (812001), Adampur (812001), Khalifabagh (812002), Tatarpur, Jagdishpur (812005), Sultanganj (813213), Kahalgaon (813214), Naugachhia (853204), Bihpur, Sahkund (813108), and Akbarnagar (813223).",
      },
    },
    {
      "@type": "Question",
      name: "What is the visiting charge for home appliance repair in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The visiting charge for a certified technician at your home in Bhagalpur is ₹349. This covers the doorstep visit, on-site diagnosis, and a detailed cost estimate for the repair.",
      },
    },
    {
      "@type": "Question",
      name: "Can you repair a Samsung refrigerator in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Golden Refrigeration provides expert Samsung refrigerator repair service in Bhagalpur. We fix cooling problems, compressor issues, gas leaks, PCB faults, and ice-maker problems for all Samsung fridge models.",
      },
    },
    {
      "@type": "Question",
      name: "How do I book a washing machine repair technician in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can book a washing machine repair technician in Bhagalpur by visiting the Service page on our website, or by calling +91 7070494254 directly. We dispatch a certified technician the same day in most cases.",
      },
    },
    {
      "@type": "Question",
      name: "Does Golden Refrigeration sell refurbished appliances in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Golden Refrigeration sells certified refurbished and brand-new appliances in Bhagalpur — including ACs, refrigerators, and washing machines. All refurbished units are professionally tested with shop warranty. Visit our Products page to browse available stock.",
      },
    },
  ],
};

// ─── JSON-LD Schema: Service catalog (standalone, for rich results) ────────────
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Home Appliance Repair",
  name: "AC, Refrigerator & Washing Machine Repair Bhagalpur",
  description: "Professional repair service for all home appliances in Bhagalpur — AC, fridge, washing machine, microwave. All brands. Same-day doorstep visits.",
  provider: {
    "@type": "LocalBusiness",
    name: BUSINESS_NAME,
    telephone: PHONE,
    address: ADDRESS,
    url: SITE_URL,
  },
  areaServed: [
    { "@type": "City", name: "Bhagalpur", containedInPlace: { "@type": "State", name: "Bihar" } },
    { "@type": "Place", name: "Sabour" },
    { "@type": "Place", name: "Nathnagar" },
    { "@type": "Place", name: "Barari" },
    { "@type": "Place", name: "Sultanganj" },
    { "@type": "Place", name: "Kahalgaon" },
  ],
  offers: {
    "@type": "Offer",
    price: "349",
    priceCurrency: "INR",
    description: "Doorstep visiting charge includes on-site diagnosis and repair estimate",
    availability: "https://schema.org/InStock",
    validFrom: "2024-01-01",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        {/* JSON-LD Structured Data — invisible, SEO only */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,#eef3ff_45%,#f8fbff_100%)]">
        <AuthProvider>
          <Navbar />
          <div className="min-h-[80vh]">{children}</div>
          <Footer />
          <Toaster
            richColors
            closeButton
            position="top-right"
            toastOptions={{
              className: "border border-slate-200 bg-white text-slate-900",
            }}
          />
          <HotToaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
