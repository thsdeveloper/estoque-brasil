import { SupabaseAuthService } from '../../../infrastructure/auth/SupabaseAuthService.js';
import { UpdatePasswordDTO, UpdatePasswordResponseDTO } from '../../dtos/auth/UpdatePasswordDTO.js';

export class UpdatePasswordUseCase {
  constructor(private authService: SupabaseAuthService) {}

  async execute(accessToken: string, data: UpdatePasswordDTO): Promise<UpdatePasswordResponseDTO> {
    await this.authService.updatePasswordForLoggedUser(accessToken, data.newPassword);

    return {
      message: 'Senha alterada com sucesso.',
    };
  }
}
