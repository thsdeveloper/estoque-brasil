"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import type { Client, CreateClientInput, UpdateClientInput } from "@estoque-brasil/types"
import { clientFormSchema, type ClientFormData } from "@estoque-brasil/shared"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"
import { AddressFields } from "@/shared/components/address-fields"
import { clientsApi, type ApiError } from "../api/clients-api"
import { useEmpresa } from "@/features/empresas"
import { consultasApi } from "@/features/consultas/api/consultas-api"

interface ClientFormProps {
  client?: Client
  mode: "create" | "edit"
}

export function ClientForm({ client, mode }: ClientFormProps) {
  const router = useRouter()
  const { selectedEmpresaId } = useEmpresa()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingCnpj, setLoadingCnpj] = useState(false)
  const [cnpjStatus, setCnpjStatus] = useState<"idle" | "success" | "error">("idle")
  const [cnpjMessage, setCnpjMessage] = useState<string | null>(null)

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      nome: client?.nome || "",
      cnpj: client?.cnpj || "",
      fantasia: client?.fantasia || "",
      email: client?.email || "",
      telefone: client?.telefone || "",
      situacao: client?.situacao || "",

      qtdeDivergentePlus: client?.qtdeDivergentePlus ?? undefined,
      qtdeDivergenteMinus: client?.qtdeDivergenteMinus ?? undefined,
      valorDivergentePlus: client?.valorDivergentePlus ?? undefined,
      valorDivergenteMinus: client?.valorDivergenteMinus ?? undefined,
      percentualDivergencia: client?.percentualDivergencia ?? undefined,
      cep: client?.cep || "",
      endereco: client?.endereco || "",
      numero: client?.numero || "",
      bairro: client?.bairro || "",
      uf: client?.uf || "",
      municipio: client?.municipio || "",
    },
  })

  const fetchCnpjData = useCallback(
    async (cnpj: string) => {
      if (cnpj.length !== 14) {
        setCnpjStatus("idle")
        setCnpjMessage(null)
        return
      }

      setLoadingCnpj(true)
      setCnpjStatus("idle")
      setCnpjMessage(null)

      try {
        const data = await consultasApi.cnpj(cnpj)

        // Auto-fill razão social
        if (data.nome) form.setValue("nome", data.nome)

        // Auto-fill new fields
        if (data.fantasia) form.setValue("fantasia", data.fantasia)
        if (data.email) form.setValue("email", data.email)
        if (data.telefone) form.setValue("telefone", data.telefone)
        if (data.situacao) form.setValue("situacao", data.situacao)

        // Auto-fill address fields
        if (data.cep) form.setValue("cep", data.cep)
        if (data.logradouro) form.setValue("endereco", data.logradouro)
        if (data.numero) form.setValue("numero", data.numero)
        if (data.bairro) form.setValue("bairro", data.bairro)
        if (data.uf) form.setValue("uf", data.uf)
        if (data.municipio) form.setValue("municipio", data.municipio)

        setCnpjStatus("success")
        const situacaoText = data.situacao ? ` — Situação: ${data.situacao}` : ""
        setCnpjMessage(`${data.nome}${situacaoText}`)
      } catch (err) {
        setCnpjStatus("error")
        setCnpjMessage(
          err instanceof Error ? err.message : "Erro ao consultar CNPJ"
        )
      } finally {
        setLoadingCnpj(false)
      }
    },
    [form]
  )

  const cleanCNPJ = (value: string) => value.replace(/\D/g, "").slice(0, 14)

  const displayCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, "")
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`
  }

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (mode === "create") {
        const createData: CreateClientInput = {
          ...(data as CreateClientInput),
          idEmpresa: selectedEmpresaId,
        }
        await clientsApi.create(createData)
      } else if (client) {
        await clientsApi.update(client.id, data as UpdateClientInput)
      }
      router.push("/admin/clients")
      router.refresh()
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.errors) {
        apiError.errors.forEach((e) => {
          form.setError(e.field as keyof ClientFormData, {
            message: e.message,
          })
        })
      } else {
        setError(apiError.message || "Erro ao salvar cliente")
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

        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Dados principais do cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                        {...field}
                        value={displayCNPJ(field.value || "")}
                        onChange={(e) => {
                          const raw = cleanCNPJ(e.target.value)
                          field.onChange(raw)
                          fetchCnpjData(raw)
                        }}
                      />
                      {loadingCnpj && (
                        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                      )}
                      {!loadingCnpj && cnpjStatus === "success" && (
                        <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                      )}
                      {!loadingCnpj && cnpjStatus === "error" && (
                        <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                      )}
                    </div>
                  </FormControl>
                  {cnpjMessage && cnpjStatus === "success" && (
                    <p className="text-xs text-green-600">{cnpjMessage}</p>
                  )}
                  {cnpjMessage && cnpjStatus === "error" && (
                    <p className="text-xs text-red-500">{cnpjMessage}</p>
                  )}
                  {!cnpjMessage && (
                    <FormDescription>
                      Apenas números (14 dígitos) — preenchimento automático
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social *</FormLabel>
                  <FormControl>
                    <Input placeholder="Razão social do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fantasia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome fantasia" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="situacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Situação</FormLabel>
                  <FormControl>
                    <Input placeholder="Preenchido via CNPJ" disabled {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Divergências */}
        <Card>
          <CardHeader>
            <CardTitle>Divergências</CardTitle>
            <CardDescription>
              Informações sobre divergências de estoque
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="qtdeDivergentePlus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qtde Divergente (+) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormDescription>Itens a mais</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="qtdeDivergenteMinus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qtde Divergente (-) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormDescription>Itens a menos</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="percentualDivergencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>% Divergência *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormDescription>Percentual de divergência</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valorDivergentePlus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Divergente (+) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormDescription>Valor em R$</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valorDivergenteMinus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Divergente (-) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormDescription>Valor em R$</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Endereço */}
        <AddressFields description="Localização do cliente" />

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
            {mode === "create" ? "Criar Cliente" : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
