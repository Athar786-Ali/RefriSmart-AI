"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  LayoutDashboard, Wrench, ShoppingBag, Package, Images, Bot,
  RefreshCw, LogOut, Menu, X, Users,
} from "lucide-react";
import { DashboardSection } from "./_dashboard";
import { ServicesSection } from "./_services";
import { OrdersSection } from "./_orders";
import { ProductsSection } from "./_products";
import { GallerySection } from "./_gallery";
import { DiagnosesSection } from "./_diagnoses";
import { SellSection } from "./_sell";
import { ProfileSection } from "./_profile";
import type {
  Stats, Booking, Order, GalleryItem, Analytics, SellReq,
} from "./_types";
import type { DiagnosisItem } from "@/types";

type Section = "dashboard"|"services"|"orders"|"products"|"gallery"|"diagnoses"|"sell"|"profile";

const NAV: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard",     icon: LayoutDashboard },
  { id: "services",  label: "Service Ops",   icon: Wrench },
  { id: "orders",    label: "Orders",         icon: ShoppingBag },
  { id: "products",  label: "Products",       icon: Package },
  { id: "gallery",   label: "Gallery",        icon: Images },
  { id: "diagnoses", label: "AI Diagnoses",   icon: Bot },
  { id: "sell",      label: "Sell Requests",  icon: RefreshCw },
  { id: "profile",   label: "Profile",        icon: Users },
];

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [sec, setSec] = useState<Section>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [ready, setReady] = useState(false);

  /* ── data ── */
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [bookings,  setBookings]  = useState<Booking[]>([]);
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [gallery,   setGallery]   = useState<GalleryItem[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);
  const [sells,     setSells]     = useState<SellReq[]>([]);

  /* ── auth guard — uses AuthContext (fixes refresh-logout bug) ── */
  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) router.replace("/");
  }, [user, loading, router]);

  /* ── load all data ── */
  const load = useCallback(async () => {
    if (!user || user.role !== "ADMIN") return;
    try {
      const opts: RequestInit = { credentials: "include", cache: "no-store" };
      const [sR, bR, aR, gR, oR, dR, sellR] = await Promise.all([
        fetch(`${API}/admin/stats?t=${Date.now()}`,            opts),
        fetch(`${API}/admin/service-overview?t=${Date.now()}`, opts),
        fetch(`${API}/ops/analytics?t=${Date.now()}`,          opts),
        fetch(`${API}/gallery?t=${Date.now()}`,                opts),
        fetch(`${API}/admin/orders?t=${Date.now()}`,           opts),
        fetch(`${API}/admin/all-diagnoses?t=${Date.now()}`,    opts),
        fetch(`${API}/sell/requests?t=${Date.now()}`,          opts),
      ]);

      let sp = await sR.json().catch(() => null);
      if (!sR.ok || sp?.error) {
        const fb = await fetch(`${API}/admin/stats-basic?t=${Date.now()}`, opts);
        sp = await fb.json().catch(() => null);
      }
      if (sp) setStats({ ...sp, totalBookings: Number(sp.totalBookings||0), totalUsers: Number(sp.totalUsers||0), totalProducts: Number(sp.totalProducts||0) });

      const bp = await bR.json().catch(() => null);
      setBookings(Array.isArray(bp?.bookings) ? bp.bookings : []);

      const ap = await aR.json().catch(() => null);
      if (ap && typeof ap === "object") setAnalytics(ap);

      const gp = await gR.json().catch(() => null);
      setGallery(Array.isArray(gp) ? gp : []);

      const op = await oR.json().catch(() => null);
      setOrders(Array.isArray(op) ? op : []);

      const dp = await dR.json().catch(() => null);
      setDiagnoses(Array.isArray(dp) ? dp : []);

      const sp2 = await sellR.json().catch(() => null);
      setSells(Array.isArray(sp2) ? sp2 : Array.isArray(sp2?.requests) ? sp2.requests : []);
    } catch (e) {
      console.error(e);
      toast.error("Some data failed to load.");
    } finally {
      setReady(true);
    }
  }, [user]);

  useEffect(() => { if (user?.role === "ADMIN") load(); }, [user, load]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    const interval = setInterval(() => { load(); }, 15_000);
    return () => clearInterval(interval);
  }, [user, load]);

  /* ── guards ── */
  if (loading || !ready) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin" />
        <p className="text-slate-400 text-sm font-semibold tracking-widest uppercase">Loading Admin Panel…</p>
      </div>
    </div>
  );
  if (!user || user.role !== "ADMIN") return null;

  /* ── computed ── */
  const activeQ  = bookings.filter(b => !["COMPLETED","CANCELLED"].includes(b.status));
  const liveO    = orders.filter(o => String(o.paymentStatus) !== "PAID" && o.orderStatus !== "DELIVERED");

  const sectionProps = {
    stats, setStats, bookings, setBookings, orders, setOrders,
    gallery, setGallery, analytics, diagnoses, sells, setSells,
    API,
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* overlay */}
      {sideOpen && (
        <div className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSideOpen(false)} />
      )}

      {/* ═══ SIDEBAR ═══ */}
      <aside className={`fixed lg:relative z-40 h-full flex flex-col w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 transition-transform duration-300 ${sideOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* brand */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50 shrink-0">
            <span className="text-white font-black text-sm">GR</span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-black text-sm leading-tight">Golden Refrigeration</p>
            <p className="text-cyan-400 text-[10px] font-bold tracking-widest uppercase">Admin Panel</p>
          </div>
          <button className="ml-auto lg:hidden text-slate-400 hover:text-white shrink-0" onClick={() => setSideOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* admin badge */}
        <div className="px-4 py-3 border-b border-slate-800/50 shrink-0">
          <div className="flex items-center gap-3 bg-slate-800/60 rounded-xl p-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm shrink-0">
              {(user.name || "A")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-bold truncate">{user.name || "Admin"}</p>
              <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider">Administrator</p>
            </div>
          </div>
        </div>

        {/* nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = sec === id;
            const badge  = id === "services" ? activeQ.length : id === "orders" ? liveO.length : 0;
            return (
              <button key={id} onClick={() => { setSec(id); setSideOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${active
                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/70"}`}>
                <Icon className={`w-5 h-5 shrink-0 ${active ? "text-cyan-400" : ""}`} />
                <span className="truncate">{label}</span>
                {badge > 0 && (
                  <span className={`ml-auto text-[10px] font-black rounded-full px-2 py-0.5 shrink-0
                    ${id === "services" ? "bg-cyan-500 text-slate-950" : "bg-orange-500 text-white"}`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* logout */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <button onClick={async () => { await logout(); router.replace("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* topbar */}
        <header className="flex items-center gap-4 px-5 py-3.5 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 shrink-0">
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSideOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white font-black text-lg leading-none">
              {NAV.find(n => n.id === sec)?.label}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">Golden Refrigeration · Bhagalpur</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={load} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg transition-all">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-xs font-bold">Live</span>
            </div>
          </div>
        </header>

        {/* sections */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top_right,_#0d1b2a_0%,_#020617_70%)]">
          {sec === "dashboard"  && <DashboardSection {...sectionProps} />}
          {sec === "services"   && <ServicesSection  {...sectionProps} />}
          {sec === "orders"     && <OrdersSection    {...sectionProps} />}
          {sec === "products"   && <ProductsSection  {...sectionProps} />}
          {sec === "gallery"    && <GallerySection   {...sectionProps} />}
          {sec === "diagnoses"  && <DiagnosesSection {...sectionProps} />}
          {sec === "sell"       && <SellSection      {...sectionProps} />}
          {sec === "profile"    && <ProfileSection   user={user} logout={logout} router={router} />}
        </main>
      </div>
    </div>
  );
}
