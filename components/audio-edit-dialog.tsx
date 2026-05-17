"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Mic, Square, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import type { EditChange } from "@/types"

// ── Types ─────────────────────────────────────────────────────────

export interface CurrentRecipeForEdit {
  title: string
  description: string
  prep_time: string
  servings: string
  rating: string
  ingredients: Array<{ name: string; quantity: string; unit_name: string; comment?: string }>
  steps: string[]
}

interface AudioEditDialogProps {
  open: boolean
  onClose: () => void
  currentRecipe: CurrentRecipeForEdit
  onApply: (changes: EditChange[]) => void
}

type DialogStep = "record" | "transcribing" | "analyzing" | "review" | "no_changes" | "error"

// ── Helpers ───────────────────────────────────────────────────────

function fmtTime(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

// Returns the long body text of a change if it warrants a collapsible detail view
function changeDetail(c: EditChange): string | null {
  if ((c.type === "add_step" || c.type === "modify_step") && c.description.length > 60) return c.description
  if (c.type === "set_field" && c.field === "description" && c.value.length > 60) return c.value
  return null
}

// ── ChangeRow ─────────────────────────────────────────────────────

function ChangeRow({
  change, index, checked, onToggle,
}: { change: EditChange; index: number; checked: boolean; onToggle: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const detail = changeDetail(change)
  const id = `chg-${index}`

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <Checkbox id={id} checked={checked} onCheckedChange={onToggle} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <label htmlFor={id} className="text-sm leading-snug cursor-pointer select-none">
          {change.label}
        </label>
        {detail && (
          <>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground mt-1 hover:text-foreground"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "Ocultar" : "Ver detalle"}
            </button>
            {expanded && (
              <pre className="text-xs bg-muted p-2 rounded mt-1.5 whitespace-pre-wrap font-sans leading-relaxed">
                {detail}
              </pre>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Main dialog ───────────────────────────────────────────────────

export function AudioEditDialog({ open, onClose, currentRecipe, onApply }: AudioEditDialogProps) {
  const [step, setStep] = useState<DialogStep>("record")
  const [errorMsg, setErrorMsg] = useState("")
  const [changes, setChanges] = useState<EditChange[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [isRecording, setIsRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setStep("record")
      setChanges([])
      setSelected(new Set())
      setErrorMsg("")
      setElapsed(0)
      setIsRecording(false)
    }
  }, [open])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop()
    }
  }, [])

  // ── Recording ─────────────────────────────────────────────────

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        handleTranscribe(new Blob(chunksRef.current, { type: "audio/webm" }))
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } catch {
      setErrorMsg("No se pudo acceder al micrófono. Verificá los permisos.")
      setStep("error")
    }
  }

  function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    setStep("transcribing")
  }

  // ── Pipeline ──────────────────────────────────────────────────

  async function handleTranscribe(blob: Blob) {
    try {
      const fd = new FormData()
      fd.append("file", blob, "audio.webm")
      const res = await fetch("/api/ai/transcribe", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok || !data.transcript) throw new Error(data.error ?? "Transcripción vacía")
      await handleAnalyze(data.transcript)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al transcribir")
      setStep("error")
    }
  }

  async function handleAnalyze(transcript: string) {
    setStep("analyzing")
    try {
      const res = await fetch("/api/ai/edit-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, currentRecipe }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al analizar")
      const list: EditChange[] = data.changes ?? []
      if (list.length === 0) { setStep("no_changes"); return }
      setChanges(list)
      setSelected(new Set(list.map((_, i) => i)))
      setStep("review")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al analizar cambios")
      setStep("error")
    }
  }

  // ── Selection ─────────────────────────────────────────────────

  function toggleAll() {
    setSelected(selected.size === changes.length ? new Set() : new Set(changes.map((_, i) => i)))
  }

  function toggleOne(i: number) {
    const next = new Set(selected)
    if (next.has(i)) { next.delete(i) } else { next.add(i) }
    setSelected(next)
  }

  function reset() {
    setStep("record")
    setChanges([])
    setSelected(new Set())
    setErrorMsg("")
    setElapsed(0)
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle>Editar con audio</DialogTitle>
        </DialogHeader>

        {/* Record */}
        {step === "record" && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 px-6">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`h-20 w-20 rounded-full flex items-center justify-center shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isRecording
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
              aria-label={isRecording ? "Detener grabación" : "Iniciar grabación"}
            >
              {isRecording ? <Square className="h-7 w-7" fill="currentColor" /> : <Mic className="h-7 w-7" />}
            </button>
            <p className="text-sm text-muted-foreground">
              {isRecording ? `Grabando… ${fmtTime(elapsed)}` : "Tocá para grabar"}
            </p>
            {isRecording && (
              <p className="text-xs text-muted-foreground">Tocá de nuevo para detener</p>
            )}
          </div>
        )}

        {/* Transcribing / Analyzing */}
        {(step === "transcribing" || step === "analyzing") && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {step === "transcribing" ? "Transcribiendo…" : "Analizando cambios…"}
            </p>
          </div>
        )}

        {/* Review */}
        {step === "review" && (
          <>
            <div className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0">
              <span className="text-sm font-medium text-muted-foreground">
                {selected.size} de {changes.length} seleccionados
              </span>
              <button type="button" onClick={toggleAll} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                {selected.size === changes.length ? "Ninguno" : "Seleccionar todo"}
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6">
              {changes.map((c, i) => (
                <ChangeRow key={i} change={c} index={i} checked={selected.has(i)} onToggle={() => toggleOne(i)} />
              ))}
            </div>
            <DialogFooter className="px-6 py-4 border-t flex-shrink-0 flex-row gap-2">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={() => onApply(changes.filter((_, i) => selected.has(i)))} disabled={selected.size === 0}>
                Aplicar ({selected.size})
              </Button>
            </DialogFooter>
          </>
        )}

        {/* No changes found */}
        {step === "no_changes" && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              No se detectaron cambios. Intentá con instrucciones más claras.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cerrar</Button>
              <Button onClick={reset}>Intentar de nuevo</Button>
            </div>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 px-6 text-center">
            <p className="text-sm text-destructive">{errorMsg}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cerrar</Button>
              <Button onClick={reset}>Intentar de nuevo</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
