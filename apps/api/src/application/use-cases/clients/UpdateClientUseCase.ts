import { IClientRepository } from '../../../domain/repositories/IClientRepository.js';
import {
  ClientNotFoundError,
  ClientAlreadyExistsError,
} from '../../../domain/errors/DomainError.js';
import { UpdateClientDTO } from '../../dtos/clients/UpdateClientDTO.js';
import { ClientResponseDTO, toClientResponseDTO } from '../../dtos/clients/ClientResponseDTO.js';

export class UpdateClientUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(id: string, data: UpdateClientDTO): Promise<ClientResponseDTO> {
    const client = await this.clientRepository.findById(id);

    if (!client) {
      throw new ClientNotFoundError(id);
    }

    if (data.nome && data.nome !== client.nome) {
      const nameExists = await this.clientRepository.existsByNome(data.nome, id);
      if (nameExists) {
        throw new ClientAlreadyExistsError(data.nome);
      }
    }

    client.update({
      nome: data.nome,
      linkBi: data.linkBi,
      qtdeDivergentePlus: data.qtdeDivergentePlus,
      qtdeDivergenteMinus: data.qtdeDivergenteMinus,
      valorDivergentePlus: data.valorDivergentePlus,
      valorDivergenteMinus: data.valorDivergenteMinus,
      percentualDivergencia: data.percentualDivergencia,
      cep: data.cep,
      endereco: data.endereco,
      numero: data.numero,
      bairro: data.bairro,
      uf: data.uf,
      municipio: data.municipio,
    });

    const updatedClient = await this.clientRepository.update(client);

    return toClientResponseDTO(updatedClient);
  }
}
