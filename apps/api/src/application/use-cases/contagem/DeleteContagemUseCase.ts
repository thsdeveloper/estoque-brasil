import { IInventarioContagemRepository } from '../../../domain/repositories/IInventarioContagemRepository.js';
import { ContagemNotFoundError } from '../../../domain/errors/InventarioErrors.js';

export class DeleteContagemUseCase {
  constructor(private readonly contagemRepository: IInventarioContagemRepository) {}

  async execute(id: number): Promise<void> {
    const contagem = await this.contagemRepository.findById(id);

    if (!contagem) {
      throw new ContagemNotFoundError(id);
    }

    await this.contagemRepository.delete(id);
  }
}
