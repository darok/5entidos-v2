import { notFound } from "next/navigation"
import * as db from "@/lib/db/recipes"
import { getAll as getAllTags } from "@/lib/db/tags"
import { getAll as getAllIngredients } from "@/lib/db/ingredients"
import { getAll as getAllUnits } from "@/lib/db/units"
import { RecipeForm, type RecipeFormData } from "@/components/recipe-form"

interface Props {
  params: { id: string }
}

// Loads recipe + catalog data server-side, passes as initialData to the shared form
export default async function EditRecipePage({ params }: Props) {
  const [recipe, tags, ingredients, units] = await Promise.all([
    db.getById(params.id),
    getAllTags(),
    getAllIngredients(),
    getAllUnits(),
  ])

  if (!recipe) notFound()

  const initialData: Partial<RecipeFormData> = {
    title: recipe.title,
    description: recipe.description ?? "",
    image_url: recipe.image_url,
    prep_time: recipe.prep_time != null ? String(recipe.prep_time) : "",
    cook_time: recipe.cook_time != null ? String(recipe.cook_time) : "",
    servings: recipe.servings != null ? String(recipe.servings) : "",
    rating: recipe.rating != null ? String(recipe.rating) : "",
    rating_note: recipe.rating_note ?? "",
    ingredients: recipe.ingredients?.map((ri) => ({
      ingredient_id: ri.ingredient_id,
      ingredient_name: ri.ingredients.name,
      quantity: ri.quantity != null ? String(ri.quantity) : "",
      unit_id: ri.unit_id ?? "",
      optional: ri.optional,
    })) ?? [],
    steps: recipe.steps?.map((s) => s.description) ?? [],
    tag_ids: recipe.recipe_tags?.map((rt) => rt.tag_id) ?? [],
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Editar receta</h1>
      <RecipeForm
        initialData={initialData}
        allTags={tags}
        allIngredients={ingredients}
        allUnits={units}
        recipeId={recipe.id}
      />
    </div>
  )
}
