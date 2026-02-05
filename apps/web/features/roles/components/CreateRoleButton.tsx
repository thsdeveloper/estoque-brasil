"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { usePermissions } from "@/features/usuarios/hooks/usePermissions"

export function CreateRoleButton() {
  const { canCreate, loading } = usePermissions()

  if (loading) return null
  if (!canCreate("usuarios")) return null

  return (
    <Button asChild>
      <Link href="/admin/cadastros/roles/create">
        <Plus className="mr-2 h-4 w-4" />
        Novo Perfil
      </Link>
    </Button>
  )
}
