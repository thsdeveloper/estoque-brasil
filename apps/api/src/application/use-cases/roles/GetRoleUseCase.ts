import { Role } from '../../../domain/entities/Role.js';
import { IRoleRepository } from '../../../domain/repositories/IRoleRepository.js';
import { RoleNotFoundError } from '../../../domain/errors/UserErrors.js';

export class GetRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new RoleNotFoundError(id);
    }

    return role;
  }
}
