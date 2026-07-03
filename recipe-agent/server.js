import express from 'express'
import cors from 'cors'
import { randomUUID } from 'node:crypto'
import { runAgent } from './agent.js'
import { pendingResponses } from './tools.js'
import { YoutubeTranscript } from 'youtube-transcript'

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

    // Raw captions — no AI processing, that happens in the extract step
    let transcript = null

    // Attempt 1: youtube-transcript package
    try {
      let items
      try { items = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'es' }) }
      catch (e1) {
        console.log(`[yt] ES captions failed (${e1.message}), retrying without lang`)
        items = await YoutubeTranscript.fetchTranscript(videoId)
      }
      transcript = items.map(t => t.text).join(' ').replace(/\s+/g, ' ').trim() || null
      console.log(`[yt] package OK — ${items.length} items, ${transcript?.length} chars`)
    } catch (pkgErr) {
      console.error('[yt] package failed:', pkgErr.message)
    }

    // Attempt 2: direct timedtext API (different code path from youtube-transcript)
    if (!transcript) {
      try {
        const ttRes = await fetch(
          `https://www.youtube.com/api/timedtext?v=${videoId}&lang=es&fmt=json3`,
          { signal: AbortSignal.timeout(8000) }
        )
        if (ttRes.ok) {
          const ttData = await ttRes.json()
          const text = (ttData.events ?? [])
            .filter(e => e.segs)
            .flatMap(e => e.segs)
            .map(s => s.utf8 ?? '')
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
          if (text) { transcript = text; console.log(`[yt] timedtext OK — ${text.length} chars`) }
          else console.log('[yt] timedtext returned empty')
        } else {
          console.log(`[yt] timedtext status ${ttRes.status}`)
        }
      } catch (ttErr) {
        console.error('[yt] timedtext failed:', ttErr.message)
      }
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
