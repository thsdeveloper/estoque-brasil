import { SupabaseAuthService } from '../../../infrastructure/auth/SupabaseAuthService.js';
import { LoginResponseDTO } from '../../dtos/auth/LoginDTO.js';

export class RefreshTokenUseCase {
  constructor(private authService: SupabaseAuthService) {}

  async execute(refreshToken: string): Promise<LoginResponseDTO> {
    const session = await this.authService.refreshSession(refreshToken);

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
