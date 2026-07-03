"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { ExtractedRecipe } from "@/types"

interface ExtractedRecipePreviewProps {
  extracted: ExtractedRecipe
  onLoadForm: () => void
  onReExtract?: () => void
  reExtracting?: boolean
}

// Preview card shown after any import method extracts a recipe, before loading the form
export function ExtractedRecipePreview({
  extracted,
  onLoadForm,
  onReExtract,
  reExtracting,
}: ExtractedRecipePreviewProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border p-4 space-y-3 text-sm">
        <p><span className="font-medium">Título:</span> {extracted.title}</p>
        {extracted.description && (
          <p><span className="font-medium">Descripción:</span> {extracted.description}</p>
        )}
        {extracted.servings != null && (
          <p><span className="font-medium">Porciones:</span> {extracted.servings}</p>
        )}
        {extracted.ingredients?.length > 0 && (
          <div>
            <p className="font-medium mb-1">Ingredientes:</p>
            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
              {extracted.ingredients.map((ing, i) => (
                <li key={i}>
                  {ing.quantity != null ? `${ing.quantity} ` : ""}
                  {ing.unit ? `${ing.unit} ` : ""}
                  {ing.name}
                  {ing.comment ? ` (${ing.comment})` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
        {extracted.steps?.length > 0 && (
          <div>
            <p className="font-medium mb-1">Pasos:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
              {extracted.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>
        )}
        {extracted.notes && (
          <p className="text-muted-foreground italic border-t pt-2">
            <span className="font-medium not-italic text-foreground">Notas:</span> {extracted.notes}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={onLoadForm}>
          <ArrowRight className="mr-2 h-4 w-4" />
          Cargar al formulario
        </Button>
        {onReExtract && (
          <Button variant="outline" onClick={onReExtract} disabled={reExtracting}>
            {reExtracting ? "Re-extrayendo…" : "Re-extraer"}
          </Button>
        )}
      </div>
    </div>
  )
}
