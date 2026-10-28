# Discover Jordan

Discover Jordan is a full-stack tourism platform for exploring Jordan's most memorable destinations. It includes destination discovery, favorites, trip planning, authentication, user profiles, and an admin dashboard.

## Features
- Map-first Jordan experience with interactive price markers
- Searchable destination catalog for heritage sites, hikes, nature reserves, museums, and activities
- Destination detail pages with photos, source/license links, highlights, and estimated prices
- Saved favorites for authenticated users
- Personalized multi-destination trip planner and Gemini AI itinerary chat
- Light/dark theme toggle, saved across visits
- JWT-based authentication and role-based access control
- Admin dashboard to create destinations
- Responsive design for mobile, tablet, and desktop

## Tech Stack
- Frontend: React + Vite + Bootstrap + React Router + Leaflet/OpenStreetMap
- Backend: Node.js + Express.js + MongoDB Atlas + Mongoose + Gemini API
- Authentication: JWT + bcryptjs

## Project Structure
- backend/: Express API and MongoDB models
- frontend/: React app

## Prerequisites
- Node.js 18+
- npm

## Environment Setup
Backend:
- Copy backend/.env.example to backend/.env and configure:
  - PORT=5000
  - JWT_SECRET=a long random secret
  - MONGODB_URI=your MongoDB connection string (optional for local development; required in production)
  - GEMINI_API_KEY=your private Gemini API key (required for live AI chat; get a key from Google AI Studio)
  - GEMINI_MODEL=gemini-2.5-flash (optional)
  - CORS_ORIGIN=http://localhost:5173

Frontend:
- Copy frontend/.env.example to frontend/.env and set VITE_API_URL=http://localhost:5000

## Run the Project
1. Open a terminal in backend/
2. Run: npm install
3. Run: npm run dev
4. Open a second terminal in frontend/
5. Run: npm install
6. Run: npm run dev

The frontend will run on the Vite dev server, and the API will run on port 5000.

## Admin Access
- Register a new account and then use the admin role in the database or update the role manually to admin.
- The admin dashboard is available from the top navigation once the user has the admin role.

## Notes
- The app uses MongoDB in-memory storage in local development when no MONGODB_URI is provided. Production startup requires MongoDB Atlas.
- The backend seeds sample Jordan destinations for quick demos.
- Destination photos are served from Wikimedia Commons. Each photo links to its Commons file page for author and license details.
- The interactive map uses OpenStreetMap. Browser location is requested only after the visitor selects “Use my location” and is not sent to the backend.
- Gemini chat requires GEMINI_API_KEY in backend/.env; never put the key in the frontend or commit it. The free tier has usage limits and can change.
- Activity and entry costs are estimates in JOD, not live ticket quotes or bookings. Check official providers for current rates, access, and season restrictions.
- Stripe checkout is not connected. The planner does not accept or process payments.

## Deployment

The repo includes a Render blueprint at render.yaml and Vercel SPA routing at frontend/vercel.json.

1. Create a MongoDB Atlas database and a database user. Allow connections from your Render service (or use Atlas network access rules appropriate to your deployment).
2. Push this repository to a Git provider.
3. In Render, create a Blueprint from the repository. Set the blueprint's private MONGODB_URI, GEMINI_API_KEY, and CORS_ORIGIN values. CORS_ORIGIN must be the exact deployed Vercel origin, such as https://discover-jordan.vercel.app. Render generates JWT_SECRET.
4. Deploy the frontend on Vercel with the project root set to frontend. Set VITE_API_URL to the deployed Render service's HTTPS origin, without a trailing slash, then redeploy.
5. Update Render's CORS_ORIGIN to the final Vercel production URL and redeploy the backend.
6. Confirm the Render /api/health endpoint, register/login in Vercel, load the Jordan map, then test trip save and Gemini chat.

Never commit .env files, API keys, Atlas credentials, or deployment tokens. Render and Vercel accounts/API credentials must be owned and configured by the project owner.
