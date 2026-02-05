import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { UserNotFoundError } from '../../../domain/errors/UserErrors.js';
import { UserResponseDTO, toUserResponseDTO } from '../../dtos/users/UserResponseDTO.js';

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return toUserResponseDTO(user);
  }
}
