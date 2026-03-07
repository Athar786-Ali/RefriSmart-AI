// frontend/app/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="col-span-1 md:col-span-2">
          <div className="text-xl font-black tracking-tighter text-blue-600 mb-4">
            GOLDEN <span className="text-slate-800">REF.</span>
          </div>
          <p className="text-slate-500 max-w-sm">
            Bhaiya ki shop "Golden Refrigeration" ab AI-Powered hai. 
            Premium repair aur refurbished gadgets ka ek matra thikana.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-slate-900 mb-4">Services</h3>
          <ul className="text-slate-500 space-y-2 text-sm">
            <li>AC Installation</li>
            <li>Fridge Repair</li>
            <li>Washing Machine Service</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-slate-900 mb-4">Support</h3>
          <ul className="text-slate-500 space-y-2 text-sm">
            <li>Contact Us</li>
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-50 text-center text-slate-400 text-xs">
        © 2026 Golden Refrigeration. Developed with ❤️ by Athar.
      </div>
    </footer>
  );
}
