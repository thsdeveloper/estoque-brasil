"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import type { Inventario, Loja, Empresa } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Switch } from "@/shared/components/ui/switch"
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
import { lojasApi } from "@/features/lojas"
import { empresasApi } from "@/features/empresas"

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
  const [lojas, setLojas] = useState<Loja[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loadingLojas, setLoadingLojas] = useState(false)
  const [loadingEmpresas, setLoadingEmpresas] = useState(false)

  const form = useForm<InventarioFormData>({
    resolver: zodResolver(inventarioFormSchema),
    defaultValues: {
      idLoja: inventario?.idLoja || preSelectedLojaId || 0,
      idEmpresa: inventario?.idEmpresa || preSelectedEmpresaId || 0,
      idTemplate: inventario?.idTemplate || null,
      idTemplateExportacao: inventario?.idTemplateExportacao || null,
      dataInicio: inventario?.dataInicio
        ? new Date(inventario.dataInicio).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      dataTermino: inventario?.dataTermino
        ? new Date(inventario.dataTermino).toISOString().slice(0, 16)
        : null,
      minimoContagem: inventario?.minimoContagem || 1,
      lote: inventario?.lote ?? false,
      validade: inventario?.validade ?? false,
      ativo: inventario?.ativo ?? true,
      lider: null,
      receberDadosOffline: false,
    },
  })

  // Load lojas and empresas on mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingLojas(true)
      setLoadingEmpresas(true)
      try {
        const [lojasResult, empresasResult] = await Promise.all([
          lojasApi.list({ limit: 100 }),
          empresasApi.list({ limit: 100 }),
        ])
        setLojas(lojasResult.data)
        setEmpresas(empresasResult.data)
      } catch (err) {
        console.error("Error loading lojas/empresas:", err)
      } finally {
        setLoadingLojas(false)
        setLoadingEmpresas(false)
      }
    }
    loadData()
  }, [])

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
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Informacoes Basicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informacoes Basicas</CardTitle>
            <CardDescription>Dados principais do inventario</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
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

            <FormField
              control={form.control}
              name="lider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lider</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do lider"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Responsavel pelo inventario</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Opcoes */}
        <Card>
          <CardHeader>
            <CardTitle>Opcoes</CardTitle>
            <CardDescription>Configuracoes adicionais do inventario</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="lote"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Informar Lote?</FormLabel>
                    <FormDescription>
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Informar Validade?</FormLabel>
                    <FormDescription>
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Receber Dados Offline</FormLabel>
                    <FormDescription>
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status</FormLabel>
                    <FormDescription>
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
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Criar Inventario" : "Salvar Alteracoes"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
