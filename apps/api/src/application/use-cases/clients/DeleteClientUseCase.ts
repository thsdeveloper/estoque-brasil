import { IClientRepository } from '../../../domain/repositories/IClientRepository.js';
import { ClientNotFoundError } from '../../../domain/errors/DomainError.js';

export class DeleteClientUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(id: string): Promise<void> {
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new ClientNotFoundError(id);
    }

    await this.clientRepository.delete(id);
  }
}
