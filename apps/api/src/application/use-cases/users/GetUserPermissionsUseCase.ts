import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { UserNotFoundError } from '../../../domain/errors/UserErrors.js';
import { UserPermissionsResponseDTO } from '../../dtos/users/UserResponseDTO.js';

export class GetUserPermissionsUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserPermissionsResponseDTO> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const permissions = await this.userRepository.getUserPermissions(userId);

    return {
      userId: user.id!,
      permissions,
      roles: user.roleNames,
    };
  }
}
