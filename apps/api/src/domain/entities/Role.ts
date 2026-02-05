import { Permission } from './Permission.js';
import { InvalidRoleError } from '../errors/UserErrors.js';

export interface RoleProps {
  id?: string;
  name: string;
  displayName: string;
  description?: string | null;
  isSystemRole?: boolean;
  permissions?: Permission[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Role {
  private readonly _id?: string;
  private _name: string;
  private _displayName: string;
  private _description: string | null;
  private readonly _isSystemRole: boolean;
  private _permissions: Permission[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: RoleProps) {
    this._id = props.id;
    this._name = props.name;
    this._displayName = props.displayName;
    this._description = props.description ?? null;
    this._isSystemRole = props.isSystemRole ?? false;
    this._permissions = props.permissions ?? [];
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: RoleProps): Role {
    Role.validate(props);
    return new Role(props);
  }

  private static validate(props: RoleProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new InvalidRoleError('Nome é obrigatório');
    }

    if (props.name.trim().length > 50) {
      throw new InvalidRoleError('Nome deve ter no máximo 50 caracteres');
    }

    if (!/^[a-z_]+$/.test(props.name)) {
      throw new InvalidRoleError('Nome deve conter apenas letras minúsculas e underscores');
    }

    if (!props.displayName || props.displayName.trim().length === 0) {
      throw new InvalidRoleError('Nome de exibição é obrigatório');
    }

    if (props.displayName.trim().length > 100) {
      throw new InvalidRoleError('Nome de exibição deve ter no máximo 100 caracteres');
    }
  }

  update(props: Partial<Omit<RoleProps, 'id' | 'createdAt' | 'isSystemRole'>>): void {
    if (props.name !== undefined) {
      if (!props.name || props.name.trim().length === 0) {
        throw new InvalidRoleError('Nome é obrigatório');
      }
      if (!/^[a-z_]+$/.test(props.name)) {
        throw new InvalidRoleError('Nome deve conter apenas letras minúsculas e underscores');
      }
      this._name = props.name;
    }

    if (props.displayName !== undefined) {
      if (!props.displayName || props.displayName.trim().length === 0) {
        throw new InvalidRoleError('Nome de exibição é obrigatório');
      }
      this._displayName = props.displayName;
    }

    if (props.description !== undefined) {
      this._description = props.description ?? null;
    }

    if (props.permissions !== undefined) {
      this._permissions = props.permissions;
    }

    this._updatedAt = new Date();
  }

  hasPermission(resource: string, action: string): boolean {
    return this._permissions.some(
      (p) => p.resource === resource && p.action === action
    );
  }

  addPermission(permission: Permission): void {
    if (!this.hasPermission(permission.resource, permission.action)) {
      this._permissions.push(permission);
      this._updatedAt = new Date();
    }
  }

  removePermission(resource: string, action: string): void {
    this._permissions = this._permissions.filter(
      (p) => !(p.resource === resource && p.action === action)
    );
    this._updatedAt = new Date();
  }

  get id(): string | undefined {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get displayName(): string {
    return this._displayName;
  }

  get description(): string | null {
    return this._description;
  }

  get isSystemRole(): boolean {
    return this._isSystemRole;
  }

  get permissions(): Permission[] {
    return [...this._permissions];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
