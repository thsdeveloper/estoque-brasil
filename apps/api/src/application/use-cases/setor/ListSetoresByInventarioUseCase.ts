import { ISetorRepository } from '../../../domain/repositories/ISetorRepository.js';
import { SetorResponseDTO, toSetorResponseDTO } from '../../dtos/inventario/SetorDTO.js';

export class ListSetoresByInventarioUseCase {
  constructor(private readonly setorRepository: ISetorRepository) {}

  async execute(idInventario: number): Promise<SetorResponseDTO[]> {
    const setores = await this.setorRepository.findByInventario(idInventario);
    return setores.map(toSetorResponseDTO);
  }
}
