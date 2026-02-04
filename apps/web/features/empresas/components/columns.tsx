"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Eye, Pencil, Trash2 } from "lucide-react"
import type { Empresa } from "@estoque-brasil/types"
import { Badge } from "@/shared/components/ui/badge"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/shared/components/ui/data-table-column-header"
import { DataTableRowActions } from "@/shared/components/ui/data-table-row-actions"

interface ColumnsProps {
  onDelete: (empresa: Empresa) => void
}

// Format CNPJ for display
function formatCNPJ(cnpj: string | null): string {
  if (!cnpj) return "-"
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  )
}

export function getColumns({ onDelete }: ColumnsProps): ColumnDef<Empresa>[] {
  return [
    {
      accessorKey: "razaoSocial",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Razão Social / Nome Fantasia" />
      ),
      cell: ({ row }) => {
        const razaoSocial = row.getValue("razaoSocial") as string | null
        const nomeFantasia = row.original.nomeFantasia
        const descricao = row.original.descricao

        return (
          <div className="flex flex-col">
            <span className="max-w-[300px] truncate font-medium">
              {razaoSocial || nomeFantasia || descricao || "-"}
            </span>
            {razaoSocial && nomeFantasia && (
              <span className="text-sm text-gray-light truncate max-w-[300px]">
                {nomeFantasia}
              </span>
            )}
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
          <span className="font-mono text-sm">
            {formatCNPJ(cnpj)}
          </span>
        )
      },
    },
    {
      accessorKey: "codigoUf",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="UF" />
      ),
      cell: ({ row }) => {
        const uf = row.getValue("codigoUf") as string | null
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
      accessorKey: "ativo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const ativo = row.getValue("ativo") as boolean
        return (
          <Badge variant={ativo ? "success" : "secondary"}>
            {ativo ? "Ativo" : "Inativo"}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const empresa = row.original
        return (
          <div className="text-right">
            <DataTableRowActions>
              <DropdownMenuItem asChild>
                <Link href={`/admin/empresas/${empresa.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/empresas/${empresa.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={() => onDelete(empresa)}
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
