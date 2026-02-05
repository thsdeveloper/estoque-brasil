import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { EmpresaForm } from "@/features/empresas"
import { empresasServerApi } from "@/features/empresas/api/empresas-api.server"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditEmpresaPage({ params }: PageProps) {
  const { id } = await params

  let empresa
  try {
    empresa = await empresasServerApi.get(id)
  } catch {
    notFound()
  }

  const empresaName =
    empresa.razaoSocial || empresa.nomeFantasia || empresa.descricao || ""

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/empresas/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Empresa</h1>
          <p className="text-gray-light">{empresaName}</p>
        </div>
      </div>

      <EmpresaForm empresa={empresa} mode="edit" />
    </div>
  )
}
