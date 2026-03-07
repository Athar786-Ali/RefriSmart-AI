// frontend/app/layout.tsx
import "./globals.css"; // Ye line top par honi chahiye
import Navbar from "./components/Navbar";
// ... baaki imports same

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-zinc-50">
        <Navbar />
        {children}
        {/* Footer yahan add kar sakte hain */}
      </body>
    </html>
  );
}