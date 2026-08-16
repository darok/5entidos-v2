import { NextRequest, NextResponse } from "next/server"
import JSZip from "jszip"
import { createClient } from "@/lib/supabase/server"
import { getAllForExport } from "@/lib/db/recipes"
import { RECIPE_IMAGES_BUCKET, pathFromImageUrl } from "@/lib/storage"

export const maxDuration = 60

// Strips anything unsafe for a Content-Disposition filename; falls back to a default base
function sanitizeFilename(raw: string | null): string {
  const cleaned = (raw ?? "").replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 100)
  return cleaned || "5entidos-recetario-export"
}

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const includeImages = searchParams.get("images") === "1"
  const base = sanitizeFilename(searchParams.get("filename"))

  try {
    const recipes = await getAllForExport()
    const payload = {
      exported_at: new Date().toISOString(),
      recipe_count: recipes.length,
      recipes,
    }

    if (!includeImages) {
      return new NextResponse(JSON.stringify(payload, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${base}.json"`,
        },
      })
    }

    const zip = new JSZip()
    const imagesFolder = zip.folder("images")!
    const imageWarnings: string[] = []

    for (const recipe of recipes) {
      if (!recipe.image_url) continue
      const path = pathFromImageUrl(recipe.image_url)
      if (!path) {
        imageWarnings.push(`${recipe.title}: URL de imagen externa, no se pudo incluir`)
        continue
      }
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(RECIPE_IMAGES_BUCKET)
        .download(path)
      if (downloadError || !fileData) {
        console.error(`Export: failed to download image for "${recipe.title}" (${path}):`, downloadError?.message)
        imageWarnings.push(`${recipe.title}: no se pudo descargar la imagen (${path})`)
        continue
      }
      imagesFolder.file(path, await fileData.arrayBuffer())
    }

    const finalPayload = imageWarnings.length > 0 ? { ...payload, image_warnings: imageWarnings } : payload
    zip.file("recetario.json", JSON.stringify(finalPayload, null, 2))

    const zipBuffer = await zip.generateAsync({ type: "arraybuffer" })
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${base}.zip"`,
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}
