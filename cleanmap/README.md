# 🗺 CleanMap — Community Waste Reporting App

Report garbage spots, track cleanups, coordinate volunteers — all in real time.

---

## 📁 Project Structure

```
cleanmap/
├── frontend/          ← React app (Create React App)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx    ← Stats cards (Total/Pending/Active/Cleaned)
│   │   │   ├── MapView.jsx      ← Leaflet map + colour-coded markers
│   │   │   ├── ReportForm.jsx   ← Modal: geolocation, photo upload, severity
│   │   │   ├── Sidebar.jsx      ← Live report list, filters, sort
│   │   │   └── Toast.jsx        ← Notification banner
│   │   ├── hooks/
│   │   │   └── useReports.js    ← Polls backend every 5 s for live updates
│   │   ├── utils/
│   │   │   └── helpers.js       ← timeAgo, haversine distance, reverseGeocode
│   │   ├── api.js               ← Axios API client (all backend calls)
│   │   ├── App.jsx              ← Root component + layout
│   │   ├── App.css              ← Full dark-mode design system
│   │   └── index.js             ← React DOM entry point
│   ├── .env.example
│   └── package.json
│
├── backend/           ← Node.js / Express REST API
│   ├── src/
│   │   ├── models/
│   │   │   └── store.js         ← In-memory store + 6 seed reports (swap for DB)
│   │   ├── routes/
│   │   │   ├── reports.js       ← CRUD + /claim + /clean endpoints
│   │   │   └── uploads.js       ← Multer image upload endpoint
│   │   ├── middleware/
│   │   │   └── errorHandler.js  ← Global error handler
│   │   └── index.js             ← Express app bootstrap
│   ├── uploads/                 ← Uploaded images saved here (git-ignored)
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start

### 1 — Backend

```bash
cd backend
cp .env.example .env          # copy environment variables
npm install
npm run dev                   # starts on http://localhost:5000
```

### 2 — Frontend

```bash
cd frontend
cp .env.example .env          # copy environment variables
npm install
npm start                     # starts on http://localhost:3000
```

Open **http://localhost:3000** — the app loads with 6 pre-seeded Chennai reports.

---

## 🔌 API Endpoints

| Method | Endpoint                      | Description                        |
|--------|-------------------------------|------------------------------------|
| GET    | `/api/reports`                | All reports (optional `?status=`)  |
| GET    | `/api/reports/stats`          | Dashboard counts                   |
| GET    | `/api/reports/:id`            | Single report                      |
| POST   | `/api/reports`                | Create new report                  |
| PATCH  | `/api/reports/:id/claim`      | Claim a PENDING report             |
| PATCH  | `/api/reports/:id/clean`      | Mark IN_PROGRESS as CLEANED        |
| DELETE | `/api/reports/:id`            | Delete a report                    |
| POST   | `/api/uploads/image`          | Upload image (multipart/form-data) |
| GET    | `/api/health`                 | Health check                       |

### POST /api/reports — Request body
```json
{
  "lat": 13.0827,
  "lng": 80.2707,
  "severity": "High",
  "description": "Large pile near school",
  "reporter": "Priya",
  "location": "T. Nagar, Chennai",
  "imageUrl": "http://localhost:5000/uploads/abc123.jpg"
}
```

### PATCH /claim or /clean — Request body
```json
{ "volunteerName": "Rahul" }
```

---

## ✨ Features

| Feature | Details |
|---|---|
| Real map | Leaflet + OpenStreetMap tiles, real coordinates |
| Colour-coded markers | 🟢 Low · 🟠 Medium · 🔴 High |
| Pulse animation | IN_PROGRESS markers animate to draw attention |
| Geolocation | "Use My Location" button — no typed coordinates |
| Map-click pin | Click anywhere on map to drop a report pin |
| Auto reverse-geocode | Nominatim converts lat/lng to readable address |
| Photo upload | Camera capture on mobile, preview in form + popup |
| Status flow | PENDING → IN_PROGRESS → CLEANED |
| Volunteer credit | "Cleaned by Rahul" stored and shown everywhere |
| Timestamps | "2h ago", "just now" |
| Nearest sort | Sort sidebar by distance from current location |
| Filter tabs | All / Pending / Active / Cleaned |
| Live polling | Frontend refreshes every 5 s automatically |
| Dark mode | Full dark theme throughout |
| Toast notifications | Feedback after every action |

---

## 🗄 Swapping the In-Memory Store for a Real Database

`backend/src/models/store.js` exposes a simple interface:

```js
store.getAll()         // → Report[]
store.getById(id)      // → Report | null
store.create(data)     // → Report
store.update(id, patch)// → Report | null
store.remove(id)       // → boolean
store.stats()          // → { total, pending, inProgress, cleaned }
```

Replace the in-memory arrays with MongoDB (Mongoose) or PostgreSQL (pg/Prisma)
calls behind this same interface — no route code changes needed.

---

## 🌐 Deployment

### Frontend → Vercel / Netlify
```bash
cd frontend && npm run build
# drag the build/ folder into Netlify Drop, or push to Vercel
```
Set environment variable: `REACT_APP_API_URL=https://your-api.com/api`

### Backend → Railway / Render
Push the `backend/` folder. Set:
```
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app
API_URL=https://your-api.railway.app
NODE_ENV=production
```

---

## 📋 Judging Checklist

- [x] 5+ pre-loaded dummy reports
- [x] Real coordinates (no fake lat/lng)
- [x] Location from Geolocation API or map-click only
- [x] Claiming reflects live (no page reload)
- [x] Runnable locally with two commands
