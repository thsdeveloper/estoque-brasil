"use client"

import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { ESTADOS_BRASIL } from "@estoque-brasil/shared"
import { Input } from "@/shared/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  FormControl,
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
import { consultasApi } from "@/features/consultas/api/consultas-api"

interface AddressFieldsProps {
  fieldNames?: {
    cep?: string
    endereco?: string
    numero?: string
    bairro?: string
    uf?: string
    municipio?: string
  }
  description?: string
}

const formatCEP = (value: string) => value.replace(/\D/g, "").slice(0, 8)

export function AddressFields({ fieldNames, description }: AddressFieldsProps) {
  const form = useFormContext()
  const [loadingCep, setLoadingCep] = useState(false)
  const [cepStatus, setCepStatus] = useState<"idle" | "success" | "error">("idle")
  const [cepMessage, setCepMessage] = useState<string | null>(null)

  const fields = {
    cep: fieldNames?.cep ?? "cep",
    endereco: fieldNames?.endereco ?? "endereco",
    numero: fieldNames?.numero ?? "numero",
    bairro: fieldNames?.bairro ?? "bairro",
    uf: fieldNames?.uf ?? "uf",
    municipio: fieldNames?.municipio ?? "municipio",
  }

  const fetchCEP = async (cep: string) => {
    if (cep.length !== 8) {
      setCepStatus("idle")
      setCepMessage(null)
      return
    }

    setLoadingCep(true)
    setCepStatus("idle")
    setCepMessage(null)

    try {
      const data = await consultasApi.cep(cep)
      if (data.logradouro) form.setValue(fields.endereco, data.logradouro)
      if (data.bairro) form.setValue(fields.bairro, data.bairro)
      if (data.uf) form.setValue(fields.uf, data.uf)
      if (data.localidade) form.setValue(fields.municipio, data.localidade)
      setCepStatus("success")
      setCepMessage(`${data.localidade} - ${data.uf}`)
    } catch (err) {
      setCepStatus("error")
      setCepMessage(
        err instanceof Error ? err.message : "CEP não encontrado"
      )
    } finally {
      setLoadingCep(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Endereço</CardTitle>
        <CardDescription>{description ?? "Localização"}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField
          control={form.control}
          name={fields.cep}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="00000000"
                    maxLength={8}
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const formatted = formatCEP(e.target.value)
                      field.onChange(formatted)
                      fetchCEP(formatted)
                    }}
                  />
                  {loadingCep && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                  {!loadingCep && cepStatus === "success" && (
                    <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                  )}
                  {!loadingCep && cepStatus === "error" && (
                    <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                  )}
                </div>
              </FormControl>
              {cepMessage && cepStatus === "success" && (
                <p className="text-xs text-green-600">{cepMessage}</p>
              )}
              {cepMessage && cepStatus === "error" && (
                <p className="text-xs text-red-500">{cepMessage}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={fields.endereco}
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Endereço *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Rua, Avenida..."
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
          name={fields.numero}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número *</FormLabel>
              <FormControl>
                <Input
                  placeholder="123"
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
          name={fields.bairro}
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Bairro *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Bairro"
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
          name={fields.uf}
          render={({ field }) => (
            <FormItem>
              <FormLabel>UF *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ESTADOS_BRASIL.map((estado) => (
                    <SelectItem key={estado.value} value={estado.value}>
                      {estado.value} - {estado.label}
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
          name={fields.municipio}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Município *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Cidade"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
