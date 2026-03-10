// frontend/app/components/Footer.tsx
import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 md:py-14 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">
        <div className="col-span-1 md:col-span-2">
          <div className="mb-4">
            <BrandLogo compact />
          </div>
          <p className="text-slate-600 max-w-sm text-sm leading-relaxed">
            Golden Refrigeration combines trusted technician expertise with a modern,
            AI-assisted customer experience for repair and refurbished appliances.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Services</h3>
          <ul className="text-slate-600 space-y-2 text-sm">
            <li>AC Installation</li>
            <li>Fridge Repair</li>
            <li>Washing Machine Service</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Support</h3>
          <ul className="text-slate-600 space-y-2 text-sm">
            <li>Contact Us</li>
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pt-7 border-t border-slate-100 text-center text-slate-500 text-xs">
        © 2026 Golden Refrigeration. All rights reserved.
      </div>
    </footer>
  );
}
