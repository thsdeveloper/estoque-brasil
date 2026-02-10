import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository.js';
import { InventarioNotFoundError } from '../../../domain/errors/InventarioErrors.js';
import { StatusFechamentoResponseDTO } from '../../dtos/inventario/InventarioDTO.js';
import { FecharInventarioUseCase } from './FecharInventarioUseCase.js';

export class GetStatusFechamentoUseCase {
  constructor(
    private readonly inventarioRepository: IInventarioRepository,
    private readonly fecharInventarioUseCase: FecharInventarioUseCase,
  ) {}

  async execute(inventarioId: number): Promise<StatusFechamentoResponseDTO> {
    const inventario = await this.inventarioRepository.findById(inventarioId);
    if (!inventario) throw new InventarioNotFoundError(inventarioId);

    const bloqueios = await this.fecharInventarioUseCase.verificarBloqueios(inventarioId);

    const podeFechar = bloqueios.setoresNaoAbertos.length === 0
      && bloqueios.setoresNaoFechados.length === 0
      && bloqueios.divergenciasPendentes === 0;

    return {
      podeFechar,
      bloqueios,
    };
  }
}
