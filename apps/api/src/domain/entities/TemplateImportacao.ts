import { InvalidTemplateError } from '../errors/InventarioErrors.js';

export type TipoTemplate = 'CSV' | 'TXT' | 'XLS';
export type TipoSaldo = 'Q' | 'V' | 'A'; // Quantidade, Valor, Ambos

export interface TemplateImportacaoProps {
  id?: number;
  descricao: string;
  delimitador?: string;
  tipo?: TipoTemplate;
  tipoSaldo?: TipoSaldo;
}

export class TemplateImportacao {
  private readonly _id?: number;
  private _descricao: string;
  private _delimitador: string;
  private _tipo: TipoTemplate;
  private _tipoSaldo: TipoSaldo;

  private constructor(props: TemplateImportacaoProps) {
    this._id = props.id;
    this._descricao = props.descricao;
    this._delimitador = props.delimitador ?? ';';
    this._tipo = props.tipo ?? 'CSV';
    this._tipoSaldo = props.tipoSaldo ?? 'Q';
  }

  static create(props: TemplateImportacaoProps): TemplateImportacao {
    TemplateImportacao.validate(props);
    return new TemplateImportacao(props);
  }

  private static validate(props: TemplateImportacaoProps): void {
    if (!props.descricao || props.descricao.trim().length === 0) {
      throw new InvalidTemplateError('Descrição do template é obrigatória');
    }

    if (props.descricao.trim().length > 255) {
      throw new InvalidTemplateError('Descrição deve ter no máximo 255 caracteres');
    }

    if (props.tipo && !['CSV', 'TXT', 'XLS'].includes(props.tipo)) {
      throw new InvalidTemplateError('Tipo deve ser CSV, TXT ou XLS');
    }

    if (props.tipoSaldo && !['Q', 'V', 'A'].includes(props.tipoSaldo)) {
      throw new InvalidTemplateError('Tipo de saldo deve ser Q (Quantidade), V (Valor) ou A (Ambos)');
    }
  }

  update(props: Partial<Omit<TemplateImportacaoProps, 'id'>>): void {
    if (props.descricao !== undefined) {
      if (!props.descricao || props.descricao.trim().length === 0) {
        throw new InvalidTemplateError('Descrição do template é obrigatória');
      }
      if (props.descricao.trim().length > 255) {
        throw new InvalidTemplateError('Descrição deve ter no máximo 255 caracteres');
      }
      this._descricao = props.descricao;
    }

    if (props.delimitador !== undefined) {
      this._delimitador = props.delimitador;
    }

    if (props.tipo !== undefined) {
      if (!['CSV', 'TXT', 'XLS'].includes(props.tipo)) {
        throw new InvalidTemplateError('Tipo deve ser CSV, TXT ou XLS');
      }
      this._tipo = props.tipo;
    }

    if (props.tipoSaldo !== undefined) {
      if (!['Q', 'V', 'A'].includes(props.tipoSaldo)) {
        throw new InvalidTemplateError('Tipo de saldo deve ser Q (Quantidade), V (Valor) ou A (Ambos)');
      }
      this._tipoSaldo = props.tipoSaldo;
    }
  }

  get id(): number | undefined {
    return this._id;
  }

  get descricao(): string {
    return this._descricao;
  }

  get delimitador(): string {
    return this._delimitador;
  }

  get tipo(): TipoTemplate {
    return this._tipo;
  }

  get tipoSaldo(): TipoSaldo {
    return this._tipoSaldo;
  }
}
