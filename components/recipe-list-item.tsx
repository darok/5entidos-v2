"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { RatingDisplay } from "@/components/rating-display"
import type { Recipe } from "@/types"

interface RecipeListItemProps {
  recipe: Recipe
  onRatingUp?: () => void
  onRatingDown?: () => void
}

// Single row in list/rank view: small thumb + title + details + optional rating arrows
export function RecipeListItem({ recipe, onRatingUp, onRatingDown }: RecipeListItemProps) {
  const tags = recipe.recipe_tags?.map((rt) => rt.tags) ?? []
  const canUp = recipe.rating === null || recipe.rating < 4
  const canDown = recipe.rating !== null

  return (
    <div className="flex items-center gap-3 py-2.5">
      <Link href={`/recipes/${recipe.id}`} className="flex-shrink-0">
        <div className="relative h-14 w-14 overflow-hidden rounded-md bg-muted">
          {recipe.image_url ? (
            <Image src={recipe.image_url} alt={recipe.title} fill className="object-cover" sizes="56px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl">🍽</div>
          )}
        </div>
      </Link>

      <Link href={`/recipes/${recipe.id}`} className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight truncate">{recipe.title}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <RatingDisplay rating={recipe.rating} />
          {recipe.prep_time && (
            <span className="text-xs text-muted-foreground">{recipe.prep_time} min</span>
          )}
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-xs py-0 px-1.5 h-4">
              {tag.name}
            </Badge>
          ))}
        </div>
      </Link>

      {(onRatingUp !== undefined || onRatingDown !== undefined) && (
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          {canUp && onRatingUp && (
            <button
              onClick={onRatingUp}
              className="text-green-600 hover:text-green-700 text-base font-bold leading-none px-1 py-0.5"
              aria-label="Subir calificación"
            >
              ↑
            </button>
          )}
          {canDown && onRatingDown && (
            <button
              onClick={onRatingDown}
              className="text-red-500 hover:text-red-600 text-base font-bold leading-none px-1 py-0.5"
              aria-label="Bajar calificación"
            >
              ↓
            </button>
          )}
        </div>
      )}
    </div>
  )
}
