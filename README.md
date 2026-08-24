<div align="center">

# RefriSmart AI

**A Production SaaS Platform for Appliance Repair — Live, Revenue-Generating, and Ranking on Google**

<p>
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 20+" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5" />
</p>
<p>
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL 16" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma 7" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini AI" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-02042B?style=for-the-badge&logo=razorpay&logoColor=white" alt="Razorpay" />
  <img src="https://img.shields.io/badge/Cloudinary-CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
</p>

<br />

### [Live Production Site &rarr; www.goldenrefrigeration.in](https://www.goldenrefrigeration.in)

<br />

**16,300+ lines of TypeScript** &middot; **75 source files** &middot; **14 database models** &middot; **74 REST API endpoints** &middot; **4 JSON-LD schemas**

</div>

---

## Table of Contents

- [What This Project Is](#what-this-project-is)
- [Quick Overview for Recruiters](#quick-overview-for-recruiters)
- [Why I Built This](#why-i-built-this)
- [Demo](#demo)
- [Key Features](#key-features)
- [Three User Portals](#three-user-portals)
- [AI Features](#ai-features)
- [Voice Input and Accessibility](#voice-input-and-accessibility)
- [Invoice Engine](#invoice-engine)
- [AI Price Suggestion Algorithm](#ai-price-suggestion-algorithm)
- [UPI Payment Integration](#upi-payment-integration)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Overview](#api-overview)
- [Database Schema Overview](#database-schema-overview)
- [Project Workflow](#project-workflow)
- [Frontend Architecture](#frontend-architecture)
- [Design Decisions](#design-decisions)
- [Challenges Faced](#challenges-faced)
- [Performance Optimizations](#performance-optimizations)
- [Security Features](#security-features)
- [Scalability](#scalability)
- [Error Handling and Resilience](#error-handling-and-resilience)
- [SEO Engineering](#seo-engineering)
- [Sitemap and Robots Configuration](#sitemap-and-robots-configuration)
- [Database Migration Strategy](#database-migration-strategy)
- [Business Context](#business-context)
- [Future Improvements](#future-improvements)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## What This Project Is

RefriSmart AI is a full-stack SaaS platform I designed and built from scratch for a real appliance repair business in Bhagalpur, India. It handles the entire business lifecycle: customers book doorstep repairs, an AI engine diagnoses appliance faults from photos and videos before the technician arrives, the admin dispatches technicians by pincode, payments are processed through Razorpay, and the business owner tracks everything from a CRM dashboard.

This is not a tutorial or bootcamp project. It processes real customers, handles live INR payments, and ranks on Page 1 of Google for local search terms — competing directly with JustDial and IndiaMART.

---

## Quick Overview for Recruiters

| | |
|---|---|
| **What is it?** | A full-stack SaaS platform for a real appliance repair business. Handles AI diagnostics, live payment processing, technician dispatch, a refurbished appliance marketplace, and a complete admin CRM. |
| **Is it in production?** | Yes. It processes real customers, handles live Razorpay payments in INR, and ranks on Page 1 of Google for local intent searches. |
| **My role** | Solo Full-Stack Developer. I owned every layer: requirements gathering with the business owner, database schema design, backend API architecture, React UI, multimodal AI integration, payment gateway, SEO strategy, and Vercel deployment. |
| **Why it matters** | Every engineering decision was driven by a real operational problem. The AI fallback cascade, connection pooling strategy, and dual-mode auth were all solutions to production incidents I debugged and fixed myself. |

---

## Why I Built This

The business owner was running operations entirely on paper and JustDial listings. These were the problems I identified and solved:

| Business Problem | Engineering Solution | Impact |
|:---|:---|:---|
| **50%+ no-show rate** — technicians arrived to empty houses | Mandatory upfront payment via Razorpay during booking flow | Eliminated no-shows — payment acts as a commitment signal |
| **Blind dispatching** — technicians didn't know what parts to bring | Multimodal AI triage via Gemini Vision — diagnoses faults before dispatch | Higher first-visit fix rate — techs arrive knowing it's a compressor vs. a relay |
| **Zero online presence** — business existed only on paper and JustDial | Programmatic SEO with 4 JSON-LD schemas and 60+ geo-targeted keywords | Page 1 of Google for "AC repair Bhagalpur" — outranking JustDial |
| **No operational data** — paper records, no revenue tracking | PostgreSQL-backed admin dashboard with event-sourced audit trails | Owner tracks daily revenue, assigns jobs, and views the full repair lifecycle |
| **Wasted return visits** — customers couldn't describe faults accurately | AI diagnosis with photo/video upload generates technical fault reports | Customers share AI reports with technicians — reducing miscommunication |

---

## Demo

| | |
|---|---|
| **Live Website** | [www.goldenrefrigeration.in](https://www.goldenrefrigeration.in) |
| **Demo Video** | _Coming soon_ |

### Screenshots

<!-- Replace these with actual screenshots of your deployed app -->
> Add screenshots of the landing page, AI diagnosis interface, admin dashboard, and service booking flow here.

---

## Key Features

### 1. Service Dispatch Engine
An end-to-end repair lifecycle manager built on a **9-state finite state machine** (`PENDING` &rarr; `ASSIGNED` &rarr; `OUT_FOR_REPAIR` &rarr; `REPAIRING` &rarr; `FIXED` &rarr; `PAYMENT_PENDING` &rarr; `COMPLETED`). Customers book time slots, the admin assigns a technician by pincode, and every state transition is recorded in an append-only `ServiceEvent` audit log. On-site job completion is verified via OTP.

### 2. Multimodal AI Diagnostics
Customers upload a photo or video of a broken appliance. The system sends it to Google Gemini Vision API for real-time fault triage — identifying the specific component failure (e.g., "R-600a gas leak" or "PCB capacitor blown") with step-by-step repair explanations and cost estimates. Supports text, image, video, and voice input via the Web Speech API.

### 3. Refurbished Marketplace
A buy/sell platform for appliances. Products have `NEW` and `REFURBISHED` types, condition scores, serial number tracking, warranty type (Brand vs. Shop), and stock management. Customers submit a Sell Request with photos, receive a price offer from the admin, and the accepted item is auto-listed as a refurbished product.

### 4. Admin CRM Dashboard
A back-office suite with 8 dedicated views: Dashboard (live revenue and stats), Services (booking management and technician assignment), Orders (e-commerce fulfillment with delivery tracking), Products (inventory CRUD with image uploads), Sell Requests (offer negotiation pipeline), Diagnoses (AI diagnosis history viewer), Gallery (media management), and Profile settings.

### 5. Payment and Invoice System
Razorpay integration with cryptographic HMAC-SHA256 signature verification using `crypto.timingSafeEqual` to prevent timing attacks. Supports both service booking payments and product order payments. Handles Cash, UPI QR code generation, and online payment modes. Auto-generates PDF invoices via Nodemailer.

### 6. Voice-Powered AI Input
The AI diagnosis page supports hands-free voice dictation via the Web Speech API (`SpeechRecognition` with `webkitSpeechRecognition` fallback). Configured for Indian English (`lang: "en-IN"`) with a live pulsing red indicator during recording. Spoken text is appended directly into the issue description field, enabling semi-literate users to describe faults in natural language.

---

## Three User Portals

The platform serves three distinct user roles, each with a tailored interface:

| Portal | Role | Key Capabilities |
|:---|:---|:---|
| **Customer Portal** | `CUSTOMER` | Book repairs, use AI diagnosis (text/voice/photo/video), track service status in real-time, browse and buy products, submit sell requests for old appliances, manage orders, download invoices |
| **Technician Portal** | `TECHNICIAN` | View assigned jobs with customer details and AI diagnosis reports, receive real-time notifications, update job status |
| **Admin CRM** | `ADMIN` | Full operational control — dispatch technicians by pincode, manage bookings through 9-state FSM, process sell request offers, manage product inventory, view AI diagnosis history, upload gallery media, track revenue analytics |

> Auto-promotion logic: The system automatically elevates designated admin credentials (email or phone) to `ADMIN` role during login — no manual database edits needed.

---

## AI Features

The AI system is designed to provide highly accurate, empathetic, and culturally aware diagnostics while **never failing silently**. It uses a multi-tier fallback architecture:

```
User uploads photo/video + describes issue (text or voice via Web Speech API)
                │
                ▼
┌──────────────────────────────┐
│  Tier 1: NVIDIA NIM API      │  Primary Provider (integrate.api.nvidia.com)
│  (Llama-3.2 Vision / Gemma)  │  Zero-dependency native fetch implementation.
│                              │  Generates dynamic, highly empathetic responses
│                              │  using a strict 15-rule reasoning prompt.
└──────────┬───────────────────┘
           │
           ▼ (If NVIDIA fails / rate limited)
┌──────────────────────────────┐
│  Tier 2: Google Gemini API   │  Backup Provider (5-Key Rotation Pool)
│  (7-Model Cascade)           │  Automatically falls back to Gemini 1.5/2.0
│                              │  flash models if NVIDIA is unreachable.
└──────────┬───────────────────┘
           │
           ▼ (If both AI providers exhaust quota)
┌──────────────────────────────┐
│  Tier 3: Rule-Based Engine   │  Offline heuristic fallback.
│                              │  Outputs hardcoded diagnostic responses
│                              │  in both English and Hinglish.
└──────────────────────────────┘
```

**Key design decisions:**
- **NVIDIA as Primary:** Uses Llama-3.2-90b-vision-instruct (and Gemma-3) via the NVIDIA NIM API for superior conversational tone and multimodal image analysis via inline base64 payloads.
- **Advanced 15-Rule Prompt Engineering:** The AI behaves as a warm, local shop owner ("Raju bhai"). It is strictly instructed to:
  - Think step-by-step (symptom &rarr; root cause &rarr; fix) before answering.
  - Dynamically match the customer's language (English, Hindi, or Hinglish).
  - Avoid making absolute claims ("definitely broken") without inspection.
  - Provide actionable, safe home fixes if applicable.
  - Output transparent, realistic rural-area pricing without separate/hidden visiting charges.
- **5-Key Gemini Rotation Pool:** Used as a robust backup. 5 separate keys multiply the free-tier quota from 1,500 to 7,500 requests/day.
- **Structured JSON output:** AI responses strictly adhere to a JSON schema (`problem`, `technicalExplanation`, `solution`, `safetyAlert`, `conclusion`, `estimatedCostRange`) for reliable frontend rendering.
- **Media persistence:** Uploaded photos/videos are stored on Cloudinary and linked to the `DiagnosisLog` for technician reference.

<details>
<summary><strong>Example: AI Diagnosis Output Flow</strong></summary>

The output is presented to the user in a beautiful, conversational format:

**🔍 Gas Leak (R-600a)**
Based on what you've described—your fridge is running but not cooling—this is a very common issue. It usually means the cooling gas has leaked from a tiny hole in the pipe.

**🛠️ Solution**
For now, please unplug the fridge and keep the doors open to let it defrost. There isn't a safe way to refill the gas at home.

**⚠️ Safety**
Do not try to scrape ice off the freezer with a knife, as this causes further leaks.

**👨‍🔧 Advice**
The best next step would be to have a technician inspect and seal the leak. We can easily check this for you.
</details>

<details>
<summary><strong>Offline fallback cost brackets by issue type</strong></summary>

| Issue Category | Cost Range | Urgency | Matched Keywords |
|:---|:---|:---:|:---|
| Gas / Cooling failure | ₹1,200 – ₹4,500 | HIGH | `cool`, `thanda`, `cold`, `freez` |
| Noise / Fan issues | ₹900 – ₹3,200 | MEDIUM | `noise`, `sound`, `awaz`, `vibrat` |
| Water leak / Drain | ₹800 – ₹2,800 | MEDIUM | `drain`, `pani`, `water`, `leak` |
| Spark / Burn | ₹1,500 – ₹6,000 | HIGH | `spark`, `burn`, `jal` |
| General / Default | ₹700 – ₹2,500 | MEDIUM | _(no match)_ |

All prices are Bhagalpur-local and include the ₹349 visiting charge.

</details>

---

## Voice Input and Accessibility

The AI diagnosis interface is designed for accessibility in a market where many users are more comfortable speaking than typing:

- **Web Speech API** with `webkitSpeechRecognition` fallback for Safari compatibility
- **Language**: Configured for Indian English (`lang: "en-IN"`)
- **Behavior**: `interimResults: false`, `maxAlternatives: 1` — captures the final transcription only, avoiding noisy partial results
- **UX**: Live pulsing red indicator during recording; spoken text is appended (not replaced) so users can dictate in multiple segments
- **Graceful degradation**: Unsupported browsers receive a toast notification instead of a crash
- **Pincode validation**: Doorstep service bookings from the AI diagnosis page are restricted to serviceable PIN codes (prefix `813210`) — out-of-area users are informed before they book

---

## Invoice Engine

The platform generates PDF invoices from scratch — no `pdfkit`, `jsPDF`, or any external PDF library. The `makeProfessionalInvoicePdf()` function in `runtime.ts` constructs raw PDF 1.4 byte streams directly:

| Detail | Value |
|:---|:---|
| **Page size** | A4 (595 × 842 pt) |
| **Content width** | 495 pt |
| **Header** | Navy band (`#212538`) with business name and tagline: *"Expert Appliance Repair & Service \| Since 2015"* |
| **Accent** | Gold bar (`#DAA53E`) separating header from body |
| **Body** | Customer details, itemized service/part table with alternating row shading, subtotal + GST breakdown |
| **Footer** | Technician signature block + 4 terms & conditions (30-day service warranty, 7-day complaint window) |
| **Currency** | `en-IN` locale formatting (₹) |
| **Delivery** | Attached to transactional emails via Nodemailer or downloadable from the admin dashboard |

This approach was chosen to eliminate a runtime dependency in the serverless environment — adding `pdfkit` or `puppeteer` to a Vercel function would significantly increase cold start times.

---

## AI Price Suggestion Algorithm

The admin dashboard includes an AI-assisted pricing tool for refurbished appliances (`POST /admin/suggest-price`). The algorithm blends formula-based pricing with live inventory benchmarking:

```
For REFURBISHED items:
  Base Price = Market Retail Price (MRP)
  Age Penalty = min(ageInMonths × 0.012, 0.45)   → max 45% depreciation
  Condition Boost = max((conditionScore - 5) × 0.03, -0.20)
  Formula Price = Base × (1 - agePenalty + conditionBoost)

For NEW items:
  Formula Price = Base × 1.02   → 2% margin multiplier
```

**Live Inventory Benchmarking:**
1. Fetches up to 140 available products from the database
2. Tokenizes title and description of each product
3. Matches the top 60 most similar items by keyword overlap
4. Calculates the market median price from matches
5. Blends market median with formula price (market weight: `0.35` – `0.78` depending on match quality)

**Output includes:**
- Suggested price with confidence score (`0.20` – `0.92`)
- Price spread range (8%, 12%, or 18% depending on confidence)
- Quick-sale price (85% of spread discount)
- Premium listing price (90% of spread markup)
- Market comparison data showing similar items

---

## UPI Payment Integration

Alongside Razorpay online payments, the platform supports direct UPI payments for customers who prefer scanning a QR code:

```
UPI URL format:
upi://pay?pa=7070494254-2@ybl&pn=Golden%20Refrigeration&am={amount}&cu=INR
```

- **Dynamic amount injection**: The `am` parameter is populated from the actual booking cost or order total (fetched from the database, never from the client)
- **Payment confirmation**: Admin manually confirms UPI/Cash payments via `POST /bookings/:id/confirm-payment` or `PATCH /admin/orders/:id/confirm-payment`
- **UPI ID**: `7070494254-2@ybl` (configured as `SHOP_UPI_ID` in `runtime.ts`)
- **Supported modes**: Cash, UPI QR, Razorpay online — the customer selects during checkout

---

## System Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                       PRODUCTION ARCHITECTURE                         │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐    HTTPS     ┌──────────────────────┐              │
│  │  Next.js 16   │ ──────────► │  Vercel Serverless   │              │
│  │  React 19     │  REST API   │  Express.js v5       │              │
│  │  App Router   │ ◄────────── │  (Stateless Funcs)   │              │
│  │  Tailwind v4  │             └──────────┬───────────┘              │
│  └───────────────┘                        │                           │
│        │                                  │                           │
│  ┌─────▼───────┐               ┌──────────▼───────────┐              │
│  │ Cloudinary   │               │  Neon pgBouncer      │              │
│  │ CDN (Media)  │               │  Connection Pooler   │              │
│  └──────────────┘               └──────────┬───────────┘              │
│                                            │                          │
│  ┌──────────────┐              ┌───────────▼──────────┐              │
│  │ Google Gemini │              │  PostgreSQL 16       │              │
│  │ Vision API    │              │  14 Models, 7 Enums  │              │
│  │ (5-Key Pool)  │              │  Prisma ORM v7       │              │
│  └──────────────┘              └──────────────────────┘              │
│                                                                       │
│  ┌──────────────┐  ┌────────────┐  ┌────────────────┐               │
│  │  Razorpay     │  │ Nodemailer │  │  MSG91 OTP     │               │
│  │  (Payments)   │  │ (Email)    │  │  (WhatsApp/SMS)│               │
│  └──────────────┘  └────────────┘  └────────────────┘               │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

**Why this architecture:**
- **Vercel Serverless** for the Express backend eliminates server management. Each API route runs as an isolated function that scales to zero when idle and auto-scales under load.
- **Neon pgBouncer** sits between serverless functions and PostgreSQL to multiplex connections. Without it, each cold start opens a new direct connection, which exhausts the database connection limit during traffic spikes.
- **Cloudinary** for media storage instead of self-hosted S3 — it provides on-the-fly image transformations (WebP conversion, quality optimization, responsive resizing) via URL parameters, reducing frontend complexity.

---

## Tech Stack

| Layer | Technology | Why This Choice |
|:---|:---|:---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5 | SSR for SEO, App Router for file-based routing, TypeScript for type safety across 75+ files |
| **Styling** | Tailwind CSS v4, Lucide Icons | Utility-first CSS eliminates context switching; Tailwind v4's new engine is faster and has no config file requirement |
| **State** | React Context API (`AuthContext`) | The app's state needs (auth session, theme) don't justify Redux/Zustand overhead |
| **Backend** | Node.js 20+, Express.js v5 | Express 5 adds native async error handling and proper Promise support — no need for `express-async-errors` hacks |
| **Database** | PostgreSQL 16 (Neon), Prisma ORM v7 | Relational data (users, bookings, orders, products) with complex relationships; Prisma provides type-safe queries and migration management |
| **Connection Pool** | Neon pgBouncer, `@prisma/adapter-pg` | Required for serverless — multiplexes connections to prevent exhaustion under concurrent cold starts |
| **AI** | Google Gemini Vision API (`@google/genai`) | Multimodal input (text + image + video) in a single API call; 5-key rotation maximizes free-tier quota |
| **Payments** | Razorpay SDK | Native INR support, UPI integration, webhook-based payment verification with HMAC-SHA256 |
| **Media** | Cloudinary SDK | Image/video CDN with on-the-fly WebP conversion and responsive transforms; local fallback for development |
| **Email** | Nodemailer (Brevo SMTP) | Transactional emails for OTP delivery and PDF invoice attachment |
| **OTP** | MSG91 (WhatsApp + SMS) | WhatsApp is the primary channel (most reliable for Indian users), SMS as fallback, console logging for dev |
| **File Upload** | Multer v2 | Multipart form handling with configurable size limits (25MB for diagnosis, 100MB for gallery) |
| **Auth** | JWT (jsonwebtoken), bcryptjs | HttpOnly cookies + Bearer token dual-mode for Safari ITP compatibility |
| **Deployment** | Vercel (Git-connected CI/CD) | Auto-deploy on push to `main` with zero-downtime immutable deployments |

---

## Folder Structure

```
RefriSmart-AI/
├── frontend/                          # Next.js 16 (App Router)
│   └── src/
│       ├── app/                       # 10 route groups
│       │   ├── page.tsx               # Landing page (hero, services, reviews, FAQ, service areas)
│       │   ├── layout.tsx             # Root layout (metadata, 4x JSON-LD, AuthProvider, nav, footer)
│       │   ├── robots.ts             # Dynamic robots.txt generation
│       │   ├── sitemap.ts            # Programmatic XML sitemap
│       │   ├── service/page.tsx       # Service booking flow + real-time tracker
│       │   ├── ai-diagnosis/page.tsx  # Multimodal AI diagnosis (text/voice/photo/video)
│       │   ├── products/page.tsx      # Product marketplace (new + refurbished)
│       │   ├── sell/page.tsx          # Customer sell/trade-in request flow
│       │   ├── orders/page.tsx        # Order tracking + Razorpay checkout
│       │   ├── gallery/page.tsx       # Photo/video gallery of completed repairs
│       │   ├── admin/                 # Admin CRM (8 tab views, ~3,200 lines)
│       │   │   ├── page.tsx           # Admin layout container + sidebar navigation
│       │   │   ├── _dashboard.tsx     # Executive KPIs, revenue, quick actions
│       │   │   ├── _services.tsx      # Service dispatch board + technician assignment
│       │   │   ├── _orders.tsx        # Order fulfillment pipeline
│       │   │   ├── _products.tsx      # Inventory CRUD + Cloudinary uploads
│       │   │   ├── _gallery.tsx       # Gallery media manager
│       │   │   ├── _diagnoses.tsx     # AI diagnosis logs viewer
│       │   │   ├── _sell.tsx          # Trade-in request + offer pipeline
│       │   │   ├── _profile.tsx       # Admin profile settings
│       │   │   └── _types.ts          # Admin TypeScript interfaces
│       │   ├── technician/page.tsx    # Technician job portal
│       │   ├── login/page.tsx         # Passwordless OTP login (email + phone)
│       │   └── verify-otp/page.tsx    # OTP verification
│       ├── components/                # 11 reusable components
│       │   ├── Navbar.tsx             # Floating glassmorphic nav + mobile drawer
│       │   ├── Footer.tsx             # Trust banner (address, GSTIN, hours, JustDial link)
│       │   ├── BrandLogo.tsx          # Responsive brand identity component
│       │   ├── ProductCard.tsx        # Cloudinary-optimized card + Razorpay checkout modal
│       │   ├── ServiceActiveTrackerCard.tsx  # Real-time 9-step progress tracker
│       │   ├── ServiceHistoryCard.tsx # Historical service records
│       │   ├── EstimateCard.tsx       # AI cost estimate display + booking CTA
│       │   ├── GalleryShowcase.tsx    # Homepage photo grid with auto-validation
│       │   ├── SafeVideo.tsx          # Memory-leak safe video component
│       │   ├── DiagnosisSkeleton.tsx  # Loading skeleton for AI cards
│       │   └── ProductSkeleton.tsx    # Loading skeleton for product grid
│       ├── context/                   # AuthContext (session management + keepalive)
│       ├── lib/                       # API client, Razorpay loader, status utils
│       │   ├── api.ts                 # authFetch wrapper + Bearer token injection
│       │   ├── razorpay.ts            # Script loader + checkout modal promise wrapper
│       │   ├── service-status.ts      # Service FSM status constants + step mapping
│       │   ├── order-status.ts        # Order status constants + step mapping
│       │   └── utils.ts              # cn() className helper + formatInr() currency
│       └── types/                     # Shared TypeScript interfaces
│           ├── index.ts              # Product, NormalizedProduct, DiagnosisItem
│           └── razorpay.d.ts         # Global type augmentation for window.Razorpay
│
├── backend/                           # Express.js v5 (Vercel Serverless)
│   ├── prisma/
│   │   ├── schema.prisma             # 14 models, 7 enums, 278 lines
│   │   ├── migrations/               # 4 versioned migration sets
│   │   └── seed.ts                   # Database seeder
│   └── src/
│       ├── index.ts                  # Express server entry + Vercel adapter
│       ├── controllers/              # 4 controllers (~5,000 lines of business logic)
│       │   ├── adminController.ts    # 2,407 lines — bookings, technicians, gallery, sell pipeline
│       │   ├── productController.ts  # 1,195 lines — CRUD, orders, invoices, pricing
│       │   ├── authController.ts     # 814 lines — register, login, OTP, password reset
│       │   └── aiController.ts       # 596 lines — Gemini integration, model cascade, fallback engine
│       ├── routes/                   # 4 route files (74 endpoints)
│       │   ├── authRoutes.ts         # 14 auth endpoints
│       │   ├── aiRoutes.ts           # 2 AI endpoints
│       │   ├── adminRoutes.ts        # 41 service/admin endpoints
│       │   └── productRoutes.ts      # 17 product/order endpoints
│       ├── middlewares/
│       │   └── authMiddleware.ts     # Dual-mode auth (cookie + bearer) + adminAuth
│       ├── services/
│       │   ├── diagnosisService.ts   # AI diagnosis CRUD + history queries
│       │   ├── mediaStorageService.ts # Cloudinary upload + local fallback
│       │   └── otpService.ts         # 3-tier OTP delivery (WhatsApp → SMS → Dev)
│       ├── config/
│       │   ├── gemini.ts             # 5-key rotation pool + round-robin client
│       │   ├── prisma.ts             # Prisma client with pgBouncer adapter
│       │   ├── razorpay.ts           # Razorpay SDK initialization
│       │   ├── cloudinary.ts         # Cloudinary SDK configuration
│       │   └── runtime.ts            # Constants, language detection, startup migrations
│       └── utils/
│           ├── serviceStatus.ts      # Service FSM transition logic
│           └── email.ts              # SMTP transporter + email templates
│
├── docs/                             # Architecture docs and interview prep materials
│   └── FOLDER_STRUCTURE.md           # Annotated project structure reference
│
├── .gitignore
└── README.md
```

---

## Installation

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or a [Neon](https://neon.tech) account for serverless Postgres)
- Google Cloud project with Gemini API enabled
- Razorpay account (for payment processing)
- Cloudinary account (for media storage)
- MSG91 account (optional, for WhatsApp/SMS OTP)

### Setup

```bash
# Clone the repository
git clone https://github.com/Athar786-Ali/RefriSmart-AI.git
cd RefriSmart-AI

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Database (Neon PostgreSQL with pgBouncer pooling)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require

# Authentication
JWT_SECRET=your_jwt_secret_here
ADMIN_EMAIL=your_admin_email@example.com

# Google Gemini AI (up to 5 keys for quota rotation)
GEMINI_API_KEY=your_primary_key
GEMINI_API_KEY_2=your_second_key         # Optional — separate GCP project
GEMINI_API_KEY_3=your_third_key          # Optional — separate GCP project
GEMINI_API_KEY_4=your_fourth_key         # Optional
GEMINI_API_KEY_5=your_fifth_key          # Optional

# Cloudinary (media storage + CDN)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Razorpay (INR payment processing)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret

# Email (SMTP via Brevo or similar)
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# MSG91 (OTP delivery — optional)
MSG91_AUTH_KEY=your_auth_key
MSG91_TEMPLATE_ID=your_template_id
MSG91_SENDER_ID=GOLDRG                   # 6-char sender ID
MSG91_WA_FLOW_ID=your_whatsapp_flow_id   # Optional — WhatsApp OTP

# Server
HOST=0.0.0.0
PORT=5001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

---

## Running the Project

```bash
# Terminal 1 — Start the backend
cd backend
npx prisma migrate deploy    # Apply database migrations
npx prisma generate          # Generate Prisma client
npm run dev                  # Express API → http://localhost:5001

# Terminal 2 — Start the frontend
cd frontend
npm run dev                  # Next.js → http://localhost:3000
```

> **Tip:** The backend dev script automatically kills any process on port 5001 before starting, so you won't run into port conflicts.

### Seeding Sample Data

```bash
# Populate the database with sample products
cd backend
npx tsx scripts/add-demo-products.ts
```

---

## API Overview

The backend exposes 74 REST endpoints across 4 route modules. All authenticated endpoints use JWT verification via the `userAuth` middleware, with an additional `adminAuth` layer that queries the database to confirm the user has `role === 'ADMIN'`.

| Module | Endpoints | Auth | Key Operations |
|:---|:---:|:---|:---|
| **Auth** | 14 | Mixed | Register, Login (email + phone OTP), Logout, Verify OTP, Reset Password |
| **AI** | 2 | Optional | `POST /diagnose` (multimodal image/video/text), `GET /history` |
| **Admin & Services** | 41 | User/Admin | Bookings (CRUD + FSM transitions), Technician dispatch, Gallery, Sell pipeline, Analytics |
| **Products & Orders** | 17 | User/Admin | Product CRUD, Order placement, Razorpay checkout, Invoice generation |

<details>
<summary><strong>Full endpoint reference (74 routes)</strong></summary>

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Purpose |
|:---|:---|:---:|:---|
| `POST` | `/register` | — | Register with name, email, password. Password hashed via bcryptjs. |
| `POST` | `/login` | — | Email/password login. Sets HttpOnly cookie + returns Bearer token. |
| `POST` | `/logout` | — | Clears `token` HttpOnly cookie. |
| `POST` | `/request-login-otp` | — | Send phone OTP via MSG91 (WhatsApp &rarr; SMS &rarr; dev fallback). Auto-creates user if not found. |
| `POST` | `/verify-login` | — | Verify phone OTP, return JWT. Auto-promotes master admin phone. |
| `POST` | `/request-email-login-otp` | — | Send 6-digit email OTP (10-minute validity). |
| `POST` | `/verify-email-login` | — | Verify email OTP, return JWT. |
| `GET` | `/me` | User | Get current user profile with auto admin role enforcement. |
| `POST` | `/send-verify-otp` | User | Send email verification OTP. |
| `POST` | `/verify-otp` | User | Verify account email, set `isAccountVerified: true`. |
| `POST` | `/send-whatsapp-otp` | User | Generate WhatsApp OTP for phone verification. |
| `POST` | `/verify-phone-otp` | User | Verify phone number, set `isPhoneVerified: true`. |
| `POST` | `/send-reset-otp` | — | Password reset OTP via email. |
| `POST` | `/reset-password` | — | Reset password with valid OTP. |

### AI Diagnosis (`/api/ai`)

| Method | Endpoint | Auth | Purpose |
|:---|:---|:---:|:---|
| `POST` | `/diagnose` | — | Multimodal diagnosis — accepts text + photo/video via Multer. Runs through 5-key × 7-model cascade with offline fallback. |
| `GET` | `/history` | User | Fetch user's diagnosis history from `DiagnosisLog` (indexed on `[customerId, createdAt]`). |

### Service Bookings & Admin Operations (`/api`)

| Method | Endpoint | Auth | Purpose |
|:---|:---|:---:|:---|
| `GET` | `/booking/slots` | — | Available time slots |
| `POST` | `/booking/create` | User | Create repair booking (authenticated or guest) |
| `POST` | `/service/book` | — | Alias endpoint for service booking |
| `PATCH` | `/booking/:id/status` | Admin | Update booking FSM state |
| `PATCH` | `/booking/:id/reschedule` | Admin | Reschedule booking |
| `PATCH` | `/booking/:id/cancel` | Admin | Cancel booking |
| `GET` | `/booking/timeline/:bookingId` | User | Append-only event timeline |
| `POST` | `/booking/:id/send-otp` | Admin | Send completion OTP to customer |
| `POST` | `/booking/:id/verify-otp` | Admin | Verify on-site OTP |
| `POST` | `/booking/:id/razorpay` | User | Create Razorpay order for service |
| `POST` | `/booking/:id/razorpay/verify` | User | Verify Razorpay payment signature |
| `POST` | `/bookings/:id/confirm-payment` | User | Confirm manual payment (Cash/UPI) |
| `POST` | `/bookings/:id/cancel` | User | Customer cancels booking |
| `GET` | `/booking/:id/reminders` | Admin | Booking reminders |
| `GET` | `/service/my-bookings/:userId` | User | Customer's bookings (path param) |
| `GET` | `/service/my-bookings` | User | Customer's bookings (query param) |
| `GET` | `/service/guest-booking` | — | Guest booking lookup by phone/ID |
| `PUT` | `/admin/assign-technician/:id` | Admin | Assign technician by pincode |
| `PATCH` | `/admin/service/:id` | Admin | Update service cost/notes |
| `POST` | `/service/:id/rating` | — | Submit repair rating and review |
| `POST` | `/admin/gallery` | Admin | Upload gallery media (100MB limit) |
| `GET` | `/gallery` | — | List gallery items |
| `DELETE` | `/admin/gallery/:id` | Admin | Delete gallery item |
| `GET` | `/technician/jobs` | Admin | Technician job list |
| `PATCH` | `/technician/jobs/:bookingId/status` | Admin | Update technician job status |
| `GET` | `/technician/notifications` | User | Fetch notifications |
| `PUT` | `/technician/notifications/:id/read` | User | Mark notification as read |
| `POST` | `/sell/upload-image` | User | Upload photo for sell request |
| `POST` | `/sell/request` | User | Submit sell request |
| `GET` | `/sell/requests` | User | List sell requests (own or all for admin) |
| `POST` | `/sell/requests/:id/offer` | Admin | Send buyback offer with pickup slot |
| `POST` | `/sell/offers/:id/respond` | User | Accept/reject offer |
| `POST` | `/sell/requests/:id/move-to-refurbished` | Admin | Convert accepted sell to refurbished product |
| `GET` | `/ops/analytics` | Admin | Operational analytics |
| `GET` | `/admin/service-overview` | Admin | Service dashboard aggregate data |
| `GET` | `/admin/all-diagnoses` | Admin | All customer AI diagnosis logs |
| `GET` | `/admin/stats-basic` | Admin | Summary statistics |
| `GET` | `/admin/stats` | Admin | Comprehensive dashboard analytics |
| `GET` | `/history/:userId` | User | User history |

### Products & Orders (`/api`)

| Method | Endpoint | Auth | Purpose |
|:---|:---|:---:|:---|
| `GET` | `/products` | — | List available products (in stock, not deleted) |
| `POST` | `/admin/add-product` | Admin | Create product listing |
| `DELETE` | `/admin/delete-product/:id` | Admin | Soft-delete product |
| `POST` | `/admin/upload-image` | Admin | Upload product image to Cloudinary |
| `POST` | `/admin/suggest-price` | Admin | AI/heuristic pricing suggestion for refurbished |
| `POST` | `/admin/seed-demo-products` | Admin | Seed demo inventory |
| `POST` | `/orders` | User | Place product order (price validated from DB) |
| `GET` | `/orders/my` | User | Customer's orders |
| `GET` | `/orders/my/invoice/:orderId` | User | Download order PDF invoice |
| `POST` | `/orders/:id/razorpay` | User | Create Razorpay order |
| `POST` | `/orders/:id/razorpay/verify` | User | Verify payment signature |
| `GET` | `/admin/orders` | Admin | All orders |
| `PATCH` | `/admin/orders/:id` | Admin | Update order status (5-state) |
| `PATCH` | `/admin/orders/:id/reassign-customer` | Admin | Reassign order customer |
| `PATCH` | `/admin/orders/:id/confirm-payment` | Admin | Manually confirm Cash/UPI payment |
| `POST` | `/admin/orders/:id/generate-invoice` | Admin | Generate PDF invoice |
| `GET` | `/docs/order-invoice/:orderId` | Admin | Download generated invoice |

</details>

---

## Database Schema Overview

```mermaid
erDiagram
    User ||--o{ ServiceBooking : "books"
    User ||--o{ Product : "sells"
    User ||--o{ ProductOrder : "places"
    User ||--o{ DiagnosisLog : "diagnoses"
    User ||--o{ SellRequest : "submits"

    ServiceBooking ||--o| ServiceAssignment : "assigned to"
    ServiceBooking ||--o{ ServiceEvent : "state transitions"
    ServiceBooking ||--o{ ServiceOtp : "verification"
    ServiceBooking ||--o{ DocumentLog : "documents"

    Technician ||--o{ ServiceAssignment : "handles"

    Product ||--o{ ProductOrder : "ordered"

    SellRequest ||--o{ SellOffer : "receives"

    User {
        string id PK
        string email UK
        string phone UK
        string password "bcrypt hashed"
        Role role "ADMIN | CUSTOMER | TECHNICIAN"
        boolean isAccountVerified
        boolean isPhoneVerified
    }

    ServiceBooking {
        string id PK
        string appliance
        string issue
        string aiDiagnosis
        Status status "9-state FSM"
        datetime scheduledAt
        float finalCost
        int rating
    }

    Product {
        string id PK
        string title
        float price
        ProductType productType "NEW | REFURBISHED"
        int conditionScore
        string serialNumber UK
        int stockQty
        WarrantyType warrantyType
    }

    DiagnosisLog {
        string id PK
        string appliance
        string diagnosis
        string estimatedCostRange
        string mediaUrl
    }
```

**14 models** with the following key relationships:

| Model | Key Fields | Role |
|:---|:---|:---|
| `User` | email, phone, password (bcrypt), role (ADMIN/CUSTOMER/TECHNICIAN), OTP fields | Central identity, linked to all user-owned entities |
| `ServiceBooking` | appliance, issue, aiDiagnosis, status (9-state FSM), scheduledAt, finalCost | Repair job lifecycle container |
| `ServiceEvent` | bookingId, status, note, createdAt | Append-only audit log — every state transition is permanently recorded |
| `ServiceAssignment` | bookingId (PK), technicianId, pincode, routeNote | Links booking to technician by service area |
| `Technician` | name, phone, pincode, active | Field workforce, matched to bookings by area |
| `ServiceOtp` | bookingId, otp, expiresAt, verified | On-site job completion verification |
| `Product` | title, price, productType (NEW/REFURBISHED), conditionScore, stockQty, serialNumber | Marketplace inventory with condition tracking |
| `ProductOrder` | productId, customerId, status (5-state), paymentStatus, deliveryAddress | E-commerce order tracking |
| `DiagnosisLog` | appliance, issue, diagnosis, estimatedCostRange, mediaUrl | AI diagnosis history with indexed queries |
| `SellRequest` | applianceType, conditionNote, expectedPrice, status (5-state lifecycle) | Customer-to-business trade-in pipeline |
| `SellOffer` | requestId, offerPrice, pickupSlot, status | Admin's buyback price offer |
| `Gallery` | imageUrl, mediaType, caption | Repair photo/video showcase |
| `DocumentLog` | docType, bookingId, meta | Generated document tracking |
| `Notification` | userEmail, message, bookingId, read | System notification delivery |

**7 enums:** `Role` &middot; `Status` (9-state service FSM) &middot; `OrderStatus` (5-state) &middot; `PaymentStatus` &middot; `ProductType` (NEW/REFURBISHED) &middot; `WarrantyType` (BRAND/SHOP) &middot; `SellRequestStatus` (5-state lifecycle)

---

## Project Workflow

### Service Booking Lifecycle (9-State FSM)

```mermaid
stateDiagram-v2
    [*] --> PENDING: Customer books service
    PENDING --> ASSIGNED: Admin assigns technician
    ASSIGNED --> OUT_FOR_REPAIR: Technician dispatched
    OUT_FOR_REPAIR --> REPAIRING: Technician on-site
    REPAIRING --> FIXED: Repair complete
    FIXED --> ESTIMATE_APPROVED: Customer approves cost
    ESTIMATE_APPROVED --> PAYMENT_PENDING: Awaiting payment
    PAYMENT_PENDING --> COMPLETED: Payment confirmed (Razorpay/Cash/UPI)
    COMPLETED --> [*]

    PENDING --> CANCELLED: Customer/Admin cancels
    ASSIGNED --> CANCELLED: Customer/Admin cancels
```

> Every state transition writes an append-only row to the `ServiceEvent` table with a timestamp and optional note. The admin dashboard renders this as a replayable timeline per booking — no historical data is ever overwritten.

### Customer Journey

```
1. Customer visits site
   │
   ├─► Books a repair service (selects appliance, time slot, address)
   │   └─► Optionally uses AI Diagnosis first (uploads photo/video)
   │       └─► AI report is attached to the booking for technician reference
   │
   ├─► Admin assigns technician by pincode
   │   └─► Technician receives notification
   │       └─► Status moves through 9-state FSM (each transition logged)
   │           └─► OTP verifies job completion on-site
   │               └─► Payment collected (Razorpay / Cash / UPI QR)
   │                   └─► PDF invoice generated and emailed
   │
   ├─► Browses refurbished marketplace
   │   └─► Places order → Pays via Razorpay → Tracks delivery (5-state)
   │
   └─► Submits sell request for old appliance
       └─► Admin sends offer → Customer accepts/rejects
           └─► Accepted items auto-listed as refurbished products
```

### Sell Request Pipeline

```
REQUESTED → OFFER_SENT → ACCEPTED → REFURBISHED_LISTED
                       └→ REJECTED
```

The admin reviews the appliance photos, sends a price offer with a pickup time slot, and the customer accepts or rejects. Accepted items are automatically converted into refurbished `Product` listings with condition scores and shop warranty.

---

## Frontend Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (Next.js)
    participant B as Backend (Express)
    participant DB as PostgreSQL

    U->>F: Enter email/phone
    F->>B: POST /auth/request-login-otp
    B->>DB: Upsert user + generate 6-digit OTP (10-min expiry)
    B-->>U: OTP via WhatsApp → SMS → Email (3-tier fallback)
    U->>F: Enter OTP
    F->>B: POST /auth/verify-login
    B->>DB: Validate OTP + check expiry
    B-->>F: JWT token + Set HttpOnly cookie
    F->>F: Store token in localStorage (Safari ITP fallback)
    F->>F: Cache user in localStorage (instant hydration)

    loop Every 10 minutes
        F->>B: GET /auth/me (silent keepalive)
        B-->>F: User profile (refreshes session)
    end
```

### State Management

The frontend uses **React Context API** with a custom `AuthProvider` that implements:

- **Dual storage**: JWT stored in both HttpOnly cookie (primary) and `localStorage` (Safari fallback)
- **Instant hydration**: User state is loaded from `localStorage` immediately on mount, preventing flash-of-unauthenticated-content
- **Silent keepalive**: A background interval re-verifies the session against `/auth/me` every 10 minutes with max 3 network failure retries before invalidation
- **Custom `authFetch` wrapper**: Every API call automatically injects `Authorization: Bearer <token>` from localStorage while also sending `credentials: "include"` for cookie-based auth

### Component Patterns

| Component | Pattern | Purpose |
|:---|:---|:---|
| `SafeVideo` | Catches `AbortError`/`NotAllowedError` on unmount | Prevents memory leaks and console noise from browser autoplay promise rejections during rapid DOM unmounts |
| `ProductCard` | Dynamic Cloudinary URL injection | Intercepts Cloudinary URLs and injects `f_webp,q_auto:good,c_limit,w_900` transforms client-side — zero server processing |
| `ServiceActiveTrackerCard` | 5-second polling loop | Real-time service progress tracker without WebSocket complexity |
| `EstimateCard` | Pre-filled booking CTA | AI diagnosis result feeds directly into the booking form |
| `GalleryShowcase` | Image validation + error boundary | Auto-detects and filters broken image URLs before rendering |

---

## Design Decisions

### Why PostgreSQL over MongoDB?

The data in this application is inherently relational: users have bookings, bookings have assignments to technicians, assignments have events, products have orders. MongoDB would require denormalization and manual join logic. PostgreSQL with Prisma gives me type-safe queries, referential integrity via foreign keys, and proper migration management — all critical for a production system handling financial transactions.

### Why Express v5 on Vercel Serverless instead of Next.js API Routes?

The backend has 74 endpoints with complex middleware chains (auth verification, role checking, file upload handling via Multer, raw body parsing for payment verification). Next.js API routes would work for simpler APIs, but Express gives me middleware composition, route grouping, and the `userAuth` → `adminAuth` middleware chain pattern — which would be awkward to replicate in the App Router's route handler format. Express v5 specifically adds native async error handling and Promise support, eliminating the need for `express-async-errors`.

### Why Dual-Mode Authentication?

Safari's Intelligent Tracking Prevention (ITP) silently drops HttpOnly cookies when the frontend and backend are on different origins (which they are on Vercel). This caused 100% auth failure on iOS Safari — the majority of mobile users in India. The `extractUserIdFromRequest` function in `authMiddleware.ts` checks cookies first, then falls back to Bearer token:

```typescript
const cookieToken = req.cookies?.token;
const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
const token = cookieToken || bearerToken;  // Cookie-first, Bearer fallback
```

### Why React Context over Redux/Zustand?

The only global state is the authenticated user session. React Context handles this cleanly without adding a dependency. The 10-minute silent session refresh and localStorage hydration are implemented directly in the `AuthProvider` context.

### Why Polling over WebSockets?

Active service trackers and admin dashboards use 5-second polling intervals instead of WebSockets. In a serverless environment (Vercel), maintaining persistent WebSocket connections adds significant complexity — each serverless function instance is ephemeral. Polling is a pragmatic choice that provides near-real-time updates with zero infrastructure overhead. WebSocket support is planned for when the backend moves to a persistent hosting model.

### Why Passwordless OTP Login?

The target users are local customers in Bhagalpur who may not remember complex passwords. Phone-based OTP login (via WhatsApp/SMS) is the most accessible authentication method for this demographic. Email OTP is offered as an alternative. Traditional email + password registration is also supported for users who prefer it.

---

## Challenges Faced

### 1. Serverless Connection Exhaustion

**Problem:** A traffic spike spins up dozens of isolated serverless functions, each opening a direct PostgreSQL connection. This instantly exhausts Neon's connection limit and crashes the database.

**Solution:** Configured Prisma with `@prisma/adapter-pg` connected through Neon's pgBouncer connection pooler. Serverless functions connect to the pooler (which multiplexes connections) instead of directly to the database. The Prisma client is instantiated once per cold start and reused across requests within the same function instance.

### 2. Safari Cross-Origin Cookie Drop

**Problem:** 100% auth failure on iOS Safari. The `HttpOnly` cookie was silently dropped because the frontend (Vercel) and backend (separate Vercel deployment) live on different origins. This affected the majority of mobile users since iOS Safari dominates the Indian mobile browser market.

**Solution:** Implemented dual-mode auth — backend middleware checks cookie first, falls back to Bearer header. Frontend `authFetch` wrapper stores JWT in localStorage and injects it on every request while still sending `credentials: "include"`.

### 3. AI API Quota Management

**Problem:** A single free-tier Gemini API key gives 1,500 requests/day. In production, hitting the rate limit means the core diagnosis feature silently breaks with no user feedback.

**Solution:** Engineered a multi-dimensional resilience system:
1. **5-key rotation pool** across separate GCP projects (7,500 requests/day combined)
2. **7-model cascade** for model-level 503 failures
3. **Exponential backoff** with progressive delays (12s → 24s → 36s)
4. **Offline rule-based engine** with 5 specialized diagnostic rulesets (fridge, AC, washing machine, noise, power) covering common appliance failures in bilingual output — no API dependency

### 4. OTP Delivery Reliability in India

**Problem:** SMS delivery in India is unreliable due to DND (Do Not Disturb) registrations and telecom network variability. A customer who can't receive OTP can't log in.

**Solution:** Built a 3-tier priority-chain delivery system in `otpService.ts`:

| Priority | Channel | Why |
|:---:|:---|:---|
| 1 | MSG91 WhatsApp | Highest reliability, branded sender ("Golden Refrigeration") |
| 2 | MSG91 SMS | Works immediately, bypasses DND for transactional messages |
| 3 | Dev console fallback | OTP logged to stdout — zero config needed for development |

Each channel has a 10-second `AbortController` timeout. In production, if both WhatsApp and SMS fail, the system throws a clear error. In development, it gracefully falls back to console logging with a formatted OTP display.

### 5. Idempotent Database Schema Evolution

**Problem:** Deploying schema changes to a live production database risks breaking running instances or causing downtime during migrations.

**Solution:** The `runtime.ts` module runs defensive DDL queries at application startup (`ensurePhase1ProductSchema`, `ensurePhase2Schema`, `ensureDiagnosisLogSchema`, `ensureAuthSchema`) that add columns and tables only if they don't already exist — making every schema migration idempotent. This supplements Prisma's formal migration system and allows emergency schema fixes without downtime.

---

## Performance Optimizations

- **Cloudinary URL transforms**: Product images are dynamically transformed to WebP format with quality optimization (`f_webp,q_auto:good,c_limit,w_900`) via URL parameter injection on the frontend — no server-side processing needed.
- **Connection pooling**: Neon pgBouncer prevents connection exhaustion in serverless environments. The Prisma client is instantiated once per cold start.
- **Indexed queries**: `DiagnosisLog` has composite indexes on `[customerId, createdAt]` and `[createdAt]` for efficient history lookups even as diagnosis volume grows.
- **Real-time polling**: Active service trackers and admin dashboards use 5-second polling intervals instead of WebSockets — a pragmatic choice for serverless.
- **Safe video unmounting**: Custom `SafeVideo` component catches `AbortError` and `NotAllowedError` during rapid DOM unmounts, eliminating memory leaks and console noise.
- **LocalStorage hydration**: Auth state is cached in localStorage for instant UI rendering before the server-side session verification completes — no flash of unauthenticated content.
- **Preconnect hints**: `<link rel="preconnect">` for Cloudinary, Google Fonts, and Unsplash domains in the root layout to reduce DNS lookup latency.
- **Request body size limits**: `express.json({ limit: "100mb" })` is configured globally, with Multer enforcing per-route limits (25MB for diagnosis, 100MB for gallery) to prevent abuse.

---

## Security Features

| Threat | Mitigation |
|:---|:---|
| **Password theft** | Salted and hashed via `bcryptjs` — never stored in plaintext |
| **XSS token theft** | JWT issued via `HttpOnly` cookies (inaccessible to JavaScript) with Bearer fallback for Safari |
| **Payment spoofing** | Razorpay signatures verified using `crypto.createHmac('sha256')` with `crypto.timingSafeEqual` — prevents both forgery and timing attacks |
| **CSRF / Open CORS** | Production CORS restricted to explicit origin allowlist with protocol auto-handling — not `origin: true` |
| **Unauthorized access** | Two-tier middleware: `userAuth` (JWT verification) + `adminAuth` (role check against database) |
| **Privilege escalation** | User identity (`req.userId`) is extracted exclusively from the verified JWT — never trusted from request body |
| **Price manipulation** | Product prices and stock quantities for orders are fetched directly from the database — client-submitted prices are ignored |
| **Resource abuse** | Multer file size limits — 25MB for diagnosis uploads, 100MB for gallery media. Global body limit of 100MB. |
| **Session hijacking** | Silent session refresh every 10 minutes with 3-strike network failure invalidation |
| **OTP brute force** | OTP validity restricted to 10 minutes with server-side expiry enforcement |
| **Uncaught errors** | Global `uncaughtException` and `unhandledRejection` handlers prevent silent crashes in production |

---

## Scalability

The architecture is designed to scale horizontally without infrastructure changes:

- **Stateless backend**: Every Express function is independently deployable as a Vercel Serverless Function. No shared in-memory state between requests. The only stateful component is the PostgreSQL database.
- **Connection pooling**: pgBouncer multiplexes database connections, allowing dozens of concurrent serverless instances without connection exhaustion.
- **CDN-backed media**: Cloudinary handles image/video serving at the edge. The backend never serves static files in production — `storeMediaFromTempFile()` uploads to Cloudinary first and falls back to local storage only in development.
- **AI quota scaling**: The 5-key rotation pool can be extended by adding more GCP project keys to `.env`. The model cascade and offline fallback add resilience without any code changes.
- **Database indexing**: Critical query paths (diagnosis history, user lookups) are indexed for consistent performance as data grows.
- **Zero-downtime deploys**: Vercel's immutable deployments mean every push creates a new deployment. Rollback is instant via the Vercel dashboard.

---

## Error Handling and Resilience

The system is designed with defense-in-depth — no single failure point can bring down the platform:

| System | Failure Scenario | Resilience Strategy |
|:---|:---|:---|
| **AI Diagnosis** | All Gemini API keys exhausted (429) | 5-key rotation → 7-model cascade → Offline rule-based engine |
| **AI Diagnosis** | Gemini returns malformed JSON | `extractJsonObject()` strips markdown fences, retries parse, falls back to structured error |
| **OTP Delivery** | WhatsApp API down | Falls to SMS → Dev console. 10-second `AbortController` timeout per channel. |
| **Media Upload** | Cloudinary API unavailable | `storeMediaFromTempFile()` falls back to local `/uploads` directory with auto-creation |
| **Database** | Connection limit exceeded | pgBouncer connection pooler multiplexes connections from serverless instances |
| **Payment** | Razorpay signature mismatch | `crypto.timingSafeEqual` + HMAC-SHA256 verification. Payment not marked as PAID unless signature is valid. |
| **Server** | Uncaught exception in production | Global `uncaughtException` / `unhandledRejection` handlers log the error and prevent process crash |
| **Server** | Port already in use (development) | Dev script auto-kills process on port 5001 with `EADDRINUSE` detection and helpful error message |
| **Auth** | Safari drops cross-origin cookies | Dual-mode auth: cookie → Bearer token fallback |

---

## SEO Engineering

This isn't just "add meta tags." I built a programmatic Local SEO system that outranks JustDial and IndiaMART for local intent searches:

### 4 JSON-LD Schemas (injected in root `layout.tsx`)

| Schema | Type | Purpose |
|:---|:---|:---|
| **LocalBusiness** | `LocalBusiness` + `HomeAndConstructionBusiness` | Business identity: name, address (geo-coordinates `25.2417, 87.0765`), phone, operating hours (8 AM–8 PM, 7 days), price range (₹349–₹8,000), aggregate rating (4.8/5, 127 reviews), payment methods, 8 service offerings in `OfferCatalog` |
| **WebSite** | `WebSite` with `SearchAction` | Enables Google Sitelinks search box with `urlTemplate` pointing to the service page |
| **FAQPage** | `FAQPage` with 12 Q&As | High-intent questions covering cost, brands, areas, same-day service — triggers Google FAQ rich snippets |
| **Service** | `Service` with `Offer` | Standalone service catalog with ₹349 visiting charge, area served (6 localities), service type "Home Appliance Repair" |

### Keyword Strategy

- **60+ geo-targeted keywords** in the Next.js Metadata API covering:
  - `brand × service × city` — "Samsung refrigerator repair Bhagalpur", "LG AC repair Bhagalpur"
  - `service type × city` — "AC gas filling Bhagalpur", "compressor repair Bhagalpur"
  - `area-specific` — "AC repair Sabour", "fridge repair Nathnagar", "appliance repair Adampur"
- **13 `areaServed` places** with PIN codes for hyperlocal targeting (812001, 812002, 812005, 813108, 813210, 813222, 813223, 813213, 813214, 853204)
- **Dynamic per-route metadata** — each page (service, products, AI diagnosis, gallery, sell) has its own title template, description, OpenGraph, and Twitter Cards
- **Programmatic `sitemap.ts`** and **`robots.ts`** with admin/private route exclusions
- **Google Search Console verified** with site verification token in metadata

---

## Sitemap and Robots Configuration

Both files are generated programmatically via Next.js App Router conventions — no static XML files:

### `robots.ts`

| Directive | Value |
|:---|:---|
| User-Agent | `*` (all crawlers) |
| **Allowed** | `/`, `/service`, `/products`, `/ai-diagnosis`, `/sell`, `/gallery` |
| **Disallowed** | `/admin`, `/admin/`, `/orders`, `/verify-otp`, `/technician` |
| Sitemap | `https://www.goldenrefrigeration.in/sitemap.xml` |

### `sitemap.ts` (Priority Map)

| Route | Priority | Change Frequency |
|:---|:---:|:---|
| `/` | `1.00` | Weekly |
| `/service` | `0.95` | Weekly |
| `/products` | `0.85` | Weekly |
| `/ai-diagnosis` | `0.80` | Monthly |
| `/sell` | `0.65` | Monthly |
| `/gallery` | `0.60` | Monthly |
| `/login` | `0.20` | Yearly |

---

## Database Migration Strategy

Prisma manages schema changes through version-controlled migrations:

| Migration | Date | Changes |
|:---|:---|:---|
| `init_refri_schema` | March 4, 2026 | Core schema — User, ServiceBooking, ServiceAssignment, Technician, ServiceEvent, ServiceOtp, Product, Gallery, Notification, DocumentLog |
| `add_password_to_user` | March 7, 2026 | Added password field for email/password auth alongside OTP |
| `phase1_hybrid_inventory` | March 10, 2026 | Added ProductOrder, SellRequest, SellOffer models + ProductType/WarrantyType enums for marketplace |
| `add_diagnosis_log` | April 25, 2026 | Added DiagnosisLog model with composite indexes for AI diagnosis history |

Additionally, `runtime.ts` runs idempotent DDL queries at startup to handle emergency schema additions without formal migration downtime.

---

## Business Context

This platform serves a real, registered business:

| Detail | Value |
|:---|:---|
| **Business Name** | Golden Refrigeration |
| **GSTIN** | `10EFRPM9155N1ZQ` |
| **Address** | Sabour High School, Pani Tanki Sabour, Bhagalpur-813210, Bihar, India |
| **Geo Coordinates** | `25.2417°N, 87.0765°E` |
| **Operating Hours** | 8:00 AM – 8:00 PM, 7 days a week |
| **Phone** | +91 7070494254 |
| **Visiting Charge** | ₹349 (includes doorstep visit + on-site diagnosis + cost estimate) |
| **Price Range** | ₹349 – ₹8,000 |
| **Payment Accepted** | Cash, UPI (GPay, PhonePe), Razorpay Online |
| **Founded** | 2019 |
| **Google Maps** | [View on Maps](https://maps.app.goo.gl/vJ8CDd8nTpkZBG4EA) |
| **JustDial** | [Verified Business Profile](https://www.justdial.com/Bhagalpur/Golden-Refrigeration--Sabour-High-School-Sabour/9999PX641-X641-190522080859-E5V9_BZDET) |
| **Rating** | 4.8/5 (127 verified reviews) |
| **Service Area** | 13 localities across Bhagalpur district (PIN codes: 812001, 812002, 812005, 813108, 813210, 813222, 813223, 813213, 813214, 853204) |

---

## Key Constants and Configuration

These are the core configuration values hardcoded or defaulted across the platform:

| Constant | Value | Location |
|:---|:---|:---|
| JWT token expiry | `30 days` | `authController.ts` |
| Cookie `maxAge` | `30 days` (`30 × 24 × 60 × 60 × 1000` ms) | `runtime.ts` |
| Cookie `sameSite` | `"none"` (prod) / `"lax"` (dev) | `authController.ts` |
| OTP validity (login/verify) | `10 minutes` | `authController.ts` |
| OTP validity (password reset) | `15 minutes` | `authController.ts` |
| bcrypt salt rounds | `10` | `authController.ts` |
| Session keepalive interval | `10 minutes` | `AuthContext.tsx` |
| Max network failures before logout | `3` consecutive | `AuthContext.tsx` |
| Gemini API timeout per request | `60 seconds` | `aiController.ts` |
| OTP delivery timeout | `10 seconds` (AbortController) | `otpService.ts` |
| File upload limit (diagnosis) | `25 MB` | Multer config |
| File upload limit (gallery) | `100 MB` | Multer config |
| Express body size limit | `100 MB` | `index.ts` |
| Service tracker polling interval | `5 seconds` | `ServiceActiveTrackerCard.tsx` |
| Cloudinary image transforms | `f_webp,q_auto:good,c_limit,w_900` | `ProductCard.tsx` |
| Default backend port | `5001` | `runtime.ts` |
| Default UPI ID | `7070494254-2@ybl` | `runtime.ts` |

---

## Supported Media Types

The media storage service (`mediaStorageService.ts`) handles uploads with explicit MIME type validation:

| Category | MIME Types | Extensions |
|:---|:---|:---|
| **Images** | `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`, `image/heic` | `.jpg`, `.png`, `.webp`, `.gif`, `.heic` |
| **Videos** | `video/mp4`, `video/webm`, `video/quicktime`, `video/x-matroska` | `.mp4`, `.webm`, `.mov`, `.mkv` |

Files are stored with the pattern `{sanitizedBaseName}-{randomUUID()}.{ext}` — the UUID suffix prevents filename collisions across concurrent uploads.

---

## Future Improvements

- [ ] WebSocket integration for real-time service status updates (replacing polling)
- [ ] Push notifications via Firebase Cloud Messaging for technician alerts
- [ ] Multi-tenant support for onboarding additional repair businesses
- [ ] Automated testing suite (unit tests for controllers, integration tests for API endpoints, E2E with Playwright)
- [ ] Docker Compose setup for local development parity
- [ ] Rate limiting middleware (`express-rate-limit`) for public-facing endpoints
- [ ] Caching layer (Redis) for frequently accessed product listings and dashboard stats
- [ ] SaaS subscription tiers with feature gating via Razorpay Subscriptions API
- [ ] Geolocation-based technician auto-assignment using lat/lng coordinates
- [ ] WhatsApp Business API integration for order/booking status notifications
- [ ] Image compression pipeline (Sharp) before Cloudinary upload for reduced bandwidth

---

## Testing

> **Current state:** The application has been validated through manual production testing with real customers and real payments. Automated test coverage is a planned improvement.

**Verification approach used during development:**

| Test Type | Coverage |
|:---|:---|
| **API Testing** | All 74 endpoints tested via Postman/Thunder Client — happy path + error cases |
| **Payment Flow** | End-to-end Razorpay checkout verified in both test mode and live mode (real INR transactions) |
| **Cross-Browser** | Chrome, Safari, Firefox, iOS Safari — specifically validating the dual-mode auth system |
| **AI Resilience** | All 7 Gemini models tested individually, plus key rotation under simulated 429 errors, plus offline fallback engine |
| **OTP Delivery** | WhatsApp, SMS, and email channels tested across multiple Indian phone numbers and DND-registered numbers |
| **SEO Validation** | JSON-LD schemas validated via Google's Rich Results Test and Schema.org validator |
| **Mobile Responsiveness** | All pages tested on iPhone SE, iPhone 14, Samsung Galaxy, and various tablet viewports |

---

## Deployment

The application is deployed on Vercel with the following setup:

| Component | Platform | Configuration |
|:---|:---|:---|
| **Frontend** | Vercel | Next.js 16, auto-deployed on push to `main` |
| **Backend** | Vercel Serverless | Express v5 via `@vercel/node`, configured in `vercel.json` |
| **Database** | Neon | PostgreSQL 16 with pgBouncer connection pooling |
| **Media** | Cloudinary | Image/video CDN with on-the-fly WebP transforms |
| **Email** | Brevo SMTP | Transactional emails for OTP and invoices |
| **OTP** | MSG91 | WhatsApp and SMS OTP delivery |
| **Domain** | Custom | `www.goldenrefrigeration.in` |

### CI/CD Pipeline

```
Push to main → Vercel auto-build → TypeScript type-check → Deploy (zero-downtime)
                                                          ↓
                                              Immutable deployment URL generated
                                              Previous version available for instant rollback
```

Database migrations are version-controlled via Prisma (4 migration sets) and applied with `npx prisma migrate deploy`.

### Vercel Serverless Configuration (`backend/vercel.json`)

```json
{
  "version": 2,
  "builds": [{ "src": "src/index.ts", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/index.ts" }]
}
```

All incoming requests are routed to the Express server entry point, which handles routing internally via Express middleware.

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes with clear messages (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request with a description of what changed and why

**Code standards:**
- Follow the existing TypeScript conventions
- Run `npm run lint` before submitting
- Keep controllers focused — if a new feature adds 500+ lines, consider splitting into a separate controller
- Use Prisma migrations for any database schema changes

---

## License

This project is licensed under the ISC License.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) — React framework for production
- [Express.js](https://expressjs.com/) — Web framework for Node.js
- [Prisma](https://www.prisma.io/) — Type-safe database access
- [Neon](https://neon.tech/) — Serverless PostgreSQL
- [Google Gemini](https://ai.google.dev/) — Multimodal AI
- [Razorpay](https://razorpay.com/) — Payment gateway
- [Cloudinary](https://cloudinary.com/) — Media management
- [Vercel](https://vercel.com/) — Deployment platform
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [MSG91](https://msg91.com/) — OTP delivery

---

<div align="center">

### Built by [Md Athar Ali](https://github.com/Athar786-Ali)

[GitHub](https://github.com/Athar786-Ali) &middot; [LinkedIn](https://linkedin.com/in/md-athar-ali) &middot; [Email](mailto:atharali7864@gmail.com)

<br />

*This is a production-deployed SaaS platform serving a real business — not a tutorial or bootcamp project.*

</div>
