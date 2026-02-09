"use client"

import { useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
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
import { inventariosApi, type ApiError } from "../api/inventarios-api"

interface ReabrirInventarioButtonProps {
  inventarioId: number
  ativo: boolean
  onSuccess: () => void
}

export function ReabrirInventarioButton({
  inventarioId,
  ativo,
  onSuccess,
}: ReabrirInventarioButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (ativo) return null

  const handleReabrir = async () => {
    setLoading(true)
    setError(null)

    try {
      await inventariosApi.reabrirInventario(inventarioId)
      setConfirmOpen(false)
      onSuccess()
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || "Erro ao reabrir inventario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setConfirmOpen(true)}
        className="text-amber-600 border-amber-300 hover:bg-amber-50 hover:text-amber-700"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Reabrir Inventario
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reabrir inventario</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja reabrir o inventario{" "}
              <span className="font-semibold">#{inventarioId}</span>?
              O inventario voltara a aceitar novas contagens.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReabrir}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {loading ? "Reabrindo..." : "Reabrir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
