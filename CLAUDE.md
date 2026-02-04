# El Gran Peón - Project Context

## Brand
- Premium artisanal brand from Argentina
- Products: mates, bombillas, leather goods, knives, campo culture objects
- Personality: sobria, segura, austera, clásica
- Brand manual: docs/Manual_de_Marca_Gran_Peon.pdf

## Architecture (Monorepo)
- apps/home/ → Customer storefront (Nuxt + Tailwind + Pinia) → Firebase Hosting
- apps/back-office/ → Admin panel (Nuxt + Tailwind + Pinia) → Firebase Hosting or Netlify
- services/api/ → Express.js backend → Render (https://el-gran-peon-server.onrender.com)
- Database: Firebase Firestore
- Images: Cloudinary
- Domain: elgranpeon.com

## Design System
- Colors: Primary #741617 (burgundy), Cream #FEFCF0, Olive #4C4A38
- Fonts: Bondrians (display/titles), IBM Plex Sans (UI/buttons/labels), Source Serif 4 (body)
- Style: No rounded corners, no gradients, no shadows. Sharp edges, solid colors, generous whitespace.
- Mobile first. Responsive everything.

## Brand Voice (Spanish - Argentine)
- Tone: sobrio, claro, austero, seguro
- Use: oficio, tradición, herencia, clásico, materiales nobles, durabilidad, solidez, detalle
- Avoid: lujo, imperdible, tendencia, barato, único en el mercado, oferta única
- First person plural: "hacemos", "creemos"

## Commerce Model
- Individual sales: Product → Cart → Checkout → WhatsApp message to admin
- Empresariales/Mayoristas: Browse → Contact via WhatsApp for custom quotes
- No online payment processing (MVP) — negotiation via WhatsApp
- WhatsApp: +54 3794007759

## Key Pages (Storefront)
- Home: promo banner, header, hero carousel, category banners, featured products, empresariales preview, footer
- Productos: catalog with category filtering
- Product detail: images, description, price, add to cart, WhatsApp CTA for bulk
- Nosotros: brand story + blog (Phase 2)
- Empresariales: B2B showcase (Phase 2)
- Mayoristas: wholesale info (Phase 2)

## Back-Office Features
- Product CRUD (name, description, price, images, category, stock)
- Category CRUD (flat structure)
- Order tracking (orders come via WhatsApp checkout)
- Promo banner management (future)

## Important Notes
- All content in Spanish (Argentine)
- Brand manual PDF is source of truth for all visual decisions
- Quality over speed — brand consistency is paramount
- Bondrians font requires commercial license before public launch
