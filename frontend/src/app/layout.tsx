// frontend/src/app/layout.tsx
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,#eef3ff_45%,#f8fbff_100%)]">
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
        </AuthProvider>
      </body>
    </html>
  );
}
