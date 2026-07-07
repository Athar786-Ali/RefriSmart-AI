// frontend/src/app/gallery/metadata.ts
import type { Metadata } from "next";

const SITE_URL = "https://www.goldenrefrigeration.in";

export const metadata: Metadata = {
  title: "Our Work Gallery — AC & Fridge Repair in Bhagalpur | Golden Refrigeration",
  description:
    "See real on-site repair work by Golden Refrigeration technicians across Bhagalpur. Gallery of AC repair, refrigerator repair, and washing machine service jobs in Sabour, Nathnagar, Barari & all Bhagalpur areas.",
  keywords: [
    "AC repair work Bhagalpur",
    "fridge repair photos Bhagalpur",
    "appliance repair gallery Bhagalpur",
    "Golden Refrigeration technician photos",
    "AC service images Bhagalpur",
    "washing machine repair photos Bhagalpur",
    "appliance repair Sabour photos",
  ],
  openGraph: {
    title: "Gallery — Real Repair Work by Golden Refrigeration, Bhagalpur",
    description:
      "View our technicians in action across Bhagalpur. AC repair, fridge repair, washing machine service — real on-site work, real results.",
    url: `${SITE_URL}/gallery`,
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: "Appliance Repair Gallery — Golden Refrigeration Bhagalpur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Repair Work Gallery | Golden Refrigeration Bhagalpur",
    description:
      "See our certified technicians repairing AC, fridge & washing machines across Bhagalpur.",
  },
  alternates: {
    canonical: `${SITE_URL}/gallery`,
  },
};
