"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Eye, Pencil, Trash2, Circle, Calendar, Building2, Store } from "lucide-react"
import type { Inventario } from "@estoque-brasil/types"
import { Badge } from "@/shared/components/ui/badge"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/shared/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/shared/components/ui/data-table-column-header"
import { DataTableRowActions } from "@/shared/components/ui/data-table-row-actions"
import { cn } from "@/shared/lib/utils"

interface ColumnsProps {
  onDelete: (inventario: Inventario) => void
}

function formatDate(dateString: string | null) {
  if (!dateString) return null
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString))
}

export function getColumns({ onDelete }: ColumnsProps): ColumnDef<Inventario>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Codigo" />
      ),
      cell: ({ row }) => {
        const id = row.getValue("id") as number
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-neutral border border-border text-sm font-semibold text-brand-gray tabular-nums">
            #{id}
          </span>
        )
      },
    },
    {
      accessorKey: "idLoja",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Loja" />
      ),
      cell: ({ row }) => {
        const idLoja = row.getValue("idLoja") as number
        return (
          <div className="flex items-center gap-2 text-sm">
            <Store className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium tabular-nums">{idLoja}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "idEmpresa",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Empresa" />
      ),
      cell: ({ row }) => {
        const idEmpresa = row.getValue("idEmpresa") as number
        return (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium tabular-nums">{idEmpresa}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "dataInicio",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Periodo" />
      ),
      cell: ({ row }) => {
        const dataInicio = formatDate(row.getValue("dataInicio"))
        const dataTermino = formatDate(row.original.dataTermino)

        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{dataInicio}</span>
            </div>
            {dataTermino ? (
              <span className="text-xs text-muted-foreground pl-5">
                ate {dataTermino}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground pl-5 italic">
                Em andamento
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "ativo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const ativo = row.getValue("ativo") as boolean
        return (
          <div className="flex items-center gap-2">
            <Circle
              className={cn(
                "h-2 w-2 fill-current",
                ativo ? "text-emerald-500" : "text-muted-foreground/50"
              )}
            />
            <span className={cn(
              "text-sm font-medium",
              ativo ? "text-emerald-700" : "text-muted-foreground"
            )}>
              {ativo ? "Ativo" : "Finalizado"}
            </span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(String(row.getValue(id)))
      },
    },
    {
      accessorKey: "lote",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lote" />
      ),
      cell: ({ row }) => {
        const lote = row.getValue("lote") as boolean
        return lote ? (
          <Badge variant="outline" className="font-normal">
            Sim
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
      enableHiding: true,
    },
    {
      accessorKey: "validade",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Validade" />
      ),
      cell: ({ row }) => {
        const validade = row.getValue("validade") as boolean
        return validade ? (
          <Badge variant="outline" className="font-normal">
            Sim
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
      enableHiding: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const inventario = row.original
        return (
          <div className="flex justify-end">
            <DataTableRowActions>
              <DropdownMenuItem asChild>
                <Link
                  href={`/admin/inventarios/${inventario.id}`}
                  className="flex items-center"
                >
                  <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Visualizar</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/admin/inventarios/${inventario.id}/edit`}
                  className="flex items-center"
                >
                  <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Editar</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => onDelete(inventario)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DataTableRowActions>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
