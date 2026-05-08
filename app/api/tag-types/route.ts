import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import * as db from "@/lib/db/tags"

export async function GET() {
  try {
    const types = await db.getAllTypes()
    return NextResponse.json(types)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch tag types" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { name } = await request.json()
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 })

    const tagType = await db.createTagType(name.trim())
    return NextResponse.json(tagType, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create tag type" }, { status: 500 })
  }
}
