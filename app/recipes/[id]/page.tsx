import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Clock, Users, Pencil } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import * as db from "@/lib/db/recipes"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RatingDisplay } from "@/components/rating-display"
import { ServingScaler } from "./serving-scaler"
import { DeleteRecipeButton } from "./delete-recipe-button"
import { ShareButton } from "@/components/share-button"

interface Props {
  params: { id: string }
}

export default async function RecipeDetailPage({ params }: Props) {
  const recipe = await db.getById(params.id)
  if (!recipe) notFound()

  // Determine if the current user is the owner
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = !!user

  const tags = recipe.recipe_tags?.map((rt) => rt.tags) ?? []
  const ingredients = recipe.ingredients ?? []
  const steps = recipe.steps ?? []

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <h1 className="text-3xl font-bold text-foreground flex-1">{recipe.title}</h1>
          {isOwner && (
            <>
              <Button asChild variant="ghost" size="icon" className="mt-0.5 shrink-0">
                <Link href={`/recipes/${recipe.id}/edit`} aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <DeleteRecipeButton id={recipe.id} />
            </>
          )}
        </div>

        {/* Metrics row */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {recipe.prep_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {recipe.prep_time} min
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {recipe.servings} porciones
            </span>
          )}
        </div>

        {/* Tags + rating */}
        {(tags.length > 0 || recipe.rating) && (
          <div className="flex flex-wrap gap-2 items-center">
            <RatingDisplay rating={recipe.rating} />
            {tags.map((tag) => (
              <Badge key={tag.id} variant="outline">{tag.name}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      {recipe.image_url && (
        <div className="relative w-full overflow-hidden rounded-lg aspect-video">
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Description */}
      {recipe.description && (
        <p className="text-muted-foreground leading-relaxed">{recipe.description}</p>
      )}

      <Separator />

      {/* Ingredients with scaler */}
      {ingredients.length > 0 && (
        <section className="space-y-4">
          <ServingScaler
            originalServings={recipe.servings ?? 1}
            ingredients={ingredients}
          />
        </section>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Preparación</h2>
            <ol className="space-y-4">
              {steps.map((step) => (
                <li key={step.id} className="flex gap-4">
                  <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {step.step_number}
                  </span>
                  <p className="leading-relaxed pt-0.5">{step.description}</p>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      <ShareButton title={recipe.title} />
    </div>
  )
}
