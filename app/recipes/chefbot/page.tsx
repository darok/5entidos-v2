"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Bot, Search, Link2, Send, CheckCircle2, AlertCircle } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────

type Phase = "idle" | "running" | "question" | "draft" | "preferences" | "done" | "error"

interface AgentIngredient {
  name: string
  quantity: number
  unit: string
  comment: string | null
}

interface AgentRecipe {
  title: string
  description: string
  servings: number
  prep_time: string
  ingredients: AgentIngredient[]
  steps: string[]
  notes: string
  sources: string[]
}

interface ProposedPref {
  key: string
  value: string
  reason: string
}

// ── Helpers ───────────────────────────────────────────────────────

// Shows hostname + path, truncated for the URL panel
function formatUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url)
    const path = pathname.length > 40 ? pathname.slice(0, 40) + "…" : pathname
    return `${hostname}${path}`
  } catch {
    return url
  }
}

// ── Main component ────────────────────────────────────────────────

export default function ChefbotPage() {
  const [phase, setPhase] = useState<Phase>("idle")
  const [jobId, setJobId] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [activityLog, setActivityLog] = useState<string[]>([])
  const [visitedUrls, setVisitedUrls] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [currentDraft, setCurrentDraft] = useState<AgentRecipe | null>(null)
  const [draftQuestions, setDraftQuestions] = useState<string[]>([])
  const [draftNotes, setDraftNotes] = useState<string[]>([])
  const [proposedPrefs, setProposedPrefs] = useState<ProposedPref[]>([])
  const [replyInput, setReplyInput] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const activityEndRef = useRef<HTMLDivElement>(null)
  const esRef = useRef<EventSource | null>(null)

  // Auto-scroll activity feed on new entries
  useEffect(() => {
    activityEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activityLog])

  const appendLog = useCallback((line: string) => {
    setActivityLog(prev => [...prev, line])
  }, [])

  // Open SSE connection for a given jobId
  const openStream = useCallback((id: string) => {
    const es = new EventSource(`/api/chefbot/stream/${id}`)
    esRef.current = es

    es.onmessage = (e) => {
      let event: Record<string, unknown>
      try { event = JSON.parse(e.data) } catch { return }

      switch (event.type) {
        case "thinking":
          appendLog(`💭 ${event.text as string}`)
          break
        case "searching":
          appendLog(`🔍 ${event.query as string}`)
          break
        case "reading_url": {
          const url = event.url as string
          setVisitedUrls(prev => [...prev, url])
          appendLog(`📄 ${url}`)
          break
        }
        case "question":
          setCurrentQuestion(event.text as string)
          setPhase("question")
          break
        case "draft":
          setCurrentDraft(event.recipe as AgentRecipe)
          setDraftQuestions(event.questions as string[])
          setDraftNotes(event.notes as string[])
          setPhase("draft")
          break
        case "preferences":
          setProposedPrefs(event.proposed as ProposedPref[])
          setPhase("preferences")
          break
        case "done":
          setPhase("done")
          es.close()
          break
        case "error":
          setErrorMsg((event.message as string) || "Error desconocido")
          setPhase("error")
          es.close()
          break
      }
    }

    es.onerror = () => {
      setErrorMsg("Se perdió la conexión con el agente")
      setPhase("error")
      es.close()
    }
  }, [appendLog])

  async function startAgent() {
    if (!prompt.trim()) return
    setActivityLog([])
    setVisitedUrls([])
    setPhase("running")

    try {
      const res = await fetch("/api/chefbot/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })
      const { jobId: id } = await res.json()
      setJobId(id)
      openStream(id)
    } catch {
      setErrorMsg("No se pudo conectar con el agente")
      setPhase("error")
    }
  }

  async function sendReply(input: string) {
    if (!jobId || !input.trim()) return
    setPhase("running")
    setReplyInput("")
    await fetch(`/api/chefbot/respond/${jobId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    })
  }

  function handleReset() {
    esRef.current?.close()
    setPhase("idle")
    setJobId(null)
    setActivityLog([])
    setVisitedUrls([])
    setCurrentQuestion("")
    setCurrentDraft(null)
    setDraftQuestions([])
    setDraftNotes([])
    setProposedPrefs([])
    setReplyInput("")
    setErrorMsg("")
  }

  const isRunning = phase === "running"
  const hasActivity = activityLog.length > 0 || visitedUrls.length > 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Bot className="h-7 w-7 text-brand-violet" />
        <h1 className="text-2xl font-bold">Chefbot</h1>
      </div>

      {/* Prompt input */}
      <div className="flex gap-3 mb-8">
        <Textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="¿Qué receta querés investigar? (ej: risotto de calabaza)"
          className="resize-none h-20 flex-1"
          disabled={isRunning || phase === "question" || phase === "draft" || phase === "preferences"}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey && phase === "idle") {
              e.preventDefault()
              startAgent()
            }
          }}
        />
        <div className="flex flex-col gap-2">
          <Button
            onClick={startAgent}
            disabled={phase !== "idle" || !prompt.trim()}
            className="h-full"
          >
            Investigar
          </Button>
          {phase !== "idle" && (
            <Button variant="outline" onClick={handleReset} size="sm">
              Nueva
            </Button>
          )}
        </div>
      </div>

      {/* Two-column activity area */}
      {hasActivity && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Left: activity feed */}
          <div className="border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Search className="h-4 w-4" /> Actividad
            </h2>
            <div className="h-64 overflow-y-auto text-sm space-y-1">
              {activityLog.map((line, i) => (
                <p key={i} className="text-muted-foreground leading-snug break-words">{line}</p>
              ))}
              <div ref={activityEndRef} />
            </div>
          </div>

          {/* Right: visited URLs panel */}
          <div className="border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Link2 className="h-4 w-4" /> Fuentes consultadas
            </h2>
            <div className="h-64 overflow-y-auto space-y-1">
              {visitedUrls.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Ninguna todavía</p>
              ) : (
                visitedUrls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-brand-violet hover:underline break-all leading-snug"
                  >
                    {formatUrl(url)}
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Running indicator */}
      {phase === "running" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 animate-pulse">
          <div className="h-2 w-2 rounded-full bg-brand-violet" />
          Investigando…
        </div>
      )}

      {/* Question phase */}
      {phase === "question" && (
        <div className="border rounded-lg p-5 mb-6 space-y-4">
          <p className="font-medium">{currentQuestion}</p>
          <div className="flex gap-3">
            <Input
              value={replyInput}
              onChange={e => setReplyInput(e.target.value)}
              placeholder="Tu respuesta…"
              className="flex-1"
              onKeyDown={e => e.key === "Enter" && sendReply(replyInput)}
              autoFocus
            />
            <Button onClick={() => sendReply(replyInput)} disabled={!replyInput.trim()}>
              <Send className="h-4 w-4 mr-1" /> Responder
            </Button>
          </div>
        </div>
      )}

      {/* Draft phase */}
      {phase === "draft" && currentDraft && (
        <div className="border rounded-lg p-5 mb-6 space-y-5">
          <h2 className="text-lg font-bold">{currentDraft.title}</h2>
          <p className="text-sm text-muted-foreground">{currentDraft.description}</p>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{currentDraft.servings} porciones</span>
            <span>{currentDraft.prep_time} min</span>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="font-semibold mb-2">Ingredientes</h3>
            <ul className="text-sm space-y-1">
              {currentDraft.ingredients.map((ing, i) => (
                <li key={i}>
                  <span className="font-medium">{ing.quantity} {ing.unit}</span> {ing.name}
                  {ing.comment && <span className="text-muted-foreground ml-1">({ing.comment})</span>}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div>
            <h3 className="font-semibold mb-2">Pasos</h3>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              {currentDraft.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          {currentDraft.notes && (
            <div>
              <h3 className="font-semibold mb-1">Notas</h3>
              <p className="text-sm text-muted-foreground">{currentDraft.notes}</p>
            </div>
          )}

          {/* Agent questions */}
          {draftQuestions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-1 text-sm">Preguntas del agente</h3>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                {draftQuestions.map((q, i) => <li key={i}>{q}</li>)}
              </ul>
            </div>
          )}

          {/* Agent notes / decisions */}
          {draftNotes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-1 text-sm">Decisiones tomadas</h3>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                {draftNotes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}

          {/* Feedback */}
          <div className="space-y-3 pt-2 border-t">
            <Textarea
              value={replyInput}
              onChange={e => setReplyInput(e.target.value)}
              placeholder="Feedback o correcciones (opcional)…"
              className="resize-none h-20"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => sendReply(replyInput || "Sin cambios adicionales")}
              >
                <Send className="h-4 w-4 mr-1" /> Enviar feedback
              </Button>
              <Button onClick={() => sendReply("guardalo")}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Aprobar y guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences phase */}
      {phase === "preferences" && proposedPrefs.length > 0 && (
        <div className="border rounded-lg p-5 mb-6 space-y-4">
          <h2 className="font-semibold">Preferencias detectadas</h2>
          <p className="text-sm text-muted-foreground">
            El agente identificó estas preferencias en tu conversación. ¿Las guardamos?
          </p>
          <ul className="space-y-2">
            {proposedPrefs.map((p, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium">{p.key}:</span> {p.value}
                <span className="text-muted-foreground ml-2">— {p.reason}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3 pt-2">
            <Button onClick={() => sendReply("sí")}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Confirmar todo
            </Button>
            <Button variant="outline" onClick={() => sendReply("no")}>
              Descartar
            </Button>
          </div>
        </div>
      )}

      {/* Done phase */}
      {phase === "done" && (
        <div className="border rounded-lg p-5 mb-6 flex items-center gap-3 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">Receta guardada</p>
            <p className="text-sm text-green-700 dark:text-green-300">
              La receta fue guardada en el servidor del agente. Podés iniciar una nueva investigación.
            </p>
          </div>
        </div>
      )}

      {/* Error phase */}
      {phase === "error" && (
        <div className="border rounded-lg p-5 mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-red-800 dark:text-red-200">Error</p>
            <p className="text-sm text-red-700 dark:text-red-300">{errorMsg}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reintentar
          </Button>
        </div>
      )}
    </div>
  )
}
