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

<p align="center">
  <img src="https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Production-success?style=for-the-badge" />
</p>

### 🌐 [Live Demo → refrismart-ai.vercel.app](https://refrismart-ai.vercel.app)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [AI Diagnostic Flow](#-ai-diagnostic-flow)
- [Database Schema](#-database-schema)
- [SEO & Local Search Strategy](#-seo--local-search-strategy)
- [Deployment](#-deployment)
- [Contact](#-contact)
- [Screenshots & UI Preview](#%EF%B8%8F-screenshots--ui-preview)
- [Security Architecture](#-security-architecture)
- [AI Resilience — Multi-Model Fallback](#-ai-resilience--multi-model-fallback-strategy)
- [Performance Optimizations](#-performance-optimizations)
- [Supported Brands](#%EF%B8%8F-supported-brands)
- [Bilingual AI Support](#-bilingual-ai-support)
- [Roadmap](#%EF%B8%8F-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)
- [Developer Profile](#-developer-profile)
- [Environment Variables Reference](#-environment-variables-reference)
- [Troubleshooting](#-troubleshooting)
- [Testing](#-testing)
- [Key Design Patterns](#-key-design-patterns)
- [FAQ](#-faq)

---

## 🌟 Overview

**RefriSmart-AI** is a **production-deployed, full-stack SaaS platform** built for **Golden Refrigeration**, Bhagalpur's premier appliance repair service. The system transforms a traditional local repair business into a digitally-powered service ecosystem — combining **AI-driven fault diagnostics**, **real-time service booking**, **admin operations management**, and **integrated payment processing** into a single cohesive web application.

> Built end-to-end by a solo developer — from database schema design and RESTful API architecture to UI/UX, AI integration, deployment pipeline, and local SEO strategy.

---

## 🎯 Problem Statement

Traditional appliance repair businesses operate entirely offline — customers struggle to describe faults, technicians waste time on unnecessary visits, and owners have zero operational visibility. **RefriSmart-AI** solves this by:

- Letting customers **upload photos/videos** of their broken appliance and receive **instant AI-generated diagnostics** before booking
- Enabling **online service booking** with transparent pricing, removing friction from the customer journey
- Providing owners with a **real-time admin dashboard** to track all bookings, orders, diagnoses, and revenue
- Allowing customers to **sell old appliances** through an automated pickup request system
- Reducing no-show visits by **qualifying fault severity** via AI before technician dispatch

---

## ✨ Key Features

### 🧠 AI-Powered Diagnostics (Core Innovation)
Upload images or videos of a faulty appliance. The platform sends the media to **Google Gemini Vision**, which returns a structured diagnostic report — identifying the likely fault, severity, recommended repair steps, and estimated cost bracket. All diagnoses are stored with full history per user.

### 🛠️ Service Booking System
End-to-end service request flow: customers select appliance type, describe the issue, choose a time slot, and confirm with a **₹349 visiting charge** paid via Razorpay. Technicians are notified and admins can update service status in real-time.

### 👨‍💼 Admin Operations Dashboard
A fully tabbed admin panel with role-based access to:
- 📊 **Live stats** (bookings, revenue, pending services)
- 🛠️ **Service request management** (accept, assign, complete)
- 📦 **Order tracking** for products and sell requests
- 🤖 **AI diagnosis history** across all users
- 👥 **User & technician management**

### 💳 Razorpay Payment Integration
Visiting fees and product purchases handled through Razorpay's payment gateway, with order IDs tracked in the database for reconciliation.

### 🔐 Secure Authentication
JWT-based stateless authentication with **email OTP verification** (Nodemailer). Passwords hashed with bcryptjs. Cookie-based token delivery with protected API routes via custom middleware.

### 📦 Product Catalog & Sell Flow
Users can browse refrigeration parts and products, place orders, or submit an old appliance for pickup with valuation — creating a circular economy within the platform.

### 📱 Fully Responsive UI
Built mobile-first with **Tailwind CSS v4**, ensuring a polished experience across phones, tablets, and desktops.

### 🗺️ Local SEO Optimization
Structured data (JSON-LD), Open Graph meta tags, auto-generated XML sitemap, and robots.txt — engineered to rank for local Google searches in Bhagalpur, Bihar.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│              Next.js 16 App Router — Vercel CDN                 │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS REST API
┌────────────────────────────▼────────────────────────────────────┐
│                    BACKEND API SERVER                            │
│             Express.js v5 — Vercel Serverless Functions          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Auth Layer  │  │  AI Layer    │  │   Business Logic      │  │
│  │  JWT + OTP   │  │  Gemini SDK  │  │  Services/Orders/     │  │
│  │  bcryptjs    │  │  Cloudinary  │  │  Products/Admin       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  Razorpay    │  │  Nodemailer  │                             │
│  │  Payments    │  │  SMTP Email  │                             │
│  └──────────────┘  └──────────────┘                             │
└────────────────────────────┬────────────────────────────────────┘
                             │ Prisma ORM
┌────────────────────────────▼────────────────────────────────────┐
│                       PostgreSQL Database                        │
│                    (Neon / Supabase hosted)                      │
└─────────────────────────────────────────────────────────────────┘
```

**Key Architectural Decisions:**
- **Monorepo structure** — frontend and backend co-located for simplified deployments
- **Serverless backend** — Express on Vercel Serverless Functions, zero server management
- **Prisma ORM** — type-safe database queries with auto-generated TypeScript client
- **Cloudinary CDN** — media stored and served from global CDN, not the API server
- **Stateless auth** — JWTs in HTTP-only cookies; no session store needed

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| **Next.js** | 16.1.6 | React framework with App Router, SSR/SSG |
| **React** | 19.2.3 | Component model, concurrent rendering |
| **TypeScript** | ^5 | Static type safety across the entire frontend |
| **Tailwind CSS** | v4 | Utility-first styling, mobile-first responsive design |
| **Lucide React** | ^0.577 | Consistent SVG icon system |
| **Sonner** | ^2.0.7 | Non-blocking toast notification system |
| **React Player** | ^3.4 | Video playback for AI diagnosis media review |
| **React QR Code** | ^2.0.18 | QR code generation for quick links |

### Backend

| Technology | Version | Role |
|---|---|---|
| **Node.js** | v20+ | Runtime environment |
| **Express.js** | v5.2.1 | HTTP server & routing framework |
| **TypeScript** | ^5.9 | Type safety for controllers, services, and middleware |
| **Prisma ORM** | v7.4 | Database schema, migrations, and type-safe queries |
| **PostgreSQL** | ^8.20 | Relational database (via `pg` driver) |
| **@google/genai** | ^1.44 | Google Gemini Vision AI SDK |
| **Cloudinary** | ^2.9 | Image & video cloud storage with CDN delivery |
| **Razorpay** | ^2.9.6 | Payment gateway SDK — order creation & verification |
| **Nodemailer** | ^8.0.6 | SMTP email for OTP and transactional messages |
| **Multer** | ^2.1.1 | Multipart file upload middleware |
| **Bcryptjs** | ^3.0.3 | Secure password hashing (salted) |
| **JSON Web Token** | ^9.0.3 | Stateless auth token generation & verification |
| **Cookie Parser** | ^1.4.7 | HTTP cookie parsing for token delivery |

### Infrastructure & DevOps

| Service | Purpose |
|---|---|
| **Vercel** | Frontend hosting (CDN + edge) + Backend serverless functions |
| **Neon / Supabase** | Managed PostgreSQL — serverless-compatible connection pooling |
| **Cloudinary** | Media CDN — images and diagnostic videos |
| **GitHub** | Version control and CI/CD trigger (Vercel auto-deploys on push) |

---

## 📁 Project Structure

```
RefriSmart-AI/
│
├── frontend/                           # Next.js 16 App Router Frontend
│   └── src/
│       ├── app/
│       │   ├── layout.tsx              # Root layout — SEO, JSON-LD schema injection
│       │   ├── page.tsx                # Homepage — hero, services, service areas
│       │   ├── sitemap.ts              # Auto-generated XML sitemap (Next.js API)
│       │   ├── robots.ts              # Robots.txt configuration
│       │   │
│       │   ├── admin/                  # 🔒 Admin-only dashboard (role-gated)
│       │   │   ├── page.tsx            # Tabbed dashboard shell
│       │   │   ├── _dashboard.tsx      # Live stats — bookings, revenue, users
│       │   │   ├── _services.tsx       # Service request management
│       │   │   ├── _orders.tsx         # Product & sell order management
│       │   │   ├── _diagnoses.tsx      # AI diagnosis history (all users)
│       │   │   ├── _sell.tsx           # Appliance sell request review
│       │   │   └── _profile.tsx        # Admin profile settings
│       │   │
│       │   ├── ai-diagnosis/           # 🤖 AI diagnostic upload & report display
│       │   ├── service/                # 🛠️ Service booking flow
│       │   ├── orders/                 # 📦 User order tracking
│       │   ├── products/               # 🛒 Product catalog & ordering
│       │   ├── sell/                   # ♻️ Appliance sell/pickup request
│       │   ├── gallery/                # 📷 Work gallery
│       │   ├── technician/             # 🔧 Technician job portal
│       │   ├── login/                  # 🔐 Auth — Login & Register
│       │   └── verify-otp/             # ✉️ Email OTP verification
│       │
│       └── components/
│           ├── Navbar.tsx
│           ├── Footer.tsx
│           ├── BrandLogo.tsx
│           └── ServiceHistoryCard.tsx
│
└── backend/                            # Express.js + Prisma API Server
    ├── src/
    │   ├── index.ts                    # Server entry — middleware, routes, CORS
    │   ├── controllers/
    │   │   ├── authController.ts       # Register, login, OTP, JWT cookie management
    │   │   ├── aiController.ts         # Gemini API integration — media upload & diagnosis
    │   │   ├── adminController.ts      # Full CRUD for all admin operations
    │   │   └── productController.ts    # Product listing, ordering, sell requests
    │   ├── routes/
    │   │   ├── authRoutes.ts
    │   │   ├── aiRoutes.ts
    │   │   ├── adminRoutes.ts
    │   │   └── productRoutes.ts
    │   ├── middlewares/                # JWT auth guard, role check, error handler
    │   ├── services/                   # Business logic decoupled from controllers
    │   ├── config/                     # Cloudinary, Razorpay, Prisma client init
    │   └── utils/                      # Reusable helpers (email templates, validators)
    │
    ├── prisma/
    │   └── schema.prisma               # Full database schema — all models & relations
    │
    ├── vercel.json                     # Serverless function routing config
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed and accounts ready:

- [Node.js](https://nodejs.org/) **v20+**
- [PostgreSQL](https://www.postgresql.org/) (or a hosted DB like [Neon](https://neon.tech/))
- [Cloudinary](https://cloudinary.com/) account — for media storage
- [Razorpay](https://razorpay.com/) account — for payments
- [Google AI Studio](https://aistudio.google.com/) account — for Gemini API key
- Gmail account (with App Password enabled) — for OTP emails

---

### 1. Clone the Repository

```bash
git clone https://github.com/Athar786-Ali/RefriSmart-AI.git
cd RefriSmart-AI
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 3. Configure Environment Variables

**`backend/.env`**
```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/refrismart_db"

# Authentication
JWT_SECRET="your_strong_jwt_secret"

# Cloudinary (media storage)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Google Gemini AI
GEMINI_API_KEY="your_google_gemini_api_key"

# Razorpay (payments)
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Email / OTP (Nodemailer + Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_gmail_app_password"
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key_id"
```

### 4. Set Up the Database

```bash
cd backend
npx prisma generate          # Generate type-safe Prisma client
npx prisma db push           # Push schema to DB (dev/quick setup)
# OR
npx prisma migrate dev       # Run tracked migrations (recommended for staging/prod)
```

### 5. Run the Application

```bash
# Terminal 1 — Backend API (port 5001)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://127.0.0.1:3000 |
| Backend API | http://localhost:5001/api |

---

## 📡 API Reference

All routes are prefixed with `/api`. Protected routes require a valid JWT cookie.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Register new user (triggers OTP email) |
| `POST` | `/auth/login` | ❌ | Login — sets JWT cookie |
| `POST` | `/auth/verify-otp` | ❌ | Verify email OTP |
| `POST` | `/auth/logout` | ✅ | Clear auth cookie |

### AI Diagnostics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/ai/diagnose` | ✅ | Upload media → Gemini analysis → stored diagnosis |
| `GET` | `/ai/history` | ✅ | Fetch current user's diagnosis history |

### Services & Bookings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/service/book` | ✅ | Book a repair service (triggers Razorpay order) |
| `GET` | `/service/my` | ✅ | Get user's service history |

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/products` | ❌ | List all available products |
| `POST` | `/products/order` | ✅ | Place a product order |

### Admin (Role-Gated)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/stats` | 🔒 Admin | Dashboard statistics |
| `GET/PATCH` | `/admin/services` | 🔒 Admin | Manage service requests |
| `GET/PATCH` | `/admin/orders` | 🔒 Admin | Manage product orders |
| `GET` | `/admin/diagnoses` | 🔒 Admin | All AI diagnoses (all users) |
| `GET/DELETE` | `/admin/users` | 🔒 Admin | User management |

---

## 🤖 AI Diagnostic Flow

```
User uploads image/video
        │
        ▼
Multer middleware handles multipart/form-data
        │
        ▼
File streamed to Cloudinary → returns secure CDN URL
        │
        ▼
Cloudinary URL + user's description sent to Gemini Vision API
        │
        ▼
Gemini returns structured diagnosis:
  - Identified appliance & fault type
  - Severity level (minor / moderate / critical)
  - Recommended repair steps
  - Estimated cost range
        │
        ▼
Diagnosis stored in PostgreSQL (linked to user)
        │
        ▼
Result displayed to user with option to book a service
```

---

## 🗄️ Database Schema

Key models in `prisma/schema.prisma`:

```
User          — id, name, email, password, role, isVerified, createdAt
OTP           — id, userId, code, expiresAt
Service       — id, userId, applianceType, issue, status, scheduledAt, paymentId
Diagnosis     — id, userId, mediaUrl, geminiResult, createdAt
Order         — id, userId, productId, quantity, status, razorpayOrderId
Product       — id, name, description, price, imageUrl, stock
SellRequest   — id, userId, applianceType, condition, description, status
```

All models use **UUIDs** as primary keys. Relationships enforced at the DB level via Prisma's `@relation` directives.

---

## 🗺️ SEO & Local Search Strategy

Engineered specifically for **local Google search ranking** in Bhagalpur, Bihar:

| SEO Element | Implementation |
|---|---|
| **JSON-LD Schema** | `LocalBusiness`, `FAQPage`, `Service` schemas in `layout.tsx` |
| **Open Graph / Twitter Cards** | Dynamic meta tags on all pages |
| **XML Sitemap** | Auto-generated via Next.js `sitemap.ts` API |
| **Robots.txt** | Configured via `robots.ts` |
| **Canonical URLs** | Set on every page to prevent duplicate content |
| **Geo-coordinates** | Structured address + lat/lng for Google Maps integration |
| **Keyword Targeting** | Page content optimized for "AC repair Bhagalpur", "refrigerator repair near me" |

---

## 🚢 Deployment

### Frontend (Vercel)
- Connected to GitHub repo → **auto-deploys on every push to `main`**
- Environment variables configured in Vercel project settings
- Live at: [refrismart-ai.vercel.app](https://refrismart-ai.vercel.app)

### Backend (Vercel Serverless)
- Express app exported as a Vercel Serverless Function via `vercel.json`
- All routes handled by a single serverless entry point
- Database connects via **Neon's connection pooler** (serverless-compatible)

```json
// backend/vercel.json
{
  "version": 2,
  "builds": [{ "src": "dist/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "dist/index.js" }]
}
```

### CI/CD Pipeline
```
Developer pushes to GitHub main branch
         │
         ▼
Vercel detects push → triggers build pipeline
         │
         ▼
Frontend: next build → deployed to global CDN
Backend:  tsc compile → deployed as Serverless Function
         │
         ▼
Live at production URL within ~60 seconds
```

---

## 📞 Contact

**Golden Refrigeration — Bhagalpur**

| | |
|---|---|
| 📍 **Address** | Sabour High School, Pani Tanki Sabour, Bhagalpur, Bihar — 813210 |
| 📞 **Phone** | [+91 7070494254](tel:+917070494254) |
| 🌐 **Website** | [refrismart-ai.vercel.app](https://refrismart-ai.vercel.app) |
| 🗺️ **Google Maps** | [View on Maps](https://maps.app.goo.gl/vJ8CDd8nTpkZBG4EA) |
| 📖 **JustDial** | [View Listing](https://www.justdial.com/Bhagalpur/Golden-Refrigeration-Sabour-High-School-Sabour/9999PX641-X641-190522080859-E5V9_BZDET) |

---

## 🖼️ Screenshots & UI Preview

<details>
<summary><b>🏠 Homepage — Hero & Services</b></summary>
<br/>

The homepage features a **premium dark-mode hero section** with a full-bleed background image, glassmorphism badges, and animated CTAs. Below, a responsive 4-column card grid showcases core services (AC, Refrigerator, Washing Machine, Electronics) with **parallax hover effects** and gradient overlays on real service photos.

**Key UI elements:**
- Sticky floating "Call Technician" button with pulse animation
- Curved SVG section dividers for seamless visual flow
- Service area badges with map pins for local SEO
- JustDial-verified review card with star ratings

</details>

<details>
<summary><b>🤖 AI Diagnosis — Upload & Report</b></summary>
<br/>

Users upload an image or video of a broken appliance directly in-browser. The system displays a **structured diagnostic card** with:
- 🔍 Identified fault (e.g., "Low refrigerant R-22, dirty condenser coil")
- ⚠️ Safety warnings specific to the repair
- 🛠️ Step-by-step repair plan the technician will follow
- 💰 Estimated cost breakdown (visit + labour + parts)
- 📞 One-tap call/WhatsApp buttons to book immediately

Media playback for video uploads is handled via **React Player** with responsive aspect ratios.

</details>

<details>
<summary><b>👨‍💼 Admin Dashboard — Tabbed Operations</b></summary>
<br/>

A fully tabbed admin panel with role-gated access provides:
- **Dashboard tab**: Live stats cards (total bookings, revenue, pending services, user count)
- **Services tab**: Filterable list of all service requests with status toggles (Pending → Assigned → Completed)
- **Orders tab**: Product and sell-request order management
- **Diagnoses tab**: Full AI diagnosis history across all users with media preview
- **Profile tab**: Admin profile settings and password management

</details>

<details>
<summary><b>🛒 Product Catalog & Sell Flow</b></summary>
<br/>

- **Products page**: Grid of refrigeration parts and appliances with pricing, stock indicators, and one-click ordering
- **Sell page**: Form-based appliance pickup request — users describe condition, upload photos, and submit for valuation
- **Orders page**: User-facing order history with status tracking and Razorpay payment references

</details>

---

## 🔒 Security Architecture

RefriSmart-AI implements **defense-in-depth** security across every layer:

| Layer | Implementation | Details |
|---|---|---|
| **Authentication** | JWT + HTTP-Only Cookies | Tokens stored in `httpOnly`, `secure`, `sameSite` cookies — immune to XSS token theft |
| **Password Storage** | bcryptjs (salted hashes) | Passwords never stored in plaintext; salted with per-user unique salts |
| **Email Verification** | Time-limited OTP | 6-digit OTPs expire after a configured window; prevents unverified account abuse |
| **CORS Policy** | Strict origin allowlist | Production mode restricts API access to explicitly whitelisted frontend domains only |
| **Role-Based Access** | Middleware-enforced | Admin routes protected by `roleGuard` middleware — checked on every request |
| **Input Validation** | Controller-level checks | All user inputs validated/sanitized before processing or database insertion |
| **File Uploads** | Multer + Cloudinary | Files processed in memory with size/type limits; stored on CDN, not on the API server |
| **Error Handling** | Centralized error middleware | Stack traces never exposed to clients in production; generic error messages returned |
| **Graceful Shutdown** | Process handlers | `uncaughtException` and `unhandledRejection` handlers prevent silent crashes |

---

## 🧠 AI Resilience — Multi-Model Fallback Strategy

The AI diagnostic engine is designed to **never fail silently**. If one model is unavailable or rate-limited, the system cascades through alternatives:

```
Request arrives at /api/ai/diagnose
         │
         ▼
   ┌─────────────────────────────────────────────┐
   │  Model 1: gemini-flash-lite-latest (Free)   │──✅──→ Return diagnosis
   │  Fastest, lowest latency, free tier          │
   └─────────────────────────┬───────────────────┘
                             │ ❌ Failed / Rate-limited
                             ▼
   ┌─────────────────────────────────────────────┐
   │  Model 2: gemini-flash-latest (Free)        │──✅──→ Return diagnosis
   │  Higher quality, still within free quota     │
   └─────────────────────────┬───────────────────┘
                             │ ❌ Failed / Rate-limited
                             ▼
   ┌─────────────────────────────────────────────┐
   │  Model 3: gemini-pro-latest (Paid)          │──✅──→ Return diagnosis
   │  Highest quality, used as final AI attempt   │
   └─────────────────────────┬───────────────────┘
                             │ ❌ All AI models failed
                             ▼
   ┌─────────────────────────────────────────────┐
   │  Smart Fallback Engine (Rule-Based)          │──✅──→ Return diagnosis
   │  Appliance + issue keyword matching          │
   │  15+ pre-built diagnostic rules              │
   │  Bilingual support (English + Hinglish)      │
   └─────────────────────────────────────────────┘
```

**Key design decisions:**
- No hardcoded timeouts — AI models are given unlimited time to respond (avoids premature fallback)
- Uploaded media files are cleaned up from temp storage after processing (Gemini File API + local disk)
- Every diagnosis is persisted to PostgreSQL regardless of which model (or fallback) generated it
- Response includes a `fallbackUsed` flag so the frontend can optionally indicate when rule-based diagnosis was used

---

## ⚡ Performance Optimizations

| Optimization | Impact |
|---|---|
| **Next.js App Router (SSR/SSG)** | Pages pre-rendered at build time where possible; dynamic routes use streaming SSR for instant TTFB |
| **Cloudinary CDN** | All media served from global edge locations — zero load on the API server for images/videos |
| **Vercel Edge Network** | Frontend assets cached at 100+ global PoPs; automatic Brotli compression |
| **Serverless Backend** | Express runs as Vercel Serverless Functions — scales to zero, no idle server costs |
| **Prisma Connection Pooling** | Uses Neon's serverless connection pooler to avoid cold-start DB connection overhead |
| **Preconnect Hints** | `<link rel="preconnect">` for Google Fonts and image CDNs — eliminates DNS lookup latency |
| **Image Optimization** | Unsplash images loaded with quality and size parameters (`q=80&w=1200`) to reduce payload |
| **Cookie-based Auth** | No `Authorization` header round-trips; cookies sent automatically, reducing JS overhead |
| **Concurrent Rendering** | React 19 concurrent features for non-blocking UI updates during AI diagnosis loading |

---

## 🏷️ Supported Brands

RefriSmart-AI's diagnostic engine and technician expertise cover all major Indian appliance brands:

<div align="center">

| ACs & Coolers | Refrigerators | Washing Machines |
|:---:|:---:|:---:|
| LG | Samsung | Whirlpool |
| Samsung | LG | LG |
| Voltas | Haier | Samsung |
| Daikin | Whirlpool | IFB |
| Blue Star | Godrej | Bosch |
| Carrier | Kelvinator | Godrej |
| Hitachi | Videocon | Voltas Beko |
| Lloyd | Blue Star | Haier |
| Panasonic | Panasonic | Panasonic |

</div>

> 💡 **Not listed?** We repair **all brands** — the above are the most commonly serviced in the Bhagalpur region. Contact us for any unlisted brand.

---

## 🌍 Bilingual AI Support

The diagnostic engine automatically **detects the user's input language** and responds accordingly:

| Input Language | Detection Method | Response Language |
|---|---|---|
| English | Default / Latin script | Clear, professional English |
| Hindi / Hinglish | Unicode Devanagari detection + Hindi keyword matching | Friendly Hinglish (Roman script) |

This ensures that both English-speaking and Hindi-speaking customers in Bhagalpur receive diagnoses in a language they're comfortable with — no manual language selection required.

---

## 🗺️ Roadmap

<table>
<tr>
<td width="50%">

### ✅ Shipped
- [x] AI-powered fault diagnosis (Gemini Vision)
- [x] Multi-model fallback with rule-based safety net
- [x] Razorpay payment integration (visiting charge)
- [x] Email OTP verification flow
- [x] Admin dashboard with live stats
- [x] Product catalog & ordering
- [x] Appliance sell/pickup request system
- [x] Bilingual AI responses (EN + Hinglish)
- [x] JSON-LD structured data + XML sitemap
- [x] Fully responsive mobile-first UI
- [x] Cloudinary media storage
- [x] Technician job portal

</td>
<td width="50%">

### 🚧 Planned
- [ ] Push notifications for service status updates
- [ ] Technician live location tracking
- [ ] Customer review & rating system
- [ ] WhatsApp Business API integration
- [ ] Recurring maintenance subscription plans
- [ ] Multi-language UI (Hindi + English toggle)
- [ ] Invoice PDF auto-generation
- [ ] Inventory management for spare parts
- [ ] Analytics dashboard with revenue charts
- [ ] PWA support for offline access

</td>
</tr>
</table>

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve RefriSmart-AI, here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Contribution Guidelines

- Follow existing code style and TypeScript conventions
- Write descriptive commit messages using [Conventional Commits](https://www.conventionalcommits.org/)
- Test your changes locally before submitting a PR
- Update the README if your change adds new features or modifies the setup process

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025-2026 Athar Ali — Golden Refrigeration

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgements

| | |
|---|---|
| **[Google Gemini](https://ai.google.dev/)** | Powering the AI diagnostic engine with multimodal vision capabilities |
| **[Vercel](https://vercel.com/)** | Hosting both frontend and backend with seamless CI/CD and global edge network |
| **[Neon](https://neon.tech/)** | Serverless PostgreSQL with connection pooling — perfect for Vercel Functions |
| **[Cloudinary](https://cloudinary.com/)** | Global media CDN for diagnostic images and videos |
| **[Razorpay](https://razorpay.com/)** | India's leading payment gateway powering our booking transactions |
| **[Prisma](https://www.prisma.io/)** | Type-safe ORM that makes database queries a joy to write |
| **[Next.js](https://nextjs.org/)** | The React framework that powers our SSR/SSG frontend |
| **[Tailwind CSS](https://tailwindcss.com/)** | Utility-first CSS framework for rapid, responsive UI development |

---

---

## 👨‍💻 Developer Profile

<div align="center">

| | |
|:---:|:---:|
| **Name** | Athar Ali |
| **Role** | Full-Stack Developer (Solo) |
| **Project Type** | Production SaaS — Real Business Client |
| **GitHub** | [@Athar786-Ali](https://github.com/Athar786-Ali) |
| **Built In** | 2025–2026 |

</div>

This entire platform — from **PostgreSQL schema design**, **RESTful API architecture**, **AI integration**, **payment gateway**, **admin dashboard**, **frontend UI/UX**, to **Vercel deployment** and **local SEO** — was designed, developed, and deployed **solo**. It serves as a real-world production system for a local appliance repair business in Bhagalpur, Bihar.

**Key solo-developer accomplishments:**
- Architected a full-stack monorepo with separate frontend (Next.js) and backend (Express) — both deployed on Vercel
- Integrated Google Gemini Vision AI with a custom 4-tier fallback strategy (3 AI models + rule-based engine)
- Implemented end-to-end payment flow with Razorpay including webhook-safe order verification
- Built a comprehensive admin operations dashboard with live stats and role-based access control
- Engineered local SEO strategy with JSON-LD structured data, XML sitemap, and geo-targeting

---

## 🔑 Environment Variables Reference

A complete reference for all required environment variables across both services.

### Backend (`backend/.env`)

| Variable | Required | Example Value | Description |
|---|:---:|---|---|
| `DATABASE_URL` | ✅ | `postgresql://user:pass@host:5432/db` | PostgreSQL connection string (supports Neon/Supabase pooler URLs) |
| `JWT_SECRET` | ✅ | `a-very-long-random-string` | Secret key for signing and verifying JWTs — use at least 32 chars |
| `CLOUDINARY_CLOUD_NAME` | ✅ | `your_cloud_name` | Your Cloudinary account cloud name |
| `CLOUDINARY_API_KEY` | ✅ | `123456789012345` | Cloudinary API key from dashboard |
| `CLOUDINARY_API_SECRET` | ✅ | `your_api_secret` | Cloudinary API secret (keep private) |
| `GEMINI_API_KEY` | ✅ | `AIzaSy...` | Google Gemini API key from [AI Studio](https://aistudio.google.com/) |
| `RAZORPAY_KEY_ID` | ✅ | `rzp_live_...` | Razorpay Key ID (use `rzp_test_...` for dev) |
| `RAZORPAY_KEY_SECRET` | ✅ | `your_key_secret` | Razorpay Key Secret (keep private) |
| `SMTP_HOST` | ✅ | `smtp.gmail.com` | SMTP server hostname for OTP emails |
| `SMTP_PORT` | ✅ | `587` | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | ✅ | `your@gmail.com` | Gmail address used to send OTP emails |
| `SMTP_PASS` | ✅ | `xxxx xxxx xxxx xxxx` | Gmail App Password (not your account password) |
| `NODE_ENV` | ⚠️ Optional | `production` | Set to `production` in deployment; affects CORS and cookie security |
| `PORT` | ⚠️ Optional | `5001` | API server port (defaults to 5001 locally) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Example Value | Description |
|---|:---:|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:5001/api` | Backend API base URL (use full production URL in deployment) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ✅ | `rzp_live_...` | Public Razorpay Key ID (safe to expose — used to initialise Razorpay checkout) |

> ⚠️ **Never commit `.env` or `.env.local` files to version control.** Both are listed in `.gitignore`. Use Vercel's environment variable settings for production secrets.

---

## 🐛 Troubleshooting

Common issues and their solutions when setting up RefriSmart-AI locally:

### Database / Prisma

| Issue | Likely Cause | Fix |
|---|---|---|
| `Error: Can't reach database server` | Wrong `DATABASE_URL` or DB not running | Verify connection string; ensure PostgreSQL is running or Neon DB is accessible |
| `PrismaClientInitializationError` | Prisma client not generated | Run `npx prisma generate` inside `backend/` |
| `Table doesn't exist` | Schema not pushed/migrated | Run `npx prisma db push` or `npx prisma migrate dev` |
| `Connection pool timeout` | Too many concurrent connections (serverless) | Use Neon's pooler URL (`?pgbouncer=true&connection_limit=1`) |

### Authentication

| Issue | Likely Cause | Fix |
|---|---|---|
| `401 Unauthorized` on protected routes | JWT cookie missing or expired | Re-login; check that `NODE_ENV` matches cookie `secure` flag setting |
| OTP email not received | SMTP misconfiguration | Verify Gmail App Password; ensure 2FA is enabled on the Gmail account |
| OTP always shows as invalid | Clock skew / expired OTP | OTPs expire quickly — request a new one; check server time sync |

### AI Diagnostics

| Issue | Likely Cause | Fix |
|---|---|---|
| `Gemini API error 429` | Rate limit exceeded on free tier | Wait a moment; the fallback engine will handle it automatically |
| Upload fails silently | File too large or wrong type | Ensure images are under Multer's size limit; accepted: JPEG, PNG, MP4, WebM |
| `CLOUDINARY_API_SECRET not set` | Missing env variable | Check `backend/.env` for all three Cloudinary variables |

### Payments

| Issue | Likely Cause | Fix |
|---|---|---|
| Razorpay modal doesn't open | Wrong `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Use the correct test/live key matching your account mode |
| Payment succeeds but booking not created | Verification failure | Check that `RAZORPAY_KEY_SECRET` in backend matches the Razorpay dashboard |

### Running Locally

| Issue | Likely Cause | Fix |
|---|---|---|
| Port 5001 already in use | Previous backend instance still running | The `npm run dev` script auto-kills port 5001 — or manually run `lsof -ti:5001 \| xargs kill -9` |
| CORS error in browser | Frontend URL not in CORS allowlist | Set `NODE_ENV=development` in `backend/.env` for permissive local CORS |
| `Module not found: ts-node` | Missing dev dependencies | Run `npm install` inside `backend/` |

---

## 🧪 Testing

RefriSmart-AI is a production application. Below are the recommended approaches for testing each layer:

### Manual API Testing

Use a REST client like [Insomnia](https://insomnia.rest/) or [Thunder Client](https://www.thunderclient.com/) (VS Code extension).

**Base URL (local):** `http://localhost:5001/api`

#### Example: Register a new user
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "Test@1234"}'
```

#### Example: Trigger AI diagnosis (with media file)
```bash
curl -X POST http://localhost:5001/api/ai/diagnose \
  -H "Cookie: token=<your_jwt>" \
  -F "media=@/path/to/fridge_photo.jpg" \
  -F "description=Fridge not cooling, making noise"
```

### Database Inspection

```bash
cd backend
npx prisma studio   # Opens a browser-based DB GUI at http://localhost:5555
```

This gives you a live visual editor for all database tables — useful for verifying that bookings, diagnoses, and users are persisted correctly.

### Smoke Test Checklist

After setup, walk through these flows to verify everything works end-to-end:

- [ ] Register a new user → receive OTP email → verify OTP → see dashboard
- [ ] Upload an appliance photo → receive AI diagnostic report
- [ ] Book a service → complete Razorpay payment → verify booking appears in admin panel
- [ ] Browse products → place an order → verify order in user's order history
- [ ] Submit a sell request → verify it appears in admin panel
- [ ] Login as admin (`role: ADMIN`) → check all dashboard tabs load correctly

### Lint & Type Checking

```bash
# Frontend
cd frontend && npm run lint

# Backend — TypeScript type check
cd backend && npx tsc --noEmit
```

---

## 🧩 Key Design Patterns

Key architectural and coding patterns used throughout the codebase:

### Backend Patterns

| Pattern | Where Used | Benefit |
|---|---|---|
| **Controller → Service separation** | All API routes | Business logic decoupled from HTTP layer; easier to test and reuse |
| **Middleware chain** | Auth, role guard, error handler | Cross-cutting concerns applied uniformly across all routes |
| **Centralized error middleware** | `src/index.ts` | All unhandled errors caught in one place; no error leaks to clients |
| **Repository pattern (via Prisma)** | All DB queries | Type-safe queries; easy to swap DB or add caching later |
| **Graceful process handling** | `src/index.ts` | `uncaughtException` + `unhandledRejection` prevent silent server crashes |
| **Cascade fallback** | `aiController.ts` | AI model chain with rule-based safety net ensures 100% diagnostic availability |

### Frontend Patterns

| Pattern | Where Used | Benefit |
|---|---|---|
| **App Router layouts** | `app/layout.tsx` | Shared layout, metadata, JSON-LD injected once for the whole app |
| **Server Components (default)** | All page components | Reduced client-side JS bundle; better SEO and TTFB |
| **Client Components (`"use client"`)** | Interactive forms, payment flow | Progressive enhancement — only interactive parts shipped to browser |
| **Cookie-based auth (httpOnly)** | Auth middleware | XSS-immune token storage; auto-included in every API request |
| **Component co-location** | `admin/_*.tsx` files | Dashboard sub-components live next to their parent page |

### Data Flow

```
[User Action] → [Next.js Route Handler / Client fetch]
     │
     ▼
[Express Controller] → [Service Layer] → [Prisma ORM] → [PostgreSQL]
     │
     ▼ (AI routes only)
[Multer] → [Cloudinary] → [Gemini Vision API] → [Structured Result]
     │
     ▼
[Response JSON] → [Next.js Component re-render]
```

---

## ❓ FAQ

**Q: Is this a real production application or just a demo?**
> A: It is a real, production-deployed application actively used by **Golden Refrigeration**, a physical appliance repair business in Bhagalpur, Bihar, India. The live URL is [refrismart-ai.vercel.app](https://refrismart-ai.vercel.app).

**Q: Which AI model does the diagnosis use?**
> A: It uses **Google Gemini Vision** (multimodal) via the `@google/genai` SDK. Three Gemini models are tried in sequence (`gemini-flash-lite-latest` → `gemini-flash-latest` → `gemini-pro-latest`), and if all fail, a custom rule-based engine with 15+ diagnostic rules handles the request as a fallback.

**Q: Can I use this for a different repair business?**
> A: Yes! The codebase is designed to be adaptable. You would need to update the business details in `frontend/src/app/layout.tsx` (JSON-LD, meta tags), update the service area content on the homepage, and reconfigure your own environment variables.

**Q: Is Razorpay required? Can I skip payment integration?**
> A: Razorpay is used only for the ₹349 visiting fee and product orders. If you want to disable payments, you can remove the payment step from the service booking flow — the rest of the platform (AI diagnosis, admin, auth) works independently.

**Q: What happens if the Gemini API is down?**
> A: The multi-tier fallback strategy ensures the platform **always returns a diagnostic result**. The final fallback is a rule-based engine (keyword matching on the user's description + appliance type) that works 100% offline without any external API calls.

**Q: How do I create an admin account?**
> A: Register a user normally, then use **Prisma Studio** (`npx prisma studio`) to change that user's `role` field from `USER` to `ADMIN` directly in the database. Admin role assignment from the UI is intentionally not exposed for security reasons.

**Q: What is the visiting charge and how is it handled?**
> A: When a customer books a service, a ₹349 visiting fee is collected upfront via Razorpay. The order is created on the backend using Razorpay's API, the customer completes payment in the Razorpay modal, and the backend verifies the payment signature before confirming the booking in the database.

**Q: Does the platform support multiple languages in the UI?**
> A: The **AI diagnostic responses** support automatic English/Hinglish detection and response. The main **UI is in English**. A full Hindi/English UI toggle is on the roadmap.

**Q: How are media files handled? Are they stored on the server?**
> A: No. Uploaded images and videos are streamed directly to **Cloudinary** via Multer's memory storage. Files are never written to disk on the API server. After Cloudinary returns a CDN URL, the URL (not the file) is sent to Gemini and stored in the database.

---

<div align="center">

**Built end-to-end with ❤️ — from schema design to production deployment.**

*Full-Stack · AI Integration · Payment Gateway · Local SEO · Admin Dashboard · Serverless Deployment*

<br/>

<p>
  <img src="https://img.shields.io/github/stars/Athar786-Ali/RefriSmart-AI?style=social" alt="GitHub Stars" />
  <img src="https://img.shields.io/github/forks/Athar786-Ali/RefriSmart-AI?style=social" alt="GitHub Forks" />
  <img src="https://img.shields.io/github/watchers/Athar786-Ali/RefriSmart-AI?style=social" alt="GitHub Watchers" />
</p>

<p>
  <a href="https://refrismart-ai.vercel.app">🌐 Live Demo</a> •
  <a href="https://github.com/Athar786-Ali/RefriSmart-AI/issues">🐛 Report Bug</a> •
  <a href="https://github.com/Athar786-Ali/RefriSmart-AI/issues">✨ Request Feature</a>
</p>

**If you found this project useful, consider giving it a ⭐ on GitHub!**

</div>
