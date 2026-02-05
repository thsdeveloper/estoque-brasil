import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { UserNotFoundError } from '../../../domain/errors/UserErrors.js';
import { UserPermissionsResponseDTO, toUserPermissionsResponseDTO } from '../../dtos/users/UserResponseDTO.js';

export class GetUserPermissionsUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserPermissionsResponseDTO> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    return toUserPermissionsResponseDTO(user);
  }
}
