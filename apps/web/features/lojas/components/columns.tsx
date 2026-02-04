"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Eye, Pencil, Trash2 } from "lucide-react"
import type { Loja } from "@estoque-brasil/types"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/shared/components/ui/data-table-column-header"
import { DataTableRowActions } from "@/shared/components/ui/data-table-row-actions"

interface ColumnsProps {
  clientId: string
  onDelete: (loja: Loja) => void
}

// Format CNPJ for display
function formatCNPJ(cnpj: string | null): string {
  if (!cnpj) return "-"
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  )
}

export function getColumns({ clientId, onDelete }: ColumnsProps): ColumnDef<Loja>[] {
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
      accessorKey: "cnpj",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CNPJ" />
      ),
      cell: ({ row }) => {
        const cnpj = row.getValue("cnpj") as string | null
        return (
          <span className="font-mono text-sm">{formatCNPJ(cnpj)}</span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const loja = row.original
        return (
          <div className="text-right">
            <DataTableRowActions>
              <DropdownMenuItem asChild>
                <Link href={`/admin/clients/${clientId}/lojas/${loja.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/clients/${clientId}/lojas/${loja.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={() => onDelete(loja)}
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
