import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import * as db from "@/lib/db/recipes"

export async function GET() {
  try {
    const recipes = await db.getAll()
    return NextResponse.json(recipes)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { ingredients = [], steps = [], tag_ids = [], ...recipeFields } = body

    const recipe = await db.create(recipeFields, ingredients, steps, tag_ids)
    return NextResponse.json(recipe, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 })
  }
}
