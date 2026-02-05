"use client"

import { useState } from "react"
import type { Loja } from "@estoque-brasil/types"
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
import { lojasApi } from "../api/lojas-api"

interface DeleteLojaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loja: Loja | null
  onSuccess: () => void
}

export function DeleteLojaDialog({
  open,
  onOpenChange,
  loja,
  onSuccess,
}: DeleteLojaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!loja) return

    setLoading(true)
    setError(null)

    try {
      await lojasApi.delete(loja.id)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir loja")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir loja</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a loja{" "}
            <span className="font-semibold">{loja?.nome}</span>? Esta ação não
            pode ser desfeita.
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
