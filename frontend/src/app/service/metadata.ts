// frontend/src/app/service/metadata.ts
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo-config";

export const metadata: Metadata = {
  title:
    "Book AC & Appliance Repair Technician in Bhagalpur | Same-Day Doorstep Service",
  description:
    "Book a certified technician for AC repair, refrigerator repair, or washing machine repair in Bhagalpur. Same-day doorstep service with visiting charge of just ₹349. Serving Sabour, Nathnagar, Barari, Tilkamanjhi, Adampur & all 30+ Bhagalpur areas.",
  keywords: [
    "book AC repair Bhagalpur",
    "refrigerator repair booking Bhagalpur",
    "washing machine repair Bhagalpur",
    "same day technician Bhagalpur",
    "doorstep repair service Bhagalpur",
    "AC repair Sabour Bihar",
    "appliance repair booking online Bhagalpur",
    "technician near me Bhagalpur",
    "home appliance service Bihar",
    "book fridge repair Bhagalpur",
  ],
  openGraph: {
    title:
      "Book AC & Appliance Repair in Bhagalpur – Golden Refrigeration",
    description:
      "Same-day doorstep technician visits for AC, fridge & washing machine repair. Serving 30+ Bhagalpur areas. ₹349 visiting charge.",
    url: `${SITE_URL}/service`,
  },
  alternates: {
    canonical: `${SITE_URL}/service`,
  },
};
