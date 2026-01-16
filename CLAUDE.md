# El Gran Peón - Project Context

## What is El Gran Peón?

El Gran Peón is a premium artisanal brand from Argentina focused on handcrafted products rooted in campo (countryside) culture — mates, bombillas, leather goods, and objects made with noble materials and traditional craftsmanship.

The brand doesn't chase trends. It speaks with quiet confidence, values durability over novelty, and creates objects meant to last generations.

## Brand Personality

- Sobria (sober, understated)
- Segura (confident)
- Austera (austere, not flashy)
- Clásica (timeless, classic)

The brand voice is calm, doesn't exaggerate, doesn't sell with urgency. It speaks like someone who knows their craft.

## Current Phase

**Pre-launch / Coming Soon**

We are building a simple landing page to:
1. Announce the brand is coming
2. Capture email subscribers for launch notification
3. Establish the visual identity online

## Tech Stack

| Layer | Technology | Deployment |
|-------|------------|------------|
| Frontend | Nuxt.js + Tailwind CSS + Pinia | Firebase Hosting |
| Backend | Express.js + Node.js | Render |
| Database | Firebase Firestore | — |
| Domain | elgranpeon.com | Firebase Hosting |

## Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary (Burgundy) | #741617 | Main brand color, backgrounds, buttons |
| Cream | #FEFCF0 | Light backgrounds, text on dark |
| Olive | #4C4A38 | Body text, subtle accents |

## Typography

| Font | Usage |
|------|-------|
| Bondrians | Logo, titles, institutional phrases (display only, not for long text) |
| IBM Plex Sans | UI elements, buttons, labels, slogan, microcopy |
| Source Serif 4 | Body text, product descriptions, longer content |

## Design Principles

1. **Minimal, not trendy** — No rounded corners, no gradients, no shadows
2. **Confident spacing** — Generous whitespace, let elements breathe
3. **Classic feel** — Sharp edges, solid colors, timeless aesthetic
4. **Mobile-first** — Simple, functional, fast
5. **No marketing hype** — No "¡OFERTA!", no urgency tactics, no exaggeration

## Landing Page Structure (Current Build)

| Section | Content |
|---------|---------|
| Header | Logo centered |
| Hero | Full-width background image (workshop/leather), dark overlay |
| Tagline | "Herencia Clásica" |
| Headline | "Acá empieza El Gran Peón" |
| Form | Email input + submit button |
| Microcopy | "Aviso de lanzamiento + descuento de bienvenida. Sin spam." |
| Footer | Instagram link (@granpeon), copyright |

## File Structure
el-gran-peon/
├── client/                 # Nuxt.js frontend
│   ├── assets/
│   │   ├── css/
│   │   └── fonts/
│   ├── components/
│   ├── composables/
│   ├── layouts/
│   ├── pages/
│   ├── public/            # Static assets (images, favicon)
│   └── stores/
├── server/                 # Express.js backend
│   └── src/
│       ├── config/
│       └── routes/
├── firebase.json
├── .firebaserc
└── CLAUDE.md              # This file

## Important Notes

- All user-facing text is in **Spanish**
- The brand manual (PDF) is the source of truth for visual decisions
- The brand manual PDF is located at /docs/Manual_de_Marca_Gran_Peon.pdf
- When in doubt, choose the more understated option
- Quality over speed — we want the foundation right

---
