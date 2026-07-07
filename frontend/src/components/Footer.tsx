// frontend/src/components/Footer.tsx
import Link from "next/link";
import { Star, Snowflake, Navigation, MapPin, Clock, Phone, MessageCircle } from "lucide-react";
import BrandLogo from "./BrandLogo";
import {
  PHONE,
  PHONE_DISPLAY,
  WHATSAPP_URL,
  MAPS_URL,
  JUSTDIAL_URL,
  TARGET_AREAS,
  BRANDS,
  SERVICES,
  BLOG_POSTS,
} from "@/lib/seo-config";

export default function Footer() {
  const topAreas = TARGET_AREAS.slice(0, 10);
  const fridgeBrands = BRANDS.filter((b) => b.type === "refrigerator").slice(0, 4);
  const acBrands = BRANDS.filter((b) => b.type === "ac").slice(0, 4);

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
              Bhagalpur's premier destination for appliance repairs, AC service, and pre-owned deals.
            </p>
            <div className="inline-flex flex-col gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-4 text-left w-full lg:w-auto shadow-2xl">
              <div className="flex items-center gap-3 text-slate-300">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="font-medium">Sabour High School, Pani Tanki Sabour, Bhagalpur-813210</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Clock className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="font-medium">Open daily 8:00 AM – 8:00 PM</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="font-medium">{PHONE_DISPLAY}</span>
              </div>
            </div>
            <p className="text-slate-600 text-xs mt-4 font-mono font-bold tracking-widest uppercase">GSTIN : 10EFRPM9155N1ZQ</p>
          </div>

          <div className="shrink-0 flex flex-col gap-4 w-full sm:w-auto">
            <a 
              href={`tel:${PHONE}`}
              id="footer-call-technician-btn"
              className="bg-emerald-500 hover:bg-emerald-400 transition-colors text-white font-extrabold text-lg px-8 py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3"
            >
              <Phone className="w-6 h-6" />
              Call Technician Now
            </a>
            <a 
              href={WHATSAPP_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              id="footer-whatsapp-btn"
              className="bg-[#25D366] hover:bg-[#20bd5a] transition-colors text-white font-extrabold text-lg px-8 py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3"
            >
              <MessageCircle className="w-6 h-6" />
              WhatsApp Us
            </a>
            <a 
              href={JUSTDIAL_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-yellow-500 hover:bg-yellow-400 transition-colors text-slate-900 font-extrabold text-lg px-8 py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3"
            >
              <Star className="w-6 h-6 fill-slate-900" />
              View us on JustDial
            </a>
            <a 
              href={MAPS_URL} 
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
      <section className="bg-slate-900 border-t border-slate-800 py-14 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-10">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <div className="mb-4">
              <BrandLogo theme="dark" />
            </div>
            <p className="text-slate-400 max-w-sm text-sm leading-relaxed mb-4">
              Golden Refrigeration combines trusted technician expertise with a modern,
              AI-assisted customer experience for repair and refurbished appliances in Bhagalpur, Bihar.
            </p>
            <p className="text-slate-500 text-xs">
              Serving Bhagalpur & surrounding areas since 2019.
              PIN codes: 812001 · 812002 · 813210 · 813222 · 853204
            </p>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wide">Services</h3>
            <ul className="text-slate-400 space-y-2 text-sm">
              {SERVICES.slice(0, 8).map((svc) => (
                <li key={svc.slug}>
                  <Link href={`/services/${svc.slug}`} className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all">
                    {svc.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/service" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all font-semibold text-slate-300">
                  Book a Repair →
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Areas Column */}
          <div>
            <h3 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wide">Service Areas</h3>
            <ul className="text-slate-400 space-y-2 text-sm">
              {topAreas.map((area) => (
                <li key={area.slug}>
                  <Link href={`/refrigerator-repair/${area.slug}`} className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all">
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands + Blog Column */}
          <div>
            <h3 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wide">Top Brands</h3>
            <ul className="text-slate-400 space-y-2 text-sm mb-6">
              {fridgeBrands.map((b) => (
                <li key={b.slug}>
                  <Link href={`/brands/${b.slug}`} className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all">
                    {b.name} Repair
                  </Link>
                </li>
              ))}
              {acBrands.map((b) => (
                <li key={b.slug}>
                  <Link href={`/brands/${b.slug}`} className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all">
                    {b.name} AC Repair
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="font-bold text-slate-200 mb-3 text-sm uppercase tracking-wide">Blog</h3>
            <ul className="text-slate-400 space-y-2 text-sm">
              {BLOG_POSTS.slice(0, 3).map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all leading-snug">
                    {post.title.length > 35 ? post.title.slice(0, 35) + "…" : post.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/blog" className="hover:text-cyan-400 font-semibold text-slate-300 transition-all">
                  All Articles →
                </Link>
              </li>
            </ul>
          </div>

          {/* Support + Products */}
          <div>
            <h3 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wide">Support</h3>
            <ul className="text-slate-400 space-y-2 text-sm mb-6">
              <li>
                <Link href={`tel:${PHONE}`} className="hover:text-cyan-400 transition-colors inline-flex items-center gap-2">
                  <Phone className="w-4 h-4"/> Contact Us
                </Link>
              </li>
              <li>
                <Link href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors inline-flex items-center gap-2">
                  <MessageCircle className="w-4 h-4"/> WhatsApp
                </Link>
              </li>
              <li><Link href="/ai-diagnosis" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all">AI Diagnosis</Link></li>
              <li><Link href="/products" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all">Buy Appliances</Link></li>
              <li><Link href="/sell" className="hover:text-cyan-400 hover:translate-x-1 inline-block transition-all">Sell Appliance</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10 pt-7 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <p>© 2026 Golden Refrigeration. All rights reserved. | Sabour, Bhagalpur, Bihar 813210</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/sitemap.xml" className="hover:text-slate-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </section>
    </footer>
  );
}
