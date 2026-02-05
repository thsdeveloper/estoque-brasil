import { IRoleRepository } from '../../../domain/repositories/IRoleRepository.js';
import {
  RoleNotFoundError,
  CannotDeleteSystemRoleError,
} from '../../../domain/errors/UserErrors.js';

export class DeleteRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(id: string): Promise<void> {
    // Find existing role
    const existingRole = await this.roleRepository.findById(id);
    if (!existingRole) {
      throw new RoleNotFoundError(id);
    }

    // Cannot delete system roles
    if (existingRole.isSystemRole) {
      throw new CannotDeleteSystemRoleError(existingRole.name);
    }

    await this.roleRepository.delete(id);
  }
}
