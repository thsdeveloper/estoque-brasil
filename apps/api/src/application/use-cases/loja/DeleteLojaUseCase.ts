import { ILojaRepository } from '../../../domain/repositories/ILojaRepository.js';
import { LojaNotFoundError } from '../../../domain/errors/InventarioErrors.js';

export class DeleteLojaUseCase {
  constructor(private readonly lojaRepository: ILojaRepository) {}

  async execute(id: number): Promise<void> {
    const loja = await this.lojaRepository.findById(id);

    if (!loja) {
      throw new LojaNotFoundError(id);
    }

    await this.lojaRepository.delete(id);
  }
}
