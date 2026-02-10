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
import { DateTimePicker } from "@/shared/components/ui/date-time-picker"
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
import { inventariosApi, type ApiError } from "../api/inventarios-api"
import { inventarioFormSchema, type InventarioFormData } from "../types"
// Direct imports instead of barrel files (bundle-barrel-imports)
// SWR hooks for data fetching (client-swr-dedup)
import { useLojas } from "@/features/lojas/hooks/useLojas"
import { useEmpresas } from "@/features/empresas/hooks/useEmpresas"
import { useUsuarios } from "@/features/usuarios/hooks/useUsuarios"
import { useRoles } from "@/features/roles/hooks/useRoles"

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

  // Memoize options for comboboxes
  const empresaOptions = useMemo(
    () =>
      empresas.map((empresa) => ({
        value: empresa.id,
        label: empresa.nomeFantasia || empresa.razaoSocial || `Empresa #${empresa.id}`,
        description: empresa.cnpj || undefined,
      })),
    [empresas]
  )

  const lojaOptions = useMemo(
    () =>
      lojas.map((loja) => ({
        value: loja.id,
        label: loja.nome,
        description: loja.cnpj || undefined,
      })),
    [lojas]
  )

  const liderOptions = useMemo(
    () =>
      lideres.map((user) => ({
        value: user.id,
        label: user.fullName,
        description: user.email,
      })),
    [lideres]
  )

  // Memoize default values to prevent hydration mismatch (rendering-hydration-no-flicker)
  // Empty string for dataInicio in create mode - user must select
  const defaultValues = useMemo(() => ({
    idLoja: inventario?.idLoja || preSelectedLojaId || 0,
    idEmpresa: inventario?.idEmpresa || preSelectedEmpresaId || 0,
    dataInicio: formatDateForInput(inventario?.dataInicio),
    dataTermino: formatDateForInput(inventario?.dataTermino) || null,
    minimoContagem: inventario?.minimoContagem || 1,
    lote: inventario?.lote ?? false,
    validade: inventario?.validade ?? false,
    ativo: inventario?.ativo ?? true,
    lider: inventario?.lider || null,
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
                  <FormControl>
                    <Combobox
                      options={empresaOptions}
                      value={field.value || null}
                      onChange={(value) => field.onChange(value as number ?? 0)}
                      placeholder="Selecione a empresa"
                      searchPlaceholder="Buscar empresa..."
                      emptyMessage="Nenhuma empresa encontrada."
                      loading={loadingEmpresas}
                    />
                  </FormControl>
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
                  <FormControl>
                    <Combobox
                      options={lojaOptions}
                      value={field.value || null}
                      onChange={(value) => field.onChange(value as number ?? 0)}
                      placeholder="Selecione a loja"
                      searchPlaceholder="Buscar loja..."
                      emptyMessage="Nenhuma loja encontrada."
                      loading={loadingLojas}
                    />
                  </FormControl>
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
                    <DateTimePicker
                      value={field.value || null}
                      onChange={(value) => field.onChange(value || "")}
                      placeholder="Selecione data e hora"
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
                    <DateTimePicker
                      value={field.value || null}
                      onChange={(value) => field.onChange(value)}
                      placeholder="Selecione data e hora"
                      clearable
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
