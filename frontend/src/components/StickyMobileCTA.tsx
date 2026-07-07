// frontend/src/components/StickyMobileCTA.tsx
"use client";
import { Phone, MessageCircle } from "lucide-react";
import { PHONE, WHATSAPP_URL, PHONE_DISPLAY } from "@/lib/seo-config";

export default function StickyMobileCTA() {
  return (
    <>
      {/* Floating WhatsApp Button – bottom left */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        id="floating-whatsapp-btn"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 left-6 z-[200] flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black px-5 py-4 rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.5)] transition-all transform hover:scale-110 active:scale-95 border border-[#20bd5a]/40"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline text-sm">WhatsApp</span>
      </a>

      {/* Floating Call Button – bottom right */}
      <a
        href={`tel:${PHONE}`}
        id="floating-call-technician-btn"
        aria-label="Call Technician"
        className="fixed bottom-6 right-6 z-[200] flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black px-5 py-4 rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.5)] transition-all transform hover:scale-110 active:scale-95 border border-emerald-300/40"
      >
        <Phone className="w-5 h-5 animate-bounce" />
        <span className="hidden sm:inline text-sm">Call Now</span>
      </a>
    </>
  );
}
