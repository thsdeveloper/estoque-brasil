import { InvalidAccessActionError } from '../errors/AccessErrors.js';

export interface AccessActionProps {
  id?: string;
  name: string;
  displayName: string;
  description?: string | null;
  isSystem?: boolean;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AccessAction {
  private readonly _id?: string;
  private _name: string;
  private _displayName: string;
  private _description: string | null;
  private readonly _isSystem: boolean;
  private _sortOrder: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: AccessActionProps) {
    this._id = props.id;
    this._name = props.name;
    this._displayName = props.displayName;
    this._description = props.description ?? null;
    this._isSystem = props.isSystem ?? false;
    this._sortOrder = props.sortOrder ?? 0;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: AccessActionProps): AccessAction {
    AccessAction.validate(props);
    return new AccessAction(props);
  }

  private static validate(props: AccessActionProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new InvalidAccessActionError('Nome é obrigatório');
    }

    if (props.name.trim().length > 50) {
      throw new InvalidAccessActionError('Nome deve ter no máximo 50 caracteres');
    }

    if (!/^[a-z_]+$/.test(props.name)) {
      throw new InvalidAccessActionError('Nome deve conter apenas letras minúsculas e underscores');
    }

    if (!props.displayName || props.displayName.trim().length === 0) {
      throw new InvalidAccessActionError('Nome de exibição é obrigatório');
    }

    if (props.displayName.trim().length > 100) {
      throw new InvalidAccessActionError('Nome de exibição deve ter no máximo 100 caracteres');
    }
  }

  update(props: Partial<Omit<AccessActionProps, 'id' | 'createdAt' | 'isSystem'>>): void {
    if (props.displayName !== undefined) {
      if (!props.displayName || props.displayName.trim().length === 0) {
        throw new InvalidAccessActionError('Nome de exibição é obrigatório');
      }
      this._displayName = props.displayName;
    }

    if (props.description !== undefined) {
      this._description = props.description ?? null;
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
  get isSystem(): boolean { return this._isSystem; }
  get sortOrder(): number { return this._sortOrder; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
}
