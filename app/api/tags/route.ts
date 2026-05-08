import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import * as db from "@/lib/db/tags"

export async function GET() {
  try {
    const tags = await db.getAll()
    return NextResponse.json(tags)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { name, tag_type_id } = await request.json()
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 })

    const tag = await db.createTag(name.trim(), tag_type_id ?? null)
    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 })
  }
}
