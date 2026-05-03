// frontend/src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

const SITE_URL = "https://refrismart-ai.vercel.app";
const BUSINESS_NAME = "Golden Refrigeration";
const PHONE = "+917070494254";
const ADDRESS = "Sabour High School, Pani Tanki Sabour, Bhagalpur, Bihar 813210, India";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Golden Refrigeration – AC & Fridge Repair in Bhagalpur | Same-Day Service",
    template: "%s | Golden Refrigeration Bhagalpur",
  },
  description:
    "Bhagalpur's most trusted appliance repair service. Expert AC repair, refrigerator repair, washing machine repair & installation at your doorstep. Same-day certified technician visits. Call +91 7070494254.",
  keywords: [
    "AC repair Bhagalpur",
    "refrigerator repair Bhagalpur",
    "washing machine repair Bhagalpur",
    "fridge repair near me Bhagalpur",
    "AC service Bhagalpur",
    "appliance repair Bhagalpur",
    "AC repair Sabour",
    "golden refrigeration Bhagalpur",
    "technician Bhagalpur",
    "AC gas filling Bhagalpur",
    "split AC repair Bhagalpur",
    "compressor repair Bhagalpur",
    "same day repair Bhagalpur",
    "home appliance service Bihar",
    "fridge not cooling Bhagalpur",
    "AC not cooling Bhagalpur",
    "washing machine repair Sabour",
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
    title: "Golden Refrigeration – AC & Fridge Repair in Bhagalpur | Same-Day Service",
    description:
      "Bhagalpur's most trusted appliance repair service. Expert AC, fridge & washing machine repair at your doorstep. Certified technicians. Call +91 7070494254.",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "Golden Refrigeration – Bhagalpur Appliance Repair",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Golden Refrigeration – AC & Fridge Repair in Bhagalpur",
    description:
      "Same-day doorstep repair for AC, refrigerator & washing machine in Bhagalpur. Book online or call +91 7070494254.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  verification: {
    // Add your Google Search Console verification code here when available
    // google: "YOUR_GOOGLE_VERIFICATION_CODE",
  },
  category: "appliance repair",
};

// JSON-LD Structured Data for Google Local Search
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#business`,
  name: BUSINESS_NAME,
  alternateName: "Golden Refrigeration Bhagalpur",
  description:
    "Expert appliance repair service in Bhagalpur, Bihar. Specializing in AC repair, refrigerator repair, washing machine repair, and electronic appliance servicing with same-day doorstep visits.",
  url: SITE_URL,
  telephone: PHONE,
  priceRange: "₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI, Online Payment",
  image: `${SITE_URL}/logo.png`,
  logo: `${SITE_URL}/logo.png`,
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
      dayOfWeek: [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
      ],
      opens: "08:00",
      closes: "20:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.0",
    reviewCount: "50",
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
    { "@type": "Place", name: "Sabour" },
    { "@type": "Place", name: "Nathnagar" },
    { "@type": "Place", name: "Barari" },
    { "@type": "Place", name: "Adampur" },
    { "@type": "Place", name: "Khalifabagh" },
  ],
  serviceType: [
    "AC Repair", "Air Conditioner Installation", "Refrigerator Repair",
    "Washing Machine Repair", "Microwave Oven Repair", "Electronic Appliance Repair",
    "AC Gas Filling", "Compressor Repair", "Split AC Service",
  ],
  knowsAbout: [
    "LG AC Repair", "Samsung Refrigerator Repair", "Voltas AC Service",
    "Haier Fridge Repair", "Whirlpool Washing Machine Repair", "Daikin AC Repair",
  ],
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
        text: "AC repair in Bhagalpur starts with a visiting charge of ₹349. The total repair cost depends on the issue. Golden Refrigeration provides a transparent cost estimate before starting any repair.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer same-day AC repair service in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Golden Refrigeration offers same-day doorstep AC repair service in Bhagalpur and nearby areas including Sabour, Nathnagar, Barari, and Adampur. Book online or call +91 7070494254.",
      },
    },
    {
      "@type": "Question",
      name: "Which areas in Bhagalpur do you cover for appliance repair?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We serve all major areas of Bhagalpur including Sabour, Nathnagar, Barari, Adampur, Khalifabagh, and surrounding localities with PIN codes starting with 812, 813, and 853.",
      },
    },
    {
      "@type": "Question",
      name: "How do I book a refrigerator repair technician in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can book a refrigerator repair technician in Bhagalpur by visiting our website and filling out the booking form, or by directly calling us at +91 7070494254. We offer same-day doorstep visits.",
      },
    },
    {
      "@type": "Question",
      name: "Do you repair all brands of AC and refrigerators?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Golden Refrigeration repairs all major brands including LG, Samsung, Voltas, Daikin, Haier, Whirlpool, Godrej, and all other brands of ACs, refrigerators, and washing machines.",
      },
    },
    {
      "@type": "Question",
      name: "What is the visiting charge for a technician in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The visiting charge for a technician visit at your home in Bhagalpur is ₹349. This includes on-site diagnosis and a cost estimate for the repair.",
      },
    },
    {
      "@type": "Question",
      name: "Can you fix AC that is not cooling in Bhagalpur?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely! Our certified technicians can fix ACs that are not cooling due to gas leaks, dirty filters, compressor issues, or PCB faults. We offer AC gas filling and compressor repair services in Bhagalpur.",
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
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "AC Repair & Service Bhagalpur", description: "Expert AC repair, gas filling, and installation service at your doorstep in Bhagalpur." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Refrigerator Repair Bhagalpur", description: "Compressor checks, PCB fixes, and cooling restoration for all fridge brands in Bhagalpur." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Washing Machine Repair Bhagalpur", description: "Drum alignment, motor repair, and water flow fixes for top & front load machines in Bhagalpur." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Microwave Oven Repair Bhagalpur", description: "Electronic and heating element repair for all brands of microwave ovens in Bhagalpur." } },
    ],
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
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
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
