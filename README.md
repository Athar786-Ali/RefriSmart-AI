# 🤖 Golden Refrigeration — RefriSmart-AI

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.0.0-brightgreen.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black.svg?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.4-2D3748.svg?logo=prisma)
![Express](https://img.shields.io/badge/Express-5.2-000000.svg?logo=express)
![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg?logo=vercel)

**Live Demo →** [refrismart-ai.vercel.app](https://refrismart-ai.vercel.app)

</div>

---

**RefriSmart-AI** is a production-grade, full-stack web platform built for **Golden Refrigeration** — Bhagalpur's most trusted appliance repair service. The platform combines AI-powered diagnostics (Google Gemini), seamless service booking, an admin management dashboard, Razorpay payments, and local SEO optimizations into a single modern web application.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🧠 **AI-Powered Diagnostics** | Upload images/videos of your appliance and get instant AI diagnosis via Google Gemini |
| 🛠️ **Service Booking** | Book same-day doorstep visits for AC, refrigerator, washing machine, and microwave repair |
| 🛒 **Appliance Selling** | Request pickup and valuation for old or faulty appliances |
| 🔒 **JWT Authentication** | Secure login/register with OTP email verification (Nodemailer) |
| 👨‍💼 **Admin Dashboard** | Manage users, services, orders, diagnoses, technicians, and products |
| 💳 **Razorpay Payments** | Integrated online payment gateway with order tracking |
| ☁️ **Cloudinary Storage** | Cloud-hosted media for diagnostic images and videos |
| 📊 **Service History** | Users can track all past bookings and service statuses |
| 📦 **Products Catalog** | Browse and buy refrigeration & appliance products |
| 🗺️ **Local SEO Optimized** | JSON-LD schema, Open Graph, sitemap, robots.txt for Google ranking |
| 📱 **Fully Responsive** | Mobile-first design built with Tailwind CSS v4 |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.1.6 | React framework (App Router) |
| React | 19.2.3 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | v4 | Utility-first styling |
| Lucide React | ^0.577 | Icon library |
| Sonner | ^2.0.7 | Toast notifications |
| React Hot Toast | ^2.6 | Secondary toaster |
| React Player | ^3.4 | Video playback for AI diagnosis |
| React QR Code | ^2.0.18 | QR code display |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | v20+ | Runtime environment |
| [Express.js](https://expressjs.com/) | v5.2.1 | HTTP framework |
| TypeScript | ^5.9 | Type safety |
| [Prisma ORM](https://www.prisma.io/) | v7.4 | Database ORM |
| PostgreSQL (`pg`) | ^8.20 | Relational database |
| `@google/genai` | ^1.44 | Google Gemini AI SDK |
| Cloudinary | ^2.9 | Image/video cloud storage |
| Razorpay | ^2.9.6 | Payment gateway |
| Nodemailer | ^8.0.6 | Email (OTP & notifications) |
| Multer | ^2.1.1 | File upload middleware |
| Bcryptjs | ^3.0.3 | Password hashing |
| JSON Web Token | ^9.0.3 | Auth tokens |
| Cookie Parser | ^1.4.7 | HTTP cookie handling |

### Deployment

- **Frontend:** [Vercel](https://vercel.com/) — [refrismart-ai.vercel.app](https://refrismart-ai.vercel.app)
- **Backend:** Vercel Serverless Functions (via `vercel.json`)
- **Database:** PostgreSQL (Neon / Supabase compatible)

---

## 📁 Project Structure

```text
RefriSmart-AI/
├── frontend/                        # Next.js App Router frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Homepage
│   │   │   ├── layout.tsx           # Root layout (SEO, JSON-LD schemas)
│   │   │   ├── sitemap.ts           # Auto-generated XML sitemap
│   │   │   ├── robots.ts            # Robots.txt configuration
│   │   │   ├── admin/               # Admin dashboard (tabbed UI)
│   │   │   │   ├── _dashboard.tsx   # Stats overview
│   │   │   │   ├── _services.tsx    # Service management
│   │   │   │   ├── _orders.tsx      # Order management
│   │   │   │   ├── _diagnoses.tsx   # AI diagnosis history
│   │   │   │   ├── _sell.tsx        # Sell requests
│   │   │   │   └── _profile.tsx     # Admin profile
│   │   │   ├── ai-diagnosis/        # AI diagnostic upload & result
│   │   │   ├── service/             # Service booking page
│   │   │   ├── orders/              # User order tracking
│   │   │   ├── products/            # Product catalog
│   │   │   ├── sell/                # Appliance selling flow
│   │   │   ├── gallery/             # Photo gallery
│   │   │   ├── technician/          # Technician portal
│   │   │   ├── login/               # Auth (login/register)
│   │   │   └── verify-otp/          # OTP email verification
│   │   └── components/
│   │       ├── Navbar.tsx
│   │       ├── Footer.tsx
│   │       ├── BrandLogo.tsx
│   │       └── ServiceHistoryCard.tsx
│   └── package.json
│
├── backend/                         # Express.js + Prisma API server
│   ├── src/
│   │   ├── index.ts                 # Server entry point
│   │   ├── controllers/
│   │   │   ├── authController.ts    # Auth, OTP, JWT
│   │   │   ├── aiController.ts      # Gemini AI diagnostics
│   │   │   ├── adminController.ts   # Full admin CRUD
│   │   │   └── productController.ts # Product listing & orders
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── aiRoutes.ts
│   │   │   ├── adminRoutes.ts
│   │   │   └── productRoutes.ts
│   │   ├── middlewares/             # Auth middleware, validators
│   │   ├── services/                # Business logic layer
│   │   ├── config/                  # Runtime & environment config
│   │   ├── utils/                   # Helpers
│   │   └── scripts/                 # One-off migration/upload scripts
│   ├── prisma/
│   │   └── schema.prisma            # Database schema
│   ├── vercel.json                  # Vercel serverless config
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [PostgreSQL](https://www.postgresql.org/) database (or a hosted service like [Neon](https://neon.tech/))
- [Cloudinary](https://cloudinary.com/) account
- [Razorpay](https://razorpay.com/) account
- [Google Gemini API Key](https://aistudio.google.com/)
- Gmail account (for Nodemailer OTP emails)

### 1. Clone the Repository

```bash
git clone https://github.com/Athar786-Ali/RefriSmart-AI.git
cd RefriSmart-AI
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 3. Environment Variables

**Backend — create `backend/.env`:**
```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/refrismart_db"

# Auth
JWT_SECRET="your_jwt_secret_key"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Google Gemini AI
GEMINI_API_KEY="your_google_gemini_api_key"

# Razorpay
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"

# Email (Nodemailer / Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_gmail_app_password"
```

**Frontend — create `frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key_id"
```

### 4. Database Setup

```bash
cd backend
npx prisma generate
npx prisma db push     # For quick setup
# OR
npx prisma migrate dev # For tracked migrations
```

### 5. Run Locally

```bash
# Terminal 1 — Backend (port 5001)
cd backend
npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

- **Frontend:** [http://127.0.0.1:3000](http://127.0.0.1:3000)
- **Backend API:** [http://localhost:5001/api](http://localhost:5001/api)

---

## 🌐 API Routes Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login & get JWT |
| `POST` | `/api/auth/verify-otp` | Verify email OTP |
| `POST` | `/api/ai/diagnose` | Submit media for AI diagnosis |
| `GET` | `/api/products` | List all products |
| `POST` | `/api/products/order` | Place a product order |
| `GET` | `/api/admin/stats` | Admin dashboard stats |
| `GET/PATCH` | `/api/admin/services` | Manage service requests |
| `GET/PATCH` | `/api/admin/orders` | Manage orders |

---

## 🗺️ SEO & Local Search

The platform is optimized for local Google search in Bhagalpur, Bihar:

- **JSON-LD schemas:** `LocalBusiness`, `FAQPage`, `Service`
- **Open Graph & Twitter Cards** for social sharing
- **XML Sitemap** auto-generated via `sitemap.ts`
- **Robots.txt** configuration
- **Canonical URLs** on all pages
- **Structured address & geo-coordinates** for Google Maps

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

**Golden Refrigeration — Bhagalpur**

- 📍 **Address:** Sabour High School, Pani Tanki Sabour, Bhagalpur, Bihar — 813210
- 📞 **Phone:** [+91 7070494254](tel:+917070494254)
- 🗺️ **Google Maps:** [View on Maps](https://maps.app.goo.gl/vJ8CDd8nTpkZBG4EA)
- 🌐 **Website:** [refrismart-ai.vercel.app](https://refrismart-ai.vercel.app)
- 📖 **JustDial:** [View Listing](https://www.justdial.com/Bhagalpur/Golden-Refrigeration-Sabour-High-School-Sabour/9999PX641-X641-190522080859-E5V9_BZDET)

---

*Built with ❤️ for Golden Refrigeration by the RefriSmart-AI Team.*
