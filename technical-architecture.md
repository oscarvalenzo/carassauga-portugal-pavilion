# Carassauga Connect - Technical Architecture & Development Guide
## Portugal Pavilion Digital Experience Platform

---

## 🏗️ **System Architecture Overview**

### **High-Level Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  iOS Safari  │  │ Android      │  │  Desktop     │          │
│  │  (PWA)       │  │  Chrome      │  │  Browsers    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                          │                                       │
│                          ▼                                       │
│            ┌──────────────────────────────┐                      │
│            │   Progressive Web App (PWA)  │                      │
│            │   - React 18.2+              │                      │
│            │   - Service Workers          │                      │
│            │   - Local Storage/IndexedDB  │                      │
│            └──────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              API Gateway (Express.js / Fastify)          │   │
│  │  - Authentication Middleware                              │   │
│  │  - Rate Limiting                                          │   │
│  │  - Request Validation                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│          │              │              │             │           │
│          ▼              ▼              ▼             ▼           │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐     │
│  │Quest       │ │Location    │ │Notification│ │Analytics │     │
│  │Service     │ │Service     │ │Service     │ │Service   │     │
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘     │
│          │              │              │             │           │
└──────────┼──────────────┼──────────────┼─────────────┼──────────┘
           │              │              │             │
           ▼              ▼              ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │  Redis       │  │  Firebase    │          │
│  │  (Primary)   │  │  (Cache)     │  │  Realtime DB │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  AWS S3      │  │  CloudFlare  │  │  Mixpanel    │          │
│  │  (Storage)   │  │  (CDN)       │  │  (Analytics) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 **Frontend Technical Stack**

### **Core Technologies:**

#### **1. React 18.2+ (UI Framework)**
**Why React?**
- Component reusability across screens
- Large ecosystem of libraries (AR.js, QR scanners)
- Strong PWA support
- Excellent performance with Virtual DOM
- Team familiarity (assumed)

**Key Libraries:**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "zustand": "^4.3.2",
  "react-query": "^3.39.3"
}
```

#### **2. Progressive Web App (PWA) Infrastructure**
**Service Worker Implementation:**
```javascript
// service-worker.js
const CACHE_NAME = 'carassauga-v1.0.0';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/bundle.js',
  '/manifest.json',
  '/icons/icon-192x192.png'
];

// Cache-first strategy for static assets
// Network-first for API calls
```

**manifest.json Configuration:**
```json
{
  "short_name": "Carassauga",
  "name": "Carassauga Portugal Pavilion",
  "icons": [
    {
      "src": "icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#2d7f3e",
  "background_color": "#ffffff"
}
```

#### **3. State Management: Zustand**
**Why Zustand over Redux?**
- Simpler API, less boilerplate
- Better TypeScript support
- Smaller bundle size (1.2KB vs Redux 11KB)
- Perfect for medium-complexity apps

**Example Store:**
```javascript
// stores/questStore.js
import create from 'zustand';
import { persist } from 'zustand/middleware';

export const useQuestStore = create(
  persist(
    (set, get) => ({
      points: 0,
      completedActivities: [],
      badges: [],
      
      addPoints: (amount) => set((state) => ({ 
        points: state.points + amount 
      })),
      
      completeActivity: (activityId) => set((state) => ({
        completedActivities: [...state.completedActivities, {
          id: activityId,
          timestamp: Date.now()
        }]
      })),
      
      unlockBadge: (badgeId) => set((state) => ({
        badges: [...state.badges, badgeId]
      }))
    }),
    {
      name: 'quest-storage',
      getStorage: () => localStorage
    }
  )
);
```

#### **4. UI Component Library: Tailwind CSS + shadcn/ui**
**Why Tailwind?**
- Rapid prototyping
- Consistent design system
- Small production bundle (with PurgeCSS)
- Mobile-first responsive utilities

**Example Component:**
```jsx
// components/QuestCard.jsx
import { Trophy } from 'lucide-react';

export const QuestCard = ({ title, progress, total, icon }) => (
  <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-green-500">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${(progress/total) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 mt-1">{progress}/{total}</span>
      </div>
    </div>
  </div>
);
```

#### **5. Augmented Reality: AR.js / 8th Wall**
**AR.js (Free, Marker-based):**
- Pros: Free, lightweight, works in browser
- Cons: Requires printed markers, less accurate

**8th Wall (Paid, Markerless):**
- Pros: Better tracking, no markers needed, face filters
- Cons: $99/month, requires licensing

**Recommendation for MVP:** AR.js  
**Recommendation for Phase 2:** Upgrade to 8th Wall

**AR.js Example:**
```jsx
import 'aframe';
import 'ar.js';

export const ARPhotoExperience = () => (
  <a-scene embedded arjs>
    <a-marker preset="hiro">
      <a-entity
        gltf-model="url(models/ronaldo.gltf)"
        scale="0.5 0.5 0.5"
        position="0 0 0"
      />
    </a-marker>
    <a-entity camera />
  </a-scene>
);
```

#### **6. QR Code Handling: html5-qrcode**
**Why html5-qrcode?**
- No external dependencies
- Works on all modern browsers
- Good performance on low-end devices

**Implementation:**
```jsx
import { Html5QrcodeScanner } from 'html5-qrcode';

export const QRScanner = ({ onScan }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 }
    );
    
    scanner.render((decodedText) => {
      onScan(decodedText);
      scanner.clear();
    });
    
    return () => scanner.clear();
  }, []);
  
  return <div id="qr-reader" />;
};
```

#### **7. Maps & Location: Leaflet.js + Custom SVG**
**For Interactive Pavilion Map:**
```jsx
import { MapContainer, ImageOverlay, Marker } from 'react-leaflet';

export const PavilionMap = ({ familyLocations }) => {
  const bounds = [[0, 0], [1000, 1000]];
  
  return (
    <MapContainer
      center={[500, 500]}
      zoom={1}
      crs={L.CRS.Simple}
    >
      <ImageOverlay
        url="/maps/portugal-pavilion.svg"
        bounds={bounds}
      />
      {familyLocations.map(loc => (
        <Marker key={loc.id} position={[loc.x, loc.y]} />
      ))}
    </MapContainer>
  );
};
```

---

## 🔧 **Backend Technical Stack**

### **Core Technologies:**

#### **1. Node.js + Express.js (REST API)**
**Why Node.js?**
- Non-blocking I/O perfect for real-time features
- JavaScript full-stack (shared code between frontend/backend)
- Massive ecosystem (npm)
- Excellent WebSocket support

**Alternative: Fastify**
- 2x faster than Express
- Better TypeScript support
- Recommended if performance is critical

**Example API Structure:**
```javascript
// server.js
const express = require('express');
const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/quests', questRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/notifications', notificationRoutes);

app.listen(3000, () => {
  console.log('Carassauga API running on port 3000');
});
```

#### **2. PostgreSQL (Primary Database)**
**Why PostgreSQL?**
- ACID compliance (data integrity)
- Complex queries with JOINs
- JSON support for flexible schemas
- Excellent performance at scale
- Free and open-source

**Database Schema:**
```sql
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  display_name VARCHAR(100),
  family_group_id INT REFERENCES family_groups(id),
  total_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- activities table
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50), -- 'foodie', 'culture', 'futebol', 'social'
  points INT NOT NULL,
  qr_code VARCHAR(255) UNIQUE,
  description TEXT
);

-- user_activities (join table)
CREATE TABLE user_activities (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  activity_id INT REFERENCES activities(id),
  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, activity_id) -- Prevent duplicate completions
);

-- badges table
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  icon_url VARCHAR(255),
  unlock_criteria JSONB -- {'quest': 'foodie', 'activities': 3}
);

-- user_badges
CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  badge_id INT REFERENCES badges(id),
  earned_at TIMESTAMP DEFAULT NOW()
);

-- family_groups
CREATE TABLE family_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- leaderboard (materialized view for performance)
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
  u.id,
  u.display_name,
  u.total_points,
  COUNT(DISTINCT ub.badge_id) as badges_earned,
  RANK() OVER (ORDER BY u.total_points DESC) as rank
FROM users u
LEFT JOIN user_badges ub ON u.id = ub.user_id
GROUP BY u.id, u.display_name, u.total_points
ORDER BY u.total_points DESC;

-- Refresh leaderboard every 15 minutes
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
```

#### **3. Redis (Caching & Real-time Data)**
**Use Cases:**
- Session management
- Real-time queue positions
- Rate limiting
- Leaderboard caching (sorted sets)
- Pub/Sub for live updates

**Example - Virtual Queue:**
```javascript
const Redis = require('ioredis');
const redis = new Redis();

// Add user to queue
async function joinQueue(userId, stationId) {
  const position = await redis.zadd(
    `queue:${stationId}`,
    Date.now(), // Score = timestamp
    userId
  );
  
  const waitTime = await estimateWaitTime(stationId);
  return { position, waitTime };
}

// Get queue position
async function getQueuePosition(userId, stationId) {
  const rank = await redis.zrank(`queue:${stationId}`, userId);
  return rank + 1; // 0-indexed to 1-indexed
}

// Remove from queue when served
async function dequeue(stationId) {
  const nextUser = await redis.zpopmin(`queue:${stationId}`, 1);
  return nextUser;
}
```

#### **4. Firebase Realtime Database (Live Location Tracking)**
**Why Firebase for Location?**
- Sub-second latency
- Automatic synchronization
- Offline support
- Simple security rules
- Free tier sufficient for MVP

**Firebase Structure:**
```json
{
  "locations": {
    "family_123": {
      "user_456": {
        "x": 250,
        "y": 180,
        "timestamp": 1675890000000,
        "battery_level": 85
      },
      "user_789": {
        "x": 280,
        "y": 320,
        "timestamp": 1675890005000,
        "battery_level": 92
      }
    }
  }
}
```

**Security Rules:**
```json
{
  "rules": {
    "locations": {
      "$familyId": {
        ".read": "auth.uid != null && data.child(auth.uid).exists()",
        ".write": "auth.uid != null",
        "$userId": {
          ".validate": "newData.hasChildren(['x', 'y', 'timestamp'])"
        }
      }
    }
  }
}
```

#### **5. AWS S3 (File Storage)**
**Stored Assets:**
- User-uploaded photos
- AR model files (.gltf, .glb)
- Recipe images
- Recap videos

**Bucket Structure:**
```
carassauga-2025/
├── photos/
│   ├── users/
│   │   └── user_123_photo_1.jpg
│   └── ar-experiences/
│       └── ronaldo_celebration_456.jpg
├── models/
│   ├── ronaldo.glb
│   └── portugal_flag.glb
├── recipes/
│   ├── bacalhau.jpg
│   └── pasteis-de-nata.jpg
└── recap-videos/
    └── user_123_recap.mp4
```

**S3 Configuration:**
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'us-east-1'
});

async function uploadPhoto(file, userId) {
  const params = {
    Bucket: 'carassauga-2025',
    Key: `photos/users/${userId}_${Date.now()}.jpg`,
    Body: file.buffer,
    ContentType: 'image/jpeg',
    ACL: 'public-read'
  };
  
  const result = await s3.upload(params).promise();
  return result.Location; // Public URL
}
```

---

## 🔐 **Authentication & Security**

### **Auth Strategy: JWT (JSON Web Tokens)**

**Why JWT?**
- Stateless (no server-side session storage)
- Works across multiple servers (scalable)
- Mobile-friendly
- Industry standard

**Flow:**
```
1. User scans QR code → Redirected to app
2. User creates profile (email optional)
3. Server generates JWT token
4. Token stored in localStorage
5. Token included in all API requests (Authorization header)
6. Server validates token on each request
```

**JWT Implementation:**
```javascript
const jwt = require('jsonwebtoken');

// Generate token
function generateToken(userId) {
  return jwt.sign(
    { userId, role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Middleware to verify token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Protected route example
app.get('/api/profile', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user);
});
```

### **Security Best Practices:**

1. **Input Validation (Joi library):**
```javascript
const Joi = require('joi');

const activitySchema = Joi.object({
  activityId: Joi.number().integer().required(),
  qrCode: Joi.string().length(32).required()
});

app.post('/api/complete-activity', async (req, res) => {
  const { error, value } = activitySchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  
  // Process validated data...
});
```

2. **Rate Limiting (express-rate-limit):**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);
```

3. **CORS Configuration:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: ['https://carassauga.com', 'http://localhost:3000'],
  credentials: true
}));
```

4. **SQL Injection Prevention (Parameterized Queries):**
```javascript
// BAD - Vulnerable to SQL injection
const query = `SELECT * FROM users WHERE email = '${email}'`;

// GOOD - Parameterized query
const query = {
  text: 'SELECT * FROM users WHERE email = $1',
  values: [email]
};
```

5. **Environment Variables (.env):**
```
# .env file (NEVER commit to Git)
DATABASE_URL=postgresql://user:pass@localhost:5432/carassauga
JWT_SECRET=super_secret_key_change_in_production
AWS_ACCESS_KEY=AKIA...
AWS_SECRET_KEY=wJalr...
REDIS_URL=redis://localhost:6379
FIREBASE_API_KEY=AIza...
```

---

## 📱 **Push Notifications**

### **Firebase Cloud Messaging (FCM)**

**Implementation:**
```javascript
// server-side
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sendNotification(userId, message) {
  const user = await User.findById(userId);
  const fcmToken = user.fcm_token;
  
  const payload = {
    notification: {
      title: 'Fado Performance Starting Soon!',
      body: 'Main stage in 10 minutes. Don\'t miss it!',
      icon: '/icons/icon-192x192.png'
    },
    data: {
      type: 'performance_reminder',
      performanceId: '123'
    }
  };
  
  await admin.messaging().sendToDevice(fcmToken, payload);
}

// Scheduled notifications (node-cron)
const cron = require('node-cron');

cron.schedule('0 */2 * * *', async () => {
  // Every 2 hours, check upcoming performances
  const upcomingPerformances = await getUpcomingPerformances();
  
  for (const performance of upcomingPerformances) {
    const subscribedUsers = await getSubscribedUsers(performance.id);
    for (const user of subscribedUsers) {
      await sendNotification(user.id, performance);
    }
  }
});
```

---

## 📊 **Analytics & Monitoring**

### **1. Mixpanel (User Analytics)**

**Event Tracking:**
```javascript
// Track user actions
mixpanel.track('Activity Completed', {
  distinct_id: userId,
  activity_name: 'Bacalhau à Brás',
  category: 'foodie',
  points_earned: 100,
  time_spent: 45 // seconds
});

mixpanel.track('Badge Unlocked', {
  distinct_id: userId,
  badge_name: 'Master Chef',
  total_badges: 3
});

// User profile properties
mixpanel.people.set(userId, {
  name: 'Maria Santos',
  total_points: 650,
  quests_completed: 2,
  signup_date: '2025-05-10'
});
```

**Key Events to Track:**
1. App opened
2. Activity completed
3. Badge unlocked
4. QR code scanned
5. AR experience tried
6. Recipe saved
7. Social share
8. Leaderboard viewed
9. Push notification clicked
10. App closed

### **2. Sentry (Error Monitoring)**

```javascript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

// Automatic error capture
try {
  await completeActivity(activityId);
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### **3. CloudWatch / Datadog (Infrastructure Monitoring)**

**Metrics to Monitor:**
- API response times
- Database query performance
- Redis cache hit rate
- Server CPU/memory usage
- Active users (concurrent)
- Queue lengths

---

## 🚀 **Deployment & DevOps**

### **Hosting Architecture:**

#### **Frontend: Vercel or Netlify**
**Why Vercel?**
- Automatic HTTPS
- Global CDN
- Zero-config PWA support
- Instant deployments
- Free tier sufficient for MVP

**Deployment:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### **Backend: AWS Elastic Beanstalk or Railway**
**Why Railway?**
- Simpler than AWS for MVP
- Git-based deployments
- Built-in Postgres and Redis
- $5/month per service

**Railway Setup:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

#### **Database: Railway Postgres or AWS RDS**
**For MVP:** Railway Postgres (easier setup)  
**For Production:** AWS RDS (more control, better performance)

### **CI/CD Pipeline (GitHub Actions):**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Run linter
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🧪 **Testing Strategy**

### **1. Unit Tests (Jest + React Testing Library)**
```javascript
// QuestCard.test.jsx
import { render, screen } from '@testing-library/react';
import { QuestCard } from './QuestCard';

test('displays correct progress', () => {
  render(<QuestCard title="Foodie" progress={2} total={3} />);
  expect(screen.getByText('2/3')).toBeInTheDocument();
});

test('shows completed state when progress equals total', () => {
  render(<QuestCard title="Foodie" progress={3} total={3} />);
  expect(screen.getByText('✓')).toBeInTheDocument();
});
```

### **2. Integration Tests (Supertest for API)**
```javascript
const request = require('supertest');
const app = require('../server');

describe('POST /api/complete-activity', () => {
  it('should award points when valid QR code scanned', async () => {
    const response = await request(app)
      .post('/api/complete-activity')
      .send({ activityId: 1, qrCode: 'abc123' })
      .set('Authorization', 'Bearer valid_token');
    
    expect(response.status).toBe(200);
    expect(response.body.points_earned).toBe(100);
  });
});
```

### **3. End-to-End Tests (Playwright)**
```javascript
const { test, expect } = require('@playwright/test');

test('complete foodie quest flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Scan QR code
  await page.click('[aria-label="Scan QR"]');
  await page.fill('[name="qr-input"]', 'foodie_activity_1');
  
  // Verify points awarded
  await expect(page.locator('.points-counter')).toHaveText('100');
  
  // Check badge unlocked
  await page.click('[aria-label="Profile"]');
  await expect(page.locator('.badge-name')).toHaveText('Master Chef');
});
```

---

## 📈 **Performance Optimization**

### **1. Code Splitting (React.lazy)**
```javascript
import React, { lazy, Suspense } from 'react';

const QuestScreen = lazy(() => import('./screens/QuestScreen'));
const MapScreen = lazy(() => import('./screens/MapScreen'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/quests" element={<QuestScreen />} />
        <Route path="/map" element={<MapScreen />} />
      </Routes>
    </Suspense>
  );
}
```

### **2. Image Optimization**
- Use WebP format (50% smaller than JPEG)
- Lazy load images below fold
- Responsive images (srcset)
- CloudFlare CDN for static assets

### **3. Bundle Size Reduction**
```bash
# Analyze bundle
npm install --save-dev webpack-bundle-analyzer
npm run build -- --stats

# Tree shaking (remove unused code)
# Use ES6 imports, avoid `require()`
```

### **4. Database Query Optimization**
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_completed_at ON user_activities(completed_at);

-- Use EXPLAIN ANALYZE to identify slow queries
EXPLAIN ANALYZE SELECT * FROM users WHERE total_points > 500;
```

---

## 📦 **Third-Party Integrations**

### **Required Services:**

| Service | Purpose | Free Tier | Paid Plan |
|---------|---------|-----------|-----------|
| Firebase | Auth, Realtime DB, FCM | 10GB storage, 50K daily reads | $25/month (Blaze) |
| AWS S3 | File storage | 5GB, 20K requests/month | ~$10/month |
| Vercel | Frontend hosting | Unlimited bandwidth | $20/month (Pro) |
| Railway | Backend + DB hosting | $5 credit | $5/service/month |
| Mixpanel | Analytics | 100K events/month | $25/month |
| Sentry | Error tracking | 5K errors/month | $26/month |
| Twilio | SMS notifications | $15 credit | Pay-as-you-go |

**Estimated Monthly Cost (MVP):** $50-$100

---

## 🔧 **Development Setup Guide**

### **Prerequisites:**
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Git

### **Local Setup:**

```bash
# 1. Clone repository
git clone https://github.com/carassauga/portugal-pavilion-app.git
cd portugal-pavilion-app

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Setup database
createdb carassauga_dev
npm run migrate

# 5. Seed test data
npm run seed

# 6. Start Redis
redis-server

# 7. Start development servers
npm run dev:client  # Frontend on port 3000
npm run dev:server  # Backend on port 4000

# 8. Run tests
npm test
```

---

## 📚 **API Documentation**

### **Endpoint Overview:**

#### **Authentication:**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
```

#### **Users:**
```
GET    /api/users/me
PUT    /api/users/me
GET    /api/users/:id/stats
POST   /api/users/family-group
```

#### **Quests:**
```
GET    /api/quests
GET    /api/quests/:id
POST   /api/quests/complete-activity
GET    /api/quests/progress
```

#### **Leaderboard:**
```
GET    /api/leaderboard/family
GET    /api/leaderboard/pavilion
GET    /api/leaderboard/global
```

#### **Locations:**
```
POST   /api/locations/update
GET    /api/locations/family/:familyId
```

#### **Notifications:**
```
POST   /api/notifications/register-device
GET    /api/notifications/preferences
PUT    /api/notifications/preferences
```

### **Example API Request:**

**POST /api/quests/complete-activity**
```bash
curl -X POST https://api.carassauga.com/quests/complete-activity \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "activityId": 3,
    "qrCode": "foodie_bacalhau_a123"
  }'
```

**Response:**
```json
{
  "success": true,
  "points_earned": 100,
  "total_points": 350,
  "activity": {
    "id": 3,
    "name": "Try Bacalhau à Brás",
    "category": "foodie"
  },
  "badges_unlocked": [],
  "message": "Great job! 1 more activity to unlock Master Chef badge."
}
```

---

## 🎯 **Performance Benchmarks**

### **Target Metrics:**

| Metric | Target | Tool to Measure |
|--------|--------|-----------------|
| Page Load Time | <2 seconds | Lighthouse |
| Time to Interactive | <3 seconds | Lighthouse |
| API Response Time (p95) | <200ms | New Relic |
| Database Query Time | <50ms | pg_stat_statements |
| Concurrent Users Supported | 500+ | Load testing (k6) |
| Lighthouse Score | >90/100 | Chrome DevTools |

### **Load Testing Example (k6):**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100, // 100 virtual users
  duration: '5m',
};

export default function () {
  const res = http.get('https://api.carassauga.com/quests');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

---

## 🚨 **Disaster Recovery & Backup**

### **Database Backups:**
```bash
# Automated daily backups (cron job)
0 2 * * * pg_dump carassauga_prod > /backups/db_$(date +\%Y\%m\%d).sql

# Store backups in S3
aws s3 cp /backups/db_$(date +\%Y\%m\%d).sql s3://carassauga-backups/
```

### **Rollback Strategy:**
1. Keep last 3 production deployments
2. One-click rollback via Vercel/Railway dashboard
3. Database migrations are reversible

---

## 📋 **Development Checklist**

### **Pre-Launch:**
- [ ] All API endpoints tested
- [ ] PWA installable on iOS and Android
- [ ] Offline mode works for core features
- [ ] Push notifications functional
- [ ] QR codes generated and printed
- [ ] Load testing completed (500+ concurrent users)
- [ ] Security audit passed
- [ ] Privacy policy reviewed
- [ ] GDPR compliance (data deletion flow)
- [ ] Analytics tracking verified
- [ ] Error monitoring configured
- [ ] Beta testing with 50+ users
- [ ] Staff training completed

---

**Document Version:** 1.0  
**Last Updated:** February 6, 2026  
**Technical Lead:** [Name]  
**Next Review:** Pre-Launch Code Freeze
