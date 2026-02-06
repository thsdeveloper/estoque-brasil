import { ISetorRepository } from '../../../domain/repositories/ISetorRepository.js';
import { SetorNotFoundError } from '../../../domain/errors/InventarioErrors.js';
import { SetorResponseDTO, toSetorResponseDTO } from '../../dtos/inventario/SetorDTO.js';

export class AbrirSetorUseCase {
  constructor(private readonly setorRepository: ISetorRepository) {}

  async execute(id: number): Promise<SetorResponseDTO> {
    const setor = await this.setorRepository.findById(id);
    if (!setor) throw new SetorNotFoundError(id);

    setor.abrir();

    const updated = await this.setorRepository.update(setor);
    return toSetorResponseDTO(updated);
  }
}
