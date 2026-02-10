import { CEP } from '../value-objects/CEP.js';
import { UF } from '../value-objects/UF.js';
import { CNPJ } from '../value-objects/CNPJ.js';
import { InvalidEmpresaError } from '../errors/InventarioErrors.js';

export interface EmpresaProps {
  id?: number;
  descricao?: string | null;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  codigoUf?: string | null;
  codigoMunicipio?: string | null;
  ativo?: boolean;
}

export class Empresa {
  private readonly _id?: number;
  private _descricao: string | null;
  private _cnpj: CNPJ;
  private _razaoSocial: string;
  private _nomeFantasia: string | null;
  private _cep: CEP | null;
  private _endereco: string | null;
  private _numero: string | null;
  private _bairro: string | null;
  private _codigoUf: UF | null;
  private _codigoMunicipio: string | null;
  private _ativo: boolean;

  private constructor(props: EmpresaProps) {
    this._id = props.id;
    this._descricao = props.descricao ?? null;
    const cnpj = CNPJ.create(props.cnpj);
    if (!cnpj) throw new InvalidEmpresaError('CNPJ é obrigatório');
    this._cnpj = cnpj;
    this._razaoSocial = props.razaoSocial;
    this._nomeFantasia = props.nomeFantasia ?? null;
    this._cep = CEP.create(props.cep);
    this._endereco = props.endereco ?? null;
    this._numero = props.numero ?? null;
    this._bairro = props.bairro ?? null;
    this._codigoUf = UF.create(props.codigoUf);
    this._codigoMunicipio = props.codigoMunicipio ?? null;
    this._ativo = props.ativo ?? true;
  }

  static create(props: EmpresaProps): Empresa {
    Empresa.validate(props);
    return new Empresa(props);
  }

  private static validate(props: EmpresaProps): void {
    if (!props.cnpj || props.cnpj.trim().length === 0) {
      throw new InvalidEmpresaError('CNPJ é obrigatório');
    }

    if (!props.razaoSocial || props.razaoSocial.trim().length === 0) {
      throw new InvalidEmpresaError('Razão social é obrigatória');
    }

    if (props.razaoSocial.trim().length > 255) {
      throw new InvalidEmpresaError('Razão social deve ter no máximo 255 caracteres');
    }

    if (props.nomeFantasia && props.nomeFantasia.trim().length > 255) {
      throw new InvalidEmpresaError('Nome fantasia deve ter no máximo 255 caracteres');
    }
  }

  update(props: Partial<Omit<EmpresaProps, 'id'>>): void {
    if (props.descricao !== undefined) {
      this._descricao = props.descricao ?? null;
    }

    if (props.cnpj !== undefined) {
      const cnpj = CNPJ.create(props.cnpj);
      if (!cnpj) throw new InvalidEmpresaError('CNPJ é obrigatório');
      this._cnpj = cnpj;
    }

    if (props.razaoSocial !== undefined) {
      if (!props.razaoSocial || props.razaoSocial.trim().length === 0) {
        throw new InvalidEmpresaError('Razão social é obrigatória');
      }
      if (props.razaoSocial.trim().length > 255) {
        throw new InvalidEmpresaError('Razão social deve ter no máximo 255 caracteres');
      }
      this._razaoSocial = props.razaoSocial;
    }

    if (props.nomeFantasia !== undefined) {
      if (props.nomeFantasia && props.nomeFantasia.trim().length > 255) {
        throw new InvalidEmpresaError('Nome fantasia deve ter no máximo 255 caracteres');
      }
      this._nomeFantasia = props.nomeFantasia ?? null;
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

    if (props.codigoUf !== undefined) {
      this._codigoUf = UF.create(props.codigoUf);
    }

    if (props.codigoMunicipio !== undefined) {
      this._codigoMunicipio = props.codigoMunicipio ?? null;
    }

    if (props.ativo !== undefined) {
      this._ativo = props.ativo;
    }
  }

  get id(): number | undefined {
    return this._id;
  }

  get descricao(): string | null {
    return this._descricao;
  }

  get cnpj(): string {
    return this._cnpj.getValue();
  }

  get razaoSocial(): string {
    return this._razaoSocial;
  }

  get nomeFantasia(): string | null {
    return this._nomeFantasia;
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

  get codigoUf(): string | null {
    return this._codigoUf?.getValue() ?? null;
  }

  get codigoMunicipio(): string | null {
    return this._codigoMunicipio;
  }

  get ativo(): boolean {
    return this._ativo;
  }
}
