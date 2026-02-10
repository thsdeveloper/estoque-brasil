import { CNPJ } from '../value-objects/CNPJ.js';
import { InvalidLojaError } from '../errors/InventarioErrors.js';

export interface LojaProps {
  id?: number;
  idCliente: string; // UUID reference to clients table
  nome: string;
  cnpj?: string | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  uf?: string | null;
  municipio?: string | null;
}

export class Loja {
  private readonly _id?: number;
  private _idCliente: string;
  private _nome: string;
  private _cnpj: CNPJ | null;
  private _cep: string | null;
  private _endereco: string | null;
  private _numero: string | null;
  private _bairro: string | null;
  private _uf: string | null;
  private _municipio: string | null;

  private constructor(props: LojaProps) {
    this._id = props.id;
    this._idCliente = props.idCliente;
    this._nome = props.nome;
    this._cnpj = CNPJ.create(props.cnpj);
    this._cep = props.cep ?? null;
    this._endereco = props.endereco ?? null;
    this._numero = props.numero ?? null;
    this._bairro = props.bairro ?? null;
    this._uf = props.uf ?? null;
    this._municipio = props.municipio ?? null;
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

    if (props.cep !== undefined) this._cep = props.cep ?? null;
    if (props.endereco !== undefined) this._endereco = props.endereco ?? null;
    if (props.numero !== undefined) this._numero = props.numero ?? null;
    if (props.bairro !== undefined) this._bairro = props.bairro ?? null;
    if (props.uf !== undefined) this._uf = props.uf ?? null;
    if (props.municipio !== undefined) this._municipio = props.municipio ?? null;
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

  get cep(): string | null {
    return this._cep;
  }

  get endereco(): string | null {
    return this._endereco;
  }

  get numero(): string | null {
    return this._numero;
  }

  get bairro(): string | null {
    return this._bairro;
  }

  get uf(): string | null {
    return this._uf;
  }

  get municipio(): string | null {
    return this._municipio;
  }
}
