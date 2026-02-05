import { CEP } from '../value-objects/CEP.js';
import { UF } from '../value-objects/UF.js';
import { Percentage } from '../value-objects/Percentage.js';
import { InvalidClientError } from '../errors/DomainError.js';

export interface ClientProps {
  id?: string;
  nome: string;
  linkBi?: string | null;
  qtdeDivergentePlus?: number | null;
  qtdeDivergenteMinus?: number | null;
  valorDivergentePlus?: number | null;
  valorDivergenteMinus?: number | null;
  percentualDivergencia?: number | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  uf?: string | null;
  municipio?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Client {
  private readonly _id?: string;
  private _nome: string;
  private _linkBi: string | null;
  private _qtdeDivergentePlus: number | null;
  private _qtdeDivergenteMinus: number | null;
  private _valorDivergentePlus: number | null;
  private _valorDivergenteMinus: number | null;
  private _percentualDivergencia: Percentage | null;
  private _cep: CEP | null;
  private _endereco: string | null;
  private _numero: string | null;
  private _bairro: string | null;
  private _uf: UF | null;
  private _municipio: string | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ClientProps) {
    this._id = props.id;
    this._nome = props.nome;
    this._linkBi = props.linkBi ?? null;
    this._qtdeDivergentePlus = props.qtdeDivergentePlus ?? null;
    this._qtdeDivergenteMinus = props.qtdeDivergenteMinus ?? null;
    this._valorDivergentePlus = props.valorDivergentePlus ?? null;
    this._valorDivergenteMinus = props.valorDivergenteMinus ?? null;
    this._percentualDivergencia = Percentage.create(props.percentualDivergencia);
    this._cep = CEP.create(props.cep);
    this._endereco = props.endereco ?? null;
    this._numero = props.numero ?? null;
    this._bairro = props.bairro ?? null;
    this._uf = UF.create(props.uf);
    this._municipio = props.municipio ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static create(props: ClientProps): Client {
    Client.validate(props);
    return new Client(props);
  }

  private static validate(props: ClientProps): void {
    if (!props.nome || props.nome.trim().length === 0) {
      throw new InvalidClientError('Nome é obrigatório');
    }

    if (props.nome.trim().length > 255) {
      throw new InvalidClientError('Nome deve ter no máximo 255 caracteres');
    }

    if (props.linkBi && !Client.isValidUrl(props.linkBi)) {
      throw new InvalidClientError('Link BI deve ser uma URL válida');
    }
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  update(props: Partial<Omit<ClientProps, 'id' | 'createdAt'>>): void {
    if (props.nome !== undefined) {
      if (!props.nome || props.nome.trim().length === 0) {
        throw new InvalidClientError('Nome é obrigatório');
      }
      if (props.nome.trim().length > 255) {
        throw new InvalidClientError('Nome deve ter no máximo 255 caracteres');
      }
      this._nome = props.nome;
    }

    if (props.linkBi !== undefined) {
      if (props.linkBi && !Client.isValidUrl(props.linkBi)) {
        throw new InvalidClientError('Link BI deve ser uma URL válida');
      }
      this._linkBi = props.linkBi ?? null;
    }

    if (props.qtdeDivergentePlus !== undefined) {
      this._qtdeDivergentePlus = props.qtdeDivergentePlus ?? null;
    }

    if (props.qtdeDivergenteMinus !== undefined) {
      this._qtdeDivergenteMinus = props.qtdeDivergenteMinus ?? null;
    }

    if (props.valorDivergentePlus !== undefined) {
      this._valorDivergentePlus = props.valorDivergentePlus ?? null;
    }

    if (props.valorDivergenteMinus !== undefined) {
      this._valorDivergenteMinus = props.valorDivergenteMinus ?? null;
    }

    if (props.percentualDivergencia !== undefined) {
      this._percentualDivergencia = Percentage.create(props.percentualDivergencia);
    }

    if (props.cep !== undefined) {
      this._cep = CEP.create(props.cep);
    }

    if (props.endereco !== undefined) {
      this._endereco = props.endereco ?? null;
    }

    if (props.numero !== undefined) {
      this._numero = props.numero ?? null;
    }

    if (props.bairro !== undefined) {
      this._bairro = props.bairro ?? null;
    }

    if (props.uf !== undefined) {
      this._uf = UF.create(props.uf);
    }

    if (props.municipio !== undefined) {
      this._municipio = props.municipio ?? null;
    }

    this._updatedAt = new Date();
  }

  get id(): string | undefined {
    return this._id;
  }

  get nome(): string {
    return this._nome;
  }

  get linkBi(): string | null {
    return this._linkBi;
  }

  get qtdeDivergentePlus(): number | null {
    return this._qtdeDivergentePlus;
  }

  get qtdeDivergenteMinus(): number | null {
    return this._qtdeDivergenteMinus;
  }

  get valorDivergentePlus(): number | null {
    return this._valorDivergentePlus;
  }

  get valorDivergenteMinus(): number | null {
    return this._valorDivergenteMinus;
  }

  get percentualDivergencia(): number | null {
    return this._percentualDivergencia?.getValue() ?? null;
  }

  get cep(): string | null {
    return this._cep?.getValue() ?? null;
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
    return this._uf?.getValue() ?? null;
  }

  get municipio(): string | null {
    return this._municipio;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
