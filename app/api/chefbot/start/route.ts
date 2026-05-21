import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const agentUrl = process.env.AGENT_SERVER_URL ?? 'https://fiveentidos-v2.onrender.com'
    const res = await fetch(`${agentUrl}/recipe/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    // Return the stream URL from the server side so the client doesn't need NEXT_PUBLIC env vars
    return NextResponse.json({
      ...data,
      streamUrl: `${agentUrl}/recipe/stream/${data.jobId}`,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to start agent" }, { status: 500 })
  }
}
