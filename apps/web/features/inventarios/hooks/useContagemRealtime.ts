"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const TIMELINE_MAX_POINTS = 1440 // full day (1 point per minute)
const RECENT_EVENTS_MAX = 50
const HEARTBEAT_TIMEOUT_MS = 45_000 // 30s heartbeat + 15s grace
const MAX_RECONNECT_DELAY_MS = 30_000

export interface SectorStats {
  id: number
  descricao: string | null
  prefixo: string | null
  inicio: number
  termino: number
  total_contagens: number
  total_quantidade: number
  ultima_contagem: string | null
}

export interface TimelinePoint {
  minuto: string
  contagens_no_minuto: number
  quantidade_no_minuto: number
}

export interface ContagemEvent {
  id: number
  idInventarioSetor: number
  idProduto: number
  quantidade: number
  data: string
  lote: string | null
  validade: string | null
  divergente: boolean
  idUsuario: string | null
  operadorNome: string | null
}

export interface OperatorStats {
  user_id: string
  full_name: string
  email: string
  avatar_url: string | null
  total_contagens: number
  total_quantidade: number
  ultima_contagem: string
  setor_atual_id: number | null
  setor_atual_descricao: string
}

interface UseContagemRealtimeReturn {
  sectors: SectorStats[]
  timeline: TimelinePoint[]
  recentEvents: ContagemEvent[]
  operators: OperatorStats[]
  totalContagens: number
  totalQuantidade: number
  setoresAtivos: number
  operadoresAtivos: number
  isConnected: boolean
  error: string | null
}

export function useContagemRealtime(inventarioId: number): UseContagemRealtimeReturn {
  const [sectors, setSectors] = useState<SectorStats[]>([])
  const [timeline, setTimeline] = useState<TimelinePoint[]>([])
  const [recentEvents, setRecentEvents] = useState<ContagemEvent[]>([])
  const [operators, setOperators] = useState<OperatorStats[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectAttemptRef = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heartbeatTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetHeartbeatTimer = useCallback(() => {
    if (heartbeatTimeoutRef.current) clearTimeout(heartbeatTimeoutRef.current)
    heartbeatTimeoutRef.current = setTimeout(() => {
      // No heartbeat received — reconnect
      eventSourceRef.current?.close()
      setIsConnected(false)
    }, HEARTBEAT_TIMEOUT_MS)
  }, [])

  const connect = useCallback(async () => {
    // Get token
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setError("Sessão expirada")
      return
    }

    // Close existing connection
    eventSourceRef.current?.close()

    const url = `${API_URL}/api/inventarios/${inventarioId}/contagens/stream?token=${encodeURIComponent(session.access_token)}`
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.addEventListener("snapshot", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as {
          sectors: SectorStats[]
          timeline: TimelinePoint[]
          operators: OperatorStats[]
        }
        setSectors(data.sectors)
        setTimeline(data.timeline.slice(-TIMELINE_MAX_POINTS))
        setOperators(data.operators || [])
        setIsConnected(true)
        setError(null)
        reconnectAttemptRef.current = 0
        resetHeartbeatTimer()
      } catch {
        // Invalid JSON
      }
    })

    es.addEventListener("contagem", (e: MessageEvent) => {
      try {
        const contagem = JSON.parse(e.data) as ContagemEvent
        resetHeartbeatTimer()

        // Update sector stats incrementally
        setSectors((prev) =>
          prev.map((s) =>
            s.id === contagem.idInventarioSetor
              ? {
                  ...s,
                  total_contagens: s.total_contagens + 1,
                  total_quantidade: s.total_quantidade + contagem.quantidade,
                  ultima_contagem: contagem.data,
                }
              : s
          )
        )

        // Update timeline: add to current minute or create new point
        setTimeline((prev) => {
          const now = new Date(contagem.data)
          const minuteKey = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            now.getHours(),
            now.getMinutes()
          ).toISOString()

          const lastPoint = prev[prev.length - 1]
          if (lastPoint && lastPoint.minuto === minuteKey) {
            const updated = [...prev]
            updated[updated.length - 1] = {
              ...lastPoint,
              contagens_no_minuto: lastPoint.contagens_no_minuto + 1,
              quantidade_no_minuto: lastPoint.quantidade_no_minuto + contagem.quantidade,
            }
            return updated
          }

          const newPoint: TimelinePoint = {
            minuto: minuteKey,
            contagens_no_minuto: 1,
            quantidade_no_minuto: contagem.quantidade,
          }
          return [...prev, newPoint].slice(-TIMELINE_MAX_POINTS)
        })

        // Add to recent events
        setRecentEvents((prev) => [contagem, ...prev].slice(0, RECENT_EVENTS_MAX))

        // Update operators incrementally
        if (contagem.idUsuario) {
          setOperators((prev) => {
            const existing = prev.find((op) => op.user_id === contagem.idUsuario)
            if (existing) {
              return prev.map((op) =>
                op.user_id === contagem.idUsuario
                  ? {
                      ...op,
                      total_contagens: op.total_contagens + 1,
                      total_quantidade: op.total_quantidade + contagem.quantidade,
                      ultima_contagem: contagem.data,
                      setor_atual_id: contagem.idInventarioSetor,
                    }
                  : op
              )
            }
            // New operator — add with basic info
            return [
              {
                user_id: contagem.idUsuario!,
                full_name: contagem.operadorNome || "Operador",
                email: "",
                avatar_url: null,
                total_contagens: 1,
                total_quantidade: contagem.quantidade,
                ultima_contagem: contagem.data,
                setor_atual_id: contagem.idInventarioSetor,
                setor_atual_descricao: "",
              },
              ...prev,
            ]
          })
        }
      } catch {
        // Invalid JSON
      }
    })

    es.addEventListener("heartbeat", () => {
      resetHeartbeatTimer()
    })

    es.addEventListener("error", () => {
      // EventSource error — will auto-close, trigger reconnect
    })

    es.onerror = () => {
      es.close()
      setIsConnected(false)

      // Exponential backoff reconnect
      const attempt = reconnectAttemptRef.current++
      const delay = Math.min(1000 * Math.pow(2, attempt), MAX_RECONNECT_DELAY_MS)

      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, delay)
    }
  }, [inventarioId, resetHeartbeatTimer])

  useEffect(() => {
    connect()

    return () => {
      eventSourceRef.current?.close()
      eventSourceRef.current = null
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (heartbeatTimeoutRef.current) clearTimeout(heartbeatTimeoutRef.current)
    }
  }, [connect])

  const totalContagens = useMemo(
    () => sectors.reduce((sum, s) => sum + s.total_contagens, 0),
    [sectors]
  )

  const totalQuantidade = useMemo(
    () => sectors.reduce((sum, s) => sum + s.total_quantidade, 0),
    [sectors]
  )

  const setoresAtivos = useMemo(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return sectors.filter(
      (s) => s.ultima_contagem && new Date(s.ultima_contagem) > fiveMinutesAgo
    ).length
  }, [sectors])

  const operadoresAtivos = useMemo(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return operators.filter(
      (op) => op.ultima_contagem && new Date(op.ultima_contagem) > fiveMinutesAgo
    ).length
  }, [operators])

  return {
    sectors,
    timeline,
    recentEvents,
    operators,
    totalContagens,
    totalQuantidade,
    setoresAtivos,
    operadoresAtivos,
    isConnected,
    error,
  }
}
