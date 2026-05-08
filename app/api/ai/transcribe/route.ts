import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import OpenAI from "openai"

export async function POST(request: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const formData = await request.formData()
    const audio = formData.get("audio") as File | null
    if (!audio) return NextResponse.json({ error: "No audio file provided" }, { status: 400 })

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "whisper-1",
      language: "es",
    })

    return NextResponse.json({ transcript: transcription.text })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 })
  }
}
