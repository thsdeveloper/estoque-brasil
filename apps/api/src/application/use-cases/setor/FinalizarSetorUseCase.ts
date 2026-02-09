import { ISetorRepository } from '../../../domain/repositories/ISetorRepository.js';
import { SetorNotFoundError } from '../../../domain/errors/InventarioErrors.js';
import { SetorResponseDTO, toSetorResponseDTO } from '../../dtos/inventario/SetorDTO.js';
import { AuditService } from '../../services/AuditService.js';

export class FinalizarSetorUseCase {
  constructor(
    private readonly setorRepository: ISetorRepository,
    private readonly auditService?: AuditService,
  ) {}

  async execute(id: number, userId: string, nomeUsuario?: string, ipAddress?: string, userAgent?: string): Promise<SetorResponseDTO> {
    const setor = await this.setorRepository.findById(id);
    if (!setor) throw new SetorNotFoundError(id);

    setor.finalizar();
    const updated = await this.setorRepository.update(setor);

    if (this.auditService) {
      await this.auditService.registrar({
        acao: 'FINALIZACAO_SETOR',
        descricao: `Setor ${setor.descricao || setor.id} finalizado`,
        idUsuario: userId,
        nomeUsuario,
        idInventario: setor.idInventario,
        idSetor: setor.id,
        ipAddress,
        userAgent,
      });
    }

    return toSetorResponseDTO(updated);
  }
}
