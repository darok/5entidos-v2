export const RECIPE_IMAGES_BUCKET = "recipe-images"

const MARKER = `/object/public/${RECIPE_IMAGES_BUCKET}/`

// Extracts the Storage path from a public image URL; null for external/non-Storage URLs
export function pathFromImageUrl(url: string): string | null {
  const idx = url.indexOf(MARKER)
  if (idx === -1) return null
  return decodeURIComponent(url.slice(idx + MARKER.length))
}
