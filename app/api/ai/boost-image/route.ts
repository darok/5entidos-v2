import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import OpenAI, { toFile } from "openai"

// gpt-image-1 can take 20-30s — requires Vercel Pro for full timeout; Hobby plan may cut at 10s
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const { imageUrl, prompt } = await request.json()
    if (!imageUrl?.trim() || !prompt?.trim()) {
      return NextResponse.json({ error: "imageUrl and prompt are required" }, { status: 400 })
    }

    const fetched = await fetch(imageUrl)
    if (!fetched.ok) return NextResponse.json({ error: "No se pudo descargar la imagen" }, { status: 400 })

    const buffer = Buffer.from(await fetched.arrayBuffer())
    const mimeType = (fetched.headers.get("content-type") ?? "image/jpeg").split(";")[0]
    // Filename extension must match actual MIME type — OpenAI validates both
    const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg"
    const file = await toFile(buffer, `image.${ext}`, { type: mimeType })

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: file,
      prompt,
      n: 1,
      size: "1024x1024",
    })

    const b64 = response.data?.[0]?.b64_json
    if (!b64) return NextResponse.json({ error: "No image returned" }, { status: 500 })

    return NextResponse.json({ b64 })
  } catch (error) {
    console.error("boost-image error:", error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
