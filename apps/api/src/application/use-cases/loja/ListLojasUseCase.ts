import { ILojaRepository, LojaPaginationParams } from '../../../domain/repositories/ILojaRepository.js';
import { PaginatedLojaResponseDTO, toLojaResponseDTO } from '../../dtos/loja/LojaDTO.js';

export interface ListLojasInput {
  page?: number;
  limit?: number;
  search?: string;
  idCliente?: string; // UUID reference to clients
}

export class ListLojasUseCase {
  constructor(private readonly lojaRepository: ILojaRepository) {}

  async execute(input: ListLojasInput = {}): Promise<PaginatedLojaResponseDTO> {
    const page = input.page && input.page > 0 ? input.page : 1;
    const limit = input.limit && input.limit > 0 && input.limit <= 100 ? input.limit : 10;
    const search = input.search?.trim() || undefined;

    const params: LojaPaginationParams = {
      page,
      limit,
      search,
      idCliente: input.idCliente,
    };

    const result = await this.lojaRepository.findAll(params);

    return {
      data: result.data.map(toLojaResponseDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
