import { Loja } from '../../../domain/entities/Loja.js';
import { ILojaRepository } from '../../../domain/repositories/ILojaRepository.js';
import { InvalidLojaError } from '../../../domain/errors/InventarioErrors.js';
import { CreateLojaDTO, LojaResponseDTO, toLojaResponseDTO } from '../../dtos/loja/LojaDTO.js';

export class CreateLojaUseCase {
  constructor(private readonly lojaRepository: ILojaRepository) {}

  async execute(data: CreateLojaDTO): Promise<LojaResponseDTO> {
    // Verifica se já existe uma loja com o mesmo CNPJ
    if (data.cnpj) {
      const existsByCnpj = await this.lojaRepository.existsByCnpj(data.cnpj);
      if (existsByCnpj) {
        throw new InvalidLojaError(`Já existe uma loja com o CNPJ: ${data.cnpj}`);
      }
    }

    const loja = Loja.create({
      idCliente: data.idCliente,
      nome: data.nome,
      cnpj: data.cnpj,
    });

    const savedLoja = await this.lojaRepository.create(loja);

    return toLojaResponseDTO(savedLoja);
  }
}
