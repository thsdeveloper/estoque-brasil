import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { DeleteInventarioButton } from "@/features/inventarios"
import { inventariosServerApi } from "@/features/inventarios/api/inventarios-api.server"
import { InventarioTabs } from "@/features/inventarios/components/InventarioTabs"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewInventarioPage({ params }: PageProps) {
  const { id } = await params

  let inventario
  try {
    inventario = await inventariosServerApi.get(id)
  } catch {
    notFound()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(dateString))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/inventarios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                Inventario #{inventario.id}
              </h1>
              <Badge variant={inventario.ativo ? "success" : "secondary"}>
                {inventario.ativo ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Ativo
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 h-3 w-3" />
                    Finalizado
                  </>
                )}
              </Badge>
            </div>
            <p className="text-gray-light">
              Inicio: {formatDate(inventario.dataInicio)}
              {inventario.dataTermino && ` | Termino: ${formatDate(inventario.dataTermino)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/inventarios/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteInventarioButton inventario={inventario} />
        </div>
      </div>

      <InventarioTabs inventario={inventario} />
    </div>
  )
}
