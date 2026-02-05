import { IEmpresaRepository } from '../../../domain/repositories/IEmpresaRepository.js';
import { EmpresaNotFoundError } from '../../../domain/errors/InventarioErrors.js';
import { EmpresaResponseDTO, toEmpresaResponseDTO } from '../../dtos/empresa/EmpresaDTO.js';

export class GetEmpresaUseCase {
  constructor(private readonly empresaRepository: IEmpresaRepository) {}

  async execute(id: number): Promise<EmpresaResponseDTO> {
    const empresa = await this.empresaRepository.findById(id);

    if (!empresa) {
      throw new EmpresaNotFoundError(id);
    }

    return toEmpresaResponseDTO(empresa);
  }
}
