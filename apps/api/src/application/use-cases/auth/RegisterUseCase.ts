import { SupabaseAuthService } from '../../../infrastructure/auth/SupabaseAuthService.js';
import { RegisterDTO, RegisterResponseDTO } from '../../dtos/auth/RegisterDTO.js';

export class RegisterUseCase {
  constructor(private authService: SupabaseAuthService) {}

  async execute(data: RegisterDTO): Promise<RegisterResponseDTO> {
    const { email } = await this.authService.signUp(data.email, data.password);

    return {
      message: 'Conta criada com sucesso. Verifique seu email para ativar.',
      email,
    };
  }
}
