# Discover Jordan

Discover Jordan is a full-stack tourism platform for exploring Jordan's most memorable destinations. It includes destination discovery, favorites, trip planning, authentication, user profiles, and an admin dashboard.

## Features
- Map-first Jordan experience with interactive price markers
- Searchable destination catalog for heritage sites, hikes, nature reserves, museums, and activities
- Destination detail pages with photos, source/license links, highlights, and estimated prices
- Saved favorites for authenticated users
- Personalized multi-destination trip planner and Gemini AI itinerary chat
- Light/dark theme toggle, saved across visits
- JWT-based authentication, Google sign-in, and role-based access control
- Email verification and password reset with Resend
- Admin dashboard with live user, trip, saved-place, and destination analytics
- Responsive design for mobile, tablet, and desktop

## Tech Stack
- Frontend: React + Vite + Bootstrap + React Router + Leaflet/OpenStreetMap
- Backend: Node.js + Express.js + MongoDB Atlas + Mongoose + Gemini API
- Authentication: JWT + bcryptjs + Google Identity Services
- Transactional email: Resend

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
  - FRONTEND_URL=http://localhost:5173
  - GOOGLE_CLIENT_ID=your Google OAuth Web client ID
  - RESEND_API_KEY=your private Resend API key
  - EMAIL_FROM=Discover Jordan <verified-sender@your-domain>

Frontend:
- Copy frontend/.env.example to frontend/.env and set:
  - VITE_API_URL=http://localhost:5000
  - VITE_GOOGLE_CLIENT_ID=the same Google OAuth Web client ID

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
- The admin dashboard is available from the top navigation once the user has the admin role. Dashboard data is returned only to an authenticated admin by `/api/admin/overview`.

## Google Sign-In and Account Email
- Configure a Google OAuth Web client in Google Cloud Console. Add your local and production frontend domains as authorized JavaScript origins. Set the same client ID as `GOOGLE_CLIENT_ID` in Render and `VITE_GOOGLE_CLIENT_ID` in Vercel; the backend verifies each Google ID token before creating or signing in a user.
- Configure a Resend account and verify the sender domain/address. Set `RESEND_API_KEY` and `EMAIL_FROM` as private backend environment variables. Email/password registration sends a 24-hour verification link; password reset links expire after one hour.
- Set `FRONTEND_URL` to the exact deployed frontend origin so verification and reset links return to the correct app. For local development, email delivery still requires valid Resend configuration.
- Google client IDs are public identifiers, not credentials. Keep the Resend API key, MongoDB URI, and JWT secret private in Render; never place those secrets in Vercel frontend variables or source files.

## Notes
- The app uses MongoDB in-memory storage in local development when no MONGODB_URI is provided. Production startup requires MongoDB Atlas.
- The backend seeds sample Jordan destinations for quick demos.
- Destination photos are served from Wikimedia Commons. Each photo links to its Commons file page for author and license details.
- The interactive map uses OpenStreetMap. Browser location is requested only after the visitor selects “Use my location” and is not sent to the backend.
- The location action is opt-in and only marks the user’s current position in that browser session; it is not stored in the account or sent to the API.
- Gemini chat requires GEMINI_API_KEY in backend/.env; never put the key in the frontend or commit it. The free tier has usage limits and can change.
- Activity and entry costs are estimates in JOD, not live ticket quotes or bookings. Check official providers for current rates, access, and season restrictions.
- Stripe checkout is not connected. The planner does not accept or process payments.

## Deployment

The repo includes a Render blueprint at render.yaml and Vercel SPA routing at frontend/vercel.json.

1. Create a MongoDB Atlas database and a database user. Allow connections from your Render service (or use Atlas network access rules appropriate to your deployment).
2. Push this repository to a Git provider.
3. In Render, create a Blueprint from the repository. Set the private `MONGODB_URI`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `GOOGLE_CLIENT_ID`, `FRONTEND_URL`, and `CORS_ORIGIN` values. `FRONTEND_URL` and `CORS_ORIGIN` must use the exact deployed Vercel origin. Render generates `JWT_SECRET`.
4. Deploy the frontend on Vercel with the project root set to `frontend`. Set `VITE_API_URL` to the deployed Render service's HTTPS origin and `VITE_GOOGLE_CLIENT_ID` to the Google Web client ID, then redeploy.
5. Update Render's `CORS_ORIGIN` and `FRONTEND_URL` to the final Vercel production URL and redeploy the backend.
6. Confirm the Render /api/health endpoint, register/login in Vercel, load the Jordan map, then test trip save and Gemini chat.

Never commit .env files, API keys, Atlas credentials, or deployment tokens. Render and Vercel accounts/API credentials must be owned and configured by the project owner.
