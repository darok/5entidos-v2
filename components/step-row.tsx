"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface StepRowProps {
  index: number
  value: string
  onChange: (value: string) => void
  onRemove: () => void
}

// A single numbered step row with a textarea and remove button
export function StepRow({ index, value, onChange, onRemove }: StepRowProps) {
  return (
    <div className="flex gap-3 items-start">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold mt-2">
        {index + 1}
      </span>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Paso ${index + 1}…`}
        className="flex-1 min-h-[4rem] resize-none"
        rows={2}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="mt-2 flex-shrink-0 text-muted-foreground hover:text-destructive"
        aria-label="Eliminar paso"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
