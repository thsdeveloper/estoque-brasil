"use client"

import { Badge } from "@/shared/components/ui/badge"
import type { Role } from "../types"

interface UserRoleBadgesProps {
  roles: Role[]
}

const roleColorMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  admin: "destructive",
  gerente: "default",
  operador: "secondary",
  visualizador: "outline",
}

export function UserRoleBadges({ roles }: UserRoleBadgesProps) {
  if (!roles || roles.length === 0) {
    return <span className="text-muted-foreground text-sm">Sem roles</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <Badge
          key={role.id}
          variant={roleColorMap[role.name] || "outline"}
        >
          {role.displayName}
        </Badge>
      ))}
    </div>
  )
}
