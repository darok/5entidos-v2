import { createClient } from "@/lib/supabase/server"
import type { Ingredient } from "@/types"

// Returns all ingredients from the master catalog
export async function getAll(): Promise<Ingredient[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw new Error(`getAll ingredients failed: ${error.message}`)
  return data as Ingredient[]
}

// Creates a new ingredient in the master catalog
export async function create(name: string): Promise<Ingredient> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("ingredients")
    .insert({ name })
    .select()
    .single()

  if (error) throw new Error(`create ingredient failed: ${error.message}`)
  return data as Ingredient
}

// Updates an ingredient's name
export async function update(id: string, name: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("ingredients")
    .update({ name })
    .eq("id", id)

  if (error) throw new Error(`update ingredient failed: ${error.message}`)
}

// Deletes an ingredient — will fail if the ingredient is still referenced by a recipe
export async function deleteIngredient(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("ingredients").delete().eq("id", id)
  if (error) throw new Error(`delete ingredient failed: ${error.message}`)
}
