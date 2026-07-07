// frontend/src/app/products/metadata.ts
import type { Metadata } from "next";

const SITE_URL = "https://www.goldenrefrigeration.in";

export const metadata: Metadata = {
  title: "Buy Refurbished & New AC, Fridge, Washing Machine in Bhagalpur | Golden Refrigeration",
  description:
    "Buy certified refurbished and brand-new appliances in Bhagalpur at the best prices. AC, refrigerators, washing machines — LG, Samsung, Whirlpool, Voltas & all brands. Every unit professionally tested with shop warranty. Visit Golden Refrigeration, Sabour, Bhagalpur. Call +91 7070494254.",
  keywords: [
    "buy refurbished AC Bhagalpur",
    "second hand fridge Bhagalpur",
    "used refrigerator for sale Bhagalpur",
    "buy washing machine Bhagalpur",
    "refurbished appliances Bhagalpur",
    "second hand AC Bhagalpur",
    "used AC for sale Bhagalpur",
    "buy LG fridge Bhagalpur",
    "buy Samsung AC Bhagalpur",
    "certified refurbished appliances Bhagalpur",
    "used washing machine for sale Bhagalpur",
    "appliance showroom Bhagalpur",
    "Golden Refrigeration products",
    "cheap AC Bhagalpur",
    "affordable refrigerator Bhagalpur",
    "second hand appliances Sabour Bhagalpur",
  ],
  openGraph: {
    title: "Buy Refurbished AC, Fridge & Washing Machine in Bhagalpur | Golden Refrigeration",
    description:
      "Certified refurbished & brand-new appliances in Bhagalpur. All tested & warranted. LG, Samsung, Whirlpool, Voltas & more. Visit Golden Refrigeration, Sabour.",
    url: `${SITE_URL}/products`,
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: "Buy Refurbished Appliances in Bhagalpur — Golden Refrigeration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy AC, Fridge & Washing Machine in Bhagalpur | Golden Refrigeration",
    description:
      "Certified refurbished & new appliances. All brands. Best prices in Bhagalpur. Call +91 7070494254.",
  },
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
};
