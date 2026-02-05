import { InvalidUFError } from '../errors/DomainError.js';

const VALID_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export type UFValue = typeof VALID_UFS[number];

export class UF {
  private readonly value: UFValue;

  private constructor(value: UFValue) {
    this.value = value;
  }

  static create(value: string | null | undefined): UF | null {
    if (!value) {
      return null;
    }

    const normalized = value.toUpperCase().trim() as UFValue;

    if (!VALID_UFS.includes(normalized)) {
      throw new InvalidUFError(value);
    }

    return new UF(normalized);
  }

  static isValid(value: string): boolean {
    return VALID_UFS.includes(value.toUpperCase() as UFValue);
  }

  getValue(): UFValue {
    return this.value;
  }

  equals(other: UF | null): boolean {
    if (!other) return false;
    return this.value === other.value;
  }
}
