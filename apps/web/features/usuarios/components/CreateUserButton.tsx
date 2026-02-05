"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { usePermissions } from "../hooks/usePermissions"

export function CreateUserButton() {
  const { canCreate, loading } = usePermissions()

  // Hide while loading to prevent flash
  if (loading) return null

  // Hide if user doesn't have permission
  if (!canCreate("usuarios")) return null

  return (
    <Button asChild>
      <Link href="/admin/cadastros/usuarios/create">
        <Plus className="mr-2 h-4 w-4" />
        Novo Usuário
      </Link>
    </Button>
  )
}
