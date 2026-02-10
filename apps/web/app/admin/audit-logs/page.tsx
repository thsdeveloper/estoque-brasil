import { AuditLogsTable } from "@/features/audit-logs/components/AuditLogsTable"

export default function AuditLogsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Log de Auditoria</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Registros de todas as acoes realizadas no sistema
        </p>
      </div>
      <AuditLogsTable />
    </div>
  )
}
