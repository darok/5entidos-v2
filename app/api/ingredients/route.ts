import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import * as db from "@/lib/db/ingredients"

export async function GET() {
  try {
    const ingredients = await db.getAll()
    return NextResponse.json(ingredients)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch ingredients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { name } = await request.json()
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 })

    const ingredient = await db.create(name.trim())
    return NextResponse.json(ingredient, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create ingredient" }, { status: 500 })
  }
}
