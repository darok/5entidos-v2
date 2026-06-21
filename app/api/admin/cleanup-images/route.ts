import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const BUCKET = "recipe-images"
const MARKER = `/object/public/${BUCKET}/`

// Extract the storage path from a full public URL
function pathFromUrl(publicUrl: string): string | null {
  const idx = publicUrl.indexOf(MARKER)
  if (idx === -1) return null
  return decodeURIComponent(publicUrl.slice(idx + MARKER.length))
}

// GET — dry run: returns { orphaned: string[] }
// DELETE — deletes orphaned files and returns { deleted: string[]; errors: string[] }
export async function GET(request: NextRequest) {
  return run(request, false)
}

export async function DELETE(request: NextRequest) {
  return run(request, true)
}

async function run(request: NextRequest, doDelete: boolean) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Fetch all files in bucket
  const { data: files, error: listError } = await supabase.storage.from(BUCKET).list("", { limit: 1000 })
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 })

  // Fetch all referenced image_urls from recipes
  const { data: recipes, error: dbError } = await supabase.from("recipes").select("image_url")
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  const referenced = new Set<string>()
  for (const r of recipes ?? []) {
    if (!r.image_url) continue
    const p = pathFromUrl(r.image_url)
    if (p) referenced.add(p)
  }

  const allFiles = (files ?? []).map((f) => f.name)
  const orphaned = allFiles.filter((name) => !referenced.has(name))

  if (!doDelete) {
    return NextResponse.json({ total: allFiles.length, referenced: referenced.size, orphaned })
  }

  // Delete orphaned files in batches of 100
  const deleted: string[] = []
  const errors: string[] = []
  for (let i = 0; i < orphaned.length; i += 100) {
    const batch = orphaned.slice(i, i + 100)
    const { error } = await supabase.storage.from(BUCKET).remove(batch)
    if (error) {
      errors.push(error.message)
    } else {
      deleted.push(...batch)
    }
  }

  return NextResponse.json({ deleted, errors })
}
