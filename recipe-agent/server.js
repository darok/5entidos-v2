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

// Fetches captions for a YouTube video without relying on any npm package.
// Mimics a browser request so YouTube serves the full ytInitialPlayerResponse.
async function fetchYouTubeCaptions(videoId) {
  const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'es-419,es;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Cookie': 'CONSENT=YES+; SOCS=CAI',  // bypass consent gate without cookies
    },
    signal: AbortSignal.timeout(15_000),
  })

  if (!pageRes.ok) throw new Error(`Watch page ${pageRes.status}`)
  const html = await pageRes.text()
  console.log(`[yt] page fetched — ${html.length} chars`)

  // YouTube embeds player data in a script tag as ytInitialPlayerResponse = {...}
  const match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});(?:var\s|\s*<\/script>)/)
  if (!match) {
    // Log a snippet to see what YouTube actually returned
    const snippet = html.slice(0, 500).replace(/\s+/g, ' ')
    console.error('[yt] no ytInitialPlayerResponse — page snippet:', snippet)
    throw new Error('Player response not found in page HTML')
  }

  const playerData = JSON.parse(match[1])
  const tracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? []
  console.log(`[yt] ${tracks.length} caption track(s):`, tracks.map(t => t.languageCode))

  if (!tracks.length) throw new Error('No caption tracks')

  // Prefer Spanish; fall back to any available track
  const track = tracks.find(t => t.languageCode?.startsWith('es')) ?? tracks[0]
  const captionUrl = `${track.baseUrl}&fmt=json3`
  console.log(`[yt] fetching track ${track.languageCode}`)

  const captionRes = await fetch(captionUrl, { signal: AbortSignal.timeout(10_000) })
  if (!captionRes.ok) throw new Error(`Caption URL ${captionRes.status}`)

  const captionData = await captionRes.json()
  const text = (captionData.events ?? [])
    .filter(e => e.segs)
    .flatMap(e => e.segs)
    .map(s => s.utf8 ?? '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  return text || null
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

    // Raw captions via direct page fetch — no npm package dependency
    let transcript = null
    try {
      transcript = await fetchYouTubeCaptions(videoId)
      console.log(`[yt] captions OK — ${transcript?.length ?? 0} chars`)
    } catch (err) {
      console.error('[yt] captions failed:', err.message)
    }

    console.log(`[yt] final: title=${!!title} transcript=${!!transcript}`)
    res.json({ title, transcript })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Start ─────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => console.log(`Recipe agent escuchando en puerto ${PORT}`))
