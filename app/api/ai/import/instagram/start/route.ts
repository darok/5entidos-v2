import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Instagram fetches are proxied through the same Render agent used for YouTube —
// Vercel's datacenter IPs get blocked/rate-limited by these platforms, Render's are not.
const AGENT_URL = process.env.AGENT_SERVER_URL ?? "https://fiveentidos-v2-docker.onrender.com"

function isInstagramUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (!/(^|\.)instagram\.com$/.test(parsed.hostname)) return false
    return /^\/(reel|reels|p|tv)\//.test(parsed.pathname)
  } catch {
    return false
  }
}

// Starts a background Instagram import job on the Render agent and returns a
// streamUrl the client connects to directly via EventSource — same pattern as
// the YouTube importer, avoiding Vercel's function timeout entirely.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { url } = await request.json()
    if (!url?.trim()) return NextResponse.json({ error: "URL requerida" }, { status: 400 })
    if (!isInstagramUrl(url)) {
      return NextResponse.json({ error: "URL de Instagram inválida" }, { status: 400 })
    }

    const res = await fetch(`${AGENT_URL}/instagram/start`, {
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
    console.error("[instagram-import-start]", error)
    return NextResponse.json({ error: "Error al procesar el post" }, { status: 500 })
  }
}
