"use client"

import { useState, useRef } from "react"
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

function YouTubeTab() {
  const router = useRouter()
  const { setData } = useAudioRecipeStore()

  const [step, setStep] = useState<YouTubeStep>("input")
  const [url, setUrl] = useState("")
  const [transcript, setTranscript] = useState("")
  const [source, setSource] = useState<"subtitles" | "audio" | null>(null)
  const [extracted, setExtracted] = useState<ExtractedRecipe | null>(null)
  const [fetching, setFetching] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [noTranscript, setNoTranscript] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFetchTranscript() {
    setError(null)
    setNoTranscript(false)
    setFetching(true)
    try {
      const res = await fetch("/api/ai/import/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al obtener contenido del video")
      setTranscript(data.transcript ?? "")
      setSource(data.source ?? null)
      setNoTranscript(!data.hasTranscript)
      setStep("transcript")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setFetching(false)
    }
  }

  async function handleExtract() {
    setError(null)
    setExtracting(true)
    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
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

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Pegá el link de un video de YouTube. Se usan los subtítulos si están disponibles;
          si no, se transcribe el audio automáticamente. El título y la descripción del video también se consideran.
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
            {fetching ? "Procesando video…" : "Obtener contenido →"}
          </Button>
        </div>
      </section>

      {(step === "transcript" || step === "preview") && (
        <>
          <Separator />
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">Contenido del video</h2>
                {source && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                    {source === "subtitles" ? "Subtítulos" : "Audio (Whisper)"}
                  </span>
                )}
              </div>
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => { setStep("input"); setExtracted(null); setSource(null); setNoTranscript(false) }}
              >
                ← Cambiar video
              </button>
            </div>
            {noTranscript && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                No encontramos subtítulos automáticos para este video. Podés pegar el transcript manualmente: en YouTube, abrí el video → tres puntos "..." → "Mostrar transcript", copiá el texto y pegalo acá.
              </p>
            )}
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={6}
              placeholder={noTranscript ? "Pegá el transcript del video acá…" : undefined}
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
