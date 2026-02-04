import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository.js';
import { InventarioNotFoundError } from '../../../domain/errors/InventarioErrors.js';

export class DeleteInventarioUseCase {
  constructor(private readonly inventarioRepository: IInventarioRepository) {}

  async execute(id: number): Promise<void> {
    const inventario = await this.inventarioRepository.findById(id);

    if (!inventario) {
      throw new InventarioNotFoundError(id);
    }

    await this.inventarioRepository.delete(id);
  }
}
