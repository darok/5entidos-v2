## 2026-06-21

- Added AI Image Boost feature: `components/ai-image-boost-dialog.tsx`, `app/api/ai/boost-image/route.ts`
  - Style presets (Recetario, Editorial, Rústico, Minimalista), 6 control groups, free-text note
  - "Ver prompt" shows editable assembled prompt before sending
  - Result comparison UI: new image full-width, original thumbnail, refine note for chained regeneration
  - Iterative refinement: Regenerar passes previous result as base64 input + appends note to accumulated prompt
  - gpt-image-1, 1536×1024 landscape, quality medium (~$0.06/use)
  - Fixed: WebP RGBA rejected by gpt-image-1 → server-side sharp flatten to JPEG (RGB)
  - Fixed: shadcn DialogContent grid layout breaking aspect-ratio → flex flex-col with scrollable body
- Added `replaces` param to `app/api/upload/route.ts` to delete old Storage file on upload/crop
- Added "Boost con IA" button to image preview in `components/image-upload.tsx`
- Passed `recipeIngredients` from `components/recipe-form.tsx` to `ImageUpload` for prompt context
- Added storage cleanup API: `app/api/admin/cleanup-images/route.ts`
  - `GET` → dry run, returns list of orphaned files
  - `DELETE` → removes orphaned files from `recipe-images` bucket
- Improved assemblePrompt anti-artificial directive for photo-realism

## 2026-08-15

- Recovered the repo after local data loss (cloned from GitHub — tracked files were intact; `.env.local`, `recipe-agent/.env`, and `/working folder/` were not, since they're gitignored). Keys still need to be re-entered by hand or via `vercel env pull`; `/working folder/` is unrecoverable (no backup existed).
- Synced `package-lock.json` (root and `recipe-agent/`) with `package.json`, dropping a stale `youtube-transcript` entry left over from before the Docker/yt-dlp rebuild of YouTube import.
- Added recipebook export feature to Settings → Otros: owner-only download of every recipe (full detail) as `.json`, or as a `.zip` with an `images/` folder when "Incluir imágenes" is checked. New route `app/api/recipes/export/route.ts`, new `lib/db/recipes.ts:getAllForExport()`, new dependency `jszip`.
- Added `lib/storage.ts` (`RECIPE_IMAGES_BUCKET`, `pathFromImageUrl`) and refactored `app/api/upload/route.ts` and `app/api/admin/rename-images/route.ts` to use it instead of each keeping its own duplicate of the Storage-path-from-URL logic.

## 2026-08-28

- Fixed audio-import ingredient names arriving lowercase: `app/recipes/new/page.tsx` now uses the catalog's stored casing on a match, or capitalizes the raw AI text otherwise (`capitalize()` added to `lib/utils.ts`).
- Fixed audio-import units almost never matching the catalog: `lib/ai/extract.ts`'s `extractRecipeFromText` now takes an optional `units` list and tells GPT to reuse the catalog's exact spelling when one applies; `app/api/ai/extract/route.ts` fetches and passes it. Link/image import routes unchanged (out of scope this round).
- Fixed the crop editor sometimes rendering as a blank/black box right after uploading a photo: `components/image-upload.tsx` now retries once on image load failure, then shows a visible error + retry button instead of staying silently blank.
- Investigated (not implemented): sharing an audio file into the app from WhatsApp's share sheet. Android's Web Share Target API would need a service worker first (app isn't an installable PWA yet); Dario has an iPhone, which doesn't support that API at all. Decided against building anything now — an iOS Shortcut (save-to-Files + open `/recipes/audio`) covers the immediate need with zero app code. Backlogged for later: a fuller Shortcut that POSTs straight to a new authenticated intake route for immediate transcription.
