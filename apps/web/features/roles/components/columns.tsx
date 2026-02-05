"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, Shield, Settings } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Badge } from "@/shared/components/ui/badge"
import type { Role } from "../types"

interface ColumnsProps {
  onDelete: (role: Role) => void
  canUpdate: boolean
  canDelete: boolean
}

export function getColumns({ onDelete, canUpdate, canDelete }: ColumnsProps): ColumnDef<Role>[] {
  return [
    {
      accessorKey: "displayName",
      header: "Nome",
      cell: ({ row }) => {
        const role = row.original
        return (
          <Link
            href={`/admin/cadastros/roles/${role.id}`}
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium hover:underline">{role.displayName}</span>
            {role.isSystemRole && (
              <Badge variant="secondary" className="text-xs">
                Sistema
              </Badge>
            )}
          </Link>
        )
      },
    },
    {
      accessorKey: "name",
      header: "Identificador",
      cell: ({ row }) => (
        <code className="px-2 py-1 bg-muted rounded text-sm">
          {row.original.name}
        </code>
      ),
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.description || "-"}
        </span>
      ),
    },
    {
      accessorKey: "permissions",
      header: "Permissões",
      cell: ({ row }) => {
        const role = row.original
        const count = role.permissions?.length || 0
        return (
          <Link href={`/admin/cadastros/roles/${role.id}`}>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              {count} {count === 1 ? "permissão" : "permissões"}
            </Badge>
          </Link>
        )
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const role = row.original
        const showActions = canUpdate || (canDelete && !role.isSystemRole)

        if (!showActions) return null

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canUpdate && (
                <DropdownMenuItem asChild>
                  <Link href={`/admin/cadastros/roles/${role.id}`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Gerenciar Permissões
                  </Link>
                </DropdownMenuItem>
              )}
              {canDelete && !role.isSystemRole && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(role)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
