import { createClient } from "@/lib/supabase/server"
import type { Recipe } from "@/types"

// ── Read ────────────────────────────────────────────────────────

// Returns all recipes with their tags — used for the home grid
export async function getAll(): Promise<Recipe[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("recipes")
    .select("*, recipe_tags(tags(*))")
    .order("created_at", { ascending: false })

  if (error) throw new Error(`getAll recipes failed: ${error.message}`)
  return data as Recipe[]
}

// Returns a single recipe with full detail: ingredients, steps, tags
export async function getById(id: string): Promise<Recipe | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      recipe_ingredients(*, ingredients(name), units(name, abbreviation)),
      recipe_steps(*),
      recipe_tags(tags(*))
    `)
    .eq("id", id)
    .order("step_number", { referencedTable: "recipe_steps", ascending: true })
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(`getById recipe failed: ${error.message}`)
  }

  // Supabase returns join results under the table name; remap to match the Recipe type
  const { recipe_ingredients, recipe_steps, ...rest } = data as Record<string, unknown>
  return { ...rest, ingredients: recipe_ingredients, steps: recipe_steps } as Recipe
}

// ── Write ────────────────────────────────────────────────────────

export interface RecipePayload {
  title: string
  description?: string | null
  image_url?: string | null
  prep_time?: string | null
  servings?: number | null
  rating?: number | null
}

export interface IngredientPayload {
  ingredient_id: string
  quantity?: number | null
  unit_id?: string | null
  optional: boolean
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

  const { error: recipeError } = await supabase
    .from("recipes")
    .update(recipe)
    .eq("id", id)

  if (recipeError) throw new Error(`update recipe failed: ${recipeError.message}`)

  // Delete all related rows then re-insert
  await Promise.all([
    supabase.from("recipe_ingredients").delete().eq("recipe_id", id),
    supabase.from("recipe_steps").delete().eq("recipe_id", id),
    supabase.from("recipe_tags").delete().eq("recipe_id", id),
  ])

  await _insertRelated(supabase, id, ingredients, steps, tagIds)
}

// Deletes a recipe; cascade handles related rows
export async function deleteRecipe(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("recipes").delete().eq("id", id)
  if (error) throw new Error(`delete recipe failed: ${error.message}`)
}

// ── Internal ─────────────────────────────────────────────────────

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
