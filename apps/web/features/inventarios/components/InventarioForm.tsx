"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import type { Inventario } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Switch } from "@/shared/components/ui/switch"
import { Combobox } from "@/shared/components/ui/combobox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { inventariosApi, type ApiError } from "../api/inventarios-api"
import { inventarioFormSchema, type InventarioFormData } from "../types"
// Direct imports instead of barrel files (bundle-barrel-imports)
// SWR hooks for data fetching (client-swr-dedup)
import { useLojas } from "@/features/lojas/hooks/useLojas"
import { useEmpresas } from "@/features/empresas/hooks/useEmpresas"
import { useUsuarios } from "@/features/usuarios/hooks/useUsuarios"
import { useRoles } from "@/features/roles/hooks/useRoles"
import { useTemplatesImportacao, useTemplatesExportacao } from "@/features/templates/hooks/useTemplates"

// Helper to format date for datetime-local input
function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return ""
  try {
    return new Date(dateString).toISOString().slice(0, 16)
  } catch {
    return ""
  }
}

// Helper to format date for display (readonly fields)
function formatDateForDisplay(dateString: string | null | undefined): string {
  if (!dateString) return "-"
  try {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "-"
  }
}

interface InventarioFormProps {
  inventario?: Inventario
  mode: "create" | "edit"
  preSelectedLojaId?: number
  preSelectedEmpresaId?: number
}

export function InventarioForm({
  inventario,
  mode,
  preSelectedLojaId,
  preSelectedEmpresaId,
}: InventarioFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // SWR hooks for lojas and empresas (client-swr-dedup)
  const { lojas, isLoading: loadingLojas } = useLojas({ limit: 100 })
  const { empresas, isLoading: loadingEmpresas } = useEmpresas({ limit: 100 })

  // Fetch roles to find lider_coleta role
  const { roles, isLoading: loadingRoles } = useRoles(false)
  const liderColetaRole = useMemo(
    () => roles.find((r) => r.name === "lider_coleta"),
    [roles]
  )

  // Fetch usuarios with lider_coleta role
  const { usuarios: lideres, isLoading: loadingLideres } = useUsuarios({
    roleId: liderColetaRole?.id,
    isActive: true,
    limit: 100,
  })

  // Fetch templates
  const { templates: templatesImportacao, isLoading: loadingTemplatesImportacao } = useTemplatesImportacao()
  const { templates: templatesExportacao, isLoading: loadingTemplatesExportacao } = useTemplatesExportacao()

  // Memoize options for comboboxes
  const liderOptions = useMemo(
    () =>
      lideres.map((user) => ({
        value: user.id,
        label: user.fullName,
        description: user.email,
      })),
    [lideres]
  )

  const templateImportacaoOptions = useMemo(
    () =>
      templatesImportacao.map((template) => ({
        value: template.id,
        label: template.nome,
        description: template.descricao || undefined,
      })),
    [templatesImportacao]
  )

  const templateExportacaoOptions = useMemo(
    () =>
      templatesExportacao.map((template) => ({
        value: template.id,
        label: template.nome,
        description: template.descricao || undefined,
      })),
    [templatesExportacao]
  )

  // Memoize default values to prevent hydration mismatch (rendering-hydration-no-flicker)
  // Empty string for dataInicio in create mode - user must select
  const defaultValues = useMemo(() => ({
    idLoja: inventario?.idLoja || preSelectedLojaId || 0,
    idEmpresa: inventario?.idEmpresa || preSelectedEmpresaId || 0,
    idTemplate: inventario?.idTemplate || null,
    idTemplateExportacao: inventario?.idTemplateExportacao || null,
    dataInicio: formatDateForInput(inventario?.dataInicio),
    dataTermino: formatDateForInput(inventario?.dataTermino) || null,
    minimoContagem: inventario?.minimoContagem || 1,
    lote: inventario?.lote ?? false,
    validade: inventario?.validade ?? false,
    ativo: inventario?.ativo ?? true,
    lider: (inventario as Inventario & { lider?: string })?.lider || null,
    receberDadosOffline: (inventario as Inventario & { receberDadosOffline?: boolean })?.receberDadosOffline ?? false,
  }), [inventario, preSelectedLojaId, preSelectedEmpresaId])

  const form = useForm<InventarioFormData>({
    resolver: zodResolver(inventarioFormSchema),
    defaultValues,
  })

  const onSubmit = async (data: InventarioFormData) => {
    setLoading(true)
    setError(null)

    try {
      const submitData = {
        idLoja: data.idLoja,
        idEmpresa: data.idEmpresa,
        idTemplate: data.idTemplate || null,
        idTemplateExportacao: data.idTemplateExportacao || null,
        dataInicio: new Date(data.dataInicio).toISOString(),
        dataTermino: data.dataTermino ? new Date(data.dataTermino).toISOString() : null,
        minimoContagem: data.minimoContagem,
        lote: data.lote,
        validade: data.validade,
        ativo: data.ativo,
        lider: data.lider || null,
        receberDadosOffline: data.receberDadosOffline,
      }

      if (mode === "create") {
        const created = await inventariosApi.create(submitData)
        router.push(`/admin/inventarios/${created.id}`)
      } else if (inventario) {
        await inventariosApi.update(inventario.id, submitData)
        router.push(`/admin/inventarios/${inventario.id}`)
      }
      router.refresh()
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.errors) {
        apiError.errors.forEach((e) => {
          form.setError(e.field as keyof InventarioFormData, {
            message: e.message,
          })
        })
      } else {
        setError(apiError.message || "Erro ao salvar inventario")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Informacoes Basicas */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Informacoes Basicas</CardTitle>
            <CardDescription>Dados principais do inventario</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="idEmpresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <Select
                    disabled={loadingEmpresas}
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingEmpresas ? "Carregando..." : "Selecione a empresa"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {empresas.map((empresa) => (
                        <SelectItem key={empresa.id} value={String(empresa.id)}>
                          {empresa.nomeFantasia || empresa.razaoSocial || `Empresa #${empresa.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idLoja"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loja</FormLabel>
                  <Select
                    disabled={loadingLojas}
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingLojas ? "Carregando..." : "Selecione a loja"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lojas.map((loja) => (
                        <SelectItem key={loja.id} value={String(loja.id)}>
                          {loja.nome} {loja.cnpj ? `(${loja.cnpj})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template de Importacao</FormLabel>
                  <FormControl>
                    <Combobox
                      options={templateImportacaoOptions}
                      value={field.value}
                      onChange={(value) => field.onChange(value as number | null)}
                      placeholder="Selecione o template"
                      searchPlaceholder="Buscar template..."
                      emptyMessage="Nenhum template encontrado."
                      loading={loadingTemplatesImportacao}
                    />
                  </FormControl>
                  <FormDescription>
                    Template para importacao de produtos
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idTemplateExportacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template de Exportacao</FormLabel>
                  <FormControl>
                    <Combobox
                      options={templateExportacaoOptions}
                      value={field.value}
                      onChange={(value) => field.onChange(value as number | null)}
                      placeholder="Selecione o template"
                      searchPlaceholder="Buscar template..."
                      emptyMessage="Nenhum template encontrado."
                      loading={loadingTemplatesExportacao}
                    />
                  </FormControl>
                  <FormDescription>
                    Template para exportacao de resultados
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataInicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previsao Inicio</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataTermino"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previsao Termino</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormDescription>
                    Deixe em branco se nao houver previsao
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lider</FormLabel>
                  <FormControl>
                    <Combobox
                      options={liderOptions}
                      value={field.value}
                      onChange={(value) => field.onChange(value as string | null)}
                      placeholder="Selecione o lider"
                      searchPlaceholder="Buscar lider..."
                      emptyMessage="Nenhum lider encontrado."
                      loading={loadingRoles || loadingLideres}
                    />
                  </FormControl>
                  <FormDescription>Responsavel pelo inventario</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minimoContagem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimo de Contagens</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Numero minimo de contagens por produto
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Informacoes do Sistema - only in edit mode */}
        {mode === "edit" && inventario && (
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Informacoes do Sistema</CardTitle>
              <CardDescription>Dados gerados automaticamente pelo sistema</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">N Inventario</p>
                <p className="text-sm font-mono">{inventario.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Cadastro</p>
                <p className="text-sm">{formatDateForDisplay((inventario as Inventario & { createdAt?: string })?.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Inicio Real</p>
                <p className="text-sm">{formatDateForDisplay((inventario as Inventario & { inicioReal?: string })?.inicioReal)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Termino Real</p>
                <p className="text-sm">{formatDateForDisplay((inventario as Inventario & { terminoReal?: string })?.terminoReal)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Opcoes */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Opcoes</CardTitle>
            <CardDescription>Configuracoes adicionais do inventario</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="lote"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border bg-neutral/30 p-4 transition-colors hover:bg-neutral/50">
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-medium cursor-pointer">Informar Lote</FormLabel>
                    <FormDescription className="text-xs">
                      Habilitar informacao de lote na contagem
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validade"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border bg-neutral/30 p-4 transition-colors hover:bg-neutral/50">
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-medium cursor-pointer">Informar Validade</FormLabel>
                    <FormDescription className="text-xs">
                      Habilitar informacao de validade na contagem
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receberDadosOffline"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border bg-neutral/30 p-4 transition-colors hover:bg-neutral/50">
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-medium cursor-pointer">Receber Dados Offline</FormLabel>
                    <FormDescription className="text-xs">
                      Permitir sincronizacao de dados offline
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border bg-neutral/30 p-4 transition-colors hover:bg-neutral/50">
                  <div className="space-y-1">
                    <FormLabel className="text-sm font-medium cursor-pointer">Inventario Ativo</FormLabel>
                    <FormDescription className="text-xs">
                      Inventario ativo no sistema
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Criar Inventario" : "Salvar Alteracoes"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
