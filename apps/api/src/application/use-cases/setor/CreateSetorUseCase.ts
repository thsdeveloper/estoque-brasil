import { Setor } from '../../../domain/entities/Setor.js';
import { ISetorRepository } from '../../../domain/repositories/ISetorRepository.js';
import { CreateSetorDTO, SetorResponseDTO, toSetorResponseDTO } from '../../dtos/inventario/SetorDTO.js';

export class CreateSetorUseCase {
  constructor(private readonly setorRepository: ISetorRepository) {}

  async execute(data: CreateSetorDTO): Promise<SetorResponseDTO> {
    const setor = Setor.create({
      idInventario: data.idInventario,
      prefixo: data.prefixo,
      inicio: data.inicio,
      termino: data.termino,
      descricao: data.descricao,
    });

    const savedSetor = await this.setorRepository.create(setor);

    return toSetorResponseDTO(savedSetor);
  }
}
