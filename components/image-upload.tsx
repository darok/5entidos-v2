"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Search, RefreshCw } from "lucide-react"

interface UnsplashResult {
  id: string
  urls: { small: string; regular: string }
  alt: string
  downloadUrl: string
}

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  searchHint?: string
}

// Extract the visible cropped area from an image URL into a Blob
async function getCroppedBlob(src: string, pixels: Area): Promise<Blob> {
  const img = document.createElement("img")
  img.crossOrigin = "anonymous"
  await new Promise<void>((res, rej) => {
    img.onload = () => res()
    img.onerror = () => rej()
    img.src = src
  })
  const canvas = document.createElement("canvas")
  canvas.width = pixels.width
  canvas.height = pixels.height
  canvas.getContext("2d")!.drawImage(
    img, pixels.x, pixels.y, pixels.width, pixels.height,
    0, 0, pixels.width, pixels.height
  )
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej("toBlob failed")), "image/webp", 0.95)
  )
}

// Lets the user upload a file, search Unsplash, or enter a URL — then crop/zoom the result
export function ImageUpload({ value, onChange, searchHint }: ImageUploadProps) {
  // ── source tabs ───────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("upload")
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchHint ?? "")
  const [searchResults, setSearchResults] = useState<UnsplashResult[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [pickingPhoto, setPickingPhoto] = useState(false)
  const [searchPage, setSearchPage] = useState(0)

  // ── crop step ─────────────────────────────────────────────────
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropPendingUrl, setCropPendingUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [cropDirty, setCropDirty] = useState(false)
  const [cropSaving, setCropSaving] = useState(false)

  // Called when any source resolves to a Supabase URL — opens crop step
  function handleImageReady(supabaseUrl: string) {
    setCropPendingUrl(supabaseUrl)
    setCropSrc(supabaseUrl)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCropDirty(false)
    setCroppedAreaPixels(null)
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  async function confirmCrop() {
    if (!cropSrc || !cropPendingUrl) return

    // Nothing changed — use already-uploaded URL directly, skip re-upload
    if (!cropDirty) {
      onChange(cropPendingUrl)
      setCropSrc(null)
      setActiveTab("upload")
      return
    }

    if (!croppedAreaPixels) return
    setCropSaving(true)
    try {
      const blob = await getCroppedBlob(cropSrc, croppedAreaPixels)
      const formData = new FormData()
      formData.append("file", blob, "crop.jpg")
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) {
        onChange(data.url)
        setCropSrc(null)
        setActiveTab("upload")
      }
    } finally {
      setCropSaving(false)
    }
  }

  function cancelCrop() {
    setCropSrc(null)
    setCropPendingUrl(null)
  }

  // ── source handlers ───────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) handleImageReady(data.url)
      else alert("Error al subir la imagen.")
    } catch {
      alert("Error al subir la imagen.")
    } finally {
      setUploading(false)
    }
  }

  async function handleUrlLoad() {
    if (!urlInput.trim()) return
    setUrlLoading(true)
    setUrlError(null)
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      })
      const data = await res.json()
      if (data.url) {
        handleImageReady(data.url)
        setUrlInput("")
      } else {
        setUrlError(data.error ?? "Error al cargar la imagen.")
      }
    } catch {
      setUrlError("Error al cargar la imagen.")
    } finally {
      setUrlLoading(false)
    }
  }

  async function handleSearch(page = 1) {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchError(null)
    setSearchPage(page)
    if (page === 1) setSearchResults([])
    try {
      const res = await fetch(`/api/unsplash/search?query=${encodeURIComponent(searchQuery.trim())}&page=${page}`)
      const data = await res.json()
      if (!Array.isArray(data)) {
        setSearchError(data.error ?? "Error al buscar fotos.")
        return
      }
      if (page === 1) setSearchResults(data)
      else setSearchResults((prev) => [...prev, ...data])
    } catch {
      setSearchError("Error de red al buscar fotos.")
    } finally {
      setSearching(false)
    }
  }

  async function handlePickPhoto(photo: UnsplashResult) {
    setPickingPhoto(true)
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: photo.urls.regular }),
      })
      const data = await res.json()
      if (data.url) {
        handleImageReady(data.url)
        setSearchResults([])
      }
    } finally {
      setPickingPhoto(false)
    }
  }

  // ── render ────────────────────────────────────────────────────

  // Crop step replaces tabs while active
  if (cropSrc) {
    return (
      <div className="space-y-3">
        <Label>Imagen</Label>
        {/* onPointerDown marks dirty only on real user interaction, not react-easy-crop's mount call */}
        <div
          className="relative w-full aspect-video overflow-hidden rounded-md bg-black"
          onPointerDown={() => setCropDirty(true)}
        >
          <Cropper
            image={cropSrc}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="flex items-center gap-3 px-1">
          <span className="text-xs text-muted-foreground shrink-0">Zoom</span>
          <Slider
            min={1} max={3} step={0.05}
            value={[zoom]}
            onValueChange={([v]) => { setZoom(v); setCropDirty(true) }}
            className="flex-1"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={confirmCrop} disabled={cropSaving}>
            {cropSaving ? "Guardando…" : "Guardar"}
          </Button>
          <Button variant="ghost" onClick={cancelCrop} disabled={cropSaving}>
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Label>Imagen</Label>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upload">
            <Upload className="mr-1 h-3.5 w-3.5" />
            Subir archivo
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="mr-1 h-3.5 w-3.5" />
            Buscar
          </TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          <label
            htmlFor="image-file-upload"
            className={`inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md border bg-background hover:bg-muted text-sm font-medium transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Subiendo…" : "Seleccionar archivo"}
          </label>
          <Input
            id="image-file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="sr-only"
          />
        </TabsContent>

        <TabsContent value="search" className="mt-3 space-y-3">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(1) }}
              placeholder="Buscar foto…"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => handleSearch(1)}
              disabled={searching || !searchQuery.trim()}
            >
              {searching && searchPage === 1 ? "…" : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {searchError && <p className="text-sm text-destructive">{searchError}</p>}

          {!searchError && searchPage > 0 && !searching && searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin resultados para esta búsqueda.</p>
          )}

          {searchResults.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {searchResults.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => handlePickPhoto(photo)}
                    disabled={pickingPhoto}
                    className="relative aspect-square overflow-hidden rounded-md hover:ring-2 ring-primary focus:outline-none disabled:opacity-50"
                  >
                    <Image src={photo.urls.small} alt={photo.alt} fill className="object-cover" />
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => handleSearch(searchPage + 1)}
                disabled={searching}
              >
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${searching && searchPage > 1 ? "animate-spin" : ""}`} />
                {searching && searchPage > 1 ? "Cargando…" : "Más resultados"}
              </Button>
            </>
          )}

          {pickingPhoto && <p className="text-sm text-muted-foreground">Cargando foto…</p>}
        </TabsContent>

        <TabsContent value="url" className="mt-3">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleUrlLoad() }}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleUrlLoad}
              disabled={urlLoading || !urlInput.trim()}
            >
              {urlLoading ? "…" : "Cargar"}
            </Button>
          </div>
          {urlError && <p className="text-sm text-destructive mt-1">{urlError}</p>}
        </TabsContent>
      </Tabs>

      {/* Preview with crop button */}
      {value && (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
          <Image src={value} alt="Preview" fill className="object-cover" />
          <div className="absolute top-2 right-2 flex gap-1.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleImageReady(value)}
            >
              Recortar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onChange(null)}
            >
              Quitar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
