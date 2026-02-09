import { SupabaseClient } from '@supabase/supabase-js';
import {
  ListDivergenciasQuery,
  DivergenciaResponseDTO,
  PaginatedDivergenciaResponseDTO,
} from '../../dtos/inventario/DivergenciaDTO.js';

export class ListDivergenciasUseCase {
  constructor(private readonly supabase: SupabaseClient) {}

  async execute(idInventario: number, query: ListDivergenciasQuery): Promise<PaginatedDivergenciaResponseDTO> {
    const { idSetor, status, page, limit } = query;
    const offset = (page - 1) * limit;

    // Build the divergencias query using raw SQL via RPC or a view
    // We compare inventarios_produtos.saldo vs sum(inventarios_contagens.quantidade)
    let filterClause = '';
    const params: any[] = [idInventario, limit, offset];
    let paramIndex = 4;

    if (idSetor) {
      filterClause += ` AND s.id = $${paramIndex}`;
      params.push(idSetor);
      paramIndex++;
    }

    if (status === 'reconferido') {
      filterClause += ` AND COALESCE(contagens.reconferido, false) = true`;
    } else if (status === 'pendente') {
      filterClause += ` AND COALESCE(contagens.reconferido, false) = false`;
    }

    const sql = `
      WITH contagens AS (
        SELECT
          ic.id_produto,
          ic.id_inventario_setor,
          SUM(ic.quantidade) as qtd_contada,
          BOOL_OR(COALESCE(ic.reconferido, false)) as reconferido
        FROM inventarios_contagens ic
        INNER JOIN setores s ON s.id = ic.id_inventario_setor
        WHERE s.id_inventario = $1
        ${idSetor ? `AND s.id = $${paramIndex - 1}` : ''}
        GROUP BY ic.id_produto, ic.id_inventario_setor
      ),
      divergencias AS (
        SELECT
          p.id as id_produto,
          p.codigo_barras,
          p.descricao,
          s.id as id_setor,
          s.descricao as descricao_setor,
          COALESCE(p.saldo, 0)::numeric as qtd_esperada,
          COALESCE(contagens.qtd_contada, 0)::numeric as qtd_contada,
          (COALESCE(contagens.qtd_contada, 0) - COALESCE(p.saldo, 0))::numeric as diferenca,
          COALESCE(contagens.reconferido, false) as reconferido
        FROM contagens
        INNER JOIN inventarios_produtos p ON p.id = contagens.id_produto AND p.id_inventario = $1
        INNER JOIN setores s ON s.id = contagens.id_inventario_setor
        WHERE COALESCE(contagens.qtd_contada, 0) != COALESCE(p.saldo, 0)
        ${status === 'reconferido' ? 'AND COALESCE(contagens.reconferido, false) = true' : ''}
        ${status === 'pendente' ? 'AND COALESCE(contagens.reconferido, false) = false' : ''}
      )
      SELECT *, (SELECT COUNT(*) FROM divergencias) as total_count
      FROM divergencias
      ORDER BY ABS(diferenca) DESC
      LIMIT $2 OFFSET $3
    `;

    const { data, error } = await this.supabase.rpc('execute_raw_sql', {
      query_text: sql,
      query_params: [idInventario, limit, offset],
    });

    // Fallback: use direct Supabase queries if RPC doesn't exist
    // Build it with simpler approach using two queries
    if (error) {
      return this.executeFallback(idInventario, query);
    }

    const rows = data || [];
    const totalCount = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;

    return {
      data: rows.map((row: any) => ({
        idProduto: row.id_produto,
        codigoBarras: row.codigo_barras,
        descricao: row.descricao,
        idSetor: row.id_setor,
        descricaoSetor: row.descricao_setor,
        qtdEsperada: parseFloat(row.qtd_esperada),
        qtdContada: parseFloat(row.qtd_contada),
        diferenca: parseFloat(row.diferenca),
        reconferido: row.reconferido,
      })),
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  private async executeFallback(idInventario: number, query: ListDivergenciasQuery): Promise<PaginatedDivergenciaResponseDTO> {
    const { idSetor, status, page, limit } = query;
    const offset = (page - 1) * limit;

    // Get all setores for this inventario
    let setorQuery = this.supabase
      .from('setores')
      .select('id, descricao, prefixo, inicio, termino')
      .eq('id_inventario', idInventario);

    if (idSetor) {
      setorQuery = setorQuery.eq('id', idSetor);
    }

    const { data: setores } = await setorQuery;
    if (!setores || setores.length === 0) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    const setorIds = setores.map(s => s.id);
    const setorMap = new Map(setores.map(s => [s.id, s]));

    // Get all contagens grouped by produto+setor
    const { data: contagens } = await this.supabase
      .from('inventarios_contagens')
      .select('id_produto, id_inventario_setor, quantidade, reconferido')
      .in('id_inventario_setor', setorIds);

    if (!contagens || contagens.length === 0) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    // Aggregate contagens by produto+setor
    const aggregated = new Map<string, { idProduto: number; idSetor: number; qtdContada: number; reconferido: boolean }>();
    for (const c of contagens) {
      const key = `${c.id_produto}-${c.id_inventario_setor}`;
      const existing = aggregated.get(key);
      if (existing) {
        existing.qtdContada += Number(c.quantidade);
        if (c.reconferido) existing.reconferido = true;
      } else {
        aggregated.set(key, {
          idProduto: c.id_produto,
          idSetor: c.id_inventario_setor,
          qtdContada: Number(c.quantidade),
          reconferido: c.reconferido || false,
        });
      }
    }

    // Get product details
    const produtoIds = [...new Set([...aggregated.values()].map(a => a.idProduto))];
    const { data: produtos } = await this.supabase
      .from('inventarios_produtos')
      .select('id, codigo_barras, descricao, saldo')
      .eq('id_inventario', idInventario)
      .in('id', produtoIds);

    const produtoMap = new Map((produtos || []).map(p => [p.id, p]));

    // Calculate divergencias
    const divergencias: DivergenciaResponseDTO[] = [];
    for (const agg of aggregated.values()) {
      const produto = produtoMap.get(agg.idProduto);
      if (!produto) continue;

      const qtdEsperada = Number(produto.saldo || 0);
      const diferenca = agg.qtdContada - qtdEsperada;
      if (diferenca === 0) continue;

      if (status === 'reconferido' && !agg.reconferido) continue;
      if (status === 'pendente' && agg.reconferido) continue;

      const setor = setorMap.get(agg.idSetor);
      divergencias.push({
        idProduto: agg.idProduto,
        codigoBarras: produto.codigo_barras,
        descricao: produto.descricao,
        idSetor: agg.idSetor,
        descricaoSetor: setor?.descricao || null,
        qtdEsperada,
        qtdContada: agg.qtdContada,
        diferenca,
        reconferido: agg.reconferido,
      });
    }

    // Sort by absolute difference descending
    divergencias.sort((a, b) => Math.abs(b.diferenca) - Math.abs(a.diferenca));

    const total = divergencias.length;
    const paged = divergencias.slice(offset, offset + limit);

    return {
      data: paged,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
