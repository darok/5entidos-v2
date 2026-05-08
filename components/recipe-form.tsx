"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { ImageUpload } from "@/components/image-upload"
import { IngredientRow, type IngredientRowValue } from "@/components/ingredient-row"
import { StepRow } from "@/components/step-row"
import { PlusCircle, X, Pencil, Check } from "lucide-react"
import type { Tag, Ingredient, Unit } from "@/types"

// ── Constants ─────────────────────────────────────────────────────

const TIME_OPTIONS = ["0-30", "30-60", "60-120", "120+"] as const
const SERVING_OPTIONS = ["2", "4", "6", "8"] as const

// ── Types ─────────────────────────────────────────────────────────

export interface RecipeFormData {
  title: string
  description: string
  image_url: string | null
  prep_time: string
  servings: string
  rating: string
  ingredients: IngredientRowValue[]
  steps: string[]
  tag_ids: string[]
}

interface RecipeFormProps {
  initialData?: Partial<RecipeFormData>
  allTags: Tag[]
  allIngredients: Ingredient[]
  allUnits: Unit[]
  recipeId?: string  // present when editing
  fromAudio?: boolean
  audioNotes?: string | null
}

// ── Helpers ───────────────────────────────────────────────────────

function emptyIngredient(): IngredientRowValue {
  return { ingredient_id: "", ingredient_name: "", quantity: "", unit_id: "", optional: false }
}

function defaultForm(): RecipeFormData {
  return {
    title: "",
    description: "",
    image_url: null,
    prep_time: "",
    servings: "",
    rating: "",
    ingredients: [emptyIngredient()],
    steps: [""],
    tag_ids: [],
  }
}

// ── Component ─────────────────────────────────────────────────────

// Shared form for creating and editing recipes
export function RecipeForm({
  initialData,
  allTags,
  allIngredients,
  allUnits,
  recipeId,
  fromAudio,
  audioNotes,
}: RecipeFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<RecipeFormData>({ ...defaultForm(), ...initialData })
  const [localIngredients, setLocalIngredients] = useState<Ingredient[]>(allIngredients)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBanner, setShowBanner] = useState(true)
  const [showCustomServings, setShowCustomServings] = useState(
    () => !!initialData?.servings && !SERVING_OPTIONS.includes(initialData.servings as typeof SERVING_OPTIONS[number])
  )
  const [notesEditing, setNotesEditing] = useState(false)
  const [notesText, setNotesText] = useState(audioNotes ?? "")
  const [pendingNewIngredients, setPendingNewIngredients] = useState<string[]>([])

  function setField<K extends keyof RecipeFormData>(key: K, value: RecipeFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleTag(id: string) {
    setField(
      "tag_ids",
      form.tag_ids.includes(id)
        ? form.tag_ids.filter((t) => t !== id)
        : [...form.tag_ids, id]
    )
  }

  function updateIngredient(index: number, value: IngredientRowValue) {
    const next = [...form.ingredients]
    next[index] = value
    setField("ingredients", next)
  }

  function removeIngredient(index: number) {
    setField("ingredients", form.ingredients.filter((_, i) => i !== index))
  }

  function updateStep(index: number, value: string) {
    const next = [...form.steps]
    next[index] = value
    setField("steps", next)
  }

  function removeStep(index: number) {
    setField("steps", form.steps.filter((_, i) => i !== index))
  }

  async function createIngredient(name: string): Promise<Ingredient> {
    const res = await fetch("/api/ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    const ing = await res.json()
    setLocalIngredients((prev) => [...prev, ing].sort((a, b) => a.name.localeCompare(b.name)))
    return ing
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Check for ingredient rows with a name but no DB id
    const unresolved = form.ingredients
      .filter((i) => !i.ingredient_id && i.ingredient_name.trim())
      .map((i) => i.ingredient_name.trim())

    if (unresolved.length > 0) {
      setPendingNewIngredients(unresolved)
      return
    }

    await doSave(form.ingredients)
  }

  async function handleConfirmCreateIngredients() {
    setPendingNewIngredients([])
    setSaving(true)
    setError(null)

    try {
      // Create each new ingredient and patch the form rows with real IDs
      const updatedIngredients = [...form.ingredients]
      for (let i = 0; i < updatedIngredients.length; i++) {
        const row = updatedIngredients[i]
        if (!row.ingredient_id && row.ingredient_name.trim()) {
          const ing = await createIngredient(row.ingredient_name.trim())
          updatedIngredients[i] = { ...row, ingredient_id: ing.id }
        }
      }
      await doSave(updatedIngredients)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear ingredientes")
      setSaving(false)
    }
  }

  async function doSave(ingredients: IngredientRowValue[]) {
    setSaving(true)
    setError(null)

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      image_url: form.image_url,
      prep_time: form.prep_time || null,
      servings: form.servings ? parseInt(form.servings) : null,
      rating: form.rating ? parseInt(form.rating) : null,
      ingredients: ingredients
        .filter((i) => i.ingredient_id)
        .map((i) => ({
          ingredient_id: i.ingredient_id,
          quantity: i.quantity ? parseFloat(i.quantity) : null,
          unit_id: i.unit_id || null,
          optional: i.optional,
        })),
      steps: form.steps
        .map((s, idx) => ({ step_number: idx + 1, description: s.trim() }))
        .filter((s) => s.description),
      tag_ids: form.tag_ids,
    }

    try {
      const url = recipeId ? `/api/recipes/${recipeId}` : "/api/recipes"
      const method = recipeId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Error al guardar")
      }

      const data = await res.json()
      const id = recipeId ?? data.id
      router.push(`/recipes/${id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setSaving(false)
    }
  }

  const newIngredientCount = form.ingredients.filter(
    (i) => i.ingredient_id === "" && i.ingredient_name !== ""
  ).length

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Audio warning banner */}
      {fromAudio && showBanner && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-md px-4 py-3 flex items-start justify-between gap-3 text-sm">
          <span>
            Datos cargados desde audio — revisá los campos antes de guardar.
            {newIngredientCount > 0 && (
              <> <strong>{newIngredientCount} ingrediente{newIngredientCount !== 1 ? "s" : ""} nuevo{newIngredientCount !== 1 ? "s" : ""}</strong> serán creados al guardar.</>
            )}
          </span>
          <button type="button" onClick={() => setShowBanner(false)} aria-label="Cerrar aviso" className="shrink-0 mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Basic fields */}
      <section className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={2}
          />
        </div>

        <ImageUpload value={form.image_url} onChange={(url) => setField("image_url", url)} searchHint={form.title} />

        {/* Time + servings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tiempo (min)</Label>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setField("prep_time", form.prep_time === opt ? "" : opt)}
                  className="focus:outline-none"
                >
                  <Badge variant={form.prep_time === opt ? "default" : "outline"} className="cursor-pointer">
                    {opt}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Porciones</Label>
            <div className="flex flex-wrap gap-2 items-center">
              {SERVING_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { setField("servings", form.servings === opt ? "" : opt); setShowCustomServings(false) }}
                  className="focus:outline-none"
                >
                  <Badge variant={!showCustomServings && form.servings === opt ? "default" : "outline"} className="cursor-pointer">
                    {opt}
                  </Badge>
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setShowCustomServings(true); setField("servings", "") }}
                className="focus:outline-none"
              >
                <Badge variant={showCustomServings ? "default" : "outline"} className="cursor-pointer">Otro</Badge>
              </button>
              {showCustomServings && (
                <Input
                  type="number"
                  min={1}
                  value={form.servings}
                  onChange={(e) => setField("servings", e.target.value)}
                  className="w-20 h-7 text-sm"
                  autoFocus
                />
              )}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <Label>Calificación</Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setField("rating", form.rating === String(n) ? "" : String(n))}
                className="focus:outline-none"
              >
                <span className={`text-2xl leading-none ${parseInt(form.rating) >= n ? "text-amber-400" : "text-muted-foreground"}`}>
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Tags */}
      {allTags.length > 0 && (
        <section className="space-y-3">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)} className="focus:outline-none">
                <Badge
                  variant={form.tag_ids.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {tag.name}
                  {form.tag_ids.includes(tag.id) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              </button>
            ))}
          </div>
        </section>
      )}

      <Separator />

      {/* Ingredients */}
      <section className="space-y-3">
        <Label>Ingredientes</Label>
        <div className="space-y-3">
          {form.ingredients.map((ing, i) => (
            <IngredientRow
              key={i}
              value={ing}
              allIngredients={localIngredients}
              allUnits={allUnits}
              onChange={(v) => updateIngredient(i, v)}
              onRemove={() => removeIngredient(i)}
              onCreateIngredient={createIngredient}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setField("ingredients", [...form.ingredients, emptyIngredient()])}
        >
          <PlusCircle className="mr-1 h-4 w-4" />
          Agregar ingrediente
        </Button>
      </section>

      <Separator />

      {/* Steps */}
      <section className="space-y-3">
        <Label>Pasos</Label>
        <div className="space-y-3">
          {form.steps.map((step, i) => (
            <StepRow
              key={i}
              index={i}
              value={step}
              onChange={(v) => updateStep(i, v)}
              onRemove={() => removeStep(i)}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setField("steps", [...form.steps, ""])}
        >
          <PlusCircle className="mr-1 h-4 w-4" />
          Agregar paso
        </Button>
      </section>

      {/* Audio notes — not saved, purely for reference */}
      {audioNotes && (
        <>
          <Separator />
          <section className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Notas del audio</p>
            {notesEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  rows={4}
                  className="text-sm"
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => setNotesEditing(false)}>
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Listo
                </Button>
              </div>
            ) : (
              <div className="relative rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground">
                {notesText}
                <button
                  type="button"
                  onClick={() => setNotesEditing(true)}
                  aria-label="Editar notas"
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </section>
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>

      {/* New ingredients confirmation dialog */}
      <Dialog open={pendingNewIngredients.length > 0} onOpenChange={(open) => { if (!open) setPendingNewIngredients([]) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ingredientes nuevos</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              {pendingNewIngredients.length === 1
                ? "Este ingrediente no existe aún en el catálogo:"
                : `Estos ${pendingNewIngredients.length} ingredientes no existen aún en el catálogo:`}
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {pendingNewIngredients.map((name) => <li key={name}>{name}</li>)}
            </ul>
            <p>¿Crearlos y guardar la receta, o cancelar para editarlos primero?</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPendingNewIngredients([])}>
              Volver a editar
            </Button>
            <Button onClick={handleConfirmCreateIngredients} disabled={saving}>
              {saving ? "Creando…" : "Crear y guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
