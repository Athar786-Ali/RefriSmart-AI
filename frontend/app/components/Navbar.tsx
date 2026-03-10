"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import BrandLogo from "./BrandLogo";

type UserSession = {
  name: string;
} | null;

export default function Navbar() {
  const [user, setUser] = useState<UserSession>(null);

  const checkUser = () => {
    const savedUser = localStorage.getItem("user");
    try {
      setUser(savedUser ? JSON.parse(savedUser) : null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(checkUser, 0);
    window.addEventListener("storage", checkUser);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="whitespace-nowrap">
          <BrandLogo compact />
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          <Link href="/" className="hover:text-blue-700">Products</Link>
          <Link href="/ai-diagnosis" className="hover:text-blue-700">AI Diagnosis</Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline-flex rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
                Welcome, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/ai-diagnosis" className="md:hidden px-3 py-2 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-100">
                AI
              </Link>
              <Link href="/login" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Login
              </Link>
              <Link href="/signup" className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
