import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// YouTube fetches are proxied through the Render agent server because Vercel's
// datacenter IPs are blocked by YouTube. Render's IPs are not.
const AGENT_URL = process.env.AGENT_SERVER_URL ?? "https://fiveentidos-v2.onrender.com"

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1).split("?")[0] || null
    if (parsed.searchParams.has("v")) return parsed.searchParams.get("v")
    const shorts = parsed.pathname.match(/^\/shorts\/([^/?]+)/)
    if (shorts) return shorts[1]
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
    if (!url?.trim()) return NextResponse.json({ error: "URL requerida" }, { status: 400 })

    if (!extractVideoId(url)) {
      return NextResponse.json({ error: "URL de YouTube inválida" }, { status: 400 })
    }

    const res = await fetch(`${AGENT_URL}/youtube/transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: (err as { error?: string }).error ?? "Error al obtener el video" },
        { status: res.status }
      )
    }

    const { title, transcript } = await res.json() as { title: string | null; transcript: string | null }

    const parts: string[] = []
    if (title) parts.push(`Título del video: ${title}`)
    if (transcript) parts.push(`Contenido hablado:\n${transcript}`)

    return NextResponse.json({
      transcript: parts.join("\n\n"),
      source: transcript ? "subtitles" : (title ? "metadata" : null),
      hasTranscript: !!transcript,
    })
  } catch (error) {
    console.error("[youtube-import]", error)
    return NextResponse.json({ error: "Error al procesar el video" }, { status: 500 })
  }
}
