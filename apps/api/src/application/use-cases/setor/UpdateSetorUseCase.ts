import { ISetorRepository } from '../../../domain/repositories/ISetorRepository.js';
import { SetorNotFoundError } from '../../../domain/errors/InventarioErrors.js';
import { UpdateSetorDTO, SetorResponseDTO, toSetorResponseDTO } from '../../dtos/inventario/SetorDTO.js';

export class UpdateSetorUseCase {
  constructor(private readonly setorRepository: ISetorRepository) {}

  async execute(id: number, data: UpdateSetorDTO): Promise<SetorResponseDTO> {
    const setor = await this.setorRepository.findById(id);

    if (!setor) {
      throw new SetorNotFoundError(id);
    }

    setor.update(data);

    const updatedSetor = await this.setorRepository.update(setor);

    return toSetorResponseDTO(updatedSetor);
  }
}
