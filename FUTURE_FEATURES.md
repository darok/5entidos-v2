# Future Features

## V3

- AI-generated recipe cover image: if a recipe has no image, auto-generate one via image-gen AI using the recipe title. Owner can refresh to get a new generation if unsatisfied.

- Scaling edge cases: non-linear ingredients (salt, yeast), indivisible ingredients (eggs → round to integer)
- Ingredient substitutes (new table: recipe_ingredient_substitutes)
- Cook session log: record when you cooked a recipe, add photo + note of how it went
- Sub-recipes: reference a recipe within another recipe's steps (e.g. "Lasagna" uses "Salsa Bechamel")
- Public shareable links per recipe
- AI suggestions: give a list of available ingredients, get recipe suggestions
- Prep time displayed separately in UI (field exists in DB, just not shown in v2)
- Recipe ordering by last cooked / favorites
