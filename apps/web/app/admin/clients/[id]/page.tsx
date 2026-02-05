import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, ExternalLink, Store, ChevronRight } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"
import { DeleteClientButton } from "@/features/clients"
import { clientsServerApi } from "@/features/clients/api/clients-api.server"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ViewClientPage({ params }: PageProps) {
  const { id } = await params

  let client
  try {
    client = await clientsServerApi.get(id)
  } catch {
    notFound()
  }

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "-"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatPercentage = (value: number | null) => {
    if (value === null || value === undefined) return "-"
    return `${value.toFixed(2)}%`
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(dateString))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{client.nome}</h1>
            <p className="text-gray-light">Detalhes do cliente</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/clients/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteClientButton client={client} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Dados principais do cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-light">Nome</p>
              <p className="font-medium">{client.nome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-light">Link do BI</p>
              {client.linkBi ? (
                <a
                  href={client.linkBi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-orange hover:underline inline-flex items-center gap-1"
                >
                  Acessar Dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <p className="text-gray-light">-</p>
              )}
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-light">Criado em</p>
                <p>{formatDate(client.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-light">Atualizado em</p>
                <p>{formatDate(client.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>Localização do cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {client.uf && <Badge variant="secondary">{client.uf}</Badge>}
              {client.municipio && <span className="font-medium">{client.municipio}</span>}
              {!client.uf && !client.municipio && <span className="text-gray-light">-</span>}
            </div>
            {(client.endereco || client.numero || client.bairro) && (
              <div>
                <p className="text-sm text-gray-light">Endereço completo</p>
                <p>
                  {[
                    client.endereco,
                    client.numero && `nº ${client.numero}`,
                    client.bairro,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}
            {client.cep && (
              <div>
                <p className="text-sm text-gray-light">CEP</p>
                <p>{client.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lojas */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Lojas
              </CardTitle>
              <CardDescription>
                Gerencie as lojas deste cliente
              </CardDescription>
            </div>
            <Button asChild>
              <Link href={`/admin/clients/${id}/lojas`}>
                Ver Lojas
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
        </Card>

        {/* Divergências */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Divergências de Estoque</CardTitle>
            <CardDescription>
              Informações sobre divergências identificadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              <div className="text-center p-4 bg-neutral rounded-lg">
                <p className="text-sm text-gray-light mb-1">% Divergência</p>
                <div className="text-2xl font-bold">
                  {client.percentualDivergencia !== null ? (
                    <Badge
                      variant={
                        client.percentualDivergencia > 5
                          ? "destructive"
                          : client.percentualDivergencia > 2
                          ? "warning"
                          : "success"
                      }
                      className="text-lg px-3 py-1"
                    >
                      {formatPercentage(client.percentualDivergencia)}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              <div className="text-center p-4 bg-neutral rounded-lg">
                <p className="text-sm text-gray-light mb-1">Qtde (+)</p>
                <p className="text-2xl font-bold text-green-600">
                  {client.qtdeDivergentePlus ?? "-"}
                </p>
              </div>
              <div className="text-center p-4 bg-neutral rounded-lg">
                <p className="text-sm text-gray-light mb-1">Qtde (-)</p>
                <p className="text-2xl font-bold text-red-500">
                  {client.qtdeDivergenteMinus ?? "-"}
                </p>
              </div>
              <div className="text-center p-4 bg-neutral rounded-lg">
                <p className="text-sm text-gray-light mb-1">Valor (+)</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(client.valorDivergentePlus)}
                </p>
              </div>
              <div className="text-center p-4 bg-neutral rounded-lg">
                <p className="text-sm text-gray-light mb-1">Valor (-)</p>
                <p className="text-xl font-bold text-red-500">
                  {formatCurrency(client.valorDivergenteMinus)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
