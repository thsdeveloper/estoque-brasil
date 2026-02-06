"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { InventarioProduto } from "@estoque-brasil/types"
import { Badge } from "@/shared/components/ui/badge"
import { DataTableColumnHeader } from "@/shared/components/ui/data-table-column-header"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function getColumns(): ColumnDef<InventarioProduto>[] {
  return [
    {
      accessorKey: "codigoBarras",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cod. Barras" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("codigoBarras") as string | null
        return (
          <span className="font-mono text-sm">{value || "-"}</span>
        )
      },
    },
    {
      accessorKey: "codigoInterno",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cod. Interno" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("codigoInterno") as string | null
        return (
          <span className="font-mono text-sm">{value || "-"}</span>
        )
      },
    },
    {
      accessorKey: "descricao",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Descricao" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("descricao") as string
        return (
          <span className="max-w-[300px] truncate block">{value}</span>
        )
      },
    },
    {
      accessorKey: "saldo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Saldo" className="justify-end" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("saldo") as number
        return (
          <span className="text-right block tabular-nums">{value}</span>
        )
      },
    },
    {
      accessorKey: "custo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Custo" className="justify-end" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("custo") as number
        return (
          <span className="text-right block tabular-nums">{formatCurrency(value)}</span>
        )
      },
    },
    {
      accessorKey: "lote",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lote" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("lote") as string | null
        return <span>{value || "-"}</span>
      },
      enableHiding: true,
    },
    {
      accessorKey: "divergente",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const divergente = row.getValue("divergente") as boolean
        return divergente ? (
          <Badge variant="destructive">Divergente</Badge>
        ) : (
          <Badge variant="success">OK</Badge>
        )
      },
    },
  ]
}
