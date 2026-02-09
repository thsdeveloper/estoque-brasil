import { DomainError } from './DomainError.js';

export class InvalidAccessResourceError extends DomainError {
  readonly code = 'INVALID_ACCESS_RESOURCE';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class AccessResourceNotFoundError extends DomainError {
  readonly code = 'ACCESS_RESOURCE_NOT_FOUND';
  readonly statusCode = 404;

  constructor(identifier: string) {
    super(`Recurso não encontrado: ${identifier}`);
  }
}

export class CannotDeleteSystemResourceError extends DomainError {
  readonly code = 'CANNOT_DELETE_SYSTEM_RESOURCE';
  readonly statusCode = 400;

  constructor(name: string) {
    super(`Não é possível excluir o recurso do sistema: "${name}"`);
  }
}

export class InvalidAccessActionError extends DomainError {
  readonly code = 'INVALID_ACCESS_ACTION';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class AccessActionNotFoundError extends DomainError {
  readonly code = 'ACCESS_ACTION_NOT_FOUND';
  readonly statusCode = 404;

  constructor(identifier: string) {
    super(`Ação não encontrada: ${identifier}`);
  }
}

export class CannotDeleteSystemActionError extends DomainError {
  readonly code = 'CANNOT_DELETE_SYSTEM_ACTION';
  readonly statusCode = 400;

  constructor(name: string) {
    super(`Não é possível excluir a ação do sistema: "${name}"`);
  }
}

export class InvalidAccessPolicyError extends DomainError {
  readonly code = 'INVALID_ACCESS_POLICY';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class AccessPolicyNotFoundError extends DomainError {
  readonly code = 'ACCESS_POLICY_NOT_FOUND';
  readonly statusCode = 404;

  constructor(identifier: string) {
    super(`Política de acesso não encontrada: ${identifier}`);
  }
}

export class CannotDeleteSystemPolicyError extends DomainError {
  readonly code = 'CANNOT_DELETE_SYSTEM_POLICY';
  readonly statusCode = 400;

  constructor(name: string) {
    super(`Não é possível excluir a política do sistema: "${name}"`);
  }
}

export class AccessResourceAlreadyExistsError extends DomainError {
  readonly code = 'ACCESS_RESOURCE_ALREADY_EXISTS';
  readonly statusCode = 409;

  constructor(name: string) {
    super(`Já existe um recurso com o nome: "${name}"`);
  }
}

export class AccessActionAlreadyExistsError extends DomainError {
  readonly code = 'ACCESS_ACTION_ALREADY_EXISTS';
  readonly statusCode = 409;

  constructor(name: string) {
    super(`Já existe uma ação com o nome: "${name}"`);
  }
}

export class AccessPolicyAlreadyExistsError extends DomainError {
  readonly code = 'ACCESS_POLICY_ALREADY_EXISTS';
  readonly statusCode = 409;

  constructor(name: string) {
    super(`Já existe uma política com o nome: "${name}"`);
  }
}
