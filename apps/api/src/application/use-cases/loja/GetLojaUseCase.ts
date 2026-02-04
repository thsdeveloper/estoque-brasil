import { ILojaRepository } from '../../../domain/repositories/ILojaRepository.js';
import { LojaNotFoundError } from '../../../domain/errors/InventarioErrors.js';
import { LojaResponseDTO, toLojaResponseDTO } from '../../dtos/loja/LojaDTO.js';

export class GetLojaUseCase {
  constructor(private readonly lojaRepository: ILojaRepository) {}

  async execute(id: number): Promise<LojaResponseDTO> {
    const loja = await this.lojaRepository.findById(id);

    if (!loja) {
      throw new LojaNotFoundError(id);
    }

    return toLojaResponseDTO(loja);
  }
}
