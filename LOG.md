## 2026-09-04

- Added Instagram Reels as a 4th tab in `/recipes/import`, reusing the YouTube import architecture: `recipe-agent/instagram.js` (URL validation + caption extraction via `yt-dlp --dump-json`), `recipe-agent/server.js` (`/instagram/start` route, audio download + Whisper transcription), `app/api/ai/import/instagram/start/route.ts`, `InstagramTab` in `app/recipes/import/page.tsx`.
  - No closed-captions equivalent on Instagram — always fetches caption + audio in parallel (no fallback chain like YouTube's captions→audio).
  - Verified locally against a real reel: yt-dlp pulls the caption (often the full ingredient list) and downloads audio without cookies/login for public posts.
  - Known risk (not addressed yet): Instagram can block yt-dlp harder than YouTube for some posts; no cookie support configured. Manual fallback (paste caption, upload audio) covers that case for now — revisit if it fails often in practice.

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

## 2026-10-12

- Fixed recipe images going missing (e.g. Shawarma showed iOS's blue "?" on the home list; Storage returned 404 for its file). `/api/upload`'s `replaces` param deleted the old file at upload/crop/boost time, before the recipe was saved — abandoning the edit left `image_url` pointing at a deleted file. Removed `replaces` from `app/api/upload/route.ts`, `components/image-upload.tsx`, `components/ai-image-boost-dialog.tsx`; `lib/db/recipes.ts` `update()`/`deleteRecipe()` now delete the old image only after a successful save, and only if no other recipe references it.
- Crop step (`components/image-upload.tsx`): exports JPEG 0.88 capped at 1920px wide (was full-res WebP 0.95, which iOS Safari can't encode → PNG fallback that could exceed Vercel's 4.5 MB body limit), and shows upload errors instead of silently doing nothing.
- `app/api/admin/cleanup-images/route.ts`: reuses `lib/storage.ts`, skips files under 24h old (could be an unsaved edit) and folders. Abandoned uploads/crops now become orphans for this cleanup.
- Shawarma's original image file is gone — must be re-uploaded by hand.
- No test framework in the project yet, so the new `lib/db/recipes.ts` image-deletion logic has no tests.
