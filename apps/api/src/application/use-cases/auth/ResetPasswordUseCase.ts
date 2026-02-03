import { SupabaseAuthService } from '../../../infrastructure/auth/SupabaseAuthService.js';
import { ResetPasswordDTO, ResetPasswordResponseDTO } from '../../dtos/auth/ResetPasswordDTO.js';

export class ResetPasswordUseCase {
  constructor(private authService: SupabaseAuthService) {}

  async execute(data: ResetPasswordDTO): Promise<ResetPasswordResponseDTO> {
    await this.authService.updatePassword(data.accessToken, data.refreshToken, data.password);

    return {
      message: 'Senha alterada com sucesso.',
    };
  }
}
