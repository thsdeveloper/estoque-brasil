import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { RoleForm } from "@/features/roles"

export default function CreateRolePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/cadastros/roles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Perfil</h1>
          <p className="text-gray-light">
            Crie um novo perfil de acesso para o sistema
          </p>
        </div>
      </div>

      <RoleForm mode="create" />
    </div>
  )
}
