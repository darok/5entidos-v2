"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Captions, Link as LinkIcon, Image as ImageIcon } from "lucide-react"
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
  const [extracted, setExtracted] = useState<ExtractedRecipe | null>(null)
  const [fetching, setFetching] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFetchTranscript() {
    setError(null)
    setFetching(true)
    try {
      const res = await fetch("/api/ai/import/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al obtener subtítulos")
      setTranscript(data.transcript)
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
          Pegá el link de un video de YouTube. Se usarán los subtítulos del video para extraer la receta.
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
            {fetching ? "Obteniendo…" : "Obtener subtítulos →"}
          </Button>
        </div>
      </section>

      {(step === "transcript" || step === "preview") && (
        <>
          <Separator />
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Transcripción</h2>
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => { setStep("input"); setExtracted(null) }}
              >
                ← Cambiar video
              </button>
            </div>
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
                ← Editar transcripción
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

function FotoTab() {
  const router = useRouter()
  const { setData } = useAudioRecipeStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<FotoStep>("input")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<ExtractedRecipe | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setError(null)

    if (!f.type.startsWith("image/")) {
      setError("Solo se aceptan imágenes.")
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("La imagen es demasiado grande (máx 5 MB). Comprimila antes de subir.")
      return
    }

    setFile(f)
    const objectUrl = URL.createObjectURL(f)
    setPreviewUrl(objectUrl)
  }

  async function handleExtract() {
    if (!file) return
    setError(null)
    setExtracting(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
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
    setFile(null)
    setPreviewUrl(null)
    setExtracted(null)
    setStep("input")
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Subí una foto de una receta escrita o impresa. Funciona mejor con imágenes claras y bien enfocadas.
        </p>

        {step === "input" ? (
          <div className="space-y-3">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Vista previa" className="max-h-48 mx-auto rounded object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Hacé clic para seleccionar una imagen</span>
                  <span className="text-xs">JPG, PNG, WebP — máx 5 MB</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            {file && (
              <Button onClick={handleExtract} disabled={extracting}>
                {extracting ? "Analizando imagen…" : "Extraer receta →"}
              </Button>
            )}
          </div>
        ) : null}
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
                ← Cambiar imagen
              </button>
            </div>
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Imagen importada" className="max-h-32 rounded border object-contain" />
            )}
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
