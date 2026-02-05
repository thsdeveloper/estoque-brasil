"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { rolesApi, RoleForm, type Role } from "@/features/roles"

export default function EditRolePage() {
  const params = useParams()
  const router = useRouter()
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRole() {
      try {
        const data = await rolesApi.get(params.id as string)
        setRole(data)
      } catch (err) {
        setError("Erro ao carregar perfil")
      } finally {
        setLoading(false)
      }
    }
    fetchRole()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !role) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || "Perfil não encontrado"}</p>
        <Button variant="link" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/cadastros/roles/${role.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Perfil</h1>
          <p className="text-gray-light">
            Atualize os dados do perfil {role.displayName}
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <RoleForm role={role} mode="edit" />
      </div>
    </div>
  )
}
