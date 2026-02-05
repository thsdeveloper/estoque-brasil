import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import {
  UserNotFoundError,
  CannotDeactivateSelfError,
  CannotRemoveLastAdminError,
} from '../../../domain/errors/UserErrors.js';

export interface IDeleteUserAuthService {
  deleteUser(userId: string): Promise<void>;
}

export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IDeleteUserAuthService
  ) {}

  async execute(id: string, currentUserId?: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    // Cannot delete self
    if (id === currentUserId) {
      throw new CannotDeactivateSelfError();
    }

    // Cannot delete last admin
    if (user.hasRole('admin')) {
      const adminCount = await this.userRepository.countAdmins();
      if (adminCount <= 1) {
        throw new CannotRemoveLastAdminError();
      }
    }

    // Delete from auth system
    await this.authService.deleteUser(id);

    // Delete user profile (cascade will handle user_roles)
    await this.userRepository.delete(id);
  }
}
