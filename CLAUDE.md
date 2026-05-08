# Recetario v2 — Claude Working Instructions

## What this is

Personal recipe app. One owner (Dario) who can create, edit and delete everything.
Visitors can browse and read recipes without an account.

This is a greenfield rewrite of a previous Streamlit prototype (`../5entidos`).
Reference it for feature parity, but do not copy its code — the stack is completely different.

Take working preferences of the user at (`../../CLAUDE.md`). Start by confirming you read the rules (there is a tip there as to how to do so...)

---

## Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Framework  | Next.js 14, App Router, TypeScript              |
| Styling    | Tailwind CSS + shadcn/ui                        |
| Database   | Supabase (PostgreSQL)                           |
| Auth       | Supabase Auth (email/password, single owner)    |
| Storage    | Supabase Storage (bucket: `recipe-images`)      |
| AI         | OpenAI JS SDK — Whisper (transcription) + GPT-4o-mini (extraction) |
| Deploy     | Vercel (frontend + API routes) + Supabase       |

---

## Project structure

```
recetario-v2/
├── app/
│   ├── layout.tsx                    # Root layout, providers
│   ├── globals.css
│   ├── page.tsx                      # Home — public
│   ├── login/
│   │   └── page.tsx
│   ├── recipes/
│   │   ├── [id]/
│   │   │   ├── page.tsx              # Detail — public
│   │   │   └── edit/
│   │   │       └── page.tsx          # Edit — owner only
│   │   ├── new/
│   │   │   └── page.tsx              # Create — owner only
│   │   └── audio/
│   │       └── page.tsx              # Audio input — owner only
│   ├── settings/
│   │   └── page.tsx                  # Catalog management — owner only
│   └── api/
│       ├── recipes/
│       │   ├── route.ts              # GET list, POST create
│       │   └── [id]/
│       │       └── route.ts          # GET one, PUT update, DELETE
│       ├── ingredients/route.ts      # GET all, POST create
│       ├── tags/route.ts             # GET all, POST, PUT, DELETE
│       ├── tag-types/route.ts        # GET all, POST, PUT, DELETE
│       ├── units/route.ts            # GET all, POST, PUT, DELETE
│       ├── upload/route.ts           # POST image → Supabase Storage
│       └── ai/
│           ├── transcribe/route.ts   # POST audio → Whisper → text
│           └── extract/route.ts      # POST text → GPT → recipe JSON
├── components/
│   ├── ui/                           # shadcn/ui primitives
│   ├── header.tsx                    # Logo + page title + nav actions
│   ├── recipe-card.tsx               # Card shown in home grid
│   ├── recipe-form.tsx               # Shared create/edit form (client component)
│   ├── ingredient-row.tsx            # Single ingredient row in form
│   ├── step-row.tsx                  # Single step row in form
│   ├── rating-display.tsx            # Shows rating badge with label
│   ├── search-filters.tsx            # Name search + tag filter + ingredient filter
│   ├── image-upload.tsx              # Upload or URL input for recipe image
│   └── providers.tsx                 # Wraps app with Supabase session provider
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # createBrowserClient (use in client components)
│   │   └── server.ts                 # createServerClient (use in server components + API routes)
│   ├── db/
│   │   ├── recipes.ts                # getAll, getById, create, update, delete
│   │   ├── ingredients.ts            # getAll, create, update, delete
│   │   ├── tags.ts                   # getAll, getAllTypes, create/update/delete for both
│   │   └── units.ts                  # getAll, create, update, delete
│   └── utils.ts                      # scaleQuantity, formatTime, RATING_LABELS
├── types/
│   └── index.ts                      # All TypeScript types
├── middleware.ts                      # Redirect unauthenticated users from owner routes
├── schema.sql                        # Run once in Supabase SQL Editor
├── .env.local                        # (gitignored) see .env.example
├── .env.example
├── CLAUDE.md                         # This file
├── FUTURE_FEATURES.md
└── LOG.md
```

---

## Env vars

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
```

---

## Auth model

- Supabase Auth with email/password. Only one account will ever exist (the owner).
- The Supabase schema has RLS policies: anyone can SELECT, only `authenticated` role can INSERT/UPDATE/DELETE.
- `middleware.ts` protects these routes (redirect to `/login` if not authenticated):
  - `/recipes/new`
  - `/recipes/[id]/edit`
  - `/recipes/audio`
  - `/settings`
- Login page at `/login`. After login, redirect to `/`.
- No registration UI — the owner account is created directly in Supabase dashboard.

---

## Database

See `schema.sql` for the full schema. Key tables:

- `recipes` — id, title, description, image_url, prep_time, cook_time, servings, rating (1–10), rating_note, created_at, updated_at
- `recipe_ingredients` — recipe_id, ingredient_id, quantity, unit_id, **optional (boolean)**
- `recipe_steps` — recipe_id, step_number, description
- `recipe_tags` — recipe_id, tag_id (pivot)
- `ingredients` — master catalog
- `tags` — with optional tag_type_id
- `tag_types`, `units`

---

## Pages

### Home `/`
- Server Component. Loads all recipes from Supabase.
- Passes data to a client `<SearchFilters>` + `<RecipeGrid>` for filtering.
- Filters: text search by name, multiselect by tag, multiselect by ingredient (shows only recipes containing ALL selected ingredients).
- Grid: 3 columns desktop, 2 tablet, 1 mobile. Each card shows image (if any), title, cook time, servings, tags, rating badge.
- Owner sees "+ Nueva receta" and "⚙️ Configuración" buttons in the header. Visitors don't.

### Recipe detail `/recipes/[id]`
- Server Component. Loads recipe by id.
- Shows: image (full width if exists), title, description, time/servings metrics, tags, rating badge + note (if set).
- Ingredients with serving scaler: number input → quantities recalculate client-side. Optional ingredients shown with "(opcional)" label.
- Steps numbered.
- Owner sees Edit and Delete buttons. Delete has a confirm dialog.

### Create `/recipes/new` and Edit `/recipes/[id]/edit`
- Client Component (form state is complex).
- Fields: title, description, image (upload or URL), prep_time, cook_time, servings, rating (1–10 select with label), rating_note.
- Ingredients section: rows of (ingredient autocomplete, quantity, unit, optional checkbox). Can add/remove rows. Ingredient autocomplete searches the master catalog; if no match, shows "➕ Crear 'X'" to create inline.
- Steps section: textarea rows, numbered, add/remove.
- Tags: multiselect from catalog.
- Guardar / Cancelar buttons.

### Audio `/recipes/audio`
- Owner only. Client Component.
- Step 1: Record audio (use browser MediaRecorder API or a library) OR upload file (mp3, wav, m4a, ogg, webm).
- Step 2: "Transcribir" button → POST to `/api/ai/transcribe` → returns text. Shows editable textarea.
- Step 3: "Extraer receta" button → POST to `/api/ai/extract` with transcript → returns recipe JSON. Shows preview.
- Step 4: "Cargar al formulario →" → stores extracted data in sessionStorage or a zustand store → navigates to `/recipes/new` where the form pre-fills.

### Settings `/settings`
- Owner only. Tabs: Tags, Unidades, Ingredientes.
- Each tab: list of items with inline edit/delete (confirm before delete). Form to add new.
- Tags tab also manages Tag Types (sub-section).

### Login `/login`
- Simple email/password form using Supabase Auth.
- On success → redirect to `/`.

---

## API routes

All mutation routes (POST/PUT/DELETE) verify the user is authenticated via `getUser()` from the server Supabase client. Return 401 if not.

### `/api/recipes`
- `GET` — returns all recipes with joined `recipe_tags(tags)` for display in the home grid.
- `POST` — creates recipe + related ingredients, steps, tags in a transaction-like sequence (delete+reinsert pattern on update).

### `/api/recipes/[id]`
- `GET` — returns full recipe with ingredients(+ingredient name, unit), steps, tags.
- `PUT` — updates recipe fields + replaces ingredients, steps, tags (delete all related then reinsert).
- `DELETE` — deletes recipe (cascade handles related rows).

### `/api/ingredients`
- `GET` — all ingredients (for autocomplete).
- `POST` — create new ingredient.

### `/api/tags`, `/api/tag-types`, `/api/units`
- Standard GET/POST/PUT/DELETE for catalog management.

### `/api/upload`
- `POST` — receives FormData with image file. Uploads to Supabase Storage bucket `recipe-images`. Returns `{ url }`.

### `/api/ai/transcribe`
- `POST` — receives FormData with audio file. Calls OpenAI Whisper (`whisper-1`, language: `es`). Returns `{ transcript }`.

### `/api/ai/extract`
- `POST` — receives `{ transcript: string }`. Calls GPT-4o-mini with structured prompt. Returns recipe JSON:
  ```json
  {
    "title": "...",
    "description": "...",
    "cook_time": 30,
    "servings": 4,
    "ingredients": [{ "name": "harina", "quantity": 2.0, "unit": "taza" }],
    "steps": ["Paso 1...", "Paso 2..."]
  }
  ```

---

## Key types (types/index.ts)

```ts
export interface Recipe {
  id: string
  title: string
  description: string | null
  image_url: string | null
  prep_time: number | null
  cook_time: number | null
  servings: number | null
  rating: number | null
  rating_note: string | null
  created_at: string
  updated_at: string
  ingredients?: RecipeIngredient[]
  steps?: RecipeStep[]
  tags?: RecipeTag[]
  recipe_tags?: RecipeTag[]
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  ingredient_id: string
  quantity: number | null
  unit_id: string | null
  optional: boolean
  ingredients: { name: string }
  units: { name: string; abbreviation: string } | null
}

export interface RecipeStep {
  id: string
  recipe_id: string
  step_number: number
  description: string
}

export interface RecipeTag {
  recipe_id: string
  tag_id: string
  tags: Tag
}

export interface Tag {
  id: string
  name: string
  tag_type_id: string | null
  tag_types?: TagType | null
}

export interface TagType { id: string; name: string }
export interface Ingredient { id: string; name: string }
export interface Unit { id: string; name: string; abbreviation: string }

// Rating labels — names TBD by owner, these are placeholders
export const RATING_LABELS: Record<number, string> = {
  1: '1', 2: '2', 3: '3', 4: '4', 5: '5',
  6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
}
// Owner will define the actual label names (e.g. 10 = "Maravillosa").
// Ask the owner before hardcoding these. Store them here once confirmed.
```

---

## Conventions

- **Server Components by default.** Use `'use client'` only when you need interactivity (forms, state, browser APIs).
- **Data fetching in Server Components** using the server Supabase client (`lib/supabase/server.ts`). Do not call `/api/` routes from server components.
- **Mutations go through API routes** — client components POST/PUT/DELETE to `/api/...` and revalidate with `router.refresh()`.
- **One file = one responsibility.** If a component is growing, split it.
- **Type hints everywhere.** No `any`. Prefer `unknown` + type guards if needed.
- **Error handling:** API routes return `{ error: string }` with appropriate HTTP status. Never swallow silently.
- **Secrets via env vars only.** Never hardcode.
- Follow the conventions in the parent `CLAUDE.md` at `../../CLAUDE.md`.

---

## Scaling logic (lib/utils.ts)

```ts
// scaleQuantity(qty, scale) — used in recipe detail
// Edge cases to handle:
// - Whole-only ingredients (eggs, etc.): round to nearest integer
// - Small quantities like salt/spices: cap minimum at original (don't scale down below original)
// For now, implement simple linear scaling. Edge cases are a future feature.
```

---

## What's NOT in v2 (see FUTURE_FEATURES.md)

- Ingredient substitutes
- Scaling edge cases (non-linear ingredients, indivisibles)
- Log of cook sessions (when you cooked a recipe + photo + note)
- Sub-recipes (referencing a recipe within steps)
- Public shareable links per recipe
- AI suggestions ("I have chicken and lemon, what can I make?")
