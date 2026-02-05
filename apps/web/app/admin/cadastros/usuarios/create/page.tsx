import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { UserForm } from "@/features/usuarios"

export default function CreateUserPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/cadastros/usuarios">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Usuário</h1>
          <p className="text-gray-light">
            Preencha os dados para cadastrar um novo usuário
          </p>
        </div>
      </div>

      <UserForm mode="create" />
    </div>
  )
}
