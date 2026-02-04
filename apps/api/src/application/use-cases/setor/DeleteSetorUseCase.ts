import { ISetorRepository } from '../../../domain/repositories/ISetorRepository.js';
import { SetorNotFoundError } from '../../../domain/errors/InventarioErrors.js';

export class DeleteSetorUseCase {
  constructor(private readonly setorRepository: ISetorRepository) {}

  async execute(id: number): Promise<void> {
    const setor = await this.setorRepository.findById(id);

    if (!setor) {
      throw new SetorNotFoundError(id);
    }

    await this.setorRepository.delete(id);
  }
}
