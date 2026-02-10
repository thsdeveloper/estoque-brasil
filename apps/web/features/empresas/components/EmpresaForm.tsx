"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import type {
  Empresa,
  CreateEmpresaInput,
  UpdateEmpresaInput,
} from "@estoque-brasil/types"
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
import { AddressFields } from "@/shared/components/address-fields"
import { empresasApi, type ApiError } from "../api/empresas-api"
import { empresaFormSchema, type EmpresaFormData } from "../types"
import { consultasApi } from "@/features/consultas/api/consultas-api"

interface EmpresaFormProps {
  empresa?: Empresa
  mode: "create" | "edit"
}

export function EmpresaForm({ empresa, mode }: EmpresaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingCnpj, setLoadingCnpj] = useState(false)
  const [cnpjStatus, setCnpjStatus] = useState<"idle" | "success" | "error">("idle")
  const [cnpjMessage, setCnpjMessage] = useState<string | null>(null)

  const form = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: {
      descricao: empresa?.descricao || "",
      cnpj: empresa?.cnpj || "",
      razaoSocial: empresa?.razaoSocial || "",
      nomeFantasia: empresa?.nomeFantasia || "",
      cep: empresa?.cep || "",
      endereco: empresa?.endereco || "",
      numero: empresa?.numero || "",
      bairro: empresa?.bairro || "",
      codigoUf: empresa?.codigoUf || "",
      codigoMunicipio: empresa?.codigoMunicipio || "",
      ativo: empresa?.ativo ?? true,
    },
  })

  const onSubmit = async (data: EmpresaFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (mode === "create") {
        await empresasApi.create(data as CreateEmpresaInput)
      } else if (empresa) {
        await empresasApi.update(empresa.id, data as UpdateEmpresaInput)
      }
      router.push("/admin/empresas")
      router.refresh()
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.errors) {
        apiError.errors.forEach((e) => {
          form.setError(e.field as keyof EmpresaFormData, {
            message: e.message,
          })
        })
      } else {
        setError(apiError.message || "Erro ao salvar empresa")
      }
    } finally {
      setLoading(false)
    }
  }

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

        if (data.nome) form.setValue("razaoSocial", data.nome)
        if (data.fantasia) form.setValue("nomeFantasia", data.fantasia)

        // Auto-fill address fields
        if (data.cep) form.setValue("cep", data.cep)
        if (data.logradouro) form.setValue("endereco", data.logradouro)
        if (data.numero) form.setValue("numero", data.numero)
        if (data.bairro) form.setValue("bairro", data.bairro)
        if (data.uf) form.setValue("codigoUf", data.uf)
        if (data.municipio) form.setValue("codigoMunicipio", data.municipio)

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
            <CardDescription>Dados principais da empresa</CardDescription>
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
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status</FormLabel>
                    <FormDescription>
                      Empresa ativa no sistema
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
              name="razaoSocial"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Razão Social *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Razão social da empresa"
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
              name="nomeFantasia"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nome Fantasia</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome fantasia da empresa"
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
              name="descricao"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descrição da empresa"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Identificação adicional da empresa
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Endereço */}
        <AddressFields
          description="Localização da empresa"
          fieldNames={{ uf: "codigoUf", municipio: "codigoMunicipio" }}
        />

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
            {mode === "create" ? "Criar Empresa" : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
