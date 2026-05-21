import { readFile, writeFile, mkdir, appendFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import got from 'got'
import * as cheerio from 'cheerio'
import { YoutubeTranscript } from 'youtube-transcript'
import { critiqueDraft, reviewPreferences } from './subagents.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Shared map: jobId → resolve fn — exported so server.js can call resolve on /recipe/respond
export const pendingResponses = new Map()

// Pauses the agent loop until /recipe/respond is called for this jobId
function waitForResponse(jobId, timeoutMs) {
  return new Promise((resolve, reject) => {
    pendingResponses.set(jobId, resolve)
    setTimeout(() => {
      pendingResponses.delete(jobId)
      reject(new Error('Timeout esperando respuesta del usuario'))
    }, timeoutMs)
  })
}

// ── Web & content tools ───────────────────────────────────────────

// Searches the web via Tavily. Returns [{ url, title, snippet }].
export async function webSearch(query) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      max_results: 4,
      search_depth: 'advanced',
    }),
  })
  const data = await res.json()
  return (data.results ?? []).map(r => ({ url: r.url, title: r.title, snippet: r.content }))
}

// Fetches a web page and returns clean body text (nav/ads/scripts stripped).
export async function fetchUrl(url) {
  const { body } = await got(url, {
    timeout: { request: 12000 },
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RecipeAgent/1.0)' },
  })
  const $ = cheerio.load(body)
  $('script, style, nav, footer, header, aside, [class*="ad"], [class*="cookie"], [class*="popup"]').remove()
  return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 4000)
}

// Fetches spoken transcript from a YouTube video URL. Returns error string if unavailable.
export async function fetchYoutubeTranscript(url) {
  const videoId = new URL(url).searchParams.get('v')
  if (!videoId) return `URL de YouTube inválida: ${url}`
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'es' })
      .catch(() => YoutubeTranscript.fetchTranscript(videoId))
    return transcript.map(t => t.text).join(' ').replace(/\s+/g, ' ').trim().slice(0, 4000)
  } catch (err) {
    return `Transcripción no disponible para este video: ${err.message}`
  }
}

// ── Interaction tools ─────────────────────────────────────────────

// Mid-research pause: emits a question event and waits for user response (10 min timeout).
export async function checkIn(jobId, question, emit) {
  emit({ type: 'question', text: question })
  return waitForResponse(jobId, 10 * 60 * 1000)
}

// Full draft pause: runs internal critic, emits draft event, waits for user feedback (30 min).
// The critique is folded into notes so the user sees a cleaner draft.
export async function presentDraft(jobId, recipe, questions, notes, emit) {
  const critique = await critiqueDraft(recipe)

  const enrichedNotes = [
    ...notes,
    ...critique.issues.map(i => `⚠️ ${i}`),
    ...critique.suggestions.map(s => `💡 ${s}`),
  ]

  emit({ type: 'draft', recipe, questions, notes: enrichedNotes })
  return waitForResponse(jobId, 30 * 60 * 1000)
}

// ── Memory tools ──────────────────────────────────────────────────

// Reads preferences.md. Returns empty string if file doesn't exist yet.
export async function loadPreferences() {
  try {
    return await readFile(join(__dirname, 'preferences.md'), 'utf8')
  } catch {
    return ''
  }
}

// Writes output JSON, triggers preferences review, emits done.
// conversationHistory is the full messages[] array from the agent loop.
export async function saveRecipe(jobId, recipe, conversationHistory, emit) {
  const dir = join(__dirname, 'output')
  await mkdir(dir, { recursive: true })

  const slug = recipe.title
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const filename = `${slug}.json`
  await writeFile(join(dir, filename), JSON.stringify(recipe, null, 2), 'utf8')

  // Only pass user text messages to the reviewer — tool results are irrelevant for extracting preferences
  const userMessages = conversationHistory
    .filter(m => m.role === 'user' && typeof m.content === 'string')
    .map(m => m.content)
    .join('\n\n')
  const proposed = await reviewPreferences(userMessages)

  if (proposed.length > 0) {
    emit({ type: 'preferences', proposed })
    const answer = await waitForResponse(jobId, 10 * 60 * 1000)
    await applyApprovedPreferences(proposed, answer)
  }

  emit({ type: 'done', recipe })
  return `Guardado en output/${filename}`
}

// Appends approved preference items to preferences.md after user review.
async function applyApprovedPreferences(proposed, userAnswer) {
  const lower = userAnswer.toLowerCase()
  const approved = proposed.filter((_, i) => {
    // Accept all if user says yes/all; reject by number if mentioned ("no la 2")
    if (/^(sí|si|yes|todo|todas|all|ok)\b/.test(lower)) return true
    const rejected = lower.match(/no.*\b(\d+)\b/g) ?? []
    return !rejected.some(r => r.includes(String(i + 1)))
  })

  if (approved.length === 0) return

  const lines = approved.map(p => `- **${p.key}**: ${p.value}`)
  const block = `\n## Actualizado\n${lines.join('\n')}\n`
  await appendFile(join(__dirname, 'preferences.md'), block, 'utf8')
}
