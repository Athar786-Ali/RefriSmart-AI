<div align="center">

# 🤖 RefriSmart-AI

### A Production SaaS Platform — Live, Revenue-Generating & Ranking on Google

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma_ORM-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Gemini-Vision_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-02042B?style=for-the-badge&logo=razorpay&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" />
</p>

<br />

### 🌐 [**Live Production Site → www.goldenrefrigeration.in**](https://www.goldenrefrigeration.in)

<br />

**42,900 lines of TypeScript** · **95 source files** · **14 database models** · **55+ REST API endpoints** · **4 JSON-LD schemas**

</div>

---

## 📌 TL;DR for Recruiters

| | |
|---|---|
| **What is it?** | A full-stack SaaS platform I built from scratch for a real appliance repair business. It handles AI-powered diagnostics, live payment processing, technician dispatch, a product marketplace, and a complete admin CRM. |
| **Is it in production?** | **Yes.** It processes real customers, handles live Razorpay payments in INR, and ranks on **Page 1 of Google** — competing head-to-head with JustDial and IndiaMART. |
| **My role** | **Solo Full-Stack Developer.** I owned every layer: requirements gathering, database schema design, backend API architecture, React UI, multimodal AI integration, payment gateway, SEO strategy, and Vercel deployment. |
| **Why it matters** | This is not a tutorial clone. It solves real-world operational pain for a physical business. Every engineering decision — from the AI fallback chain to connection pooling — was driven by production incidents I debugged and fixed. |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    HTTPS     ┌──────────────────────┐             │
│  │  Next.js 16  │ ──────────► │  Vercel Serverless   │             │
│  │  React 19    │  REST API   │  Express.js v5       │             │
│  │  App Router  │ ◄────────── │  (Stateless Funcs)   │             │
│  │  Tailwind v4 │             └──────────┬───────────┘             │
│  └──────────────┘                        │                          │
│        │                                 │                          │
│  ┌─────▼──────┐               ┌──────────▼───────────┐             │
│  │ Cloudinary  │               │  Neon pgBouncer      │             │
│  │ CDN (Media) │               │  Connection Pooler   │             │
│  └─────────────┘               └──────────┬───────────┘             │
│                                           │                         │
│  ┌──────────────┐              ┌──────────▼───────────┐             │
│  │ Google Gemini│              │  PostgreSQL           │             │
│  │ Vision API   │              │  14 Models, 7 Enums   │             │
│  │ (5-Key Pool) │              │  Prisma ORM v7        │             │
│  └──────────────┘              └──────────────────────┘             │
│                                                                     │
│  ┌──────────────┐  ┌────────────┐  ┌────────────────┐              │
│  │  Razorpay    │  │ Nodemailer │  │  MSG91 OTP     │              │
│  │  (Payments)  │  │ (Email)    │  │  (WhatsApp/SMS)│              │
│  └──────────────┘  └────────────┘  └────────────────┘              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Platform Modules (Not a Simple CRUD App)

This platform has **3 distinct user portals** (Customer, Technician, Admin) and **5 core modules**:

### 1. 🛠️ Service Dispatch Engine
An end-to-end repair lifecycle manager with a **9-state finite state machine** (`PENDING → ASSIGNED → OUT_FOR_REPAIR → REPAIRING → FIXED → PAYMENT_PENDING → COMPLETED`) and OTP-verified job completion. Customers book time slots, the admin assigns a technician by pincode, and every state transition is recorded in an append-only `ServiceEvent` audit log.

### 2. 🧠 Multimodal AI Diagnostics
Customers upload a photo or video of a broken appliance. The system sends it to **Google Gemini Vision API** for real-time fault triage — identifying the specific component failure (e.g., "R-600a gas leak" or "PCB capacitor blown") with step-by-step repair explanations and cost estimates. Supports both English and Hinglish responses via automatic language detection.

### 3. 🛒 Refurbished Marketplace
A buy/sell platform for appliances. Products have `NEW` and `REFURBISHED` types, condition scores, serial number tracking, warranty type (Brand vs. Shop), and stock management. Customers can submit a **Sell Request** with photos, receive price offers from the admin, and the accepted item is auto-listed as a refurbished product.

### 4. 📊 Admin CRM Dashboard
A full back-office suite with 8 dedicated views: Dashboard (live revenue & stats), Services (booking management), Orders (e-commerce fulfillment with delivery status tracking), Products (inventory CRUD with AI-powered price suggestions), Sell Requests (offer negotiation pipeline), Diagnoses (AI diagnosis history viewer), Gallery (media management), and Profile settings.

### 5. 💳 Payment & Invoice System
Razorpay integration with cryptographic HMAC-SHA256 webhook verification. Supports both service booking payments (₹349 visiting fee) and product order payments. Auto-generates PDF invoices and delivers them via Nodemailer.

---

## 🏢 Real-World Business Impact

> _Every feature was built to solve a specific operational pain point — not as a portfolio exercise._

| Business Problem | My Engineering Solution | Measurable Impact |
| :--- | :--- | :--- |
| **50%+ no-show rate** — technicians arrived to empty houses | Mandatory ₹349 upfront Razorpay payment during booking flow | **Eliminated no-shows** — payment acts as a hard commitment signal |
| **Blind dispatching** — technicians didn't know what parts to bring | Multimodal AI triage via Gemini Vision — diagnoses faults *before* dispatch | **Higher first-visit fix rate** — techs arrive knowing it's a compressor vs. a relay |
| **Zero online discoverability** — business existed only on paper + JustDial | Programmatic SEO with 4 JSON-LD schemas and 60+ geo-targeted keywords | **Page 1 of Google** for "AC repair Bhagalpur" — outranking JustDial |
| **No operational data** — paper records, no revenue tracking | PostgreSQL-backed admin dashboard with event-sourced audit trails | Owner tracks daily revenue, assigns jobs, and views full repair lifecycle |
| **Wasted return visits** — customers couldn't describe faults accurately | AI diagnosis with photo/video upload generates technical fault reports | Customers share AI reports with technicians — reducing miscommunication |

---

## 🧠 Deep-Dive: Technical Decisions & Trade-offs

> _I believe a strong engineer is defined by how they navigate trade-offs. These are the hardest problems I solved._

### 1. AI Resilience — 7-Model × 5-Key Rotation Pool

**Problem:** A single free-tier Gemini API key = 1,500 requests/day. In production, a rate limit means the core business feature silently breaks.

**Solution:** I engineered a multi-dimensional fallback system:
- **5-Key Rotation Pool:** Each `.env` key maps to a separate Google Cloud project = separate quota. On a `429 RESOURCE_EXHAUSTED`, the system calls `rotateKey()` to switch to the next project's key and retries immediately.
- **7-Model Cascade:** If a model is overloaded (`503`), the system falls through: `gemini-3.5-flash` → `gemini-2.0-flash` → `gemini-2.0-flash-lite` → `gemini-2.5-flash-preview` → `gemini-1.5-flash` → `gemini-1.5-flash-8b` → `gemini-1.5-pro`.
- **Exponential Backoff:** Per-model retry with progressive delays (12s → 24s → 36s).
- **Offline Rule-Based Engine:** If *all* Gemini keys and models are exhausted, a handwritten domain-expert rule engine kicks in with appliance-specific diagnostics (5 specialized diagnostic rulesets for fridges, ACs, washing machines, noise issues, and power failures — each with bilingual English/Hinglish responses and realistic Bhagalpur pricing).

**Result:** Diagnostics on this platform **never fail silently** — even with zero API availability.

### 2. Safari Cross-Origin Cookie Drop (ITP)

**Problem:** JWT auth used `HttpOnly` cookies. But the frontend (Vercel) and backend (separate Vercel deployment) lived on different origins. Safari's Intelligent Tracking Prevention silently dropped the cookies, causing **100% auth failure on iOS/Safari** — which is the majority of mobile users in India.

**Solution:** I implemented **Dual-Mode Auth** across both frontend and backend:
- **Backend middleware** (`authMiddleware.ts`): Attempts `HttpOnly` cookie first → falls back to `Authorization: Bearer` header.
- **Frontend API client** (`api.ts`): A custom `authFetch()` wrapper that stores the JWT in `localStorage` and injects it as a `Bearer` token on every request — while still sending `credentials: "include"` for cookie-based auth.
- **Session keepalive**: The `AuthContext` silently re-verifies the session every 10 minutes with a max of 3 network failure retries before invalidating.

**Result:** 100% auth reliability across Chrome, Safari, Firefox, and iOS Safari.

### 3. Serverless Connection Exhaustion

**Problem:** The Express backend runs on Vercel Serverless Functions. A traffic spike spins up dozens of isolated Node.js instances — each opening a direct PostgreSQL connection. This instantly exhausts Neon's connection limit and crashes the database.

**Solution:** I configured Prisma ORM with the `@prisma/adapter-pg` driver adapter connected through **Neon's pgBouncer** connection pooler. Serverless functions connect to the pooler (which multiplexes connections) rather than directly to the database.

**Result:** The app scales horizontally without database starvation.

### 4. Event-Sourced Audit Trails

**Problem:** Overwriting a `status` column destroys historical data. The business owner needs to know *when* a technician was assigned, *when* they started repairing, and *when* the job was closed.

**Solution:** Every state transition writes an append-only row to the `ServiceEvent` table with a timestamp and the status. The admin dashboard renders this as a replayable timeline per booking.

### 5. OTP Delivery with 3-Tier Channel Fallback

**Problem:** OTP delivery needs to work reliably for Indian phone numbers across varying network conditions.

**Solution:** I built a priority-chain delivery system:
1. **MSG91 WhatsApp** (most professional — shows "Golden Refrigeration" as sender)
2. **MSG91 SMS** (works immediately with free trial)
3. **Dev Console Fallback** (no config needed — OTP is logged to stdout for development)

Each channel has a 10-second `AbortController` timeout. In production, if both WhatsApp and SMS fail, the system throws a clear error. In development, it gracefully falls back to console logging.

---

## 🏗️ Full Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5 | SSR, Client Components, type-safe UI |
| **Styling** | Tailwind CSS v4, Lucide Icons | Mobile-first responsive design |
| **State** | React Context API (`AuthContext`) | Session management with localStorage hydration |
| **Backend** | Node.js 20+, Express.js v5 | REST API (Vercel Serverless Functions) |
| **Database** | PostgreSQL 16 (Neon), Prisma ORM v7 | 14 models, 7 enums, type-safe queries, migrations |
| **AI** | Google Gemini Vision API (`@google/genai`) | Multimodal image/video diagnosis |
| **Payments** | Razorpay SDK | INR payment processing + HMAC-SHA256 webhook verification |
| **Media** | Cloudinary SDK | Image/video CDN with local fallback storage |
| **Email** | Nodemailer | OTP emails, invoice PDF delivery |
| **OTP** | MSG91 (WhatsApp + SMS) | Phone OTP delivery with channel fallback |
| **File Upload** | Multer (100MB limit) | Multipart form data handling |
| **Deployment** | Vercel (Git-connected CI/CD) | Auto-deploy on push to `main` |

---

## 📊 Database Schema (14 Models, 7 Enums)

```
User ──────────┬──── ServiceBooking ──── ServiceAssignment ──── Technician
               │          │
               │          ├──── ServiceEvent (append-only audit trail)
               │          ├──── ServiceOtp
               │          └──── DocumentLog
               │
               ├──── Product ──── ProductOrder
               │
               ├──── DiagnosisLog (AI diagnosis history)
               │
               └──── SellRequest ──── SellOffer

Gallery (standalone)       Notification (standalone)
```

**Key enums:** `Role` (ADMIN, CUSTOMER, TECHNICIAN) · `Status` (9-state FSM) · `OrderStatus` (5-state) · `PaymentStatus` · `ProductType` (NEW, REFURBISHED) · `WarrantyType` (BRAND, SHOP) · `SellRequestStatus` (5-state lifecycle)

---

## 🔒 Security Implementation

| Threat | Mitigation |
|---|---|
| **Password theft** | Salted + hashed via `bcryptjs` (never stored in plaintext) |
| **XSS token theft** | JWT issued via `HttpOnly` cookies (inaccessible to JavaScript) |
| **Payment spoofing** | Razorpay webhook signatures verified via `crypto.createHmac('sha256')` |
| **CSRF / Open CORS** | Production CORS restricted to explicit origin allowlist (not `origin: true`) |
| **Unauthorized access** | Two-tier middleware: `userAuth` (JWT verification) + `adminAuth` (role check against DB) |
| **Resource abuse** | Multer file size limits (25MB diagnosis, 100MB gallery), request body limit (100MB) |
| **Session hijacking** | Auto session refresh every 10 min + 3-strike network failure invalidation |

---

## 🌐 SEO Engineering (Page 1 of Google)

This isn't just "add meta tags." I engineered a comprehensive Local SEO system:

- **4 JSON-LD Schemas** injected into the DOM: `LocalBusiness` (with `HomeAndConstructionBusiness`), `WebSite` (with `SearchAction` for sitelinks), `FAQPage` (12 high-intent Q&As), and `Service` (with `OfferCatalog`).
- **60+ geo-targeted keywords** covering brand × service × area combinations (e.g., "Samsung refrigerator repair Bhagalpur", "AC gas filling Sabour").
- **13 `areaServed` places** with PIN codes for hyperlocal targeting.
- **Dynamic Metadata API** — per-route titles, descriptions, OpenGraph, Twitter Cards.
- **Programmatic `sitemap.xml`** and `robots.ts` with admin/private route exclusions.
- **Google Search Console verified** with site verification token.

**Result:** The custom domain outranks JustDial, IndiaMART, and Sulekha for local intent searches.

---

## 📁 Project Structure

```
RefriSmart-AI/
├── frontend/                    # Next.js 16 (App Router)
│   └── src/
│       ├── app/                 # 10 routes (pages)
│       │   ├── page.tsx         # Landing page (24KB — full business showcase)
│       │   ├── service/         # Service booking flow
│       │   ├── ai-diagnosis/    # Multimodal AI diagnosis
│       │   ├── products/        # Product marketplace
│       │   ├── sell/            # Sell request flow
│       │   ├── orders/          # Order tracking
│       │   ├── gallery/         # Photo/video gallery
│       │   ├── admin/           # Admin CRM (8 views — 102KB total)
│       │   ├── technician/      # Technician job portal
│       │   ├── login/           # Auth (email + phone OTP)
│       │   └── verify-otp/      # OTP verification
│       ├── components/          # 11 reusable components
│       ├── context/             # AuthContext (session management)
│       ├── lib/                 # API client, Razorpay, status utils
│       └── types/               # Shared TypeScript interfaces
│
├── backend/                     # Express.js v5 (Vercel Serverless)
│   └── src/
│       ├── controllers/         # 4 controllers (202KB of business logic)
│       │   ├── adminController  # 93KB — bookings, technicians, gallery, sell
│       │   ├── aiController     # 31KB — Gemini integration, fallback engine
│       │   ├── authController   # 30KB — register, login, OTP, password reset
│       │   └── productController# 46KB — CRUD, orders, invoices, pricing AI
│       ├── routes/              # 4 route files (55+ endpoints)
│       ├── middlewares/         # Dual-mode auth (cookie + bearer)
│       ├── services/            # diagnosisService, mediaStorage, OTP delivery
│       ├── config/              # Gemini key pool, Prisma, Razorpay, Cloudinary
│       └── utils/               # Service status FSM, email helpers
│
└── docs/                        # Interview prep materials
```

---

## ⚡ API Endpoint Summary (55+ Routes)

| Module | Endpoints | Auth | Key Operations |
|---|---|---|---|
| **Auth** | 14 | Mixed | Register, Login (email + phone OTP), Logout, Verify OTP, Reset Password |
| **AI** | 2 | Optional | `POST /diagnose` (multimodal), `GET /history` |
| **Bookings** | 18 | User/Admin | Create, Assign Technician, Status FSM, Razorpay, OTP, Timeline, Cancel |
| **Products** | 12 | User/Admin | Browse, Add, Delete, Seed, Price AI, Image Upload |
| **Orders** | 8 | User/Admin | Create, Track, Razorpay, Invoice Generation & Download |
| **Sell** | 6 | User/Admin | Submit Request, Upload Image, Send Offer, Accept/Reject, Move to Refurbished |
| **Gallery** | 3 | Admin | Upload (100MB media), List, Delete |
| **Technician** | 4 | Admin | View Jobs, Update Status, Notifications |
| **Analytics** | 4 | Admin | Stats, Service Overview, All Diagnoses, Ops Analytics |
| **Docs** | 2 | Admin | Generate Document, Invoice by Booking |

---

## 🚀 Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/Athar786-Ali/RefriSmart-AI.git
cd RefriSmart-AI

# 2. Install dependencies
cd frontend && npm install
cd ../backend && npm install

# 3. Configure environment variables
cp backend/.env.example backend/.env
# Required: DATABASE_URL, JWT_SECRET, GEMINI_API_KEY
# Optional: CLOUDINARY_*, RAZORPAY_*, SMTP_*, MSG91_*

# 4. Setup database
cd backend && npx prisma migrate deploy && npx prisma generate

# 5. Start development servers
cd backend && npm run dev    # Express API → http://localhost:5001
cd ../frontend && npm run dev # Next.js    → http://localhost:3000
```

---

## 🔄 CI/CD & Deployment

- **Git-connected Vercel:** Every push to `main` triggers automated build → type-check → deploy for both frontend and backend.
- **Database Migrations:** Prisma schema changes are version-controlled (4 migration sets) and applied via `npx prisma migrate deploy` in the CI pipeline.
- **Zero-Downtime:** Vercel's immutable deployments ensure rollback capability on every push.

---

<div align="center">

### Built by Md Athar Ali

**Solo Full-Stack Developer** · Next.js · React · Node.js · TypeScript · PostgreSQL · AI/ML Integration

<br />

*This project is a production-deployed SaaS platform serving a real business — not a tutorial or bootcamp project.*

</div>
