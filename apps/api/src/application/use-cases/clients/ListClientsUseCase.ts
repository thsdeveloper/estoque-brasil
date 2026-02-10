import { IClientRepository } from '../../../domain/repositories/IClientRepository.js';
import {
  PaginatedClientResponseDTO,
  toClientResponseDTO,
} from '../../dtos/clients/ClientResponseDTO.js';

export interface ListClientsInput {
  page?: number;
  limit?: number;
  search?: string;
  uf?: string;
  idEmpresa?: number;
}

export class ListClientsUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(input: ListClientsInput = {}): Promise<PaginatedClientResponseDTO> {
    const page = input.page && input.page > 0 ? input.page : 1;
    const limit = input.limit && input.limit > 0 && input.limit <= 100 ? input.limit : 10;
    const search = input.search?.trim() || undefined;
    const uf = input.uf?.toUpperCase().trim() || undefined;

    const idEmpresa = input.idEmpresa;

    const result = await this.clientRepository.findAll({ page, limit, search, uf, idEmpresa });

    return {
      data: result.data.map(toClientResponseDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
