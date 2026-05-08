export interface Recipe {
  id: string
  title: string
  description: string | null
  image_url: string | null
  prep_time: number | null
  cook_time: number | null
  servings: number | null
  rating: number | null
  rating_note: string | null
  created_at: string
  updated_at: string
  ingredients?: RecipeIngredient[]
  steps?: RecipeStep[]
  tags?: RecipeTag[]
  recipe_tags?: RecipeTag[]
}

export interface RecipeIngredient {
  id: string
  recipe_id: string
  ingredient_id: string
  quantity: number | null
  unit_id: string | null
  optional: boolean
  ingredients: { name: string }
  units: { name: string; abbreviation: string } | null
}

export interface RecipeStep {
  id: string
  recipe_id: string
  step_number: number
  description: string
}

export interface RecipeTag {
  recipe_id: string
  tag_id: string
  tags: Tag
}

export interface Tag {
  id: string
  name: string
  tag_type_id: string | null
  tag_types?: TagType | null
}

export interface TagType {
  id: string
  name: string
}

export interface Ingredient {
  id: string
  name: string
}

export interface Unit {
  id: string
  name: string
  abbreviation: string
}

// Rating labels for the 4-tier system
export const RATING_LABELS: Record<number, string> = {
  1: 'Good',
  2: 'Great',
  3: 'Amazing',
  4: 'Top-tier',
}

// Shape returned by the AI extract endpoint
export interface ExtractedRecipe {
  title: string
  description: string | null
  cook_time: number | null
  servings: number | null
  ingredients: { name: string; quantity: number | null; unit: string | null }[]
  steps: string[]
}
