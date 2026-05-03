// frontend/src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Golden Refrigeration – Bhagalpur's #1 Appliance Repair",
  description:
    "Expert AC, refrigerator, and washing machine repairs with same-day doorstep service in Bhagalpur. Book a certified technician online or call +91 7070494254.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
