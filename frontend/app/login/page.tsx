"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  
  // 🔥 Ye line add karo: Ye signal bhejega ki storage change hua hai
  window.dispatchEvent(new Event("storage")); 

  alert("Welcome back, " + data.user.name);
  router.push("/");
  router.refresh();
}else {
      alert(data.error || "Login failed!");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 bg-[#f8fafc]">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 max-w-md w-full">
        <h1 className="text-3xl font-black text-slate-900 mb-2 italic">Welcome Back.</h1>
        <p className="text-slate-500 mb-8 text-sm font-medium tracking-tight">Login to your Golden Ref account.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" placeholder="Email Address" 
            className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-900"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-900"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button className="w-full bg-slate-950 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 shadow-xl shadow-slate-200 transition-all mt-4">
            Sign In
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-500">
          Don't have an account? <a href="/signup" className="text-blue-600 font-bold hover:underline">Create one</a>
        </p>
      </div>
    </div>
  );
}