import { SupabaseAuthService } from '../../../infrastructure/auth/SupabaseAuthService.js';
import { LoginDTO, LoginResponseDTO } from '../../dtos/auth/LoginDTO.js';
import { cpfToEmail, stripCpf } from '../../../domain/validators/cpf.js';

export class LoginUseCase {
  constructor(private authService: SupabaseAuthService) {}

  async execute(data: LoginDTO): Promise<LoginResponseDTO> {
    const email = data.cpf ? cpfToEmail(stripCpf(data.cpf)) : data.email!;

    const session = await this.authService.signIn(email, data.password);

    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
      user: {
        id: session.user.id,
        email: session.user.email,
      },
    };
  }
}
