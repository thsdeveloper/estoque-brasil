import { InventarioProduto } from '../../../domain/entities/InventarioProduto.js';
import { IInventarioProdutoRepository } from '../../../domain/repositories/IInventarioProdutoRepository.js';
import { ProdutoDuplicadoError } from '../../../domain/errors/InventarioErrors.js';
import { CreateProdutoDTO, ProdutoResponseDTO, toProdutoResponseDTO } from '../../dtos/inventario/ProdutoDTO.js';

export class CreateProdutoUseCase {
  constructor(private readonly produtoRepository: IInventarioProdutoRepository) {}

  async execute(data: CreateProdutoDTO): Promise<ProdutoResponseDTO> {
    // Verifica se já existe um produto com o mesmo código de barras no inventário
    if (data.codigoBarras) {
      const existingByBarras = await this.produtoRepository.findByCodigoBarras(
        data.idInventario,
        data.codigoBarras
      );
      if (existingByBarras) {
        throw new ProdutoDuplicadoError(data.codigoBarras);
      }
    }

    const produto = InventarioProduto.create({
      idInventario: data.idInventario,
      codigoBarras: data.codigoBarras,
      codigoInterno: data.codigoInterno,
      descricao: data.descricao,
      lote: data.lote,
      validade: data.validade ? new Date(data.validade) : null,
      saldo: data.saldo,
      custo: data.custo,
      divergente: data.divergente,
    });

    const savedProduto = await this.produtoRepository.create(produto);

    return toProdutoResponseDTO(savedProduto);
  }
}
