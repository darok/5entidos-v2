import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import OpenAI from "openai"
import { EXTRACT_SYSTEM_PROMPT } from "@/lib/ai/extract"
import type { ExtractedRecipe } from "@/types"

export const maxDuration = 30

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "Imagen requerida" }, { status: 400 })

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Solo se aceptan imágenes JPG, PNG, GIF o WebP. Convertí la imagen antes de subir." },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "La imagen es demasiado grande (máx 5 MB)" },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: EXTRACT_SYSTEM_PROMPT.replace(
            "Given a spoken recipe transcript in Spanish",
            "Given an image of a recipe (photo of a book, handwritten card, or printed page)"
          ),
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: dataUrl, detail: "high" },
            },
            {
              type: "text",
              text: "Extraé la receta de esta imagen.",
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    })

    const raw = completion.choices[0].message.content
    if (!raw) throw new Error("Empty response from GPT")

    const extracted = JSON.parse(raw) as ExtractedRecipe
    return NextResponse.json(extracted)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "No se pudo leer la receta de la imagen" }, { status: 500 })
  }
}
