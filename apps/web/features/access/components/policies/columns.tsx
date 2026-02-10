"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Badge } from "@/shared/components/ui/badge"
import type { AccessPolicy } from "../../types"

interface ColumnsProps {
  onDelete: (policy: AccessPolicy) => void
}

export function getColumns({ onDelete }: ColumnsProps): ColumnDef<AccessPolicy>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <code className="px-2 py-1 bg-muted rounded text-sm">
          {row.original.name}
        </code>
      ),
    },
    {
      accessorKey: "displayName",
      header: "Nome de Exibição",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.displayName}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => (
        <span className="text-muted-foreground max-w-[300px] truncate block">
          {row.original.description || "-"}
        </span>
      ),
    },
    {
      id: "permissions",
      header: "Permissões",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.permissions?.length ?? 0}
        </Badge>
      ),
    },
    {
      accessorKey: "isSystemPolicy",
      header: "Tipo",
      cell: ({ row }) =>
        row.original.isSystemPolicy ? (
          <Badge variant="secondary">Sistema</Badge>
        ) : (
          <Badge variant="outline">Custom</Badge>
        ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const policy = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/acesso/politicas/${policy.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/acesso/politicas/${policy.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(policy)}
                disabled={policy.isSystemPolicy}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
