import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import * as db from "@/lib/db/units"

export async function GET() {
  try {
    const units = await db.getAll()
    return NextResponse.json(units)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { name, abbreviation } = await request.json()
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 })
    if (!abbreviation?.trim()) return NextResponse.json({ error: "Abbreviation required" }, { status: 400 })

    const unit = await db.create(name.trim(), abbreviation.trim())
    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 })
  }
}
