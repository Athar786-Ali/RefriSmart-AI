// frontend/src/components/Footer.tsx
import Link from "next/link";
import { Star, Snowflake, Navigation, MapPin, Clock, Phone } from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="w-full flex flex-col mt-8">
      
      {/* MASSIVE TRUST & LOCATION BANNER */}
      <section className="w-full bg-slate-950 py-16 md:py-20 border-t-8 border-blue-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Snowflake className="w-96 h-96" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <h2 className="text-3xl md:text-5xl font-black text-white">Visit Golden Refrigeration</h2>
            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-xl mx-auto lg:mx-0">
              Bhagalpur's premier destination for heavy appliance repairs, installations, and pre-owned deals.
            </p>
            <div className="inline-flex flex-col gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-4 text-left w-full lg:w-auto shadow-2xl">
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="font-medium">Sabour High School, Pani Tanki Sabour, Bhagalpur-813210</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Clock className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="font-medium">Opens daily at 8:00 AM</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="font-medium">+91 7070494254 </span>
              </div>
            </div>
            <p className="text-slate-600 text-xs mt-4 font-mono font-bold tracking-widest uppercase">GSTIN : 10EFRPM9155N1ZQ</p>
          </div>

          <div className="shrink-0 flex flex-col gap-4 w-full sm:w-auto">
            <a 
              href="https://www.justdial.com/Bhagalpur/Golden-Refrigeration--Sabour-High-School-Sabour/9999PX641-X641-190522080859-E5V9_BZDET" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-yellow-500 hover:bg-yellow-400 transition-colors text-slate-900 font-extrabold text-lg px-8 py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3"
            >
              <Star className="w-6 h-6 fill-slate-900" />
              View us on JustDial
            </a>
            <a 
              href="https://maps.app.goo.gl/vJ8CDd8nTpkZBG4EA" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 text-white font-bold text-lg px-8 py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3"
            >
              <Navigation className="w-5 h-5 text-blue-400" />
              Get Directions
            </a>
          </div>

        </div>
      </section>

      {/* STANDARD BASE FOOTER LINKS */}
      <section className="bg-slate-900 border-t border-slate-800 py-12 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              {/* Ensure logo is perfectly visible on dark bg */}
              <BrandLogo theme="dark" />
            </div>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
              Golden Refrigeration combines trusted technician expertise with a modern,
              AI-assisted customer experience for repair and refurbished appliances.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wide">Services</h3>
            <ul className="text-slate-400 space-y-2 text-sm">
              <li><Link href="/service" className="hover:text-amber-400 hover:translate-x-1 inline-block transition-all text-base">Book a Repair</Link></li>
              <li><Link href="/products" className="hover:text-amber-400 hover:translate-x-1 inline-block transition-all text-base">Buy Appliance</Link></li>
              <li><Link href="/ai-diagnosis" className="hover:text-amber-400 hover:translate-x-1 inline-block transition-all text-base">AI Diagnosis</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wide">Support</h3>
            <ul className="text-slate-400 space-y-2 text-sm">
              <li><Link href="tel:+917070494254" className="hover:text-cyan-400 transition-colors inline-flex items-center gap-2 text-base"><Phone className="w-4 h-4"/> Contact Us</Link></li>
              <li><Link href="/" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all text-base">Terms of Service</Link></li>
              <li><Link href="/" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all text-base">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10 pt-7 border-t border-slate-800 text-center text-slate-500 text-xs">
          © 2026 Golden Refrigeration. All rights reserved.
        </div>
      </section>
    </footer>
  );
}
