"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Eye, Pencil, Trash2, Store } from "lucide-react"
import type { Client } from "@estoque-brasil/types"
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
      accessorKey: "cnpj",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CNPJ" />
      ),
      cell: ({ row }) => {
        const cnpj = row.getValue("cnpj") as string | null
        if (!cnpj) return <span className="text-gray-light">-</span>
        const formatted = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
        return <span className="font-mono text-sm">{formatted}</span>
      },
    },
    {
      accessorKey: "nome",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Razão Social" />
      ),
      cell: ({ row }) => {
        return (
          <span className="max-w-[300px] truncate font-medium">
            {row.getValue("nome")}
          </span>
        )
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => {
        const email = row.getValue("email") as string | null
        return email ? (
          <span className="max-w-[250px] truncate">{email}</span>
        ) : (
          <span className="text-gray-light">-</span>
        )
      },
    },
    {
      id: "lojas",
      header: () => <span className="text-sm">Lojas</span>,
      cell: ({ row }) => {
        const client = row.original
        return (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/clients/${client.id}/lojas`}>
              <Store className="mr-1.5 h-3.5 w-3.5" />
              Lojas
            </Link>
          </Button>
        )
      },
      enableSorting: false,
      enableHiding: false,
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
