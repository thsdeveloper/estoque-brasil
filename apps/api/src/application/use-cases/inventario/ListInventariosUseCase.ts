import { IInventarioRepository, InventarioPaginationParams } from '../../../domain/repositories/IInventarioRepository.js';
import { PaginatedInventarioResponseDTO, toInventarioResponseDTO } from '../../dtos/inventario/InventarioDTO.js';

export interface ListInventariosInput {
  page?: number;
  limit?: number;
  idLoja?: number;
  idEmpresa?: number;
  ativo?: boolean;
  search?: string;
  userId?: string;
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
      search: input.search,
      userId: input.userId,
    };

    const result = await this.inventarioRepository.findAll(params);

    const ids = result.data
      .map((inv) => inv.id)
      .filter((id): id is number => id !== undefined);
    const inventariosComContagens = await this.inventarioRepository.getInventariosComContagens(ids);

    return {
      data: result.data.map((inv) =>
        toInventarioResponseDTO(inv, inventariosComContagens.has(inv.id!))
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
