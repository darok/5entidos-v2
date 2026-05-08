"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Trash2, PlusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Ingredient, Unit } from "@/types"

export interface IngredientRowValue {
  ingredient_id: string
  ingredient_name: string
  quantity: string
  unit_id: string
  optional: boolean
}

interface IngredientRowProps {
  value: IngredientRowValue
  allIngredients: Ingredient[]
  allUnits: Unit[]
  onChange: (value: IngredientRowValue) => void
  onRemove: () => void
  onCreateIngredient: (name: string) => Promise<Ingredient>
}

// A single ingredient row with autocomplete, quantity, unit selector, and optional toggle
export function IngredientRow({
  value, allIngredients, allUnits, onChange, onRemove, onCreateIngredient,
}: IngredientRowProps) {
  const [nameInput, setNameInput] = useState(value.ingredient_name)
  const [suggestions, setSuggestions] = useState<Ingredient[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [creating, setCreating] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Filter suggestions when the name input changes
  useEffect(() => {
    if (!nameInput.trim()) { setSuggestions([]); return }
    const q = nameInput.toLowerCase()
    setSuggestions(allIngredients.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 8))
  }, [nameInput, allIngredients])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function selectIngredient(ing: Ingredient) {
    setNameInput(ing.name)
    setShowDropdown(false)
    onChange({ ...value, ingredient_id: ing.id, ingredient_name: ing.name })
  }

  async function handleCreate() {
    if (!nameInput.trim()) return
    setCreating(true)
    try {
      const ing = await onCreateIngredient(nameInput.trim())
      selectIngredient(ing)
    } finally {
      setCreating(false)
    }
  }

  const exactMatch = allIngredients.find(
    (i) => i.name.toLowerCase() === nameInput.toLowerCase()
  )
  const showCreate = nameInput.trim() && !exactMatch

  return (
    <div className="flex flex-wrap gap-2 items-start">
      {/* Ingredient autocomplete */}
      <div ref={wrapperRef} className="relative flex-1 min-w-[160px]">
        <Input
          value={nameInput}
          onChange={(e) => { setNameInput(e.target.value); setShowDropdown(true) }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Ingrediente…"
          className={value.ingredient_name && !value.ingredient_id ? "pr-16" : ""}
        />
        {value.ingredient_name && !value.ingredient_id && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <Badge variant="secondary" className="text-xs px-1.5 py-0">Nuevo</Badge>
          </span>
        )}
        {showDropdown && (suggestions.length > 0 || showCreate) && (
          <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md">
            {suggestions.map((ing) => (
              <button
                key={ing.id}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                onMouseDown={() => selectIngredient(ing)}
              >
                {ing.name}
              </button>
            ))}
            {showCreate && (
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-primary hover:bg-accent flex items-center gap-1"
                onMouseDown={handleCreate}
                disabled={creating}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Crear &quot;{nameInput}&quot;
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quantity */}
      <Input
        type="number"
        min={0}
        step="any"
        value={value.quantity}
        onChange={(e) => onChange({ ...value, quantity: e.target.value })}
        placeholder="Cant."
        className="w-20"
      />

      {/* Unit */}
      <Select
        value={value.unit_id}
        onValueChange={(v) => onChange({ ...value, unit_id: v })}
      >
        <SelectTrigger className="w-28">
          <SelectValue placeholder="Unidad" />
        </SelectTrigger>
        <SelectContent>
          {allUnits.map((u) => (
            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Optional */}
      <div className="flex items-center gap-1.5 self-center">
        <Checkbox
          id={`opt-${value.ingredient_id || Math.random()}`}
          checked={value.optional}
          onCheckedChange={(checked) => onChange({ ...value, optional: !!checked })}
        />
        <Label
          htmlFor={`opt-${value.ingredient_id || Math.random()}`}
          className="text-xs text-muted-foreground cursor-pointer"
        >
          Opcional
        </Label>
      </div>

      {/* Remove */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
        aria-label="Eliminar ingrediente"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
