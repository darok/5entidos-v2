"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { scaleQuantity } from "@/lib/utils"
import type { RecipeIngredient } from "@/types"

interface ServingScalerProps {
  originalServings: number
  ingredients: RecipeIngredient[]
}

// Allows scaling ingredient quantities by adjusting the serving count
export function ServingScaler({ originalServings, ingredients }: ServingScalerProps) {
  const [servings, setServings] = useState(originalServings)
  const scale = servings / originalServings

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val) && val > 0) setServings(val)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold">Ingredientes</h2>
        <div className="flex items-center gap-2 ml-auto">
          <Label htmlFor="servings" className="text-sm text-muted-foreground whitespace-nowrap">
            Porciones
          </Label>
          <Input
            id="servings"
            type="number"
            min={1}
            value={servings}
            onChange={handleChange}
            className="w-16 text-center"
          />
        </div>
      </div>

      <ul className="space-y-1.5">
        {ingredients.map((ing) => {
          const scaled = scaleQuantity(ing.quantity, scale)
          const qty = scaled !== null ? (Number.isInteger(scaled) ? scaled : scaled.toFixed(1)) : ""
          const unit = ing.units?.abbreviation ?? ""
          const name = ing.ingredients.name

          return (
            <li key={ing.id} className="flex gap-2 text-sm">
              <span className="text-muted-foreground min-w-[5rem] text-right">
                {qty} {unit}
              </span>
              <span>
                {name}
                {ing.optional && (
                  <span className="ml-1 text-muted-foreground">(opcional)</span>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
