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
      window.dispatchEvent(new Event("storage"));
      alert(`Welcome back, ${data.user.name}`);
      router.push("/");
      router.refresh();
    } else {
      alert(data.error || "Login failed!");
    }
  };

  return (
    <main className="min-h-[80vh] px-4 sm:px-6 py-12 grid place-items-center">
      <section className="w-full max-w-5xl rounded-[2rem] border border-slate-200 bg-white shadow-xl overflow-hidden grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-blue-100">Golden Refrigeration</p>
            <h1 className="text-4xl font-black mt-4 leading-tight">Professional appliance care made simple.</h1>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed">
            Sign in to manage diagnostics, track consultations, and access your product inventory tools.
          </p>
        </div>

        <div className="p-8 sm:p-10">
          <h2 className="text-3xl font-black text-slate-900">Welcome back</h2>
          <p className="text-slate-600 mt-2 mb-8 text-sm">
            Log in to continue to your dashboard.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-blue-700 shadow-md">
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-blue-700 font-semibold hover:underline">
              Create one
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
