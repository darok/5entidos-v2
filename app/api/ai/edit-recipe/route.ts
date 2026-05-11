import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import OpenAI from "openai"
import type { EditChange } from "@/types"

interface CurrentRecipe {
  title: string
  description: string | null
  prep_time: string | null
  servings: string | null
  rating: string | null
  ingredients: Array<{ name: string; quantity: string; unit_name: string }>
  steps: string[]
}

function buildRecipeText(r: CurrentRecipe): string {
  const lines: string[] = [
    `Título: ${r.title || "(sin título)"}`,
    `Descripción: ${r.description || "(ninguna)"}`,
    `Tiempo de preparación: ${r.prep_time || "(no especificado)"}`,
    `Porciones: ${r.servings || "(no especificado)"}`,
    `Calificación: ${r.rating ? `${r.rating} estrella(s)` : "(sin calificar)"}`,
    "",
    "Ingredientes:",
  ]
  if (r.ingredients.length === 0) {
    lines.push("  (ninguno)")
  } else {
    r.ingredients.forEach((ing, i) => {
      const qty = ing.quantity ? `${ing.quantity} ` : ""
      const unit = ing.unit_name ? `${ing.unit_name}` : ""
      lines.push(`  ${i + 1}. ${ing.name}${qty || unit ? ` — ${qty}${unit}` : ""}`)
    })
  }
  lines.push("", "Pasos:")
  if (r.steps.filter(Boolean).length === 0) {
    lines.push("  (ninguno)")
  } else {
    r.steps.forEach((s, i) => { if (s.trim()) lines.push(`  ${i + 1}. ${s}`) })
  }
  return lines.join("\n")
}

const SYSTEM_PROMPT = `Sos un asistente de edición de recetas. Interpretá las instrucciones habladas del usuario y generá una lista de cambios a aplicar sobre la receta actual.

Retorná SOLO JSON válido con esta estructura:
{
  "changes": [
    { "type": "set_field", "field": "title", "value": "nuevo título", "label": "Cambiar título" },
    { "type": "set_field", "field": "description", "value": "...", "label": "Cambiar descripción" },
    { "type": "set_field", "field": "prep_time", "value": "30-60", "label": "Cambiar tiempo: 30-60 min" },
    { "type": "set_field", "field": "servings", "value": "4", "label": "Cambiar porciones: 4" },
    { "type": "set_field", "field": "rating", "value": "3", "label": "Cambiar calificación: 3★" },
    { "type": "add_ingredient", "name": "sal", "quantity": 1, "unit": "cucharadita", "label": "Agregar: sal (1 cdta.)" },
    { "type": "modify_ingredient", "name": "nombre exacto", "new_quantity": 3, "new_unit": "taza", "label": "Modificar: nombre → 3 tazas" },
    { "type": "remove_ingredient", "name": "nombre exacto", "label": "Eliminar: nombre" },
    { "type": "add_step", "after_index": 2, "description": "texto completo del paso", "label": "Agregar paso después del 2" },
    { "type": "modify_step", "step_number": 3, "description": "texto completo nuevo", "label": "Modificar paso 3" },
    { "type": "remove_step", "step_number": 2, "label": "Eliminar paso 2" }
  ]
}

Reglas estrictas:
- Para modify_ingredient y remove_ingredient, "name" debe coincidir EXACTAMENTE con el nombre del ingrediente en la receta actual
- prep_time debe ser uno de exactamente: "0-30", "30-60", "60-120", "120+"
- rating debe ser "1", "2", "3" o "4" (escala de 4 estrellas)
- servings debe ser un número como string (ej. "4")
- step_number y after_index usan numeración base-1; after_index 0 = antes del primer paso
- label debe ser conciso (máx ~50 caracteres) en español
- Si el usuario pide reemplazar un ingrediente por otro, usá remove_ingredient + add_ingredient
- Retorná { "changes": [] } si las instrucciones no son claras o no corresponden a cambios de receta`

export async function POST(request: NextRequest) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { transcript, currentRecipe } = await request.json() as { transcript: string; currentRecipe: CurrentRecipe }
    if (!transcript?.trim()) return NextResponse.json({ error: "Transcript required" }, { status: 400 })
    if (!currentRecipe) return NextResponse.json({ error: "currentRecipe required" }, { status: 400 })

    const recipeText = buildRecipeText(currentRecipe)

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `RECETA ACTUAL:\n${recipeText}\n\nINSTRUCCIONES DEL USUARIO:\n${transcript}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    })

    const raw = completion.choices[0].message.content
    if (!raw) throw new Error("Empty response from GPT")

    const result = JSON.parse(raw) as { changes: EditChange[] }
    return NextResponse.json({ changes: result.changes ?? [] })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}
