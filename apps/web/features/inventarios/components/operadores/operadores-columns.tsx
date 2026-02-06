"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { InventarioOperador } from "@estoque-brasil/types"
import { Trash2 } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { DataTableColumnHeader } from "@/shared/components/ui/data-table-column-header"

interface ColumnsOptions {
  onRemove: (op: InventarioOperador) => void
}

export function getColumns({ onRemove }: ColumnsOptions): ColumnDef<InventarioOperador>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nome" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("fullName") as string | null
        return <span className="font-medium">{value || "-"}</span>
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("email") as string | null
        return <span className="text-muted-foreground">{value || "-"}</span>
      },
    },
    {
      accessorKey: "multiplo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Multiplo" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("multiplo") as boolean
        return value ? (
          <Badge variant="default">Sim</Badge>
        ) : (
          <Badge variant="secondary">Nao</Badge>
        )
      },
    },
    {
      accessorKey: "auditoria",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Auditoria" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("auditoria") as boolean
        return value ? (
          <Badge variant="default">Sim</Badge>
        ) : (
          <Badge variant="secondary">Nao</Badge>
        )
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Acoes</span>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(row.original)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
