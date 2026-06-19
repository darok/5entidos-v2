"use client"

import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RecipeCard } from "@/components/recipe-card"
import { RecipeListItem } from "@/components/recipe-list-item"
import { X, LayoutGrid, List, Trophy } from "lucide-react"
import { useAuth } from "@/components/providers"
import { RATING_LABELS } from "@/types"
import type { Recipe, Tag, Ingredient } from "@/types"

type ViewMode = "mosaic" | "list" | "rank"
type SortMode = "newest" | "oldest" | "rating"

const RANK_TIERS: { rating: number | null; stars: string }[] = [
  { rating: 4, stars: "★★★★" },
  { rating: 3, stars: "★★★☆" },
  { rating: 2, stars: "★★☆☆" },
  { rating: 1, stars: "★☆☆☆" },
  { rating: null, stars: "" },
]

interface SearchFiltersProps {
  recipes: Recipe[]
  allTags: Tag[]
  allIngredients: Ingredient[]
}

// Client-side filtering: text search + tag multiselect + ingredient multiselect + view mode toggle
export function SearchFilters({ recipes, allTags, allIngredients }: SearchFiltersProps) {
  // Local copy enables optimistic rating mutations in rank view
  const [localRecipes, setLocalRecipes] = useState<Recipe[]>(recipes)
  useEffect(() => setLocalRecipes(recipes), [recipes])

  const { user } = useAuth()

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "mosaic"
    return (localStorage.getItem("recipe-view-mode") as ViewMode) ?? "mosaic"
  })

  const [query, setQuery] = useState("")
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set())
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState<SortMode>("newest")

  function setAndPersistViewMode(mode: ViewMode) {
    setViewMode(mode)
    localStorage.setItem("recipe-view-mode", mode)
  }

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

  // Optimistic rating update — changes local state immediately, rolls back on API failure
  function handleRatingChange(recipeId: string, delta: 1 | -1) {
    const recipe = localRecipes.find((r) => r.id === recipeId)
    if (!recipe) return
    const raw = recipe.rating === null ? (delta === 1 ? 1 : null) : recipe.rating + delta
    const newRating: number | null = raw === null || raw < 1 ? null : raw > 4 ? 4 : raw

    const snapshot = localRecipes
    setLocalRecipes((curr) =>
      curr.map((r) => r.id === recipeId ? { ...r, rating: newRating } : r)
    )
    fetch(`/api/recipes/${recipeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: newRating }),
    }).catch(() => setLocalRecipes(snapshot))
  }

  const filtered = useMemo(() => {
    const matches = localRecipes.filter((recipe) => {
      if (query && !recipe.title.toLowerCase().includes(query.toLowerCase())) return false

      if (selectedTagIds.size > 0) {
        const recipeTags = new Set(recipe.recipe_tags?.map((rt) => rt.tag_id) ?? [])
        for (const id of selectedTagIds) {
          if (!recipeTags.has(id)) return false
        }
      }

      if (selectedIngredientIds.size > 0) {
        const recipeIngredients = new Set(recipe.ingredients?.map((ri) => ri.ingredient_id) ?? [])
        for (const id of selectedIngredientIds) {
          if (!recipeIngredients.has(id)) return false
        }
      }

      return true
    })

    return [...matches].sort((a, b) => {
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [localRecipes, query, selectedTagIds, selectedIngredientIds, sort])

  const hasFilters = query || selectedTagIds.size > 0 || selectedIngredientIds.size > 0

  return (
    <div className="space-y-6">
      {/* Search row + view toggle */}
      <div className="flex items-center gap-2">
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
        <div className="ml-auto flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="text-sm border rounded px-2 py-1 bg-background"
          >
            <option value="newest">Más nuevas</option>
            <option value="oldest">Más antiguas</option>
            <option value="rating">Mejor calificadas</option>
          </select>
          <div className="flex items-center gap-1">
          {(["mosaic", "list", "rank"] as const).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setAndPersistViewMode(mode)}
              aria-label={
                mode === "mosaic" ? "Vista mosaico" :
                mode === "list" ? "Vista lista" : "Vista ranking"
              }
            >
              {mode === "mosaic" && <LayoutGrid className="h-4 w-4" />}
              {mode === "list" && <List className="h-4 w-4" />}
              {mode === "rank" && <Trophy className="h-4 w-4" />}
            </Button>
          ))}
          </div>
        </div>
      </div>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button key={tag.id} onClick={() => toggleTag(tag.id)} className="focus:outline-none">
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

      {/* Selected ingredient chips */}
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

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">No se encontraron recetas.</p>
      ) : viewMode === "mosaic" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
        </div>
      ) : viewMode === "list" ? (
        <div className="divide-y">
          {filtered.map((recipe) => <RecipeListItem key={recipe.id} recipe={recipe} />)}
        </div>
      ) : (
        <RankView recipes={filtered} isOwner={!!user} onRatingChange={handleRatingChange} />
      )}
    </div>
  )
}

// ── Rank view ─────────────────────────────────────────────────────────────────

function RankView({
  recipes,
  isOwner,
  onRatingChange,
}: {
  recipes: Recipe[]
  isOwner: boolean
  onRatingChange: (id: string, delta: 1 | -1) => void
}) {
  return (
    <div className="space-y-8">
      {RANK_TIERS.map(({ rating, stars }) => {
        const group = recipes.filter((r) => r.rating === rating)
        if (group.length === 0) return null
        const label = rating !== null ? RATING_LABELS[rating] : "Sin calificación"
        return (
          <section key={String(rating)}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              {stars && <span className="text-amber-400">{stars}</span>}
              {label}
              <span className="font-normal">({group.length})</span>
            </h3>
            <div className="divide-y">
              {group.map((recipe) => (
                <RecipeListItem
                  key={recipe.id}
                  recipe={recipe}
                  onRatingUp={
                    isOwner && recipe.rating !== 4
                      ? () => onRatingChange(recipe.id, 1)
                      : undefined
                  }
                  onRatingDown={
                    isOwner && recipe.rating !== null
                      ? () => onRatingChange(recipe.id, -1)
                      : undefined
                  }
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
