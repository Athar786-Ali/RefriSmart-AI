// frontend/src/app/blog/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { SITE_URL, BUSINESS_NAME, BLOG_POSTS } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "Appliance Repair Blog – Tips, Guides & Pricing | Golden Refrigeration Bhagalpur",
  description:
    "Expert tips, repair guides, and pricing information for AC, refrigerator, and washing machine repair in Bhagalpur, Bihar. Stay informed with Golden Refrigeration's appliance repair blog.",
  keywords: [
    "appliance repair blog Bhagalpur",
    "refrigerator repair tips",
    "AC repair guide",
    "washing machine repair blog",
    "fridge not cooling guide",
    "AC gas leakage tips",
  ],
  openGraph: {
    title: "Appliance Repair Blog – Golden Refrigeration Bhagalpur",
    description: "Expert appliance repair tips and guides for Bhagalpur households.",
    url: `${SITE_URL}/blog`,
  },
  alternates: { canonical: `${SITE_URL}/blog` },
};

const categoryColors: Record<string, string> = {
  Refrigerator: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  AC: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "Buying Guide": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Pricing: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

export default function BlogIndex() {
  return (
    <main className="min-h-screen bg-slate-950 text-white pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-400 font-bold mb-3">
            Expert Knowledge
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
            Appliance Repair{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Blog
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Expert repair tips, guides, and pricing information from Golden
            Refrigeration — Bhagalpur's most trusted appliance repair service.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-3xl p-8 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    categoryColors[post.category] ??
                    "bg-slate-700 text-slate-300 border-slate-600"
                  }`}
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {post.category}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(post.publishDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h2 className="text-xl font-black text-white mb-3 leading-tight group-hover:text-blue-300 transition-colors">
                {post.title}
              </h2>

              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {post.excerpt}
              </p>

              <span className="flex items-center gap-2 text-cyan-400 font-bold text-sm group-hover:gap-3 transition-all">
                Read Article <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-900/40 to-slate-900 rounded-3xl p-10 border border-blue-900/30 text-center">
          <h2 className="text-2xl font-black text-white mb-3">
            Need Appliance Repair in Bhagalpur?
          </h2>
          <p className="text-slate-400 mb-6">
            Don't wait — our certified technicians are ready for same-day service.
          </p>
          <a
            href="tel:+917070494254"
            className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105"
          >
            Call +91 7070494254
          </a>
        </div>
      </div>
    </main>
  );
}
