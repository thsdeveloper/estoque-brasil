import { IEmpresaRepository } from '../../../domain/repositories/IEmpresaRepository.js';
import { EmpresaNotFoundError } from '../../../domain/errors/InventarioErrors.js';

export class DeleteEmpresaUseCase {
  constructor(private readonly empresaRepository: IEmpresaRepository) {}

  async execute(id: number): Promise<void> {
    const empresa = await this.empresaRepository.findById(id);

    if (!empresa) {
      throw new EmpresaNotFoundError(id);
    }

    await this.empresaRepository.delete(id);
  }
}
