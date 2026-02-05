import { IInventarioProdutoRepository } from '../../../domain/repositories/IInventarioProdutoRepository.js';
import { ProdutoNotFoundError } from '../../../domain/errors/InventarioErrors.js';
import { UpdateProdutoDTO, ProdutoResponseDTO, toProdutoResponseDTO } from '../../dtos/inventario/ProdutoDTO.js';

export class UpdateProdutoUseCase {
  constructor(private readonly produtoRepository: IInventarioProdutoRepository) {}

  async execute(id: number, data: UpdateProdutoDTO): Promise<ProdutoResponseDTO> {
    const produto = await this.produtoRepository.findById(id);

    if (!produto) {
      throw new ProdutoNotFoundError(id);
    }

    produto.update({
      codigoBarras: data.codigoBarras,
      codigoInterno: data.codigoInterno,
      descricao: data.descricao,
      lote: data.lote,
      validade: data.validade !== undefined
        ? (data.validade ? new Date(data.validade) : null)
        : undefined,
      saldo: data.saldo,
      custo: data.custo,
      divergente: data.divergente,
    });

    const updatedProduto = await this.produtoRepository.update(produto);

    return toProdutoResponseDTO(updatedProduto);
  }
}
