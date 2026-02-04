import { IInventarioProdutoRepository } from '../../../domain/repositories/IInventarioProdutoRepository.js';
import { ProdutoNotFoundError } from '../../../domain/errors/InventarioErrors.js';

export class DeleteProdutoUseCase {
  constructor(private readonly produtoRepository: IInventarioProdutoRepository) {}

  async execute(id: number): Promise<void> {
    const produto = await this.produtoRepository.findById(id);

    if (!produto) {
      throw new ProdutoNotFoundError(id);
    }

    await this.produtoRepository.delete(id);
  }
}
