"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RecipeCard } from "@/components/recipe-card"
import { X } from "lucide-react"
import type { Recipe, Tag, Ingredient } from "@/types"

interface SearchFiltersProps {
  recipes: Recipe[]
  allTags: Tag[]
  allIngredients: Ingredient[]
}

// Client-side filtering: text search + tag multiselect + ingredient multiselect
export function SearchFilters({ recipes, allTags, allIngredients }: SearchFiltersProps) {
  const [query, setQuery] = useState("")
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set())
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<Set<string>>(new Set())

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function toggleIngredient(id: string) {
    setSelectedIngredientIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function clearAll() {
    setQuery("")
    setSelectedTagIds(new Set())
    setSelectedIngredientIds(new Set())
  }

  const filtered = useMemo(() => {
    return recipes.filter((recipe) => {
      // Text search
      if (query && !recipe.title.toLowerCase().includes(query.toLowerCase())) return false

      // Tag filter — recipe must have ALL selected tags
      if (selectedTagIds.size > 0) {
        const recipeTags = new Set(recipe.recipe_tags?.map((rt) => rt.tag_id) ?? [])
        for (const id of selectedTagIds) {
          if (!recipeTags.has(id)) return false
        }
      }

      // Ingredient filter — recipe must contain ALL selected ingredients
      if (selectedIngredientIds.size > 0) {
        const recipeIngredients = new Set(
          recipe.ingredients?.map((ri) => ri.ingredient_id) ?? []
        )
        for (const id of selectedIngredientIds) {
          if (!recipeIngredients.has(id)) return false
        }
      }

      return true
    })
  }, [recipes, query, selectedTagIds, selectedIngredientIds])

  const hasFilters = query || selectedTagIds.size > 0 || selectedIngredientIds.size > 0

  return (
    <div className="space-y-6">
      {/* Search + Clear */}
      <div className="flex gap-2">
        <Input
          placeholder="Buscar recetas…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={clearAll} aria-label="Limpiar filtros">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className="focus:outline-none"
            >
              <Badge
                variant={selectedTagIds.has(tag.id) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
              >
                {tag.name}
              </Badge>
            </button>
          ))}
        </div>
      )}

      {/* Ingredient chips — only show when there are ingredients */}
      {allIngredients.length > 0 && selectedIngredientIds.size > 0 && (
        <div className="flex flex-wrap gap-2">
          {allIngredients
            .filter((i) => selectedIngredientIds.has(i.id))
            .map((ing) => (
              <button key={ing.id} onClick={() => toggleIngredient(ing.id)} className="focus:outline-none">
                <Badge variant="default" className="cursor-pointer">
                  {ing.name} <X className="ml-1 h-3 w-3" />
                </Badge>
              </button>
            ))}
        </div>
      )}

      {/* Results grid */}
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No se encontraron recetas.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
