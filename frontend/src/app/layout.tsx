// frontend/src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import {
  SITE_URL,
  BUSINESS_NAME,
  PHONE,
  PHONE_DISPLAY,
  ADDRESS,
  PIN,
  LAT,
  LNG,
  MAPS_URL,
  JUSTDIAL_URL,
  TARGET_AREAS,
  BRANDS,
  SERVICES,
  buildLocalBusinessSchema,
} from "@/lib/seo-config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Golden Refrigeration – AC & Fridge Repair in Bhagalpur | Same-Day Service",
    template: "%s | Golden Refrigeration Bhagalpur",
  },
  description:
    "Bhagalpur's most trusted appliance repair service. Expert AC repair, refrigerator repair, washing machine repair & installation at your doorstep. Same-day certified technician visits across Sabour, Nathnagar, Barari & all Bhagalpur areas. Call +91 7070494254.",
  keywords: [
    // Core service keywords
    "AC repair Bhagalpur",
    "refrigerator repair Bhagalpur",
    "washing machine repair Bhagalpur",
    "fridge repair near me Bhagalpur",
    "AC service Bhagalpur",
    "appliance repair Bhagalpur",
    // Area keywords
    "AC repair Sabour",
    "refrigerator repair Sabour",
    "fridge repair Nathnagar",
    "AC repair Barari",
    "appliance repair Adampur",
    "technician Tilkamanjhi",
    // Brand keywords
    "LG fridge repair Bhagalpur",
    "Samsung refrigerator repair Bhagalpur",
    "Whirlpool fridge service Bhagalpur",
    "Voltas AC repair Bhagalpur",
    "Daikin AC service Bhagalpur",
    "Haier fridge repair Bhagalpur",
    "Godrej refrigerator repair Bhagalpur",
    // Long-tail keywords
    "golden refrigeration Bhagalpur",
    "AC gas filling Bhagalpur",
    "split AC repair Bhagalpur",
    "compressor repair Bhagalpur",
    "same day repair Bhagalpur",
    "home appliance service Bihar",
    "fridge not cooling Bhagalpur",
    "AC not cooling Bhagalpur",
    "refrigerator gas filling Bhagalpur",
    "deep freezer repair Bhagalpur",
    "washing machine repair Sabour",
    "microwave repair Bhagalpur",
    "AC installation Bhagalpur",
    "window AC repair Bhagalpur",
    "front load washing machine repair Bhagalpur",
    // Additional areas
    "AC repair Nathnagar",
    "fridge repair Kahalgaon",
    "technician Sultanganj",
    "appliance repair Naugachia",
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
    title:
      "Golden Refrigeration – AC & Fridge Repair in Bhagalpur | Same-Day Service",
    description:
      "Bhagalpur's most trusted appliance repair service. Expert AC, fridge & washing machine repair at your doorstep. Certified technicians serving 30+ areas. Call +91 7070494254.",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1024,
        height: 1024,
        alt: "Golden Refrigeration – Bhagalpur Appliance Repair Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Golden Refrigeration – AC & Fridge Repair in Bhagalpur",
    description:
      "Same-day doorstep repair for AC, refrigerator & washing machine in Bhagalpur. 30+ areas covered. Book online or call +91 7070494254.",
    images: [`${SITE_URL}/logo.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  },
  category: "appliance repair",
};

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────

const localBusinessSchema = buildLocalBusinessSchema();

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: BUSINESS_NAME,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
    width: 1024,
    height: 1024,
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: PHONE,
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["Hindi", "English"],
  },
  sameAs: [JUSTDIAL_URL, MAPS_URL],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: BUSINESS_NAME,
  description:
    "Bhagalpur's most trusted appliance repair service — AC, refrigerator, and washing machine repairs at your doorstep.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/services/{search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much does AC repair cost in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AC repair in Bhagalpur starts with a visiting charge of ₹349. The total repair cost depends on the issue — gas refill (₹1200–₹2500), PCB repair (₹800–₹2000), or compressor replacement (₹3500–₹8000). Golden Refrigeration provides a transparent cost estimate before starting any repair.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer same-day AC repair service in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Golden Refrigeration offers same-day doorstep AC repair service in Bhagalpur and nearby areas including Sabour, Nathnagar, Barari, Adampur, Tilkamanjhi, Tatarpur, and all major localities. Book online or call +91 7070494254.",
      },
    },
    {
      "@type": "Question",
      name: "Which areas in Bhagalpur do you cover for appliance repair?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `We serve 30+ areas across Bhagalpur district including ${TARGET_AREAS.slice(0, 10)
          .map((a) => a.name)
          .join(", ")}, and many more. We cover PIN codes 812001, 812002, 812005, 813108, 813210, 813214, 813222, 853204.`,
      },
    },
    {
      "@type": "Question",
      name: "How do I book a refrigerator repair technician in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can book a refrigerator repair technician in Bhagalpur by visiting our Service page and filling out the booking form, calling us at +91 7070494254, or WhatsApp at +91 7070494254. We offer same-day doorstep visits.",
      },
    },
    {
      "@type": "Question",
      name: "Do you repair all brands of AC and refrigerators?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `Yes, Golden Refrigeration repairs all major brands including ${BRANDS.map((b) => b.name).join(", ")}. Our technicians are experienced with both split and window ACs, single-door to multi-door refrigerators, and all types of washing machines.`,
      },
    },
    {
      "@type": "Question",
      name: "What is the visiting charge for a technician in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The visiting charge for a technician visit at your home in Bhagalpur is ₹349. This includes on-site diagnosis and a transparent cost estimate for the repair. If you proceed with the repair, this charge is included in the overall service cost.",
      },
    },
    {
      "@type": "Question",
      name: "Can you fix AC that is not cooling in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely! Our certified technicians can fix ACs that are not cooling due to gas leaks, dirty filters, compressor issues, PCB faults, capacitor failure, or thermostat problems. We offer AC gas filling and compressor repair services with same-day service across Bhagalpur.",
      },
    },
    {
      "@type": "Question",
      name: "Who provides the best refrigerator repair service in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Golden Refrigeration, located near Sabour High School, Pani Tanki, Sabour, Bhagalpur, is the most trusted refrigerator repair service in Bhagalpur. With 4.8/5 rating, 127+ verified reviews, same-day service, and certified technicians, we are Bhagalpur's premier appliance repair company. Call +91 7070494254.",
      },
    },
    {
      "@type": "Question",
      name: "Do you repair LG refrigerators in Sabour Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Golden Refrigeration provides expert LG refrigerator repair in Sabour, Bhagalpur. We service all LG fridge models — single-door, double-door, and side-by-side — with original parts and same-day visits. Our workshop is located at Sabour High School area.",
      },
    },
    {
      "@type": "Question",
      name: "How much does refrigerator gas filling cost in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Refrigerator gas filling (R-134a or R-600a) in Bhagalpur costs between ₹800 and ₹1500 depending on the refrigerant type and quantity needed. Golden Refrigeration offers transparent pricing with no hidden charges. Call +91 7070494254 for a free quote.",
      },
    },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Appliance Repair",
  provider: {
    "@type": "LocalBusiness",
    name: BUSINESS_NAME,
    telephone: PHONE,
    address: ADDRESS,
  },
  areaServed: {
    "@type": "City",
    name: "Bhagalpur",
    containedInPlace: { "@type": "State", name: "Bihar" },
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Appliance Repair Services",
    itemListElement: SERVICES.map((svc, i) => ({
      "@type": "Offer",
      position: i + 1,
      itemOffered: {
        "@type": "Service",
        name: `${svc.name} in Bhagalpur`,
        description: svc.shortDesc,
        url: `${SITE_URL}/services/${svc.slug}`,
      },
    })),
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
  ],
};

const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Golden Refrigeration – AC & Fridge Repair in Bhagalpur",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".speakable-hero", ".speakable-geo", ".speakable-faq"],
  },
  url: SITE_URL,
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
        <link
          rel="preconnect"
          href="https://images.unsplash.com"
          crossOrigin="anonymous"
        />
        {/* Canonical Domain Signal */}
        <link rel="canonical" href={SITE_URL} />
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,#eef3ff_45%,#f8fbff_100%)]"
      >
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
