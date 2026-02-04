import { IEmpresaRepository, EmpresaPaginationParams } from '../../../domain/repositories/IEmpresaRepository.js';
import { PaginatedEmpresaResponseDTO, toEmpresaResponseDTO } from '../../dtos/empresa/EmpresaDTO.js';

export interface ListEmpresasInput {
  page?: number;
  limit?: number;
  search?: string;
  ativo?: boolean;
}

export class ListEmpresasUseCase {
  constructor(private readonly empresaRepository: IEmpresaRepository) {}

  async execute(input: ListEmpresasInput = {}): Promise<PaginatedEmpresaResponseDTO> {
    const page = input.page && input.page > 0 ? input.page : 1;
    const limit = input.limit && input.limit > 0 && input.limit <= 100 ? input.limit : 10;
    const search = input.search?.trim() || undefined;

    const params: EmpresaPaginationParams = {
      page,
      limit,
      search,
      ativo: input.ativo,
    };

    const result = await this.empresaRepository.findAll(params);

    return {
      data: result.data.map(toEmpresaResponseDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
