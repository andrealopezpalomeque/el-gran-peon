# Cloudinary Account Migration Plan

**Goal:** Switch from the current Cloudinary account (`dmb1vyveg`) to a new account owned by the client, so he can manage billing directly.

**Status:** Pending

---

## What touches Cloudinary today

| Where | What | How URLs are stored |
|---|---|---|
| **API** (`services/api/`) | Upload, delete, transform images | 3 env vars: `CLOUDINARY_CLOUD_NAME`, `API_KEY`, `API_SECRET` |
| **Back-office** (`apps/back-office/`) | `NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in nuxt.config.ts | Env var |
| **Firestore** | Products: `images: [{ url, publicId }]`, Categories: `image` + `imagePublicId`, Blog posts: `heroImage: { url, publicId }` | Full URLs like `https://res.cloudinary.com/dmb1vyveg/...` |
| **Hardcoded URLs** | 2 email template images in `promocodes/index.vue` and `promocodes/[id].vue` (4 occurrences total) | Hardcoded `res.cloudinary.com/dmb1vyveg/...` URLs |

Current cloud name: **`dmb1vyveg`**

---

## Step 1: Create the new Cloudinary account

- Client creates an account at cloudinary.com with his email
- Note the new **cloud_name**, **API key**, and **API secret** from Dashboard → Settings

## Step 2: Migrate existing assets

Re-upload all images from the old account to the new one, preserving folder structure:

- `el-gran-peon/products/{folder}`
- `el-gran-peon/categories`
- `el-gran-peon/customer-logos`

**Option A — Migration script (recommended):**
Ask Claude to build a Node.js script that:
1. Connects to Firestore
2. Reads all products, categories, and blog posts
3. Re-uploads each image to the new Cloudinary account (preserving folder/public_id)
4. Updates all Firestore documents with the new URLs

**Option B — Manual re-upload:**
Re-upload images through the back-office UI (only viable if there aren't many).

## Step 3: Update Firestore URLs

After re-uploading, update all stored URLs in Firestore:
- Replace `res.cloudinary.com/dmb1vyveg` → `res.cloudinary.com/{NEW_CLOUD_NAME}`
- Affected collections: `products`, `categories`, `blogPosts`

> If using the migration script from Step 2, this step is handled automatically.

## Step 4: Update environment variables

### Render (API — services/api/)
- `CLOUDINARY_CLOUD_NAME` → new value
- `CLOUDINARY_API_KEY` → new value
- `CLOUDINARY_API_SECRET` → new value

### Back-office hosting (Firebase/Netlify)
- `NUXT_PUBLIC_CLOUDINARY_CLOUD_NAME` → new value

### Local `.env` files (for development)
- `services/api/.env`
- `apps/back-office/.env` (if exists)

## Step 5: Fix hardcoded URLs in code

Update these 4 hardcoded Cloudinary URLs:

- `apps/back-office/pages/promocodes/index.vue` — lines with `res.cloudinary.com/dmb1vyveg` (2 occurrences)
- `apps/back-office/pages/promocodes/[id].vue` — lines with `res.cloudinary.com/dmb1vyveg` (2 occurrences)

Replace the old cloud name in the URLs with the new one.

## Step 6: Deploy & verify

- [ ] Storefront loads product/category/blog images correctly
- [ ] Image upload from back-office works (test with a new product)
- [ ] Image deletion from back-office works
- [ ] Email templates in promocodes render correctly
- [ ] No references to old cloud name remain (`grep -r "dmb1vyveg"` should return nothing)

## Step 7: Clean up old account

Once everything is verified:
- Delete assets from the old Cloudinary account (or just close it)
- Remove old API keys from any env files or password managers
