import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { RECIPE_IMAGES_BUCKET, pathFromImageUrl } from "@/lib/storage"

export const maxDuration = 60

const BUCKET = RECIPE_IMAGES_BUCKET

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60) || "receta"
}

function extFromPath(p: string): string {
  return p.split(".").pop() ?? "jpg"
}

// True if the path already matches "<slugified-title>_XXXXXX.ext"
function matchesConvention(path: string, base: string, ext: string): boolean {
  const prefix = `${base}_`
  if (!path.startsWith(prefix) || !path.endsWith(`.${ext}`)) return false
  const rand = path.slice(prefix.length, path.length - ext.length - 1)
  return /^\d{6}$/.test(rand)
}

interface RenameItem {
  recipe_id: string
  title: string
  old_path: string
  new_path: string
}

// GET — preview: returns list of renames that would be applied
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, image_url")
    .not("image_url", "is", null)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const items: RenameItem[] = []
  for (const r of recipes ?? []) {
    const oldPath = pathFromImageUrl(r.image_url)
    if (!oldPath) continue // external URL, skip
    const ext = extFromPath(oldPath)
    const base = slugify(r.title)
    if (matchesConvention(oldPath, base, ext)) continue // already follows the convention
    const rand = Math.floor(Math.random() * 900000 + 100000)
    const newPath = `${base}_${rand}.${ext}`
    items.push({ recipe_id: r.id, title: r.title, old_path: oldPath, new_path: newPath })
  }

  return NextResponse.json({ items })
}

// POST — perform the renames: download → re-upload with new name → update DB → delete old
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { items }: { items: RenameItem[] } = await request.json()
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ renamed: [], errors: [] })
  }

  const renamed: string[] = []
  const errors: string[] = []

  for (const item of items) {
    try {
      // Download current file
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(BUCKET)
        .download(item.old_path)
      if (downloadError) throw new Error(`Download: ${downloadError.message}`)

      const buffer = await fileData.arrayBuffer()
      const mimeType = fileData.type || "image/jpeg"

      // Upload with new name
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(item.new_path, buffer, { contentType: mimeType, upsert: false })
      if (uploadError) throw new Error(`Upload: ${uploadError.message}`)

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(item.new_path)

      // Update recipe row
      const { error: updateError } = await supabase
        .from("recipes")
        .update({ image_url: publicUrl })
        .eq("id", item.recipe_id)
      if (updateError) throw new Error(`DB update: ${updateError.message}`)

      // Delete old file
      const { error: deleteError } = await supabase.storage.from(BUCKET).remove([item.old_path])
      if (deleteError) console.error(`Delete old file ${item.old_path}:`, deleteError.message)

      renamed.push(item.title)
    } catch (e) {
      errors.push(`${item.title}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return NextResponse.json({ renamed, errors })
}
