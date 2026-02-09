"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, ShieldCheck, ChevronDown, ChevronRight } from "lucide-react"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { policiesApi } from "@/features/access/api/access-api"
import { rolesApi, type ApiError } from "../api/roles-api"
import type { AccessPolicy } from "@estoque-brasil/types"

interface RolePoliciesSelectorProps {
  roleId?: string
  readonly?: boolean
  onUpdate?: () => void
  onSelectionChange?: (policyIds: string[]) => void
}

export function RolePoliciesSelector({
  roleId,
  readonly = false,
  onUpdate,
  onSelectionChange,
}: RolePoliciesSelectorProps) {
  const [allPolicies, setAllPolicies] = useState<AccessPolicy[]>([])
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<Set<string>>(new Set())
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [initialPolicyIds, setInitialPolicyIds] = useState<Set<string>>(new Set())

  const isControlled = !!onSelectionChange

  useEffect(() => {
    async function fetchData() {
      try {
        if (roleId) {
          const [policies, rolePolicyIds] = await Promise.all([
            policiesApi.list(),
            rolesApi.getPolicies(roleId),
          ])
          setAllPolicies(policies)
          const ids = new Set(rolePolicyIds)
          setSelectedPolicyIds(ids)
          setInitialPolicyIds(ids)
        } else {
          const policies = await policiesApi.list()
          setAllPolicies(policies)
        }
      } catch (err) {
        setError("Erro ao carregar políticas")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [roleId])

  const handleTogglePolicy = useCallback((policyId: string) => {
    setSelectedPolicyIds((prev) => {
      const next = new Set(prev)
      if (next.has(policyId)) {
        next.delete(policyId)
      } else {
        next.add(policyId)
      }
      if (onSelectionChange) {
        onSelectionChange(Array.from(next))
      }
      return next
    })
    setHasChanges(true)
  }, [onSelectionChange])

  const handleToggleExpand = useCallback((policyId: string) => {
    setExpandedPolicies((prev) => {
      const next = new Set(prev)
      if (next.has(policyId)) {
        next.delete(policyId)
      } else {
        next.add(policyId)
      }
      return next
    })
  }, [])

  const handleSave = async () => {
    if (!roleId) return
    setSaving(true)
    setError(null)

    try {
      await rolesApi.setPolicies(roleId, {
        policyIds: Array.from(selectedPolicyIds),
      })
      setInitialPolicyIds(new Set(selectedPolicyIds))
      setHasChanges(false)
      onUpdate?.()
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || "Erro ao salvar políticas")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = useCallback(() => {
    setSelectedPolicyIds(new Set(initialPolicyIds))
    setHasChanges(false)
    if (onSelectionChange) {
      onSelectionChange(Array.from(initialPolicyIds))
    }
  }, [initialPolicyIds, onSelectionChange])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {allPolicies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Nenhuma política disponível
          </div>
        ) : (
          allPolicies.map((policy) => {
            const isSelected = selectedPolicyIds.has(policy.id)
            const isExpanded = expandedPolicies.has(policy.id)
            const permCount = policy.permissions?.length ?? 0

            return (
              <div
                key={policy.id}
                className={`border rounded-lg transition-colors ${
                  isSelected ? "border-primary/50 bg-primary/5" : ""
                }`}
              >
                <div className="flex items-center gap-3 p-3">
                  {!readonly && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleTogglePolicy(policy.id)}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{policy.displayName}</span>
                      {policy.isSystemPolicy && (
                        <Badge variant="secondary" className="text-xs">Sistema</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {permCount} permissões
                      </Badge>
                    </div>
                    {policy.description && (
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {policy.description}
                      </p>
                    )}
                  </div>
                  {permCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleExpand(policy.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                {isExpanded && policy.permissions && policy.permissions.length > 0 && (
                  <div className="px-3 pb-3 pt-0">
                    <div className="bg-muted/50 rounded p-2">
                      <div className="flex flex-wrap gap-1">
                        {policy.permissions.map((perm) => (
                          <Badge key={perm.id} variant="outline" className="text-xs font-mono">
                            {perm.resource}:{perm.action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {!readonly && !isControlled && roleId && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedPolicyIds.size} políticas selecionadas
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || saving}
            >
              Desfazer Alterações
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Políticas
            </Button>
          </div>
        </div>
      )}

      {!readonly && isControlled && (
        <p className="text-sm text-muted-foreground">
          {selectedPolicyIds.size} políticas selecionadas
        </p>
      )}
    </div>
  )
}
