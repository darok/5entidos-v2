"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Mic, Square, Upload, ArrowRight } from "lucide-react"
import { useAudioRecipeStore } from "@/lib/stores/audio-recipe"
import type { ExtractedRecipe } from "@/types"

type Step = "record" | "transcript" | "preview" | "done"

// 4-step audio → recipe flow: record/upload → transcript → extract → load form
export default function AudioPage() {
  const router = useRouter()
  const { setData } = useAudioRecipeStore()

  const [step, setStep] = useState<Step>("record")
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioName, setAudioName] = useState<string>("")
  const [transcript, setTranscript] = useState("")
  const [extracted, setExtracted] = useState<ExtractedRecipe | null>(null)
  const [transcribing, setTranscribing] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  // ── Step 1: record ────────────────────────────────────────────

  async function startRecording() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        setAudioName("grabacion.webm")
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start()
      mediaRecorderRef.current = mr
      setRecording(true)
    } catch {
      setError("No se pudo acceder al micrófono.")
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAudioBlob(file)
    setAudioName(file.name)
  }

  // ── Step 2: transcribe ────────────────────────────────────────

  async function handleTranscribe() {
    if (!audioBlob) return
    setError(null)
    setTranscribing(true)
    try {
      const formData = new FormData()
      formData.append("file", audioBlob, audioName)
      const res = await fetch("/api/ai/transcribe", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al transcribir")
      setTranscript(data.transcript)
      setStep("transcript")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setTranscribing(false)
    }
  }

  // ── Step 3: extract ───────────────────────────────────────────

  async function handleExtract() {
    if (!transcript.trim()) return
    setError(null)
    setExtracting(true)
    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al extraer")
      setExtracted(data)
      setStep("preview")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setExtracting(false)
    }
  }

  // ── Step 4: load form ─────────────────────────────────────────

  function handleLoadForm() {
    if (!extracted) return
    setData(extracted)
    router.push("/recipes/new")
  }

  return (
    <div className="container max-w-2xl py-8 space-y-8">
      <h1 className="text-2xl font-bold">Nueva receta por audio</h1>

      {/* Step 1 — Record or upload */}
      <section className="space-y-4">
        <h2 className="font-semibold text-lg">1. Audio</h2>
        <div className="flex flex-wrap gap-3">
          {recording ? (
            <Button variant="destructive" onClick={stopRecording}>
              <Square className="mr-2 h-4 w-4" />
              Detener grabación
            </Button>
          ) : (
            <Button variant="outline" onClick={startRecording} disabled={transcribing}>
              <Mic className="mr-2 h-4 w-4" />
              Grabar
            </Button>
          )}
          <div className="relative">
            <Button variant="outline" asChild disabled={recording || transcribing}>
              <Label htmlFor="audio-upload" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Subir archivo
              </Label>
            </Button>
            <Input
              id="audio-upload"
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              disabled={recording || transcribing}
            />
          </div>
        </div>
        {audioName && (
          <p className="text-sm text-muted-foreground">
            Audio listo: <span className="font-medium">{audioName}</span>
          </p>
        )}
        {audioBlob && (
          <Button onClick={handleTranscribe} disabled={transcribing || recording}>
            {transcribing ? "Transcribiendo…" : "Transcribir →"}
          </Button>
        )}
      </section>

      {/* Step 2 — Edit transcript */}
      {(step === "transcript" || step === "preview") && (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="font-semibold text-lg">2. Transcripción</h2>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            {step === "transcript" && (
              <Button onClick={handleExtract} disabled={extracting || !transcript.trim()}>
                {extracting ? "Extrayendo receta…" : "Extraer receta →"}
              </Button>
            )}
          </section>
        </>
      )}

      {/* Step 3 — Preview extracted recipe */}
      {step === "preview" && extracted && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="font-semibold text-lg">3. Vista previa</h2>
            <div className="rounded-md border p-4 space-y-3 text-sm">
              <p><span className="font-medium">Título:</span> {extracted.title}</p>
              {extracted.description && <p><span className="font-medium">Descripción:</span> {extracted.description}</p>}
              {extracted.servings != null && <p><span className="font-medium">Porciones:</span> {extracted.servings}</p>}
              {extracted.ingredients?.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Ingredientes:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                    {extracted.ingredients.map((ing, i) => (
                      <li key={i}>
                        {ing.quantity != null ? `${ing.quantity} ` : ""}
                        {ing.unit ? `${ing.unit} ` : ""}
                        {ing.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {extracted.steps?.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Pasos:</p>
                  <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
                    {extracted.steps.map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={handleLoadForm}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Cargar al formulario
              </Button>
              <Button variant="outline" onClick={handleExtract} disabled={extracting}>
                {extracting ? "Re-extrayendo…" : "Re-extraer"}
              </Button>
            </div>
          </section>
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
