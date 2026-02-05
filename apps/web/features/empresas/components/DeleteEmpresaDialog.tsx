"use client"

import { useState } from "react"
import type { Empresa } from "@estoque-brasil/types"
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
import { empresasApi } from "../api/empresas-api"

interface DeleteEmpresaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  empresa: Empresa | null
  onSuccess: () => void
}

export function DeleteEmpresaDialog({
  open,
  onOpenChange,
  empresa,
  onSuccess,
}: DeleteEmpresaDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!empresa) return

    setLoading(true)
    setError(null)

    try {
      await empresasApi.delete(empresa.id)
      onSuccess()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao excluir empresa"
      )
    } finally {
      setLoading(false)
    }
  }

  const empresaName =
    empresa?.razaoSocial || empresa?.nomeFantasia || empresa?.descricao || ""

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir empresa</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a empresa{" "}
            <span className="font-semibold">{empresaName}</span>? Esta ação não
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
