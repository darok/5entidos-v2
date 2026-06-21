"use client"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles } from "lucide-react"

// ── Data ─────────────────────────────────────────────────────────

type StyleKey = "recetario" | "editorial" | "minimalista" | "rustico"

type Controls = {
  servir: "mantener" | "prolijo" | "chef"
  vajilla: "mantener" | "mejorar" | "cambiar"
  fondo: "conservar" | "mejorar" | "blanco" | "madera-clara" | "madera-campestre" | "restaurante" | "lino"
  correccion: "ninguna" | "automatica" | "profesional"
  encuadre: "mantener" | "mejorar" | "clasico45" | "cenital"
  props: "ninguno" | "minimos" | "sutiles"
}

const STYLES: Record<StyleKey, { label: string; description: string; defaults: Controls }> = {
  recetario: {
    label: "Recetario limpio",
    description: "fondo neutro y uniforme, superficie clara y lisa, luz natural difusa y pareja, foco nítido en el plato, paleta sobria, sin props; estética de recetario profesional, limpia y directa.",
    defaults: { servir: "prolijo", vajilla: "mejorar", fondo: "blanco", correccion: "automatica", encuadre: "mejorar", props: "ninguno" },
  },
  editorial: {
    label: "Editorial cálido",
    description: "superficie de madera o lino con textura sutil, luz cálida y lateral suave, sombras con profundidad, sensación de revista gastronómica, profundidad de campo corta con el fondo levemente desenfocado, props mínimos y coherentes apenas insinuados.",
    defaults: { servir: "chef", vajilla: "cambiar", fondo: "madera-clara", correccion: "automatica", encuadre: "clasico45", props: "minimos" },
  },
  minimalista: {
    label: "Minimalista claro",
    description: "superficie blanca o muy clara, luz abundante y aireada, fondo limpio casi sin sombra, estética moderna y minimalista, mucho espacio negativo, foco total en el plato.",
    defaults: { servir: "prolijo", vajilla: "cambiar", fondo: "blanco", correccion: "automatica", encuadre: "cenital", props: "ninguno" },
  },
  rustico: {
    label: "Rústico",
    description: "superficie de madera oscura o piedra texturada, luz lateral cálida y algo dramática, sombras marcadas, paleta terrosa, sensación hogareña y artesanal, props rústicos mínimos (madera, lino crudo).",
    defaults: { servir: "chef", vajilla: "mejorar", fondo: "madera-campestre", correccion: "automatica", encuadre: "mantener", props: "minimos" },
  },
}

const CONTROL_OPTIONS: Record<keyof Controls, Record<string, { label: string; prompt: string }>> = {
  servir: {
    mantener: { label: "Mantener", prompt: "Conservá el emplatado actual; solo acomodá y limpiá lo mínimo." },
    prolijo: { label: "Emprolijar", prompt: "Serví el plato de forma prolija y apetecible en una vajilla adecuada." },
    chef: { label: "Emplatado de chef", prompt: "Reinterpretá la presentación como un chef profesional: emplatado cuidado, porciones bien dispuestas, terminaciones prolijas, con los mismos ingredientes." },
  },
  vajilla: {
    mantener: { label: "Mantener", prompt: "Conservá la vajilla o recipiente actual." },
    mejorar: { label: "Mejorar", prompt: "Mejorá la vajilla actual por una versión más prolija y presentable del mismo tipo." },
    cambiar: { label: "Cambiar", prompt: "Cambiá la vajilla por una de presentación adecuada al plato y al estilo." },
  },
  fondo: {
    conservar: { label: "Mantener", prompt: "Conservá el fondo actual." },
    mejorar: { label: "Mejorar", prompt: "Conservá la idea del fondo actual pero mejoralo." },
    blanco: { label: "Blanco neutro", prompt: "Fondo blanco o neutro, limpio y uniforme." },
    "madera-clara": { label: "Madera clara", prompt: "Superficie de mesa de madera clara." },
    "madera-campestre": { label: "Madera campestre", prompt: "Superficie de mesa de madera rústica, tipo campestre." },
    restaurante: { label: "Mesa de restaurante", prompt: "Mesa de restaurante elegante, prolija, con mantel claro." },
    lino: { label: "Lino / tela", prompt: "Superficie con mantel de lino o tela neutra." },
  },
  correccion: {
    ninguna: { label: "Ninguna", prompt: "Respetá la iluminación y el color de la foto original sin corregir nada." },
    automatica: { label: "Automática", prompt: "Corregí la calidad fotográfica suavemente: foco y nitidez, exposición, balance de blancos, contraste, sombras e iluminación general, como en una foto retocada por un fotógrafo." },
    profesional: { label: "Profesional", prompt: "Regenerá la calidad fotográfica integralmente: foco y nitidez, exposición, balance de blancos, contraste, sombras e iluminación general, como en una foto profesional." },
  },
  encuadre: {
    mantener: { label: "Mantener", prompt: "Mantené la composición y el encuadre exactamente como están en la foto original." },
    mejorar: { label: "Mejorar encuadre", prompt: "Respetá la composición original de la foto; enderezá, recortá y centrá para mejorarla sin cambiar el punto de vista." },
    clasico45: { label: "Clásico 45°", prompt: "Recomponé la toma al ángulo clásico de fotografía de comida, a 45 grados sobre el plato." },
    cenital: { label: "Cenital", prompt: "Recomponé la toma a una vista cenital, desde arriba del plato." },
  },
  props: {
    ninguno: { label: "Ninguno", prompt: "Sin props ni decoración adicional." },
    minimos: { label: "Mínimos", prompt: "Props mínimos solo si refuerzan el plato y son coherentes (un cubierto, una hierba)." },
    sutiles: { label: "Sutiles", prompt: "Algunos props sutiles y coherentes, sin recargar." },
  },
}

// ── Prompt assembly ───────────────────────────────────────────────

function assemblePrompt(
  style: StyleKey,
  controls: Controls,
  nota: string,
  recipeTitle?: string,
  recipeIngredients?: string[],
): string {
  const parts: string[] = [
    "Sos un fotógrafo gastronómico profesional. Tomá esta foto casera de un plato y transformala para que parezca tomada para un recetario comercial: presentación cuidada, buen look and feel, sin adornos innecesarios.",
    "Mantené la identidad del plato: la misma comida, los mismos ingredientes y componentes reconocibles, en cantidades similares. No agregues ni quites ingredientes ni cambies qué es el plato. Sí podés —y conviene— reinterpretar cómo está servido y fotografiado: si está en una olla, sartén o recipiente de cocina, pasalo a una vajilla de presentación y servilo prolijo, como lo haría un chef. Ante la duda, priorizá mantener la identidad del plato.",
  ]

  if (recipeTitle) {
    const ingText = recipeIngredients?.length ? ` Sus ingredientes son: ${recipeIngredients.join(", ")}.` : ""
    parts.push(`El plato se llama "${recipeTitle}".${ingText} Usá esto como referencia para mantener la fidelidad.`)
  }

  parts.push(`Estilo: ${STYLES[style].description}`)
  parts.push(CONTROL_OPTIONS.servir[controls.servir].prompt)
  parts.push(CONTROL_OPTIONS.vajilla[controls.vajilla].prompt)
  parts.push(CONTROL_OPTIONS.fondo[controls.fondo].prompt)
  parts.push(CONTROL_OPTIONS.correccion[controls.correccion].prompt)
  parts.push(CONTROL_OPTIONS.encuadre[controls.encuadre].prompt)
  parts.push(CONTROL_OPTIONS.props[controls.props].prompt)

  if (nota.trim()) parts.push(`Indicación específica: ${nota.trim()}`)

  parts.push("La imagen final debe verse como una fotografía real tomada con cámara: texturas naturales, imperfecciones normales de comida real, iluminación fotográfica creíble. No debe verse como render 3D, imagen generada por IA, foto de stock sobreproducida ni publicidad perfecta. Evitá: saturación exagerada, nitidez artificial, reflejos irreales, simetría perfecta que no existe en la foto original, texto o marcas de agua, ingredientes que no están en la foto original, props fuera de contexto, y cualquier cosa que delate generación o procesamiento digital excesivo.")

  return parts.join(" ")
}

// ── ControlGroup ──────────────────────────────────────────────────

function ControlGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Record<string, { label: string; prompt: string }>
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(options).map(([k, v]) => (
          <button key={k} type="button" onClick={() => onChange(k)} className="focus:outline-none">
            <Badge variant={value === k ? "default" : "outline"} className="cursor-pointer">
              {v.label}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────

type Phase = "idle" | "prompt-preview" | "generating" | "result"

interface AiImageBoostDialogProps {
  open: boolean
  onClose: () => void
  imageUrl: string
  recipeTitle?: string
  recipeIngredients?: string[]
  onSuccess: (newUrl: string) => void
}

// Full AI image enhancement dialog: style + controls → prompt → generate → compare → save
export function AiImageBoostDialog({
  open,
  onClose,
  imageUrl,
  recipeTitle,
  recipeIngredients,
  onSuccess,
}: AiImageBoostDialogProps) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [style, setStyle] = useState<StyleKey>("recetario")
  const [controls, setControls] = useState<Controls>(STYLES.recetario.defaults)
  const [nota, setNota] = useState("")
  const [editedPrompt, setEditedPrompt] = useState<string | null>(null)
  const [resultB64, setResultB64] = useState<string | null>(null)
  // Tracks which image to use as input for the next generation (null = original imageUrl)
  const [currentInputBase, setCurrentInputBase] = useState<string | null>(null)
  const [refineNote, setRefineNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function selectStyle(key: StyleKey) {
    setStyle(key)
    setControls(STYLES[key].defaults)
  }

  function setControl<K extends keyof Controls>(key: K, value: Controls[K]) {
    setControls((prev) => ({ ...prev, [key]: value }))
  }

  const currentPrompt = useCallback(
    () => editedPrompt ?? assemblePrompt(style, controls, nota, recipeTitle, recipeIngredients),
    [editedPrompt, style, controls, nota, recipeTitle, recipeIngredients],
  )

  // inputBase: null = use original imageUrl; data URL = use previous result for chained refinement
  async function generate(prompt: string, inputBase: string | null = null) {
    setPhase("generating")
    setError(null)
    try {
      const body: Record<string, string> = { prompt }
      const src = inputBase ?? imageUrl
      if (src.startsWith("data:")) {
        body.imageBase64 = src.split(",")[1]
      } else {
        body.imageUrl = src
      }
      const res = await fetch("/api/ai/boost-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error al generar")
      setResultB64(data.b64)
      setCurrentInputBase(`data:image/png;base64,${data.b64}`)
      setPhase("result")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setPhase("idle")
    }
  }

  function handleVerPrompt() {
    setEditedPrompt(assemblePrompt(style, controls, nota, recipeTitle, recipeIngredients))
    setPhase("prompt-preview")
  }

  function handleRegenerar() {
    let finalPrompt = editedPrompt ?? assemblePrompt(style, controls, nota, recipeTitle, recipeIngredients)
    if (refineNote.trim()) {
      finalPrompt = `${finalPrompt} ${refineNote.trim()}`
      setEditedPrompt(finalPrompt)
      setRefineNote("")
    }
    generate(finalPrompt, currentInputBase)
  }

  async function handleGuardar() {
    if (!resultB64) return
    setSaving(true)
    setError(null)
    try {
      const blob = await (await fetch(`data:image/png;base64,${resultB64}`)).blob()
      const formData = new FormData()
      formData.append("file", blob, "boost.png")
      formData.append("replaces", imageUrl)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!data.url) throw new Error("Upload failed")
      onSuccess(data.url)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  function handleAjustar() {
    setPhase("idle")
  }

  function handleClose() {
    setPhase("idle")
    setResultB64(null)
    setEditedPrompt(null)
    setError(null)
    setRefineNote("")
    setCurrentInputBase(null)
    onClose()
  }

  const resultDataUrl = resultB64 ? `data:image/png;base64,${resultB64}` : null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl flex flex-col gap-0 p-0 max-h-[90vh]">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> Boost con IA
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {/* Original photo — shown at 16:9 to match recipe card proportions */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Foto original" className="w-full aspect-video object-cover rounded-md border" />

        {/* ── IDLE ── */}
        {phase === "idle" && (
          <div className="space-y-5">
            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* Style cards */}
            <div>
              <Label className="mb-2 block">Estilo</Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(STYLES) as [StyleKey, (typeof STYLES)[StyleKey]][]).map(([key, s]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectStyle(key)}
                    className={`text-left p-3 rounded-lg border text-sm transition-colors ${
                      style === key
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <p className="font-semibold mb-0.5">{s.label}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3">
              <ControlGroup
                label="Cómo servir"
                options={CONTROL_OPTIONS.servir}
                value={controls.servir}
                onChange={(v) => setControl("servir", v as Controls["servir"])}
              />
              <ControlGroup
                label="Vajilla"
                options={CONTROL_OPTIONS.vajilla}
                value={controls.vajilla}
                onChange={(v) => setControl("vajilla", v as Controls["vajilla"])}
              />

              <ControlGroup
                label="Fondo"
                options={CONTROL_OPTIONS.fondo}
                value={controls.fondo}
                onChange={(v) => setControl("fondo", v as Controls["fondo"])}
              />

              <ControlGroup
                label="Corrección fotográfica"
                options={CONTROL_OPTIONS.correccion}
                value={controls.correccion}
                onChange={(v) => setControl("correccion", v as Controls["correccion"])}
              />
              <ControlGroup
                label="Encuadre"
                options={CONTROL_OPTIONS.encuadre}
                value={controls.encuadre}
                onChange={(v) => setControl("encuadre", v as Controls["encuadre"])}
              />
              <ControlGroup
                label="Props"
                options={CONTROL_OPTIONS.props}
                value={controls.props}
                onChange={(v) => setControl("props", v as Controls["props"])}
              />
            </div>

            {/* Nota libre */}
            <div>
              <Label className="mb-1.5 block">Nota adicional (opcional)</Label>
              <Textarea
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="ej: sacá el repasador del fondo, dejá el chorizo visible"
                className="resize-none h-20"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t">
              <p className="text-xs text-muted-foreground">~$0.06 por imagen</p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleVerPrompt}>
                  Ver prompt
                </Button>
                <Button type="button" onClick={() => generate(currentPrompt())}>
                  <Sparkles className="h-4 w-4 mr-1" /> Generar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── PROMPT PREVIEW ── */}
        {phase === "prompt-preview" && (
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Prompt final (editable)</Label>
              <Textarea
                value={editedPrompt ?? ""}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="resize-none h-48 text-sm font-mono"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setPhase("idle")}>
                Volver
              </Button>
              <Button type="button" onClick={() => generate(editedPrompt ?? "")}>
                <Sparkles className="h-4 w-4 mr-1" /> Generar con este prompt
              </Button>
            </div>
          </div>
        )}

        {/* ── GENERATING ── */}
        {phase === "generating" && (
          <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Generando… (puede tardar hasta 30s)</p>
          </div>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && resultDataUrl && (
          <div className="space-y-4">
            {/* New image at full recipe proportions */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Resultado</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultDataUrl} alt="Resultado" className="w-full aspect-video object-cover rounded-md border" />
            </div>

            {/* Original thumbnail + refine note */}
            <div className="grid grid-cols-3 gap-3 items-start">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Original</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Original" className="w-full aspect-video object-cover rounded-md border" />
              </div>
              <div className="col-span-2">
                <Label className="mb-1.5 block text-sm">Nota para regenerar (opcional)</Label>
                <Textarea
                  value={refineNote}
                  onChange={(e) => setRefineNote(e.target.value)}
                  placeholder="ej: más luz, sacá el tenedor, fondo más oscuro"
                  className="resize-none h-[4.5rem]"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-wrap gap-2 justify-end pt-2 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Descartar
              </Button>
              <Button type="button" variant="outline" onClick={handleAjustar}>
                Ajustar
              </Button>
              <Button type="button" variant="outline" onClick={handleRegenerar}>
                Regenerar
              </Button>
              <Button type="button" onClick={handleGuardar} disabled={saving}>
                {saving ? (
                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Guardando…</>
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </div>
        )}
        </div>{/* end scrollable body */}
      </DialogContent>
    </Dialog>
  )
}
