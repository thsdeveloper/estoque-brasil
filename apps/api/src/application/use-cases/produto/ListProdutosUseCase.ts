import { IInventarioProdutoRepository, InventarioProdutoPaginationParams } from '../../../domain/repositories/IInventarioProdutoRepository.js';
import { PaginatedProdutoResponseDTO, toProdutoResponseDTO } from '../../dtos/inventario/ProdutoDTO.js';

export interface ListProdutosInput {
  page?: number;
  limit?: number;
  idInventario: number;
  search?: string;
  divergente?: boolean;
  codigoBarras?: string;
  codigoInterno?: string;
}

export class ListProdutosUseCase {
  constructor(private readonly produtoRepository: IInventarioProdutoRepository) {}

  async execute(input: ListProdutosInput): Promise<PaginatedProdutoResponseDTO> {
    const page = input.page && input.page > 0 ? input.page : 1;
    const limit = input.limit && input.limit > 0 && input.limit <= 100 ? input.limit : 10;

    const params: InventarioProdutoPaginationParams = {
      page,
      limit,
      idInventario: input.idInventario,
      search: input.search?.trim(),
      divergente: input.divergente,
      codigoBarras: input.codigoBarras,
      codigoInterno: input.codigoInterno,
    };

    const result = await this.produtoRepository.findAll(params);

    return {
      data: result.data.map(toProdutoResponseDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
