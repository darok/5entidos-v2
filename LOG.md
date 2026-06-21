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
