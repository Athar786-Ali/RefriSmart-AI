"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Settings, X } from "lucide-react";
import BrandLogo from "./BrandLogo";
import { useAuth } from "@/context/AuthContext";

type NavLink = { href: string; label: string };

const NAV_LINKS: NavLink[] = [
  { href: "/",            label: "Home" },
  { href: "/service",     label: "Service" },
  { href: "/products",    label: "Products" },
  { href: "/sell",        label: "Sell Appliance" },
  { href: "/orders",      label: "My Orders" },
  { href: "/ai-diagnosis",label: "AI Diagnosis" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminRoute = pathname?.startsWith("/admin");
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = NAV_LINKS;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    // Issue #26 Fix: Use Next.js router for navigation after logout.
    // window.location.href causes a full page reload discarding all client state.
    router.push("/");
  };

  const navShellClass = isAdminRoute
    ? "bg-slate-950/80 text-slate-100 border-b border-slate-800"
    : "fixed top-6 left-1/2 -translate-x-1/2 w-[96%] max-w-[1280px] rounded-[2rem] bg-slate-900/85 backdrop-blur-3xl border border-slate-700/60 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] text-white";
    
  const linkBaseClass = isAdminRoute 
    ? "text-slate-300 hover:text-cyan-300" 
    : "text-slate-300 font-medium hover:text-white";
    
  const activeClass = isAdminRoute 
    ? "text-cyan-300 font-bold" 
    : "bg-gradient-to-r from-blue-600 to-cyan-500 shadow-md border border-cyan-400/30 text-white font-bold";

  return (
    <div className={isAdminRoute ? "" : "relative z-[100] flex justify-center"}>
      <nav
        className={`${
          isAdminRoute ? "sticky top-0 z-50" : navShellClass
        } transition-all duration-300`}
      >
        <div className={`mx-auto flex w-full items-center justify-between gap-3 ${isAdminRoute ? "px-4 sm:px-6 lg:px-8 max-w-7xl py-4" : "px-3 py-2.5 pr-4"}`}>
          <Link href="/" className="whitespace-nowrap pl-2">
            <BrandLogo compact theme={isAdminRoute ? "light" : "dark"} />
          </Link>

          <div className="hidden items-center p-1.5 bg-slate-800/50 border border-slate-700/50 rounded-full gap-1 lg:gap-2 text-sm md:flex">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 lg:px-5 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${linkBaseClass} ${pathname === item.href ? activeClass : "hover:bg-slate-700/50"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 sm:gap-3 md:flex shrink-0">
            {loading ? (
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${isAdminRoute ? "border border-slate-700 bg-slate-900 text-slate-200" : "border border-slate-700 bg-slate-800 text-slate-300"}`}>
                Checking session...
              </span>
            ) : user ? (
              <>
                <span className={`rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap ${isAdminRoute ? "border border-slate-700 bg-slate-900 text-slate-200" : "border border-slate-700 bg-slate-800 text-slate-300"}`}>
                  {user.name || "User"}
                </span>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 whitespace-nowrap transition-transform hover:bg-cyan-400 active:scale-95"
                  >
                    <Settings className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="min-h-[44px] rounded-full px-4 py-2 text-sm font-semibold text-red-400 whitespace-nowrap transition-transform hover:bg-black/20 hover:text-red-300 active:scale-95"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Deprecated dual login/signup buttons - unified into one */}
                <Link
                  href="/login"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-transform hover:from-blue-700 hover:to-cyan-600 active:scale-95"
                >
                  Login / Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className={`inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl border md:hidden ${isAdminRoute ? "border-slate-700 bg-slate-900 text-slate-200" : "border-slate-200 bg-white text-slate-700"}`}
            aria-label="Open navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm md:hidden">
          <div className={`absolute right-0 top-0 h-full w-full max-w-sm border-l p-5 ${isAdminRoute ? "border-slate-700 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-900"}`}>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.16em]">Navigation</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg ${isAdminRoute ? "bg-slate-900" : "bg-slate-100"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-[48px] items-center rounded-xl px-4 text-sm font-semibold ${pathname === item.href ? (isAdminRoute ? "bg-cyan-500/20 text-cyan-300" : "bg-blue-50 text-blue-700") : (isAdminRoute ? "text-slate-200 hover:bg-slate-900" : "text-slate-700 hover:bg-slate-100")}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              {loading ? (
                <p className={`px-1 text-xs ${isAdminRoute ? "text-slate-400" : "text-slate-500"}`}>
                  Checking session...
                </p>
              ) : user ? (
                <div className="space-y-2">
                  <p className={`px-1 text-xs ${isAdminRoute ? "text-slate-400" : "text-slate-500"}`}>
                    Logged in as {user.name || "User"}
                  </p>
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="flex min-h-[48px] items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 active:scale-95"
                    >
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full min-h-[48px] rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 active:scale-95"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/login" className="flex min-h-[48px] items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white">
                    Login / Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
