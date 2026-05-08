import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RatingDisplay } from "@/components/rating-display"
import type { Recipe } from "@/types"

interface RecipeCardProps {
  recipe: Recipe
}

// Card shown in the home grid for each recipe
export function RecipeCard({ recipe }: RecipeCardProps) {
  const tags = recipe.recipe_tags?.map((rt) => rt.tags) ?? []

  return (
    <Link href={`/recipes/${recipe.id}`} className="group block">
      <Card className="overflow-hidden transition-shadow hover:shadow-md h-full">
        {recipe.image_url && (
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}
        {!recipe.image_url && (
          <div className="aspect-[4/3] bg-muted flex items-center justify-center text-muted-foreground text-4xl">
            🍽
          </div>
        )}
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold text-base leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {recipe.title}
          </h2>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {recipe.prep_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {recipe.prep_time} min
              </span>
            )}
            {recipe.servings && (
              <span>{recipe.servings} porciones</span>
            )}
          </div>

          {(tags.length > 0 || recipe.rating) && (
            <div className="flex flex-wrap gap-1 pt-1">
              <RatingDisplay rating={recipe.rating} />
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
