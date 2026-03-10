"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Signup successful. You can now login.");
      router.push("/login");
    } else {
      alert(data.error || "Signup failed!");
    }
  };

  return (
    <main className="min-h-[80vh] px-4 sm:px-6 py-12 grid place-items-center">
      <section className="w-full max-w-5xl rounded-[2rem] border border-slate-200 bg-white shadow-xl overflow-hidden grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-300">Create Account</p>
            <h1 className="text-4xl font-black mt-4 leading-tight">Build your professional service profile.</h1>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Register once to access diagnostics, service history, and inventory workflows.
          </p>
        </div>

        <div className="p-8 sm:p-10">
          <h2 className="text-3xl font-black text-slate-900">Create your account</h2>
          <p className="text-slate-600 mt-2 mb-8 text-sm">
            Join Golden Refrigeration in under a minute.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Full name"
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email address"
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200">
              Create Account
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
