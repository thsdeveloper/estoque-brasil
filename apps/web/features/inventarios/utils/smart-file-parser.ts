/**
 * SmartFileParser - Detecção inteligente de arquivos de importação
 *
 * Detecta automaticamente:
 * - Tipo de arquivo (CSV, TXT, TSV)
 * - Delimitador (; , \t | )
 * - Se a primeira linha é cabeçalho
 * - Mapeamento de colunas para campos do produto
 */

// Campos do produto que podem ser mapeados
export type ProductField =
  | "codigoBarras"
  | "codigoInterno"
  | "descricao"
  | "lote"
  | "validade"
  | "saldo"
  | "custo"
  | "ignorar"

export interface ColumnMapping {
  /** Índice da coluna no arquivo */
  index: number
  /** Nome original da coluna (do cabeçalho) */
  originalName: string
  /** Campo mapeado do produto */
  mappedField: ProductField
  /** Confiança do mapeamento (0-100) */
  confidence: number
  /** Amostra de valores dessa coluna */
  sampleValues: string[]
}

export interface FileAnalysis {
  /** Nome do arquivo */
  fileName: string
  /** Tipo detectado */
  fileType: "CSV" | "TXT" | "TSV"
  /** Delimitador detectado */
  delimiter: string
  /** Label amigável do delimitador */
  delimiterLabel: string
  /** Se a primeira linha é cabeçalho */
  hasHeader: boolean
  /** Encoding detectado */
  encoding: string
  /** Total de linhas (excluindo cabeçalho se houver) */
  totalRows: number
  /** Total de colunas detectadas */
  totalColumns: number
  /** Mapeamento de colunas sugerido */
  columns: ColumnMapping[]
  /** Preview das primeiras linhas já parseadas */
  previewRows: string[][]
  /** Linhas raw (todas) */
  allRows: string[][]
}

// Aliases conhecidos para cada campo (português e inglês, abreviações comuns)
const FIELD_ALIASES: Record<ProductField, string[]> = {
  codigoBarras: [
    "codigo_barras", "codigobarras", "cod_barras", "codbarras",
    "codigo de barras", "cod. barras", "cod barras", "barcode",
    "ean", "ean13", "ean_13", "gtin", "codigo_ean", "cod_ean",
    "codigo barras", "codbar", "bar_code", "upc",
  ],
  codigoInterno: [
    "codigo_interno", "codigointerno", "cod_interno", "codinterno",
    "codigo interno", "cod. interno", "cod interno", "sku",
    "codigo_produto", "cod_produto", "codproduto", "codigo produto",
    "cod. produto", "referencia", "ref", "cod_ref", "item",
    "codigo", "cod", "code", "product_code", "internal_code",
  ],
  descricao: [
    "descricao", "descrição", "desc", "descricão",
    "nome", "nome_produto", "nome produto", "product_name",
    "description", "produto", "item_descricao", "item_desc",
    "nome do produto", "denominacao", "denominação",
    "material", "mercadoria",
  ],
  lote: [
    "lote", "lot", "batch", "num_lote", "numero_lote",
    "numero lote", "nr_lote", "nrlote", "lote_numero",
  ],
  validade: [
    "validade", "data_validade", "datavalidade", "dt_validade",
    "vencimento", "data_vencimento", "dt_vencimento", "expiry",
    "expiration", "expiry_date", "valid", "data validade",
    "prazo", "prazo_validade",
  ],
  saldo: [
    "saldo", "quantidade", "qtd", "qtde", "qty", "quantity",
    "estoque", "stock", "saldo_estoque", "quant", "qtd_estoque",
    "quantidade_estoque", "qt", "volume",
  ],
  custo: [
    "custo", "preco", "preço", "preco_custo", "preço_custo",
    "valor", "price", "cost", "unit_price", "vlr", "vl_custo",
    "valor_custo", "preco_unitario", "valor_unitario",
    "vlr_custo", "vl_unitario",
  ],
  ignorar: [],
}

const POSSIBLE_DELIMITERS = [";", ",", "\t", "|"]

const DELIMITER_LABELS: Record<string, string> = {
  ";": "Ponto e vírgula (;)",
  ",": "Vírgula (,)",
  "\t": "Tabulação (Tab)",
  "|": "Pipe (|)",
}

/**
 * Lê o conteúdo de um File como texto
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo"))

    // Tenta detectar encoding - usa UTF-8 por padrão
    reader.readAsText(file, "UTF-8")
  })
}

/**
 * Detecta o delimitador mais provável analisando as primeiras linhas
 */
function detectDelimiter(lines: string[]): string {
  const sampleLines = lines.slice(0, Math.min(20, lines.length))

  // Para cada delimitador, conta quantos campos cada linha teria
  const scores: Record<string, number> = {}

  for (const delimiter of POSSIBLE_DELIMITERS) {
    const counts = sampleLines.map((line) => {
      // Parse respeitando campos entre aspas
      return splitLine(line, delimiter).length
    })

    // Um bom delimitador gera contagens consistentes e > 1
    const uniqueCounts = new Set(counts)
    const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length

    // Score: quanto mais consistente e mais colunas, melhor
    if (avgCount > 1) {
      // Penalizar se contagens não são consistentes
      const consistency = uniqueCounts.size === 1 ? 1 : 1 / uniqueCounts.size
      scores[delimiter] = avgCount * consistency * 10
    } else {
      scores[delimiter] = 0
    }
  }

  // Retorna o delimitador com maior score
  const best = Object.entries(scores).sort(([, a], [, b]) => b - a)[0]
  return best && best[1] > 0 ? best[0] : ";"
}

/**
 * Divide uma linha respeitando campos entre aspas
 */
function splitLine(line: string, delimiter: string): string[] {
  const fields: string[] = []
  let current = ""
  let inQuotes = false
  let quoteChar = ""

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true
      quoteChar = char
      continue
    }

    if (inQuotes && char === quoteChar) {
      // Verifica se é escape (double quote)
      if (i + 1 < line.length && line[i + 1] === quoteChar) {
        current += char
        i++
        continue
      }
      inQuotes = false
      continue
    }

    if (!inQuotes && char === delimiter) {
      fields.push(current.trim())
      current = ""
      continue
    }

    current += char
  }

  fields.push(current.trim())
  return fields
}

/**
 * Detecta se a primeira linha é um cabeçalho
 */
function detectHeader(rows: string[][]): boolean {
  if (rows.length < 2) return false

  const firstRow = rows[0]
  const secondRow = rows[1]

  // Heurísticas:
  // 1. Se a primeira linha tem valores que parecem nomes de campos
  let headerScore = 0

  for (const value of firstRow) {
    const normalized = normalizeString(value)

    // Verifica se o valor se parece com um nome de campo conhecido
    for (const aliases of Object.values(FIELD_ALIASES)) {
      if (aliases.some((alias) => normalized === alias || normalized.includes(alias))) {
        headerScore += 3
        break
      }
    }

    // Valores do cabeçalho geralmente são textos, não números
    if (isNaN(Number(value)) && value.length > 0) {
      headerScore += 1
    }
  }

  // 2. Se a segunda linha tem mais valores numéricos que a primeira
  const firstRowNumericCount = firstRow.filter((v) => !isNaN(Number(v)) && v.length > 0).length
  const secondRowNumericCount = secondRow.filter((v) => !isNaN(Number(v)) && v.length > 0).length

  if (secondRowNumericCount > firstRowNumericCount) {
    headerScore += 2
  }

  return headerScore >= 2
}

/**
 * Normaliza string para comparação (remove acentos, lowercase, etc.)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
}

/**
 * Mapeia colunas para campos do produto usando fuzzy matching
 */
function mapColumns(
  headers: string[],
  dataRows: string[][]
): ColumnMapping[] {
  const sampleRows = dataRows.slice(0, Math.min(10, dataRows.length))

  return headers.map((header, index) => {
    const sampleValues = sampleRows
      .map((row) => row[index] || "")
      .filter((v) => v.length > 0)
      .slice(0, 5)

    // Tenta mapear pelo nome do cabeçalho
    const { field, confidence } = matchFieldByName(header, sampleValues)

    return {
      index,
      originalName: header,
      mappedField: field,
      confidence,
      sampleValues,
    }
  })
}

/**
 * Tenta identificar o campo do produto baseado no nome da coluna e valores
 */
function matchFieldByName(
  headerName: string,
  sampleValues: string[]
): { field: ProductField; confidence: number } {
  const normalized = normalizeString(headerName)

  // 1. Verifica match exato nos aliases
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    if (field === "ignorar") continue

    for (const alias of aliases) {
      if (normalized === alias) {
        return { field: field as ProductField, confidence: 95 }
      }
    }
  }

  // 2. Verifica se o nome contém algum alias
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    if (field === "ignorar") continue

    for (const alias of aliases) {
      if (alias.length >= 3 && (normalized.includes(alias) || alias.includes(normalized))) {
        return { field: field as ProductField, confidence: 75 }
      }
    }
  }

  // 3. Tenta inferir pelo tipo de dados na amostra
  const inferredField = inferFieldByValues(sampleValues)
  if (inferredField) {
    return { field: inferredField, confidence: 50 }
  }

  return { field: "ignorar", confidence: 0 }
}

/**
 * Tenta inferir o tipo de campo analisando os valores
 */
function inferFieldByValues(values: string[]): ProductField | null {
  if (values.length === 0) return null

  // Verifica se são códigos de barras (13 ou 8 dígitos numéricos)
  const allBarcode = values.every((v) => /^\d{8,14}$/.test(v.replace(/\s/g, "")))
  if (allBarcode) return "codigoBarras"

  // Verifica se são datas (formatos comuns)
  const datePatterns = [
    /^\d{2}\/\d{2}\/\d{4}$/,
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{2}-\d{2}-\d{4}$/,
    /^\d{2}\.\d{2}\.\d{4}$/,
  ]
  const allDates = values.every((v) =>
    datePatterns.some((p) => p.test(v.trim()))
  )
  if (allDates) return "validade"

  // Verifica se são números decimais (provavelmente saldo ou custo)
  const allNumbers = values.every((v) => {
    const cleaned = v.replace(/\./g, "").replace(",", ".")
    return !isNaN(Number(cleaned)) && cleaned.length > 0
  })

  if (allNumbers) {
    // Se tem decimais com muitas casas, provavelmente é custo
    const hasDecimals = values.some((v) => v.includes(",") || (v.includes(".") && v.split(".").pop()!.length > 0))
    if (hasDecimals) return "custo"
    return "saldo"
  }

  // Se são textos longos, provavelmente é descrição
  const avgLength = values.reduce((sum, v) => sum + v.length, 0) / values.length
  if (avgLength > 15) return "descricao"

  return null
}

/**
 * Detecta o tipo de arquivo pela extensão
 */
function detectFileType(fileName: string): "CSV" | "TXT" | "TSV" {
  const ext = fileName.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "csv":
      return "CSV"
    case "tsv":
      return "TSV"
    default:
      return "TXT"
  }
}

/**
 * Converte valor de data em diferentes formatos para YYYY-MM-DD
 */
export function parseDateValue(value: string): string | null {
  if (!value || value.trim().length === 0) return null

  const v = value.trim()

  // DD/MM/YYYY
  let match = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (match) return `${match[3]}-${match[2]}-${match[1]}`

  // DD-MM-YYYY
  match = v.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (match) return `${match[3]}-${match[2]}-${match[1]}`

  // DD.MM.YYYY
  match = v.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (match) return `${match[3]}-${match[2]}-${match[1]}`

  // YYYY-MM-DD (já no formato correto)
  match = v.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) return v

  return null
}

/**
 * Converte valor numérico considerando formatação brasileira
 */
export function parseNumberValue(value: string): number {
  if (!value || value.trim().length === 0) return 0

  let cleaned = value.trim()

  // Formato brasileiro: 1.234,56 -> 1234.56
  if (cleaned.includes(",")) {
    // Remove pontos de milhar e troca vírgula por ponto
    cleaned = cleaned.replace(/\./g, "").replace(",", ".")
  }

  const num = Number(cleaned)
  return isNaN(num) ? 0 : Math.max(0, num)
}

/**
 * Analisa um arquivo e retorna a análise completa
 */
export async function analyzeFile(file: File): Promise<FileAnalysis> {
  const content = await readFileAsText(file)
  const fileType = detectFileType(file.name)

  // Divide em linhas, removendo linhas vazias no final
  const lines = content
    .split(/\r?\n/)
    .filter((line, index, arr) => {
      // Remove linhas vazias do final
      if (line.trim().length === 0) {
        return arr.slice(index).some((l) => l.trim().length > 0)
      }
      return true
    })

  if (lines.length === 0) {
    throw new Error("O arquivo está vazio")
  }

  // Detecta delimitador
  const delimiter = detectDelimiter(lines)

  // Parseia todas as linhas
  const allRows = lines.map((line) => splitLine(line, delimiter))

  // Detecta se tem cabeçalho
  const hasHeader = detectHeader(allRows)

  // Gera cabeçalhos
  const headers = hasHeader
    ? allRows[0]
    : allRows[0].map((_, i) => `Coluna ${i + 1}`)

  // Dados sem cabeçalho
  const dataRows = hasHeader ? allRows.slice(1) : allRows

  // Mapeia colunas
  const columns = mapColumns(headers, dataRows)

  // Resolve conflitos de mapeamento (dois campos mapeados para o mesmo campo)
  resolveConflicts(columns)

  return {
    fileName: file.name,
    fileType,
    delimiter,
    delimiterLabel: DELIMITER_LABELS[delimiter] || delimiter,
    hasHeader,
    encoding: "UTF-8",
    totalRows: dataRows.length,
    totalColumns: headers.length,
    columns,
    previewRows: dataRows.slice(0, 5),
    allRows: dataRows,
  }
}

/**
 * Resolve conflitos onde múltiplas colunas foram mapeadas para o mesmo campo
 */
function resolveConflicts(columns: ColumnMapping[]): void {
  const fieldMap = new Map<ProductField, ColumnMapping[]>()

  for (const col of columns) {
    if (col.mappedField === "ignorar") continue
    const existing = fieldMap.get(col.mappedField) || []
    existing.push(col)
    fieldMap.set(col.mappedField, existing)
  }

  for (const [, cols] of fieldMap) {
    if (cols.length > 1) {
      // Mantém o com maior confiança, marca os outros como ignorar
      cols.sort((a, b) => b.confidence - a.confidence)
      for (let i = 1; i < cols.length; i++) {
        cols[i].mappedField = "ignorar"
        cols[i].confidence = 0
      }
    }
  }
}

/**
 * Converte as linhas do arquivo em objetos de produto usando o mapeamento
 */
export function convertRowsToProducts(
  rows: string[][],
  columns: ColumnMapping[]
): Array<{
  codigoBarras?: string | null
  codigoInterno?: string | null
  descricao: string
  lote?: string | null
  validade?: string | null
  saldo?: number
  custo?: number
}> {
  const products = []

  for (const row of rows) {
    const product: Record<string, any> = {}

    for (const col of columns) {
      if (col.mappedField === "ignorar") continue

      const rawValue = row[col.index] || ""

      switch (col.mappedField) {
        case "codigoBarras":
        case "codigoInterno":
        case "lote":
          product[col.mappedField] = rawValue.trim() || null
          break
        case "descricao":
          product[col.mappedField] = rawValue.trim()
          break
        case "validade":
          product[col.mappedField] = parseDateValue(rawValue)
          break
        case "saldo":
        case "custo":
          product[col.mappedField] = parseNumberValue(rawValue)
          break
      }
    }

    // Pula linhas sem descrição
    if (!product.descricao || product.descricao.length === 0) continue

    products.push(product as any)
  }

  return products
}

/**
 * Labels amigáveis para os campos do produto
 */
export const FIELD_LABELS: Record<ProductField, string> = {
  codigoBarras: "Código de Barras",
  codigoInterno: "Código Interno",
  descricao: "Descrição",
  lote: "Lote",
  validade: "Validade",
  saldo: "Saldo/Quantidade",
  custo: "Custo/Preço",
  ignorar: "Ignorar",
}
