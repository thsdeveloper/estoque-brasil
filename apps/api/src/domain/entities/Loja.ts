import { CNPJ } from '../value-objects/CNPJ.js';
import { InvalidLojaError } from '../errors/InventarioErrors.js';

export interface LojaProps {
  id?: number;
  idCliente: string; // UUID reference to clients table
  nome: string;
  cnpj?: string | null;
}

export class Loja {
  private readonly _id?: number;
  private _idCliente: string;
  private _nome: string;
  private _cnpj: CNPJ | null;

  private constructor(props: LojaProps) {
    this._id = props.id;
    this._idCliente = props.idCliente;
    this._nome = props.nome;
    this._cnpj = CNPJ.create(props.cnpj);
  }

  static create(props: LojaProps): Loja {
    Loja.validate(props);
    return new Loja(props);
  }

  private static validate(props: LojaProps): void {
    if (!props.nome || props.nome.trim().length === 0) {
      throw new InvalidLojaError('Nome da loja é obrigatório');
    }

    if (props.nome.trim().length > 255) {
      throw new InvalidLojaError('Nome da loja deve ter no máximo 255 caracteres');
    }

    if (!props.idCliente || props.idCliente.trim().length === 0) {
      throw new InvalidLojaError('ID do cliente é obrigatório');
    }
  }

  update(props: Partial<Omit<LojaProps, 'id'>>): void {
    if (props.nome !== undefined) {
      if (!props.nome || props.nome.trim().length === 0) {
        throw new InvalidLojaError('Nome da loja é obrigatório');
      }
      if (props.nome.trim().length > 255) {
        throw new InvalidLojaError('Nome da loja deve ter no máximo 255 caracteres');
      }
      this._nome = props.nome;
    }

    if (props.idCliente !== undefined) {
      if (!props.idCliente || props.idCliente.trim().length === 0) {
        throw new InvalidLojaError('ID do cliente é obrigatório');
      }
      this._idCliente = props.idCliente;
    }

    if (props.cnpj !== undefined) {
      this._cnpj = CNPJ.create(props.cnpj);
    }
  }

  get id(): number | undefined {
    return this._id;
  }

  get idCliente(): string {
    return this._idCliente;
  }

  get nome(): string {
    return this._nome;
  }

  get cnpj(): string | null {
    return this._cnpj?.getValue() ?? null;
  }
}
