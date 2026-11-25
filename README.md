# CampusConnect
*Connect. Collaborate. Grow Together.*

A university social and academic network: study partners, shared notes, forum, groups, events and messaging.
Built module by module. This is **Phase 1**.

## Build status

| # | Module | Status |
|---|--------|--------|
| 1 | Architecture and setup | Done |
| 2 | Authentication and roles | Done |
| 3 | Dashboard and user profiles | Done |
| 4 | Social feed | Next |
| 5 | Study partner finder | Planned |
| 6 | Resource sharing | Planned |
| 7 | Discussion forum | Planned |
| 8 | Study groups | Planned |
| 9 | Events | Planned |
| 10 | Real-time messaging (Socket.io) | Planned |
| 11 | Notifications | Planned |
| 12 | Admin dashboard (user management, moderation) | Planned (stats view exists) |
| 13 | Security testing and deployment | Planned |

## Run locally

Requirements: Node 18.18+, MongoDB running locally (or an Atlas URI).

```bash
# 1. API
cd server
cp .env.example .env        # then edit secrets if you like
npm install
npm run seed                # demo data (admin, 3 faculty, 12 students)
npm run dev                 # http://localhost:5000/api

# 2. Web app (new terminal)
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

Demo logins (password for all: `Password@123`):
`admin@campusconnect.edu`, `neha.kapoor@campusconnect.edu` (faculty), `aarav.sharma@campusconnect.edu` (student).

**Email in development:** without `SMTP_HOST`, verification and reset links are printed in the API console.
**Images in development:** without Cloudinary keys, uploads are saved to `server/uploads` and served by the API.

## Structure

```
server/src
  config/       env + database
  models/       Mongoose models (User so far)
  middleware/   auth (JWT + roles), validation/sanitizing, rate limits, error handler
  validators/   zod schemas
  controllers/  request handlers
  routes/       REST routes, mounted under /api
  services/     file upload (Cloudinary or local disk)
  seed/         demo data
client/src
  lib/          API client (token refresh), types, hooks
  context/      auth, theme, toasts
  components/   UI kit, app shell, route guards
  pages/        route components
docs/           API and schema notes (grow with each module)
```

## Security in this phase
- bcrypt (cost 12) password hashes; strong password rule.
- Short-lived access JWT (kept in memory) + rotating refresh token in an httpOnly cookie; only SHA-256 hashes of refresh, verification and reset tokens are stored.
- University email domain allow-list (`ALLOWED_EMAIL_DOMAINS`), email verification required before login.
- Role checks happen on the server (`authorize(...)`); the client's route guards are only for UX.
- Every request body is HTML-stripped and validated by zod; unknown fields are dropped (no mass assignment); `express-mongo-sanitize` blocks NoSQL operators.
- Helmet, CORS locked to `CLIENT_URL`, global and per-auth rate limits.
- Uploads: type allow-list, 2 MB limit, magic-byte check, random file names.
- Login, forgot-password and resend-verification never reveal whether an email is registered.

## Known limits (by design, for now)
- Departments are a fixed list in `server/src/constants.js`; the admin module will make them editable.
- Faculty can register but show "pending verification" until the admin module adds approval.
- Search, notifications and messages icons in the top bar are not shown yet; they arrive with their modules.
