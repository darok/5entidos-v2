"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Pencil, Trash2, PlusCircle, Check, X, GripVertical } from "lucide-react"
import {
  DndContext, closestCenter, type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext, verticalListSortingStrategy, arrayMove, useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Tag, TagType, Ingredient, Unit } from "@/types"

// ── Inline edit row ───────────────────────────────────────────────

interface EditRowProps {
  value: string
  onSave: (name: string) => Promise<void>
  onCancel: () => void
}

function EditRow({ value, onSave, onCancel }: EditRowProps) {
  const [name, setName] = useState(value)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await onSave(name.trim())
    setSaving(false)
  }

  return (
    <div className="flex gap-2 items-center">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancel() }}
        className="h-8 text-sm"
        autoFocus
      />
      <Button size="icon" variant="ghost" onClick={handleSave} disabled={saving} className="h-8 w-8">
        <Check className="h-4 w-4 text-green-600" />
      </Button>
      <Button size="icon" variant="ghost" onClick={onCancel} className="h-8 w-8">
        <X className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  )
}

// ── Delete confirm dialog ─────────────────────────────────────────

interface DeleteDialogProps {
  open: boolean
  name: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

function DeleteDialog({ open, name, onConfirm, onCancel }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar &quot;{name}&quot;?</DialogTitle>
          <DialogDescription>Esta acción no se puede deshacer.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Generic catalog list (name-only items) ────────────────────────

interface CatalogItem { id: string; name: string }

interface CatalogListProps {
  items: CatalogItem[]
  onUpdate: (id: string, name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onCreate: (name: string) => Promise<void>
  addLabel?: string
}

function CatalogList({ items, onUpdate, onDelete, onCreate, addLabel = "Agregar" }: CatalogListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteItem, setDeleteItem] = useState<CatalogItem | null>(null)
  const [newName, setNewName] = useState("")
  const [adding, setAdding] = useState(false)

  async function handleCreate() {
    if (!newName.trim()) return
    setAdding(true)
    await onCreate(newName.trim())
    setNewName("")
    setAdding(false)
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y rounded-md border">
        {items.length === 0 && (
          <li className="px-4 py-3 text-sm text-muted-foreground">Sin elementos</li>
        )}
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 px-4 py-2">
            {editingId === item.id ? (
              <EditRow
                value={item.name}
                onSave={async (name) => { await onUpdate(item.id, name); setEditingId(null) }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <span className="flex-1 text-sm">{item.name}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(item.id)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteItem(item)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }}
          placeholder="Nuevo nombre…"
          className="h-8 text-sm"
        />
        <Button size="sm" variant="outline" onClick={handleCreate} disabled={adding || !newName.trim()}>
          <PlusCircle className="mr-1 h-3.5 w-3.5" />
          {addLabel}
        </Button>
      </div>

      {deleteItem && (
        <DeleteDialog
          open={!!deleteItem}
          name={deleteItem.name}
          onConfirm={async () => { await onDelete(deleteItem.id); setDeleteItem(null) }}
          onCancel={() => setDeleteItem(null)}
        />
      )}
    </div>
  )
}

// ── Tags tab ─────────────────────────────────────────────────────

function TagsTab() {
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>([])
  const [tagTypes, setTagTypes] = useState<TagType[]>([])

  useEffect(() => { loadData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    const [t, tt] = await Promise.all([fetch("/api/tags").then((r) => r.json()), fetch("/api/tag-types").then((r) => r.json())])
    setTags(t)
    setTagTypes(tt)
    router.refresh()
  }

  async function handleTagCreate(name: string) {
    await fetch("/api/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) })
    await loadData()
  }

  async function handleTagUpdate(id: string, name: string) {
    await fetch(`/api/tags/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) })
    await loadData()
  }

  async function handleTagDelete(id: string) {
    await fetch(`/api/tags/${id}`, { method: "DELETE" })
    await loadData()
  }

  async function handleTypeCreate(name: string) {
    await fetch("/api/tag-types", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) })
    await loadData()
  }

  async function handleTypeUpdate(id: string, name: string) {
    await fetch(`/api/tag-types/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) })
    await loadData()
  }

  async function handleTypeDelete(id: string) {
    await fetch(`/api/tag-types/${id}`, { method: "DELETE" })
    await loadData()
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="font-semibold">Tags</h3>
        <CatalogList
          items={tags}
          onCreate={handleTagCreate}
          onUpdate={handleTagUpdate}
          onDelete={handleTagDelete}
          addLabel="Agregar tag"
        />
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold">Tipos de tag</h3>
        <CatalogList
          items={tagTypes}
          onCreate={handleTypeCreate}
          onUpdate={handleTypeUpdate}
          onDelete={handleTypeDelete}
          addLabel="Agregar tipo"
        />
      </div>
    </div>
  )
}

// ── Units tab — sortable rows ─────────────────────────────────────

interface SortableUnitRowProps {
  unit: Unit
  editingId: string | null
  onEdit: (id: string) => void
  onSave: (id: string, name: string, abbreviation: string) => Promise<void>
  onCancelEdit: () => void
  onDelete: (unit: Unit) => void
}

function SortableUnitRow({ unit, editingId, onEdit, onSave, onCancelEdit, onDelete }: SortableUnitRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: unit.id })
  const [editName, setEditName] = useState(unit.name)
  const [editAbbr, setEditAbbr] = useState(unit.abbreviation)
  const [saving, setSaving] = useState(false)
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  useEffect(() => {
    if (editingId === unit.id) { setEditName(unit.name); setEditAbbr(unit.abbreviation) }
  }, [editingId, unit.id, unit.name, unit.abbreviation])

  async function handleSave() {
    if (!editName.trim()) return
    setSaving(true)
    await onSave(unit.id, editName.trim(), editAbbr.trim() || editName.trim())
    setSaving(false)
  }

  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-2 px-4 py-2">
      <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground touch-none" aria-label="Arrastrar para reordenar" type="button">
        <GripVertical className="h-4 w-4" />
      </button>
      {editingId === unit.id ? (
        <div className="flex gap-2 items-center flex-1">
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancelEdit() }} className="h-8 text-sm flex-1" autoFocus />
          <Input value={editAbbr} onChange={(e) => setEditAbbr(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancelEdit() }} className="h-8 text-sm w-20" placeholder="Abrev." />
          <Button size="icon" variant="ghost" onClick={handleSave} disabled={saving} className="h-8 w-8"><Check className="h-4 w-4 text-green-600" /></Button>
          <Button size="icon" variant="ghost" onClick={onCancelEdit} className="h-8 w-8"><X className="h-4 w-4 text-muted-foreground" /></Button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm">{unit.name} <span className="text-muted-foreground">({unit.abbreviation})</span></span>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(unit.id)}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(unit)}><Trash2 className="h-3.5 w-3.5" /></Button>
        </>
      )}
    </li>
  )
}

function UnitsTab() {
  const router = useRouter()
  const [units, setUnits] = useState<Unit[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteItem, setDeleteItem] = useState<Unit | null>(null)
  const [newName, setNewName] = useState("")
  const [newAbbr, setNewAbbr] = useState("")
  const [adding, setAdding] = useState(false)

  useEffect(() => { loadData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    const data = await fetch("/api/units").then((r) => r.json())
    setUnits(data)
    router.refresh()
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setAdding(true)
    await fetch("/api/units", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim(), abbreviation: newAbbr.trim() || newName.trim() }) })
    setNewName("")
    setNewAbbr("")
    setAdding(false)
    await loadData()
  }

  async function handleUpdate(id: string, name: string, abbreviation: string) {
    await fetch(`/api/units/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, abbreviation }) })
    setEditingId(null)
    await loadData()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/units/${id}`, { method: "DELETE" })
    setDeleteItem(null)
    await loadData()
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = units.findIndex((u) => u.id === active.id)
    const newIndex = units.findIndex((u) => u.id === over.id)
    const reordered = arrayMove(units, oldIndex, newIndex)
    setUnits(reordered)
    await fetch("/api/units/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: reordered.map((u, i) => ({ id: u.id, sort_order: i })) }),
    })
  }

  return (
    <div className="space-y-3">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={units.map((u) => u.id)} strategy={verticalListSortingStrategy}>
          <ul className="divide-y rounded-md border">
            {units.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted-foreground">Sin elementos</li>
            )}
            {units.map((u) => (
              <SortableUnitRow
                key={u.id}
                unit={u}
                editingId={editingId}
                onEdit={setEditingId}
                onSave={handleUpdate}
                onCancelEdit={() => setEditingId(null)}
                onDelete={setDeleteItem}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }}
          placeholder="Nueva unidad…"
          className="h-8 text-sm flex-1"
        />
        <Input
          value={newAbbr}
          onChange={(e) => setNewAbbr(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }}
          placeholder="Abrev."
          className="h-8 text-sm w-20"
        />
        <Button size="sm" variant="outline" onClick={handleCreate} disabled={adding || !newName.trim()}>
          <PlusCircle className="mr-1 h-3.5 w-3.5" />
          Agregar
        </Button>
      </div>

      {deleteItem && (
        <DeleteDialog
          open={!!deleteItem}
          name={deleteItem.name}
          onConfirm={async () => handleDelete(deleteItem.id)}
          onCancel={() => setDeleteItem(null)}
        />
      )}
    </div>
  )
}

// ── Ingredients tab ───────────────────────────────────────────────

function IngredientsTab() {
  const router = useRouter()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [ingSearch, setIngSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteItem, setDeleteItem] = useState<Ingredient | null>(null)
  const [deleteBlocked, setDeleteBlocked] = useState<{ name: string; recipes: { id: string; title: string }[] } | null>(null)
  const [pendingMerge, setPendingMerge] = useState<{ sourceId: string; targetId: string; targetName: string } | null>(null)
  const [newName, setNewName] = useState("")
  const [adding, setAdding] = useState(false)

  useEffect(() => { loadData() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    const data = await fetch("/api/ingredients").then((r) => r.json())
    setIngredients(data)
    router.refresh()
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setAdding(true)
    await fetch("/api/ingredients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim() }) })
    setNewName("")
    setAdding(false)
    await loadData()
  }

  async function handleUpdate(id: string, name: string) {
    const duplicate = ingredients.find((i) => i.id !== id && i.name.toLowerCase() === name.toLowerCase())
    if (duplicate) {
      setEditingId(null)
      setPendingMerge({ sourceId: id, targetId: duplicate.id, targetName: duplicate.name })
      return
    }
    await fetch(`/api/ingredients/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) })
    setEditingId(null)
    await loadData()
  }

  async function handleDelete(id: string) {
    const name = deleteItem?.name ?? ""
    const res = await fetch(`/api/ingredients/${id}`, { method: "DELETE" })
    if (res.status === 409) {
      const data = await res.json()
      setDeleteItem(null)
      setDeleteBlocked({ name, recipes: data.recipes ?? [] })
      return
    }
    setDeleteItem(null)
    await loadData()
  }

  async function handleMerge() {
    if (!pendingMerge) return
    await fetch(`/api/ingredients/${pendingMerge.sourceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_id: pendingMerge.targetId }),
    })
    setPendingMerge(null)
    await loadData()
  }

  const filtered = ingredients.filter((i) => i.name.toLowerCase().includes(ingSearch.toLowerCase()))

  return (
    <div className="space-y-3">
      <Input
        placeholder="Buscar ingrediente…"
        value={ingSearch}
        onChange={(e) => setIngSearch(e.target.value)}
        className="max-w-xs"
      />

      <ul className="divide-y rounded-md border">
        {filtered.length === 0 && (
          <li className="px-4 py-3 text-sm text-muted-foreground">Sin elementos</li>
        )}
        {filtered.map((item) => (
          <li key={item.id} className="flex items-center gap-2 px-4 py-2">
            {editingId === item.id ? (
              <EditRow
                value={item.name}
                onSave={async (name) => { await handleUpdate(item.id, name) }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <>
                <span className="flex-1 text-sm">{item.name}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(item.id)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteItem(item)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }}
          placeholder="Nuevo nombre…"
          className="h-8 text-sm"
        />
        <Button size="sm" variant="outline" onClick={handleCreate} disabled={adding || !newName.trim()}>
          <PlusCircle className="mr-1 h-3.5 w-3.5" />
          Agregar ingrediente
        </Button>
      </div>

      {deleteItem && (
        <DeleteDialog
          open={!!deleteItem}
          name={deleteItem.name}
          onConfirm={async () => handleDelete(deleteItem.id)}
          onCancel={() => setDeleteItem(null)}
        />
      )}

      {/* Delete blocked dialog */}
      <Dialog open={!!deleteBlocked} onOpenChange={(v) => { if (!v) setDeleteBlocked(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No se puede eliminar &quot;{deleteBlocked?.name}&quot;</DialogTitle>
            <DialogDescription>
              Este ingrediente está siendo usado por las siguientes recetas:
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {deleteBlocked?.recipes.slice(0, 3).map((r) => <li key={r.id}>{r.title}</li>)}
            {(deleteBlocked?.recipes.length ?? 0) > 3 && (
              <li>…y {deleteBlocked!.recipes.length - 3} más</li>
            )}
          </ul>
          <DialogFooter>
            <Button onClick={() => setDeleteBlocked(null)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!pendingMerge} onOpenChange={(v) => { if (!v) setPendingMerge(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ingrediente duplicado</DialogTitle>
            <DialogDescription>
              Ya existe un ingrediente llamado &quot;{pendingMerge?.targetName}&quot;. ¿Fusionar? Todas las recetas que usaban el ingrediente anterior pasarán a usar &quot;{pendingMerge?.targetName}&quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingMerge(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleMerge}>Fusionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Otros tab ─────────────────────────────────────────────────────

interface CleanupResult {
  total: number
  referenced: number
  orphaned: string[]
  sql: string | null
}

function OtrosTab() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CleanupResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCheck() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch("/api/admin/cleanup-images")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error desconocido")
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!result?.sql) return
    await navigator.clipboard.writeText(result.sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-semibold">Limpieza de imágenes</h3>
        <p className="text-sm text-muted-foreground">
          Busca archivos en el bucket <code className="bg-muted px-1 rounded text-xs">recipe-images</code> que no están referenciados por ninguna receta.
          El SQL generado se pega en el <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline">Editor SQL de Supabase</a>.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCheck}
          disabled={loading}
        >
          {loading ? "Buscando…" : "Buscar imágenes huérfanas"}
        </Button>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="space-y-3">
            <p className="text-sm">
              <span className="font-medium">{result.total}</span> archivos en bucket ·{" "}
              <span className="font-medium">{result.referenced}</span> referenciados ·{" "}
              <span className="font-medium">{result.orphaned.length}</span> huérfanos
            </p>

            {result.orphaned.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay archivos huérfanos.</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">SQL para pegar en Supabase</p>
                  <Button type="button" variant="ghost" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-3.5 w-3.5 mr-1 text-green-600" /> : null}
                    {copied ? "Copiado" : "Copiar"}
                  </Button>
                </div>
                <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all select-all">
                  {result.sql}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>
      <Tabs defaultValue="tags">
        <TabsList>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="units">Unidades</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredientes</TabsTrigger>
          <TabsTrigger value="otros">Otros</TabsTrigger>
        </TabsList>
        <TabsContent value="tags" className="pt-4"><TagsTab /></TabsContent>
        <TabsContent value="units" className="pt-4"><UnitsTab /></TabsContent>
        <TabsContent value="ingredients" className="pt-4"><IngredientsTab /></TabsContent>
        <TabsContent value="otros" className="pt-4"><OtrosTab /></TabsContent>
      </Tabs>
    </div>
  )
}
