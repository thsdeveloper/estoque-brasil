"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react"
import type { Empresa } from "@estoque-brasil/types"
import { empresasApi } from "../api/empresas-api"

const STORAGE_KEY = "empresa-selecionada"

interface EmpresaContextValue {
  empresas: Empresa[]
  selectedEmpresa: Empresa | null
  selectedEmpresaId: number | null
  loading: boolean
  selectEmpresa: (id: number) => void
}

const EmpresaContext = createContext<EmpresaContextValue | null>(null)

interface EmpresaProviderProps {
  children: ReactNode
}

export function EmpresaProvider({ children }: EmpresaProviderProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | null>(
    null
  )
  const [loading, setLoading] = useState(true)

  // Restore from localStorage immediately on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = parseInt(saved, 10)
      if (!isNaN(parsed)) {
        setSelectedEmpresaId(parsed)
      }
    }
  }, [])

  // Fetch empresas list and saved preference from API
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [empresasList, savedPref] = await Promise.all([
          empresasApi.getMyEmpresas(),
          empresasApi.getSelectedEmpresa(),
        ])

        if (cancelled) return

        setEmpresas(empresasList)

        // Determine which empresa to select
        const savedId = savedPref?.idEmpresa
        const localId = localStorage.getItem(STORAGE_KEY)
        const localParsed = localId ? parseInt(localId, 10) : null

        if (savedId && empresasList.some((e) => e.id === savedId)) {
          setSelectedEmpresaId(savedId)
          localStorage.setItem(STORAGE_KEY, String(savedId))
        } else if (
          localParsed &&
          empresasList.some((e) => e.id === localParsed)
        ) {
          // localStorage value is valid, keep it
          setSelectedEmpresaId(localParsed)
        } else if (empresasList.length === 1) {
          // Auto-select if only one empresa
          const onlyId = empresasList[0].id
          setSelectedEmpresaId(onlyId)
          localStorage.setItem(STORAGE_KEY, String(onlyId))
          empresasApi.setSelectedEmpresa(onlyId).catch(() => {})
        }
      } catch {
        // Keep any localStorage-restored selection
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const selectEmpresa = useCallback(
    (id: number) => {
      setSelectedEmpresaId(id)
      localStorage.setItem(STORAGE_KEY, String(id))
      empresasApi.setSelectedEmpresa(id).catch(() => {})
    },
    []
  )

  const selectedEmpresa =
    empresas.find((e) => e.id === selectedEmpresaId) ?? null

  const value: EmpresaContextValue = {
    empresas,
    selectedEmpresa,
    selectedEmpresaId,
    loading,
    selectEmpresa,
  }

  return (
    <EmpresaContext.Provider value={value}>{children}</EmpresaContext.Provider>
  )
}

export function useEmpresa(): EmpresaContextValue {
  const context = useContext(EmpresaContext)
  if (!context) {
    throw new Error("useEmpresa must be used within an EmpresaProvider")
  }
  return context
}
