import { InvalidAccessResourceError } from '../errors/AccessErrors.js';

export interface AccessResourceProps {
  id?: string;
  name: string;
  displayName: string;
  description?: string | null;
  icon?: string | null;
  isSystem?: boolean;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AccessResource {
  private readonly _id?: string;
  private _name: string;
  private _displayName: string;
  private _description: string | null;
  private _icon: string | null;
  private readonly _isSystem: boolean;
  private _sortOrder: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: AccessResourceProps) {
    this._id = props.id;
    this._name = props.name;
    this._displayName = props.displayName;
    this._description = props.description ?? null;
    this._icon = props.icon ?? null;
    this._isSystem = props.isSystem ?? false;
    this._sortOrder = props.sortOrder ?? 0;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: AccessResourceProps): AccessResource {
    AccessResource.validate(props);
    return new AccessResource(props);
  }

  private static validate(props: AccessResourceProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new InvalidAccessResourceError('Nome é obrigatório');
    }

    if (props.name.trim().length > 50) {
      throw new InvalidAccessResourceError('Nome deve ter no máximo 50 caracteres');
    }

    if (!/^[a-z_]+$/.test(props.name)) {
      throw new InvalidAccessResourceError('Nome deve conter apenas letras minúsculas e underscores');
    }

    if (!props.displayName || props.displayName.trim().length === 0) {
      throw new InvalidAccessResourceError('Nome de exibição é obrigatório');
    }

    if (props.displayName.trim().length > 100) {
      throw new InvalidAccessResourceError('Nome de exibição deve ter no máximo 100 caracteres');
    }
  }

  update(props: Partial<Omit<AccessResourceProps, 'id' | 'createdAt' | 'isSystem'>>): void {
    if (props.displayName !== undefined) {
      if (!props.displayName || props.displayName.trim().length === 0) {
        throw new InvalidAccessResourceError('Nome de exibição é obrigatório');
      }
      this._displayName = props.displayName;
    }

    if (props.description !== undefined) {
      this._description = props.description ?? null;
    }

    if (props.icon !== undefined) {
      this._icon = props.icon ?? null;
    }

    if (props.sortOrder !== undefined) {
      this._sortOrder = props.sortOrder;
    }

    this._updatedAt = new Date();
  }

  get id(): string | undefined { return this._id; }
  get name(): string { return this._name; }
  get displayName(): string { return this._displayName; }
  get description(): string | null { return this._description; }
  get icon(): string | null { return this._icon; }
  get isSystem(): boolean { return this._isSystem; }
  get sortOrder(): number { return this._sortOrder; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
}
