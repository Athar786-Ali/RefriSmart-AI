"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav className="flex justify-between items-center px-10 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <Link href="/" className="text-2xl font-black tracking-tighter text-blue-600">
        GOLDEN <span className="text-slate-800">REF.</span>
      </Link>

      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <span className="text-slate-900 font-bold text-sm bg-slate-100 px-4 py-2 rounded-full">
              Bhai, {user.name} 👋
            </span>
            <button onClick={handleLogout} className="text-red-500 font-bold text-sm hover:underline">Logout</button>
          </>
        ) : (
          <>
            // frontend/app/components/Navbar.tsx mein change kar:
<Link href="/login" className="px-5 py-2 rounded-full font-medium text-slate-700 hover:bg-slate-100 transition">
  Login
</Link>
<Link href="/signup" className="px-5 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
  Get Started
</Link>
          </>
        )}
      </div>
    </nav>
  );
}   
