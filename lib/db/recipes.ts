import { createClient } from "@/lib/supabase/server"
import { RECIPE_IMAGES_BUCKET, pathFromImageUrl } from "@/lib/storage"
import type { Recipe } from "@/types"

type SupabaseServerClient = ReturnType<typeof createClient>

// ── Read ────────────────────────────────────────────────────────

// Returns all recipes with their tags — used for the home grid
export async function getAll(): Promise<Recipe[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("recipes")
    .select("*, recipe_tags(tag_id, tags(*))")
    .order("created_at", { ascending: false })

  if (error) throw new Error(`getAll recipes failed: ${error.message}`)
  return data as Recipe[]
}

const FULL_RECIPE_SELECT = `
  *,
  recipe_ingredients(*, ingredients(name), units(name, abbreviation)),
  recipe_steps(*),
  recipe_tags(tag_id, tags(*))
`

// Supabase returns join results under the table name; remap to match the Recipe type
function _toRecipe(row: Record<string, unknown>): Recipe {
  const { recipe_ingredients, recipe_steps, ...rest } = row
  return { ...rest, ingredients: recipe_ingredients, steps: recipe_steps } as Recipe
}

// Returns a single recipe with full detail: ingredients, steps, tags
export async function getById(id: string): Promise<Recipe | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("recipes")
    .select(FULL_RECIPE_SELECT)
    .eq("id", id)
    .order("step_number", { referencedTable: "recipe_steps", ascending: true })
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(`getById recipe failed: ${error.message}`)
  }

  return _toRecipe(data as Record<string, unknown>)
}

// Returns every recipe with full detail — used by the export feature
export async function getAllForExport(): Promise<Recipe[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("recipes")
    .select(FULL_RECIPE_SELECT)
    .order("created_at", { ascending: false })
    .order("step_number", { referencedTable: "recipe_steps", ascending: true })

  if (error) throw new Error(`getAllForExport recipes failed: ${error.message}`)
  return (data as Record<string, unknown>[]).map(_toRecipe)
}

// ── Write ────────────────────────────────────────────────────────

export interface RecipePayload {
  title: string
  description?: string | null
  image_url?: string | null
  prep_time?: string | null
  servings?: number | null
  rating?: number | null
  notes?: string | null
}

export interface IngredientPayload {
  ingredient_id: string
  quantity?: number | null
  unit_id?: string | null
  optional: boolean
  comment?: string | null
}

export interface StepPayload {
  step_number: number
  description: string
}

// Creates a recipe with its related ingredients, steps, and tags
export async function create(
  recipe: RecipePayload,
  ingredients: IngredientPayload[],
  steps: StepPayload[],
  tagIds: string[]
): Promise<Recipe> {
  const supabase = createClient()

  const { data: recipeRow, error: recipeError } = await supabase
    .from("recipes")
    .insert(recipe)
    .select()
    .single()

  if (recipeError) throw new Error(`create recipe failed: ${recipeError.message}`)

  await _insertRelated(supabase, recipeRow.id, ingredients, steps, tagIds)

  return recipeRow as Recipe
}

// Updates a recipe's fields and replaces all related ingredients, steps, and tags
export async function update(
  id: string,
  recipe: Partial<RecipePayload>,
  ingredients: IngredientPayload[],
  steps: StepPayload[],
  tagIds: string[]
): Promise<void> {
  const supabase = createClient()

  const previousImageUrl = recipe.image_url !== undefined ? await _getImageUrl(supabase, id) : null

  const { error: recipeError } = await supabase
    .from("recipes")
    .update(recipe)
    .eq("id", id)

  if (recipeError) throw new Error(`update recipe failed: ${recipeError.message}`)

  if (previousImageUrl && previousImageUrl !== recipe.image_url) {
    await _deleteImageIfUnreferenced(supabase, previousImageUrl)
  }

  // Delete then re-insert — sequential so a failed re-insert is not preceded by all 3 deletes
  await supabase.from("recipe_ingredients").delete().eq("recipe_id", id)
  await supabase.from("recipe_steps").delete().eq("recipe_id", id)
  await supabase.from("recipe_tags").delete().eq("recipe_id", id)

  await _insertRelated(supabase, id, ingredients, steps, tagIds)
}

// Deletes a recipe; cascade handles related rows
export async function deleteRecipe(id: string): Promise<void> {
  const supabase = createClient()
  const imageUrl = await _getImageUrl(supabase, id)
  const { error } = await supabase.from("recipes").delete().eq("id", id)
  if (error) throw new Error(`delete recipe failed: ${error.message}`)
  if (imageUrl) await _deleteImageIfUnreferenced(supabase, imageUrl)
}

// ── Internal ─────────────────────────────────────────────────────

// Returns a recipe's current image_url (null if it has none)
async function _getImageUrl(supabase: SupabaseServerClient, recipeId: string): Promise<string | null> {
  const { data, error } = await supabase.from("recipes").select("image_url").eq("id", recipeId).single()
  if (error) throw new Error(`read recipe image failed: ${error.message}`)
  return data?.image_url ?? null
}

// Removes a replaced image from Storage, unless it's external or another recipe still uses it.
// Runs only after a successful save, so an abandoned edit never leaves a recipe pointing at a deleted file.
async function _deleteImageIfUnreferenced(supabase: SupabaseServerClient, imageUrl: string): Promise<void> {
  const path = pathFromImageUrl(imageUrl)
  if (!path) return

  const { count, error: countError } = await supabase
    .from("recipes")
    .select("id", { count: "exact", head: true })
    .eq("image_url", imageUrl)
  if (countError) {
    console.error("Skipped deleting replaced image, reference check failed:", countError.message)
    return
  }
  if (count && count > 0) return

  const { error } = await supabase.storage.from(RECIPE_IMAGES_BUCKET).remove([path])
  if (error) console.error("Failed to delete replaced image:", error.message)
}

// Inserts related rows after recipe creation or update
async function _insertRelated(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  recipeId: string,
  ingredients: IngredientPayload[],
  steps: StepPayload[],
  tagIds: string[]
): Promise<void> {
  const inserts: Promise<unknown>[] = []

  if (ingredients.length > 0) {
    inserts.push(
      supabase.from("recipe_ingredients").insert(
        ingredients.map((i) => ({ ...i, recipe_id: recipeId }))
      )
    )
  }

  if (steps.length > 0) {
    inserts.push(
      supabase.from("recipe_steps").insert(
        steps.map((s) => ({ ...s, recipe_id: recipeId }))
      )
    )
  }

  if (tagIds.length > 0) {
    inserts.push(
      supabase.from("recipe_tags").insert(
        tagIds.map((tag_id) => ({ recipe_id: recipeId, tag_id }))
      )
    )
  }

  const results = await Promise.all(inserts)
  for (const result of results) {
    const { error } = result as { error: { message: string } | null }
    if (error) throw new Error(`insertRelated failed: ${error.message}`)
  }
}
