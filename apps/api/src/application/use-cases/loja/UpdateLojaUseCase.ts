import { ILojaRepository } from '../../../domain/repositories/ILojaRepository.js';
import { LojaNotFoundError, InvalidLojaError } from '../../../domain/errors/InventarioErrors.js';
import { UpdateLojaDTO, LojaResponseDTO, toLojaResponseDTO } from '../../dtos/loja/LojaDTO.js';

export class UpdateLojaUseCase {
  constructor(private readonly lojaRepository: ILojaRepository) {}

  async execute(id: number, data: UpdateLojaDTO): Promise<LojaResponseDTO> {
    const loja = await this.lojaRepository.findById(id);

    if (!loja) {
      throw new LojaNotFoundError(id);
    }

    // Verifica se já existe outra loja com o mesmo CNPJ
    if (data.cnpj) {
      const existsByCnpj = await this.lojaRepository.existsByCnpj(data.cnpj, id);
      if (existsByCnpj) {
        throw new InvalidLojaError(`Já existe uma loja com o CNPJ: ${data.cnpj}`);
      }
    }

    loja.update(data);

    const updatedLoja = await this.lojaRepository.update(loja);

    return toLojaResponseDTO(updatedLoja);
  }
}
