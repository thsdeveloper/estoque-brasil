import { IInventarioContagemRepository } from '../../../domain/repositories/IInventarioContagemRepository.js';
import { ContagemNotFoundError } from '../../../domain/errors/InventarioErrors.js';
import { UpdateContagemDTO, ContagemResponseDTO, toContagemResponseDTO } from '../../dtos/inventario/ContagemDTO.js';

export class UpdateContagemUseCase {
  constructor(private readonly contagemRepository: IInventarioContagemRepository) {}

  async execute(id: number, data: UpdateContagemDTO): Promise<ContagemResponseDTO> {
    const contagem = await this.contagemRepository.findById(id);

    if (!contagem) {
      throw new ContagemNotFoundError(id);
    }

    contagem.update({
      lote: data.lote,
      validade: data.validade !== undefined
        ? (data.validade ? new Date(data.validade) : null)
        : undefined,
      quantidade: data.quantidade,
      divergente: data.divergente,
    });

    const updatedContagem = await this.contagemRepository.update(contagem);

    return toContagemResponseDTO(updatedContagem);
  }
}
