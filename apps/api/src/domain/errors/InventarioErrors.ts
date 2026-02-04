import { DomainError } from './DomainError.js';

// Empresa Errors
export class InvalidEmpresaError extends DomainError {
  readonly code = 'INVALID_EMPRESA';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class EmpresaNotFoundError extends DomainError {
  readonly code = 'EMPRESA_NOT_FOUND';
  readonly statusCode = 404;

  constructor(id: number) {
    super(`Empresa não encontrada: ${id}`);
  }
}

// Loja Errors
export class InvalidLojaError extends DomainError {
  readonly code = 'INVALID_LOJA';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class LojaNotFoundError extends DomainError {
  readonly code = 'LOJA_NOT_FOUND';
  readonly statusCode = 404;

  constructor(id: number) {
    super(`Loja não encontrada: ${id}`);
  }
}

// Inventário Errors
export class InvalidInventarioError extends DomainError {
  readonly code = 'INVALID_INVENTARIO';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class InventarioNotFoundError extends DomainError {
  readonly code = 'INVENTARIO_NOT_FOUND';
  readonly statusCode = 404;

  constructor(id: number) {
    super(`Inventário não encontrado: ${id}`);
  }
}

export class InventarioAlreadyActiveError extends DomainError {
  readonly code = 'INVENTARIO_ALREADY_ACTIVE';
  readonly statusCode = 409;

  constructor(idLoja: number) {
    super(`Já existe um inventário ativo para a loja: ${idLoja}`);
  }
}

// Setor Errors
export class InvalidSetorError extends DomainError {
  readonly code = 'INVALID_SETOR';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class SetorNotFoundError extends DomainError {
  readonly code = 'SETOR_NOT_FOUND';
  readonly statusCode = 404;

  constructor(id: number) {
    super(`Setor não encontrado: ${id}`);
  }
}

// Produto Errors
export class InvalidProdutoError extends DomainError {
  readonly code = 'INVALID_PRODUTO';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class ProdutoNotFoundError extends DomainError {
  readonly code = 'PRODUTO_NOT_FOUND';
  readonly statusCode = 404;

  constructor(id: number) {
    super(`Produto não encontrado: ${id}`);
  }
}

export class ProdutoDuplicadoError extends DomainError {
  readonly code = 'PRODUTO_DUPLICADO';
  readonly statusCode = 409;

  constructor(codigoBarras: string) {
    super(`Já existe um produto com o código de barras: ${codigoBarras}`);
  }
}

// Contagem Errors
export class InvalidContagemError extends DomainError {
  readonly code = 'INVALID_CONTAGEM';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class ContagemNotFoundError extends DomainError {
  readonly code = 'CONTAGEM_NOT_FOUND';
  readonly statusCode = 404;

  constructor(id: number) {
    super(`Contagem não encontrada: ${id}`);
  }
}

// Operador Errors
export class InvalidOperadorError extends DomainError {
  readonly code = 'INVALID_OPERADOR';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class OperadorNotFoundError extends DomainError {
  readonly code = 'OPERADOR_NOT_FOUND';
  readonly statusCode = 404;

  constructor(idInventario: number, usrCodigo: number) {
    super(`Operador não encontrado: inventário ${idInventario}, usuário ${usrCodigo}`);
  }
}

// Template Errors
export class InvalidTemplateError extends DomainError {
  readonly code = 'INVALID_TEMPLATE';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class TemplateNotFoundError extends DomainError {
  readonly code = 'TEMPLATE_NOT_FOUND';
  readonly statusCode = 404;

  constructor(id: number) {
    super(`Template não encontrado: ${id}`);
  }
}

// CNPJ Errors
export class InvalidCNPJError extends DomainError {
  readonly code = 'INVALID_CNPJ';
  readonly statusCode = 400;

  constructor(value: string) {
    super(`CNPJ inválido: "${value}". Deve conter 14 dígitos numéricos.`);
  }
}
