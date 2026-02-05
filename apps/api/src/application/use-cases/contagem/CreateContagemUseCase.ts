import { InventarioContagem } from '../../../domain/entities/InventarioContagem.js';
import { IInventarioContagemRepository } from '../../../domain/repositories/IInventarioContagemRepository.js';
import { CreateContagemDTO, ContagemResponseDTO, toContagemResponseDTO } from '../../dtos/inventario/ContagemDTO.js';

export class CreateContagemUseCase {
  constructor(private readonly contagemRepository: IInventarioContagemRepository) {}

  async execute(data: CreateContagemDTO): Promise<ContagemResponseDTO> {
    const contagem = InventarioContagem.create({
      idInventarioSetor: data.idInventarioSetor,
      idProduto: data.idProduto,
      lote: data.lote,
      validade: data.validade ? new Date(data.validade) : null,
      quantidade: data.quantidade,
      divergente: data.divergente,
    });

    const savedContagem = await this.contagemRepository.create(contagem);

    return toContagemResponseDTO(savedContagem);
  }
}
