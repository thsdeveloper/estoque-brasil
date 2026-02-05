import { IEmpresaRepository } from '../../../domain/repositories/IEmpresaRepository.js';
import { EmpresaNotFoundError, InvalidEmpresaError } from '../../../domain/errors/InventarioErrors.js';
import { UpdateEmpresaDTO, EmpresaResponseDTO, toEmpresaResponseDTO } from '../../dtos/empresa/EmpresaDTO.js';

export class UpdateEmpresaUseCase {
  constructor(private readonly empresaRepository: IEmpresaRepository) {}

  async execute(id: number, data: UpdateEmpresaDTO): Promise<EmpresaResponseDTO> {
    const empresa = await this.empresaRepository.findById(id);

    if (!empresa) {
      throw new EmpresaNotFoundError(id);
    }

    // Verifica se já existe outra empresa com o mesmo CNPJ
    if (data.cnpj) {
      const existsByCnpj = await this.empresaRepository.existsByCnpj(data.cnpj, id);
      if (existsByCnpj) {
        throw new InvalidEmpresaError(`Já existe uma empresa com o CNPJ: ${data.cnpj}`);
      }
    }

    empresa.update(data);

    const updatedEmpresa = await this.empresaRepository.update(empresa);

    return toEmpresaResponseDTO(updatedEmpresa);
  }
}
