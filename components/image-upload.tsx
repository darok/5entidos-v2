"use client"

import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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

// Lets the user upload a file, enter an image URL (stored to Supabase), or search Unsplash
export function ImageUpload({ value, onChange, searchHint }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchHint ?? "")
  const [searchResults, setSearchResults] = useState<UnsplashResult[]>([])
  const [searching, setSearching] = useState(false)
  const [pickingPhoto, setPickingPhoto] = useState(false)
  const [searchPage, setSearchPage] = useState(1)
  const [activeTab, setActiveTab] = useState("upload")

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) onChange(data.url)
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
        onChange(data.url)
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
    setSearchPage(page)
    if (page === 1) setSearchResults([])
    try {
      const res = await fetch(`/api/unsplash/search?query=${encodeURIComponent(searchQuery.trim())}&page=${page}`)
      const data = await res.json()
      const results = Array.isArray(data) ? data : []
      if (page === 1) setSearchResults(results)
      else setSearchResults(prev => [...prev, ...results])
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
        onChange(data.url)
        setSearchResults([])
        setActiveTab("upload")
      }
      fetch(`/api/unsplash/search?trigger=${encodeURIComponent(photo.downloadUrl)}`).catch(() => {})
    } finally {
      setPickingPhoto(false)
    }
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

      {/* Preview */}
      {value && (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
          <Image src={value} alt="Preview" fill className="object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => onChange(null)}
          >
            Quitar
          </Button>
        </div>
      )}
    </div>
  )
}
