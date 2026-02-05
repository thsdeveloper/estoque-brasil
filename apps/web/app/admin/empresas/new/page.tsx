import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { EmpresaForm } from "@/features/empresas"

export default function CreateEmpresaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/empresas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Empresa</h1>
          <p className="text-gray-light">
            Preencha os dados para cadastrar uma nova empresa
          </p>
        </div>
      </div>

      <EmpresaForm mode="create" />
    </div>
  )
}
