import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import OpenAI from "openai"
import { extractRecipeFromText } from "@/lib/ai/extract"
import { getAll as getAllUnits } from "@/lib/db/units"

export async function POST(request: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { transcript } = await request.json()
    if (!transcript?.trim()) {
      return NextResponse.json({ error: "Transcript required" }, { status: 400 })
    }

    const units = await getAllUnits()
    const extracted = await extractRecipeFromText(transcript, openai, units)
    return NextResponse.json(extracted)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 })
  }
}
