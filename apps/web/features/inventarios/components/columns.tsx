"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Eye, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react"
import type { Inventario } from "@estoque-brasil/types"
import { Badge } from "@/shared/components/ui/badge"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/shared/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/shared/components/ui/data-table-column-header"
import { DataTableRowActions } from "@/shared/components/ui/data-table-row-actions"

interface ColumnsProps {
  onDelete: (inventario: Inventario) => void
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-"
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(dateString))
}

export function getColumns({ onDelete }: ColumnsProps): ColumnDef<Inventario>[] {
  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="N Inv." />
      ),
      cell: ({ row }) => {
        return (
          <span className="font-medium">
            #{row.getValue("id")}
          </span>
        )
      },
    },
    {
      accessorKey: "idLoja",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID Loja" />
      ),
      cell: ({ row }) => {
        return <span>{row.getValue("idLoja")}</span>
      },
    },
    {
      accessorKey: "idEmpresa",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID Empresa" />
      ),
      cell: ({ row }) => {
        return <span>{row.getValue("idEmpresa")}</span>
      },
    },
    {
      accessorKey: "dataInicio",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Data Inicio" />
      ),
      cell: ({ row }) => {
        return <span>{formatDate(row.getValue("dataInicio"))}</span>
      },
    },
    {
      accessorKey: "dataTermino",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Data Termino" />
      ),
      cell: ({ row }) => {
        const dataTermino = row.getValue("dataTermino") as string | null
        return dataTermino ? (
          <span>{formatDate(dataTermino)}</span>
        ) : (
          <span className="text-gray-light">Em andamento</span>
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
          <Badge variant={ativo ? "success" : "secondary"}>
            {ativo ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                Ativo
              </>
            ) : (
              <>
                <XCircle className="mr-1 h-3 w-3" />
                Inativo
              </>
            )}
          </Badge>
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
          <Badge variant="outline">Sim</Badge>
        ) : (
          <span className="text-gray-light">-</span>
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
          <Badge variant="outline">Sim</Badge>
        ) : (
          <span className="text-gray-light">-</span>
        )
      },
      enableHiding: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const inventario = row.original
        return (
          <div className="text-right">
            <DataTableRowActions>
              <DropdownMenuItem asChild>
                <Link href={`/admin/inventarios/${inventario.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/inventarios/${inventario.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={() => onDelete(inventario)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
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
