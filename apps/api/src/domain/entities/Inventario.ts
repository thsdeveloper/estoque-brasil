import { InvalidInventarioError } from '../errors/InventarioErrors.js';

export interface InventarioProps {
  id?: number;
  idLoja: number;
  idEmpresa: number;
  idTemplate?: number | null;
  idTemplateExportacao?: number | null;
  minimoContagem?: number;
  dataInicio: Date;
  dataTermino?: Date | null;
  lote?: boolean;
  validade?: boolean;
  ativo?: boolean;
  // Enriched fields (from joins)
  nomeLoja?: string | null;
  cnpjLoja?: string | null;
  nomeCliente?: string | null;
}

export class Inventario {
  private readonly _id?: number;
  private _idLoja: number;
  private _idEmpresa: number;
  private _idTemplate: number | null;
  private _idTemplateExportacao: number | null;
  private _minimoContagem: number;
  private _dataInicio: Date;
  private _dataTermino: Date | null;
  private _lote: boolean;
  private _validade: boolean;
  private _ativo: boolean;
  private _nomeLoja: string | null;
  private _cnpjLoja: string | null;
  private _nomeCliente: string | null;

  private constructor(props: InventarioProps) {
    this._id = props.id;
    this._idLoja = props.idLoja;
    this._idEmpresa = props.idEmpresa;
    this._idTemplate = props.idTemplate ?? null;
    this._idTemplateExportacao = props.idTemplateExportacao ?? null;
    this._minimoContagem = props.minimoContagem ?? 1;
    this._dataInicio = props.dataInicio;
    this._dataTermino = props.dataTermino ?? null;
    this._lote = props.lote ?? false;
    this._validade = props.validade ?? false;
    this._ativo = props.ativo ?? true;
    this._nomeLoja = props.nomeLoja ?? null;
    this._cnpjLoja = props.cnpjLoja ?? null;
    this._nomeCliente = props.nomeCliente ?? null;
  }

  static create(props: InventarioProps): Inventario {
    Inventario.validate(props);
    return new Inventario(props);
  }

  private static validate(props: InventarioProps): void {
    if (!props.idLoja || props.idLoja <= 0) {
      throw new InvalidInventarioError('ID da loja é obrigatório');
    }

    if (!props.idEmpresa || props.idEmpresa <= 0) {
      throw new InvalidInventarioError('ID da empresa é obrigatório');
    }

    if (!props.dataInicio) {
      throw new InvalidInventarioError('Data de início é obrigatória');
    }

    if (props.dataTermino && props.dataTermino < props.dataInicio) {
      throw new InvalidInventarioError('Data de término não pode ser anterior à data de início');
    }

    if (props.minimoContagem !== undefined && props.minimoContagem < 1) {
      throw new InvalidInventarioError('Mínimo de contagem deve ser pelo menos 1');
    }
  }

  update(props: Partial<Omit<InventarioProps, 'id'>>): void {
    if (props.idLoja !== undefined) {
      if (!props.idLoja || props.idLoja <= 0) {
        throw new InvalidInventarioError('ID da loja é obrigatório');
      }
      this._idLoja = props.idLoja;
    }

    if (props.idEmpresa !== undefined) {
      if (!props.idEmpresa || props.idEmpresa <= 0) {
        throw new InvalidInventarioError('ID da empresa é obrigatório');
      }
      this._idEmpresa = props.idEmpresa;
    }

    if (props.idTemplate !== undefined) {
      this._idTemplate = props.idTemplate;
    }

    if (props.idTemplateExportacao !== undefined) {
      this._idTemplateExportacao = props.idTemplateExportacao;
    }

    if (props.minimoContagem !== undefined) {
      if (props.minimoContagem < 1) {
        throw new InvalidInventarioError('Mínimo de contagem deve ser pelo menos 1');
      }
      this._minimoContagem = props.minimoContagem;
    }

    if (props.dataInicio !== undefined) {
      this._dataInicio = props.dataInicio;
    }

    if (props.dataTermino !== undefined) {
      if (props.dataTermino && props.dataTermino < this._dataInicio) {
        throw new InvalidInventarioError('Data de término não pode ser anterior à data de início');
      }
      this._dataTermino = props.dataTermino;
    }

    if (props.lote !== undefined) {
      this._lote = props.lote;
    }

    if (props.validade !== undefined) {
      this._validade = props.validade;
    }

    if (props.ativo !== undefined) {
      this._ativo = props.ativo;
    }
  }

  finalizar(): void {
    if (!this._ativo) {
      throw new InvalidInventarioError('Inventário já está finalizado');
    }
    this._dataTermino = new Date();
    this._ativo = false;
  }

  reabrir(): void {
    if (this._ativo) {
      throw new InvalidInventarioError('Inventário já está ativo');
    }
    this._dataTermino = null;
    this._ativo = true;
  }

  get id(): number | undefined {
    return this._id;
  }

  get idLoja(): number {
    return this._idLoja;
  }

  get idEmpresa(): number {
    return this._idEmpresa;
  }

  get idTemplate(): number | null {
    return this._idTemplate;
  }

  get idTemplateExportacao(): number | null {
    return this._idTemplateExportacao;
  }

  get minimoContagem(): number {
    return this._minimoContagem;
  }

  get dataInicio(): Date {
    return this._dataInicio;
  }

  get dataTermino(): Date | null {
    return this._dataTermino;
  }

  get lote(): boolean {
    return this._lote;
  }

  get validade(): boolean {
    return this._validade;
  }

  get ativo(): boolean {
    return this._ativo;
  }

  get nomeLoja(): string | null {
    return this._nomeLoja;
  }

  get cnpjLoja(): string | null {
    return this._cnpjLoja;
  }

  get nomeCliente(): string | null {
    return this._nomeCliente;
  }
}
