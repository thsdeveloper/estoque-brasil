import { IUserRepository, UserPaginationParams } from '../../../domain/repositories/IUserRepository.js';
import { PaginatedUserResponseDTO, toUserResponseDTO } from '../../dtos/users/UserResponseDTO.js';

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: UserPaginationParams): Promise<PaginatedUserResponseDTO> {
    const result = await this.userRepository.findAll(params);

    return {
      data: result.data.map(toUserResponseDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
