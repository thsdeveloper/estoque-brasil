import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Mail, Phone, Calendar, Clock } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"
import { UserStatusBadge, UserRoleBadges } from "@/features/usuarios"
import { getUser } from "@/features/usuarios/api/usuarios-api.server"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewUserPage({ params }: PageProps) {
  const { id } = await params

  let user
  try {
    user = await getUser(id)
  } catch {
    notFound()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(dateString))
  }

  const formatPhone = (phone: string | null) => {
    if (!phone) return "-"
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
    if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    return phone
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/cadastros/usuarios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {user.fullName}
              </h1>
              <UserStatusBadge isActive={user.isActive} />
            </div>
            <p className="text-gray-light">Detalhes do usuário</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/cadastros/usuarios/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informações de Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
            <CardDescription>Dados de contato do usuário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-gray-light">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-gray-light">Telefone</p>
                <p className="font-medium">{formatPhone(user.phone)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissões */}
        <Card>
          <CardHeader>
            <CardTitle>Permissões</CardTitle>
            <CardDescription>Roles atribuídas ao usuário</CardDescription>
          </CardHeader>
          <CardContent>
            <UserRoleBadges roles={user.roles} />
            {user.roles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Este usuário tem acesso às funcionalidades definidas pelas
                  roles acima.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
            <CardDescription>
              Informações sobre a conta do usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-gray-light">Criado em</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-gray-light">Atualizado em</p>
                  <p className="font-medium">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-gray-light">Último acesso</p>
                  <p className="font-medium">{formatDate(user.lastLoginAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
