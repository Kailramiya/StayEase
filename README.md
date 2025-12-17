# 🏡 StayEase — Property Rental & Booking Platform (AI-Assisted)

🔗 **Live Demo:** https://stay-ease-frontend-one.vercel.app/  
💻 **GitHub Repository:** https://github.com/Kailramiya/StayEase  

StayEase is a **full-stack property rental and booking platform** designed to help users discover, evaluate, and book rental properties efficiently.  
Unlike basic listing platforms, StayEase introduces an **AI-assisted ranking system** that intelligently surfaces relevant properties instead of static, unordered results.

This project is built with **production-grade engineering principles** — security, performance, scalability, and explainability.

---

## ✨ Key Features

- 🔐 Secure authentication using **JWT with httpOnly cookies**
- 🤖 **AI-assisted property ranking** based on user behavior signals
- ⚡ **Redis caching** for fast, scalable read-heavy APIs
- 🏠 Property listings with search, filters, favorites, and reviews
- 📅 Booking lifecycle management (pending → confirmed → cancelled)
- 📊 Explainable recommendations (not black-box AI)
- 🚀 Deployed frontend with realistic Indian demo data

---

## 🧠 AI-Assisted Ranking (Core Highlight)

StayEase implements a **deterministic, explainable AI-assisted ranking system** inspired by real-world recommendation engines.

Instead of using black-box ML models (which require large datasets), properties are ranked using **weighted behavioral signals**:

- Views (popularity)
- Ratings & reviews (quality)
- Booking activity (demand)
- Recency (freshness)
- Price relevance

Each property receives an **AI score**, which is used to:
- Rank listings intelligently
- Display badges like **“Recommended”** and **“Trending”**
- Provide user-visible explanations such as *“Based on popularity and user interest”*

✅ This approach is:
- Interpretable  
- Testable  
- Production-safe  

---

## ⚡ Performance Optimization with Redis

To handle read-heavy traffic efficiently:

- Redis is used to cache:
  - Property listings
  - Search and filter results
- Cache keys are generated using query parameters (filters, pagination, sorting)
- Automatic fallback to MongoDB if Redis is unavailable
- Cache invalidation on property create/update/delete

This significantly improves response consistency under repeated queries.

---

## 🔐 Authentication & Security

- JWT-based authentication
- Tokens stored in **httpOnly cookies** (prevents XSS attacks)
- Secure CORS configuration
- Role-based access control (User / Admin)
- Centralized error handling

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Redis

### Other Tools
- JWT
- Cloudinary (image uploads)
- Razorpay (payment integration)
- dotenv (environment management)

---

## 🗄️ Database Design

- **Users** — authentication, roles, favorites
- **Properties** — listings, pricing, amenities, views, ratings
- **Reviews** — user feedback and ratings
- **Bookings** — booking lifecycle and payment state

Aggregated fields like average rating and review count are stored to avoid expensive queries.

---

## 🚀 Deployment

- **Frontend:** Vercel  
- **Backend:** Deployed separately with environment-based configuration
- **Services:** MongoDB Atlas, Redis, Cloudinary

---

## 📂 Project Structure

StayEase/
├── backend/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ └── scripts/
├── frontend/
│ ├── components/
│ ├── pages/
│ ├── api/
│ └── hooks/
└── README.md

yaml
Copy code

---

## ▶️ Running Locally

### 1. Clone the repository
```bash
git clone https://github.com/Kailramiya/StayEase
cd StayEase
2. Backend setup
bash
Copy code
cd backend
npm install
npm run dev
Create a .env file:

env
Copy code
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url
3. Frontend setup
bash
Copy code
cd frontend
npm install
npm run dev
📈 What This Project Demonstrates
Full-stack ownership from database to deployment

Secure authentication & API design

Performance optimization using caching

Explainable AI-inspired ranking systems

Real-world engineering tradeoffs (AI vs ML)

🧩 Future Improvements
Personalized recommendations per user

Advanced text / semantic search

Background jobs for analytics and notifications

Admin dashboards with insights

👨‍💻 Author
Aman Kumar
B.Tech Student | Full-Stack Developer

🔗 GitHub: https://github.com/Kailramiya
🔗 Live Demo: https://stay-ease-frontend-one.vercel.app/

⭐ If you found this project interesting, feel free to star the repository!