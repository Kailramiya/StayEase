# StayEase

>A minimal property rental / bookings platform (full-stack example) — React + Vite frontend and Node/Express + MongoDB backend.

This repository contains a small rental booking application with user auth, bookings, payments (local/placeholder), contact owner, favorites, and basic admin features.

---

## Quick overview

- Frontend: React (Vite), Tailwind CSS, uses an axios API wrapper and cookie-based client session persistence.
- Backend: Node.js, Express, MongoDB (Mongoose). Authentication with JWT, email utilities (NodeMailer), Cloudinary image uploads.

Project layout (top-level)
- `frontend/` — React app (UI, routes, pages, contexts)
- `backend/` — Express API (routes, controllers, models, middleware)

Live demo

- https://stay-ease-frontend-one.vercel.app/ 

---

## Features

- User registration & login (JWT)
- Profile management, upload profile picture (Cloudinary)
- Create and manage bookings (local payment flow by default)
- Contact property owner (server-side email)
- Favorites, reviews, and admin management pages
- Cookie-based auth persistence (client-side cookie storing the user object)

---

## Tech stack

- Frontend: React 19, Vite, React Router, Tailwind CSS
- Backend: Node.js, Express, Mongoose (MongoDB)
- Utilities: Axios, Cloudinary SDK, Nodemailer

---

## Quick start (local development)

Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB (remote or local)

1) Clone the repo and open two terminals — one for backend and one for frontend.

Backend

```powershell
cd c:\Users\hp\OneDrive\Desktop\projects\StayEase\backend
npm install
# create a .env file (see section below) then:
npm start
```

Frontend

```powershell
cd c:\Users\hp\OneDrive\Desktop\projects\StayEase\frontend
npm install
npm run dev
```

Open http://localhost:5173 (Vite default) for the frontend and the backend server logs will show the API port (default 5000).

---

## Environment variables

Create a `.env` file in `backend/` with at least the following values:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=some_long_secret
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
# Optional: Cloudinary (for profile uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
# Optional: SMTP for emails
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
# Optional: Razorpay keys (only if you use Razorpay)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Frontend env (create `.env` in `frontend/` or set variables for your host):

```
VITE_API_BASE_URL=https://stayease-o1si.onrender.com/api
# When running locally:
# VITE_API_BASE_URL=http://localhost:5000/api
```

Notes
- `ALLOWED_ORIGINS` is a comma-separated list used by backend CORS middleware. Add your deployed frontend origin (for example `https://your-frontend.vercel.app`) before deploying.

---

## Deployment notes

- Typical setup used by this project:
	- Frontend deployed to Vercel (or Netlify)
	- Backend deployed to Render (or Heroku, DigitalOcean App Platform)

Key deployment tips
- CORS: on the backend ensure `ALLOWED_ORIGINS` includes your frontend origin (when credentials are used the backend must return the explicit origin, not `*`).
- Env vars: never commit `.env` to git; configure env vars in the host dashboard (Render / Vercel).
- Static SPA routes: if you host the frontend as a static site (Vercel), add a rewrite so client-side routes load index.html. Example `vercel.json`:

```json
{
	"rewrites": [{ "source": "/*", "destination": "/index.html" }]
}
```

- Payment provider: this project contains a local payment flow by default and (previously) integrated code for Razorpay. If you are not using Razorpay you can remove the keys and the `config/razorpay.js` safely (the project contains a guard so missing keys won't crash startup).

---

## Testing the deployed API (Postman)

Use Postman to test backend endpoints (bypasses browser CORS). Example flow:

1. Register: POST `{{baseUrl}}/api/auth/register` JSON body { name, email, password }
2. Login: POST `{{baseUrl}}/api/auth/login` JSON body { email, password } — save returned token
3. Protected: GET `{{baseUrl}}/api/auth/me` with header `Authorization: Bearer <token>`

See `backend/routes/authRoutes.js` for available auth endpoints. The README below contains a small collection of useful endpoints and examples.

---

## Common troubleshooting

- App toggles between `/` and `/login`:
	- Cause: mixed client storage (cookie vs localStorage) for auth. Fix: ensure frontend reads token consistently (this project uses a cookie-based `user` payload and the axios wrapper reads token from cookies).

- CORS preflight failing in browser:
	- Ensure backend `ALLOWED_ORIGINS` includes the exact frontend origin and that backend `cors` middleware is configured before routes.

- Razorpay error on startup (`key_id or oauthToken is mandatory`):
	- Either set the Razorpay env vars in the host or remove/guard the Razorpay initializer (the repository already includes a safe initializer that disables Razorpay when keys are missing).

---

## Useful scripts

- Frontend: `npm run dev` (dev server), `npm run build` (production), `npm run preview` (preview build)
- Backend: `npm start` (start server)

---

## Project structure (high level)

- `backend/controllers` — API handlers
- `backend/models` — Mongoose models
- `backend/routes` — Express routes
- `frontend/src/pages` — React pages
- `frontend/src/components` — reusable UI components

---

## Contributing

PRs are welcome. Small guidelines:
- Keep changes focused and test locally
- Add tests or update readme when you add endpoints

---

If you'd like, I can also:
- generate a Postman collection for common auth endpoints
- add a `backend/README.md` with required env variable reference and Render/Vercel step-by-step deploy notes
- run a repo-wide lint/fix to unify cookie vs localStorage usage

Happy deploying — tell me if you want the Postman collection or I should commit the README update to the repo now.
