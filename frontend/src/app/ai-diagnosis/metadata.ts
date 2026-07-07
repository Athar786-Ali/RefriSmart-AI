// frontend/src/app/ai-diagnosis/metadata.ts
import type { Metadata } from "next";

const SITE_URL = "https://www.goldenrefrigeration.in";

export const metadata: Metadata = {
  title: "Free AI Appliance Diagnosis — AC, Fridge & Washing Machine Problem Checker | Bhagalpur",
  description:
    "Describe your AC, refrigerator or washing machine problem and get an instant AI-powered diagnosis. Free online appliance fault checker for Bhagalpur residents. Golden Refrigeration — certified technicians for all brands in Bhagalpur, Bihar.",
  keywords: [
    "AC problem checker Bhagalpur",
    "fridge not cooling diagnosis",
    "washing machine problem diagnosis",
    "free appliance diagnosis Bhagalpur",
    "AC fault finder Bhagalpur",
    "refrigerator problem diagnosis online",
    "AI appliance repair Bhagalpur",
    "AC troubleshooting Bhagalpur",
    "fridge not working solution Bhagalpur",
    "home appliance diagnosis Bihar",
  ],
  openGraph: {
    title: "Free AI Appliance Diagnosis | Golden Refrigeration Bhagalpur",
    description:
      "Describe your appliance problem and get instant AI-powered diagnosis. Free for all Bhagalpur residents. AC, fridge, washing machine faults detected instantly.",
    url: `${SITE_URL}/ai-diagnosis`,
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: "Free AI Appliance Diagnosis — Golden Refrigeration Bhagalpur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Appliance Diagnosis | Golden Refrigeration Bhagalpur",
    description:
      "Describe your AC, fridge or washing machine problem — get an instant AI diagnosis. Free. Bhagalpur.",
  },
  alternates: {
    canonical: `${SITE_URL}/ai-diagnosis`,
  },
};
