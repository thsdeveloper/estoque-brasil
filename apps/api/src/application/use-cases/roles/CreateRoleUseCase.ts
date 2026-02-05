import { Role } from '../../../domain/entities/Role.js';
import { IRoleRepository } from '../../../domain/repositories/IRoleRepository.js';
import { InvalidRoleError } from '../../../domain/errors/UserErrors.js';
import { CreateRoleDTO, createRoleSchema } from '../../dtos/roles/RoleDTO.js';

export class CreateRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(input: CreateRoleDTO): Promise<Role> {
    // Validate input
    const validationResult = createRoleSchema.safeParse(input);
    if (!validationResult.success) {
      throw new InvalidRoleError(validationResult.error.errors[0].message);
    }

    const { name, displayName, description } = validationResult.data;

    // Check if role name already exists
    const existingRole = await this.roleRepository.existsByName(name);
    if (existingRole) {
      throw new InvalidRoleError(`Já existe uma role com o nome: "${name}"`);
    }

    // Create role
    const role = Role.create({
      name,
      displayName,
      description: description ?? null,
      isSystemRole: false,
      permissions: [],
    });

    return this.roleRepository.create(role);
  }
}
