import { SupabaseAuthService } from '../../../infrastructure/auth/SupabaseAuthService.js';
import { ForgotPasswordDTO, ForgotPasswordResponseDTO } from '../../dtos/auth/ForgotPasswordDTO.js';

export class ForgotPasswordUseCase {
  constructor(private authService: SupabaseAuthService) {}

  async execute(data: ForgotPasswordDTO): Promise<ForgotPasswordResponseDTO> {
    await this.authService.resetPasswordForEmail(data.email);

    return {
      message: 'Se o email estiver cadastrado, você receberá um link de recuperação.',
    };
  }
}
