"use client"

import { useState } from "react"
import { Lock, AlertTriangle } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { inventariosApi, type ApiError } from "../api/inventarios-api"

interface FinalizarInventarioButtonProps {
  inventarioId: number
  ativo: boolean
  onSuccess: () => void
}

interface SetorPendente {
  id: number
  prefixo?: string
  descricao?: string
  status?: string
}

export function FinalizarInventarioButton({
  inventarioId,
  ativo,
  onSuccess,
}: FinalizarInventarioButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setoresAbertos, setSetoresAbertos] = useState<SetorPendente[]>([])
  const [showSetoresDialog, setShowSetoresDialog] = useState(false)
  const [forceLoading, setForceLoading] = useState(false)

  if (!ativo) return null

  const handleFinalizar = async () => {
    setLoading(true)
    setError(null)

    try {
      await inventariosApi.finalizar(inventarioId)
      setConfirmOpen(false)
      onSuccess()
    } catch (err) {
      const apiError = err as ApiError & { setores?: SetorPendente[] }
      if (apiError.code === "SETORES_EM_ABERTO") {
        setSetoresAbertos(apiError.setores || [])
        setConfirmOpen(false)
        setShowSetoresDialog(true)
      } else {
        setError(apiError.message || "Erro ao finalizar inventario")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForceFinalizar = async () => {
    setForceLoading(true)
    setError(null)

    try {
      await inventariosApi.finalizar(inventarioId, { forcado: true })
      setShowSetoresDialog(false)
      onSuccess()
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || "Erro ao finalizar inventario")
    } finally {
      setForceLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="default"
        onClick={() => setConfirmOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <Lock className="mr-2 h-4 w-4" />
        Finalizar Inventario
      </Button>

      {/* Confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar inventario</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja finalizar o inventario{" "}
              <span className="font-semibold">#{inventarioId}</span>?
              Apos a finalizacao, nenhuma nova contagem podera ser registrada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalizar}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? "Finalizando..." : "Finalizar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Setores em aberto dialog */}
      <Dialog open={showSetoresDialog} onOpenChange={setShowSetoresDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Setores em aberto
            </DialogTitle>
            <DialogDescription>
              Os seguintes setores ainda nao foram finalizados. Voce pode finaliza-los individualmente ou forcar a finalizacao do inventario.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto">
            <ul className="space-y-2">
              {setoresAbertos.map((setor) => (
                <li
                  key={setor.id}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                    {setor.status === "em_contagem" ? "Em Contagem" : "Pendente"}
                  </span>
                  <span className="font-medium">
                    {setor.prefixo || setor.descricao || `Setor #${setor.id}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSetoresDialog(false)}
              disabled={forceLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleForceFinalizar}
              disabled={forceLoading}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {forceLoading ? "Finalizando..." : "Forcar Finalizacao"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
