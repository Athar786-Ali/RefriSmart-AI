// frontend/src/app/sell/metadata.ts
import type { Metadata } from "next";

const SITE_URL = "https://www.goldenrefrigeration.in";

export const metadata: Metadata = {
  title: "Sell Your Old AC, Fridge or Washing Machine in Bhagalpur | Get Best Price | Golden Refrigeration",
  description:
    "Sell your old or broken AC, refrigerator, or washing machine in Bhagalpur. Get the best price instantly. Golden Refrigeration buys all brands — LG, Samsung, Whirlpool, Voltas, Godrej & more. Free home pickup. Call +91 7070494254.",
  keywords: [
    "sell old AC Bhagalpur",
    "sell used fridge Bhagalpur",
    "sell old refrigerator Bhagalpur",
    "sell washing machine Bhagalpur",
    "old appliance buyer Bhagalpur",
    "sell broken AC Bhagalpur",
    "sell second hand fridge Bhagalpur",
    "best price old AC Bhagalpur",
    "scrap AC buyer Bhagalpur",
    "used appliance buyer Sabour Bhagalpur",
    "sell old LG fridge Bhagalpur",
    "sell Samsung AC Bhagalpur",
    "home pickup old appliance Bhagalpur",
  ],
  openGraph: {
    title: "Sell Your Old AC, Fridge & Washing Machine in Bhagalpur | Golden Refrigeration",
    description:
      "Get the best price for your old or broken appliances in Bhagalpur. All brands accepted. Free home pickup. Call +91 7070494254.",
    url: `${SITE_URL}/sell`,
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 1200,
        height: 630,
        alt: "Sell Old Appliances in Bhagalpur — Golden Refrigeration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sell Old AC, Fridge & Washing Machine in Bhagalpur | Golden Refrigeration",
    description:
      "Best price for old/broken appliances. All brands. Free pickup. Bhagalpur. Call +91 7070494254.",
  },
  alternates: {
    canonical: `${SITE_URL}/sell`,
  },
};
