import { InvalidCEPError } from '../errors/DomainError.js';

export class CEP {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string | null | undefined): CEP | null {
    if (!value) {
      return null;
    }

    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length !== 8) {
      throw new InvalidCEPError(value);
    }

    return new CEP(cleaned);
  }

  getValue(): string {
    return this.value;
  }

  getFormatted(): string {
    return `${this.value.slice(0, 5)}-${this.value.slice(5)}`;
  }

  equals(other: CEP | null): boolean {
    if (!other) return false;
    return this.value === other.value;
  }
}
