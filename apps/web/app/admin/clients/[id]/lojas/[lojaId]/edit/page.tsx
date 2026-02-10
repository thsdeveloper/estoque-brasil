import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { LojaForm } from "@/features/lojas"
import { lojasServerApi } from "@/features/lojas/api/lojas-api.server"
import { clientsServerApi } from "@/features/clients/api/clients-api.server"

interface PageProps {
  params: Promise<{ id: string; lojaId: string }>
}

export default async function EditLojaPage({ params }: PageProps) {
  const { id: clientId, lojaId } = await params

  let client
  let loja
  try {
    ;[client, loja] = await Promise.all([
      clientsServerApi.get(clientId),
      lojasServerApi.get(lojaId),
    ])
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/clients/${clientId}/lojas/${lojaId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Loja</h1>
          <p className="text-gray-light">{loja.nome}</p>
        </div>
      </div>

      <LojaForm
        loja={loja}
        clientId={clientId}
        clientName={client.nome}
        mode="edit"
      />
    </div>
  )
}
