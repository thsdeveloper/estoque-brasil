import { InvalidProdutoError } from '../errors/InventarioErrors.js';

export interface InventarioProdutoProps {
  id?: number;
  idInventario: number;
  codigoBarras?: string | null;
  codigoInterno?: string | null;
  descricao: string;
  lote?: string | null;
  validade?: Date | null;
  saldo?: number;
  custo?: number;
  divergente?: boolean;
}

export class InventarioProduto {
  private readonly _id?: number;
  private _idInventario: number;
  private _codigoBarras: string | null;
  private _codigoInterno: string | null;
  private _descricao: string;
  private _lote: string | null;
  private _validade: Date | null;
  private _saldo: number;
  private _custo: number;
  private _divergente: boolean;

  private constructor(props: InventarioProdutoProps) {
    this._id = props.id;
    this._idInventario = props.idInventario;
    this._codigoBarras = props.codigoBarras ?? null;
    this._codigoInterno = props.codigoInterno ?? null;
    this._descricao = props.descricao;
    this._lote = props.lote ?? null;
    this._validade = props.validade ?? null;
    this._saldo = props.saldo ?? 0;
    this._custo = props.custo ?? 0;
    this._divergente = props.divergente ?? false;
  }

  static create(props: InventarioProdutoProps): InventarioProduto {
    InventarioProduto.validate(props);
    return new InventarioProduto(props);
  }

  private static validate(props: InventarioProdutoProps): void {
    if (!props.idInventario || props.idInventario <= 0) {
      throw new InvalidProdutoError('ID do inventário é obrigatório');
    }

    if (!props.descricao || props.descricao.trim().length === 0) {
      throw new InvalidProdutoError('Descrição do produto é obrigatória');
    }

    if (props.descricao.trim().length > 500) {
      throw new InvalidProdutoError('Descrição deve ter no máximo 500 caracteres');
    }

    if (props.saldo !== undefined && props.saldo < 0) {
      throw new InvalidProdutoError('Saldo não pode ser negativo');
    }

    if (props.custo !== undefined && props.custo < 0) {
      throw new InvalidProdutoError('Custo não pode ser negativo');
    }
  }

  update(props: Partial<Omit<InventarioProdutoProps, 'id'>>): void {
    if (props.idInventario !== undefined) {
      if (!props.idInventario || props.idInventario <= 0) {
        throw new InvalidProdutoError('ID do inventário é obrigatório');
      }
      this._idInventario = props.idInventario;
    }

    if (props.codigoBarras !== undefined) {
      this._codigoBarras = props.codigoBarras;
    }

    if (props.codigoInterno !== undefined) {
      this._codigoInterno = props.codigoInterno;
    }

    if (props.descricao !== undefined) {
      if (!props.descricao || props.descricao.trim().length === 0) {
        throw new InvalidProdutoError('Descrição do produto é obrigatória');
      }
      if (props.descricao.trim().length > 500) {
        throw new InvalidProdutoError('Descrição deve ter no máximo 500 caracteres');
      }
      this._descricao = props.descricao;
    }

    if (props.lote !== undefined) {
      this._lote = props.lote;
    }

    if (props.validade !== undefined) {
      this._validade = props.validade;
    }

    if (props.saldo !== undefined) {
      if (props.saldo < 0) {
        throw new InvalidProdutoError('Saldo não pode ser negativo');
      }
      this._saldo = props.saldo;
    }

    if (props.custo !== undefined) {
      if (props.custo < 0) {
        throw new InvalidProdutoError('Custo não pode ser negativo');
      }
      this._custo = props.custo;
    }

    if (props.divergente !== undefined) {
      this._divergente = props.divergente;
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

  get idInventario(): number {
    return this._idInventario;
  }

  get codigoBarras(): string | null {
    return this._codigoBarras;
  }

  get codigoInterno(): string | null {
    return this._codigoInterno;
  }

  get descricao(): string {
    return this._descricao;
  }

  get lote(): string | null {
    return this._lote;
  }

  get validade(): Date | null {
    return this._validade;
  }

  get saldo(): number {
    return this._saldo;
  }

  get custo(): number {
    return this._custo;
  }

  get divergente(): boolean {
    return this._divergente;
  }
}
