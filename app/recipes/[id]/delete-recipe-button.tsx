"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteRecipeButtonProps {
  id: string
}

// Renders a delete button with a confirmation dialog
export function DeleteRecipeButton({ id }: DeleteRecipeButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" })
    if (res.ok) {
      router.push("/")
      router.refresh()
    } else {
      alert("Error al eliminar la receta.")
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => setOpen(true)} aria-label="Eliminar">
        <Trash2 className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar receta?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
