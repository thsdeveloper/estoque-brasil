import { SupabaseClient } from '@supabase/supabase-js';
import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository.js';
import { ISetorRepository } from '../../../domain/repositories/ISetorRepository.js';
import {
  InventarioNotFoundError,
  InventarioJaFinalizadoError,
  InventarioNaoPodeFecharError,
  JustificativaObrigatoriaError,
  FechamentoBloqueios,
} from '../../../domain/errors/InventarioErrors.js';
import {
  FecharInventarioResponseDTO,
  toFecharInventarioResponseDTO,
  StatusFechamentoResponseDTO,
} from '../../dtos/inventario/InventarioDTO.js';
import { AuditService } from '../../services/AuditService.js';

export interface FecharInventarioInput {
  inventarioId: number;
  userId: string;
  isAdmin: boolean;
  justificativa?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class FecharInventarioUseCase {
  constructor(
    private readonly inventarioRepository: IInventarioRepository,
    private readonly setorRepository: ISetorRepository,
    private readonly supabase: SupabaseClient,
    private readonly auditService?: AuditService,
  ) {}

  async execute(input: FecharInventarioInput): Promise<FecharInventarioResponseDTO> {
    const { inventarioId, userId, isAdmin, justificativa, ipAddress, userAgent } = input;

    const inventario = await this.inventarioRepository.findById(inventarioId);
    if (!inventario) throw new InventarioNotFoundError(inventarioId);

    if (!inventario.ativo) {
      throw new InventarioJaFinalizadoError(inventarioId);
    }

    // Validate pre-conditions
    const bloqueios = await this.verificarBloqueios(inventarioId);
    const temPendencias = bloqueios.setoresNaoAbertos.length > 0
      || bloqueios.setoresNaoFechados.length > 0
      || bloqueios.divergenciasPendentes > 0;

    if (temPendencias && !isAdmin) {
      throw new InventarioNaoPodeFecharError({
        setoresNaoAbertos: bloqueios.setoresNaoAbertos.length > 0 ? bloqueios.setoresNaoAbertos : undefined,
        setoresNaoFechados: bloqueios.setoresNaoFechados.length > 0 ? bloqueios.setoresNaoFechados : undefined,
        divergenciasPendentes: bloqueios.divergenciasPendentes > 0 ? bloqueios.divergenciasPendentes : undefined,
      });
    }

    if (temPendencias && isAdmin && (!justificativa || justificativa.length < 10)) {
      throw new JustificativaObrigatoriaError();
    }

    inventario.fechar(userId, justificativa);
    await this.inventarioRepository.update(inventario);

    if (this.auditService) {
      await this.auditService.registrar({
        acao: 'FECHAMENTO_INVENTARIO',
        descricao: `Inventário #${inventarioId} fechado${temPendencias ? ' (admin com bypass)' : ''}`,
        idUsuario: userId,
        idInventario: inventarioId,
        ipAddress,
        userAgent,
        metadata: temPendencias
          ? { bypass: true, justificativa, bloqueios }
          : undefined,
      });
    }

    return toFecharInventarioResponseDTO(inventario);
  }

  async verificarBloqueios(inventarioId: number): Promise<StatusFechamentoResponseDTO['bloqueios']> {
    const setores = await this.setorRepository.findByInventarioWithStatus(inventarioId);

    const setoresNaoAbertos = setores
      .filter(s => s.status === 'pendente')
      .map(s => s.descricao || `${s.prefixo ?? ''}${s.inicio}-${s.termino}`);

    const setoresNaoFechados = setores
      .filter(s => s.status !== 'finalizado')
      .map(s => s.descricao || `${s.prefixo ?? ''}${s.inicio}-${s.termino}`);

    const divergenciasPendentes = await this.contarDivergenciasPendentes(inventarioId);

    return {
      setoresNaoAbertos,
      setoresNaoFechados,
      divergenciasPendentes,
    };
  }

  private async contarDivergenciasPendentes(inventarioId: number): Promise<number> {
    const sql = `
      WITH contagens AS (
        SELECT ic.id_produto, SUM(ic.quantidade) as qtd_contada,
               BOOL_OR(COALESCE(ic.reconferido, false)) as reconferido
        FROM inventarios_contagens ic
        INNER JOIN setores s ON s.id = ic.id_inventario_setor
        WHERE s.id_inventario = $1
        GROUP BY ic.id_produto
      )
      SELECT COUNT(*)::int as total FROM contagens c
      INNER JOIN inventarios_produtos p ON p.id = c.id_produto AND p.id_inventario = $1
      WHERE COALESCE(c.qtd_contada, 0) != COALESCE(p.saldo, 0) AND c.reconferido = false
    `;

    const { data, error } = await this.supabase.rpc('execute_raw_sql', {
      query_text: sql,
      query_params: [inventarioId],
    });

    if (error) {
      return this.contarDivergenciasFallback(inventarioId);
    }

    return data?.[0]?.total ?? 0;
  }

  private async contarDivergenciasFallback(inventarioId: number): Promise<number> {
    // Get all setores for this inventario
    const { data: setores } = await this.supabase
      .from('setores')
      .select('id')
      .eq('id_inventario', inventarioId);

    if (!setores || setores.length === 0) return 0;

    const setorIds = setores.map(s => s.id);

    // Get all contagens
    const { data: contagens } = await this.supabase
      .from('inventarios_contagens')
      .select('id_produto, quantidade, reconferido')
      .in('id_inventario_setor', setorIds);

    if (!contagens || contagens.length === 0) return 0;

    // Aggregate by produto
    const aggregated = new Map<number, { qtdContada: number; reconferido: boolean }>();
    for (const c of contagens) {
      const existing = aggregated.get(c.id_produto);
      if (existing) {
        existing.qtdContada += Number(c.quantidade);
        if (c.reconferido) existing.reconferido = true;
      } else {
        aggregated.set(c.id_produto, {
          qtdContada: Number(c.quantidade),
          reconferido: c.reconferido || false,
        });
      }
    }

    // Get products
    const produtoIds = [...aggregated.keys()];
    const { data: produtos } = await this.supabase
      .from('inventarios_produtos')
      .select('id, saldo')
      .eq('id_inventario', inventarioId)
      .in('id', produtoIds);

    if (!produtos) return 0;

    let count = 0;
    for (const produto of produtos) {
      const agg = aggregated.get(produto.id);
      if (!agg) continue;
      const saldo = Number(produto.saldo || 0);
      if (agg.qtdContada !== saldo && !agg.reconferido) {
        count++;
      }
    }

    return count;
  }
}
