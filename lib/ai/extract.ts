import OpenAI from "openai"
import type { ExtractedRecipe } from "@/types"

// Shared system prompt used by all recipe extraction paths (audio, youtube, link)
export const EXTRACT_SYSTEM_PROMPT = `You are a recipe extraction assistant. Given a spoken recipe transcript in Spanish, extract the recipe information and return it as JSON.

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

// Extracts a structured recipe from plain text (transcript, captions, or scraped page text)
export async function extractRecipeFromText(
  transcript: string,
  openai: OpenAI
): Promise<ExtractedRecipe> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: EXTRACT_SYSTEM_PROMPT },
      { role: "user", content: `Extract the recipe from this transcript:\n\n${transcript}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  })

  const raw = completion.choices[0].message.content
  if (!raw) throw new Error("Empty response from GPT")
  return JSON.parse(raw) as ExtractedRecipe
}
