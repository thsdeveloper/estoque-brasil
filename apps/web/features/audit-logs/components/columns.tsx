"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { AuditLog } from "../api/audit-logs-api"
import { Badge } from "@/shared/components/ui/badge"
import { DataTableColumnHeader } from "@/shared/components/ui/data-table-column-header"

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function getColumns(): ColumnDef<AuditLog>[] {
  return [
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Data/Hora" />
      ),
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap tabular-nums">
          {formatDateTime(row.getValue("createdAt"))}
        </span>
      ),
    },
    {
      accessorKey: "nomeUsuario",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Usuario" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {row.getValue("nomeUsuario") || row.original.idUsuario.slice(0, 8)}
        </span>
      ),
    },
    {
      accessorKey: "acao",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Acao" />
      ),
      cell: ({ row }) => (
        <Badge>{row.getValue("acao")}</Badge>
      ),
    },
    {
      accessorKey: "descricao",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Descricao" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground max-w-xs truncate block">
          {row.getValue("descricao") || "-"}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "idInventario",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Inventario" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("idInventario") ?? "-"}
        </span>
      ),
    },
    {
      accessorKey: "idSetor",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Setor" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue("idSetor") ?? "-"}
        </span>
      ),
    },
  ]
}
