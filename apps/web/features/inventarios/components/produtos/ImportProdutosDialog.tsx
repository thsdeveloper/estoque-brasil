"use client"

import { useState, useCallback, useRef } from "react"
import {
  Upload,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  Loader2,
  FileSpreadsheet,
  Columns3,
  Eye,
  X,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { Label } from "@/shared/components/ui/label"
import {
  type FileAnalysis,
  type ProductField,
  type ColumnMapping,
  analyzeFile,
  convertRowsToProducts,
  detectCentavosFormat,
  FIELD_LABELS,
} from "../../utils/smart-file-parser"
import { inventariosApi } from "../../api/inventarios-api"

interface ImportProdutosDialogProps {
  inventarioId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type Step = "upload" | "mapping" | "preview" | "importing" | "result"

interface ImportResult {
  importados: number
  erros: { linha: number; erro: string }[]
}

export function ImportProdutosDialog({
  inventarioId,
  open,
  onOpenChange,
  onSuccess,
}: ImportProdutosDialogProps) {
  const [step, setStep] = useState<Step>("upload")
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const reset = useCallback(() => {
    setStep("upload")
    setAnalysis(null)
    setAnalyzing(false)
    setAnalyzeError(null)
    setImportResult(null)
    setImportProgress(0)
  }, [])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) reset()
      onOpenChange(open)
    },
    [onOpenChange, reset]
  )

  const processFile = useCallback(async (file: File) => {
    setAnalyzing(true)
    setAnalyzeError(null)
    try {
      const result = await analyzeFile(file)
      setAnalysis(result)
      setStep("mapping")
    } catch (err) {
      setAnalyzeError(
        err instanceof Error ? err.message : "Erro ao analisar o arquivo"
      )
    } finally {
      setAnalyzing(false)
    }
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleColumnChange = useCallback(
    (columnIndex: number, field: ProductField) => {
      if (!analysis) return
      const newColumns = analysis.columns.map((col) =>
        col.index === columnIndex
          ? { ...col, mappedField: field, confidence: 100 }
          : col
      )
      const custoCol = newColumns.find((c) => c.mappedField === "custo")
      const custoInCentavos =
        custoCol
          ? detectCentavosFormat(analysis.allRows, custoCol.index)
          : false
      setAnalysis({
        ...analysis,
        columns: newColumns,
        custoInCentavos,
      })
    },
    [analysis]
  )

  const hasDescricaoMapped = analysis?.columns.some(
    (col) => col.mappedField === "descricao"
  )

  const handleImport = useCallback(async () => {
    if (!analysis) return

    setStep("importing")
    setImportProgress(0)

    try {
      const products = convertRowsToProducts(analysis.allRows, analysis.columns)

      if (products.length === 0) {
        setImportResult({ importados: 0, erros: [{ linha: 0, erro: "Nenhum produto válido encontrado no arquivo" }] })
        setStep("result")
        return
      }

      const CHUNK_SIZE = 1000
      const totalChunks = Math.ceil(products.length / CHUNK_SIZE)
      let totalImportados = 0
      const todosErros: { linha: number; erro: string }[] = []

      for (let i = 0; i < totalChunks; i++) {
        const chunk = products.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
        const offsetLinha = i * CHUNK_SIZE

        try {
          const result = await inventariosApi.importProdutos(inventarioId, chunk)
          totalImportados += result.importados
          for (const erro of result.erros) {
            todosErros.push({ linha: erro.linha + offsetLinha, erro: erro.erro })
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : (err as any)?.message || "Erro ao importar chunk"
          todosErros.push({ linha: offsetLinha + 1, erro: `Falha no lote ${i + 1}: ${msg}` })
        }

        setImportProgress(Math.round(((i + 1) / totalChunks) * 100))
      }

      setImportResult({ importados: totalImportados, erros: todosErros })
      setStep("result")

      if (totalImportados > 0) {
        onSuccess()
      }
    } catch (err) {
      setImportResult({
        importados: 0,
        erros: [
          {
            linha: 0,
            erro: err instanceof Error ? err.message : "Erro ao importar produtos",
          },
        ],
      })
      setStep("result")
    }
  }, [analysis, inventarioId, onSuccess])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Produtos
          </DialogTitle>
          <DialogDescription>
            {step === "upload" && "Selecione um arquivo CSV, TXT ou similar para importar"}
            {step === "mapping" && "Verifique o mapeamento das colunas detectadas"}
            {step === "preview" && "Confira os dados antes de importar"}
            {step === "importing" && "Importando produtos..."}
            {step === "result" && "Resultado da importação"}
          </DialogDescription>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 px-1">
          {[
            { key: "upload", label: "Arquivo", icon: Upload },
            { key: "mapping", label: "Colunas", icon: Columns3 },
            { key: "preview", label: "Preview", icon: Eye },
            { key: "result", label: "Resultado", icon: Check },
          ].map((s, i) => {
            const Icon = s.icon
            const isActive = step === s.key || (step === "importing" && s.key === "result")
            const isPast =
              (step === "mapping" && i === 0) ||
              (step === "preview" && i <= 1) ||
              ((step === "importing" || step === "result") && i <= 2)

            return (
              <div key={s.key} className="flex items-center gap-2 flex-1">
                <div
                  className={`flex items-center gap-1.5 text-xs font-medium ${
                    isActive
                      ? "text-brand-orange"
                      : isPast
                        ? "text-emerald-600"
                        : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isActive
                        ? "bg-brand-orange/10 text-brand-orange"
                        : isPast
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isPast ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < 3 && (
                  <div
                    className={`flex-1 h-px ${
                      isPast ? "bg-emerald-300" : "bg-border"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Content area with scroll */}
        <div className="flex-1 overflow-y-auto min-h-0 py-2">
          {/* STEP: Upload */}
          {step === "upload" && (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver
                    ? "border-brand-orange bg-brand-orange/5"
                    : "border-border hover:border-brand-orange/50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {analyzing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 text-brand-orange animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Analisando arquivo...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                      <Upload className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Arraste um arquivo aqui ou clique para selecionar
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Suporta CSV, TXT, TSV com qualquer delimitador e formato de colunas
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Selecionar arquivo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.txt,.tsv,.tab"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                )}
              </div>

              {analyzeError && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  {analyzeError}
                </div>
              )}
            </div>
          )}

          {/* STEP: Mapping */}
          {step === "mapping" && analysis && (
            <div className="space-y-4">
              {/* File info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <InfoCard label="Tipo" value={analysis.fileType} />
                <InfoCard label="Delimitador" value={analysis.delimiterLabel} />
                <InfoCard label="Linhas" value={String(analysis.totalRows)} />
                <InfoCard label="Colunas" value={String(analysis.totalColumns)} />
              </div>

              {/* Column mapping */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Mapeamento de colunas
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  O sistema detectou automaticamente as colunas. Ajuste se necessário.
                </p>
                <div className="space-y-2">
                  {analysis.columns.map((col) => (
                    <div
                      key={col.index}
                      className="flex items-center gap-3 p-2 rounded-md border bg-white"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {col.originalName}
                          </span>
                          {col.confidence > 0 && col.confidence < 100 && (
                            <Badge
                              variant={
                                col.confidence >= 75
                                  ? "success"
                                  : col.confidence >= 50
                                    ? "warning"
                                    : "secondary"
                              }
                              className="text-[10px] px-1.5 py-0"
                            >
                              {col.confidence}%
                            </Badge>
                          )}
                        </div>
                        {col.sampleValues.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            Ex: {col.sampleValues.slice(0, 3).join(", ")}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="w-44 shrink-0">
                        <Select
                          value={col.mappedField}
                          onValueChange={(value) =>
                            handleColumnChange(col.index, value as ProductField)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(FIELD_LABELS).map(([field, label]) => (
                              <SelectItem key={field} value={field}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {!hasDescricaoMapped && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-warning/10 text-amber-700 text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  O campo &quot;Descrição&quot; é obrigatório. Mapeie pelo menos uma coluna para ele.
                </div>
              )}
            </div>
          )}

          {/* STEP: Preview */}
          {step === "preview" && analysis && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Preview dos primeiros registros que serão importados:
              </p>

              <div className="overflow-x-auto border rounded-md">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted">
                      <th className="p-2 text-left font-medium text-muted-foreground">
                        #
                      </th>
                      {analysis.columns
                        .filter((c) => c.mappedField !== "ignorar")
                        .map((col) => (
                          <th
                            key={col.index}
                            className="p-2 text-left font-medium"
                          >
                            {FIELD_LABELS[col.mappedField]}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.previewRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-t">
                        <td className="p-2 text-muted-foreground">
                          {rowIdx + 1}
                        </td>
                        {analysis.columns
                          .filter((c) => c.mappedField !== "ignorar")
                          .map((col) => {
                            let displayValue = row[col.index] || "-"
                            if (
                              col.mappedField === "custo" &&
                              analysis.custoInCentavos &&
                              displayValue !== "-"
                            ) {
                              const num = Number(displayValue) / 100
                              displayValue = num.toFixed(2).replace(".", ",")
                            }
                            return (
                              <td key={col.index} className="p-2 max-w-48 truncate">
                                {displayValue}
                              </td>
                            )
                          })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {analysis.custoInCentavos && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 text-amber-700 text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  Valores de custo detectados em centavos (ex: 3796 = R$ 37,96). Os valores serão divididos por 100 automaticamente.
                </div>
              )}

              <div className="flex items-center gap-2 p-3 rounded-md bg-blue-50 text-blue-700 text-sm">
                <FileSpreadsheet className="h-4 w-4 shrink-0" />
                {analysis.totalRows} produtos serão importados para este inventário.
              </div>
            </div>
          )}

          {/* STEP: Importing */}
          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <Loader2 className="h-10 w-10 text-brand-orange animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium">Importando produtos...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {importProgress}% concluído
                </p>
              </div>
              <div className="w-64">
                <Progress value={importProgress} />
              </div>
            </div>
          )}

          {/* STEP: Result */}
          {step === "result" && importResult && (
            <div className="space-y-4">
              {importResult.importados > 0 ? (
                <div className="flex flex-col items-center py-6 gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <Check className="h-7 w-7 text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">
                      {importResult.importados} produtos importados
                    </p>
                    {importResult.erros.length > 0 && (
                      <p className="text-sm text-amber-600 mt-1">
                        {importResult.erros.length} linhas com erro
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                    <X className="h-7 w-7 text-destructive" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-destructive">
                      Falha na importação
                    </p>
                  </div>
                </div>
              )}

              {importResult.erros.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  <div className="p-2 bg-muted text-xs font-medium">
                    Erros encontrados
                  </div>
                  {importResult.erros.slice(0, 50).map((err, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 border-t text-xs">
                      <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                      <span>
                        {err.linha > 0 && (
                          <span className="font-medium">Linha {err.linha}: </span>
                        )}
                        {err.erro}
                      </span>
                    </div>
                  ))}
                  {importResult.erros.length > 50 && (
                    <div className="p-2 border-t text-xs text-muted-foreground text-center">
                      ... e mais {importResult.erros.length - 50} erros
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with navigation */}
        <DialogFooter className="gap-2 sm:gap-0">
          {step === "mapping" && (
            <>
              <Button variant="outline" size="sm" onClick={reset}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button
                size="sm"
                disabled={!hasDescricaoMapped}
                onClick={() => setStep("preview")}
              >
                Preview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep("mapping")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button size="sm" onClick={handleImport}>
                <Upload className="mr-2 h-4 w-4" />
                Importar {analysis?.totalRows} produtos
              </Button>
            </>
          )}

          {step === "result" && (
            <Button
              size="sm"
              onClick={() => handleOpenChange(false)}
            >
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-2">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  )
}
