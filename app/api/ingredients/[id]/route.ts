import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import * as db from "@/lib/db/ingredients"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { name } = await request.json()
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 })

    await db.update(params.id, name.trim())
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update ingredient" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { target_id } = await request.json()
    if (!target_id) return NextResponse.json({ error: "target_id required" }, { status: 400 })

    const { error: updateError } = await supabase
      .from("recipe_ingredients")
      .update({ ingredient_id: target_id })
      .eq("ingredient_id", params.id)
    if (updateError) throw new Error(updateError.message)

    const { error: deleteError } = await supabase
      .from("ingredients")
      .delete()
      .eq("id", params.id)
    if (deleteError) throw new Error(deleteError.message)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to merge ingredient" }, { status: 500 })
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
    // Check if any recipes use this ingredient before deleting
    const { data: usages } = await supabase
      .from("recipe_ingredients")
      .select("recipes(id, title)")
      .eq("ingredient_id", params.id)

    if (usages && usages.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recipes = usages.map((u: any) => u.recipes).filter(Boolean)
      return NextResponse.json({ error: "in_use", recipes }, { status: 409 })
    }

    await db.deleteIngredient(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete ingredient" }, { status: 500 })
  }
}
