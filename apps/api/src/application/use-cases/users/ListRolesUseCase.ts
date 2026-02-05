import { Role } from '../../../domain/entities/Role.js';
import { IRoleRepository } from '../../../domain/repositories/IRoleRepository.js';

export class ListRolesUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(_includePermissions = false): Promise<Role[]> {
    return this.roleRepository.findAll();
  }
}
