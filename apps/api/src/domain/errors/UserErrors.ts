import { DomainError } from './DomainError.js';

export class InvalidUserError extends DomainError {
  readonly code = 'INVALID_USER';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';
  readonly statusCode = 404;

  constructor(id: string) {
    super(`Usuário não encontrado: ${id}`);
  }
}

export class UserAlreadyExistsError extends DomainError {
  readonly code = 'USER_ALREADY_EXISTS';
  readonly statusCode = 409;

  constructor(email: string) {
    super(`Já existe um usuário com o email: "${email}"`);
  }
}

export class InvalidRoleError extends DomainError {
  readonly code = 'INVALID_ROLE';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class RoleNotFoundError extends DomainError {
  readonly code = 'ROLE_NOT_FOUND';
  readonly statusCode = 404;

  constructor(identifier: string) {
    super(`Role não encontrada: ${identifier}`);
  }
}

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';
  readonly statusCode = 403;

  constructor(message: string = 'Acesso negado') {
    super(message);
  }
}

export class CannotDeleteSystemRoleError extends DomainError {
  readonly code = 'CANNOT_DELETE_SYSTEM_ROLE';
  readonly statusCode = 400;

  constructor(roleName: string) {
    super(`Não é possível excluir a role do sistema: "${roleName}"`);
  }
}

export class CannotDeactivateSelfError extends DomainError {
  readonly code = 'CANNOT_DEACTIVATE_SELF';
  readonly statusCode = 400;

  constructor() {
    super('Não é possível desativar o próprio usuário');
  }
}

export class CannotRemoveLastAdminError extends DomainError {
  readonly code = 'CANNOT_REMOVE_LAST_ADMIN';
  readonly statusCode = 400;

  constructor() {
    super('Não é possível remover o último administrador do sistema');
  }
}
