"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, Settings, X } from "lucide-react";
import BrandLogo from "./BrandLogo";
import { useAuth } from "@/context/AuthContext";

type NavLink = { href: string; label: string };

const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Products" },
  { href: "/orders", label: "Orders" },
  { href: "/ai-diagnosis", label: "AI Diagnosis" },
  { href: "/service", label: "Service" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = useMemo(() => {
    if (user?.role === "ADMIN") {
      return [...NAV_LINKS, { href: "/admin", label: "Admin" }];
    }
    return NAV_LINKS;
  }, [user?.role]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const navShellClass = isAdminRoute
    ? "border-slate-800/80 bg-slate-950/70 text-slate-100"
    : "border-slate-200/80 bg-white/70 text-slate-900";
  const linkBaseClass = isAdminRoute ? "text-slate-300 hover:text-cyan-300" : "text-slate-600 hover:text-blue-700";
  const activeClass = isAdminRoute ? "text-cyan-300" : "text-blue-600";

  return (
    <>
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl ${navShellClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between gap-3 py-4">
          <Link href="/" className="whitespace-nowrap">
            <BrandLogo compact />
          </Link>

          <div className="hidden items-center gap-7 text-sm font-semibold md:flex">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${linkBaseClass} ${pathname === item.href ? activeClass : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 sm:gap-3 md:flex">
            {loading ? (
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${isAdminRoute ? "border border-slate-700 bg-slate-900 text-slate-200" : "border border-slate-200 bg-slate-100 text-slate-700"}`}>
                Checking session...
              </span>
            ) : user ? (
              <>
                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${isAdminRoute ? "border border-slate-700 bg-slate-900 text-slate-200" : "border border-slate-200 bg-slate-100 text-slate-700"}`}>
                  Welcome, {user.name || "User"}
                </span>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-transform hover:bg-cyan-400 active:scale-95"
                  >
                    <Settings className="h-4 w-4" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="min-h-[48px] rounded-full px-4 py-2 text-sm font-semibold text-red-600 transition-transform hover:bg-red-50 active:scale-95"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`min-h-[48px] rounded-full px-4 py-2 text-sm font-semibold transition-transform active:scale-95 ${isAdminRoute ? "text-slate-200 hover:bg-slate-900" : "text-slate-700 hover:bg-slate-100"}`}>
                  Login
                </Link>
                <Link href="/signup" className="min-h-[48px] rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-transform hover:bg-blue-700 active:scale-95">
                  Get Started
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
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" className={`flex min-h-[48px] items-center justify-center rounded-xl text-sm font-semibold ${isAdminRoute ? "bg-slate-900 text-slate-100" : "bg-slate-100 text-slate-700"}`}>
                    Login
                  </Link>
                  <Link href="/signup" className="flex min-h-[48px] items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
