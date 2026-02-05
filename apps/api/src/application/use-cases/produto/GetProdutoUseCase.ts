import { IInventarioProdutoRepository } from '../../../domain/repositories/IInventarioProdutoRepository.js';
import { ProdutoNotFoundError } from '../../../domain/errors/InventarioErrors.js';
import { ProdutoResponseDTO, toProdutoResponseDTO } from '../../dtos/inventario/ProdutoDTO.js';

export class GetProdutoUseCase {
  constructor(private readonly produtoRepository: IInventarioProdutoRepository) {}

  async execute(id: number): Promise<ProdutoResponseDTO> {
    const produto = await this.produtoRepository.findById(id);

    if (!produto) {
      throw new ProdutoNotFoundError(id);
    }

    return toProdutoResponseDTO(produto);
  }
}
