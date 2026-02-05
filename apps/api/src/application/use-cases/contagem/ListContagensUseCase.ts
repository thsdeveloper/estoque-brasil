import { IInventarioContagemRepository, InventarioContagemPaginationParams } from '../../../domain/repositories/IInventarioContagemRepository.js';
import { PaginatedContagemResponseDTO, toContagemResponseDTO } from '../../dtos/inventario/ContagemDTO.js';

export interface ListContagensInput {
  page?: number;
  limit?: number;
  idInventarioSetor?: number;
  idProduto?: number;
  divergente?: boolean;
}

export class ListContagensUseCase {
  constructor(private readonly contagemRepository: IInventarioContagemRepository) {}

  async execute(input: ListContagensInput = {}): Promise<PaginatedContagemResponseDTO> {
    const page = input.page && input.page > 0 ? input.page : 1;
    const limit = input.limit && input.limit > 0 && input.limit <= 100 ? input.limit : 10;

    const params: InventarioContagemPaginationParams = {
      page,
      limit,
      idInventarioSetor: input.idInventarioSetor,
      idProduto: input.idProduto,
      divergente: input.divergente,
    };

    const result = await this.contagemRepository.findAll(params);

    return {
      data: result.data.map(toContagemResponseDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
