import { SupabaseAuthService, AuthUser } from '../../../infrastructure/auth/SupabaseAuthService.js';
import { UserResponseDTO } from '../../dtos/auth/index.js';

export class GetCurrentUserUseCase {
  constructor(private authService: SupabaseAuthService) {}

  async execute(accessToken: string): Promise<UserResponseDTO> {
    const user = await this.authService.getCurrentUser(accessToken);

    return this.toResponseDTO(user);
  }

  private toResponseDTO(user: AuthUser): UserResponseDTO {
    return {
      id: user.id,
      email: user.email,
      emailConfirmedAt: user.emailConfirmedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
