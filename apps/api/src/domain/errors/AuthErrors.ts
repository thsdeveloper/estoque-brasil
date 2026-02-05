import { DomainError } from './DomainError.js';

export class UserAlreadyExistsError extends DomainError {
  readonly code = 'USER_ALREADY_EXISTS';
  readonly statusCode = 409;

  constructor() {
    super('Este email já está cadastrado.');
  }
}

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';
  readonly statusCode = 401;

  constructor() {
    super('Email ou senha incorretos.');
  }
}

export class EmailNotVerifiedError extends DomainError {
  readonly code = 'EMAIL_NOT_VERIFIED';
  readonly statusCode = 401;

  constructor() {
    super('Email não verificado. Verifique sua caixa de entrada.');
  }
}

export class WeakPasswordError extends DomainError {
  readonly code = 'WEAK_PASSWORD';
  readonly statusCode = 400;

  constructor() {
    super('Senha muito fraca. Use pelo menos 8 caracteres com letras e números.');
  }
}

export class InvalidEmailError extends DomainError {
  readonly code = 'INVALID_EMAIL';
  readonly statusCode = 400;

  constructor() {
    super('Email inválido.');
  }
}

export class PasswordResetError extends DomainError {
  readonly code = 'PASSWORD_RESET_ERROR';
  readonly statusCode = 400;

  constructor(message = 'Erro ao redefinir senha. Tente novamente.') {
    super(message);
  }
}

export class RateLimitError extends DomainError {
  readonly code = 'RATE_LIMIT_EXCEEDED';
  readonly statusCode = 429;

  constructor() {
    super('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
  }
}

export class SessionNotFoundError extends DomainError {
  readonly code = 'SESSION_NOT_FOUND';
  readonly statusCode = 401;

  constructor() {
    super('Sessão não encontrada ou expirada.');
  }
}
