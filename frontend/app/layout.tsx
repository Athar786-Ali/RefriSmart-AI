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
      <body className="antialiased bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,#eef3ff_45%,#f8fbff_100%)]">
        <Navbar />
        <div className="min-h-[80vh]">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
