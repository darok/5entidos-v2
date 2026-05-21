import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const agentUrl = process.env.AGENT_SERVER_URL ?? 'https://fiveentidos-v2.onrender.com'
    const res = await fetch(
      `${agentUrl}/recipe/respond/${params.jobId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    )
    return NextResponse.json(await res.json())
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to send response" }, { status: 500 })
  }
}
