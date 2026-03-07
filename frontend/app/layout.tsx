// frontend/app/layout.tsx
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#f8fafc]">
        <Navbar />
        {/* Is children ke andar aapka page.tsx ka content aayega */}
        <div className="min-h-[80vh]">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
