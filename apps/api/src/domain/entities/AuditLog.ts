export interface AuditLogProps {
  id?: string;
  acao: string;
  descricao?: string | null;
  idUsuario: string;
  nomeUsuario?: string | null;
  idInventario?: number | null;
  idSetor?: number | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: Date;
}

export class AuditLog {
  private readonly _id?: string;
  private _acao: string;
  private _descricao: string | null;
  private _idUsuario: string;
  private _nomeUsuario: string | null;
  private _idInventario: number | null;
  private _idSetor: number | null;
  private _metadata: Record<string, unknown> | null;
  private _ipAddress: string | null;
  private _userAgent: string | null;
  private _createdAt: Date;

  private constructor(props: AuditLogProps) {
    this._id = props.id;
    this._acao = props.acao;
    this._descricao = props.descricao ?? null;
    this._idUsuario = props.idUsuario;
    this._nomeUsuario = props.nomeUsuario ?? null;
    this._idInventario = props.idInventario ?? null;
    this._idSetor = props.idSetor ?? null;
    this._metadata = props.metadata ?? null;
    this._ipAddress = props.ipAddress ?? null;
    this._userAgent = props.userAgent ?? null;
    this._createdAt = props.createdAt ?? new Date();
  }

  static create(props: AuditLogProps): AuditLog {
    if (!props.acao || props.acao.trim().length === 0) {
      throw new Error('Ação é obrigatória para o log de auditoria');
    }
    if (!props.idUsuario || props.idUsuario.trim().length === 0) {
      throw new Error('ID do usuário é obrigatório para o log de auditoria');
    }
    return new AuditLog(props);
  }

  get id(): string | undefined { return this._id; }
  get acao(): string { return this._acao; }
  get descricao(): string | null { return this._descricao; }
  get idUsuario(): string { return this._idUsuario; }
  get nomeUsuario(): string | null { return this._nomeUsuario; }
  get idInventario(): number | null { return this._idInventario; }
  get idSetor(): number | null { return this._idSetor; }
  get metadata(): Record<string, unknown> | null { return this._metadata; }
  get ipAddress(): string | null { return this._ipAddress; }
  get userAgent(): string | null { return this._userAgent; }
  get createdAt(): Date { return this._createdAt; }
}
