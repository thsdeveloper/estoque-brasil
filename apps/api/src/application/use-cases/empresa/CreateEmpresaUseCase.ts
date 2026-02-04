import { Empresa } from '../../../domain/entities/Empresa.js';
import { IEmpresaRepository } from '../../../domain/repositories/IEmpresaRepository.js';
import { InvalidEmpresaError } from '../../../domain/errors/InventarioErrors.js';
import { CreateEmpresaDTO, EmpresaResponseDTO, toEmpresaResponseDTO } from '../../dtos/empresa/EmpresaDTO.js';

export class CreateEmpresaUseCase {
  constructor(private readonly empresaRepository: IEmpresaRepository) {}

  async execute(data: CreateEmpresaDTO): Promise<EmpresaResponseDTO> {
    // Verifica se já existe uma empresa com o mesmo CNPJ
    if (data.cnpj) {
      const existsByCnpj = await this.empresaRepository.existsByCnpj(data.cnpj);
      if (existsByCnpj) {
        throw new InvalidEmpresaError(`Já existe uma empresa com o CNPJ: ${data.cnpj}`);
      }
    }

    const empresa = Empresa.create({
      descricao: data.descricao,
      cnpj: data.cnpj,
      razaoSocial: data.razaoSocial,
      nomeFantasia: data.nomeFantasia,
      cep: data.cep,
      endereco: data.endereco,
      numero: data.numero,
      bairro: data.bairro,
      codigoUf: data.codigoUf,
      codigoMunicipio: data.codigoMunicipio,
      ativo: data.ativo ?? true,
    });

    const savedEmpresa = await this.empresaRepository.create(empresa);

    return toEmpresaResponseDTO(savedEmpresa);
  }
}
