import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import OpenAI, { toFile } from "openai"
import sharp from "sharp"

// gpt-image-1 can take 20-30s — requires Vercel Pro for full timeout; Hobby plan may cut at 10s
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const { imageUrl, imageBase64, prompt } = await request.json()
    if (!prompt?.trim()) return NextResponse.json({ error: "prompt is required" }, { status: 400 })
    if (!imageUrl?.trim() && !imageBase64) return NextResponse.json({ error: "imageUrl or imageBase64 required" }, { status: 400 })

    let rawBuffer: Buffer
    if (imageBase64) {
      // Refinement iteration: client sends previous result as base64 to chain generations
      rawBuffer = Buffer.from(imageBase64, "base64")
    } else {
      const fetched = await fetch(imageUrl)
      if (!fetched.ok) return NextResponse.json({ error: "No se pudo descargar la imagen" }, { status: 400 })
      rawBuffer = Buffer.from(await fetched.arrayBuffer())
    }

    // Convert to JPEG (RGB) — gpt-image-1 rejects RGBA/WebP with alpha channel
    const buffer = await sharp(rawBuffer).flatten({ background: "#ffffff" }).jpeg({ quality: 95 }).toBuffer()
    const file = await toFile(buffer, "image.jpg", { type: "image/jpeg" })

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: file,
      prompt,
      n: 1,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      size: "1536x1024" as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      quality: "medium" as any,
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
