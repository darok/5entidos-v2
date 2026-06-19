"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Bot, Search, Link2, Send, CheckCircle2, AlertCircle } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────

type Phase = "idle" | "running" | "saving" | "question" | "draft" | "preferences" | "done" | "error"

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

interface ParsedQuestion {
  question: string
  options: { label: string; description: string }[]
}

// ── Helpers ───────────────────────────────────────────────────────

function formatUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url)
    const path = pathname.length > 40 ? pathname.slice(0, 40) + "…" : pathname
    return `${hostname}${path}`
  } catch {
    return url
  }
}

// Resolves ingredient/unit names to catalog IDs (never creates new units),
// then POSTs the recipe to the app's API.
// Returns { id, unmatchedUnits } — unmatchedUnits are unit names that had no catalog match
// and were folded into the ingredient comment instead.
async function saveToApp(recipe: AgentRecipe): Promise<{ id: string; unmatchedUnits: string[] }> {
  const [ingRes, unitRes] = await Promise.all([
    fetch("/api/ingredients"),
    fetch("/api/units"),
  ])
  const allIngredients: { id: string; name: string }[] = await ingRes.json()
  const allUnits: { id: string; name: string; abbreviation: string }[] = await unitRes.json()

  const unmatchedUnits: string[] = []

  const ingredients = await Promise.all(
    recipe.ingredients.map(async (ing) => {
      const nameLower = ing.name.toLowerCase().trim()
      let ingredient = allIngredients.find((e) => e.name.toLowerCase() === nameLower)
      if (!ingredient) {
        const r = await fetch("/api/ingredients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: ing.name.trim() }),
        })
        ingredient = await r.json()
      }

      const unitLower = ing.unit.toLowerCase().trim()
      const unit = allUnits.find(
        (u) => u.name.toLowerCase() === unitLower || u.abbreviation.toLowerCase() === unitLower
      )

      let comment = ing.comment ?? null
      if (!unit && unitLower) {
        unmatchedUnits.push(ing.unit.trim())
        comment = [ing.unit.trim(), ing.comment].filter(Boolean).join(" — ") || null
      }

      return {
        ingredient_id: ingredient!.id,
        quantity: ing.quantity,
        unit_id: unit?.id ?? null,
        optional: false,
        comment,
      }
    })
  )

  const res = await fetch("/api/recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: recipe.title,
      description: recipe.description,
      notes: recipe.notes ?? null,
      prep_time: recipe.prep_time,
      servings: recipe.servings,
      ingredients,
      steps: recipe.steps.map((s, i) => ({ step_number: i + 1, description: s })),
      tag_ids: [],
    }),
  })
  if (!res.ok) throw new Error("Failed to save recipe to app")
  const created = await res.json()
  return { id: created.id as string, unmatchedUnits }
}

// Parses agent question text with "- **Label**: description" options (inline or newline-separated)
function parseQuestion(text: string): ParsedQuestion {
  const optionRegex = /-\s+\*\*([^*]+)\*\*[:\s]+([^-\n]+)/g
  const options: { label: string; description: string }[] = []
  let match: RegExpExecArray | null
  while ((match = optionRegex.exec(text)) !== null) {
    options.push({ label: match[1].trim(), description: match[2].trim() })
  }
  const question = text.replace(/-\s+\*\*[^*]+\*\*[:\s]+[^-\n]+/g, "").replace(/\s+/g, " ").trim()
  return { question, options }
}

// ── Sub-components ────────────────────────────────────────────────

// Renders a question with option buttons + free-text fallback — matches Claude Code style
function QuestionCard({
  text,
  onReply,
  autoFocus = true,
}: {
  text: string
  onReply: (answer: string) => void
  autoFocus?: boolean
}) {
  const [input, setInput] = useState("")
  const { question, options } = parseQuestion(text)

  return (
    <div className="border rounded-lg p-5 mb-6 space-y-4">
      <p className="font-medium">{question}</p>
      {options.length > 0 && (
        <div className="space-y-2">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onReply(opt.label)}
              className="w-full text-left border rounded-lg px-4 py-3 hover:bg-muted transition-colors text-sm"
            >
              <span className="font-semibold">{opt.label}</span>
              {opt.description && (
                <span className="text-muted-foreground ml-2">— {opt.description}</span>
              )}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-3">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={options.length > 0 ? "Otra respuesta…" : "Tu respuesta…"}
          onKeyDown={e => e.key === "Enter" && input.trim() && onReply(input)}
          autoFocus={autoFocus}
          className="flex-1"
        />
        <Button onClick={() => onReply(input)} disabled={!input.trim()}>
          <Send className="h-4 w-4 mr-1" /> Enviar
        </Button>
      </div>
    </div>
  )
}

// Read-only version of a question for the draft view
function QuestionDisplay({ text }: { text: string }) {
  const { question, options } = parseQuestion(text)
  return (
    <div className="text-sm space-y-1">
      <p className="font-medium text-foreground">{question}</p>
      {options.length > 0 && (
        <ul className="space-y-0.5 pl-2">
          {options.map((opt, i) => (
            <li key={i} className="text-muted-foreground">
              <span className="font-medium text-foreground">{opt.label}</span>
              {opt.description && ` — ${opt.description}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
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
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null)
  const [unmatchedUnits, setUnmatchedUnits] = useState<string[]>([])

  const activityEndRef = useRef<HTMLDivElement>(null)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    activityEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activityLog])

  const appendLog = useCallback((line: string) => {
    setActivityLog(prev => [...prev, line])
  }, [])

  const openStream = useCallback((streamUrl: string) => {
    const es = new EventSource(streamUrl)
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
        case "done": {
          const agentRecipe = event.recipe as AgentRecipe
          es.close()
          setPhase("saving")
          ;(async () => {
            try {
              const { id, unmatchedUnits: unmatched } = await saveToApp(agentRecipe)
              setSavedRecipeId(id)
              setUnmatchedUnits(unmatched)
            } catch {
              // recipe saved on agent server; app save failed silently
            }
            setPhase("done")
          })()
          break
        }
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

    const wakeupTimer = setTimeout(() => {
      appendLog("Chefbot está iniciando (puede tardar hasta 30s)…")
    }, 9000)

    try {
      const res = await fetch("/api/chefbot/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })
      clearTimeout(wakeupTimer)
      const { jobId: id, streamUrl } = await res.json()
      setJobId(id)
      openStream(streamUrl)
    } catch {
      clearTimeout(wakeupTimer)
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
    setSavedRecipeId(null)
    setUnmatchedUnits([])
  }

  const isRunning = phase === "running" || phase === "saving"
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
          <Button onClick={startAgent} disabled={phase !== "idle" || !prompt.trim()} className="h-full">
            Investigar
          </Button>
          {phase !== "idle" && (
            <Button variant="outline" onClick={handleReset} size="sm">Nueva</Button>
          )}
        </div>
      </div>

      {/* Two-column activity area */}
      {hasActivity && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

          <div className="border rounded-lg p-4">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Link2 className="h-4 w-4" /> Fuentes consultadas
            </h2>
            <div className="h-64 overflow-y-auto space-y-1">
              {visitedUrls.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Ninguna todavía</p>
              ) : (
                visitedUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="block text-sm text-brand-violet hover:underline break-all leading-snug">
                    {formatUrl(url)}
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Running / saving indicator */}
      {(phase === "running" || phase === "saving") && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 animate-pulse">
          <div className="h-2 w-2 rounded-full bg-brand-violet" />
          {phase === "saving" ? "Guardando en 5entidos…" : "Investigando…"}
        </div>
      )}

      {/* Question phase */}
      {phase === "question" && (
        <QuestionCard text={currentQuestion} onReply={sendReply} />
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

          {/* Decisions first, then questions */}
          {draftNotes.length > 0 && (
            <div className="space-y-1">
              <h3 className="font-semibold text-sm">Decisiones tomadas</h3>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                {draftNotes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}

          {draftQuestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Preguntas del agente</h3>
              {draftQuestions.map((q, i) => <QuestionDisplay key={i} text={q} />)}
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
              <Button variant="outline" onClick={() => sendReply(replyInput || "Sin cambios adicionales")}>
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
            <Button variant="outline" onClick={() => sendReply("no")}>Descartar</Button>
          </div>
        </div>
      )}

      {/* Done phase */}
      {phase === "done" && (
        <div className="border rounded-lg p-5 mb-6 space-y-2 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">Receta guardada</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {savedRecipeId ? (
                  <>
                    Guardada en 5entidos.{" "}
                    <a href={`/recipes/${savedRecipeId}`} className="underline font-medium">Ver →</a>
                    {" · "}
                    <a href={`/recipes/${savedRecipeId}/edit`} className="underline font-medium">Editar →</a>
                  </>
                ) : (
                  "Guardada en el servidor del agente."
                )}
              </p>
            </div>
          </div>
          {unmatchedUnits.length > 0 && (
            <p className="text-sm text-amber-700 dark:text-amber-400 pl-8">
              Unidades sin mapear, quedaron en el comentario del ingrediente: {unmatchedUnits.join(", ")}. Podés corregirlas editando la receta.
            </p>
          )}
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
          <Button variant="outline" size="sm" onClick={handleReset}>Reintentar</Button>
        </div>
      )}
    </div>
  )
}
