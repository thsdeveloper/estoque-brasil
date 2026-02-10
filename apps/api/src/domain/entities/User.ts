import { Role } from './Role.js';
import { InvalidUserError } from '../errors/UserErrors.js';

export interface UserProps {
  id?: string;
  email: string;
  fullName: string;
  cpf?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive?: boolean;
  lastLoginAt?: Date | null;
  roles?: Role[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private readonly _id?: string;
  private _email: string;
  private _fullName: string;
  private _cpf: string | null;
  private _phone: string | null;
  private _avatarUrl: string | null;
  private _isActive: boolean;
  private _lastLoginAt: Date | null;
  private _roles: Role[];
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: UserProps) {
    this._id = props.id;
    this._email = props.email;
    this._fullName = props.fullName;
    this._cpf = props.cpf ?? null;
    this._phone = props.phone ?? null;
    this._avatarUrl = props.avatarUrl ?? null;
    this._isActive = props.isActive ?? true;
    this._lastLoginAt = props.lastLoginAt ?? null;
    this._roles = props.roles ?? [];
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: UserProps): User {
    User.validate(props);
    return new User(props);
  }

  private static validate(props: UserProps): void {
    if (!props.email || props.email.trim().length === 0) {
      throw new InvalidUserError('Email é obrigatório');
    }

    if (!User.isValidEmail(props.email)) {
      throw new InvalidUserError('Email inválido');
    }

    if (!props.fullName || props.fullName.trim().length === 0) {
      throw new InvalidUserError('Nome completo é obrigatório');
    }

    if (props.fullName.trim().length > 255) {
      throw new InvalidUserError('Nome completo deve ter no máximo 255 caracteres');
    }

    if (props.phone && props.phone.length > 20) {
      throw new InvalidUserError('Telefone deve ter no máximo 20 caracteres');
    }
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  update(props: Partial<Omit<UserProps, 'id' | 'createdAt' | 'email'>>): void {
    if (props.fullName !== undefined) {
      if (!props.fullName || props.fullName.trim().length === 0) {
        throw new InvalidUserError('Nome completo é obrigatório');
      }
      if (props.fullName.trim().length > 255) {
        throw new InvalidUserError('Nome completo deve ter no máximo 255 caracteres');
      }
      this._fullName = props.fullName;
    }

    if (props.phone !== undefined) {
      if (props.phone && props.phone.length > 20) {
        throw new InvalidUserError('Telefone deve ter no máximo 20 caracteres');
      }
      this._phone = props.phone ?? null;
    }

    if (props.avatarUrl !== undefined) {
      this._avatarUrl = props.avatarUrl ?? null;
    }

    if (props.isActive !== undefined) {
      this._isActive = props.isActive;
    }

    if (props.lastLoginAt !== undefined) {
      this._lastLoginAt = props.lastLoginAt ?? null;
    }

    if (props.roles !== undefined) {
      this._roles = props.roles;
    }

    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  updateLastLogin(): void {
    this._lastLoginAt = new Date();
    this._updatedAt = new Date();
  }

  hasPermission(resource: string, action: string): boolean {
    return this._roles.some((role) => role.hasPermission(resource, action));
  }

  hasRole(roleName: string): boolean {
    return this._roles.some((role) => role.name === roleName);
  }

  addRole(role: Role): void {
    if (!this.hasRole(role.name)) {
      this._roles.push(role);
      this._updatedAt = new Date();
    }
  }

  removeRole(roleName: string): void {
    this._roles = this._roles.filter((role) => role.name !== roleName);
    this._updatedAt = new Date();
  }

  get id(): string | undefined {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get cpf(): string | null {
    return this._cpf;
  }

  get fullName(): string {
    return this._fullName;
  }

  get phone(): string | null {
    return this._phone;
  }

  get avatarUrl(): string | null {
    return this._avatarUrl;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }

  get roles(): Role[] {
    return [...this._roles];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get roleNames(): string[] {
    return this._roles.map((role) => role.name);
  }
}
