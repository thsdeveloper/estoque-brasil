import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { InventarioForm } from "@/features/inventarios"
import { inventariosServerApi } from "@/features/inventarios/api/inventarios-api.server"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditInventarioPage({ params }: PageProps) {
  const { id } = await params

  let inventario
  try {
    inventario = await inventariosServerApi.get(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/inventarios/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Editar Inventario #{inventario.id}
          </h1>
          <p className="text-gray-light">Altere os dados do inventario</p>
        </div>
      </div>

      <InventarioForm inventario={inventario} mode="edit" />
    </div>
  )
}
