import Anthropic from '@anthropic-ai/sdk'
import {
  webSearch, fetchUrl, fetchYoutubeTranscript,
  checkIn, presentDraft, loadPreferences, saveRecipe,
} from './tools.js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── System prompt ─────────────────────────────────────────────────

const SYSTEM_PROMPT = `Sos un investigador de recetas que ayuda a construir recetas de referencia para 5entidos.

El usuario es un cocinero casero que valora la practicidad y el buen sabor.
Toda tu comunicación es en español, concisa y directa. Sin emojis. Sin frases de cierre ("que lo disfrutes", "acá estoy", etc.). Sin tips o comentarios no pedidos.

Tu proceso:
1. Llamá a load_preferences al inicio.
2. Investigá múltiples fuentes — decidís cuántas según la complejidad del plato. Incluí YouTube cuando sea relevante.
3. Priorizá chefs reconocidos y publicaciones culinarias sobre blogs genéricos.
4. Usá check_in cada vez que encuentres una decisión que cambiaría la receta de manera significativa — no esperés al borrador para hacer todas las preguntas. Cuando uses check_in, explicá brevemente las opciones y qué diferencia concreta tiene cada una (sabor, textura, tiempo, dificultad).
5. Cuando tengas suficiente material, llamá a present_draft con:
   - questions: preguntas que todavía necesitás resolver, cada una con las opciones y sus diferencias concretas
   - notes: decisiones que tomaste vos y por qué, para que el usuario las valide o corrija
6. Después de recibir feedback, incorporá los cambios. Si el usuario pide cambios sustanciales, volvé a llamar present_draft. Si los cambios son menores, confirmá los cambios al usuario y esperá su aprobación explícita.
7. Llamá a save_recipe ÚNICAMENTE cuando el usuario dé una aprobación clara — puede ser "guardalo", "dale", "ok", "listo", "perfecto", "aprobado", "sí" u otras expresiones inequívocas de cierre. Nunca interpretes feedback o correcciones como aprobación.

Autonomía: tomá decisiones menores vos mismo y mencionálas en notes.
El objetivo es una receta auténtica, adaptada a cocina casera cuando sea necesario.
Tono: directo y sin adornos. Los tips de cocina son parte del contenido de la receta y van en el campo notes. Lo que no va: frases de cierre vacías fuera del contenido ("que lo disfrutes", "suerte con la receta", "cualquier cosa me avisás").

Esquema de salida obligatorio:
{
  "title": string,
  "description": string,
  "servings": number,
  "prep_time": "0-30" | "30-60" | "60-120" | "120+",
  "ingredients": [{ "name": string, "quantity": number, "unit": string, "comment": string | null }],
  "steps": [string],
  "notes": string,
// comment en ingredientes: aclaración corta opcional (máx 20 chars, ej: "picado fino"). null si no aplica.
  "sources": [string]
}`

// ── Tool definitions ──────────────────────────────────────────────

const TOOLS = [
  {
    name: 'load_preferences',
    description: 'Lee las preferencias guardadas del usuario (preferences.md). Llamá esto primero.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'web_search',
    description: 'Busca en la web información sobre la receta. Devuelve array de { url, title, snippet }.',
    input_schema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Búsqueda a realizar' } },
      required: ['query'],
    },
  },
  {
    name: 'fetch_url',
    description: 'Descarga y extrae el texto limpio de una página web (sin nav/footer/scripts). Hasta 8000 caracteres.',
    input_schema: {
      type: 'object',
      properties: { url: { type: 'string', description: 'URL a descargar' } },
      required: ['url'],
    },
  },
  {
    name: 'fetch_youtube_transcript',
    description: 'Obtiene la transcripción hablada de un video de YouTube. Útil para recetas explicadas por chefs en video.',
    input_schema: {
      type: 'object',
      properties: { url: { type: 'string', description: 'URL completa del video de YouTube (debe incluir ?v=...)' } },
      required: ['url'],
    },
  },
  {
    name: 'check_in',
    description: 'Hace una pregunta puntual al usuario y espera su respuesta antes de continuar. Usalo cada vez que encuentres una decisión de impacto. Siempre incluí las opciones disponibles y qué diferencia concreta tiene cada una (sabor, textura, tiempo, dificultad).',
    input_schema: {
      type: 'object',
      properties: { question: { type: 'string', description: 'Pregunta concisa para el usuario, en español' } },
      required: ['question'],
    },
  },
  {
    name: 'present_draft',
    description: 'Presenta el borrador completo de la receta al usuario para revisión y feedback. Usalo cuando tengas suficiente material investigado.',
    input_schema: {
      type: 'object',
      properties: {
        recipe: {
          type: 'object',
          description: 'Borrador completo de la receta según el esquema de salida',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            servings: { type: 'number' },
            prep_time: { type: 'string', enum: ['0-30', '30-60', '60-120', '120+'] },
            ingredients: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  quantity: { type: 'number' },
                  unit: { type: 'string' },
                  comment: { type: ['string', 'null'], description: 'Aclaración opcional, máximo 20 caracteres (ej: "picado fino"). null si no aplica.' },
                },
                required: ['name', 'quantity', 'unit'],
              },
            },
            steps: { type: 'array', items: { type: 'string' } },
            notes: { type: 'string' },
            sources: { type: 'array', items: { type: 'string' } },
          },
          required: ['title', 'description', 'servings', 'prep_time', 'ingredients', 'steps', 'notes', 'sources'],
        },
        questions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Preguntas puntuales que necesitás que el usuario resuelva para finalizar',
        },
        notes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Decisiones que tomaste y por qué, para que el usuario las valide o corrija',
        },
      },
      required: ['recipe', 'questions', 'notes'],
    },
  },
  {
    name: 'save_recipe',
    description: 'Guarda la receta final. Llamá esto SOLO cuando el usuario haya aprobado explícitamente con palabras como "guardalo", "está bien", "aprobado". Nunca guardes basándote en feedback — siempre esperá aprobación expresa.',
    input_schema: {
      type: 'object',
      properties: {
        recipe: {
          type: 'object',
          description: 'Receta final completa según el esquema de salida',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            servings: { type: 'number' },
            prep_time: { type: 'string', enum: ['0-30', '30-60', '60-120', '120+'] },
            ingredients: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  quantity: { type: 'number' },
                  unit: { type: 'string' },
                  comment: { type: ['string', 'null'], description: 'Aclaración opcional, máximo 20 caracteres (ej: "picado fino"). null si no aplica.' },
                },
                required: ['name', 'quantity', 'unit'],
              },
            },
            steps: { type: 'array', items: { type: 'string' } },
            notes: { type: 'string' },
            sources: { type: 'array', items: { type: 'string' } },
          },
          required: ['title', 'description', 'servings', 'prep_time', 'ingredients', 'steps', 'notes', 'sources'],
        },
      },
      required: ['recipe'],
    },
  },
]

// ── Agent loop ────────────────────────────────────────────────────

// Truncates large tool_result content in old messages to reduce cumulative context growth.
// Keeps the last KEEP_FRESH messages untouched. Only truncates tool_result blocks —
// never user or assistant text — so check_in answers are never lost.
function pruneMessages(messages) {
  const KEEP_FRESH = 6
  const MAX_OLD = 400

  if (messages.length <= KEEP_FRESH) return messages

  return messages.map((msg, i) => {
    if (i >= messages.length - KEEP_FRESH) return msg
    if (!Array.isArray(msg.content)) return msg

    const pruned = msg.content.map(block => {
      if (block.type !== 'tool_result') return block
      const text = typeof block.content === 'string' ? block.content : JSON.stringify(block.content)
      if (text.length <= MAX_OLD) return block
      return { ...block, content: text.slice(0, MAX_OLD) + ' [truncado]' }
    })
    return { ...msg, content: pruned }
  })
}

// Runs the full research-draft-iterate-save loop for a single recipe request.
export async function runAgent(jobId, prompt, emit) {
  emit({ type: 'thinking', text: `Iniciando investigación: ${prompt}` })

  const messages = [{ role: 'user', content: prompt }]

  while (true) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      tools: TOOLS,
      messages: pruneMessages(messages),
    })

    messages.push({ role: 'assistant', content: response.content })

    // Emit any text blocks as thinking events so the client sees reasoning
    for (const block of response.content) {
      if (block.type === 'text' && block.text.trim()) {
        emit({ type: 'thinking', text: block.text.trim() })
      }
    }

    if (response.stop_reason === 'end_turn') {
      // If the agent ended with a question instead of using check_in, handle it so the loop doesn't freeze
      const textContent = response.content
        .filter(b => b.type === 'text' && b.text.trim())
        .map(b => b.text.trim())
        .join('\n')
      if (textContent && (textContent.includes('¿') || textContent.trimEnd().endsWith('?'))) {
        const answer = await checkIn(jobId, textContent, emit)
        messages.push({ role: 'user', content: answer })
        continue
      }
      break
    }

    if (response.stop_reason === 'tool_use') {
      const toolResults = []

      for (const block of response.content) {
        if (block.type !== 'tool_use') continue

        let result
        try {
          switch (block.name) {
            case 'load_preferences':
              result = await loadPreferences()
              break
            case 'web_search':
              emit({ type: 'searching', query: block.input.query })
              result = await webSearch(block.input.query)
              break
            case 'fetch_url':
              emit({ type: 'reading_url', url: block.input.url })
              result = await fetchUrl(block.input.url)
              break
            case 'fetch_youtube_transcript':
              emit({ type: 'reading_url', url: block.input.url })
              result = await fetchYoutubeTranscript(block.input.url)
              break
            case 'check_in':
              result = await checkIn(jobId, block.input.question, emit)
              break
            case 'present_draft':
              result = await presentDraft(
                jobId,
                block.input.recipe,
                block.input.questions,
                block.input.notes,
                emit,
              )
              break
            case 'save_recipe':
              result = await saveRecipe(jobId, block.input.recipe, messages, emit)
              break
            default:
              result = `Herramienta desconocida: ${block.name}`
          }
        } catch (err) {
          result = `Error en herramienta ${block.name}: ${err.message}`
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: typeof result === 'string' ? result : JSON.stringify(result),
        })
      }

      messages.push({ role: 'user', content: toolResults })
    }
  }
}
