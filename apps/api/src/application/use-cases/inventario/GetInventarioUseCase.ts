import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository.js';
import { InventarioNotFoundError } from '../../../domain/errors/InventarioErrors.js';
import { InventarioResponseDTO, toInventarioResponseDTO } from '../../dtos/inventario/InventarioDTO.js';

export class GetInventarioUseCase {
  constructor(private readonly inventarioRepository: IInventarioRepository) {}

  async execute(id: number): Promise<InventarioResponseDTO> {
    const inventario = await this.inventarioRepository.findById(id);

    if (!inventario) {
      throw new InventarioNotFoundError(id);
    }

    const temContagens = await this.inventarioRepository.hasContagens(id);

    return toInventarioResponseDTO(inventario, temContagens);
  }
}
