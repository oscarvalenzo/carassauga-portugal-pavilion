# 🇵🇹 Carassauga Connect - Portugal Pavilion App

**A gamified cultural festival experience with quests, AR features, and family tracking.**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Running

```bash
# Install dependencies
npm install

# Start backend (Terminal 1)
cd server
npm run dev
# Backend running on http://localhost:4000

# Start frontend (Terminal 2)
cd client
npm run dev
# Frontend running on http://localhost:5173
```

**Open** `http://localhost:5173` in your browser!

---

## 📊 Project Status

### ✅ Completed
- [x] Full-stack architecture designed
- [x] SQLite database setup & seeded
- [x] Backend API (16 endpoints tested & documented)
- [x] Frontend UI (Apple Design System)
- [x] Landing page (full-screen hero)
- [x] Home screen with live events
- [x] Quest system screens
- [x] Profile & leaderboard
- [x] QR scanner component
- [x] Family tracking (Firebase)
- [x] Toast notifications
- [x] Responsive layout (mobile-first)
- [x] San Francisco font system
- [x] Vertical timeline component
- [x] API documentation (Postman collection)

### 🔄 In Progress
- [ ] Connect frontend to live API
- [ ] End-to-end user flow testing
- [ ] AR photo features
- [ ] Push notifications

---

## 🏗️ Architecture

### Frontend
- **Framework:** React 18.2+ with TypeScript
- **Styling:** Tailwind CSS + Apple Design System
- **State:** Zustand + React Query
- **Build:** Vite
- **Features:** PWA, QR scanning, AR, Maps, Real-time tracking

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** SQLite (development), PostgreSQL (production)
- **Auth:** JWT tokens
- **API:** RESTful with 16 endpoints
- **Features:** Gamification, leaderboards, virtual queues

---

## 📚 Documentation

### 🎯 **START HERE** → [WHATS_NEXT.md](./WHATS_NEXT.md)
**Consolidated action plan with all next steps, priorities, and deployment guide.**

### Essential Docs
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current state & progress (95% complete)
- **[technical-architecture.md](./technical-architecture.md)** - System architecture & tech stack
- **[gamification-mechanics.md](./gamification-mechanics.md)** - Game design & quest system
- **[feature-roadmap.md](./feature-roadmap.md)** - Product roadmap & phases
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Step-by-step build guide (120+ pages)
- **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** - Master roadmap & timeline

### API & Testing
- **[Carassauga_API.postman_collection.json](./Carassauga_API.postman_collection.json)** - Postman collection for API testing

---

## 🎮 Features

### Gamification
- **4 Quest Categories:** Foodie, Culture, Futebol, Social
- **14 Activities:** QR code-based challenges
- **12 Badges:** Quest & milestone achievements
- **6 Levels:** Progress from 0 to 1000+ points
- **Leaderboards:** Global, family, & pavilion rankings

### Real-Time Features
- **Family Tracking:** See family members on map (Firebase)
- **Live Events:** Performance schedules & notifications
- **Virtual Queue:** Wait time estimates for food stations

### Interactive
- **QR Scanning:** Complete activities via QR codes
- **AR Photos:** Take photos with AR effects
- **Map Integration:** Navigate pavilion with Leaflet.js
- **Recipe Collection:** Save traditional Portuguese recipes

---

## 🗂️ Project Structure

```
carassauga-connect/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── screens/     # Main app screens
│   │   ├── hooks/       # Custom React hooks
│   │   ├── services/    # API & Firebase services
│   │   └── stores/      # Zustand state management
│   └── public/          # Static assets
│
├── server/              # Node.js backend
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth & validation
│   │   ├── config/      # Database & Redis config
│   │   └── services/    # Business logic
│   └── data/            # SQLite database
│
├── database-schema.sql  # PostgreSQL schema
├── database-seed.sql    # Sample data
└── docs/                # Documentation
```

---

## 🧪 Testing

### Backend API
```bash
# Health check
curl http://localhost:4000/health

# Get activities
curl http://localhost:4000/api/activities

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@example.com"}'
```

### Test Accounts
- **maria@example.com** - 650 points, Level 4
- **sam@example.com** - 420 points, Level 3
- **sofia@example.com** - 850 points, Level 5

---

## 🚀 Deployment

See **[WHATS_NEXT.md](./WHATS_NEXT.md)** for complete deployment guide including:
- Database migration (SQLite → PostgreSQL)
- Backend deployment (Railway)
- Frontend deployment (Vercel)
- PWA configuration
- Environment variables
- Launch checklist

---

## 🛠️ Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS, Vite, Zustand, React Query  
**Backend:** Node.js, Express, SQLite/PostgreSQL, Redis, JWT  
**Real-time:** Firebase Realtime Database  
**Maps:** Leaflet.js  
**QR:** html5-qrcode  
**Testing:** Jest, Playwright  
**Deployment:** Vercel, Railway, Docker

---

## 📊 Database

**SQLite** (Development)
- 14 tables with relationships
- Auto-triggers for points & badges
- Sample data pre-loaded

**PostgreSQL** (Production)
- Materialized views for leaderboards
- Full-text search capabilities
- Optimized indexes

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🎯 Next Steps

**See [WHATS_NEXT.md](./WHATS_NEXT.md) for the complete action plan!**

**Priority 1 (This Week):**
1. Complete frontend-backend integration (2-3 hours)
2. End-to-end testing (2-3 hours)
3. Fix critical bugs

**Priority 2 (Week 2):**
1. Deploy to production (Railway + Vercel)
2. Setup PWA configuration
3. Configure monitoring & analytics

**Priority 3 (Week 3-4):**
1. Firebase real-time features
2. Push notifications
3. AR photo integration

**Estimated Time to Launch:** 3-4 days of focused work!

---

## 📞 Support

- **Documentation:** See docs in root folder
- **API Docs:** [API_TESTING_COMPLETE.md](./API_TESTING_COMPLETE.md)
- **Issues:** GitHub Issues

---

**Built for Carassauga Festival 2025** 🎉  
**Status:** Backend complete, Frontend ready for integration  
**Last Updated:** February 7, 2026
