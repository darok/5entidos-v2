import express from 'express'
import cors from 'cors'
import { randomUUID } from 'node:crypto'
import { runAgent } from './agent.js'
import { pendingResponses } from './tools.js'

const app = express()
app.use(cors({ origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000' }))
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

// ── Start ─────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => console.log(`Recipe agent escuchando en puerto ${PORT}`))
