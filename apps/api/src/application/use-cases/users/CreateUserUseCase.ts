import { User } from '../../../domain/entities/User.js';
import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { IRoleRepository } from '../../../domain/repositories/IRoleRepository.js';
import { UserAlreadyExistsError, RoleNotFoundError } from '../../../domain/errors/UserErrors.js';
import { CreateUserDTO } from '../../dtos/users/CreateUserDTO.js';
import { UserResponseDTO, toUserResponseDTO } from '../../dtos/users/UserResponseDTO.js';

export interface ICreateUserAuthService {
  createUser(email: string, password: string): Promise<string>;
}

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly authService: ICreateUserAuthService
  ) {}

  async execute(data: CreateUserDTO, assignedBy?: string): Promise<UserResponseDTO> {
    // Check if user already exists
    const existingUser = await this.userRepository.existsByEmail(data.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(data.email);
    }

    // Validate roles exist
    const roles = [];
    for (const roleId of data.roleIds) {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new RoleNotFoundError(roleId);
      }
      roles.push(role);
    }

    // Create user in auth system (Supabase Auth)
    const authUserId = await this.authService.createUser(data.email, data.password);

    // Create user profile
    const user = User.create({
      id: authUserId,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      isActive: data.isActive,
      roles,
    });

    // Save user profile
    const savedUser = await this.userRepository.create(user);

    // Assign roles
    for (const roleId of data.roleIds) {
      await this.userRepository.assignRole(savedUser.id!, roleId, assignedBy);
    }

    // Fetch user with roles
    const userWithRoles = await this.userRepository.findById(savedUser.id!);

    return toUserResponseDTO(userWithRoles!);
  }
}
