import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository.js';
import { InventarioNotFoundError } from '../../../domain/errors/InventarioErrors.js';
import { InventarioResponseDTO, toInventarioResponseDTO } from '../../dtos/inventario/InventarioDTO.js';

export class FinalizarInventarioUseCase {
  constructor(private readonly inventarioRepository: IInventarioRepository) {}

  async execute(id: number): Promise<InventarioResponseDTO> {
    const inventario = await this.inventarioRepository.findById(id);

    if (!inventario) {
      throw new InventarioNotFoundError(id);
    }

    inventario.finalizar();

    const updatedInventario = await this.inventarioRepository.update(inventario);

    return toInventarioResponseDTO(updatedInventario);
  }
}
