import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { YoutubeTranscript } from "youtube-transcript"

// Extracts a video ID from any common YouTube URL format
function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    // youtu.be/{id}
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1).split("?")[0] || null
    }
    // youtube.com/watch?v={id}
    if (parsed.searchParams.has("v")) {
      return parsed.searchParams.get("v")
    }
    // youtube.com/shorts/{id}
    const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?]+)/)
    if (shortsMatch) return shortsMatch[1]
    return null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { url } = await request.json()
    if (!url?.trim()) {
      return NextResponse.json({ error: "URL requerida" }, { status: 400 })
    }

    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json({ error: "URL de YouTube inválida" }, { status: 400 })
    }

    let items
    try {
      // Try Spanish captions first, fall back to any available language
      try {
        items = await YoutubeTranscript.fetchTranscript(videoId, { lang: "es" })
      } catch {
        items = await YoutubeTranscript.fetchTranscript(videoId)
      }
    } catch {
      return NextResponse.json(
        { error: "Este video no tiene subtítulos disponibles. Intentá con otro video o usá el método de audio." },
        { status: 422 }
      )
    }

    const transcript = items.map((i) => i.text).join(" ").replace(/\s+/g, " ").trim()
    return NextResponse.json({ transcript })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error al obtener subtítulos" }, { status: 500 })
  }
}
