import { Permission } from './Permission.js';
import { InvalidAccessPolicyError } from '../errors/AccessErrors.js';

export interface AccessPolicyProps {
  id?: string;
  name: string;
  displayName: string;
  description?: string | null;
  icon?: string | null;
  isSystemPolicy?: boolean;
  permissions?: Permission[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class AccessPolicy {
  private readonly _id?: string;
  private _name: string;
  private _displayName: string;
  private _description: string | null;
  private _icon: string | null;
  private readonly _isSystemPolicy: boolean;
  private _permissions: Permission[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: AccessPolicyProps) {
    this._id = props.id;
    this._name = props.name;
    this._displayName = props.displayName;
    this._description = props.description ?? null;
    this._icon = props.icon ?? null;
    this._isSystemPolicy = props.isSystemPolicy ?? false;
    this._permissions = props.permissions ?? [];
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: AccessPolicyProps): AccessPolicy {
    AccessPolicy.validate(props);
    return new AccessPolicy(props);
  }

  private static validate(props: AccessPolicyProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new InvalidAccessPolicyError('Nome é obrigatório');
    }

    if (props.name.trim().length > 50) {
      throw new InvalidAccessPolicyError('Nome deve ter no máximo 50 caracteres');
    }

    if (!/^[a-z_]+$/.test(props.name)) {
      throw new InvalidAccessPolicyError('Nome deve conter apenas letras minúsculas e underscores');
    }

    if (!props.displayName || props.displayName.trim().length === 0) {
      throw new InvalidAccessPolicyError('Nome de exibição é obrigatório');
    }

    if (props.displayName.trim().length > 100) {
      throw new InvalidAccessPolicyError('Nome de exibição deve ter no máximo 100 caracteres');
    }
  }

  update(props: Partial<Omit<AccessPolicyProps, 'id' | 'createdAt' | 'isSystemPolicy'>>): void {
    if (props.displayName !== undefined) {
      if (!props.displayName || props.displayName.trim().length === 0) {
        throw new InvalidAccessPolicyError('Nome de exibição é obrigatório');
      }
      this._displayName = props.displayName;
    }

    if (props.description !== undefined) {
      this._description = props.description ?? null;
    }

    if (props.icon !== undefined) {
      this._icon = props.icon ?? null;
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

  get id(): string | undefined { return this._id; }
  get name(): string { return this._name; }
  get displayName(): string { return this._displayName; }
  get description(): string | null { return this._description; }
  get icon(): string | null { return this._icon; }
  get isSystemPolicy(): boolean { return this._isSystemPolicy; }
  get permissions(): Permission[] { return [...this._permissions]; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
}
