import { SearchFilters } from "@/components/search-filters"
import * as recipesDb from "@/lib/db/recipes"
import * as tagsDb from "@/lib/db/tags"
import * as ingredientsDb from "@/lib/db/ingredients"

// Home page — public, server-rendered, passes data to client-side filters
export default async function HomePage() {
  const [recipes, tags, ingredients] = await Promise.all([
    recipesDb.getAll(),
    tagsDb.getAll(),
    ingredientsDb.getAll(),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <SearchFilters
        recipes={recipes}
        allTags={tags}
        allIngredients={ingredients}
      />
    </div>
  )
}
