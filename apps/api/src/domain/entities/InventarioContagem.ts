import { InvalidContagemError } from '../errors/InventarioErrors.js';

export interface InventarioContagemProps {
  id?: number;
  idInventarioSetor: number;
  idProduto: number;
  data?: Date;
  lote?: string | null;
  validade?: Date | null;
  quantidade: number;
  divergente?: boolean;
  divergenteSaldo?: boolean;
  reconferido?: boolean;
  idUsuario?: string | null;
}

export class InventarioContagem {
  private readonly _id?: number;
  private _idInventarioSetor: number;
  private _idProduto: number;
  private _data: Date;
  private _lote: string | null;
  private _validade: Date | null;
  private _quantidade: number;
  private _divergente: boolean;
  private _divergenteSaldo: boolean;
  private _reconferido: boolean;
  private _idUsuario: string | null;

  private constructor(props: InventarioContagemProps) {
    this._id = props.id;
    this._idInventarioSetor = props.idInventarioSetor;
    this._idProduto = props.idProduto;
    this._data = props.data ?? new Date();
    this._lote = props.lote ?? null;
    this._validade = props.validade ?? null;
    this._quantidade = props.quantidade;
    this._divergente = props.divergente ?? false;
    this._divergenteSaldo = props.divergenteSaldo ?? false;
    this._reconferido = props.reconferido ?? false;
    this._idUsuario = props.idUsuario ?? null;
  }

  static create(props: InventarioContagemProps): InventarioContagem {
    InventarioContagem.validate(props);
    return new InventarioContagem(props);
  }

  private static validate(props: InventarioContagemProps): void {
    if (!props.idInventarioSetor || props.idInventarioSetor <= 0) {
      throw new InvalidContagemError('ID do setor do inventário é obrigatório');
    }

    if (!props.idProduto || props.idProduto <= 0) {
      throw new InvalidContagemError('ID do produto é obrigatório');
    }

    if (props.quantidade === undefined || props.quantidade < 0) {
      throw new InvalidContagemError('Quantidade deve ser não-negativa');
    }
  }

  update(props: Partial<Omit<InventarioContagemProps, 'id'>>): void {
    if (props.idInventarioSetor !== undefined) {
      if (!props.idInventarioSetor || props.idInventarioSetor <= 0) {
        throw new InvalidContagemError('ID do setor do inventário é obrigatório');
      }
      this._idInventarioSetor = props.idInventarioSetor;
    }

    if (props.idProduto !== undefined) {
      if (!props.idProduto || props.idProduto <= 0) {
        throw new InvalidContagemError('ID do produto é obrigatório');
      }
      this._idProduto = props.idProduto;
    }

    if (props.data !== undefined) {
      this._data = props.data;
    }

    if (props.lote !== undefined) {
      this._lote = props.lote;
    }

    if (props.validade !== undefined) {
      this._validade = props.validade;
    }

    if (props.quantidade !== undefined) {
      if (props.quantidade < 0) {
        throw new InvalidContagemError('Quantidade deve ser não-negativa');
      }
      this._quantidade = props.quantidade;
    }

    if (props.divergente !== undefined) {
      this._divergente = props.divergente;
    }

    if (props.divergenteSaldo !== undefined) {
      this._divergenteSaldo = props.divergenteSaldo;
    }

    if (props.reconferido !== undefined) {
      this._reconferido = props.reconferido;
    }
  }

  marcarDivergente(): void {
    this._divergente = true;
  }

  desmarcarDivergente(): void {
    this._divergente = false;
  }

  get id(): number | undefined {
    return this._id;
  }

  get idInventarioSetor(): number {
    return this._idInventarioSetor;
  }

  get idProduto(): number {
    return this._idProduto;
  }

  get data(): Date {
    return this._data;
  }

  get lote(): string | null {
    return this._lote;
  }

  get validade(): Date | null {
    return this._validade;
  }

  get quantidade(): number {
    return this._quantidade;
  }

  get divergente(): boolean {
    return this._divergente;
  }

  get divergenteSaldo(): boolean {
    return this._divergenteSaldo;
  }

  get reconferido(): boolean {
    return this._reconferido;
  }

  get idUsuario(): string | null {
    return this._idUsuario;
  }
}
