import { IInventarioContagemRepository } from '../../../domain/repositories/IInventarioContagemRepository.js';
import { ContagemNotFoundError } from '../../../domain/errors/InventarioErrors.js';
import { ContagemResponseDTO, toContagemResponseDTO } from '../../dtos/inventario/ContagemDTO.js';

export class GetContagemUseCase {
  constructor(private readonly contagemRepository: IInventarioContagemRepository) {}

  async execute(id: number): Promise<ContagemResponseDTO> {
    const contagem = await this.contagemRepository.findById(id);

    if (!contagem) {
      throw new ContagemNotFoundError(id);
    }

    return toContagemResponseDTO(contagem);
  }
}
