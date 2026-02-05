"use client"

import { useState } from "react"
import type { Inventario } from "@estoque-brasil/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { inventariosApi } from "../api/inventarios-api"

interface DeleteInventarioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventario: Inventario | null
  onSuccess: () => void
}

export function DeleteInventarioDialog({
  open,
  onOpenChange,
  inventario,
  onSuccess,
}: DeleteInventarioDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!inventario) return

    setLoading(true)
    setError(null)

    try {
      await inventariosApi.delete(inventario.id)
      onSuccess()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao excluir inventario"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir inventario</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o inventario{" "}
            <span className="font-semibold">#{inventario?.id}</span>? Esta acao nao
            pode ser desfeita. Todos os setores, produtos e contagens associados
            serao excluidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600"
          >
            {loading ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
