import { InvalidSetorError } from '../errors/InventarioErrors.js';

export interface SetorProps {
  id?: number;
  idInventario: number;
  prefixo?: string | null;
  inicio: number;
  termino: number;
  descricao?: string | null;
}

export class Setor {
  private readonly _id?: number;
  private _idInventario: number;
  private _prefixo: string | null;
  private _inicio: number;
  private _termino: number;
  private _descricao: string | null;

  private constructor(props: SetorProps) {
    this._id = props.id;
    this._idInventario = props.idInventario;
    this._prefixo = props.prefixo ?? null;
    this._inicio = props.inicio;
    this._termino = props.termino;
    this._descricao = props.descricao ?? null;
  }

  static create(props: SetorProps): Setor {
    Setor.validate(props);
    return new Setor(props);
  }

  private static validate(props: SetorProps): void {
    if (!props.idInventario || props.idInventario <= 0) {
      throw new InvalidSetorError('ID do inventário é obrigatório');
    }

    if (props.inicio === undefined || props.inicio < 0) {
      throw new InvalidSetorError('Início é obrigatório e deve ser não-negativo');
    }

    if (props.termino === undefined || props.termino < 0) {
      throw new InvalidSetorError('Término é obrigatório e deve ser não-negativo');
    }

    if (props.termino < props.inicio) {
      throw new InvalidSetorError('Término não pode ser menor que o início');
    }

    if (props.prefixo && props.prefixo.length > 10) {
      throw new InvalidSetorError('Prefixo deve ter no máximo 10 caracteres');
    }
  }

  update(props: Partial<Omit<SetorProps, 'id'>>): void {
    if (props.idInventario !== undefined) {
      if (!props.idInventario || props.idInventario <= 0) {
        throw new InvalidSetorError('ID do inventário é obrigatório');
      }
      this._idInventario = props.idInventario;
    }

    if (props.prefixo !== undefined) {
      if (props.prefixo && props.prefixo.length > 10) {
        throw new InvalidSetorError('Prefixo deve ter no máximo 10 caracteres');
      }
      this._prefixo = props.prefixo;
    }

    if (props.inicio !== undefined) {
      if (props.inicio < 0) {
        throw new InvalidSetorError('Início deve ser não-negativo');
      }
      this._inicio = props.inicio;
    }

    if (props.termino !== undefined) {
      if (props.termino < 0) {
        throw new InvalidSetorError('Término deve ser não-negativo');
      }
      if (props.termino < this._inicio) {
        throw new InvalidSetorError('Término não pode ser menor que o início');
      }
      this._termino = props.termino;
    }

    if (props.descricao !== undefined) {
      this._descricao = props.descricao;
    }
  }

  get id(): number | undefined {
    return this._id;
  }

  get idInventario(): number {
    return this._idInventario;
  }

  get prefixo(): string | null {
    return this._prefixo;
  }

  get inicio(): number {
    return this._inicio;
  }

  get termino(): number {
    return this._termino;
  }

  get descricao(): string | null {
    return this._descricao;
  }

  /**
   * Gera a numeração completa do setor (ex: "A001" para prefixo "A" e número 1)
   */
  gerarNumeracao(numero: number): string {
    if (numero < this._inicio || numero > this._termino) {
      throw new InvalidSetorError(`Número ${numero} fora do intervalo do setor (${this._inicio}-${this._termino})`);
    }

    const digits = String(this._termino).length;
    const paddedNumber = String(numero).padStart(digits, '0');
    return this._prefixo ? `${this._prefixo}${paddedNumber}` : paddedNumber;
  }
}
