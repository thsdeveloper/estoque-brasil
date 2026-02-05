export type PermissionAction = 'read' | 'create' | 'update' | 'delete';

export interface PermissionProps {
  id?: string;
  resource: string;
  action: PermissionAction;
  description?: string | null;
  createdAt?: Date;
}

export class Permission {
  private readonly _id?: string;
  private readonly _resource: string;
  private readonly _action: PermissionAction;
  private readonly _description: string | null;
  private readonly _createdAt: Date;

  private constructor(props: PermissionProps) {
    this._id = props.id;
    this._resource = props.resource;
    this._action = props.action;
    this._description = props.description ?? null;
    this._createdAt = props.createdAt ?? new Date();
  }

  static create(props: PermissionProps): Permission {
    Permission.validate(props);
    return new Permission(props);
  }

  private static validate(props: PermissionProps): void {
    if (!props.resource || props.resource.trim().length === 0) {
      throw new Error('Resource é obrigatório');
    }

    if (!props.action || !['read', 'create', 'update', 'delete'].includes(props.action)) {
      throw new Error('Action deve ser: read, create, update ou delete');
    }
  }

  get id(): string | undefined {
    return this._id;
  }

  get resource(): string {
    return this._resource;
  }

  get action(): PermissionAction {
    return this._action;
  }

  get description(): string | null {
    return this._description;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get key(): string {
    return `${this._resource}:${this._action}`;
  }
}
