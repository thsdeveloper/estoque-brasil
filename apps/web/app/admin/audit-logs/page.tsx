import { Card, CardContent } from "@/shared/components/ui/card"
import { AuditLogsTable } from "@/features/audit-logs/components/AuditLogsTable"

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Log de Auditoria</h1>
        <p className="text-gray-light">
          Registros de todas as ações realizadas no sistema
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <AuditLogsTable />
        </CardContent>
      </Card>
    </div>
  )
}
