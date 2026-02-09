"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Eye, Pencil, Trash2, ExternalLink } from "lucide-react"
import type { Client } from "@estoque-brasil/types"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/shared/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/shared/components/ui/data-table-column-header"
import { DataTableRowActions } from "@/shared/components/ui/data-table-row-actions"

interface ColumnsProps {
  onDelete: (client: Client) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function getColumns({ onDelete, canEdit = true, canDelete = true }: ColumnsProps): ColumnDef<Client>[] {
  return [
    {
      accessorKey: "nome",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nome" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <span className="max-w-[300px] truncate font-medium">
              {row.getValue("nome")}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "uf",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="UF" />
      ),
      cell: ({ row }) => {
        const uf = row.getValue("uf") as string | null
        return uf ? (
          <Badge variant="secondary">{uf}</Badge>
        ) : (
          <span className="text-gray-light">-</span>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "municipio",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Municipio" />
      ),
      cell: ({ row }) => {
        const municipio = row.getValue("municipio") as string | null
        return municipio || <span className="text-gray-light">-</span>
      },
    },
    {
      accessorKey: "percentualDivergencia",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="% Divergencia" className="justify-end" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("percentualDivergencia") as number | null
        if (value === null || value === undefined) {
          return <div className="text-right">-</div>
        }
        const formatted = `${value.toFixed(2)}%`
        const variant = value > 5 ? "destructive" : value > 2 ? "warning" : "success"
        return (
          <div className="text-right">
            <Badge variant={variant}>{formatted}</Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "linkBi",
      header: () => <div className="text-right">Link BI</div>,
      cell: ({ row }) => {
        const linkBi = row.getValue("linkBi") as string | null
        return (
          <div className="text-right">
            {linkBi ? (
              <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                <a href={linkBi} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Abrir BI</span>
                </a>
              </Button>
            ) : (
              <span className="text-gray-light">-</span>
            )}
          </div>
        )
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="text-right">
            <DataTableRowActions>
              <DropdownMenuItem asChild>
                <Link href={`/admin/clients/${client.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Link>
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem asChild>
                  <Link href={`/admin/clients/${client.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Link>
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500"
                    onClick={() => onDelete(client)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </>
              )}
            </DataTableRowActions>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
