import express from 'express'
import cors from 'cors'
import { randomUUID } from 'node:crypto'
import { runAgent } from './agent.js'
import { pendingResponses } from './tools.js'

const app = express()
// Reflect all origins — SSE is read-only and jobIds are unguessable UUIDs
app.use(cors({ origin: true, credentials: false }))
app.use(express.json())

// ── In-memory state ───────────────────────────────────────────────

// job: { status: 'running'|'done'|'error', events: [], sseRes: Response|null }
const jobs = new Map()

// Buffers the event AND writes to the SSE connection if open.
// Buffering ensures clients that connect after start receive all past events.
function emitToJob(jobId, data) {
  const job = jobs.get(jobId)
  if (!job) return
  job.events.push(data)
  job.sseRes?.write(`data: ${JSON.stringify(data)}\n\n`)
  if (data.type === 'done') job.status = 'done'
  if (data.type === 'error') job.status = 'error'
}

// ── YouTube caption fetcher ────────────────────────────────────────

// YouTube blocks Render's IP with 429 + captcha when we fetch directly.
// Invidious (open-source YouTube frontend) has its own server IPs and a
// captions API — we route through it to avoid the block.
const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.fdn.fr',
  'https://yt.cdaut.de',
  'https://invidious.privacydev.net',
]

// Parses a WebVTT string into a clean plain-text string.
function parseVtt(vtt) {
  return vtt
    .split('\n')
    .filter(line => {
      const t = line.trim()
      if (!t) return false
      if (t === 'WEBVTT') return false
      if (t.startsWith('NOTE') || t.startsWith('STYLE')) return false
      if (/^\d{2}:\d{2}/.test(t)) return false  // timestamp line
      if (/^\d+$/.test(t)) return false           // cue index
      return true
    })
    .map(line => line.replace(/<[^>]+>/g, '').trim())  // strip VTT inline tags
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchYouTubeCaptions(videoId) {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      console.log(`[yt] trying ${instance}`)
      const listRes = await fetch(`${instance}/api/v1/captions/${videoId}`, {
        signal: AbortSignal.timeout(8_000),
      })
      if (!listRes.ok) { console.log(`[yt] ${instance} list → ${listRes.status}`); continue }

      const { captions = [] } = await listRes.json()
      console.log(`[yt] ${instance} → ${captions.length} track(s):`, captions.map(c => c.language_code))
      if (!captions.length) continue

      // Prefer Spanish; fall back to first available
      const track = captions.find(c => c.language_code?.startsWith('es')) ?? captions[0]
      const vttUrl = track.url.startsWith('http') ? track.url : `${instance}${track.url}`

      const vttRes = await fetch(vttUrl, { signal: AbortSignal.timeout(10_000) })
      if (!vttRes.ok) { console.log(`[yt] vtt fetch → ${vttRes.status}`); continue }

      const text = parseVtt(await vttRes.text())
      if (text) {
        console.log(`[yt] got ${text.length} chars via ${instance}`)
        return text
      }
      console.log(`[yt] ${instance} returned empty VTT`)
    } catch (err) {
      console.log(`[yt] ${instance} error: ${err.message}`)
    }
  }
  return null  // no captions available — caller will surface this to the user
}

// ── Endpoints ─────────────────────────────────────────────────────

// Start a new recipe research job. Returns jobId immediately; agent runs in background.
app.post('/recipe/start', (req, res) => {
  const { prompt } = req.body
  if (!prompt?.trim()) return res.status(400).json({ error: 'prompt is required' })

  const jobId = randomUUID()
  jobs.set(jobId, { status: 'running', events: [], sseRes: null })

  const emit = (data) => emitToJob(jobId, data)

  runAgent(jobId, prompt.trim(), emit).catch((err) => {
    emit({ type: 'error', message: err.message })
  })

  res.json({ jobId })
})

// SSE stream for a job. Replays buffered events first, then streams live.
app.get('/recipe/stream/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId)
  if (!job) return res.status(404).json({ error: 'Job no encontrado' })

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  // Replay all events the agent emitted before the client connected
  for (const event of job.events) {
    res.write(`data: ${JSON.stringify(event)}\n\n`)
  }

  job.sseRes = res
  req.on('close', () => { if (jobs.get(req.params.jobId)) jobs.get(req.params.jobId).sseRes = null })
})

// Unblocks the agent when it is waiting for user input (check_in, present_draft, preferences).
app.post('/recipe/respond/:jobId', (req, res) => {
  const { input } = req.body
  if (!input?.trim()) return res.status(400).json({ error: 'input is required' })

  const resolve = pendingResponses.get(req.params.jobId)
  if (!resolve) return res.status(404).json({ error: 'No hay pregunta pendiente para este job' })

  resolve(input.trim())
  pendingResponses.delete(req.params.jobId)
  res.json({ ok: true })
})

// Proxy endpoint for Vercel: fetches YouTube captions + title from Render's non-blocked IPs.
// Does NOT call stripNonRecipeContent — the raw transcript goes straight to the extract endpoint.
app.post('/youtube/transcript', async (req, res) => {
  const { url } = req.body
  if (!url?.trim()) return res.status(400).json({ error: 'URL requerida' })

  try {
    // Extract video ID (handles watch, youtu.be, shorts)
    let videoId = null
    try {
      const parsed = new URL(url)
      if (parsed.hostname === 'youtu.be') {
        videoId = parsed.pathname.slice(1).split('?')[0] || null
      } else if (parsed.searchParams.has('v')) {
        videoId = parsed.searchParams.get('v')
      } else {
        const m = parsed.pathname.match(/\/shorts\/([^/?]+)/)
        if (m) videoId = m[1]
      }
    } catch { /* invalid URL */ }

    if (!videoId) return res.status(400).json({ error: 'URL de YouTube inválida' })

    // Title via oEmbed (reliable public API)
    let title = null
    try {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
      if (oembedRes.ok) { const data = await oembedRes.json(); title = data.title ?? null }
    } catch { /* title stays null */ }

    // Raw captions via Invidious proxy (avoids Render's YouTube IP block)
    const transcript = await fetchYouTubeCaptions(videoId)

    console.log(`[yt] final: title=${!!title} transcript=${!!transcript}`)
    res.json({ title, transcript })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Start ─────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => console.log(`Recipe agent escuchando en puerto ${PORT}`))
