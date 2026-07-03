import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import OpenAI from "openai"
import { extractRecipeFromText } from "@/lib/ai/extract"

export const maxDuration = 30

// Strips HTML to clean plain text for recipe extraction
function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<(nav|footer|header|aside)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000)
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { url } = await request.json()
    if (!url?.trim()) return NextResponse.json({ error: "URL requerida" }, { status: 400 })

    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 })
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 })
    }

    let res: Response
    try {
      res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; recipe-import/1.0)",
          "Accept": "text/html",
        },
        signal: AbortSignal.timeout(10_000),
      })
    } catch (err) {
      const isTimeout = err instanceof Error && err.name === "TimeoutError"
      return NextResponse.json(
        { error: isTimeout ? "La página tardó demasiado en responder" : "No se pudo acceder a la página" },
        { status: 422 }
      )
    }

    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        return NextResponse.json(
          { error: "La página bloqueó el acceso automático. Probá copiando el texto manualmente." },
          { status: 422 }
        )
      }
      return NextResponse.json(
        { error: `No se pudo acceder a la página (error ${res.status})` },
        { status: 422 }
      )
    }

    const contentType = res.headers.get("content-type") ?? ""
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "Este link no lleva a una página web. PDFs y otros formatos no son compatibles." },
        { status: 400 }
      )
    }

    const html = await res.text()
    const text = extractTextFromHtml(html)

    if (text.length < 50) {
      return NextResponse.json(
        { error: "No se encontró contenido suficiente en la página" },
        { status: 422 }
      )
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const extracted = await extractRecipeFromText(text, openai)
    return NextResponse.json(extracted)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al importar desde el link" }, { status: 500 })
  }
}
