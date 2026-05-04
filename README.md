# 🤖 Golden Refrigeration - RefriSmart-AI

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black.svg?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript)

**RefriSmart-AI** is an advanced, full-stack web application built for **Golden Refrigeration** (based in Bhagalpur). Designed to revolutionize appliance maintenance, servicing, and selling, it leverages the power of artificial intelligence via Google GenAI to provide smart diagnostics, seamless service booking, and a platform for users to sell their appliances.

---

## ✨ Key Features

- **🧠 AI-Powered Diagnostics:** Utilize Google GenAI to diagnose refrigerator issues through uploaded videos and images.
- **🛠️ Service Requests & Management:** Easy scheduling and tracking of appliance repair services and orders.
- **🛒 Appliance Selling Flow:** Streamlined process for users to request selling their old or faulty appliances.
- **🔒 Secure Authentication:** Robust JWT-based authentication system with secure password hashing (Bcryptjs).
- **💳 Integrated Payments:** Seamless payment processing integrated with Razorpay.
- **☁️ Cloud Storage:** Reliable media storage using Cloudinary for images and diagnostic videos.
- **📊 Admin Dashboard:** Comprehensive administrative interface for managing users, services, orders, and profiles.
- **📱 Responsive UI:** A fully responsive, modern design built with Next.js 16 and Tailwind CSS v4.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** [Next.js](https://nextjs.org/) (v16.1.6)
- **Library:** React 19
- **Styling:** Tailwind CSS v4
- **Icons & UI:** Lucide React, React Hot Toast, Sonner
- **Media:** React Player

### Backend (Server)
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** Express.js (v5.2)
- **Language:** TypeScript
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL (pg)
- **AI Integration:** `@google/genai` (Google Generative AI SDK)
- **File Uploads:** Multer & Cloudinary
- **Payments:** Razorpay
- **Mailing:** Nodemailer

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) database
- [Cloudinary](https://cloudinary.com/) account
- [Razorpay](https://razorpay.com/) account
- [Google Gemini API Key](https://aistudio.google.com/)

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd RefriSmart-AI
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   # or yarn install / pnpm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd ../backend
   npm install
   ```

### ⚙️ Environment Variables

You need to set up environment variables for both the frontend and backend. 

**Backend (`backend/.env`):**
Create a `.env` file in the `backend` directory with the following variables:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/refrismart_db"

# Authentication
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

# Email Setup (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
```

**Frontend (`frontend/.env.local`):**
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL="http://localhost:5001/api" # Adjust port if necessary
NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key_id"
```

### 🏃‍♂️ Running the Application Locally

1. **Start the Backend Server:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push # or npx prisma migrate dev
   npm run dev
   ```
   The backend should start, typically on port `5001`.

2. **Start the Frontend Development Server:**
   Open a new terminal window:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at [http://127.0.0.1:3000](http://127.0.0.1:3000).

---

## 📁 Project Structure

```text
RefriSmart-AI/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/              # Next.js App Router (pages, layouts)
│   │   │   ├── admin/        # Admin dashboard components and views
│   │   │   ├── ai-diagnosis/ # AI Diagnostic interfaces
│   │   │   └── ...
│   │   └── ...
│   ├── package.json
│   └── ...
├── backend/                  # Express/Node.js backend server
│   ├── src/
│   │   ├── controllers/      # Route controllers (Auth, AI, etc.)
│   │   ├── routes/           # Express API routes
│   │   ├── scripts/          # Helper scripts (e.g., upload_videos.ts)
│   │   ├── config/           # Configuration files
│   │   └── index.ts          # Server entry point
│   ├── prisma/               # Prisma database schema
│   ├── package.json
│   └── ...
└── README.md                 # Project documentation
```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

**Golden Refrigeration**
- **Location:** Bhagalpur
- **Phone:** 7070494254

---
*Built with ❤️ by the RefriSmart-AI Team.*
