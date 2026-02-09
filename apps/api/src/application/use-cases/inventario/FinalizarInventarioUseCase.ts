import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository.js';
import { ISetorRepository } from '../../../domain/repositories/ISetorRepository.js';
import { InventarioNotFoundError, InventarioJaFinalizadoError, SetoresEmAbertoError } from '../../../domain/errors/InventarioErrors.js';
import { InventarioResponseDTO, toInventarioResponseDTO } from '../../dtos/inventario/InventarioDTO.js';
import { AuditService } from '../../services/AuditService.js';

export class FinalizarInventarioUseCase {
  constructor(
    private readonly inventarioRepository: IInventarioRepository,
    private readonly setorRepository: ISetorRepository,
    private readonly auditService?: AuditService,
  ) {}

  async execute(
    id: number,
    userId: string,
    forcado?: boolean,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<InventarioResponseDTO> {
    const inventario = await this.inventarioRepository.findById(id);
    if (!inventario) throw new InventarioNotFoundError(id);

    if (!inventario.ativo) {
      throw new InventarioJaFinalizadoError(id);
    }

    // Check for non-finalized sectors
    const setores = await this.setorRepository.findByInventarioWithStatus(id);
    const setoresNaoFinalizados = setores.filter(s => s.status !== 'finalizado');

    if (setoresNaoFinalizados.length > 0 && !forcado) {
      const lista = setoresNaoFinalizados.map(s => ({
        id: s.id!,
        descricao: s.descricao || `${s.prefixo ?? ''}${s.inicio}-${s.termino}`,
        status: s.status,
      }));
      throw new SetoresEmAbertoError(lista);
    }

    inventario.finalizar();
    const updated = await this.inventarioRepository.update(inventario);

    if (this.auditService) {
      await this.auditService.registrar({
        acao: 'FINALIZACAO_INVENTARIO',
        descricao: `Inventário #${id} finalizado${forcado ? ' (forçado)' : ''}`,
        idUsuario: userId,
        idInventario: id,
        ipAddress,
        userAgent,
        metadata: forcado ? { forcado: true, setoresNaoFinalizados: setoresNaoFinalizados.length } : undefined,
      });
    }

    return toInventarioResponseDTO(updated);
  }
}
