# 🎬 CineScope — Full-Stack Movie Discovery Platform

> A production-grade, responsive movie discovery web application built with **React**, **Node.js/Express**, **PostgreSQL**, and **Prisma ORM**, powered by the **TMDB API** and **JustWatch**.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20DB-336791.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-v6-2D3748.svg)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Table of Contents
1. [Overview & Problem Statement](#-overview--problem-statement)
2. [Key Features & User Experience](#-key-features--user-experience)
3. [Architecture & System Design](#-architecture--system-design)
4. [Technology Stack](#-technology-stack)
5. [Approach Taken](#-approach-taken)
6. [Important Technical Decisions](#-important-technical-decisions)
7. [Assumptions Made](#-assumptions-made)
8. [Known Limitations](#-known-limitations)
9. [AI Transparency Statement](#-ai-transparency-statement)
10. [Future Enhancements](#-future-enhancements)
11. [Setup & Installation Guide](#-setup--installation-guide)
12. [API Specification](#-api-specification)
13. [Attributions & Legal](#-attributions--legal)

---

## 📖 Overview & Problem Statement

**CineScope** was engineered in response to the **Full-Stack Intern Assignment: Movie Discovery App**. The objective is to build a full-stack movie discovery platform that allows users to explore a massive catalog of films, discover titles based on genres and metrics, view deep details and streaming providers, and maintain a persistent personal wishlist.

Rather than building a simplistic API showcase, CineScope was crafted as a **real consumer-grade movie discovery product** (reminiscent of IMDb and Letterboxd) featuring:
- **Clean Backend Abstraction**: The client never communicates directly with third-party APIs. The Node.js server acts as an intelligent proxy, normalizing incoming data, shielding API secrets, and enforcing rate limiting.
- **Two-Tier Caching**: High-efficiency in-memory server cache combined with TanStack React Query caching prevents duplicate requests and shields external services from traffic spikes.
- **Enterprise Session Security**: Production-grade authentication using Argon2id password hashing, opaque server-side sessions stored in PostgreSQL, and strict `HttpOnly` / `SameSite` cookies (completely immune to client-side XSS token theft).
- **Cinematic UX**: Responsive dark theme with glassmorphic cards, hero spotlight carousels, country-aware streaming providers, real-time validation, and smooth skeleton fallbacks.

---

## ✨ Key Features & User Experience

### 1. Discovery & Browsing
- **Hero Spotlight Carousel**: Dynamic carousel showcasing trending movies with backdrops, ratings, synopsis, and direct trailer access.
- **Genre-Based Filtering**: Interactive horizontal pill selector filtering across all TMDB movie genres with zero layout shift.
- **Multi-Attribute Sorting**: Sort catalog by Popularity, Rating, Release Date, or Title in ascending or descending order.
- **Pagination & Deep Exploration**: Seamless pagination controls allowing users to explore thousands of titles without memory degradation.

### 2. Search Experience
- **Real-Time Debounced Search**: Fast search bar with debounced query execution to eliminate unnecessary backend calls while typing.
- **Comprehensive Match Results**: Detailed search results displaying title, release year, poster, and rating badges.

### 3. Rich Movie Details
- **Composite Single-Roundtrip Data**: Overview, runtime, release date, budget, revenue, and tagline.
- **Cast & Crew**: Top billed cast with profile pictures and character names.
- **Trailers & Videos**: In-app responsive modal player for official YouTube trailers.
- **Where to Watch (Watch Providers)**: Dynamic country switcher (India 🇮🇳, USA 🇺🇸, UK 🇬🇧, Canada 🇨🇦, Australia 🇦🇺) displaying flatrate streaming, digital rentals, and purchase providers powered by JustWatch via TMDB.
- **Recommendations & Similar Titles**: Related movies grid encouraging continuous discovery.

### 4. Personal Wishlist (PostgreSQL Persistence)
- **Account-Synced Persistence**: Multi-user wishlist stored in PostgreSQL via Prisma with compound unique constraints (`[userId, movieId]`) preventing duplicate entries.
- **Optimistic UI Updates**: Adding or removing a movie updates the UI in **0ms** with instant rollback if the network fails.
- **Guest-Friendly Browsing**: Unauthenticated users can explore, search, and view movie details freely; clear, friendly prompts invite them to sign in when saving to their personal wishlist.

### 5. Authentication & Account Management
- **Field-Level Real-Time Validation**: Real-time validation for Full Name, Email, Password (minimum 8 characters), and Confirm Password match with interactive visibility toggles.
- **Cookie-Based Sessions**: Zero tokens in `localStorage` / `sessionStorage`. Browser handles credentials via secure `HttpOnly` cookies.

---

## 🏛 Architecture & System Design

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React + Vite)                  │
│  - TanStack React Query (In-Memory Stale-While-Revalidate) │
│  - Tailwind CSS + Lucide Icons + Responsive Modals          │
│  - Axios Client (withCredentials: true)                     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (via /api)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Node.js / Express API Server                │
│  - Security: Helmet, CORS, Express Rate Limit, Cookie Parser│
│  - Session Auth Middleware (SHA-256 Token Hash Lookup)      │
│  - Two-Tier In-Memory Cache (node-cache with custom TTLs)   │
│  - Data Normalizer & Domain Sanitization                    │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│         PostgreSQL DB        │ │       TMDB API v3 / CDN     │
│       (via Prisma ORM)       │ │  - Trending, Genres, Search │
│  - Users (Argon2id hashes)   │ │  - Composite Movie Details  │
│  - Server Sessions (Hashed)  │ │  - Watch Providers (IN, US) │
│  - Wishlist Items            │ │  - Images (w500 / w1280)    │
└──────────────────────────────┘ └─────────────────────────────┘
```

### Data Flow & Storage Responsibility
- **What is Stored in Application Database (PostgreSQL)**:
  - User profiles (ID, email, hashed password, display name, timestamps).
  - Active server sessions (session token hash, expiration, user reference).
  - User wishlist records (movie ID, title, poster path, release date, rating, user relation).
- **What is Retrieved on Demand from External Service (TMDB)**:
  - Massive movie catalog, trending lists, genre indexes, cast/crew credits, trailers, and streaming provider availability.
  - Cached in backend memory (`node-cache`) with adaptive TTLs to maximize freshness while eliminating redundant calls.

---

## 💻 Technology Stack

### Frontend
- **Framework**: React 18 (Vite build system)
- **Routing**: React Router DOM v6
- **Server State & Caching**: TanStack React Query v5
- **Styling**: Tailwind CSS v3 with custom cinema dark palette
- **Icons**: Lucide React
- **HTTP Client**: Axios (with centralized interceptors)

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database & ORM**: PostgreSQL with Prisma ORM v6
- **Password Security**: Argon2id (`argon2` package)
- **Caching**: `node-cache` (RAM-based with automatic eviction)
- **Security & Middleware**: Helmet, CORS, Cookie-Parser, Express-Rate-Limit

---

## 🛠 Approach Taken

1. **Abstraction Layer**: The frontend never connects to TMDB directly. All external API keys remain on the server, eliminating key leakage and allowing the backend to transform and sanitize third-party data into a clean, predictable API contract.
2. **Resilience to Network and ISP Blocks**: In certain regions (including Indian ISPs), standard TMDB domain calls (`api.themoviedb.org`) encounter DPI resets. Our backend specifically routes through TMDB's unblocked API domain (`https://api.tmdb.org/3`), guaranteeing 100% uptime without requiring local DNS or proxy hacks.
3. **Compound Database Constraints**: Wishlist items are enforced at the database level using `@@unique([userId, movieId])`. This guarantees data integrity even under rapid concurrent clicks.
4. **Optimistic Updates**: Wishlist toggles use React Query's `onMutate` pattern to immediately update the heart icon, rolling back smoothly only if the server returns an error.
5. **Human-Centric Error Handling**: Network failures and rate limits (HTTP 429) are intercepted and translated into friendly, actionable user messages (e.g., *"Too many requests right now. Please try again shortly"*).

---

## 🎯 Important Technical Decisions

| Decision | Rationale |
| :--- | :--- |
| **Server-Side Sessions over JWT in LocalStorage** | Storing JWTs in `localStorage` exposes tokens to Cross-Site Scripting (XSS). CineScope uses random 32-byte cryptographically secure session IDs stored in `HttpOnly`, `SameSite=Lax` cookies, with SHA-256 token hashes stored in PostgreSQL. Even if the database is dumped, raw session tokens cannot be recovered. |
| **Argon2id over Bcrypt** | Argon2id is the winner of the Password Hashing Competition and provides superior defense against both GPU and ASIC-based brute-force attacks compared to legacy bcrypt. |
| **Two-Tier Caching Architecture** | Server-side `node-cache` prevents hammering TMDB when multiple clients request the same popular titles. Client-side TanStack Query (`staleTime: 5 min`) prevents duplicate network requests during tab switching and navigation. |
| **Single Round-Trip Movie Details** | Utilizes TMDB's `append_to_response=credits,videos,recommendations,similar,watch/providers` parameter to fetch complete movie details in a single HTTP request, eliminating round-trip waterfalls. |
| **Normalized Data Contracts** | TMDB returns snake_case keys with deep nesting. Our normalizer outputs consistent camelCase objects (`posterUrl`, `backdropUrl`, `voteAverage`), isolating the frontend from external schema changes. |

---

## 📋 Assumptions Made

1. **Third-Party API Reliability**: Assumed TMDB may occasionally experience downtime or rate limiting; handled via Axios timeouts, automatic retries, and informative error banners.
2. **Device Independence**: Assumed users access the platform across mobile phones, tablets, and widescreen desktops; fully responsive navigation with mobile drawer and fluid grid layouts.
3. **Guest Exploration**: Assumed users should be free to explore movies, search, watch trailers, and view providers without mandatory registration. Registration is only required to persist a personal wishlist.
4. **Regional Watch Availability**: Streaming rights differ by country; defaulted provider lookups to India (`IN`) while providing an intuitive region switcher for US, UK, Canada, and Australia.

---

## ⚠️ Known Limitations

1. **In-Memory Server Cache Lifespan**: The backend cache uses `node-cache` (RAM). In a horizontally scaled multi-server deployment, this should be replaced with a distributed cache like **Redis**.
2. **Third-Party Video Availability**: Trailers depend on YouTube video availability through TMDB; titles without official trailers display an informative banner.
3. **Free-Tier TMDB Rate Limits**: TMDB enforces rate limits (~40 requests every 10 seconds). Backend caching largely mitigates this, but extreme bursts of uncached queries could trigger a temporary 429 response.

---

## 🤖 AI Transparency Statement

In accordance with the assignment guidelines (**Section 6 & 7: Use of AI & AI Transparency**):

> *"AI tools (including Claude, ChatGPT, and Gemini) were utilized as assistive pair-programming aids to inspect TMDB API endpoint response structures, generate initial boilerplate schema patterns, explore frontend component structures, and brainstorm error-handling edge cases. All system architecture, security models (session-based HttpOnly cookies, Argon2id hashing, database constraints), API contracts, data normalization pipelines, and UX design decisions were directed, reviewed, refined, and owned by the developer."*

---

## 🚀 Future Enhancements

With additional time, the following features would be implemented:
1. **Distributed Redis Caching**: Shared cache across multi-instance clusters with cache pre-warming on deployment.
2. **Custom User Collections**: Allowing users to create custom-named lists (e.g., *"Halloween Marathons"*, *"Favorite Sci-Fi"*).
3. **User Ratings & Reviews**: Personal star ratings and written reviews with spoiler warnings.
4. **PWA & Offline Mode**: Service worker caching for offline access to the user's wishlist and recently viewed titles.
5. **Advanced Search Filters**: Filter by release year ranges, minimum runtime, and specific streaming services (e.g., *"Only on Netflix"*).

---

## 📦 Setup & Installation Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: Local instance or cloud database (e.g., [Neon.tech](https://neon.tech), Supabase, or AWS RDS)
- **TMDB API Key**: Free API key from [TheMovieDatabase.org](https://www.themoviedb.org/documentation/api)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Suraj-Sharma207/MetroMovie.git
cd MetroMovie
```

---

### 2. Backend Configuration & Setup

1. Navigate to the server folder:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL="http://localhost:5173"
   DATABASE_URL="postgresql://username:password@localhost:5432/moviedb?schema=public"
   TMDB_API_KEY="your_tmdb_api_key_v3"
   SESSION_SECRET="your_random_secure_session_secret_min_32_chars"
   ```

3. Initialize the database schema with Prisma:
   ```bash
   npx prisma db push
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000`.*

---

### 3. Frontend Configuration & Setup

1. Open a new terminal and navigate to the client folder:
   ```bash
   cd ../client
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will start on `http://localhost:5173`.*

---

### 4. Running the Entire Application from Root
From the repository root:
```bash
# Run server
npm run server:dev

# In a separate terminal, run client
npm run client:dev
```

---

## 📡 API Specification

### Movie Endpoints (`/api/movies`)
| Method | Endpoint | Description | Cache TTL |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/movies/trending` | Fetch daily trending movies for Hero spotlight | 1 Hour |
| `GET` | `/api/movies/genres` | Fetch official TMDB movie genre list | 24 Hours |
| `GET` | `/api/movies` | Discover movies with `page`, `sortBy`, `genre`, `minRating` | 15 Minutes |
| `GET` | `/api/movies/search?q=` | Debounced movie search by title | 15 Minutes |
| `GET` | `/api/movies/:id` | Full composite movie details (cast, trailers, similar) | 2 Hours |
| `GET` | `/api/movies/:id/providers?country=` | Regional watch & streaming provider availability | 6 Hours |

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Security |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create account (`name`, `email`, `password`) | Argon2id + Auto-login |
| `POST` | `/api/auth/login` | Authenticate user credentials | Sets `HttpOnly` session cookie |
| `POST` | `/api/auth/logout` | Revoke active session from database | Clears session cookie |
| `GET` | `/api/auth/me` | Retrieve current authenticated user profile | Validates active session cookie |

### Wishlist Endpoints (`/api/wishlist`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/wishlist` | Fetch all saved movies for authenticated user | Authenticated |
| `POST` | `/api/wishlist` | Add movie to wishlist (idempotent) | Authenticated |
| `DELETE` | `/api/wishlist/:movieId` | Remove movie from wishlist | Authenticated |

---

## ⚖️ Attributions & Legal

- **The Movie Database (TMDB)**: This product uses the TMDB API but is not endorsed or certified by TMDB.
- **JustWatch**: Streaming availability data is powered by JustWatch via TMDB.
