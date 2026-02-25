# AqarNow — Real Estate Mobile App

A production-ready real estate mobile application for the Middle East market, built with **React Native (Expo)** and **Node.js/Express/MongoDB**.

---

## Tech Stack

| Layer   | Technologies                                                                   |
| ------- | ------------------------------------------------------------------------------ |
| Mobile  | Expo ~52, Expo Router v4 (file-based navigation)                               |
| UI      | NativeWind v4 (Tailwind CSS), Moti animations, Expo Linear Gradient, Expo Blur |
| State   | Zustand v5                                                                     |
| Backend | Node.js, Express v4, MongoDB/Mongoose v8                                       |
| Auth    | Phone + OTP (Twilio SMS), JWT                                                  |
| HTTP    | Axios with interceptors                                                        |
| Storage | expo-secure-store (token persistence)                                          |

---

## Project Structure

```
AqarNow/
├── backend/
│   ├── server.js               # Express entry point
│   ├── .env.example            # Environment variables template
│   ├── seed/
│   │   └── seedData.js         # 10 cities + sample properties
│   └── src/
│       ├── config/
│       │   └── db.js           # MongoDB connection
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── propertyController.js
│       │   ├── favoriteController.js
│       │   └── cityController.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   └── errorHandler.js
│       ├── models/
│       │   ├── User.js
│       │   ├── OTP.js
│       │   ├── Property.js
│       │   ├── Favorite.js
│       │   └── City.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── propertyRoutes.js
│       │   ├── favoriteRoutes.js
│       │   └── cityRoutes.js
│       └── utils/
│           ├── generateToken.js
│           └── otpService.js
│
└── mobile/
    ├── app/
    │   ├── _layout.tsx         # Root layout + auth initialization
    │   ├── index.tsx           # Conditional redirect (onboarding/auth/tabs)
    │   ├── onboarding.tsx      # 3-slide animated onboarding
    │   ├── (auth)/
    │   │   ├── _layout.tsx
    │   │   ├── login.tsx       # Phone number + country picker
    │   │   └── otp.tsx         # 6-digit OTP auto-submit
    │   ├── (tabs)/
    │   │   ├── _layout.tsx     # Bottom tab navigator
    │   │   ├── index.tsx       # Home screen
    │   │   ├── search.tsx      # Debounced search + suggestions
    │   │   ├── favorites.tsx   # Saved properties
    │   │   └── profile.tsx     # User profile
    │   └── property/
    │       └── [id].tsx        # Property details with image slider
    ├── components/
    │   ├── PropertyCard.tsx    # List + featured card variants
    │   └── FilterSheet.tsx     # Bottom sheet filters
    ├── constants/
    │   ├── Colors.ts
    │   └── theme.ts
    ├── hooks/
    │   └── useDebounce.ts
    ├── services/
    │   └── api.ts              # Axios instance + API functions
    ├── store/
    │   ├── authStore.ts
    │   ├── propertyStore.ts
    │   └── favoriteStore.ts
    └── types/
        └── index.ts
```

---

## Backend Setup

### Prerequisites

- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Twilio account for SMS OTP (or use dev bypass)

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/aqarnow
# or Atlas: mongodb+srv://<user>:<pass>@cluster.mongodb.net/aqarnow

# JWT
JWT_SECRET=your_super_secret_key_change_in_prod
JWT_EXPIRES_IN=30d

# Twilio SMS (optional in dev)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Dev bypass — set true to skip Twilio, returns OTP code in JSON
OTP_BYPASS=true
```

### 3. Seed sample data

```bash
npm run seed
```

This inserts 10 cities (Riyadh, Jeddah, Dubai, Doha, Kuwait City, etc.) and 6 sample properties.

### 4. Start the backend

```bash
npm run dev    # Development with nodemon
npm start      # Production
```

Server runs at `http://localhost:5000`

---

## Mobile Setup

### Prerequisites

- Node.js v18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS or Android)

### 1. Install dependencies

```bash
cd mobile
npm install
```

### 2. Configure environment

Create `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:5000/api
```

> Replace `<YOUR_LOCAL_IP>` with your machine's LAN IP (e.g., `192.168.1.100`). You can find it with `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

### 3. Start Expo

```bash
npx expo start
```

Scan the QR code with Expo Go or press `i`/`a` for iOS/Android simulators.

---

## API Reference

### Authentication

| Method | Endpoint               | Auth   | Description              |
| ------ | ---------------------- | ------ | ------------------------ |
| POST   | `/api/auth/send-otp`   | —      | Send OTP to phone number |
| POST   | `/api/auth/verify-otp` | —      | Verify OTP, returns JWT  |
| GET    | `/api/auth/me`         | Bearer | Get current user         |
| PUT    | `/api/auth/profile`    | Bearer | Update profile           |

**Send OTP request:**

```json
{ "phone": "+966501234567" }
```

**Verify OTP request:**

```json
{ "phone": "+966501234567", "otp": "123456" }
```

> In development (`OTP_BYPASS=true`), the send-otp response includes `"devCode": "123456"`.

---

### Properties

| Method | Endpoint                         | Auth   | Description                    |
| ------ | -------------------------------- | ------ | ------------------------------ |
| GET    | `/api/properties`                | —      | List with filters + pagination |
| GET    | `/api/properties/:id`            | —      | Property details               |
| GET    | `/api/properties/featured`       | —      | Featured properties            |
| GET    | `/api/properties/suggestions?q=` | —      | Search suggestions             |
| POST   | `/api/properties`                | Bearer | Create property                |
| PUT    | `/api/properties/:id`            | Bearer | Update (owner only)            |
| DELETE | `/api/properties/:id`            | Bearer | Delete (owner only)            |

**Filter query params:**

```
?city=<id>
&listingType=rent|sale|buy
&propertyType=villa|apartment|studio|office|land|chalet
&minPrice=100000&maxPrice=2000000
&minRooms=2&maxRooms=6
&minArea=80&maxArea=500
&viewType=sea|city|garden|mountain|street
&amenities=pool,gym,parking
&search=<text>
&page=1&limit=10
&sort=-createdAt (default) | price | -price | -viewsCount
```

---

### Favorites

| Method | Endpoint                     | Auth   | Description                              |
| ------ | ---------------------------- | ------ | ---------------------------------------- |
| GET    | `/api/favorites`             | Bearer | List user's favorites (paginated)        |
| POST   | `/api/favorites/:propertyId` | Bearer | Toggle favorite (add/remove)             |
| POST   | `/api/favorites/check`       | Bearer | Batch check `{ propertyIds: [id, ...] }` |

---

### Cities

| Method | Endpoint      | Auth  | Description            |
| ------ | ------------- | ----- | ---------------------- |
| GET    | `/api/cities` | —     | List all active cities |
| POST   | `/api/cities` | Admin | Create a city          |

---

## Key Features

- **Phone + OTP Authentication** — Twilio SMS with 10-minute expiry and attempt limiting
- **Onboarding** — 3-slide animated onboarding with Moti animations (shown only once)
- **Home Screen** — Featured carousel + property list with listing type filter pills
- **Advanced Filtering** — Bottom sheet with type, price range, bedrooms, view type, amenities
- **Debounced Search** — Real-time suggestions with 400ms debounce
- **Property Details** — Full image slider, collapsible blur header, agent contact
- **Favorites** — Optimistic toggle with Set-based state for instant UI feedback
- **JWT Persistence** — Token stored in expo-secure-store, auto-attached via Axios interceptor

---

## Environment Variables Reference

### Backend `.env`

| Variable              | Required              | Description                   |
| --------------------- | --------------------- | ----------------------------- |
| `PORT`                | No (default 5000)     | Server port                   |
| `NODE_ENV`            | Yes                   | `development` or `production` |
| `MONGO_URI`           | Yes                   | MongoDB connection string     |
| `JWT_SECRET`          | Yes                   | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN`      | No (default 30d)      | JWT expiry duration           |
| `TWILIO_ACCOUNT_SID`  | If `OTP_BYPASS=false` | Twilio account SID            |
| `TWILIO_AUTH_TOKEN`   | If `OTP_BYPASS=false` | Twilio auth token             |
| `TWILIO_PHONE_NUMBER` | If `OTP_BYPASS=false` | Twilio sender phone           |
| `OTP_BYPASS`          | No                    | `true` to skip Twilio in dev  |

### Mobile `.env`

| Variable              | Required | Description          |
| --------------------- | -------- | -------------------- |
| `EXPO_PUBLIC_API_URL` | Yes      | Backend API base URL |

---

## License

MIT

---

## Admin Dashboard

A React + Vite web application for managing the platform.

### Features

| Section        | Capabilities                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Dashboard**  | Overview stats (users, properties, views, favorites), activity bar chart (7 days), property type pie chart, top cities ranking |
| **Properties** | Paginated table, search, filter by status/listing type, toggle featured ⭐, toggle verified ✅, toggle active/inactive, delete |
| **Users**      | Paginated table, search, filter by role, edit role (user/agent), suspend/activate, delete (cascades properties + favorites)    |
| **Cities**     | Full CRUD — create with EN + AR names, edit, toggle active, delete (protected if city has properties)                          |

### Admin Setup

```bash
cd admin
npm install
```

Create `admin/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start dev server:

```bash
npm run dev     # http://localhost:3001
```

Build for production:

```bash
npm run build   # outputs to admin/dist/
```

**Default admin credentials** (created by `npm run seed`):

- Email: `admin@aqarnow.com`
- Password: `Admin@AqarNow2025`

> Change these via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` before running seed in production.

---

## Admin API Reference

All admin routes are prefixed `/api/admin`. Except `POST /login`, all require `Authorization: Bearer <token>` with an admin-role JWT.

| Method | Endpoint                    | Description                                  |
| ------ | --------------------------- | -------------------------------------------- |
| POST   | `/api/admin/login`          | Admin email+password login                   |
| GET    | `/api/admin/stats`          | Dashboard overview + chart data              |
| GET    | `/api/admin/users`          | List users (paginated, search, role filter)  |
| GET    | `/api/admin/users/:id`      | User detail with counts                      |
| PUT    | `/api/admin/users/:id`      | Update role / isActive                       |
| DELETE | `/api/admin/users/:id`      | Delete user + cascade                        |
| GET    | `/api/admin/properties`     | List properties (paginated, search, filters) |
| PATCH  | `/api/admin/properties/:id` | Update status / isFeatured / isVerified      |
| DELETE | `/api/admin/properties/:id` | Delete property                              |
| GET    | `/api/admin/cities`         | List all cities with live counts             |
| POST   | `/api/admin/cities`         | Create city                                  |
| PUT    | `/api/admin/cities/:id`     | Update city                                  |
| DELETE | `/api/admin/cities/:id`     | Delete city (fails if has properties)        |

---

## Deploying to Render

The project ships with a `render.yaml` Blueprint that deploys **two services** automatically:

| Service         | Type                  | Name            |
| --------------- | --------------------- | --------------- |
| Backend API     | Web Service (Node.js) | `aqarnow-api`   |
| Admin Dashboard | Static Site           | `aqarnow-admin` |

### Step-by-step

**1. Create a MongoDB Atlas cluster (free M0 tier)**

- Go to [cloud.mongodb.com](https://cloud.mongodb.com)
- Create a cluster → Get the connection string → Allow access from `0.0.0.0/0`

**2. Push code to GitHub**

```bash
git init
git add .
git commit -m "Initial AqarNow commit"
git remote add origin https://github.com/<you>/aqarnow.git
git push -u origin main
```

**3. Create Render account + connect repo**

- Go to [render.com](https://render.com) → New → Blueprint
- Connect your GitHub repo
- Render detects `render.yaml` automatically

**4. Set environment variables in the Render dashboard**

For **`aqarnow-api`** (Web Service), add these env vars under _Environment_:

| Variable              | Value                                                    |
| --------------------- | -------------------------------------------------------- |
| `MONGO_URI`           | Your Atlas connection string                             |
| `JWT_SECRET`          | Any long random string (or use Render's "Generate")      |
| `TWILIO_ACCOUNT_SID`  | From Twilio console (or leave blank if using OTP_BYPASS) |
| `TWILIO_AUTH_TOKEN`   | From Twilio console                                      |
| `TWILIO_PHONE_NUMBER` | Your Twilio number                                       |
| `OTP_BYPASS`          | `false` for production, `true` for testing               |
| `ADMIN_EMAIL`         | e.g. `admin@yourdomain.com`                              |
| `ADMIN_PASSWORD`      | Strong password                                          |

**5. Seed production database**

After the backend deploys, open the Render Shell for `aqarnow-api` and run:

```bash
npm run seed
```

This creates the admin user with the credentials you set in env vars.

**6. Admin dashboard URL**

Render will provide a `.onrender.com` URL for `aqarnow-admin`. Open it and login with your admin credentials.

**7. Update mobile app API URL**

In `mobile/.env`, change the API URL to your Render backend:

```env
EXPO_PUBLIC_API_URL=https://aqarnow-api.onrender.com/api
```

### Cost

Both services fit within Render's **free tier** (750 hours/month per service). MongoDB Atlas M0 is also free. For production workloads, upgrade to the $7/month Starter plan for always-on services.

---

## Project Structure (Complete)

```
AqarNow/
├── render.yaml                 # Render Blueprint (IaC deployment)
├── README.md
│
├── backend/                    # Node.js / Express / MongoDB API
│   ├── server.js
│   ├── .env.example
│   ├── seed/seedData.js
│   └── src/
│       ├── config/db.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── propertyController.js
│       │   ├── favoriteController.js
│       │   ├── cityController.js
│       │   └── adminController.js  ← NEW
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       │   └── adminRoutes.js      ← NEW
│       └── utils/
│
├── admin/                      # React + Vite Admin Dashboard
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── App.tsx
│       ├── components/
│       │   ├── Layout.tsx
│       │   ├── Sidebar.tsx
│       │   ├── StatsCard.tsx
│       │   ├── DataTable.tsx
│       │   ├── Modal.tsx
│       │   └── ConfirmDialog.tsx
│       ├── hooks/useDebounce.ts
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Properties.tsx
│       │   ├── Users.tsx
│       │   └── Cities.tsx
│       ├── services/api.ts
│       ├── store/authStore.ts
│       └── types/index.ts
│
└── mobile/                     # React Native / Expo Mobile App
    └── ...
```
