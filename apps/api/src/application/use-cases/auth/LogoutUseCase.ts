import { SupabaseAuthService } from '../../../infrastructure/auth/SupabaseAuthService.js';

export class LogoutUseCase {
  constructor(private authService: SupabaseAuthService) {}

  async execute(accessToken: string): Promise<void> {
    await this.authService.signOut(accessToken);
  }
}
