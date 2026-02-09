"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"
import type { Inventario } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import { usePermissions } from "@/features/usuarios/hooks/usePermissions"
import { DeleteInventarioButton } from "./DeleteInventarioButton"

interface InventarioActionsProps {
  inventario: Inventario
}

const RESTRICTION_MESSAGE =
  "Líder de coleta não pode editar/excluir inventários que já possuem contagens."

export function InventarioActions({ inventario }: InventarioActionsProps) {
  const { hasRole, canUpdate, canDelete } = usePermissions()
  const isLiderColeta = hasRole("lider_coleta")
  const canEditInventario = canUpdate("inventarios")
  const canDeleteInventario = canDelete("inventarios")
  const editDisabled = !canEditInventario || (isLiderColeta && !!inventario.temContagens)
  const deleteDisabled = !canDeleteInventario || (isLiderColeta && !!inventario.temContagens)

  return (
    <div className="flex items-center gap-2">
      {canEditInventario && (
        editDisabled ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button variant="outline" size="sm" disabled>
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{RESTRICTION_MESSAGE}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/inventarios/${inventario.id}/edit`}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Link>
          </Button>
        )
      )}
      {canDeleteInventario && (
        <DeleteInventarioButton inventario={inventario} disabled={deleteDisabled} />
      )}
    </div>
  )
}
