import express from 'express'
import cors from 'cors'
import { randomUUID } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runAgent } from './agent.js'
import { pendingResponses } from './tools.js'
import { extractVideoId, getYtCaptions, getVideoMetadata, EXTRACTOR_ARGS } from './youtube.js'

const execFileAsync = promisify(execFile)

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

// ── Whisper ──────────────────────────────────────────────────────

// Sends an audio buffer to OpenAI Whisper. Returns transcript text, or null on failure.
async function transcribeWithWhisper(buffer, filename, mimeType) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) { console.error('[whisper] OPENAI_API_KEY not set on Render'); return null }

  const form = new FormData()
  form.append('file', new Blob([buffer], { type: mimeType }), filename)
  form.append('model', 'whisper-1')
  form.append('language', 'es')

  const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: AbortSignal.timeout(120_000),
  })
  if (!whisperRes.ok) { console.error('[whisper] error:', whisperRes.status, await whisperRes.text().catch(() => '')); return null }

  const { text } = await whisperRes.json()
  console.log(`[whisper] transcript: ${text?.length ?? 0} chars`)
  return text || null
}

// Maps a Content-Type to a filename Whisper recognizes (it uses the extension as a format hint).
function filenameForMimeType(mimeType) {
  const ext = {
    'audio/mpeg': 'mp3', 'audio/mp3': 'mp3',
    'audio/wav': 'wav', 'audio/x-wav': 'wav',
    'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'm4a',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm', 'video/webm': 'webm',
    'video/mp4': 'mp4',
  }[mimeType?.split(';')[0]?.trim().toLowerCase()] ?? 'mp3'
  return `audio.${ext}`
}

// ── YouTube audio fallback ─────────────────────────────────────────

// Downloads audio via yt-dlp, transcribes with Whisper. Returns text or null.
async function getYtAudioTranscript(videoId) {
  if (!process.env.OPENAI_API_KEY) { console.error('[yt] OPENAI_API_KEY not set on Render — audio transcription unavailable'); return null }

  const dir = await mkdtemp(join(tmpdir(), 'recipe-ytaudio-'))
  try {
    // Download smallest available audio stream
    await execFileAsync('yt-dlp', [
      '-x', '--audio-format', 'mp3', '--audio-quality', '5',
      '--no-warnings',
      '--extractor-args', EXTRACTOR_ARGS,
      '--output', join(dir, 'audio.%(ext)s'),
      `https://www.youtube.com/watch?v=${videoId}`,
    ], { timeout: 120_000 })

    const files = await readdir(dir)
    const audioFile = files.find(f => /\.(mp3|m4a|ogg|webm|wav)$/.test(f))
    if (!audioFile) { console.log('[yt] yt-dlp: no audio file produced'); return null }

    const buffer = await readFile(join(dir, audioFile))
    if (buffer.length > 24 * 1024 * 1024) {
      console.error(`[yt] audio too large for Whisper: ${(buffer.length / 1e6).toFixed(1)} MB`)
      return null
    }
    console.log(`[yt] audio downloaded: ${(buffer.length / 1e6).toFixed(1)} MB, sending to Whisper`)

    return await transcribeWithWhisper(buffer, audioFile, 'audio/mpeg')
  } catch (err) {
    console.error('[yt] audio transcription error:', err.message?.slice(0, 300))
    return null
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {})
  }
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

// Runs metadata + captions/audio fetching in the background, emitting progress
// events. Metadata (Data API/oEmbed) and the caption/audio chain run in parallel
// since they're independent — no reason to make one wait on the other.
async function runYoutubeImport(videoId, emit) {
  emit({ type: 'status', text: 'Buscando metadatos y subtítulos…' })

  const [metadata, { transcript, source }] = await Promise.all([
    getVideoMetadata(videoId),
    (async () => {
      // Does NOT call stripNonRecipeContent — the raw transcript goes straight to the extract endpoint.
      const captions = await getYtCaptions(videoId)
      if (captions) return { transcript: captions, source: 'subtitles' }

      emit({ type: 'status', text: 'Sin subtítulos, transcribiendo audio…' })
      const audio = await getYtAudioTranscript(videoId)
      return { transcript: audio, source: audio ? 'audio' : null }
    })(),
  ])

  console.log(`[yt] done: title=${!!metadata.title} description=${!!metadata.description} transcript=${!!transcript} source=${source}`)
  emit({ type: 'done', title: metadata.title, description: metadata.description, transcript, source })
}

// Starts a YouTube import job. Returns jobId immediately; work runs in the background
// and streams via the existing /recipe/stream/:jobId SSE endpoint (jobs are keyed
// generically by jobId, so no separate stream route is needed).
app.post('/youtube/start', (req, res) => {
  const { url } = req.body
  if (!url?.trim()) return res.status(400).json({ error: 'URL requerida' })

  const videoId = extractVideoId(url)
  if (!videoId) return res.status(400).json({ error: 'URL de YouTube inválida' })

  const jobId = randomUUID()
  jobs.set(jobId, { status: 'running', events: [], sseRes: null })

  const emit = (data) => emitToJob(jobId, data)

  runYoutubeImport(videoId, emit).catch((err) => {
    emit({ type: 'error', message: err.message })
  })

  res.json({ jobId })
})

// Accepts a raw audio/video file body (up to Whisper's 25MB limit) and transcribes it.
// Called directly from the browser, bypassing Vercel — Vercel's serverless functions cap
// request bodies at ~4.5MB, well under what a real video's audio track needs.
app.post('/whisper/transcribe', express.raw({ limit: '25mb', type: () => true }), async (req, res) => {
  const buffer = req.body
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return res.status(400).json({ error: 'No se recibió ningún archivo de audio' })
  }

  const mimeType = req.headers['content-type'] ?? 'audio/mpeg'
  const transcript = await transcribeWithWhisper(buffer, filenameForMimeType(mimeType), mimeType)
  if (!transcript) return res.status(502).json({ error: 'No se pudo transcribir el audio' })

  res.json({ transcript })
})

// Returns JSON instead of Express's default HTML/plain-text error body (e.g. oversized
// uploads) — a non-JSON error body breaks the client's res.json() parsing.
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El archivo es demasiado grande (máx. 25 MB)' })
  }
  console.error('[server] unhandled error:', err.message)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// ── Start ─────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => console.log(`Recipe agent escuchando en puerto ${PORT}`))
