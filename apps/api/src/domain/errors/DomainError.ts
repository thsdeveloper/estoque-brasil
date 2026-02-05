export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

export class InvalidCEPError extends DomainError {
  readonly code = 'INVALID_CEP';
  readonly statusCode = 400;

  constructor(value: string) {
    super(`CEP inválido: "${value}". Deve conter exatamente 8 dígitos numéricos.`);
  }
}

export class InvalidUFError extends DomainError {
  readonly code = 'INVALID_UF';
  readonly statusCode = 400;

  constructor(value: string) {
    super(`UF inválido: "${value}". Deve ser uma sigla de estado válida.`);
  }
}

export class InvalidPercentageError extends DomainError {
  readonly code = 'INVALID_PERCENTAGE';
  readonly statusCode = 400;

  constructor(value: number) {
    super(`Percentual inválido: ${value}. Deve estar entre 0 e 100.`);
  }
}

export class InvalidClientError extends DomainError {
  readonly code = 'INVALID_CLIENT';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class ClientNotFoundError extends DomainError {
  readonly code = 'CLIENT_NOT_FOUND';
  readonly statusCode = 404;

  constructor(id: string) {
    super(`Cliente não encontrado: ${id}`);
  }
}

export class ClientAlreadyExistsError extends DomainError {
  readonly code = 'CLIENT_ALREADY_EXISTS';
  readonly statusCode = 409;

  constructor(nome: string) {
    super(`Já existe um cliente com o nome: "${nome}"`);
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
  readonly statusCode = 401;

  constructor(message: string = 'Não autorizado') {
    super(message);
  }
}

export class TokenExpiredError extends DomainError {
  readonly code = 'TOKEN_EXPIRED';
  readonly statusCode = 401;

  constructor() {
    super('Token expirado');
  }
}

export class InvalidTokenError extends DomainError {
  readonly code = 'TOKEN_INVALID';
  readonly statusCode = 401;

  constructor() {
    super('Token inválido');
  }
}
