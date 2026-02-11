"use client"

import { useState } from "react"
import { ShieldX, AlertTriangle, Loader2, ShieldCheck } from "lucide-react"
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
import { Textarea } from "@/shared/components/ui/textarea"
import { usePermissions } from "@/features/usuarios/hooks/usePermissions"
import { inventariosApi, type ApiError } from "../api/inventarios-api"

interface Bloqueios {
  setoresNaoAbertos: string[]
  setoresNaoFechados: string[]
  divergenciasPendentes: number
}

interface FecharInventarioButtonProps {
  inventarioId: number
  ativo: boolean
  onSuccess: () => void
}

export function FecharInventarioButton({
  inventarioId,
  ativo,
  onSuccess,
}: FecharInventarioButtonProps) {
  const { hasRole } = usePermissions()
  const isAdmin = hasRole("admin")

  const [checking, setChecking] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [impedimentosOpen, setImpedimentosOpen] = useState(false)
  const [bloqueios, setBloqueios] = useState<Bloqueios | null>(null)
  const [justificativa, setJustificativa] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!ativo) return null

  const handleClick = async () => {
    setChecking(true)
    setError(null)

    try {
      const status = await inventariosApi.getStatusFechamento(inventarioId)

      if (status.podeFechar) {
        setConfirmOpen(true)
      } else {
        setBloqueios(status.bloqueios)
        setJustificativa("")
        setImpedimentosOpen(true)
      }
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || "Erro ao verificar status")
    } finally {
      setChecking(false)
    }
  }

  const handleFechar = async () => {
    setLoading(true)
    setError(null)

    try {
      await inventariosApi.fecharInventario(inventarioId)
      setConfirmOpen(false)
      onSuccess()
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || "Erro ao fechar inventario")
    } finally {
      setLoading(false)
    }
  }

  const handleFecharComJustificativa = async () => {
    setLoading(true)
    setError(null)

    try {
      await inventariosApi.fecharInventario(inventarioId, { justificativa })
      setImpedimentosOpen(false)
      onSuccess()
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || "Erro ao fechar inventario")
    } finally {
      setLoading(false)
    }
  }

  const temBloqueios = bloqueios && (
    bloqueios.setoresNaoAbertos.length > 0 ||
    bloqueios.setoresNaoFechados.length > 0 ||
    bloqueios.divergenciasPendentes > 0
  )

  return (
    <>
      <Button
        variant="destructive"
        onClick={handleClick}
        disabled={checking}
      >
        {checking ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ShieldX className="mr-2 h-4 w-4" />
        )}
        {checking ? "Verificando..." : "Fechar Inventario"}
      </Button>

      {error && !confirmOpen && !impedimentosOpen && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}

      {/* Simple confirmation dialog (all conditions met) */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Fechar inventario
            </AlertDialogTitle>
            <AlertDialogDescription>
              Todas as condicoes foram atendidas. Tem certeza que deseja fechar
              definitivamente o inventario{" "}
              <span className="font-semibold">#{inventarioId}</span>?
              <br />
              <span className="text-muted-foreground mt-1 block">
                Esta acao nao pode ser desfeita facilmente.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFechar}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Fechando..." : "Confirmar Fechamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Impediments dialog */}
      <Dialog open={impedimentosOpen} onOpenChange={(open) => {
        if (!loading) {
          setImpedimentosOpen(open)
          if (!open) setError(null)
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Impedimentos para fechamento
            </DialogTitle>
            <DialogDescription>
              O inventario <span className="font-semibold">#{inventarioId}</span> possui
              pendencias que impedem o fechamento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {/* Setores nao abertos */}
            {bloqueios && bloqueios.setoresNaoAbertos.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                <p className="text-sm font-medium text-amber-800 mb-1.5">
                  Setores nunca abertos ({bloqueios.setoresNaoAbertos.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bloqueios.setoresNaoAbertos.map((setor, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                    >
                      {setor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Setores nao fechados */}
            {bloqueios && bloqueios.setoresNaoFechados.length > 0 && (
              <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-3">
                <p className="text-sm font-medium text-orange-800 mb-1.5">
                  Setores nao finalizados ({bloqueios.setoresNaoFechados.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {bloqueios.setoresNaoFechados.map((setor, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 ring-1 ring-inset ring-orange-600/20"
                    >
                      {setor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Divergencias pendentes */}
            {bloqueios && bloqueios.divergenciasPendentes > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
                <p className="text-sm font-medium text-red-800">
                  {bloqueios.divergenciasPendentes} divergencia(s) pendente(s) de reconferencia
                </p>
              </div>
            )}
          </div>

          {/* Admin bypass section */}
          {isAdmin && temBloqueios && (
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Como administrador, voce pode fechar este inventario mediante justificativa.
              </p>
              <div className="space-y-1.5">
                <label htmlFor="justificativa" className="text-sm font-medium text-foreground">
                  Justificativa do fechamento
                </label>
                <Textarea
                  id="justificativa"
                  placeholder="Informe o motivo para fechar com pendencias (minimo 10 caracteres)..."
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  rows={3}
                  disabled={loading}
                />
                {justificativa.length > 0 && justificativa.length < 10 && (
                  <p className="text-xs text-red-500">
                    Minimo 10 caracteres ({justificativa.length}/10)
                  </p>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImpedimentosOpen(false)}
              disabled={loading}
            >
              {isAdmin ? "Cancelar" : "Entendi"}
            </Button>
            {isAdmin && temBloqueios && (
              <Button
                onClick={handleFecharComJustificativa}
                disabled={loading || justificativa.length < 10}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fechando...
                  </>
                ) : (
                  "Fechar com Justificativa"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
