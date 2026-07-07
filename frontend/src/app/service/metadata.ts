// frontend/src/app/service/metadata.ts
import type { Metadata } from "next";

const SITE_URL = "https://www.goldenrefrigeration.in";

export const metadata: Metadata = {
  title: "Book AC & Appliance Repair in Bhagalpur | Same-Day Doorstep Service | ₹349",
  description:
    "Book a certified technician for AC repair, refrigerator repair, or washing machine repair in Bhagalpur. Same-day doorstep service with visiting charge of just ₹349. All brands — LG, Samsung, Whirlpool, Voltas, Godrej, Haier, Daikin. Serving Sabour, Nathnagar, Barari & all Bhagalpur areas. Call +91 7070494254.",
  keywords: [
    "book AC repair Bhagalpur",
    "refrigerator repair booking Bhagalpur",
    "washing machine repair Bhagalpur",
    "same day technician Bhagalpur",
    "doorstep repair service Bhagalpur",
    "AC repair Sabour Bihar",
    "appliance repair booking online Bhagalpur",
    "AC service Bhagalpur",
    "fridge repair booking Bhagalpur",
    "LG AC repair Bhagalpur",
    "Samsung fridge repair Bhagalpur",
    "Whirlpool washing machine repair Bhagalpur",
    "Voltas AC service Bhagalpur",
    "Godrej refrigerator repair Bhagalpur",
    "AC gas filling booking Bhagalpur",
    "compressor repair Bhagalpur",
    "split AC repair Bhagalpur",
    "window AC service Bhagalpur",
    "technician near me Bhagalpur",
    "home appliance repair Bhagalpur",
  ],
  openGraph: {
    title: "Book AC & Appliance Repair in Bhagalpur — Golden Refrigeration",
    description:
      "Same-day doorstep technician visits for AC, fridge & washing machine repair. All brands serviced. Serving all Bhagalpur areas. ₹349 visiting charge. Call +91 7070494254.",
    url: `${SITE_URL}/service`,
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: "Book Appliance Repair in Bhagalpur — Golden Refrigeration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book AC & Fridge Repair Bhagalpur | Golden Refrigeration",
    description:
      "Same-day doorstep repair. All brands. ₹349 visiting charge. Call +91 7070494254.",
  },
  alternates: {
    canonical: `${SITE_URL}/service`,
  },
};
