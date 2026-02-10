"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Eye, Pencil, Trash2 } from "lucide-react"
import type { User } from "@estoque-brasil/types"
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/shared/components/ui/data-table-column-header"
import { DataTableRowActions } from "@/shared/components/ui/data-table-row-actions"
import { UserStatusBadge } from "./UserStatusBadge"
import { UserRoleBadges } from "./UserRoleBadges"

interface ColumnsProps {
  onDelete: (user: User) => void
  canEdit?: boolean
  canDelete?: boolean
}

// Format CPF for display
function formatCpf(cpf: string | null): string {
  if (!cpf) return "-"
  const d = cpf.replace(/\D/g, "")
  if (d.length !== 11) return cpf
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

// Format date for display
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function getColumns({
  onDelete,
  canEdit = true,
  canDelete = true,
}: ColumnsProps): ColumnDef<User>[] {
  return [
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nome" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex flex-col">
            <span className="max-w-[250px] truncate font-medium">
              {row.getValue("fullName")}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatCpf(row.original.cpf)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "roles",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Roles" />
      ),
      cell: ({ row }) => {
        const roles = row.original.roles
        return <UserRoleBadges roles={roles} />
      },
      enableSorting: false,
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return <UserStatusBadge isActive={isActive} />
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Criado em" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string
        return <span className="text-sm">{formatDate(date)}</span>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original
        const hasActions = canEdit || canDelete

        if (!hasActions) {
          return null
        }

        return (
          <div className="text-right">
            <DataTableRowActions>
              <DropdownMenuItem asChild>
                <Link href={`/admin/cadastros/usuarios/${user.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Link>
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem asChild>
                  <Link href={`/admin/cadastros/usuarios/${user.id}/edit`}>
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
                    onClick={() => onDelete(user)}
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
