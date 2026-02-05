import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"
import { DeleteEmpresaButton } from "@/features/empresas"
import { empresasServerApi } from "@/features/empresas/api/empresas-api.server"

interface PageProps {
  params: Promise<{ id: string }>
}

// Format CNPJ for display
function formatCNPJ(cnpj: string | null): string {
  if (!cnpj) return "-"
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  )
}

// Format CEP for display
function formatCEP(cep: string | null): string {
  if (!cep) return "-"
  return cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")
}

export default async function ViewEmpresaPage({ params }: PageProps) {
  const { id } = await params

  let empresa
  try {
    empresa = await empresasServerApi.get(id)
  } catch {
    notFound()
  }

  const empresaName =
    empresa.razaoSocial || empresa.nomeFantasia || empresa.descricao || "-"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/empresas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {empresaName}
              </h1>
              <Badge variant={empresa.ativo ? "success" : "secondary"}>
                {empresa.ativo ? "Ativa" : "Inativa"}
              </Badge>
            </div>
            <p className="text-gray-light">Detalhes da empresa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/empresas/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteEmpresaButton empresa={empresa} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Dados principais da empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-light">Razão Social</p>
              <p className="font-medium">{empresa.razaoSocial || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-light">Nome Fantasia</p>
              <p className="font-medium">{empresa.nomeFantasia || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-light">Descrição</p>
              <p className="font-medium">{empresa.descricao || "-"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-gray-light">CNPJ</p>
              <p className="font-mono">{formatCNPJ(empresa.cnpj)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>Localização da empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {empresa.codigoUf && (
                <Badge variant="secondary">{empresa.codigoUf}</Badge>
              )}
              {empresa.codigoMunicipio && (
                <span className="font-medium">{empresa.codigoMunicipio}</span>
              )}
              {!empresa.codigoUf && !empresa.codigoMunicipio && (
                <span className="text-gray-light">-</span>
              )}
            </div>
            {(empresa.endereco || empresa.numero || empresa.bairro) && (
              <div>
                <p className="text-sm text-gray-light">Endereço completo</p>
                <p>
                  {[
                    empresa.endereco,
                    empresa.numero && `n ${empresa.numero}`,
                    empresa.bairro,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}
            {empresa.cep && (
              <div>
                <p className="text-sm text-gray-light">CEP</p>
                <p>{formatCEP(empresa.cep)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
