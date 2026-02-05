import { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { IRoleRepository } from '../../../domain/repositories/IRoleRepository.js';
import {
  UserNotFoundError,
  RoleNotFoundError,
  CannotDeactivateSelfError,
  CannotRemoveLastAdminError,
} from '../../../domain/errors/UserErrors.js';
import { UpdateUserDTO } from '../../dtos/users/UpdateUserDTO.js';
import { UserResponseDTO, toUserResponseDTO } from '../../dtos/users/UserResponseDTO.js';

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository
  ) {}

  async execute(
    id: string,
    data: UpdateUserDTO,
    currentUserId?: string
  ): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    // Check if trying to deactivate self
    if (data.isActive === false && id === currentUserId) {
      throw new CannotDeactivateSelfError();
    }

    // If updating roles, validate they exist
    let roles = user.roles;
    if (data.roleIds) {
      // Check if removing admin role from last admin
      const currentUserIsAdmin = user.hasRole('admin');
      const newRolesIncludeAdmin = await this.checkIfRolesIncludeAdmin(data.roleIds);

      if (currentUserIsAdmin && !newRolesIncludeAdmin) {
        const adminCount = await this.userRepository.countAdmins();
        if (adminCount <= 1) {
          throw new CannotRemoveLastAdminError();
        }
      }

      roles = [];
      for (const roleId of data.roleIds) {
        const role = await this.roleRepository.findById(roleId);
        if (!role) {
          throw new RoleNotFoundError(roleId);
        }
        roles.push(role);
      }
    }

    // Update user entity
    user.update({
      fullName: data.fullName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      isActive: data.isActive,
      roles,
    });

    // Save user profile
    const savedUser = await this.userRepository.update(user);

    // Update roles if provided
    if (data.roleIds) {
      const currentRoleIds = await this.userRepository.getUserRoleIds(id);

      // Remove roles that are not in the new list
      for (const roleId of currentRoleIds) {
        if (!data.roleIds.includes(roleId)) {
          await this.userRepository.removeRole(id, roleId);
        }
      }

      // Add new roles
      for (const roleId of data.roleIds) {
        if (!currentRoleIds.includes(roleId)) {
          await this.userRepository.assignRole(id, roleId, currentUserId);
        }
      }
    }

    // Fetch user with updated roles
    const updatedUser = await this.userRepository.findById(id);

    return toUserResponseDTO(updatedUser!);
  }

  private async checkIfRolesIncludeAdmin(roleIds: string[]): Promise<boolean> {
    for (const roleId of roleIds) {
      const role = await this.roleRepository.findById(roleId);
      if (role?.name === 'admin') {
        return true;
      }
    }
    return false;
  }
}
