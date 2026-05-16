import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Internal sub-agent: reviews a draft recipe for quality issues before the user sees it.
// Returns { issues, suggestions } — main agent merges this into the draft's notes.
export async function critiqueDraft(recipe) {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: `Sos un chef revisor experto. Analizá esta receta borrador y detectá problemas de calidad.
Evaluá: coherencia de tiempos, cantidades razonables para las porciones indicadas, pasos completos y en orden lógico, técnicas apropiadas para cocina casera.
Respondé SOLO con JSON válido: { "issues": ["..."], "suggestions": ["..."] }
Si no hay problemas, devolvé arrays vacíos.`,
    messages: [
      { role: 'user', content: `Revisá esta receta:\n${JSON.stringify(recipe, null, 2)}` }
    ]
  })

  try {
    const text = response.content[0].text
    return JSON.parse(text)
  } catch {
    return { issues: [], suggestions: [] }
  }
}

// Internal sub-agent: reads the full conversation history and proposes STABLE preference
// updates — not recipe-specific decisions. Called at end of session before saving.
// Returns [{ key, value, reason }] — empty array if nothing worth saving.
export async function reviewPreferences(conversationHistory) {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: `Analizá esta conversación sobre recetas e identificá preferencias ESTABLES del usuario.
Una preferencia es estable si aplica más allá de esta receta puntual (ej: "nunca usa mariscos", "prefiere técnicas sin fritura").
NO incluyas decisiones específicas de esta receta (ej: "prefirió porcini secos en el risotto de hoy").
Respondé SOLO con JSON válido: [{ "key": "nombre_corto", "value": "descripción clara", "reason": "por qué es estable" }]
Si no hay preferencias estables, devolvé [].`,
    messages: [
      { role: 'user', content: `Historial de la conversación:\n${conversationHistory}` }
    ]
  })

  try {
    const text = response.content[0].text
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
