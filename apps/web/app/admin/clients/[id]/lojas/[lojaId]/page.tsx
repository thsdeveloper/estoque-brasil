import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { DeleteLojaButton } from "@/features/lojas"
import { lojasServerApi } from "@/features/lojas/api/lojas-api.server"
import { clientsServerApi } from "@/features/clients/api/clients-api.server"

interface PageProps {
  params: Promise<{ id: string; lojaId: string }>
}

// Format CNPJ for display
function formatCNPJ(cnpj: string | null): string {
  if (!cnpj) return "-"
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  )
}

export default async function ViewLojaPage({ params }: PageProps) {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/clients/${clientId}/lojas`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{loja.nome}</h1>
            <p className="text-gray-light">
              Loja do cliente {client.nome}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/clients/${clientId}/lojas/${lojaId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteLojaButton loja={loja} clientId={clientId} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Loja</CardTitle>
          <CardDescription>Dados cadastrais da loja</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-light">Nome</p>
            <p className="font-medium">{loja.nome}</p>
          </div>
          <div>
            <p className="text-sm text-gray-light">CNPJ</p>
            <p className="font-mono">{formatCNPJ(loja.cnpj)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-light">Cliente</p>
            <p className="font-medium">{client.nome}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
