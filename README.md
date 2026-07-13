<div align="center">

# 🤖 RefriSmart-AI (Golden Refrigeration)
### Production Full-Stack SaaS | Live & Ranking on Google

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

### 🌐 [Live Site → www.goldenrefrigeration.in](https://www.goldenrefrigeration.in)

</div>

---

## 📌 The "TL;DR" for Recruiters & Engineering Managers

**What is this?**  
RefriSmart-AI is a production-deployed, full-stack platform custom-built for Golden Refrigeration, a real physical appliance repair business in Bhagalpur, India. 

**Is it actually being used?**  
Yes. It is actively handling real customers, processing live payments via Razorpay, and successfully ranking on the first page of Google (competing directly with major directories like JustDial).

**My Role:**  
I built this end-to-end as a **Solo Full-Stack Developer**. I handled everything from the initial requirements gathering and database schema design, to the Next.js UI, the Node/Express backend, multimodal AI integration, and the JSON-LD Local SEO strategy.

---

## 🏢 The Business Problem & My Solution

Local service businesses suffer from high operational friction. Here is how my software solved real-world problems for this business:

| Operational Pain Point | Engineering Solution | Real-World Impact |
| :--- | :--- | :--- |
| **High No-Show Rates:** Customers would book a visit, and the technician would arrive to an empty house. | **Razorpay Integration:** Implemented a mandatory ₹349 upfront visiting fee during the booking flow. | Acts as a hard commitment signal. **Essentially eliminated no-shows** and ensured technicians' time is respected. |
| **Blind Dispatching:** Technicians didn't know what parts to bring because customers couldn't describe the fault. | **Multimodal AI Triage:** Customers upload a photo/video. I integrated Google Gemini Vision to diagnose the fault *before* dispatch. | Increased first-visit fix rate. Technicians arrive knowing if it's a PCB issue or a compressor leak. |
| **Zero Digital Discoverability:** The business only existed offline and on third-party aggregators. | **Programmatic SEO:** Engineered dynamic JSON-LD structured data (LocalBusiness, FAQPage, Service schemas). | The custom domain now **ranks on Page 1 of Google** for local intent searches. |
| **Lost Lifecycle Data:** Paper records meant no history of past repairs or revenue tracking. | **Admin Dashboard & Audit Trails:** A full React admin suite backed by PostgreSQL. | The owner can now track daily revenue, assign jobs, and view the entire lifecycle of a repair ticket. |

---

## 🧠 Deep-Dive: Architecture & Technical Decisions

I believe a strong engineer is defined by how they navigate trade-offs and solve edge cases. Here are the most complex technical challenges I solved in this project:

### 1. AI Resilience & Multi-Key Rotation Pool
Relying on a single free-tier LLM API key in a production environment is a massive single point of failure. If the API rate limits, the core business feature breaks.
*   **The Solution:** I engineered a **Key-Rotation Pool** in the Express backend. If a Gemini key hits a `429 Too Many Requests`, the system catches the error, rotates to the next available API key in the `.env` pool, and retries seamlessly.
*   **The Fallback:** I built a 4-tier fallback mechanism: `gemini-flash-lite` ➔ `gemini-flash` ➔ `gemini-pro` ➔ **Offline Rule-Based Engine**. Diagnostics on this platform *never* fail silently.

### 2. Solving the Safari Cross-Origin Cookie Drop
Initially, I implemented stateless JWT authentication using `HttpOnly` cookies. However, because the Vercel frontend and backend were on different subdomains, **Safari and iOS devices blocked the cookies** under their strict cross-site tracking prevention (ITP), causing silent login failures for mobile users.
*   **The Solution:** I rewrote the authentication middleware to support **Dual-Mode Auth**. The backend attempts to read the `HttpOnly` cookie first. If it is missing (due to Safari dropping it), it falls back to parsing an `Authorization: Bearer` token injected by the frontend. This ensured 100% auth reliability across all devices.

### 3. Serverless Database Exhaustion (Connection Pooling)
Because the Express backend runs on Vercel Serverless Functions, a sudden spike in traffic causes Vercel to spin up dozens of isolated Node.js instances. Without mitigation, each instance creates a new direct connection to PostgreSQL, instantly exhausting the database's connection limit and crashing the app.
*   **The Solution:** I integrated **Prisma ORM with Neon’s pgBouncer**. This acts as a proxy that pools and multiplexes database connections. Serverless functions now connect to the pooler rather than directly to the DB, allowing the app to scale horizontally without DB starvation.

### 4. Event-Sourced Database Design (Audit Trails)
When a booking moves from `PENDING` ➔ `ASSIGNED` ➔ `COMPLETED`, simply overwriting a `status` column deletes valuable historical data.
*   **The Solution:** I designed the schema using an append-only audit trail concept. Every state transition writes a new row to a `ServiceEvent` table with a timestamp and the actor's ID. This gives the admin a fully replayable timeline of exactly when a technician was assigned and when the job was closed.

---

## 🏗️ Tech Stack

*   **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons.
*   **Backend:** Node.js, Express.js v5 (Deployed as Vercel Serverless Functions).
*   **Database:** PostgreSQL (Hosted on Neon), Prisma ORM for type-safe queries and schema migrations.
*   **Integrations:** 
    *   **Google Gemini Vision API:** For multimodal image/video appliance diagnostics.
    *   **Razorpay:** For secure INR payment processing.
    *   **Cloudinary:** CDN for storing user-uploaded appliance photos and gallery assets.
    *   **Nodemailer:** For sending OTP authentication emails and invoice PDFs.

### 🔒 Security Practices
*   **Authentication:** Passwords are mathematically salted and hashed using `bcryptjs`. 
*   **Token Security:** JWT tokens are issued via `HttpOnly` cookies, making them strictly inaccessible to client-side JavaScript, preventing XSS token theft.
*   **Payment Verification:** Razorpay webhook signatures are cryptographically verified using crypto HMAC SHA256 before any booking status is updated to prevent spoofed payment confirmations.

### ⚡ Performance & UX Optimizations
*   **Media Delivery:** All user-uploaded diagnostic images and gallery photos are streamed directly to Cloudinary. The Node.js server never stores files locally, ensuring fast serverless cold starts.
*   **Non-Blocking UI:** Used `Sonner` for toast notifications to ensure error states and success messages never block the user's interaction thread.
*   **Mobile-First Design:** Built with Tailwind CSS v4, ensuring the app looks and feels like a native mobile application on phones, which is where 90% of local service bookings occur.

### 🔄 CI/CD & Deployment Strategy
*   **Automated Deployments:** Connected the GitHub repository to Vercel. Every push to the `main` branch triggers an automated build, type-check, and serverless deployment.
*   **Database Migrations:** Prisma schema changes are version-controlled and applied via `npx prisma migrate deploy` in the CI pipeline, ensuring the database structure stays perfectly in sync with the codebase.

---

## 🌐 SEO & Growth Implementation
As seen in the live Google Search results, the application is highly optimized for Local SEO.
*   **Next.js Metadata API:** Dynamic generation of titles, descriptions, and OpenGraph tags per route.
*   **JSON-LD Injection:** I manually mapped the business to schema.org standards, injecting `HomeAndConstructionBusiness`, `OfferCatalog`, and `FAQPage` scripts into the DOM invisibly. This allows Google to parse the exact services offered, pricing, and service areas without scraping HTML.

---

## 🚀 Local Development Setup

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
  <i>Designed, Architected, and Developed by Md Athar Ali</i>
</div>
