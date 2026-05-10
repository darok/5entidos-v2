import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import * as db from "@/lib/db/recipes"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recipe = await db.getById(params.id)
    if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(recipe)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch recipe" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { ingredients = [], steps = [], tag_ids = [], ...recipeFields } = body

    await db.update(params.id, recipeFields, ingredients, steps, tag_ids)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    await db.deleteRecipe(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 })
  }
}

// PATCH — update only the rating field (used by rank view up/down arrows)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const rating: number | null = body.rating ?? null
    if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 4))
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 })

    const { error } = await supabase.from("recipes").update({ rating }).eq("id", params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update rating" }, { status: 500 })
  }
}
