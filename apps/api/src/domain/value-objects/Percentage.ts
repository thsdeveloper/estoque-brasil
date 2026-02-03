import { InvalidPercentageError } from '../errors/DomainError.js';

export class Percentage {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(value: number | null | undefined): Percentage | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (value < 0 || value > 100) {
      throw new InvalidPercentageError(value);
    }

    return new Percentage(value);
  }

  getValue(): number {
    return this.value;
  }

  getDecimal(): number {
    return this.value / 100;
  }

  getFormatted(): string {
    return `${this.value.toFixed(2)}%`;
  }

  equals(other: Percentage | null): boolean {
    if (!other) return false;
    return this.value === other.value;
  }
}
