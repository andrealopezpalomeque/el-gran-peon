# Product Search — Design Spec

## Overview

Add product search to the storefront (`apps/home/`) with an autocomplete dropdown and a dedicated search results page.

## UX Decisions

### Search Bar Placement
- **Icon in header row** (next to cart icon) that expands into a full-width search bar below the header on click
- Desktop: search icon in the right section alongside cart + WhatsApp CTA. Click reveals a full-width bar below the header with the input field
- Mobile: search icon in the right section alongside cart. Click reveals the same expandable bar
- Close via X button or ESC key

### Autocomplete Dropdown
- Appears below the expanded search bar as the user types
- Two sections: **Categories** (max 3) at top, **Products** (max 5) below
- Products show: thumbnail, name, price, category name
- Categories show: name with link to `/productos?categoria=slug`
- Minimum query: **2 characters**
- Debounce: **300ms**

### Search Results Page
- Route: `/buscar?q=query`
- Triggered when user presses Enter or clicks "Ver todos los resultados"
- Reuses existing product grid layout (same `ProductCard` component)
- Shows result count and the query term
- Empty state when no results found

## Technical Decisions

### Backend: New API Endpoint
- `GET /api/products/search?q=query&limit=5&categoryLimit=3`
- Server-side search across: **name**, **tags**, **category name**, **parent category name**
- Case-insensitive matching
- Returns `{ products: [...], categories: [...] }`
- Only searches active products and visible categories
- Products response shape matches existing product list format
- Categories response: `[{ id, name, slug, parentId, parentName }]`

### Frontend Components
1. **SearchIcon** — magnifying glass button in `SiteHeader`
2. **SearchBar** — expandable full-width input bar with autocomplete dropdown
3. **SearchResults page** — `/buscar` route with product grid

### Data Flow
1. User clicks search icon → bar expands with focus on input
2. User types 2+ chars → 300ms debounce → `GET /api/products/search?q=...`
3. Response populates dropdown (categories + products)
4. Click product → navigate to `/productos/[slug]`
5. Click category → navigate to `/productos?categoria=[slug]`
6. Press Enter → navigate to `/buscar?q=[query]`
7. Results page calls same endpoint with higher limit

## Brand Compliance
- No rounded corners on search input or dropdown
- IBM Plex Sans for input text and results
- Brand colors: olive text, primary for highlights, cream background
- Sharp, clean aesthetic matching existing header style
