import OpenAI from "openai"
import type { ExtractedRecipe, Unit } from "@/types"

// Shared system prompt used by all recipe extraction paths (audio, youtube, link)
export const EXTRACT_SYSTEM_PROMPT = `You are a recipe extraction assistant. Given text describing a recipe in Spanish — a spoken transcript, subtitles, a video description, or scraped web page text — extract the recipe information and return it as JSON.

The input sometimes contains multiple labeled sections (e.g. "Subtítulos", "Transcripción de audio", "Descripción del video"). When it does, synthesize across ALL of them — do not just use the first or most cleanly formatted one:
- Spoken content (subtítulos / transcripción de audio) is usually the actual step-by-step walkthrough — treat it as the primary source for steps and process details.
- The video description is often a supplementary written summary — cross-check it for precise ingredient quantities/units that may be vague or missing in the spoken content, and pull in any ingredients, steps, or details it mentions that weren't said aloud.
- If a quantity or detail is stated differently across sections, prefer the more precise/explicit one, but don't discard details that only appear in a single section.
- Never simply copy one section verbatim — combine what each section uniquely contributes into one coherent recipe.

Return ONLY valid JSON with this exact structure:
{
  "title": "recipe name",
  "description": "brief description or null",
  "servings": number of servings as integer or null,
  "ingredients": [
    { "name": "ingredient name", "quantity": number or null, "unit": "unit name in Spanish or null", "comment": "short clarification or null" }
  ],
  "steps": ["step 1 description", "step 2 description"],
  "notes": "anything from the transcript that didn't fit the recipe structure (context, anecdotes, tips, personal notes, serving suggestions, timing) — or null"
}

Rules:
- Ingredient names should be in singular form in Spanish
- Units should be the full Spanish word (e.g. "taza", "gramo", "cucharada")
- If information is not mentioned, use null
- Steps should be clear and actionable
- Capture in "notes" any content that doesn't map to title/description/cook_time/servings/ingredients/steps — colloquial context, personal anecdotes, tips, who taught the recipe, etc.
- Ingredient comment: short optional clarification about preparation or state (max 20 chars, e.g. "picado fino", "a temperatura ambiente"). Only include if explicitly stated in the transcript. null otherwise.`

// Tells the model to reuse the app's existing unit spellings when one applies, so extracted
// ingredients match the catalog instead of returning a free-text variant that fails to match
function unitsInstruction(units: Unit[]): string {
  const list = units.map((u) => `"${u.name}" (${u.abbreviation})`).join(", ")
  return `\n\nThe app already has these units in its catalog — when an ingredient's unit matches one of these in meaning (even if the transcript phrases it differently), return it using this EXACT spelling so it matches automatically: ${list}. Only use a different Spanish unit word when none of these fit.`
}

// Extracts a structured recipe from plain text (transcript, captions, or scraped page text)
export async function extractRecipeFromText(
  transcript: string,
  openai: OpenAI,
  units: Unit[] = []
): Promise<ExtractedRecipe> {
  const systemPrompt = units.length > 0 ? EXTRACT_SYSTEM_PROMPT + unitsInstruction(units) : EXTRACT_SYSTEM_PROMPT
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Extract the recipe from this transcript:\n\n${transcript}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  })

  const raw = completion.choices[0].message.content
  if (!raw) throw new Error("Empty response from GPT")
  return JSON.parse(raw) as ExtractedRecipe
}
