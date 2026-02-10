import { Client } from '../../../domain/entities/Client.js';
import { IClientRepository } from '../../../domain/repositories/IClientRepository.js';
import { ClientAlreadyExistsError } from '../../../domain/errors/DomainError.js';
import { CreateClientDTO } from '../../dtos/clients/CreateClientDTO.js';
import { ClientResponseDTO, toClientResponseDTO } from '../../dtos/clients/ClientResponseDTO.js';

export class CreateClientUseCase {
  constructor(private readonly clientRepository: IClientRepository) {}

  async execute(data: CreateClientDTO): Promise<ClientResponseDTO> {
    const existingClient = await this.clientRepository.existsByNome(data.nome);

    if (existingClient) {
      throw new ClientAlreadyExistsError(data.nome);
    }

    const client = Client.create({
      nome: data.nome,
      cnpj: data.cnpj,
      fantasia: data.fantasia,
      email: data.email,
      telefone: data.telefone,
      situacao: data.situacao,

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

    const savedClient = await this.clientRepository.create(client);

    return toClientResponseDTO(savedClient);
  }
}
