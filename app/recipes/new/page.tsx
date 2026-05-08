"use client"

import { useEffect, useState } from "react"
import { RecipeForm, type RecipeFormData } from "@/components/recipe-form"
import { useAudioRecipeStore } from "@/lib/stores/audio-recipe"
import type { Tag, Ingredient, Unit } from "@/types"

// Fetches catalog data on mount and pre-fills from audio store if available
export default function NewRecipePage() {
  const { data: audioData, clear } = useAudioRecipeStore()
  const [tags, setTags] = useState<Tag[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [initialData, setInitialData] = useState<Partial<RecipeFormData> | undefined>(undefined)
  const [fromAudio, setFromAudio] = useState(false)
  const [audioNotes, setAudioNotes] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [tagsRes, ingredientsRes, unitsRes] = await Promise.all([
        fetch("/api/tags"),
        fetch("/api/ingredients"),
        fetch("/api/units"),
      ])
      const [tagsData, ingredientsData, unitsData] = await Promise.all([
        tagsRes.json(),
        ingredientsRes.json(),
        unitsRes.json(),
      ])
      setTags(tagsData)
      setIngredients(ingredientsData)
      setUnits(unitsData)

      if (audioData) {
        setFromAudio(true)
        setAudioNotes(audioData.notes ?? null)
        const prefill: Partial<RecipeFormData> = {
          title: audioData.title ?? "",
          description: audioData.description ?? "",
          cook_time: audioData.cook_time != null ? String(audioData.cook_time) : "",
          servings: audioData.servings != null ? String(audioData.servings) : "",
          ingredients: audioData.ingredients?.map((ing) => {
            const match = (ingredientsData as Ingredient[]).find(
              (i) => i.name.toLowerCase() === ing.name.toLowerCase()
            )
            const unitMatch = (unitsData as Unit[]).find(
              (u) =>
                u.name.toLowerCase() === ing.unit?.toLowerCase() ||
                u.abbreviation.toLowerCase() === ing.unit?.toLowerCase()
            )
            return {
              ingredient_id: match?.id ?? "",
              ingredient_name: ing.name,
              quantity: ing.quantity != null ? String(ing.quantity) : "",
              unit_id: unitMatch?.id ?? "",
              optional: false,
            }
          }) ?? [{ ingredient_id: "", ingredient_name: "", quantity: "", unit_id: "", optional: false }],
          steps: audioData.steps?.length ? audioData.steps : [""],
        }
        setInitialData(prefill)
        clear()
      }

      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="container max-w-2xl py-8">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Nueva receta</h1>
      <RecipeForm
        initialData={initialData}
        allTags={tags}
        allIngredients={ingredients}
        allUnits={units}
        fromAudio={fromAudio}
        audioNotes={audioNotes}
      />
    </div>
  )
}
