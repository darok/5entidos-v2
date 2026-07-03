import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import OpenAI from "openai"
import { EXTRACT_SYSTEM_PROMPT } from "@/lib/ai/extract"
import type { ExtractedRecipe } from "@/types"

export const maxDuration = 30

const MAX_PER_FILE = 5 * 1024 * 1024 // 5 MB per image
const MAX_FILES = 5
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const formData = await request.formData()
    const files = formData.getAll("file") as File[]

    if (!files.length) return NextResponse.json({ error: "Imagen requerida" }, { status: 400 })
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Máximo ${MAX_FILES} imágenes por vez` }, { status: 400 })
    }

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Solo se aceptan imágenes JPG, PNG, GIF o WebP. Convertí la imagen antes de subir." },
          { status: 400 }
        )
      }
      if (file.size > MAX_PER_FILE) {
        return NextResponse.json(
          { error: `"${file.name}" supera el límite de 5 MB por imagen` },
          { status: 400 }
        )
      }
    }

    // Convert all files to base64 data URLs in parallel
    const imageBlocks = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.arrayBuffer()
        const base64 = Buffer.from(buffer).toString("base64")
        return {
          type: "image_url" as const,
          image_url: { url: `data:${file.type};base64,${base64}`, detail: "high" as const },
        }
      })
    )

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const userText =
      files.length > 1
        ? "Extraé la receta de estas imágenes. Si son páginas de la misma receta, combiná todo en una sola receta completa."
        : "Extraé la receta de esta imagen."

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: EXTRACT_SYSTEM_PROMPT.replace(
            "Given a spoken recipe transcript in Spanish",
            "Given one or more images of a recipe (photos of book pages, handwritten cards, or printed pages)"
          ),
        },
        {
          role: "user",
          content: [
            ...imageBlocks,
            { type: "text" as const, text: userText },
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
