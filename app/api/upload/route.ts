import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Deletes an old Storage file given its public URL — runs after successful upload only
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deleteOldFile(supabase: any, publicUrl: string): Promise<void> {
  const marker = "/object/public/recipe-images/"
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return
  const path = decodeURIComponent(publicUrl.slice(idx + marker.length))
  const { error } = await supabase.storage.from("recipe-images").remove([path])
  if (error) console.error("Failed to delete old file:", error.message)
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const contentType = request.headers.get("content-type") ?? ""

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("file") as File | null
      const replaces = formData.get("replaces") as string | null
      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

      const ext = file.name.split(".").pop() ?? "jpg"
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from("recipe-images")
        .upload(filename, file, { contentType: file.type, upsert: false })

      if (error) throw new Error(error.message)

      const { data: { publicUrl } } = supabase.storage.from("recipe-images").getPublicUrl(filename)
      if (replaces?.trim()) await deleteOldFile(supabase, replaces)
      return NextResponse.json({ url: publicUrl })
    } else {
      // JSON { url, replaces? } — fetch image server-side and re-upload to Storage
      const { url, replaces } = await request.json()
      if (!url?.trim()) return NextResponse.json({ error: "URL required" }, { status: 400 })

      const fetched = await fetch(url)
      if (!fetched.ok) return NextResponse.json({ error: "No se pudo descargar la imagen" }, { status: 400 })

      const mimeType = (fetched.headers.get("content-type") ?? "image/jpeg").split(";")[0]
      const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg"
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const buffer = await fetched.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from("recipe-images")
        .upload(filename, buffer, { contentType: mimeType })

      if (uploadError) throw new Error(uploadError.message)

      const { data: { publicUrl } } = supabase.storage.from("recipe-images").getPublicUrl(filename)
      if (replaces?.trim()) await deleteOldFile(supabase, replaces)
      return NextResponse.json({ url: publicUrl })
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
