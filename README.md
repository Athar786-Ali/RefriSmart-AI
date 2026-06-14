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
  <img src="https://img.shields.io/github/stars/Athar786-Ali/RefriSmart-AI?style=for-the-badge&logo=github&color=yellow" />
</p>

### 🌐 [Live Demo → refrismart-ai.vercel.app](https://refrismart-ai.vercel.app)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Why RefriSmart-AI?](#-why-refrismart-ai)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [AI Diagnostic Flow](#-ai-diagnostic-flow)
- [AI Resilience — Multi-Model Fallback](#-ai-resilience--multi-model-fallback-strategy)
- [Gemini Multi-Key Rotation](#-gemini-multi-key-rotation)
- [Database Schema](#-database-schema)
- [Invoice & Document Generation](#-invoice--document-generation)
- [Operational Analytics](#-operational-analytics)
- [Guest Booking Support](#-guest-booking-support)
- [Service Rating System](#-service-rating-system)
- [SEO & Local Search Strategy](#-seo--local-search-strategy)
- [Deployment](#-deployment)
- [Cost Architecture](#-cost-architecture--infrastructure-cost-breakdown)
- [Live Demo Guide](#-live-demo-guide)
- [Mobile Experience](#-mobile-experience)
- [Contact](#-contact)
- [Screenshots & UI Preview](#%EF%B8%8F-screenshots--ui-preview)
- [Security Architecture](#-security-architecture)
- [Cross-Browser Auth (Safari Fix)](#-cross-browser-auth--safari-fix)
- [CORS & Session Resilience](#-cors--session-resilience)
- [Performance Optimizations](#-performance-optimizations)
- [Supported Brands](#%EF%B8%8F-supported-brands)
- [Bilingual AI Support](#-bilingual-ai-support)
- [API Response Examples](#-api-response-examples)
- [Notification System](#-notification-system)
- [Frontend Context & State](#-frontend-context--state-management)
- [Pincode Dispatch Algorithm](#-pincode-dispatch-algorithm)
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
- [Complete Database Schema](#%EF%B8%8F-complete-database-schema)
- [AI Prompt Engineering](#-ai-prompt-engineering)
- [Service Area Coverage](#%EF%B8%8F-service-area-coverage-1)
- [Service Lifecycle](#-service-lifecycle--step-by-step)
- [Data Privacy & Compliance](#-data-privacy--compliance)
- [Package Scripts Reference](#-package-scripts-reference)
- [Changelog](#-changelog)
- [Business Impact](#-business-impact)
- [Interview Talking Points](#-interview-talking-points)
- [API Error Codes Reference](#-api-error-codes-reference)
- [Email Templates](#-email-templates)
- [Webhook & Payment Security](#-webhook--payment-security)
- [Error Handling Architecture](#-error-handling-architecture)
- [Local Development Tips](#-local-development-tips)
- [Developer Reflections & Key Learnings](#-developer-reflections--key-learnings)
- [Future Monetization & Scaling Strategy](#-future-monetization--scaling-strategy)
- [Accessibility Commitment](#♿-accessibility-commitment)
- [Real-World Business Impact](#-real-world-business-impact)
- [Project Stats](#-project-stats)

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

## 🆚 Why RefriSmart-AI?

How RefriSmart-AI compares to traditional approaches and generic booking platforms:

| Feature | Traditional Business | Generic Booking Apps | **RefriSmart-AI** |
|---|:---:|:---:|:---:|
| AI-powered fault diagnosis before booking | ❌ | ❌ | ✅ |
| Photo/video upload for remote triage | ❌ | ❌ | ✅ |
| Bilingual responses (EN + Hinglish) | ❌ | ❌ | ✅ |
| Real-time admin operations dashboard | ❌ | ⚠️ Limited | ✅ |
| Pincode-based technician auto-dispatch | ❌ | ❌ | ✅ |
| Appliance sell & refurbishment marketplace | ❌ | ❌ | ✅ |
| Offline-safe rule-based AI fallback | ❌ | ❌ | ✅ |
| Gemini multi-key rotation (zero API downtime) | ❌ | ❌ | ✅ |
| Guest booking (no account required) | ✅ Phone | ⚠️ Partial | ✅ |
| OTP-verified job completion | ❌ | ❌ | ✅ |
| Auto-generated PDF invoices with QR code | ❌ | ⚠️ Some | ✅ |
| Technician portal with job notifications | ❌ | ⚠️ Some | ✅ |
| Full audit trail (ServiceEvent) | ❌ | ❌ | ✅ |
| Local SEO with JSON-LD structured data | ❌ | ❌ | ✅ |
| Safari/cross-browser auth support | ❌ | ⚠️ Partial | ✅ |
| Integrated payment gateway (Razorpay) | ❌ | ✅ | ✅ |

> 💡 **The key differentiator**: No other local repair platform pre-diagnoses faults using multimodal AI before the technician visits — this directly reduces wasted site visits and improves first-fix rates.

---

## ✨ Key Features

### 🧠 AI-Powered Diagnostics (Core Innovation)
Upload images or videos of a faulty appliance. The platform sends the media to **Google Gemini Vision**, which returns a structured diagnostic report — identifying the likely fault, severity, recommended repair steps, and estimated cost bracket. All diagnoses are stored with full history per user.

### 🔑 Gemini Multi-Key Rotation
The platform maintains a **pool of multiple Gemini API keys** and rotates through them intelligently. If one key hits its rate limit or returns an error, the system automatically switches to the next available key — achieving near-zero API downtime even under heavy diagnostic loads.

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
JWT-based stateless authentication with **email OTP verification** (Nodemailer). Passwords hashed with bcryptjs. Cookie-based token delivery with protected API routes via custom middleware. **Token-based fallback** for Safari and cross-origin environments where third-party cookies are blocked.

### 📦 Product Catalog & Sell Flow
Users can browse refrigeration parts and products, place orders, or submit an old appliance for pickup with valuation — creating a circular economy within the platform.

### 📱 Fully Responsive UI
Built mobile-first with **Tailwind CSS v4**, ensuring a polished experience across phones, tablets, and desktops.

### 🗺️ Local SEO Optimization
Structured data (JSON-LD), Open Graph meta tags, auto-generated XML sitemap, and robots.txt — engineered to rank for local Google searches in Bhagalpur, Bihar.

### 📄 Invoice & Document Generation
Auto-generated **PDF invoices** for both service bookings and product orders. Service invoices include cost breakdown, technician info, and a unique **QR code** for booking verification. All documents are stored in the `DocumentLog` model and retrievable at any time.

### 🌟 Guest Booking
First-time customers can book a service **without creating an account**. Guest bookings flow through the same admin dashboard and technician dispatch system as registered-user bookings, removing friction from the first customer interaction.

### ⭐ Service Rating System
After job completion, customers can submit a **1–5 star rating** with an optional review. Ratings are visible in the admin analytics dashboard and per-technician performance metrics.

### 📊 Operational Analytics
Admin-only analytics endpoint delivers revenue breakdowns, technician performance metrics, booking conversion funnels, and pincode-level service area heatmap data.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│              Next.js 16 App Router — Vercel CDN                 │
│         (Cookie auth + Token-based fallback for Safari)         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS REST API
┌────────────────────────────▼────────────────────────────────────┐
│                    BACKEND API SERVER                            │
│             Express.js v5 — Vercel Serverless Functions          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Auth Layer  │  │  AI Layer    │  │   Business Logic      │  │
│  │  JWT + OTP   │  │  Gemini SDK  │  │  Services/Orders/     │  │
│  │  bcryptjs    │  │  Key Rotator │  │  Products/Admin       │  │
│  │  Token Auth  │  │  Cloudinary  │  │                       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Razorpay    │  │  Nodemailer  │  │  Session Keepalive   │  │
│  │  Payments    │  │  SMTP Email  │  │  & CORS Manager      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
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
- **Token-based auth fallback** — `Authorization: Bearer` header for Safari/cross-origin environments
- **Gemini key pool** — multiple API keys rotated to eliminate rate-limit downtime

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
| **React Hot Toast** | ^2.6.0 | Legacy component toast compatibility layer |
| **React Player** | ^3.4 | Video playback for AI diagnosis media review |
| **React QR Code** | ^2.0.18 | QR code generation for quick links |

### Backend

| Technology | Version | Role |
|---|---|---|
| **Node.js** | v20+ | Runtime environment |
| **Express.js** | v5.2.1 | HTTP server & routing framework |
| **TypeScript** | ^5.9 | Type safety for controllers, services, and middleware |
| **Prisma ORM** | v7.4 | Database schema, migrations, and type-safe queries |
| **@prisma/adapter-pg** | v7.4 | Direct PostgreSQL adapter for serverless connection pooling |
| **PostgreSQL** | ^8.20 | Relational database (via `pg` driver) |
| **@google/genai** | ^1.44 | Google Gemini Vision AI SDK (multi-key pool support) |
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
    │   ├── index.ts                    # Server entry — middleware, routes, CORS, keepalive
    │   ├── controllers/
    │   │   ├── authController.ts       # Register, login, OTP, JWT cookie + token management
    │   │   ├── aiController.ts         # Gemini API integration — multi-key rotation, media upload
    │   │   ├── adminController.ts      # Full CRUD for all admin operations
    │   │   └── productController.ts    # Product listing, ordering, sell requests
    │   ├── routes/
    │   │   ├── authRoutes.ts
    │   │   ├── aiRoutes.ts
    │   │   ├── adminRoutes.ts
    │   │   └── productRoutes.ts
    │   ├── middlewares/                # JWT auth guard, role check, token auth, error handler
    │   ├── services/                   # Business logic decoupled from controllers
    │   ├── config/                     # Cloudinary, Razorpay, Prisma client, Gemini key pool
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
- [Google AI Studio](https://aistudio.google.com/) account — for Gemini API key(s)
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

# Google Gemini AI — add multiple keys for rotation (comma-separated)
GEMINI_API_KEY="your_primary_gemini_key"
GEMINI_API_KEY_2="your_secondary_gemini_key"   # optional — enables key rotation
GEMINI_API_KEY_3="your_tertiary_gemini_key"    # optional — adds more headroom

# Razorpay (payments)
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Email / OTP (Nodemailer + Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_gmail_app_password"

# CORS
ALLOWED_ORIGINS="https://refrismart-ai.vercel.app"
NODE_ENV="production"
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

All routes are prefixed with `/api`. Protected routes require a valid JWT cookie (`userAuth`) or admin role (`adminAuth`). Safari and cross-origin clients may pass the token as a `Bearer` token in the `Authorization` header instead.

### 🔐 Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Register new user — triggers OTP email verification |
| `POST` | `/auth/login` | ❌ | Email + password login — sets JWT cookie + returns token |
| `POST` | `/auth/logout` | ❌ | Clears auth cookie |
| `GET` | `/auth/me` | ✅ | Get currently logged-in user's profile |
| `POST` | `/auth/send-verify-otp` | ✅ | Send email OTP to verify user's email address |
| `POST` | `/auth/verify-otp` | ✅ | Submit OTP to complete email verification |
| `POST` | `/auth/send-whatsapp-otp` | ✅ | Send OTP via WhatsApp for phone verification |
| `POST` | `/auth/verify-phone-otp` | ✅ | Submit OTP to verify user's phone number |
| `POST` | `/auth/send-reset-otp` | ❌ | Send password reset OTP to registered email |
| `POST` | `/auth/reset-password` | ❌ | Reset password using OTP received by email |
| `POST` | `/auth/request-login-otp` | ❌ | Passwordless login — request OTP via phone |
| `POST` | `/auth/verify-login` | ❌ | Passwordless login — verify phone OTP, get JWT |
| `POST` | `/auth/request-email-login-otp` | ❌ | Passwordless login — request OTP via email |
| `POST` | `/auth/verify-email-login` | ❌ | Passwordless login — verify email OTP, get JWT |

### 🤖 AI Diagnostics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/ai/diagnose` | ✅ | Upload image/video → Gemini Vision analysis → stored `DiagnosisLog` |
| `GET` | `/ai/history` | ✅ | Fetch current user's full diagnosis history |

### 🛠️ Service Bookings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/booking/slots` | ❌ | Get available booking time slots |
| `POST` | `/booking/create` | ✅ | Create a new service booking (guest or logged-in) |
| `POST` | `/service/book` | ❌ | Legacy guest booking endpoint |
| `GET` | `/service/my-bookings/:userId` | ✅ | Get bookings for a specific user (by path param) |
| `GET` | `/service/my-bookings` | ✅ | Get bookings for logged-in user (by query) |
| `GET` | `/service/guest-booking` | ❌ | Look up a guest booking by email + reference |
| `GET` | `/booking/timeline/:bookingId` | ✅ | Full audit trail of status events for a booking |
| `GET` | `/booking/:id/reminders` | 🔒 Admin | Booking reminders (pre-visit notifications) |
| `PATCH` | `/booking/:id/status` | 🔒 Admin | Update booking status (PENDING→ASSIGNED→COMPLETED etc.) |
| `PATCH` | `/booking/:id/reschedule` | 🔒 Admin | Reschedule a booking to a new time slot |
| `PATCH` | `/booking/:id/cancel` | 🔒 Admin | Cancel a booking |
| `POST` | `/bookings/:bookingId/cancel` | ✅ | Customer-initiated booking cancellation |
| `POST` | `/booking/:id/send-otp` | 🔒 Admin | Send job-completion OTP to customer |
| `POST` | `/booking/:id/verify-otp` | 🔒 Admin | Verify job-completion OTP (marks job done) |
| `POST` | `/booking/:id/razorpay` | ✅ | Create Razorpay order for visiting fee payment |
| `POST` | `/booking/:id/razorpay/verify` | ✅ | Verify Razorpay payment and confirm booking |
| `POST` | `/bookings/:bookingId/confirm-payment` | ✅ | Confirm manual (cash/UPI) payment for a booking |
| `POST` | `/service/:id/rating` | ❌ | Submit star rating + review after service completion |

### 📦 Products & Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/products` | ❌ | List all products (new + refurbished) |
| `POST` | `/orders` | ✅ | Place a new product order |
| `GET` | `/orders/my` | ✅ | Get logged-in user's order history |
| `GET` | `/orders/my/invoice/:orderId` | ✅ | Download customer-facing invoice PDF for an order |
| `POST` | `/orders/:orderId/razorpay` | ✅ | Create Razorpay order for product payment |
| `POST` | `/orders/:orderId/razorpay/verify` | ✅ | Verify Razorpay payment for product order |

### 🔧 Admin — Products & Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/orders` | 🔒 Admin | View all product orders with status filters |
| `PATCH` | `/admin/orders/:id` | 🔒 Admin | Update order status (PLACED→DISPATCHED→DELIVERED) |
| `PATCH` | `/admin/orders/:id/reassign-customer` | 🔒 Admin | Reassign an order to a different customer account |
| `PATCH` | `/admin/orders/:id/confirm-payment` | 🔒 Admin | Confirm manual payment for a product order |
| `POST` | `/admin/orders/:id/generate-invoice` | 🔒 Admin | Generate and store admin invoice PDF for an order |
| `GET` | `/docs/order-invoice/:orderId` | 🔒 Admin | Download admin-side order invoice PDF |
| `POST` | `/admin/upload-image` | 🔒 Admin | Upload a product image to Cloudinary |
| `POST` | `/admin/suggest-price` | 🔒 Admin | AI-powered price suggestion for a product |
| `POST` | `/admin/add-product` | 🔒 Admin | Add a new product to the catalog |
| `POST` | `/admin/seed-demo-products` | 🔒 Admin | Seed demo product data |
| `DELETE` | `/admin/delete-product/:id` | 🔒 Admin | Remove a product from the catalog |

### 🤝 Sell Requests

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/sell/upload-image` | ✅ | Upload image for appliance sell request |
| `POST` | `/sell/request` | ✅ | Submit a new appliance sell/pickup request |
| `GET` | `/sell/requests` | ✅ | List sell requests (admin sees all, user sees own) |
| `POST` | `/sell/requests/:id/offer` | 🔒 Admin | Send a purchase offer to a sell request |
| `POST` | `/sell/offers/:id/respond` | ✅ | Accept or reject an admin offer |
| `POST` | `/sell/requests/:id/move-to-refurbished` | 🔒 Admin | Mark accepted appliance as refurbished product listing |

### 🖼️ Gallery

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/admin/gallery` | 🔒 Admin | Upload a new gallery image/video (up to 100 MB) |
| `GET` | `/gallery` | ❌ | Fetch all public gallery items |
| `DELETE` | `/admin/gallery/:id` | 🔒 Admin | Delete a gallery item |

### 🔧 Technician Portal

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/technician/jobs` | 🔒 Admin | List all jobs assigned to technicians |
| `PATCH` | `/technician/jobs/:bookingId/status` | 🔒 Admin | Update technician job status |
| `GET` | `/technician/notifications` | ✅ | Get in-app notifications for a technician |
| `PUT` | `/technician/notifications/:id/read` | ✅ | Mark a notification as read |

### 📊 Admin Analytics & Ops

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/stats` | 🔒 Admin | Full dashboard statistics (bookings, revenue, users) |
| `GET` | `/admin/stats-basic` | 🔒 Admin | Lightweight stats for quick panel overview |
| `GET` | `/admin/service-overview` | 🔒 Admin | Aggregate service request breakdown by status |
| `GET` | `/admin/all-diagnoses` | 🔒 Admin | All AI diagnoses across all users |
| `GET` | `/ops/analytics` | 🔒 Admin | Operational analytics — revenue, technician performance |
| `PUT` | `/admin/assign-technician/:id` | 🔒 Admin | Assign a technician to a service booking |
| `PATCH` | `/admin/service/:id` | 🔒 Admin | Update service request details |
| `GET` | `/history/:userId` | ✅ | Get service history for a specific user |

### 📄 Documents & Invoices

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/docs/:docType` | 🔒 Admin | Generate a document (invoice, QR code) by type |
| `GET` | `/docs/invoice/:bookingId` | ✅ | Download/view service invoice PDF for a booking |

---

## 📋 API Response Examples

All API endpoints return JSON with a consistent `{ success, message, data }` envelope. Below are representative payloads for the most commonly used routes.

### Registration Success (`POST /api/auth/register`)

```json
{
  "success": true,
  "message": "Account created. OTP sent to your email — please verify.",
  "user": {
    "id": "a3f2c1d4-7b8e-4c2a-9f1d-3e6b8a2c5d0e",
    "name": "Rajan Kumar",
    "email": "rajan@example.com",
    "role": "CUSTOMER",
    "isAccountVerified": false
  }
}
```

### AI Diagnosis Result (`POST /api/ai/diagnose`)

```json
{
  "success": true,
  "diagnosis": {
    "id": "d9e1b3f2-4a7c-4e3b-8f2a-1d6e9c3b7a0f",
    "appliance": "Refrigerator",
    "issue": "Not cooling, making a humming noise",
    "faultIdentified": "Condenser coil is dirty causing overheating; compressor working overtime",
    "severity": "moderate",
    "safetyWarnings": [
      "Unplug the appliance before cleaning the coils",
      "Do not use sharp objects near the refrigerant lines"
    ],
    "repairSteps": [
      "Clean condenser coils with a coil brush",
      "Check and clean condenser fan motor",
      "Test compressor amperage draw"
    ],
    "estimatedCostRange": { "min": 800, "max": 2500, "currency": "INR" },
    "fallbackUsed": false,
    "mediaUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1/diagnoses/fridge_photo.jpg",
    "createdAt": "2026-06-12T18:15:00.000Z"
  }
}
```

### Service Booking Created (`POST /api/booking/create`)

```json
{
  "success": true,
  "booking": {
    "id": "b7c9d2e1-5f3a-4b8c-9e1d-2a7f6c4b0e3d",
    "appliance": "AC",
    "issue": "Not cooling even at 16°C setting",
    "status": "PENDING",
    "scheduledAt": "2026-06-15T10:00:00.000Z",
    "address": "123 MG Road, Tatarpur, Bhagalpur, Bihar — 812001",
    "contactName": "Rajan Kumar",
    "contactPhone": "9876543210",
    "finalCost": null
  },
  "razorpayOrder": {
    "id": "order_Pq7mNxAbCd1234",
    "amount": 34900,
    "currency": "INR"
  }
}
```

### Admin Dashboard Stats (`GET /api/admin/stats`)

```json
{
  "success": true,
  "stats": {
    "totalBookings": 248,
    "pendingBookings": 12,
    "completedBookings": 201,
    "totalRevenue": 86548,
    "totalUsers": 184,
    "totalOrders": 67,
    "totalDiagnoses": 412,
    "totalSellRequests": 34,
    "topAppliances": [
      { "appliance": "Refrigerator", "count": 102 },
      { "appliance": "AC", "count": 87 },
      { "appliance": "Washing Machine", "count": 59 }
    ]
  }
}
```

### Error Response (generic)

```json
{
  "success": false,
  "message": "Booking not found",
  "code": "BOOKING_NOT_FOUND"
}
```

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
(with key rotation — picks next available key from pool)
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

## 🔑 Gemini Multi-Key Rotation

A production system serving real users cannot afford Gemini API downtime. RefriSmart-AI implements an **active key rotation pool** to maximize uptime:

### How It Works

```
Request for AI diagnosis arrives
         │
         ▼
   Key Pool Manager selects current key (round-robin)
         │
         ▼
   Gemini API call made with selected key
         │
         ├── ✅ Success → Return result
         │
         └── ❌ 429 Rate Limited or Error
                  │
                  ▼
            Rotate to next key in pool
                  │
                  ▼
            Retry with new key → ✅ Return result
                  │
                  └── ❌ All keys exhausted → Multi-model fallback
```

### Configuration

Add multiple keys to `backend/.env`:

```env
GEMINI_API_KEY="AIza...key1"
GEMINI_API_KEY_2="AIza...key2"
GEMINI_API_KEY_3="AIza...key3"
```

The key pool manager reads all defined keys at startup and rotates through them on each request failure. A minimum of one key is required; additional keys are optional but strongly recommended for production loads.

### Benefits

| Scenario | Without Key Rotation | With Key Rotation |
|---|---|---|
| Single key hits rate limit | ❌ API down for 60s | ✅ Seamlessly continues on next key |
| High diagnostic volume (burst) | ❌ 429 errors for users | ✅ Load spread across all keys |
| Key quota resets (daily) | ❌ Manual monitoring needed | ✅ Automatic; no intervention required |

> 💡 Each Google AI Studio account provides a free-tier key with 1,500 requests/day. Multiple Gmail accounts → multiple keys → effectively unlimited free-tier capacity at scale.

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

## 💸 Cost Architecture — Infrastructure Cost Breakdown

RefriSmart-AI is engineered to run a **full production SaaS at near-zero infrastructure cost** by strategically combining generous free tiers:

| Service | Plan Used | Free Tier Limit | Monthly Cost |
|---|---|---|---|
| **Vercel** (Frontend + Backend) | Hobby (Free) | 100 GB bandwidth, 100K serverless invocations/day | **$0** |
| **Neon** (PostgreSQL) | Free Tier | 0.5 GB storage, 191.9 compute hours/month | **$0** |
| **Cloudinary** (Media CDN) | Free Tier | 25 GB storage, 25 GB bandwidth/month | **$0** |
| **Google Gemini API** | Free Tier | 1,500 requests/day per key (`gemini-flash-lite`) | **$0** |
| **Razorpay** | Pay-per-transaction | No monthly fee | **2% per txn** |
| **GitHub** | Free | Unlimited public repos | **$0** |
| **Nodemailer** (Gmail SMTP) | Gmail App Password | 500 emails/day | **$0** |

> 💡 **Total fixed monthly cost: $0.** The only cost is Razorpay's 2% transaction fee on each ₹349 visiting charge — which is passed to the business, not the platform budget. This makes the platform **self-sustaining from day one** with zero upfront infra investment.

**Scaling strategy:** When traffic grows beyond free tiers, the architecture scales naturally:
- Neon → paid plan for more compute hours (~$19/month)
- Cloudinary → pay-as-you-go for additional bandwidth
- Vercel → Pro plan for team features and higher limits (~$20/month)

---

## 🎮 Live Demo Guide

Explore the live application at **[refrismart-ai.vercel.app](https://refrismart-ai.vercel.app)**. Here's how to try each major feature:

### 👤 As a Customer

| Action | Steps |
|---|---|
| **Try AI Diagnosis** | Navigate to `/ai-diagnosis` → upload any appliance photo or describe a fault → view the structured diagnostic report |
| **Book a Service** | Go to `/service` → fill in appliance type + issue description → proceed to ₹349 payment via Razorpay test mode |
| **Browse Products** | Visit `/products` → view the catalog of refrigeration parts and refurbished appliances |
| **Sell Old Appliance** | Go to `/sell` → upload a photo and describe your appliance → submit for admin valuation |
| **Guest Booking** | Use the service booking form without creating an account — just provide your email and phone |
| **View Gallery** | Visit `/gallery` to see the technician's real work portfolio |

### 👷 As a Technician

| Action | Steps |
|---|---|
| **View Assigned Jobs** | Login with a technician account → visit `/technician` → see all assigned service bookings |
| **Check Notifications** | Real-time in-app notifications appear when a new job is assigned |

### 🔑 Razorpay Test Mode

Use the following test card details to simulate payments without real money:

```
Card Number : 4111 1111 1111 1111
Expiry      : Any future date (e.g., 12/29)
CVV         : Any 3 digits (e.g., 123)
Name        : Any name
```

> ⚠️ The live demo uses **Razorpay test mode** — no actual charges are made during demo testing.

---

## 📱 Mobile Experience

RefriSmart-AI is built **mobile-first** and delivers a fully polished experience on all screen sizes.

### Responsive Breakpoints

| Breakpoint | Target Devices | Layout Behavior |
|---|---|---|
| `< 640px` (sm) | Phones (iPhone SE → 14 Pro Max) | Single-column layouts, stacked cards, full-width CTAs |
| `640–768px` (md) | Large phones, small tablets | 2-column service cards, condensed navbar |
| `768–1024px` (lg) | Tablets (iPad, Galaxy Tab) | 3-column product grid, side-by-side sections |
| `> 1024px` (xl+) | Desktops, laptops | Full 4-column grid, floating sidebars, expanded admin dashboard |

### Mobile-Specific Features

- **Floating "Call Technician" button** — always visible on mobile with a tap-to-call link
- **Touch-optimized booking form** — large tap targets, native date/time pickers
- **Swipeable media upload** — drag-and-drop on desktop, tap-to-upload on mobile
- **React Player responsive video** — adaptive aspect ratio for diagnostic video review
- **Sticky mobile navbar** — collapses to a hamburger menu on small screens
- **WhatsApp quick-contact button** — one-tap WhatsApp link visible on all mobile pages
- **Razorpay mobile checkout** — Razorpay's SDK renders a native-feeling payment sheet on mobile

### Lighthouse Scores (Mobile)

| Category | Score |
|---|---|
| 🟢 Performance | 90+ |
| 🟢 Accessibility | 95+ |
| 🟢 Best Practices | 95+ |
| 🟢 SEO | 100 |

> 📊 Scores measured on the production Vercel deployment. Performance benefits from Next.js App Router, Cloudinary CDN, Vercel edge caching, and preconnect hints.

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
| **Authentication** | JWT + HTTP-Only Cookies + Bearer Token | Tokens stored in `httpOnly`, `secure`, `sameSite` cookies — immune to XSS token theft; Bearer token fallback for Safari |
| **Password Storage** | bcryptjs (salted hashes) | Passwords never stored in plaintext; salted with per-user unique salts |
| **Email Verification** | Time-limited OTP | 6-digit OTPs expire after a configured window; prevents unverified account abuse |
| **CORS Policy** | Strict origin allowlist | Production mode restricts API access to explicitly whitelisted frontend domains only |
| **Role-Based Access** | Middleware-enforced | Admin routes protected by `roleGuard` middleware — checked on every request |
| **Input Validation** | Controller-level checks | All user inputs validated/sanitized before processing or database insertion |
| **File Uploads** | Multer + Cloudinary | Files processed in memory with size/type limits; stored on CDN, not on the API server |
| **Error Handling** | Centralized error middleware | Stack traces never exposed to clients in production; generic error messages returned |
| **Graceful Shutdown** | Process handlers | `uncaughtException` and `unhandledRejection` handlers prevent silent crashes |
| **Payment Verification** | HMAC-SHA256 signature | Razorpay payment signature verified server-side before any booking is confirmed |

---

## 🌐 Cross-Browser Auth — Safari Fix

Modern browsers like **Safari on iOS/macOS** block third-party cookies in cross-origin contexts, causing JWT cookies to silently drop on every API call — resulting in users being logged out instantly on Safari even after a successful login.

### The Problem

```
Safari (iOS/macOS) blocks third-party cookies by default
         │
         ▼
JWT stored in httpOnly cookie is NOT sent to the backend
         │
         ▼
GET /api/auth/me returns 401 → AuthContext sets user = null
         │
         ▼
User appears logged out immediately after login ❌
```

### The Solution — Token-Based Auth Fallback

RefriSmart-AI implements a **dual-mode authentication** system:

```
Login success (POST /api/auth/login)
         │
         ├── Sets httpOnly JWT cookie (standard browsers)
         │
         └── ALSO returns { token: "jwt_string" } in response body
                  │
                  ▼
Frontend stores token in localStorage (cross-origin safe)
                  │
                  ▼
Every API request checks:
  1. Does the browser send the cookie? → Use cookie auth
  2. No cookie? → Send "Authorization: Bearer <token>" header
```

### Backend Middleware Update

```typescript
// middlewares/authMiddleware.ts
export const authenticateUser = async (req, res, next) => {
  // Primary: cookie-based auth (standard browsers)
  let token = req.cookies?.token;

  // Fallback: Bearer token from Authorization header (Safari / cross-origin)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  req.user = decoded;
  next();
};
```

### Frontend Token Management

```typescript
// On login success:
const { token, user } = await res.json();
if (token) localStorage.setItem('auth_token', token);

// On every API fetch:
const storedToken = localStorage.getItem('auth_token');
const headers: Record<string, string> = { 'Content-Type': 'application/json' };
if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;

const res = await fetch(`${API_URL}/endpoint`, {
  credentials: 'include', // still sends cookie if available
  headers,
});

// On logout:
localStorage.removeItem('auth_token');
```

> 💡 **Why not just use localStorage everywhere?** `localStorage` is accessible by JavaScript on the page — making tokens vulnerable to XSS. The cookie remains the primary auth mechanism for standard browsers. The token in `localStorage` is only a fallback for environments where cookies are blocked.

---

## 🔄 CORS & Session Resilience

### The CORS Challenge on Vercel

When frontend (`refrismart-ai.vercel.app`) and backend (`refrismart-backend.vercel.app`) are deployed to **different subdomains**, cookies with `sameSite: 'strict'` are blocked as cross-site cookies. This was fixed by:

```typescript
// backend/src/index.ts — CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
  credentials: true,           // Required for cookies to be sent cross-origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// Cookie settings — cross-subdomain compatible
res.cookie('token', jwtToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none',   // Changed from 'strict' — allows cross-subdomain delivery
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

### Session Keepalive

To prevent **silent auto-logouts** caused by Vercel Serverless Functions going cold (which can reset in-memory state), the frontend implements a **session keepalive ping**:

```typescript
// Every 5 minutes, ping /api/auth/me to keep the session warm
// and detect stale tokens early (before user hits a protected action)
useEffect(() => {
  const keepalive = setInterval(async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
      headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
    });
    if (!res.ok) {
      // Token expired — clear state and redirect to login
      setUser(null);
      localStorage.removeItem('auth_token');
    }
  }, 5 * 60 * 1000);

  return () => clearInterval(keepalive);
}, []);
```

### Network Resilience

API calls include automatic retry logic for transient network failures:

```typescript
async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, 1000)); // 1s back-off
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}
```

---

## 🔔 Notification System

RefriSmart-AI includes an **in-app notification system** for technicians, stored in PostgreSQL via the `Notification` model. Notifications are created server-side whenever a job-relevant event occurs.

### Notification Triggers

| Event | Recipient | Message Content |
|---|---|---|
| Admin assigns a technician to a booking | Technician (by email) | `"New job assigned: {appliance} repair at {address}"` |
| Booking status changes | Technician | `"Your job #{id} status updated to {status}"` |
| Sell offer accepted by customer | Admin dashboard | Visible directly in the admin sell-request panel |
| Job-completion OTP sent | Customer (via email) | OTP email; notification for technician on portal |

### Notification Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/technician/notifications` | ✅ Technician | Fetch all unread notifications for the logged-in technician |
| `PUT` | `/api/technician/notifications/:id/read` | ✅ Technician | Mark a specific notification as read |

### Notification Model (Prisma)

```prisma
model Notification {
  id        String   @id @default(uuid())
  userEmail String           // Technician's email — used as lookup key
  message   String           // Human-readable notification text
  bookingId String           // Linked booking for context/navigation
  createdAt DateTime @default(now())
  read      Boolean  @default(false)
}
```

> 💡 **Design note**: Notifications are keyed by `userEmail` (not `userId`) to support future expansion where notifications could target unregistered technician contacts. The `bookingId` field lets the frontend deep-link directly to the relevant job.

> 📌 **Roadmap**: FCM (Firebase Cloud Messaging) push notifications are planned — so technicians receive alerts even when the browser is closed or the app is not open.

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
| **Session Keepalive** | Proactive token validation prevents stale-session 401 errors mid-session |
| **Gemini Key Pool** | Load spread across multiple API keys — no single-key rate-limit bottleneck |

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
- [x] Gemini multi-key rotation pool
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
- [x] Safari / cross-browser auth fix
- [x] Session keepalive & CORS resilience
- [x] Network retry with back-off

</td>
<td width="50%">

### 🚧 Planned
- [ ] Push notifications (FCM) for service status updates
- [ ] Technician live location tracking (Google Maps API)
- [ ] WhatsApp Business API integration (booking reminders)
- [ ] Recurring maintenance subscription plans
- [ ] Multi-language UI toggle (Hindi + English)
- [ ] Inventory management for spare parts stock
- [ ] PWA support for offline access & home screen install
- [ ] Customer-facing booking cancellation from the UI
- [ ] Admin bulk-export (CSV/Excel) for bookings and revenue
- [ ] GDPR data export & deletion endpoints

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

### Good First Issues

| Area | Task | Difficulty |
|---|---|---|
| Frontend | Add loading skeleton for product grid | 🟢 Easy |
| Backend | Add pagination to `/admin/orders` endpoint | 🟡 Medium |
| Backend | Add rate limiting middleware (express-rate-limit) | 🟡 Medium |
| Frontend | Implement customer-facing booking cancellation UI | 🟠 Medium |
| Backend | Add CSV export endpoint for admin bookings | 🟠 Medium |
| Full-stack | WhatsApp Business API notification integration | 🔴 Hard |

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
- Implemented **Gemini multi-key rotation** to eliminate rate-limit downtime in production
- Fixed **Safari cross-browser auth** with dual-mode JWT (cookie + Bearer token fallback)
- Built CORS/session resilience with keepalive pings and network retry back-off
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
| `GEMINI_API_KEY` | ✅ | `AIzaSy...` | Primary Google Gemini API key from [AI Studio](https://aistudio.google.com/) |
| `GEMINI_API_KEY_2` | ⚠️ Optional | `AIzaSy...` | Second Gemini key for rotation pool |
| `GEMINI_API_KEY_3` | ⚠️ Optional | `AIzaSy...` | Third Gemini key for rotation pool |
| `RAZORPAY_KEY_ID` | ✅ | `rzp_live_...` | Razorpay Key ID (use `rzp_test_...` for dev) |
| `RAZORPAY_KEY_SECRET` | ✅ | `your_key_secret` | Razorpay Key Secret (keep private) |
| `SMTP_HOST` | ✅ | `smtp.gmail.com` | SMTP server hostname for OTP emails |
| `SMTP_PORT` | ✅ | `587` | SMTP port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | ✅ | `your@gmail.com` | Gmail address used to send OTP emails |
| `SMTP_PASS` | ✅ | `xxxx xxxx xxxx xxxx` | Gmail App Password (not your account password) |
| `ALLOWED_ORIGINS` | ⚠️ Optional | `https://refrismart-ai.vercel.app` | Comma-separated list of allowed frontend origins in production CORS |
| `HOST` | ⚠️ Optional | `0.0.0.0` | Server bind address (defaults to `0.0.0.0`) |
| `NODE_ENV` | ⚠️ Optional | `production` | Set to `production` in deployment; enables strict CORS and secure cookies |
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
| Auto-logout on Safari | Third-party cookies blocked | Ensure frontend stores token in `localStorage` and sends `Authorization: Bearer` header |
| CORS cookie rejected | `sameSite` misconfiguration | Set `sameSite: 'none'` with `secure: true` in cookie options for cross-domain deployment |

### AI Diagnostics

| Issue | Likely Cause | Fix |
|---|---|---|
| `Gemini API error 429` | Rate limit exceeded on current key | The key rotation system will automatically switch to the next key; add more keys to `GEMINI_API_KEY_2/3` |
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

#### Example: Test Bearer token auth (Safari fallback)
```bash
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer <your_jwt_token>"
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
- [ ] Test on Safari (iOS/macOS) → verify login persists across page navigations
- [ ] Test with all Gemini keys disabled → verify rule-based fallback returns a diagnosis

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
| **Key pool rotation** | `aiController.ts` | Round-robin key selection eliminates single-key rate-limit failures |
| **Dual-mode auth** | `authMiddleware.ts` | Cookie + Bearer token — works across all browsers and CORS environments |

### Frontend Patterns

| Pattern | Where Used | Benefit |
|---|---|---|
| **App Router layouts** | `app/layout.tsx` | Shared layout, metadata, JSON-LD injected once for the whole app |
| **Server Components (default)** | All page components | Reduced client-side JS bundle; better SEO and TTFB |
| **Client Components (`"use client"`)** | Interactive forms, payment flow | Progressive enhancement — only interactive parts shipped to browser |
| **Cookie-based auth (httpOnly)** | Auth middleware | XSS-immune token storage; auto-included in every API request |
| **Bearer token fallback** | All authenticated fetches | Ensures auth works on Safari and cross-origin deployments |
| **Session keepalive** | `AuthContext.tsx` | Proactive token validation prevents silent mid-session logouts |
| **Component co-location** | `admin/_*.tsx` files | Dashboard sub-components live next to their parent page |

### Data Flow

```
[User Action] → [Next.js Route Handler / Client fetch]
     │
     ▼
[Express Controller] → [Service Layer] → [Prisma ORM] → [PostgreSQL]
     │
     ▼ (AI routes only)
[Multer] → [Cloudinary] → [Key Pool] → [Gemini Vision API] → [Structured Result]
                                              │
                                              └── ❌ → [Rule-Based Fallback]
     │
     ▼
[Response JSON] → [Next.js Component re-render]
```

---

## 🌐 Frontend Context & State Management

The frontend uses **React Context API** for lightweight global state — a deliberate choice to avoid Redux/Zustand overhead for a focused, single-business application.

### Context Providers (`frontend/src/context/`)

| Context | File | Purpose | Key Values Exposed |
|---|---|---|---|
| `AuthContext` | `AuthContext.tsx` | Global logged-in user state, persisted across page navigations | `user`, `isLoading`, `setUser()`, `logout()` |

### Auth Initialization Flow

```
App boots → Root layout mounts <AuthProvider>
         │
         ▼
  AuthContext calls GET /api/auth/me on mount
  (JWT cookie + Bearer token sent automatically)
         │
         ├── 200 OK  → sets user state → authenticated UI renders
         │
         └── 401     → user = null   → redirects to /login
```

### Data Fetching Pattern

RefriSmart-AI uses **native `fetch`** inside `useEffect` hooks — no SWR or React Query — keeping the bundle lean for a content-focused frontend.

```typescript
// Standard authenticated fetch pattern used throughout the app
useEffect(() => {
  const fetchData = async () => {
    const storedToken = localStorage.getItem('auth_token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`, {
      credentials: 'include', // sends the JWT cookie automatically
      headers: storedToken
        ? { Authorization: `Bearer ${storedToken}` }
        : {},
    });
    const data = await res.json();
    if (data.success) setItems(data.items);
    else toast.error(data.message);
  };
  fetchData();
}, []);
```

### Toast Notification System

User feedback is handled by **Sonner** (mounted once in `layout.tsx` via `<Toaster />`):

```typescript
import { toast } from 'sonner';

toast.success('Booking confirmed! Check your email.');
toast.error('Payment failed — please try again.');
toast.loading('Uploading your photo to AI engine...');
toast.promise(uploadPromise, {
  loading: 'Diagnosing your appliance...',
  success: 'AI diagnosis ready!',
  error: 'Diagnosis failed. Falling back to rule engine.',
});
```

### `"use client"` Boundary Strategy

RefriSmart-AI follows Next.js App Router best practices for the Server/Client Component split:

| Component Type | Directive | Examples |
|---|---|---|
| **Page shells** (layout, SEO, static content) | Server Component (no directive) | `layout.tsx`, homepage sections |
| **Interactive UI** (forms, modals, payment flow) | `"use client"` | Booking form, AI upload, payment button |
| **Admin dashboard tabs** | `"use client"` | `_services.tsx`, `_orders.tsx`, `_dashboard.tsx` |
| **Auth-gated pages** | `"use client"` | `/admin/page.tsx`, `/technician/page.tsx` |

> 💡 **Key benefit**: Only interactive components ship JavaScript to the browser. Static sections (hero, service cards, contact info) are rendered as pure HTML — improving TTFB and Lighthouse scores.

---

## 📍 Pincode Dispatch Algorithm

When an admin assigns a technician to a service booking, the system uses a **pincode-based matching** strategy:

```
Admin opens booking in dashboard
         │
         ▼
System fetches all active Technicians (active: true)
         │
         ▼
Technicians are sorted/filtered by pincode proximity
  to the customer's service address pincode
         │
         ▼
Admin selects the best-match technician from the list
(PUT /api/admin/assign-technician/:bookingId)
         │
         ▼
ServiceAssignment record created:
  { bookingId, technicianId, pincode, routeNote, assignedAt }
         │
         ▼
Booking status → ASSIGNED
In-app Notification created for technician
```

### Technician Model

```prisma
model Technician {
  id          String   @id @default(uuid())
  name        String
  phone       String   @unique
  email       String?  @unique
  role        Role     @default(TECHNICIAN)
  pincode     String               // Primary dispatch zone
  active      Boolean  @default(true)   // Can be deactivated without deletion
  createdAt   DateTime @default(now())
  assignments ServiceAssignment[]
}
```

### Pincode Coverage Example

| Technician | Home Pincode | Zones Covered |
|---|---|---|
| Mohd. Arif | 812001 | Bhagalpur City, Tatarpur, Adampur |
| Ravi Kumar | 813210 | Sabour, Jagdishpur, Naupur |
| Anuj Singh | 813203 | Naugachia, Gopalpura |

> 💡 **Future enhancement**: Technician live-location tracking via Google Maps API is on the roadmap — this will enable real-time routing rather than pincode-level matching.

---

## ❓ FAQ

**Q: Is this a real production application or just a demo?**
> A: It is a real, production-deployed application actively used by **Golden Refrigeration**, a physical appliance repair business in Bhagalpur, Bihar, India. The live URL is [refrismart-ai.vercel.app](https://refrismart-ai.vercel.app).

**Q: Which AI model does the diagnosis use?**
> A: It uses **Google Gemini Vision** (multimodal) via the `@google/genai` SDK. Three Gemini models are tried in sequence (`gemini-flash-lite-latest` → `gemini-flash-latest` → `gemini-pro-latest`), and if all fail, a custom rule-based engine with 15+ diagnostic rules handles the request as a fallback.

**Q: What is Gemini multi-key rotation and why is it needed?**
> A: Each Google AI Studio API key has a rate limit (1,500 requests/day on free tier). The key rotation pool distributes requests across multiple keys — so even during high diagnostic volume, no single key's quota is exhausted. This ensures near-zero AI downtime in production.

**Q: Why did auth stop working on Safari?**
> A: Safari blocks third-party cookies by default in cross-origin contexts. The fix is a dual-mode auth system: the backend sets a cookie AND returns the JWT token in the response body. The frontend stores the token in `localStorage` and sends it as an `Authorization: Bearer` header on subsequent requests.

**Q: Can I use this for a different repair business?**
> A: Yes! The codebase is designed to be adaptable. You would need to update the business details in `frontend/src/app/layout.tsx` (JSON-LD, meta tags), update the service area content on the homepage, and reconfigure your own environment variables.

**Q: Is Razorpay required? Can I skip payment integration?**
> A: Razorpay is used only for the ₹349 visiting fee and product orders. If you want to disable payments, you can remove the payment step from the service booking flow — the rest of the platform (AI diagnosis, admin, auth) works independently.

**Q: What happens if the Gemini API is down?**
> A: The multi-tier fallback strategy ensures the platform **always returns a diagnostic result**. The key rotation pool tries all available keys first, then the multi-model fallback tries 3 Gemini model variants, and finally a rule-based engine (keyword matching on the user's description + appliance type) works 100% offline without any external API calls.

**Q: How do I create an admin account?**
> A: Register a user normally, then use **Prisma Studio** (`npx prisma studio`) to change that user's `role` field from `USER` to `ADMIN` directly in the database. Admin role assignment from the UI is intentionally not exposed for security reasons.

**Q: What is the visiting charge and how is it handled?**
> A: When a customer books a service, a ₹349 visiting fee is collected upfront via Razorpay. The order is created on the backend using Razorpay's API, the customer completes payment in the Razorpay modal, and the backend verifies the payment signature before confirming the booking in the database.

**Q: Does the platform support multiple languages in the UI?**
> A: The **AI diagnostic responses** support automatic English/Hinglish detection and response. The main **UI is in English**. A full Hindi/English UI toggle is on the roadmap.

**Q: How are media files handled? Are they stored on the server?**
> A: No. Uploaded images and videos are streamed directly to **Cloudinary** via Multer's memory storage. Files are never written to disk on the API server. After Cloudinary returns a CDN URL, the URL (not the file) is sent to Gemini and stored in the database.

---

## 🗃️ Complete Database Schema

The full Prisma schema (`backend/prisma/schema.prisma`) covers every entity in the system with proper relations and enums:

### Models Overview

| Model | Primary Key | Description |
|---|---|---|
| `User` | UUID | Customers, admins — stores email/phone, OTP fields, role, verification status |
| `Product` | UUID | Refurbished/new appliance listings with warranty, stock, and seller linkage |
| `ServiceBooking` | UUID | End-to-end repair booking — guest + registered users, appliance, issue, status, location, cost |
| `ServiceAssignment` | bookingId | Links a booking to a specific technician with pincode and route notes |
| `ServiceEvent` | UUID | Audit trail of every status change on a booking (PENDING → ASSIGNED → COMPLETED) |
| `ServiceOtp` | UUID | OTP verification for service completion — prevents false job-done claims |
| `DiagnosisLog` | UUID | AI diagnostic results — appliance, issue, diagnosis text, estimated cost, media URL |
| `Technician` | UUID | Technician records — pincode-based dispatch, active status, assignments |
| `SellRequest` | UUID | Customer appliance sell/pickup request with condition, expected price, pincode |
| `SellOffer` | UUID | Admin counter-offer on a sell request with pickup slot and offer price |
| `ProductOrder` | UUID | Product purchase orders — delivery address, payment status, order status lifecycle |
| `Gallery` | UUID | Admin-managed work gallery images/videos displayed on the public site |
| `DocumentLog` | UUID | Audit log for invoice PDFs, QR codes, and other generated documents per booking |
| `Notification` | UUID | In-app notifications linked to user email and booking events |

### Status Enums

```prisma
enum Status {            // ServiceBooking lifecycle
  PENDING → ASSIGNED → OUT_FOR_REPAIR → REPAIRING
  → FIXED → ESTIMATE_APPROVED → PAYMENT_PENDING → COMPLETED
  → CANCELLED
}

enum OrderStatus {       // ProductOrder lifecycle
  PLACED → DISPATCHED → OUT_FOR_DELIVERY → DELIVERED → CANCELLED
}

enum SellRequestStatus { // SellRequest lifecycle
  REQUESTED → OFFER_SENT → ACCEPTED / REJECTED → REFURBISHED_LISTED
}

enum Role { ADMIN | CUSTOMER | TECHNICIAN }
enum PaymentStatus { PENDING | PAID }
enum ProductType { NEW | REFURBISHED }
enum WarrantyType { BRAND | SHOP }
```

> 💡 **Key design:** `ServiceEvent` provides a full immutable audit trail — every status change is appended as a new row, never overwriting history. This allows replaying the full lifecycle of any booking.

---

## 🧠 AI Prompt Engineering

The diagnostic engine's quality hinges on a carefully crafted system prompt sent to Google Gemini Vision. Here's how it works:

### Prompt Structure

```
[SYSTEM ROLE]
You are an expert appliance repair technician with 20+ years of experience
servicing refrigerators, ACs, and washing machines in India.

[CONTEXT INJECTION]
- Appliance type: {appliance}         ← from user's form selection
- User description: {issue}           ← free-text problem description
- Language detected: {lang}           ← auto-detected (English / Hinglish)

[MEDIA ATTACHMENT]
- Uploaded image/video via Gemini File API (not base64 — uses CDN URL)

[OUTPUT FORMAT INSTRUCTIONS]
Return a structured JSON with:
  • faultIdentified: string
  • severity: "minor" | "moderate" | "critical"
  • safetyWarnings: string[]
  • repairSteps: string[]
  • estimatedCostRange: { min: number, max: number, currency: "INR" }
  • fallbackUsed: false
```

### Language Auto-Detection Logic

```typescript
function detectLanguage(text: string): "en" | "hi" {
  // Check for Unicode Devanagari range (U+0900–U+097F)
  if (/[\u0900-\u097F]/.test(text)) return "hi";

  // Check for common Hindi/Hinglish keywords in Roman script
  const hindiKeywords = ["nahi", "chal", "band", "thanda", "garam", "noise", "awaaz", "kaam"];
  if (hindiKeywords.some(k => text.toLowerCase().includes(k))) return "hi";

  return "en";
}
```

When Hindi/Hinglish is detected, the prompt is augmented with:
> *"Respond in friendly Hinglish (Roman script Hindi mixed with English) — easy to understand for a non-technical Indian customer."*

### Rule-Based Fallback (15+ Diagnostic Rules)

If all 3 Gemini models fail, the rule engine matches keywords:

| Keyword Triggers | Fault Identified | Severity |
|---|---|---|
| `not cooling`, `warm`, `thanda nahi` | Refrigerant leak / compressor fault | Moderate |
| `noise`, `sound`, `awaaz` | Fan blade or compressor vibration | Minor–Moderate |
| `water leak`, `pani`, `dripping` | Clogged defrost drain or door seal | Minor |
| `not starting`, `dead`, `band` | Power board or compressor failure | Critical |
| `ice`, `frost`, `defrost` | Defrost timer or heater failure | Moderate |
| `smell`, `burning`, `jal raha` | Electrical fault — immediate safety risk | Critical |

---

## 📄 Invoice & Document Generation

RefriSmart-AI includes an automated document generation engine for professional invoices and QR codes:

### Service Invoice
Generated automatically after a booking reaches `COMPLETED` status. The invoice PDF includes:
- Customer details (name, address, phone)
- Appliance type, fault identified, repair steps performed
- Cost breakdown (visiting fee + labour + parts)
- Technician name and service date
- Unique booking reference and QR code for verification

### Product Order Invoice
Generated for product purchases. Available to both customers (via `/orders/my/invoice/:orderId`) and admins (via `/admin/orders/:id/generate-invoice`).

### Document Types (`/docs/:docType`)

| Document Type | Description |
|---|---|
| `invoice` | Service booking invoice PDF |
| `qr` | QR code image linking to booking status page |

All documents are persisted in the `DocumentLog` database model and linked to the relevant booking for future retrieval.

---

## 📊 Operational Analytics

The `/ops/analytics` endpoint (admin-only) provides advanced operational metrics:

| Metric | Description |
|---|---|
| **Revenue by period** | Daily / weekly / monthly revenue breakdown |
| **Technician performance** | Jobs completed, average turnaround time per technician |
| **Booking funnel** | Conversion from created → paid → completed |
| **Top appliance categories** | Most commonly repaired appliance types |
| **Service area heatmap data** | Booking counts by pincode for coverage analysis |

Access via `GET /api/ops/analytics` with admin credentials.

---

## 🌟 Guest Booking Support

RefriSmart-AI supports **fully unauthenticated service bookings**, removing the account-creation barrier for first-time customers:

```
Guest visits → fills service form (no login required)
         │
         ▼
Booking created with guest email + phone stored directly
         │
         ▼
Razorpay visiting fee collected (₹349)
         │
         ▼
Booking confirmation sent to guest email
         │
         ▼
Guest can track booking via GET /service/guest-booking
         (lookup by email + booking reference)
```

**Key design:** Guest bookings use the same `ServiceBooking` model as authenticated bookings — the `userId` field is nullable. This ensures the full admin workflow (assign technician, OTP verification, invoice generation) works identically for guest and registered users.

---

## ⭐ Service Rating System

After a service is marked `COMPLETED`, customers can submit a rating:

- **Endpoint:** `POST /api/service/:id/rating`
- **Auth:** No authentication required (uses booking reference validation)
- **Fields:** Star rating (1–5), optional text review
- **Storage:** Rating stored on the `ServiceBooking` record
- **Display:** Admin dashboard shows average rating per technician in the analytics view

---

## 🗺️ Service Area Coverage

RefriSmart-AI / Golden Refrigeration serves the following areas in and around **Bhagalpur, Bihar**:

<div align="center">

| Zone | Areas Covered |
|:---|:---|
| **Bhagalpur City** | Adampur, Tatarpur, Khalifabagh, Mirjanhat, Barari, Champanagar |
| **Sabour Block** | Sabour, Jagdishpur, Piro, Naupur |
| **Naugachia** | Naugachia Town, Gopalpura |
| **Kahalgaon** | Kahalgaon Town, Pirpainti |
| **Sultanganj** | Sultanganj Town, Nathnagar |
| **Banka** | Banka Town, Amarpur |

</div>

> 📍 **Pincode-Based Dispatch**: Technicians are assigned based on their registered pincode — the system matches the customer's service address pincode to the nearest available technician automatically.

---

## 🔄 Service Lifecycle — Step by Step

A complete walkthrough of what happens from booking to job completion:

```
1. CUSTOMER books a service (selects appliance + describes issue)
        │
        ▼
2. ₹349 VISITING FEE collected via Razorpay (order created → verified)
        │
        ▼
3. ServiceBooking created in DB with status: PENDING
        │
        ▼
4. ADMIN reviews booking in dashboard → assigns a Technician
   (ServiceAssignment record created; status: ASSIGNED)
        │
        ▼
5. Technician travels to customer location
   (status updated: OUT_FOR_REPAIR → REPAIRING)
        │
        ▼
6. Technician diagnoses fault → submits cost estimate
   (status: FIXED → ESTIMATE_APPROVED by customer)
        │
        ▼
7. Customer pays remaining amount (cash/UPI QR)
   (status: PAYMENT_PENDING → COMPLETED)
        │
        ▼
8. Invoice PDF + ServiceOTP verified → Job closed
   ServiceEvent rows capture every transition as an audit trail
```

---

## 🔐 Data Privacy & Compliance

| Practice | Implementation |
|---|---|
| **No plaintext passwords** | All passwords salted + hashed with bcryptjs before storage |
| **No files on server disk** | Uploads go directly to Cloudinary via memory buffers — never written to disk |
| **HTTP-only cookies** | JWTs stored in `httpOnly` cookies — inaccessible to JavaScript, immune to XSS |
| **OTP expiry** | Email OTPs have a configurable TTL (Time-To-Live) — expired OTPs are rejected |
| **Env secrets** | All API keys, DB credentials, and payment secrets are in `.env` files excluded from git |
| **CORS allowlist** | In production, only the whitelisted frontend domain can call the API |
| **No analytics tracking** | No third-party tracking scripts (Google Analytics, Meta Pixel) that collect user behavior |
| **Guest support** | Users can book services and get AI diagnoses as guests (no forced account creation) |

> ⚠️ **GDPR Note:** This platform currently serves Indian users and complies with Indian data protection best practices. If deployed globally, additional GDPR measures (data export, deletion endpoints) should be implemented.

---

## 📦 Package Scripts Reference

### Backend (`backend/package.json`)

| Script | Command | Description |
|---|---|---|
| `dev` | `ts-node src/index.ts` | Start development server with hot reload (auto-kills port 5001 first) |
| `build` | `tsc` | Compile TypeScript → `dist/` for production |
| `start` | `node dist/index.js` | Run compiled production server |
| `prisma:generate` | `npx prisma generate` | Regenerate Prisma client after schema changes |
| `prisma:push` | `npx prisma db push` | Sync schema to DB (dev, no migration history) |
| `prisma:migrate` | `npx prisma migrate dev` | Create and run a tracked migration |
| `prisma:studio` | `npx prisma studio` | Open browser-based DB GUI |

### Frontend (`frontend/package.json`)

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Start Next.js development server (port 3000, bound to 127.0.0.1) |
| `build` | `next build` | Create optimized production build |
| `start` | `next start` | Serve production build locally |
| `lint` | `next lint` | Run ESLint on the entire frontend codebase |

---

## 📝 Changelog

All notable changes to RefriSmart-AI are documented here.

### [v2.2.0] — June 2026
**Cross-Browser Auth, Key Rotation & Network Resilience**
- ✅ **Safari auth fix** — implemented token-based auth fallback (`Authorization: Bearer`) for Safari and cross-origin environments where third-party cookies are blocked
- ✅ **Gemini multi-key rotation** — implemented a key pool system; multiple `GEMINI_API_KEY_*` env vars are read at startup and rotated on rate-limit or error
- ✅ **CORS `sameSite: none`** fix — changed cookie policy from `strict` to `none` for cross-subdomain Vercel deployments
- ✅ **Session keepalive** — frontend pings `/api/auth/me` every 5 minutes to proactively detect stale tokens and re-authenticate before users hit a protected action
- ✅ **Network retry with back-off** — all API calls retry up to 2 times on transient network failures with 1s back-off
- ✅ **Auto-logout prevention** — multiple layers of resilience prevent users from being logged out due to transient server errors or cold-start delays
- 🔧 Fixed: `sameSite` cookie policy incompatibility with Vercel cross-subdomain deployments
- 🔧 Fixed: Gemini error handling now catches all error types (quota, network, model-specific) for more reliable model rotation

### [v2.1.0] — June 2026
**Dependency Upgrades & Stability Release**
- ✅ Upgraded **@google/genai** to v1.44 — improved Gemini API stability and File API support
- ✅ Upgraded **Prisma** to v7.4 — faster Rust query engine and new `@prisma/adapter-pg` for serverless
- ✅ Upgraded **Express** to v5.2.1 — native async error propagation (no more `try/catch` wrappers needed)
- ✅ Upgraded **Next.js** to 16.1.6 — latest App Router stability and caching fixes
- ✅ Upgraded **bcryptjs** to v3.0.3 — improved salt-round performance
- ✅ Added `react-hot-toast` alongside Sonner for legacy component compatibility
- ✅ Added `@prisma/adapter-pg` for direct PostgreSQL adapter (serverless connection pooling)
- ✅ `SellOffer` pickup-slot scheduling — admin can now specify a pickup date/time with the offer
- ✅ `DocumentLog` model — every generated invoice/QR is now tracked with full metadata
- ✅ `fallbackUsed` flag added to all `DiagnosisLog` records — frontend can display a fallback indicator
- ✅ Backend `npm run dev` auto-kills port 5001 before starting — eliminates "EADDRINUSE" errors
- 🔧 Fixed: Prisma `adapter-pg` integration for Neon serverless connection pooling
- 🔧 Fixed: CORS cookie `sameSite` policy for cross-subdomain Vercel deployments
- 🔧 Fixed: Multer v2 breaking change — `fileFilter` callback signature updated

### [v2.0.0] — 2026
**Major production release**
- ✅ Migrated to **Next.js 16** App Router with full SSR/SSG support
- ✅ **Multi-model AI fallback** system (3 Gemini models + rule engine)
- ✅ **Technician portal** with job view and OTP-based job completion verification
- ✅ **ServiceEvent audit trail** — immutable history of every status change per booking
- ✅ **ServiceOTP system** — technician cannot mark a job complete without customer OTP
- ✅ **SellOffer system** — admin can counter-offer on sell requests with pickup slot
- ✅ **Gallery management** — admin-managed work gallery displayed on the public site
- ✅ **Pincode-based technician dispatch** — auto-matches nearest technician to booking
- ✅ **Guest booking** — customers can book without creating an account
- ✅ **Bilingual AI responses** — auto-detects English vs Hinglish
- ✅ **Refurbished product marketplace** — sell requests auto-list as products after acceptance
- ✅ Upgraded to **Express v5**, **Prisma v7**, **@google/genai v1.44**

### [v1.0.0] — 2025
**Initial production launch**
- ✅ Core AI diagnostic engine (Gemini Vision)
- ✅ Razorpay payment integration (₹349 visiting fee)
- ✅ JWT + email OTP authentication
- ✅ Admin dashboard (bookings, orders, diagnoses)
- ✅ Product catalog and ordering
- ✅ Appliance sell/pickup request flow
- ✅ Local SEO (JSON-LD, sitemap, geo-targeting)
- ✅ Vercel serverless deployment

---

## 📈 Business Impact

RefriSmart-AI was built to solve **real operational pain points** for a physical appliance repair business. Here's the measurable difference the platform delivers:

| Problem Before | Solution Delivered | Business Outcome |
|---|---|---|
| Customers described faults over phone — hard to triage | AI Vision diagnosis before booking | Technicians arrive prepared; fewer wasted visits |
| Zero visibility into daily bookings and revenue | Live admin dashboard with stats | Owner can monitor operations from any device |
| Manual cash collection at doorstep | Razorpay ₹349 visiting fee upfront | Eliminates no-shows; guarantees technician visit commitment |
| No online presence beyond JustDial listing | Full-stack web app with JSON-LD SEO | Discoverable on Google local searches for Bhagalpur |
| Paper-based service records | PostgreSQL with full ServiceEvent audit trail | Every job has a permanent, queryable history |
| Customers couldn't track repair status | Real-time status updates via admin dashboard | Reduced inbound "where's my technician?" calls |
| Old appliances had no resale channel | Sell & Refurbish marketplace | New revenue stream — refurbished appliances re-listed for sale |
| Trust gap with first-time customers | Star ratings + review system visible in admin | Owner can monitor service quality and technician performance |
| Auth failing silently on Safari/iOS | Token-based auth fallback | 100% login reliability across all browsers and devices |
| Gemini API rate limits causing diagnostic failures | Multi-key rotation pool | Near-zero AI diagnostic downtime even under heavy load |

> 💡 **Key insight**: Collecting the ₹349 visiting fee online (rather than cash at door) acts as a **commitment signal** — it filters out low-intent bookings and ensures the technician's time is respected. This single change meaningfully reduces no-show rates.

---

## 🎤 Interview Talking Points

If you're showcasing this project in a technical interview, here are the strongest talking points organized by topic:

### System Design
- **Serverless architecture**: Chose Vercel Serverless Functions over a traditional always-on server to achieve zero idle cost — only pay when the function runs
- **Stateless auth**: JWT in HTTP-only cookies means no session store (Redis/Memcached) is needed — the server can scale horizontally without any sticky-session concern
- **Dual-mode auth for cross-browser compatibility**: Implemented cookie + Bearer token fallback to solve Safari's third-party cookie blocking — a real production problem that required research and a non-obvious fix
- **Monorepo trade-offs**: Co-locating frontend and backend simplifies CI/CD (single repo, single Vercel project config) at the cost of slightly blurred boundaries — accepted for a solo-developer project of this scale
- **Prisma as abstraction layer**: Using Prisma ORM means the underlying DB could be swapped (e.g., from Neon to PlanetScale) with minimal code changes — only the `DATABASE_URL` and connection config change

### AI Integration
- **Why Gemini over OpenAI?** Google Gemini Flash has a generous free tier (1,500 req/day), native multimodal support (images + video in a single API call), and lower latency for short diagnostic prompts
- **Fallback resilience**: The 4-tier fallback (3 Gemini models → rule engine) ensures **100% uptime for diagnostics** even during API outages — this is a deliberate design decision, not an afterthought
- **Key rotation pool**: Multiple API keys are maintained in a pool and rotated on failure — achieving effectively unlimited free-tier capacity with zero code changes as load grows
- **Prompt engineering**: Structured JSON output format in the prompt ensures the frontend receives a consistent schema regardless of which Gemini model responds — no brittle regex parsing
- **File API vs base64**: Used Gemini's File API with Cloudinary CDN URLs instead of base64-encoding media — avoids the 2x payload overhead and stays within Gemini's inline data limits

### Database Design
- **UUID primary keys**: Chose UUIDs over auto-increment integers to prevent ID enumeration attacks and to support potential future multi-database sharding
- **ServiceEvent as audit trail**: Instead of overwriting the `status` field, every transition appends a new `ServiceEvent` row — this gives a **full replay-able history** of every booking's lifecycle without any triggers or additional complexity
- **Nullable `userId` on ServiceBooking**: Allows the same model to handle both guest and authenticated bookings — no separate guest table, no code duplication

### Security
- **Why HTTP-only cookies over localStorage?** LocalStorage is accessible by any JS on the page — an XSS attack can steal tokens. HTTP-only cookies are invisible to JS and automatically sent by the browser
- **Safari third-party cookie problem**: Identified, researched, and solved a real cross-browser authentication failure using a dual-mode auth system — demonstrates production debugging skills
- **bcryptjs salting**: Each user gets a unique salt — even if two users have the same password, their hashes are different, preventing rainbow table attacks
- **Role guard middleware**: Implemented as a separate Express middleware function — adding a new admin route requires only one decorator, not duplicated auth logic

### Performance
- **Next.js App Router**: Server Components render on the server and send HTML — no JS bundle for static content, better SEO, faster TTFB
- **Cloudinary CDN**: Zero media bandwidth from the API server — all images/videos served from Cloudinary's global edge, removing a major bottleneck
- **Connection pooling on serverless**: Neon's pgBouncer pooler handles connection reuse across cold-started serverless function invocations — without this, each function cold-start would create a new DB connection, exhausting the pool in seconds
- **Session keepalive**: Proactive token validation every 5 minutes prevents silent mid-session auth failures caused by serverless cold starts resetting in-memory state

---

## 🔴 API Error Codes Reference

All API errors follow a consistent JSON structure:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "code": "MACHINE_READABLE_CODE"
}
```

### HTTP Status Codes Used

| HTTP Status | Meaning | When It Occurs |
|---|---|---|
| `200 OK` | Success | Standard successful response |
| `201 Created` | Resource created | New user registered, booking created, order placed |
| `400 Bad Request` | Validation error | Missing required fields, invalid format |
| `401 Unauthorized` | Not authenticated | JWT missing, expired, or invalid |
| `403 Forbidden` | Not authorized | Valid JWT but insufficient role (e.g., non-admin hitting admin route) |
| `404 Not Found` | Resource not found | Booking ID, user ID, or product ID does not exist |
| `409 Conflict` | Duplicate resource | Email already registered, OTP already used |
| `422 Unprocessable Entity` | Business logic failure | Payment verification failed, OTP incorrect |
| `429 Too Many Requests` | Rate limited | Gemini API quota exceeded (handled by key rotation + model fallback internally) |
| `500 Internal Server Error` | Unexpected server error | Unhandled exception caught by central error middleware |

### Common Error Codes

| Code | Description |
|---|---|
| `AUTH_TOKEN_MISSING` | No JWT cookie or Bearer token present in request |
| `AUTH_TOKEN_INVALID` | JWT signature verification failed |
| `AUTH_TOKEN_EXPIRED` | JWT has passed its expiry time |
| `USER_NOT_FOUND` | No user matches the given ID or email |
| `EMAIL_ALREADY_EXISTS` | Registration attempt with a duplicate email |
| `OTP_INVALID` | Submitted OTP does not match stored OTP |
| `OTP_EXPIRED` | OTP TTL has passed — must request a new one |
| `BOOKING_NOT_FOUND` | Booking ID does not exist in the database |
| `PAYMENT_VERIFICATION_FAILED` | Razorpay signature mismatch — possible tampering |
| `AI_ALL_MODELS_FAILED` | All Gemini models and all key rotations failed; rule-based fallback was used |
| `MEDIA_UPLOAD_FAILED` | Cloudinary upload returned an error |
| `INSUFFICIENT_STOCK` | Product order quantity exceeds available stock |
| `ROLE_REQUIRED_ADMIN` | Endpoint requires ADMIN role; current user does not have it |

---

## 📧 Email Templates

RefriSmart-AI sends **transactional emails** for key events using Nodemailer + Gmail SMTP. All emails are sent as **HTML templates** with the Golden Refrigeration branding.

### Email Events & Triggers

| Event | Trigger | Recipient |
|---|---|---|
| **Email OTP Verification** | User registers → calls `/auth/send-verify-otp` | New user |
| **Password Reset OTP** | User calls `/auth/send-reset-otp` | Account owner |
| **Booking Confirmation** | Booking status moves to `PAID` | Customer (guest or registered) |
| **Technician Assignment** | Admin assigns technician → status: `ASSIGNED` | Customer |
| **Job Completion OTP** | Admin triggers completion flow | Customer (OTP to hand to technician) |
| **Sell Request Offer** | Admin sends offer on sell request | Seller |

### Email Template Structure

```html
<!-- OTP Verification Email (simplified) -->
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #1a1a2e; padding: 20px; text-align: center;">
    <h1 style="color: #fff;">🔧 Golden Refrigeration</h1>
  </div>
  <div style="padding: 30px; background: #f9f9f9;">
    <h2>Your OTP Code</h2>
    <p>Use the following code to verify your email address:</p>
    <div style="background: #fff; border: 2px solid #e0e0e0; border-radius: 8px;
                padding: 20px; text-align: center; font-size: 32px;
                font-weight: bold; letter-spacing: 8px; color: #1a1a2e;">
      {{OTP_CODE}}
    </div>
    <p style="color: #666; font-size: 12px;">This code expires in 10 minutes.</p>
  </div>
</div>
```

### Email Configuration Best Practices

- **Use Gmail App Passwords** — not your regular Gmail password. Enable 2-Step Verification → Generate an App Password under *Google Account → Security*
- **SMTP_PORT 587** (STARTTLS) is preferred over 465 (SSL) for Gmail compatibility with Nodemailer
- **Test locally** with [Mailtrap](https://mailtrap.io/) — a fake SMTP server that catches all emails without delivering them, perfect for development
- **Rate limiting**: Gmail SMTP allows ~500 emails/day on a free account — more than sufficient for a local business platform at this scale

---

## 🔐 Webhook & Payment Security

Razorpay payment verification is the most security-critical flow in the platform. Here's how it's implemented:

### Payment Verification Flow

```
1. Backend creates Razorpay order (POST /api/booking/:id/razorpay)
   → Razorpay returns { orderId, amount, currency }
   → orderId stored in ServiceBooking.razorpayOrderId

2. Frontend initialises Razorpay checkout with orderId
   → Customer completes payment in Razorpay modal
   → Razorpay returns { razorpay_order_id, razorpay_payment_id, razorpay_signature }

3. Frontend sends all three values to backend (POST /api/booking/:id/razorpay/verify)

4. Backend recomputes expected signature:
   expectedSig = HMAC-SHA256(
     razorpay_order_id + "|" + razorpay_payment_id,
     RAZORPAY_KEY_SECRET
   )

5. If expectedSig === razorpay_signature → payment is genuine
   Booking status updated to PAID in the database

6. If signature mismatch → 422 PAYMENT_VERIFICATION_FAILED
   No booking update; potential fraud logged
```

### Why This Approach Is Secure

| Threat | Mitigation |
|---|---|
| **Replay attack** (reusing old payment proof) | Each `razorpay_order_id` is unique and single-use — once verified, it cannot be re-submitted |
| **Forged payment** (fake payment_id) | HMAC-SHA256 signature binds the payment to the specific order — can't forge without `RAZORPAY_KEY_SECRET` |
| **Man-in-the-middle** (intercepting and modifying) | HTTPS enforced on both Vercel frontend and backend — all traffic encrypted in transit |
| **Key exposure** | `RAZORPAY_KEY_SECRET` only lives in `backend/.env` (server-side) — never sent to the browser |

> ⚠️ **Important**: The `NEXT_PUBLIC_RAZORPAY_KEY_ID` (prefixed `NEXT_PUBLIC_`) is intentionally exposed to the browser — this is the **public key** used only to initialise the Razorpay checkout UI. The **secret key** never leaves the server.

---

## 🏗️ Error Handling Architecture

RefriSmart-AI uses a **centralized error handling** pattern across the entire Express backend:

### Error Flow

```
Route Handler throws or calls next(error)
         │
         ▼
┌─────────────────────────────────────────┐
│      Central Error Middleware           │
│  (last middleware in src/index.ts)      │
│                                         │
│  1. Log error (with stack in dev)       │
│  2. Determine HTTP status code          │
│  3. Sanitize message for prod           │
│  4. Return { success: false, message }  │
└─────────────────────────────────────────┘
```

### Custom Error Class

```typescript
// src/utils/AppError.ts
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // distinguishes from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

// Usage in controller:
if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
```

### Process-Level Safety

```typescript
// src/index.ts — prevents silent crashes in production
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  process.exit(1); // exit cleanly; Vercel will restart the function
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  // Don't exit — log and continue; Vercel will catch fatal crashes
});
```

### Prisma Error Handling

Prisma throws typed errors that the central middleware maps to appropriate HTTP responses:

| Prisma Error Code | Mapped HTTP Status | Typical Cause |
|---|---|---|
| `P2002` (Unique constraint) | `409 Conflict` | Duplicate email registration |
| `P2025` (Record not found) | `404 Not Found` | Querying a deleted or non-existent record |
| `P2003` (Foreign key constraint) | `400 Bad Request` | Referencing a non-existent related record |
| `P2016` (Query interpretation) | `400 Bad Request` | Malformed query (usually a bug — logged in detail) |

---

## 💡 Local Development Tips

Practical tips for running RefriSmart-AI locally without issues:

### Speed Up Development

```bash
# Use Prisma Studio to inspect the DB visually (avoids raw SQL)
npx prisma studio
# Opens at http://localhost:5555

# Watch mode for backend (auto-reloads on file save)
npm run dev   # Already uses ts-node-dev or nodemon internally

# Run both frontend and backend concurrently (if you add a root package.json script)
npx concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

### Fake SMTP for Local Email Testing

Instead of sending real emails locally, use [Mailtrap](https://mailtrap.io/):

```env
# backend/.env — Mailtrap config for local dev
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=<your_mailtrap_user>
SMTP_PASS=<your_mailtrap_password>
```

All OTP emails are caught by Mailtrap's inbox — no real emails sent during development.

### Seed the Database Quickly

```bash
# Seed demo products (built-in admin endpoint)
curl -X POST http://localhost:5001/api/admin/seed-demo-products \
  -H "Cookie: token=<admin_jwt>"

# Reset and re-push the schema (WARNING: destroys all data)
cd backend && npx prisma migrate reset
```

### Test Safari Auth Locally

To simulate Safari's cross-origin cookie blocking locally:

1. Open Chrome DevTools → Application → Cookies → Delete the `token` cookie
2. Add `Authorization: Bearer <your_token>` manually in Thunder Client
3. Verify that `/api/auth/me` returns your user profile using only the Bearer header

This confirms the token-based fallback is working correctly.

### Disable Razorpay in Local Dev

Add a `SKIP_PAYMENT=true` env flag and wrap payment steps conditionally — useful for testing the full booking flow without needing a real Razorpay account. Alternatively, use Razorpay's test mode keys (prefix: `rzp_test_`) which accept the standard test card without real charges.

### Environment Variable Validation

Add this snippet at the top of `backend/src/index.ts` to catch missing env vars at startup rather than at runtime:

```typescript
const REQUIRED_ENV = [
  'DATABASE_URL', 'JWT_SECRET', 'GEMINI_API_KEY',
  'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
  'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET',
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS',
];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
```

### VS Code Recommended Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "prisma.prisma",            // Prisma schema syntax highlighting
    "dbaeumer.vscode-eslint",   // ESLint integration
    "esbenp.prettier-vscode",   // Code formatting
    "rangav.vscode-thunder-client", // REST API testing inside VS Code
    "bradlc.vscode-tailwindcss",    // Tailwind CSS IntelliSense
    "ms-vscode.vscode-typescript-next" // Latest TypeScript support
  ]
}
```

---

## 🧑‍💻 Developer Reflections & Key Learnings

Building **RefriSmart-AI** end-to-end as a solo developer surfaced real engineering challenges that no tutorial covers. Here's what this project taught me:

### 🔐 Authentication at Scale is Hard
Shipping auth that works across Chrome, Firefox, **Safari iOS**, and cross-origin deployments required far more nuance than a standard JWT tutorial. The `sameSite: 'none'` + `secure: true` cookie combination, paired with a `localStorage` Bearer token fallback, was the only reliable cross-browser solution without a same-domain reverse proxy. This is a production pattern I now use by default.

### 🤖 AI Integration isn't Just "Call the API"
Plugging in Gemini Vision looked simple at first — until rate limits hit on a burst of uploads during beta testing. Building the **multi-key pool rotator** and the **multi-model cascade fallback** transformed a fragile dependency into a resilient system. The rule-based engine as a last resort means users always get *some* useful output, even when the internet is down.

### ⚡ Serverless Has Hidden Gotchas
Vercel Serverless Functions are stateless — every cold start is a fresh process. This broke in-memory caches and caused silent auth regressions until I switched to **stateless JWT auth** and moved all persistent state to PostgreSQL. The **session keepalive ping** was a pragmatic fix for the "appeared logged out" UX bug reported by early users.

### 🗄️ Schema Design Decisions Have Long Tails
Choosing UUIDs over auto-increment IDs, designing the `ServiceEvent` audit trail upfront, and using **Prisma's typed client** prevented an entire class of runtime bugs. Retrofitting an audit trail after launch is painful — model it early.

### 🌏 Local SEO is a Real Engineering Problem
JSON-LD structured data, canonical URLs, geo-coordinates, `sitemap.ts`, and keyword-optimized page copy required as much deliberate engineering effort as the payment integration. For a local service business, SEO is the primary growth lever.

### 📊 Analytics Should be Built-in from Day 1
Adding the `/ops/analytics` endpoint and the admin stats dashboard *before* launch meant the business owner had real operational visibility from the first customer interaction — not an afterthought.

---

## 💰 Future Monetization & Scaling Strategy

RefriSmart-AI was designed from the start to be **extensible beyond Bhagalpur**. Here's the roadmap for turning this into a scalable SaaS:

### Short-Term (0–6 months)
| Initiative | Business Impact |
|---|---|
| **WhatsApp Business API integration** | Automated booking confirmations, status updates, and payment reminders via WhatsApp — the dominant communication channel in Tier-2/3 India |
| **Technician mobile app (React Native)** | Let technicians accept/reject jobs, navigate to customer addresses, and submit OTP completion from a native app |
| **Subscription plans for customers** | Annual AMC (Annual Maintenance Contracts) for refrigerators and ACs — predictable recurring revenue for the business |
| **Referral program** | Customer-to-customer referrals with discount credits — low-cost acquisition in a trust-driven local market |

### Medium-Term (6–18 months)
| Initiative | Business Impact |
|---|---|
| **Multi-city franchise model** | White-label the platform for other appliance repair businesses in Bihar/Jharkhand — SaaS licensing revenue |
| **AI-powered parts recommendation engine** | After diagnosis, auto-suggest compatible spare parts from the product catalog — increases order attach rate |
| **Dynamic pricing engine** | Surge pricing for peak slots (weekends, summer AC season) based on historical booking density data |
| **Video consultation booking** | Pre-visit video call with a technician for complex fault triage — reduces unnecessary site visits further |

### Long-Term Vision
> Transform RefriSmart-AI from a **single-business platform** into a **multi-tenant appliance repair marketplace** — similar to UrbanClap/Urban Company for the Tier-2/3 India appliance segment, but with AI pre-diagnosis as the core differentiation.

---

## ♿ Accessibility Commitment

RefriSmart-AI is engineered to be **usable by everyone**, not just tech-savvy urban users. Key accessibility implementations:

| Principle | Implementation |
|---|---|
| **Semantic HTML5** | Proper use of `<main>`, `<nav>`, `<section>`, `<article>`, `<button>` elements for screen reader compatibility |
| **ARIA labels** | All interactive icons and image-only buttons carry descriptive `aria-label` attributes |
| **Keyboard navigation** | All booking forms, modals, and dropdowns are fully keyboard-navigable (Tab + Enter + Escape) |
| **Colour contrast** | Text-on-background contrast ratios meet WCAG 2.1 AA standard (minimum 4.5:1 for normal text) |
| **Touch target sizing** | All tap targets on mobile are ≥ 44×44px — meets Apple HIG and WCAG success criteria |
| **Error identification** | Form validation errors are communicated both visually (red border) and via `aria-describedby` for screen readers |
| **Reduced motion** | Animations respect `prefers-reduced-motion` media query — users with vestibular disorders can disable motion effects |
| **Image alt text** | All product images, gallery photos, and diagnostic media include descriptive `alt` attributes |

> 💡 Accessibility matters even more in the Indian Tier-2/3 market where users may rely on voice assistants, older devices, or have varying levels of digital literacy.

---

## 📈 Real-World Business Impact

Since deploying RefriSmart-AI for **Golden Refrigeration**, Bhagalpur, measurable operational changes include:

| Metric | Before RefriSmart-AI | After RefriSmart-AI |
|---|---|---|
| **Booking method** | Phone call only | Online (24/7) + Phone |
| **Unnecessary site visits** | ~30% of visits (wrong fault estimate) | Reduced via AI pre-diagnosis |
| **Average time-to-booking** | 5–10 min phone call | < 2 minutes online |
| **Payment collection** | Cash on delivery only | Online (Razorpay) + Cash |
| **Admin operational visibility** | Zero (paper log) | Real-time dashboard |
| **Old appliance acquisition** | Word-of-mouth only | Structured sell-request pipeline |
| **Customer follow-up** | Manual phone call | Automated email OTP + status updates |
| **Review collection** | JustDial only | In-platform star ratings + JustDial |

> 📊 The AI diagnostic feature alone is expected to reduce wasted technician visits by 25–35% as customers better understand their appliance faults before booking — improving first-fix rate and technician efficiency.

---

## 📊 Project Stats

```
📁 Total Files          : ~120+ source files across frontend and backend
📝 Lines of Code        : ~15,000+ (TypeScript, TSX, Prisma schema)
🗄️ Database Models      : 14 Prisma models with full relational schema
🛣️ API Endpoints        : 65+ REST endpoints across 8 route groups
🤖 AI Integration       : Google Gemini Vision (3-tier model cascade + rule engine)
💳 Payment Flows        : 4 distinct Razorpay payment flows (service, product, manual, UPI)
📧 Email Templates      : 6 transactional email templates (OTP, booking confirm, invoice)
🔐 Auth Methods         : 5 login paths (password, OTP, email OTP, phone OTP, guest)
⏱️ Development Time     : Solo developer, built and deployed to production
🌐 Deployment           : Vercel (frontend + backend), Neon PostgreSQL, Cloudinary CDN
```

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
