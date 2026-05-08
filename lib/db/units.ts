import { createClient } from "@/lib/supabase/server"
import type { Unit } from "@/types"

// Returns all units ordered by sort_order then name
export async function getAll(): Promise<Unit[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) throw new Error(`getAll units failed: ${error.message}`)
  return data as Unit[]
}

// Batch-updates sort_order for multiple units (called after drag-and-drop reorder)
export async function reorderUnits(items: { id: string; sort_order: number }[]): Promise<void> {
  const supabase = createClient()
  const results = await Promise.all(
    items.map(({ id, sort_order }) =>
      supabase.from("units").update({ sort_order }).eq("id", id)
    )
  )
  for (const { error } of results) {
    if (error) throw new Error(`reorderUnits failed: ${error.message}`)
  }
}

// Creates a new unit
export async function create(name: string, abbreviation: string): Promise<Unit> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("units")
    .insert({ name, abbreviation })
    .select()
    .single()

  if (error) throw new Error(`create unit failed: ${error.message}`)
  return data as Unit
}

// Updates a unit's name and abbreviation
export async function update(id: string, name: string, abbreviation: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("units")
    .update({ name, abbreviation })
    .eq("id", id)

  if (error) throw new Error(`update unit failed: ${error.message}`)
}

// Deletes a unit — sets unit_id to null on affected recipe_ingredients
export async function deleteUnit(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("units").delete().eq("id", id)
  if (error) throw new Error(`delete unit failed: ${error.message}`)
}
