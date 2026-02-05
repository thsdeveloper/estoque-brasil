import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { UserForm } from "@/features/usuarios"
import { getUser } from "@/features/usuarios/api/usuarios-api.server"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params

  let user
  try {
    user = await getUser(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/cadastros/usuarios/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Usuário</h1>
          <p className="text-gray-light">{user.fullName}</p>
        </div>
      </div>

      <UserForm user={user} mode="edit" />
    </div>
  )
}
