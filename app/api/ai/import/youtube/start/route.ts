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

// Starts a background YouTube import job on the Render agent and returns a
// streamUrl the client connects to directly via EventSource. This avoids Vercel's
// function timeout entirely — Render's captions→audio→Whisper fallback chain can
// take as long as it needs instead of racing a fixed deadline.
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

    const res = await fetch(`${AGENT_URL}/youtube/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(
        { error: (data as { error?: string }).error ?? "Error al iniciar la importación" },
        { status: res.status }
      )
    }

    // Return the stream URL from the server side so the client doesn't need NEXT_PUBLIC env vars
    return NextResponse.json({
      ...data,
      streamUrl: `${AGENT_URL}/recipe/stream/${data.jobId}`,
    })
  } catch (error) {
    console.error("[youtube-import-start]", error)
    return NextResponse.json({ error: "Error al procesar el video" }, { status: 500 })
  }
}
