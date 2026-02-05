import { InvalidCNPJError } from '../errors/InventarioErrors.js';

export class CNPJ {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string | null | undefined): CNPJ | null {
    if (!value) {
      return null;
    }

    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length !== 14) {
      throw new InvalidCNPJError(value);
    }

    if (!CNPJ.isValidCNPJ(cleaned)) {
      throw new InvalidCNPJError(value);
    }

    return new CNPJ(cleaned);
  }

  private static isValidCNPJ(cnpj: string): boolean {
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) {
      return false;
    }

    // Validação dos dígitos verificadores
    let soma = 0;
    let peso = 5;

    for (let i = 0; i < 12; i++) {
      soma += parseInt(cnpj[i]) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }

    let resto = soma % 11;
    const digito1 = resto < 2 ? 0 : 11 - resto;

    if (parseInt(cnpj[12]) !== digito1) {
      return false;
    }

    soma = 0;
    peso = 6;

    for (let i = 0; i < 13; i++) {
      soma += parseInt(cnpj[i]) * peso;
      peso = peso === 2 ? 9 : peso - 1;
    }

    resto = soma % 11;
    const digito2 = resto < 2 ? 0 : 11 - resto;

    return parseInt(cnpj[13]) === digito2;
  }

  getValue(): string {
    return this.value;
  }

  getFormatted(): string {
    return `${this.value.slice(0, 2)}.${this.value.slice(2, 5)}.${this.value.slice(5, 8)}/${this.value.slice(8, 12)}-${this.value.slice(12)}`;
  }

  equals(other: CNPJ | null): boolean {
    if (!other) return false;
    return this.value === other.value;
  }
}
