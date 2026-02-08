# El Gran Peón

Premium Argentine artisanal brand — mates, bombillas, leather goods, knives, and campo culture objects.

**"Hecho para durar. Como las cosas bien hechas."**

## Architecture

Monorepo with npm workspaces:

```
el-gran-peon/
├── apps/
│   ├── home/              → Customer storefront (Nuxt + Tailwind + Pinia)
│   └── back-office/       → Admin panel (Nuxt + Tailwind + Pinia)
├── services/
│   └── api/               → Express.js backend
├── docs/
│   └── Manual_de_Marca_Gran_Peon.pdf
└── CLAUDE.md
```

| Component | Stack | Port | Deployment |
|-----------|-------|------|------------|
| Storefront | Nuxt 4, Tailwind, Pinia | 3000 | Firebase Hosting |
| Back-office | Nuxt 4, Tailwind, Pinia | 3002 | Firebase Hosting |
| API | Express.js, Node.js | 3001 | Render |
| Database | Firebase Firestore | — | Google Cloud |
| Images | Cloudinary | — | Cloudinary |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

```bash
git clone <repo-url>
cd el-gran-peon
npm install
```

### Environment Variables

Each app/service requires its own `.env` file:

**`apps/home/.env`**
```
NUXT_PUBLIC_API_BASE=http://localhost:3001
ACCESS_CODE=granpeon2026
NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your_cloud_name>
```

**`apps/back-office/.env`**
```
NUXT_PUBLIC_API_BASE=http://localhost:3001
NUXT_PUBLIC_API_KEY=<your_api_key>
NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your_cloud_name>
```

**`services/api/.env`**
```
PORT=3001
API_KEY=<your_api_key>
FIREBASE_PROJECT_ID=<your_project_id>
FIREBASE_PRIVATE_KEY=<your_private_key>
FIREBASE_CLIENT_EMAIL=<your_client_email>
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_key>
CLOUDINARY_API_SECRET=<your_cloudinary_secret>
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002
```

### Development

```bash
# Start all services
npm run dev:api       # API on :3001
npm run dev:home      # Storefront on :3000
npm run dev:admin     # Back-office on :3002
```

## Commerce Flow

1. Customer browses products at elgranpeon.com (access code protected)
2. Adds products to cart (persisted in localStorage via Pinia)
3. Fills checkout form with contact and shipping info
4. Order is saved to Firestore via `POST /api/orders`
5. Customer is redirected to WhatsApp with a pre-filled order message
6. Admin receives WhatsApp notification + order appears in back-office
7. Admin manages order lifecycle: nuevo → preparando → enviado → entregado

## API

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | All categories (nested parent/child) |
| GET | `/api/products` | Products list (filters: `?category`, `?parentCategory`, `?featured`, `?limit`) |
| GET | `/api/products/:slug` | Single product by slug |
| POST | `/api/orders` | Create order from checkout |

### Protected Endpoints (require `x-api-key` header)

Full CRUD for categories, products, and orders. Image upload via Cloudinary. Seed endpoints for initial data.

## Design System

| Element | Value |
|---------|-------|
| Primary | `#741617` (burgundy) |
| Cream | `#FEFCF0` |
| Olive | `#4C4A38` |
| Display font | Bondrians (always uppercase) |
| UI font | IBM Plex Sans |
| Body font | Source Serif 4 |

No rounded corners. No gradients. No shadows. Sharp edges, solid colors, generous whitespace.

## Deployment

```bash
# Storefront → Firebase Hosting
npm run build:home
firebase deploy --only hosting

# API → Render (auto-deploys from main branch)
```

## Project Status

- [x] Phase 0 — Monorepo restructure
- [x] Phase 1 — API foundation
- [x] Phase 2 — Back-office (products, categories, orders)
- [x] Phase 3 — Storefront layout + homepage
- [x] Phase 4 — Product catalog + detail pages
- [x] Phase 5 — Cart + checkout + WhatsApp integration
- [ ] Phase 6 — B2B pages (Empresariales / Mayoristas)
- [ ] Phase 7 — Brand pages (Nosotros)
- [ ] Phase 8 — Legal pages
