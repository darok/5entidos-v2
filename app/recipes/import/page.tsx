"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Captions, Link as LinkIcon, Image as ImageIcon, X } from "lucide-react"
import { ExtractedRecipePreview } from "@/components/extracted-recipe-preview"
import { useAudioRecipeStore } from "@/lib/stores/audio-recipe"
import type { ExtractedRecipe } from "@/types"

// ── YouTube tab ───────────────────────────────────────────────────────────────

type YouTubeStep = "input" | "transcript" | "preview"

// Editable box showing whether a given content source was found, plus its text.
function ContentBox({
  label,
  found,
  notFoundLabel = "No encontrado",
  value,
  onChange,
  placeholder,
  hint,
  extra,
  rows = 4,
}: {
  label: string
  found: boolean
  notFoundLabel?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
  extra?: React.ReactNode
  rows?: number
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span
          className={
            found
              ? "text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
              : "text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
          }
        >
          {found ? "✓ Encontrado" : `✗ ${notFoundLabel}`}
        </span>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {extra}
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="font-mono text-sm"
      />
    </div>
  )
}

const WHISPER_ACCEPT = "audio/*,video/mp4,video/webm,.m4a,.mp3,.wav,.ogg"
const WHISPER_MAX_SIZE = 25 * 1024 * 1024 // OpenAI Whisper's file size limit

function YouTubeTab() {
  const router = useRouter()
  const { setData } = useAudioRecipeStore()

  const [step, setStep] = useState<YouTubeStep>("input")
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [descriptionFound, setDescriptionFound] = useState(false)
  const [captions, setCaptions] = useState("")
  const [captionsFound, setCaptionsFound] = useState(false)
  const [audioTranscript, setAudioTranscript] = useState("")
  const [audioFound, setAudioFound] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [agentOrigin, setAgentOrigin] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<ExtractedRecipe | null>(null)
  const [fetching, setFetching] = useState(false)
  const [statusText, setStatusText] = useState("")
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const esRef = useRef<EventSource | null>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const closeStream = useCallback(() => {
    esRef.current?.close()
    esRef.current = null
  }, [])

  function resetContent() {
    setTitle(null)
    setDescription(""); setDescriptionFound(false)
    setCaptions(""); setCaptionsFound(false)
    setAudioTranscript(""); setAudioFound(false)
  }

  // Starts a background import job on the agent server and streams progress via SSE.
  // This avoids racing a fixed timeout — the captions→audio→Whisper fallback chain
  // can take as long as it needs instead of failing on a Vercel function deadline.
  async function handleFetchTranscript() {
    setError(null)
    resetContent()
    setFetching(true)
    setStatusText("Conectando…")

    const wakeupTimer = setTimeout(() => {
      setStatusText("El servidor está iniciando (puede tardar hasta 30s)…")
    }, 9000)

    try {
      const res = await fetch("/api/ai/import/youtube/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      clearTimeout(wakeupTimer)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al iniciar la importación")
      setAgentOrigin(new URL(data.streamUrl).origin)

      const es = new EventSource(data.streamUrl)
      esRef.current = es

      es.onmessage = (e) => {
        let event: Record<string, unknown>
        try { event = JSON.parse(e.data) } catch { return }

        switch (event.type) {
          case "status":
            setStatusText(event.text as string)
            break
          case "done": {
            closeStream()
            setTitle((event.title as string | null) ?? null)
            const desc = (event.description as string | null) ?? ""
            setDescription(desc)
            setDescriptionFound(!!desc)

            const src = event.source as "subtitles" | "audio" | null
            const spoken = (event.transcript as string | null) ?? ""
            setCaptions(src === "subtitles" ? spoken : "")
            setCaptionsFound(src === "subtitles" && !!spoken)
            setAudioTranscript(src === "audio" ? spoken : "")
            setAudioFound(src === "audio" && !!spoken)

            setStep("transcript")
            setFetching(false)
            break
          }
          case "error":
            setError((event.message as string) || "Error al obtener contenido del video")
            setFetching(false)
            closeStream()
            break
        }
      }

      es.onerror = () => {
        setError("Se perdió la conexión con el servidor")
        setFetching(false)
        closeStream()
      }
    } catch (err) {
      clearTimeout(wakeupTimer)
      setError(err instanceof Error ? err.message : "Error desconocido")
      setFetching(false)
    }
  }

  // Manual fallback when automatic audio transcription didn't find anything: the user
  // extracts/downloads the audio themselves with an external tool and uploads it here.
  // Goes straight to the Render agent (not through Vercel) since Vercel's serverless
  // functions cap request bodies at ~4.5MB — well under a real video's audio track.
  async function handleUploadAudio(file: File) {
    setError(null)
    if (file.size > WHISPER_MAX_SIZE) {
      setError(`El archivo supera el límite de ${WHISPER_MAX_SIZE / 1e6} MB de Whisper.`)
      return
    }
    if (!agentOrigin) {
      setError("No se pudo determinar el servidor de transcripción. Volvé a obtener el contenido del video.")
      return
    }
    setUploadingAudio(true)
    try {
      const res = await fetch(`${agentOrigin}/whisper/transcribe`, {
        method: "POST",
        headers: { "Content-Type": file.type || "audio/mpeg" },
        body: file,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al transcribir el audio")
      setAudioTranscript(data.transcript ?? "")
      setAudioFound(!!data.transcript)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setUploadingAudio(false)
      if (audioInputRef.current) audioInputRef.current.value = ""
    }
  }

  async function handleExtract() {
    setError(null)
    setExtracting(true)
    try {
      const parts: string[] = []
      if (title) parts.push(`Título del video: ${title}`)
      if (description.trim()) parts.push(`Descripción del video:\n${description}`)
      if (captions.trim()) parts.push(`Subtítulos:\n${captions}`)
      if (audioTranscript.trim()) parts.push(`Transcripción de audio:\n${audioTranscript}`)

      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: parts.join("\n\n") }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al extraer receta")
      setExtracted(data)
      setStep("preview")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setExtracting(false)
    }
  }

  function handleLoadForm() {
    if (!extracted) return
    setData(extracted)
    router.push("/recipes/new")
  }

  const hasAnyContent = !!(description.trim() || captions.trim() || audioTranscript.trim())

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Pegá el link de un video de YouTube. Se usan los subtítulos si están disponibles;
          si no, se intenta transcribir el audio automáticamente. El título y la descripción del video también se consideran.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={fetching}
            onKeyDown={(e) => { if (e.key === "Enter" && url.trim()) handleFetchTranscript() }}
          />
          <Button onClick={handleFetchTranscript} disabled={fetching || !url.trim()}>
            {fetching ? statusText || "Procesando…" : "Obtener contenido →"}
          </Button>
        </div>
      </section>

      {(step === "transcript" || step === "preview") && (
        <>
          <Separator />
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Contenido del video</h2>
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => { closeStream(); setStep("input"); setExtracted(null); resetContent() }}
              >
                ← Cambiar video
              </button>
            </div>

            <ContentBox
              label="Descripción"
              found={descriptionFound}
              value={description}
              onChange={setDescription}
              placeholder="Sin descripción"
              rows={3}
            />

            <ContentBox
              label="Subtítulos"
              found={captionsFound}
              value={captions}
              onChange={setCaptions}
              placeholder="Pegá el transcript manualmente acá…"
              hint={!captionsFound ? 'En YouTube: abrí el video → tres puntos "..." → "Mostrar transcript", copiá el texto y pegalo acá.' : undefined}
            />

            <ContentBox
              label="Audio"
              found={audioFound}
              notFoundLabel="No disponible"
              value={audioTranscript}
              onChange={setAudioTranscript}
              placeholder="Transcripción del audio…"
              extra={
                !audioFound && (
                  <div className="flex items-center gap-2">
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept={WHISPER_ACCEPT}
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadAudio(f) }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => audioInputRef.current?.click()}
                      disabled={uploadingAudio}
                    >
                      {uploadingAudio ? "Transcribiendo…" : "Subir audio →"}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Extraé el audio del video con una herramienta externa y subilo acá
                    </span>
                  </div>
                )
              }
            />

            {step === "transcript" && (
              <Button onClick={handleExtract} disabled={extracting || !hasAnyContent}>
                {extracting ? "Extrayendo receta…" : "Extraer receta →"}
              </Button>
            )}
          </section>
        </>
      )}

      {step === "preview" && extracted && (
        <>
          <Separator />
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Vista previa</h2>
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setStep("transcript")}
              >
                ← Editar contenido
              </button>
            </div>
            <ExtractedRecipePreview
              extracted={extracted}
              onLoadForm={handleLoadForm}
              onReExtract={handleExtract}
              reExtracting={extracting}
            />
          </section>
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

// ── Foto tab ──────────────────────────────────────────────────────────────────

type FotoStep = "input" | "preview"

interface FilePreview {
  file: File
  url: string
}

function FotoTab() {
  const router = useRouter()
  const { setData } = useAudioRecipeStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<FotoStep>("input")
  const [previews, setPreviews] = useState<FilePreview[]>([])
  const [extracted, setExtracted] = useState<ExtractedRecipe | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    if (!selected.length) return
    setError(null)

    const ACCEPTED = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    const MAX_SIZE = 5 * 1024 * 1024

    for (const f of selected) {
      if (!ACCEPTED.includes(f.type)) {
        setError("Solo se aceptan imágenes JPG, PNG, GIF o WebP.")
        return
      }
      if (f.size > MAX_SIZE) {
        setError(`"${f.name}" supera el límite de 5 MB por imagen.`)
        return
      }
    }

    const next: FilePreview[] = selected.map((f) => ({ file: f, url: URL.createObjectURL(f) }))
    setPreviews((prev) => [...prev, ...next])
  }

  function removeFile(index: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleExtract() {
    if (!previews.length) return
    setError(null)
    setExtracting(true)
    try {
      const formData = new FormData()
      previews.forEach(({ file }) => formData.append("file", file))
      const res = await fetch("/api/ai/import/image", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al analizar imagen")
      setExtracted(data)
      setStep("preview")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setExtracting(false)
    }
  }

  function handleLoadForm() {
    if (!extracted) return
    setData(extracted)
    router.push("/recipes/new")
  }

  function handleReset() {
    previews.forEach(({ url }) => URL.revokeObjectURL(url))
    setPreviews([])
    setExtracted(null)
    setStep("input")
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Subí una o varias fotos de una receta escrita o impresa (p. ej., varias páginas de un libro).
          Funciona mejor con imágenes claras y bien enfocadas.
        </p>

        {step === "input" && (
          <div className="space-y-3">
            {/* Thumbnails grid */}
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {previews.map(({ url, file }, i) => (
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={file.name}
                      className="h-24 w-24 object-cover rounded border"
                    />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Eliminar imagen"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {/* Add more button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-24 w-24 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
                  aria-label="Agregar más imágenes"
                >
                  <Upload className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Drop zone shown only when no files yet */}
            {previews.length === 0 && (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Hacé clic para seleccionar imágenes</span>
                  <span className="text-xs">JPG, PNG, WebP — máx 5 MB por imagen</span>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {previews.length > 0 && (
              <Button onClick={handleExtract} disabled={extracting}>
                {extracting
                  ? "Analizando…"
                  : previews.length === 1
                    ? "Extraer receta →"
                    : `Extraer receta de ${previews.length} imágenes →`}
              </Button>
            )}
          </div>
        )}
      </section>

      {step === "preview" && extracted && (
        <>
          <Separator />
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Vista previa</h2>
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={handleReset}
              >
                ← Cambiar imágenes
              </button>
            </div>
            {/* Compact thumbnail strip for reference */}
            <div className="flex gap-2 flex-wrap">
              {previews.map(({ url, file }, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt={file.name} className="h-16 rounded border object-cover" />
              ))}
            </div>
            <ExtractedRecipePreview
              extracted={extracted}
              onLoadForm={handleLoadForm}
            />
          </section>
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

// ── Link tab ──────────────────────────────────────────────────────────────────

type LinkStep = "input" | "preview"

function LinkTab() {
  const router = useRouter()
  const { setData } = useAudioRecipeStore()

  const [step, setStep] = useState<LinkStep>("input")
  const [url, setUrl] = useState("")
  const [extracted, setExtracted] = useState<ExtractedRecipe | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleImport() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/ai/import/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al importar")
      setExtracted(data)
      setStep("preview")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  function handleLoadForm() {
    if (!extracted) return
    setData(extracted)
    router.push("/recipes/new")
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Pegá el link de una página web con una receta. Funciona mejor con blogs de recetas.
          Las páginas con login o paywall no son compatibles.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="https://ejemplo.com/receta-de-tarta"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => { if (e.key === "Enter" && url.trim()) handleImport() }}
          />
          <Button onClick={handleImport} disabled={loading || !url.trim()}>
            {loading ? "Importando…" : "Importar →"}
          </Button>
        </div>
      </section>

      {step === "preview" && extracted && (
        <>
          <Separator />
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Vista previa</h2>
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => { setStep("input"); setExtracted(null) }}
              >
                ← Cambiar URL
              </button>
            </div>
            <ExtractedRecipePreview
              extracted={extracted}
              onLoadForm={handleLoadForm}
            />
          </section>
        </>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ImportPage() {
  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <h1 className="text-2xl font-bold">Importar receta</h1>

      <Tabs defaultValue="youtube">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="youtube" className="flex items-center gap-1.5">
            <Captions className="h-3.5 w-3.5" />
            YouTube
          </TabsTrigger>
          <TabsTrigger value="foto" className="flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" />
            Foto
          </TabsTrigger>
          <TabsTrigger value="link" className="flex items-center gap-1.5">
            <LinkIcon className="h-3.5 w-3.5" />
            Link
          </TabsTrigger>
        </TabsList>

        <TabsContent value="youtube" className="pt-6">
          <YouTubeTab />
        </TabsContent>
        <TabsContent value="foto" className="pt-6">
          <FotoTab />
        </TabsContent>
        <TabsContent value="link" className="pt-6">
          <LinkTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
