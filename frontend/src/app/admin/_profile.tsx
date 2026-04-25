"use client";
import { ShieldCheck, Phone, Mail, LogOut, ExternalLink } from "lucide-react";
import type { AuthUser } from "@/context/AuthContext";

type ProfileProps = {
  user: AuthUser;
  logout: () => Promise<void>;
  router: ReturnType<typeof import("next/navigation").useRouter>;
};

export function ProfileSection({ user, logout, router }: ProfileProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Admin identity card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        {/* gradient header */}
        <div className="h-24 bg-gradient-to-r from-cyan-600/40 via-blue-600/40 to-purple-600/30 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(6,182,212,0.15)_0%,transparent_70%)]" />
        </div>

        {/* Avatar */}
        <div className="-mt-10 px-6 pb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-900/50 border-4 border-slate-900 text-white font-black text-3xl mb-4">
            {(user.name || "A")[0].toUpperCase()}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">{user.name || "Admin"}</h2>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-bold">Administrator · Golden Refrigeration</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {user.email && (
              <div className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-3">
                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Email</p>
                  <p className="text-sm text-white font-semibold">{user.email}</p>
                </div>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-3">
                <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Phone</p>
                  <p className="text-sm text-white font-semibold">{user.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Role</p>
                <p className="text-sm text-cyan-300 font-black">ADMIN · Full Access</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">Quick Links</p>
        <div className="space-y-2">
          {[
            { label: "View Customer Website", href: "/", icon: ExternalLink },
            { label: "Service Booking Page",  href: "/service", icon: ExternalLink },
            { label: "Products Showroom",     href: "/products", icon: ExternalLink },
            { label: "AI Diagnosis Tool",     href: "/ai-diagnosis", icon: ExternalLink },
          ].map(({ label, href, icon: Icon }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group">
              <span className="text-sm font-semibold text-slate-300 group-hover:text-white flex-1">{label}</span>
              <Icon className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {/* Business info */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">Business Info</p>
        <div className="space-y-2 text-sm">
          {[
            ["Business",  "Golden Refrigeration"],
            ["Owner",     "Md Athar Ali"],
            ["Contact",   "9060877595"],
            ["Location",  "Sabour, Bhagalpur, Bihar"],
            ["Services",  "AC, Refrigerator, Washing Machine, Electronics"],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3 py-2 border-b border-slate-800/50 last:border-0">
              <span className="text-slate-500 shrink-0 w-20">{k}</span>
              <span className="text-slate-200 font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={async () => { await logout(); router.replace("/"); }}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 hover:text-red-300 transition-all">
        <LogOut className="w-5 h-5" /> Sign Out
      </button>
    </div>
  );
}
