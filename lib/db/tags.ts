import { createClient } from "@/lib/supabase/server"
import type { Tag, TagType } from "@/types"

// ── Tags ────────────────────────────────────────────────────────

// Returns all tags with their optional tag type
export async function getAll(): Promise<Tag[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("tags")
    .select("*, tag_types(*)")
    .order("name", { ascending: true })

  if (error) throw new Error(`getAll tags failed: ${error.message}`)
  return data as Tag[]
}

// Creates a new tag, optionally linked to a tag type
export async function createTag(name: string, tagTypeId: string | null): Promise<Tag> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("tags")
    .insert({ name, tag_type_id: tagTypeId })
    .select("*, tag_types(*)")
    .single()

  if (error) throw new Error(`createTag failed: ${error.message}`)
  return data as Tag
}

// Updates a tag's name and/or type
export async function updateTag(
  id: string,
  name: string,
  tagTypeId: string | null
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("tags")
    .update({ name, tag_type_id: tagTypeId })
    .eq("id", id)

  if (error) throw new Error(`updateTag failed: ${error.message}`)
}

// Deletes a tag
export async function deleteTag(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("tags").delete().eq("id", id)
  if (error) throw new Error(`deleteTag failed: ${error.message}`)
}

// ── Tag Types ───────────────────────────────────────────────────

// Returns all tag types
export async function getAllTypes(): Promise<TagType[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("tag_types")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw new Error(`getAllTypes failed: ${error.message}`)
  return data as TagType[]
}

// Creates a new tag type
export async function createTagType(name: string): Promise<TagType> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("tag_types")
    .insert({ name })
    .select()
    .single()

  if (error) throw new Error(`createTagType failed: ${error.message}`)
  return data as TagType
}

// Updates a tag type's name
export async function updateTagType(id: string, name: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("tag_types").update({ name }).eq("id", id)
  if (error) throw new Error(`updateTagType failed: ${error.message}`)
}

// Deletes a tag type — sets tag_type_id to null on associated tags
export async function deleteTagType(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from("tag_types").delete().eq("id", id)
  if (error) throw new Error(`deleteTagType failed: ${error.message}`)
}
