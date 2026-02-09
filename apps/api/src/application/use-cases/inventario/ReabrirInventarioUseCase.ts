import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository.js';
import { InventarioNotFoundError, InventarioNaoFinalizadoError } from '../../../domain/errors/InventarioErrors.js';
import { InventarioResponseDTO, toInventarioResponseDTO } from '../../dtos/inventario/InventarioDTO.js';
import { AuditService } from '../../services/AuditService.js';

export class ReabrirInventarioUseCase {
  constructor(
    private readonly inventarioRepository: IInventarioRepository,
    private readonly auditService?: AuditService,
  ) {}

  async execute(
    id: number,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<InventarioResponseDTO> {
    const inventario = await this.inventarioRepository.findById(id);
    if (!inventario) throw new InventarioNotFoundError(id);

    if (inventario.ativo) {
      throw new InventarioNaoFinalizadoError(id);
    }

    inventario.reabrir();
    const updated = await this.inventarioRepository.update(inventario);

    if (this.auditService) {
      await this.auditService.registrar({
        acao: 'REABERTURA_INVENTARIO',
        descricao: `Inventário #${id} reaberto`,
        idUsuario: userId,
        idInventario: id,
        ipAddress,
        userAgent,
      });
    }

    return toInventarioResponseDTO(updated);
  }
}
