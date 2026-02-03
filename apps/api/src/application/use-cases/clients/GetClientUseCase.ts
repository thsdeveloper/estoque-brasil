import { IClientRepository } from '../../../domain/repositories/IClientRepository.js';
import { ClientNotFoundError } from '../../../domain/errors/DomainError.js';
import { ClientResponseDTO, toClientResponseDTO } from '../../dtos/clients/ClientResponseDTO.js';

export class GetClientUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(id: string): Promise<ClientResponseDTO> {
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new ClientNotFoundError(id);
    }

    return toClientResponseDTO(client);
  }
}
