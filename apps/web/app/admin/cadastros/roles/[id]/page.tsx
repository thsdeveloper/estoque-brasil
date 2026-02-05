"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Loader2, Shield } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { usePermissions } from "@/features/usuarios/hooks/usePermissions"
import { rolesApi, PermissionsMatrix, type Role } from "@/features/roles"

export default function RoleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { canUpdate } = usePermissions()

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/cadastros/roles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-2xl font-bold text-foreground">
                {role.displayName}
              </h1>
              {role.isSystemRole && (
                <Badge variant="secondary">Sistema</Badge>
              )}
            </div>
            <p className="text-gray-light">
              <code className="text-sm">{role.name}</code>
              {role.description && ` - ${role.description}`}
            </p>
          </div>
        </div>

        {canUpdate("usuarios") && (
          <Button asChild>
            <Link href={`/admin/cadastros/roles/${role.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar Perfil
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissões</CardTitle>
          <CardDescription>
            {canUpdate("usuarios")
              ? "Selecione as permissões que este perfil terá acesso"
              : "Visualize as permissões deste perfil"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionsMatrix
            role={role}
            onUpdate={setRole}
            readonly={!canUpdate("usuarios")}
          />
        </CardContent>
      </Card>
    </div>
  )
}
