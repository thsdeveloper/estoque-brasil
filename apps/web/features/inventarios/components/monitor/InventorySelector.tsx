"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Tipo do inventário com relações
interface InventarioWithRelations {
  id: number
  data_inicio: string
  data_termino: string | null
  ativo: boolean
  lojas: { nome: string } | null
  empresas: { nome_fantasia: string | null; razao_social: string | null } | null
}

interface InventorySelectorProps {
  value: number | null
  onChange: (id: number | null) => void
}

export function InventorySelector({ value, onChange }: InventorySelectorProps) {
  const [inventarios, setInventarios] = useState<InventarioWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function fetchInventarios() {
      try {
        const supabase = createClient()
        const { data, error: supabaseError } = await supabase
          .from("inventarios")
          .select(`
            id,
            data_inicio,
            data_termino,
            ativo,
            lojas (nome),
            empresas (nome_fantasia, razao_social)
          `)
          .eq("ativo", true)
          .order("created_at", { ascending: false })
          .limit(100)

        if (supabaseError) {
          throw supabaseError
        }

        setInventarios((data as unknown as InventarioWithRelations[]) || [])
      } catch (err) {
        console.error("Erro ao buscar inventários:", err)
        setError("Erro ao carregar inventários")
      } finally {
        setLoading(false)
      }
    }
    fetchInventarios()
  }, [])

  const selectedInventario = inventarios.find((inv) => inv.id === value)

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg">
        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
        <span className="text-sm text-zinc-500">Carregando inventários...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
        <span className="text-sm text-red-600">{error}</span>
      </div>
    )
  }

  if (inventarios.length === 0) {
    return (
      <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
        <span className="text-sm text-amber-700">Nenhum inventário ativo encontrado</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 w-full min-w-[280px] px-4 py-2.5 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${selectedInventario ? "bg-green-500" : "bg-zinc-300"}`} />
          <span className="text-sm font-medium text-zinc-700">
            {selectedInventario
              ? `${selectedInventario.lojas?.nome || `Inventário #${selectedInventario.id}`}`
              : "Selecione um inventário"
            }
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white border border-zinc-200 rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
            {inventarios.map((inv) => (
              <button
                key={inv.id}
                type="button"
                onClick={() => {
                  onChange(inv.id)
                  setIsOpen(false)
                }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-zinc-50 transition-colors ${
                  value === inv.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-700 truncate">
                    {inv.lojas?.nome || `Inventário #${inv.id}`}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    {inv.empresas?.nome_fantasia || inv.empresas?.razao_social || "Empresa não informada"}
                  </p>
                </div>
                <span className="text-xs text-zinc-400">
                  {new Date(inv.data_inicio).toLocaleDateString("pt-BR")}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
