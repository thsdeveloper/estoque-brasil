import { SupabaseClient } from '@supabase/supabase-js';
import { ISetorRepository } from '../../../domain/repositories/ISetorRepository.js';
import {
  SetorNotFoundError,
  SetorFinalizadoError,
  SetorEmContagemError,
  SetorJaAbertoError,
} from '../../../domain/errors/InventarioErrors.js';
import { AbrirSetorResponseDTO, toSetorResponseDTO } from '../../dtos/inventario/SetorDTO.js';
import { AuditService } from '../../services/AuditService.js';

export class AbrirSetorUseCase {
  constructor(
    private readonly setorRepository: ISetorRepository,
    private readonly supabase?: SupabaseClient,
    private readonly auditService?: AuditService,
  ) {}

  async execute(id: number, userId: string, ipAddress?: string, userAgent?: string): Promise<AbrirSetorResponseDTO> {
    const setor = await this.setorRepository.findById(id);
    if (!setor) throw new SetorNotFoundError(id);

    // RN-08: Setor finalizado não pode ser aberto
    if (setor.status === 'finalizado') {
      throw new SetorFinalizadoError(id);
    }

    // RN-04: Setor em contagem por outro usuário
    if (setor.status === 'em_contagem' && setor.idUsuarioContagem && setor.idUsuarioContagem !== userId) {
      const nomeOperador = await this.getUserName(setor.idUsuarioContagem);
      throw new SetorEmContagemError(id, nomeOperador);
    }

    // Idempotente: setor já em contagem pelo mesmo usuário
    if (setor.status === 'em_contagem' && setor.idUsuarioContagem === userId) {
      return toSetorResponseDTO(setor);
    }

    // RN-03: Usuário já tem outro setor aberto neste inventário
    const setorAberto = await this.setorRepository.findByUsuarioEmContagem(userId, setor.idInventario);
    if (setorAberto && setorAberto.id !== id) {
      const nomeSetor = setorAberto.descricao || `${setorAberto.prefixo ?? ''}${setorAberto.inicio}-${setorAberto.termino}`;
      throw new SetorJaAbertoError(nomeSetor, setorAberto.id!);
    }

    // RN-11: Verificar sequência (warning, não bloqueante)
    let warning: { code: string; message: string } | undefined;
    const nextPendente = await this.setorRepository.findNextPendenteByOrder(setor.idInventario);
    if (nextPendente && nextPendente.id !== id) {
      warning = {
        code: 'FORA_SEQUENCIA',
        message: `Este setor está fora da sequência esperada. O próximo setor pendente é "${nextPendente.descricao || nextPendente.prefixo || nextPendente.inicio}".`,
      };
    }

    // Abrir o setor
    setor.abrir(userId);
    const updated = await this.setorRepository.update(setor);

    // Registrar auditoria
    if (this.auditService) {
      const nomeUsuario = await this.getUserName(userId);
      await this.auditService.registrar({
        acao: 'ABERTURA_SETOR',
        descricao: `Setor ${setor.descricao || setor.id} aberto para contagem`,
        idUsuario: userId,
        nomeUsuario,
        idInventario: setor.idInventario,
        idSetor: setor.id,
        ipAddress,
        userAgent,
      });
    }

    const response: AbrirSetorResponseDTO = {
      ...toSetorResponseDTO(updated),
    };

    if (warning) {
      response.warning = warning;
    }

    return response;
  }

  private async getUserName(userId: string): Promise<string> {
    if (!this.supabase) return userId;

    try {
      const { data } = await this.supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', userId)
        .single();
      return data?.full_name || userId;
    } catch {
      return userId;
    }
  }
}
