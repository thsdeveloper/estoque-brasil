import { createClient } from "@/lib/supabase/client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

async function getAuthHeader(): Promise<Record<string, string>> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` }
  }
  return {}
}

export interface CnpjData {
  nome: string
  fantasia: string
  logradouro: string
  numero: string
  complemento: string
  cep: string
  bairro: string
  municipio: string
  uf: string
  email: string
  telefone: string
  situacao: string
}

export interface CepData {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
}

export const consultasApi = {
  cnpj: async (cnpj: string): Promise<CnpjData> => {
    const authHeaders = await getAuthHeader()
    const response = await fetch(`${API_URL}/api/consultas/cnpj/${cnpj}`, {
      headers: { ...authHeaders },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Erro ao consultar CNPJ",
      }))
      throw new Error(error.message || "CNPJ não encontrado")
    }

    return response.json()
  },

  cep: async (cep: string): Promise<CepData> => {
    const authHeaders = await getAuthHeader()
    const response = await fetch(`${API_URL}/api/consultas/cep/${cep}`, {
      headers: { ...authHeaders },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Erro ao consultar CEP",
      }))
      throw new Error(error.message || "CEP não encontrado")
    }

    return response.json()
  },
}
