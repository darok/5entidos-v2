"use client"

import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload } from "lucide-react"

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
}

// Lets the user upload a file or enter an image URL; shows a preview
export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState(value ?? "")

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

  function handleUrlBlur() {
    onChange(urlInput.trim() || null)
  }

  return (
    <div className="space-y-3">
      <Label>Imagen</Label>
      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">
            <Upload className="mr-1 h-3.5 w-3.5" />
            Subir archivo
          </TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading && <p className="text-sm text-muted-foreground mt-1">Subiendo…</p>}
        </TabsContent>

        <TabsContent value="url" className="mt-3">
          <Input
            type="url"
            placeholder="https://..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onBlur={handleUrlBlur}
          />
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
            onClick={() => { onChange(null); setUrlInput("") }}
          >
            Quitar
          </Button>
        </div>
      )}
    </div>
  )
}
