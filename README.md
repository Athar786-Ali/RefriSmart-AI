<div align="center">

# 🤖 RefriSmart-AI

### AI-Powered Appliance Repair & Service Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-DB-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-02042B?style=for-the-badge&logo=razorpay&logoColor=white" />
</p>

### 🌐 [Live Demo → refrismart-ai.vercel.app](https://refrismart-ai.vercel.app)

</div>

---

## 🌟 Overview

**RefriSmart-AI** is a production-deployed, full-stack SaaS platform built for a physical appliance repair business (Golden Refrigeration) in Bhagalpur. It transforms a traditional offline local business into a digitally-powered ecosystem.

> **Built end-to-end by a solo developer** — from database schema design and RESTful API architecture to UI/UX, multimodal AI integration, deployment pipelines, and JSON-LD local SEO strategy.

---

## 📈 Real-World Business Impact

RefriSmart-AI was built to solve **actual operational pain points** for a physical business, delivering measurable outcomes:

| Problem Before | Solution Delivered | Business Outcome |
|---|---|---|
| Customers described faults over phone — hard to triage | **AI Vision diagnosis** before booking via photo/video upload | Technicians arrive prepared; significant drop in wasted visits |
| Manual cash collection at doorstep | **Razorpay integration** (₹349 upfront visiting fee) | Acts as a commitment signal, effectively eliminating no-shows |
| Zero visibility into daily bookings and revenue | **Live Admin Dashboard** with stats and funnel tracking | Owner monitors operations, tracks revenue, and manages technicians from any device |
| Paper-based service records | **PostgreSQL** with full `ServiceEvent` audit trail | Every job has a permanent, queryable lifecycle history |
| Old appliances had no resale channel | **Sell & Refurbish marketplace** workflow | Unlocked a new revenue stream — refurbished appliances re-listed for sale |

---

## 🏗️ System Architecture & Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend API:** Express.js v5 (Vercel Serverless Functions)
- **Database:** PostgreSQL (Neon) with Prisma ORM
- **Authentication:** Stateless JWT in HTTP-only cookies + OTP via Nodemailer
- **External APIs:** Google Gemini Vision (AI), Cloudinary (CDN), Razorpay (Payments)

---

## 🧠 Key Technical Achievements

If reviewing this project, here are the most complex engineering challenges solved:

### 1. AI Resilience & Multi-Key Rotation
A production system cannot afford AI API downtime.
- Implemented a **multi-key rotation pool** that automatically cycles through fallback Gemini API keys when rate-limited.
- Built a **4-tier fallback system**: `gemini-flash-lite` → `gemini-flash` → `gemini-pro` → **Offline Rule-Based Engine**. Diagnostics never fail silently.

### 2. Dual-Mode Auth (Safari Third-Party Cookie Fix)
Safari blocks cross-origin third-party cookies by default, which broke standard JWT cookie auth when the backend API and Next.js frontend were on different Vercel subdomains.
- Engineered a **dual-mode auth middleware** that falls back to `Authorization: Bearer` headers when cookies are dropped, ensuring 100% login reliability across all mobile and desktop browsers.

### 3. Serverless Database Connection Pooling
- Integrated **Prisma with pgBouncer (Neon)** to handle connection reuse across cold-started serverless function invocations. Without this, sudden traffic spikes would exhaust the PostgreSQL connection limit instantly.

### 4. Advanced Database Design (Audit Trails)
- Instead of mutating a `status` string on bookings, every state transition appends a new row to a `ServiceEvent` table. This provides a **full replay-able history** (audit trail) of a booking's lifecycle without complex database triggers.

### 5. Invisible Local SEO Architecture
- Engineered dynamic **JSON-LD structured data injection** (LocalBusiness, Service, FAQ schemas) without modifying the React UI components, drastically improving local search ranking for "AC repair in Bhagalpur" on Google.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/Athar786-Ali/RefriSmart-AI.git
cd RefriSmart-AI

# 2. Install dependencies (Monorepo)
cd frontend && npm install
cd ../backend && npm install

# 3. Environment Variables (Required in backend/.env)
# DATABASE_URL, JWT_SECRET, CLOUDINARY_*, GEMINI_API_KEY, RAZORPAY_*, SMTP_*

# 4. Run Locally
cd backend && npm run dev    # Starts Express API on :5001
cd ../frontend && npm run dev # Starts Next.js on :3000
```

---

<div align="center">
  <i>Designed and developed by Md Athar Ali</i>
</div>
