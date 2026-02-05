import { IInventarioRepository, InventarioPaginationParams } from '../../../domain/repositories/IInventarioRepository.js';
import { PaginatedInventarioResponseDTO, toInventarioResponseDTO } from '../../dtos/inventario/InventarioDTO.js';

export interface ListInventariosInput {
  page?: number;
  limit?: number;
  idLoja?: number;
  idEmpresa?: number;
  ativo?: boolean;
}

export class ListInventariosUseCase {
  constructor(private readonly inventarioRepository: IInventarioRepository) {}

  async execute(input: ListInventariosInput = {}): Promise<PaginatedInventarioResponseDTO> {
    const page = input.page && input.page > 0 ? input.page : 1;
    const limit = input.limit && input.limit > 0 && input.limit <= 100 ? input.limit : 10;

    const params: InventarioPaginationParams = {
      page,
      limit,
      idLoja: input.idLoja,
      idEmpresa: input.idEmpresa,
      ativo: input.ativo,
    };

    const result = await this.inventarioRepository.findAll(params);

    return {
      data: result.data.map(toInventarioResponseDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
