"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  Star, Snowflake, Wind, Zap, Navigation, MapPin, 
  Clock, Phone, Sparkles, ArrowRight, MonitorSmartphone,
  ShieldCheck, Wrench, CalendarCheck, CheckCircle2, Quote, ChevronDown
} from "lucide-react";
import GalleryShowcase from "@/components/GalleryShowcase";

const FAQS = [
  { q: "How much does AC repair cost in Bhagalpur?", a: "AC repair in Bhagalpur starts with a visiting charge of ₹349. The total repair cost depends on the issue (gas refill, PCB, compressor etc.). Golden Refrigeration provides a transparent cost estimate before starting any work." },
  { q: "Do you offer same-day AC repair in Bhagalpur?", a: "Yes! We offer same-day doorstep AC repair service in Bhagalpur and nearby areas including Sabour, Nathnagar, Barari, and Adampur. Book online or call +91 7070494254." },
  { q: "My fridge is not cooling — can you fix it?", a: "Absolutely! Our certified technicians diagnose and fix refrigerators not cooling due to gas leaks, compressor failures, PCB faults, thermostat issues, and more. We serve all brands including LG, Samsung, Haier, Whirlpool, and Godrej." },
  { q: "Which areas in Bhagalpur do you cover?", a: "We cover all major areas of Bhagalpur including Sabour, Nathnagar, Barari, Adampur, Khalifabagh, Tatarpur, and all localities with PIN codes 812xxx, 813xxx, and 853xxx." },
  { q: "Do you repair all brands of AC and refrigerators?", a: "Yes! We repair all major brands — LG, Samsung, Voltas, Daikin, Haier, Whirlpool, Godrej, Blue Star, Carrier, and more. Our technicians are experienced with both split and window ACs." },
  { q: "How do I book a technician for washing machine repair in Bhagalpur?", a: "You can book online by visiting the Service page on our website and filling out the form, or call us directly at +91 7070494254. We dispatch a technician the same day in most cases." },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
        aria-expanded={open}
      >
        <span className="font-bold text-white text-base md:text-lg leading-snug group-hover:text-cyan-300 transition-colors">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-cyan-400" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-6 text-slate-300 text-sm md:text-base leading-relaxed border-t border-slate-700/50 pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const services = [
    { 
      title: "AC Repair & Install", 
      desc: "Expert servicing, gas filling, and split/window AC installation. Flat rate diagnosis available.", 
      icon: <Wind className="w-8 h-8 text-cyan-300" />,
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop"
    },
    { 
      title: "Refrigerator Repair", 
      desc: "Compressor checks, PCB fixes, and cooling restorations for Single, Double, & Multi-door fridges.", 
      icon: <Snowflake className="w-8 h-8 text-blue-300" />,
      image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=1200&auto=format&fit=crop"
    },
    { 
      title: "Washing Machines", 
      desc: "Drum alignment, motor diagnostics, and water flow repairs for Top & Front load machines.", 
      icon: <Sparkles className="w-8 h-8 text-indigo-300" />,
      image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?q=80&w=1200&auto=format&fit=crop"
    },
    { 
      title: "Electronic Goods", 
      desc: "Comprehensive logic board and technical appliance diagnostics for all major brands.", 
      icon: <Zap className="w-8 h-8 text-amber-300" />,
      image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?q=80&w=1200&auto=format&fit=crop"
    },
  ];

  const features = [
    { title: "Certified Technicians", desc: "Our team consists of highly trained professionals with years of experience across all major brands like LG, Samsung, and Voltas.", icon: <ShieldCheck className="w-6 h-6 text-white" /> },
    { title: "Same-Day Doorstep Visit", desc: "We know appliances break when you need them most. We strive to reach your Bhagalpur address within hours of booking.", icon: <Clock className="w-6 h-6 text-white" /> },
    { title: "Genuine Spare Parts", desc: "We only use original, manufacturer-approved replacement parts to ensure your appliance runs flawlessly for years to come.", icon: <Wrench className="w-6 h-6 text-white" /> },
  ];

  const processSteps = [
    { title: "Book Service", desc: "Request a visit online or through a quick phone call. Choose a time that works perfectly for your schedule.", icon: <CalendarCheck className="w-8 h-8 text-blue-600" /> },
    { title: "Expert Diagnosis", desc: "Our technician arrives at your doorstep, runs an advanced diagnostic, and provides a transparent cost estimate.", icon: <MonitorSmartphone className="w-8 h-8 text-cyan-600" /> },
    { title: "Perfect Repair", desc: "We fix the issue swiftly using genuine parts, test the appliance, and clean up our workspace before leaving.", icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" /> },
  ];

  return (
    <>
    <main className="min-h-screen pb-12 flex flex-col font-sans overflow-x-hidden bg-slate-950">
      
      {/* 1. PREMIUM HERO SECTION (SERVICE FOCUSED) */}
      <section className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden bg-slate-950 pt-24 pb-10">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/50 to-slate-950/95"></div>
          <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center flex flex-col items-center gap-7 md:gap-10">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-md px-5 py-2 text-sm font-semibold text-yellow-300 shadow-lg shadow-yellow-900/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Bhagalpur's Most Trusted Appliance Repair</span>
          </div>

          <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-xl md:text-6xl lg:text-7xl max-w-5xl leading-[1.1]">
            Fast, Reliable Repairs right at your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Doorstep.</span>
          </h1>
          
          <p className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
            AC not cooling? Fridge leaking? Don't sweat it. Golden Refrigeration sends top-tier certified technicians directly to you with same-day service guarantees.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
            <Link
              href="/service"
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black text-lg md:text-xl shadow-xl shadow-blue-900/40 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border border-blue-400/30"
            >
              <Wrench className="w-6 h-6" /> Book a Technician Now
            </Link>
            <a
              href="tel:+917070494254"
              id="hero-call-technician-btn"
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-black text-lg md:text-xl shadow-xl shadow-emerald-900/40 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border border-emerald-400/30"
            >
              <Phone className="w-6 h-6" /> Call Technician
            </a>
          </div>
          
          <div className="mt-8 flex items-center gap-6 text-sm font-bold text-slate-300">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Visiting charge ₹349/-</span>
            <span className="hidden md:flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> 100% Satisfaction Guarantee</span>
          </div>
        </div>
        
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-none z-10">
          <svg className="relative block w-[calc(100%+1.3px)] h-[50px] md:h-[80px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29C192,26.47,394,16,600,16s408,10.47,600,30.29V0H0Z" className="fill-slate-50"></path>
          </svg>
        </div>
      </section>

      {/* 2. SERVICES HIGHLIGHT SECTION */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 -mt-10 md:-mt-16 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc, idx) => (
            <div 
              key={idx} 
              className="relative rounded-[2rem] overflow-hidden shadow-xl shadow-slate-300/40 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-blue-900/30 group flex flex-col h-[360px]"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${svc.image}')` }}
              />
              {/* High Quality Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-slate-900/10" />
              
              {/* Content Box */}
              <div className="relative z-10 p-8 flex flex-col h-full justify-end">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-5 border border-white/20 shrink-0 shadow-lg shadow-black/20 group-hover:bg-blue-600/60 transition-colors duration-300">
                  {svc.icon}
                </div>
                <h3 className="text-2xl font-black text-white mb-2 leading-tight drop-shadow-md">{svc.title}</h3>
                <p className="text-slate-300 font-medium leading-relaxed drop-shadow-md">{svc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="py-20 md:py-32 bg-slate-950 relative overflow-hidden">
        {/* Aesthetic background patterns */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl opacity-60"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-400 font-bold mb-4">Simple Process</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-20">How Our Service Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-slate-700 to-transparent -z-10"></div>
            
            {processSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center relative bg-slate-900/40 backdrop-blur-sm p-8 md:p-10 rounded-[2.5rem] border border-slate-800/80 shadow-2xl transition-transform hover:-translate-y-2">
                <div className="w-28 h-28 bg-slate-900 rounded-full border-4 border-slate-800 shadow-xl shadow-black/50 flex items-center justify-center mb-8 relative z-10 shrink-0 group">
                  <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl transition-all group-hover:bg-blue-500/30"></div>
                  <div className="relative z-10">{step.icon}</div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-lg shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    {idx + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-4">{step.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed px-2">{step.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-20">
            <Link 
              href="/service"
              className="inline-flex items-center gap-3 text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-800/50 px-8 py-4 rounded-full hover:bg-cyan-900/60 hover:text-cyan-300 transition-all transform hover:scale-105"
            >
              Book your visit today <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US (FEATURES & REVIEWS) */}
      <section className="py-20 md:py-28 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="w-full lg:w-1/2 space-y-10">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-400 font-bold mb-3">Industry Experts</p>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Why Bhagalpur Trusts <br /><span className="text-blue-400">Golden Refrigeration.</span>
              </h2>
            </div>
            
            <div className="flex flex-col gap-8">
              {features.map((feat, idx) => (
                <div key={idx} className="flex gap-5">
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-blue-600 border border-blue-500 shadow-xl shadow-blue-900/50 flex items-center justify-center">
                    {feat.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-100 mb-2">{feat.title}</h4>
                    <p className="text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-full lg:w-1/2">
            <div className="bg-slate-800 border border-slate-700/50 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
              {/* Massive subtle quote icon */}
              <Quote className="absolute -top-4 -right-4 w-40 h-40 text-slate-700/30 -rotate-12" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex gap-1 mb-6">
                  {[...Array(4)].map((_, i) => <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />)}
                  <Star className="w-8 h-8 text-slate-500" />
                </div>
                
                <h3 className="text-3xl font-black text-white mb-2">4.0 out of 5 Rating</h3>
                <p className="text-slate-400 font-medium mb-10">Verified Service Business on JustDial</p>
                
                <p className="text-lg md:text-xl font-medium text-slate-200 italic leading-relaxed">
                  "Absolutely brilliant service! The technician arrived on time and fixed our deep freezer in under an hour. Highly professional and deeply knowledgeable about the compressor issues."
                </p>
                
                <a 
                  href="https://www.justdial.com/Bhagalpur/Golden-Refrigeration--Sabour-High-School-Sabour/9999PX641-X641-190522080859-E5V9_BZDET/reviews" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-10 inline-flex items-center gap-2 bg-yellow-500 text-slate-900 font-black px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors shadow-lg"
                >
                  <Star className="w-5 h-5 fill-slate-900" /> Read verified JustDial reviews
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. LIVE REPAIR GALLERY SHOWCASE */}
      <GalleryShowcase />

      {/* 6. SHOWROOM CTA & AI PROMPT (PUSHED TO THE BOTTOM) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 mt-4 relative flex flex-col gap-8">
        
        {/* Intelligent AI Prompt UI requested by User */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="flex-1 space-y-3 text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-500/30 mb-2">
              <Sparkles className="w-3 h-3" /> Industry First
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
              Not sure what's broken? <br/><span className="text-cyan-400">Ask our AI Expert.</span>
            </h2>
            <p className="text-indigo-200 font-medium max-w-xl mx-auto md:mx-0">
              Just upload a photo or video of your appliance problem. Our advanced AI will diagnose the issue and give you instant repair estimates.
            </p>
          </div>
          <div className="shrink-0 relative z-10">
            <Link 
              href="/ai-diagnosis"
              className="inline-flex items-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-lg px-8 py-4 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-transform transform hover:scale-105 active:scale-95"
            >
              Try AI Diagnosis Free
            </Link>
          </div>
        </div>

        {/* Existing Showroom CTA - Transitioned to Dark Mode */}
        <div className="bg-slate-900/80 backdrop-blur-lg rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl border border-slate-800">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
              Looking to Buy? Visit our <span className="text-blue-400">Appliance Showroom.</span>
            </h2>
            <p className="text-slate-400 font-medium max-w-xl mx-auto md:mx-0 text-sm md:text-base">
              We don't just repair—we sell! Browse our fully stocked inventory of brand new and professionally refurbished appliances.
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center w-full md:w-auto">
            <Link 
              href="/products"
              className="inline-flex items-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold px-6 py-3 rounded-xl transition-transform transform hover:scale-105 active:scale-95"
            >
              <MonitorSmartphone className="w-5 h-5 text-blue-400" /> Browse Inventory
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION – triggers Google FAQ Rich Snippets */}
      <section className="py-20 md:py-28 bg-slate-900" aria-label="Frequently Asked Questions">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-400 font-bold mb-3">Got Questions?</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">Frequently Asked Questions</h2>
            <p className="text-slate-400 mt-4 text-lg">Everything you need to know about our appliance repair services in Bhagalpur.</p>
          </div>
          <div className="flex flex-col gap-4">
            {FAQS.map((faq, idx) => (
              <FaqItem key={idx} question={faq.q} answer={faq.a} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <a
              href="tel:+917070494254"
              className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-lg px-8 py-4 rounded-full shadow-xl transition-all transform hover:scale-105"
            >
              <Phone className="w-5 h-5" /> Still have questions? Call us directly
            </a>
          </div>
        </div>
      </section>

      {/* 8. SERVICE AREAS – local SEO signal for Google */}
      <section className="py-14 bg-slate-950 border-t border-slate-800" aria-label="Service Areas in Bhagalpur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-400 font-bold mb-3">Doorstep Service in Bhagalpur</p>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-6">Areas We Serve in Bhagalpur, Bihar</h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {["Sabour","Nathnagar","Barari","Adampur","Khalifabagh","Tatarpur","Bhagalpur City","Tinpahar","Kahalgaon","Sultanganj","Bihpur","Naugachhia"].map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold px-4 py-2 rounded-full hover:border-cyan-500/50 hover:text-cyan-300 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-400" />{area}
              </span>
            ))}
          </div>
          <p className="text-slate-500 text-sm mt-6">Serving PIN codes: 812xxx · 813xxx · 853xxx — Bhagalpur &amp; surrounding Bihar districts</p>
        </div>
      </section>

    </main>

      {/* STICKY FLOATING CALL BUTTON */}
      <a
        href="tel:+917070494254"
        id="floating-call-technician-btn"
        aria-label="Call Technician"
        className="fixed bottom-6 right-6 z-[200] flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black px-5 py-4 rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.5)] transition-all transform hover:scale-110 active:scale-95 border border-emerald-300/40"
      >
        <Phone className="w-5 h-5 animate-bounce" />
        <span className="hidden sm:inline text-sm">Call Technician</span>
      </a>
    </>
  );
}
