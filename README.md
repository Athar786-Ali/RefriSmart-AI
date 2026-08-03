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

## What This Project Is

RefriSmart AI is a full-stack SaaS platform I designed and built from scratch for a real appliance repair business in Bhagalpur, India. It handles the entire business lifecycle: customers book doorstep repairs, an AI engine diagnoses appliance faults from photos/videos before the technician arrives, the admin dispatches technicians by pincode, payments are processed through Razorpay, and the business owner tracks everything from a CRM dashboard.

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

> **Note:** Add screenshots of the landing page, AI diagnosis interface, admin dashboard, and service booking flow here. Use the format: `![Description](path/to/screenshot.png)`

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
Razorpay integration with cryptographic HMAC-SHA256 signature verification. Supports both service booking payments and product order payments. Handles Cash, UPI QR, and online payment modes. Auto-generates PDF invoices via Nodemailer.

---

## AI Features

The AI system is designed to **never fail silently**, even with zero API availability. Here's how the fault diagnosis workflow operates:

```
User uploads photo/video + describes issue
                │
                ▼
┌──────────────────────────────┐
│  5-Key Rotation Pool         │  Each key maps to a separate Google Cloud
│  (separate quota per key)    │  project = separate daily quota (1,500 req/day).
│                              │  On 429 RESOURCE_EXHAUSTED, rotateKey() switches
│                              │  to the next project's key and retries.
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  7-Model Fallback Cascade    │  If a model returns 503, the system falls through:
│                              │
│  gemini-3.5-flash            │  1. Primary (latest, fastest)
│  gemini-2.0-flash            │  2. Stable fallback
│  gemini-2.0-flash-lite       │  3. Lightweight fallback
│  gemini-2.5-flash-preview    │  4. Preview channel
│  gemini-1.5-flash            │  5. Legacy stable
│  gemini-1.5-flash-8b         │  6. Lightweight legacy
│  gemini-1.5-pro              │  7. Last resort (highest quality)
└──────────┬───────────────────┘
           │
           ▼ (all keys + models exhausted)
┌──────────────────────────────┐
│  Offline Rule-Based Engine   │  Handwritten domain-expert diagnostic rules
│                              │  for fridges, ACs, washing machines, noise
│                              │  issues, and power failures — with bilingual
│                              │  English/Hinglish responses and local pricing.
└──────────────────────────────┘
```

**Key design decisions:**
- **5 API keys across separate GCP projects** instead of a single key, to multiply free-tier quota from 1,500 to 7,500 requests/day.
- **Exponential backoff** per model with progressive delays (12s &rarr; 24s &rarr; 36s) to avoid hammering overloaded endpoints.
- **Structured JSON prompting** with explicit format requirements so Gemini responses can be reliably parsed without brittle regex.
- **Language detection** — responses are automatically adapted to English or Hinglish based on the user's input language.

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
│       │   ├── service/page.tsx       # Service booking flow + real-time tracker
│       │   ├── ai-diagnosis/page.tsx  # Multimodal AI diagnosis (text/voice/photo/video)
│       │   ├── products/page.tsx      # Product marketplace (new + refurbished)
│       │   ├── sell/page.tsx          # Customer sell/trade-in request flow
│       │   ├── orders/page.tsx        # Order tracking + Razorpay checkout
│       │   ├── gallery/page.tsx       # Photo/video gallery of completed repairs
│       │   ├── admin/                 # Admin CRM (8 tab views, ~3,200 lines)
│       │   ├── technician/page.tsx    # Technician job portal
│       │   ├── login/page.tsx         # Passwordless OTP login (email + phone)
│       │   └── verify-otp/page.tsx    # OTP verification
│       ├── components/                # 11 reusable components
│       ├── context/                   # AuthContext (session management + keepalive)
│       ├── lib/                       # API client, Razorpay loader, status utils
│       └── types/                     # Shared TypeScript interfaces
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
│       ├── middlewares/              # Dual-mode auth (cookie + bearer)
│       ├── services/                 # diagnosisService, mediaStorage, OTP delivery
│       ├── config/                   # Gemini key pool, Prisma, Razorpay, Cloudinary
│       └── utils/                    # Service status FSM, email helpers
│
└── docs/                             # Architecture docs and interview prep materials
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
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require

# Authentication
JWT_SECRET=your_jwt_secret_here
ADMIN_EMAIL=your_admin_email@example.com

# Google Gemini AI (up to 5 keys for quota rotation)
GEMINI_API_KEY=your_primary_key
GEMINI_API_KEY_2=your_second_key         # Optional
GEMINI_API_KEY_3=your_third_key          # Optional

# Cloudinary (media storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Razorpay (payments)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret

# Email (SMTP via Brevo or similar)
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# MSG91 (OTP delivery — optional)
MSG91_AUTH_KEY=your_auth_key
MSG91_TEMPLATE_ID=your_template_id
MSG91_SENDER_ID=GOLDRG
MSG91_WA_FLOW_ID=your_whatsapp_flow_id   # Optional

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

---

## API Overview

The backend exposes 74 REST endpoints across 4 route modules. All authenticated endpoints use JWT verification via the `userAuth` middleware, with an additional `adminAuth` layer for administrative operations.

| Module | Endpoints | Auth | Key Operations |
|:---|:---:|:---|:---|
| **Auth** | 14 | Mixed | Register, Login (email + phone OTP), Logout, Verify OTP, Reset Password |
| **AI** | 2 | Optional | `POST /diagnose` (multimodal image/video/text), `GET /history` |
| **Admin & Services** | 41 | User/Admin | Bookings (CRUD + FSM transitions), Technician dispatch, Gallery, Sell pipeline, Analytics |
| **Products & Orders** | 17 | User/Admin | Product CRUD, Order placement, Razorpay checkout, Invoice generation |

<details>
<summary><strong>Full endpoint reference</strong></summary>

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Purpose |
|:---|:---|:---:|:---|
| `POST` | `/register` | — | Register with name, email, password |
| `POST` | `/login` | — | Email/password login, sets HttpOnly cookie |
| `POST` | `/logout` | — | Clears auth cookie |
| `POST` | `/request-login-otp` | — | Send phone OTP via MSG91 (WhatsApp &rarr; SMS &rarr; dev fallback) |
| `POST` | `/verify-login` | — | Verify phone OTP, return JWT |
| `POST` | `/request-email-login-otp` | — | Send email OTP |
| `POST` | `/verify-email-login` | — | Verify email OTP, return JWT |
| `GET` | `/me` | User | Get current user profile |
| `POST` | `/send-verify-otp` | User | Email verification OTP |
| `POST` | `/verify-otp` | User | Verify account email |
| `POST` | `/send-whatsapp-otp` | User | WhatsApp phone verification |
| `POST` | `/verify-phone-otp` | User | Verify phone number |
| `POST` | `/send-reset-otp` | — | Password reset OTP |
| `POST` | `/reset-password` | — | Reset password with valid OTP |

### AI Diagnosis (`/api/ai`)

| Method | Endpoint | Auth | Purpose |
|:---|:---|:---:|:---|
| `POST` | `/diagnose` | — | Multimodal diagnosis (text + photo/video upload) |
| `GET` | `/history` | User | Fetch user's diagnosis history |

### Service Bookings & Admin Operations (`/api`)

| Method | Endpoint | Auth | Purpose |
|:---|:---|:---:|:---|
| `GET` | `/booking/slots` | — | Available time slots |
| `POST` | `/booking/create` | User | Create repair booking |
| `PATCH` | `/booking/:id/status` | Admin | Update booking FSM state |
| `PATCH` | `/booking/:id/reschedule` | Admin | Reschedule booking |
| `PATCH` | `/booking/:id/cancel` | Admin | Cancel booking |
| `GET` | `/booking/timeline/:bookingId` | User | Status event timeline |
| `POST` | `/booking/:id/send-otp` | Admin | Send completion OTP |
| `POST` | `/booking/:id/verify-otp` | Admin | Verify on-site OTP |
| `POST` | `/booking/:id/razorpay` | User | Create Razorpay order for service |
| `POST` | `/booking/:id/razorpay/verify` | User | Verify Razorpay payment |
| `POST` | `/bookings/:id/confirm-payment` | User | Confirm manual payment (Cash/UPI) |
| `POST` | `/bookings/:id/cancel` | User | Customer cancels booking |
| `GET` | `/service/my-bookings` | User | Customer's bookings |
| `GET` | `/service/guest-booking` | — | Guest booking lookup |
| `PUT` | `/admin/assign-technician/:id` | Admin | Assign technician to booking |
| `POST` | `/service/:id/rating` | — | Submit repair rating |
| `POST` | `/admin/gallery` | Admin | Upload gallery media |
| `GET` | `/gallery` | — | List gallery items |
| `DELETE` | `/admin/gallery/:id` | Admin | Delete gallery item |
| `GET` | `/technician/jobs` | Admin | Technician job list |
| `POST` | `/sell/request` | User | Submit sell request |
| `GET` | `/sell/requests` | User | List sell requests |
| `POST` | `/sell/requests/:id/offer` | Admin | Send buyback offer |
| `POST` | `/sell/offers/:id/respond` | User | Accept/reject offer |
| `POST` | `/sell/requests/:id/move-to-refurbished` | Admin | Convert to refurbished product |
| `GET` | `/admin/stats` | Admin | Dashboard analytics |
| `GET` | `/ops/analytics` | Admin | Operational analytics |

### Products & Orders (`/api`)

| Method | Endpoint | Auth | Purpose |
|:---|:---|:---:|:---|
| `GET` | `/products` | — | List available products |
| `POST` | `/admin/add-product` | Admin | Create product listing |
| `DELETE` | `/admin/delete-product/:id` | Admin | Remove product |
| `POST` | `/admin/upload-image` | Admin | Upload product image to Cloudinary |
| `POST` | `/admin/suggest-price` | Admin | AI/heuristic pricing suggestion |
| `POST` | `/orders` | User | Place product order |
| `GET` | `/orders/my` | User | Customer's orders |
| `POST` | `/orders/:id/razorpay` | User | Create Razorpay order |
| `POST` | `/orders/:id/razorpay/verify` | User | Verify payment signature |
| `GET` | `/admin/orders` | Admin | All orders |
| `PATCH` | `/admin/orders/:id` | Admin | Update order status |
| `POST` | `/admin/orders/:id/generate-invoice` | Admin | Generate PDF invoice |

</details>

---

## Database Schema Overview

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

**14 models** with the following key relationships:

| Model | Key Fields | Role |
|:---|:---|:---|
| `User` | email, phone, password (bcrypt), role (ADMIN/CUSTOMER/TECHNICIAN), OTP fields | Central identity, linked to all user-owned entities |
| `ServiceBooking` | appliance, issue, aiDiagnosis, status (9-state FSM), scheduledAt, finalCost | Repair job lifecycle container |
| `ServiceEvent` | bookingId, status, note, createdAt | Append-only audit log for state transitions |
| `Technician` | name, phone, pincode, active | Field workforce, matched to bookings by area |
| `Product` | title, price, productType (NEW/REFURBISHED), conditionScore, stockQty, serialNumber | Marketplace inventory |
| `ProductOrder` | productId, customerId, status (5-state), paymentStatus, deliveryAddress | E-commerce order tracking |
| `DiagnosisLog` | appliance, issue, diagnosis, estimatedCostRange, mediaUrl | AI diagnosis history with indexed queries |
| `SellRequest` | applianceType, conditionNote, expectedPrice, status (5-state lifecycle) | Customer-to-business trade-in pipeline |
| `Subscription` | — (not implemented in current schema, planned) | Future SaaS tier management |

**7 enums:** `Role` &middot; `Status` (9-state service FSM) &middot; `OrderStatus` (5-state) &middot; `PaymentStatus` &middot; `ProductType` &middot; `WarrantyType` &middot; `SellRequestStatus`

---

## Project Workflow

**Customer Journey:**

```
1. Customer visits site
   │
   ├─► Books a repair service (selects appliance, time slot, address)
   │   └─► Optionally uses AI Diagnosis first (uploads photo/video)
   │       └─► AI report is attached to the booking for technician reference
   │
   ├─► Admin assigns technician by pincode
   │   └─► Technician receives notification
   │       └─► Status moves through 9-state FSM
   │           └─► OTP verifies job completion on-site
   │               └─► Payment collected (Razorpay / Cash / UPI)
   │                   └─► PDF invoice generated and emailed
   │
   ├─► Browses refurbished marketplace
   │   └─► Places order → Pays via Razorpay → Tracks delivery
   │
   └─► Submits sell request for old appliance
       └─► Admin sends offer → Customer accepts/rejects
           └─► Accepted items are auto-listed as refurbished products
```

---

## Design Decisions

### Why PostgreSQL over MongoDB?

The data in this application is inherently relational: users have bookings, bookings have assignments to technicians, assignments have events, products have orders. MongoDB would require denormalization and manual join logic. PostgreSQL with Prisma gives me type-safe queries, referential integrity via foreign keys, and proper migration management — all critical for a production system handling financial transactions.

### Why Express v5 on Vercel Serverless instead of Next.js API Routes?

The backend has 74 endpoints with complex middleware chains (auth verification, role checking, file upload handling, Razorpay webhook signature verification). Next.js API routes would work for simpler APIs, but Express gives me middleware composition, route grouping, and raw body parsing for webhooks — patterns that are awkward to implement in the App Router's route handler format.

### Why Dual-Mode Authentication?

Safari's Intelligent Tracking Prevention (ITP) silently drops HttpOnly cookies when the frontend and backend are on different origins (which they are on Vercel). This caused 100% auth failure on iOS Safari — the majority of mobile users in India. The solution: the backend checks for cookies first, then falls back to Bearer token from the Authorization header. The frontend stores the JWT in localStorage and sends it as a Bearer token on every request while still sending `credentials: "include"` for cookie-based auth.

### Why React Context over Redux/Zustand?

The only global state is the authenticated user session. React Context handles this cleanly without adding a dependency. The 10-minute silent session refresh and localStorage hydration are implemented directly in the context provider.

---

## Challenges Faced

### 1. Serverless Connection Exhaustion

**Problem:** A traffic spike spins up dozens of isolated serverless functions, each opening a direct PostgreSQL connection. This instantly exhausts Neon's connection limit and crashes the database.

**Solution:** Configured Prisma with `@prisma/adapter-pg` connected through Neon's pgBouncer connection pooler. Serverless functions connect to the pooler (which multiplexes connections) instead of directly to the database.

### 2. Safari Cross-Origin Cookie Drop

**Problem:** 100% auth failure on iOS Safari. The `HttpOnly` cookie was silently dropped because the frontend (Vercel) and backend (separate Vercel deployment) live on different origins.

**Solution:** Implemented dual-mode auth — backend middleware checks cookie first, falls back to Bearer header. Frontend `authFetch` wrapper stores JWT in localStorage and injects it on every request.

### 3. AI API Quota Management

**Problem:** A single free-tier Gemini API key gives 1,500 requests/day. In production, a rate limit means the core diagnosis feature silently breaks.

**Solution:** Engineered a 5-key rotation pool across separate GCP projects (multiplying quota to 7,500/day), a 7-model cascade for model-level failures, exponential backoff, and a hardcoded rule-based fallback engine that covers common appliance failures without any API dependency.

### 4. OTP Delivery Reliability in India

**Problem:** SMS delivery in India is unreliable due to DND registrations and network variability.

**Solution:** Priority-chain delivery system: MSG91 WhatsApp (highest reliability, branded sender) &rarr; MSG91 SMS (immediate) &rarr; Dev console fallback. Each channel has a 10-second `AbortController` timeout.

---

## Performance Optimizations

- **Cloudinary URL transforms**: Product images are dynamically transformed to WebP format with quality optimization (`f_webp,q_auto:good,c_limit,w_900`) via URL parameter injection — no server-side processing needed.
- **Connection pooling**: Neon pgBouncer prevents connection exhaustion in serverless environments.
- **Indexed queries**: `DiagnosisLog` has composite indexes on `[customerId, createdAt]` and `[createdAt]` for efficient history lookups.
- **Real-time polling**: Active service trackers and admin dashboards use 5-second polling intervals instead of WebSockets — a pragmatic choice that avoids the complexity of persistent connections in a serverless environment.
- **Safe video unmounting**: Custom `SafeVideo` component catches `AbortError` and `NotAllowedError` during rapid DOM unmounts, eliminating memory leaks and console noise.
- **LocalStorage hydration**: Auth state is cached in localStorage for instant UI rendering before the server-side session verification completes.

---

## Security Features

| Threat | Mitigation |
|:---|:---|
| **Password theft** | Salted and hashed via `bcryptjs` — never stored in plaintext |
| **XSS token theft** | JWT issued via `HttpOnly` cookies (inaccessible to JavaScript) with Bearer fallback for Safari |
| **Payment spoofing** | Razorpay webhook signatures verified using `crypto.createHmac('sha256')` with `crypto.timingSafeEqual` to prevent timing attacks |
| **CSRF / Open CORS** | Production CORS restricted to an explicit origin allowlist (not `origin: true`) |
| **Unauthorized access** | Two-tier middleware: `userAuth` (JWT verification) + `adminAuth` (role check against database) |
| **Resource abuse** | Multer file size limits — 25MB for diagnosis uploads, 100MB for gallery media |
| **Session hijacking** | Silent session refresh every 10 minutes with 3-strike network failure invalidation |
| **Request body tampering** | User identity (`userId`) and product prices are resolved from JWT and database — never trusted from request body |
| **OTP brute force** | OTP validity restricted to 10 minutes with server-side expiry enforcement |

---

## Scalability

The architecture is designed to scale horizontally without infrastructure changes:

- **Stateless backend**: Every Express function is independently deployable as a Vercel Serverless Function. No shared in-memory state between requests.
- **Connection pooling**: pgBouncer multiplexes database connections, allowing dozens of concurrent serverless instances without connection exhaustion.
- **CDN-backed media**: Cloudinary handles image/video serving at the edge. The backend never serves static files in production.
- **AI quota scaling**: The 5-key rotation pool can be extended by adding more GCP projects. The model cascade adds resilience without any code changes.
- **Database indexing**: Critical query paths (diagnosis history, user lookups) are indexed for consistent performance as data grows.

---

## Future Improvements

- [ ] WebSocket integration for real-time service status updates (replacing polling)
- [ ] Push notifications via Firebase Cloud Messaging for technician alerts
- [ ] Multi-tenant support for onboarding additional repair businesses
- [ ] Automated testing suite (unit tests for controllers, integration tests for API endpoints)
- [ ] Docker Compose setup for local development parity
- [ ] Rate limiting middleware for public-facing endpoints
- [ ] Caching layer (Redis) for frequently accessed product listings and dashboard stats
- [ ] SaaS subscription tiers with feature gating via Razorpay Subscriptions API

---

## Testing

> **Current state:** The application has been validated through manual production testing with real customers and real payments. Automated test coverage is a planned improvement.

**Verification approach used during development:**
- Manual API testing via Postman/Thunder Client for all 74 endpoints
- End-to-end payment flow verification with Razorpay test mode and live mode
- Cross-browser testing (Chrome, Safari, Firefox, iOS Safari) for the dual-mode auth system
- AI diagnosis testing across all 7 Gemini models and the offline fallback engine
- OTP delivery testing across WhatsApp, SMS, and email channels

---

## Deployment

The application is deployed on Vercel with the following setup:

| Component | Platform | Configuration |
|:---|:---|:---|
| **Frontend** | Vercel | Next.js 16, auto-deployed on push to `main` |
| **Backend** | Vercel Serverless | Express v5 via `@vercel/node`, configured in `vercel.json` |
| **Database** | Neon | PostgreSQL 16 with pgBouncer connection pooling |
| **Media** | Cloudinary | Image/video CDN with WebP transforms |
| **Domain** | Custom | `www.goldenrefrigeration.in` |

**CI/CD:** Every push to `main` triggers Vercel's automated build &rarr; type-check &rarr; deploy pipeline. Database migrations are version-controlled via Prisma (4 migration sets) and applied with `npx prisma migrate deploy`.

---

## SEO Engineering

This isn't just "add meta tags." I built a programmatic Local SEO system:

- **4 JSON-LD schemas** injected into the DOM: `LocalBusiness`, `WebSite` (with `SearchAction` for sitelinks), `FAQPage` (12 high-intent Q&As), and `Service` (with `OfferCatalog`).
- **60+ geo-targeted keywords** covering brand × service × area combinations.
- **13 `areaServed` places** with PIN codes for hyperlocal targeting.
- **Dynamic Metadata API** — per-route titles, descriptions, OpenGraph, and Twitter Cards.
- **Programmatic `sitemap.xml`** and `robots.ts` with admin/private route exclusions.

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your code follows the existing TypeScript conventions and passes `npm run lint`.

---

## License

This project is licensed under the ISC License.

---

<div align="center">

### Built by [Md Athar Ali](https://github.com/Athar786-Ali)

[GitHub](https://github.com/Athar786-Ali) &middot; [LinkedIn](https://linkedin.com/in/md-athar-ali) &middot; [Email](mailto:atharali7864@gmail.com)

<br />

*This is a production-deployed SaaS platform serving a real business — not a tutorial or bootcamp project.*

</div>
