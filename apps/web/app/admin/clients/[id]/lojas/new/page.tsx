import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { LojaForm } from "@/features/lojas"
import { clientsServerApi } from "@/features/clients/api/clients-api.server"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewLojaPage({ params }: PageProps) {
  const { id: clientId } = await params

  let client
  try {
    client = await clientsServerApi.get(clientId)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/clients/${clientId}/lojas`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Loja</h1>
          <p className="text-gray-light">
            Cadastrar loja para {client.nome}
          </p>
        </div>
      </div>

      <LojaForm clientId={clientId} clientName={client.nome} mode="create" />
    </div>
  )
}
