"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import type { Inventario } from "@estoque-brasil/types"
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
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { inventariosApi } from "../api/inventarios-api"

interface DeleteInventarioButtonProps {
  inventario: Inventario
  disabled?: boolean
}

const RESTRICTION_MESSAGE =
  "Líder de coleta não pode editar/excluir inventários que já possuem contagens."

export function DeleteInventarioButton({ inventario, disabled }: DeleteInventarioButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      await inventariosApi.delete(inventario.id)
      router.push("/admin/inventarios")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir inventario")
      setLoading(false)
    }
  }

  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <Button variant="destructive" disabled>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{RESTRICTION_MESSAGE}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir inventario</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o inventario{" "}
            <span className="font-semibold">#{inventario.id}</span>? Esta acao nao
            pode ser desfeita. Todos os setores, produtos e contagens associados
            serao excluidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-red-500">{error}</p>}
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
