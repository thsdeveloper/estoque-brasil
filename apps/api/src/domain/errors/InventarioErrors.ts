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

// Setor Business Rule Errors
export class SetorFinalizadoError extends DomainError {
  readonly code = 'SETOR_FINALIZADO';
  readonly statusCode = 403;

  constructor(id: number) {
    super(`Setor ${id} já foi finalizado e não pode ser aberto`);
  }
}

export class SetorEmContagemError extends DomainError {
  readonly code = 'SETOR_EM_CONTAGEM';
  readonly statusCode = 409;

  readonly nomeOperador: string;

  constructor(id: number, nomeOperador: string) {
    super(`Setor ${id} já está em contagem pelo operador: ${nomeOperador}`);
    this.nomeOperador = nomeOperador;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      nomeOperador: this.nomeOperador,
    };
  }
}

export class SetorJaAbertoError extends DomainError {
  readonly code = 'SETOR_JA_ABERTO';
  readonly statusCode = 409;

  readonly nomeSetor: string;
  readonly idSetorAberto: number;

  constructor(nomeSetor: string, idSetorAberto: number) {
    super(`Você já possui o setor "${nomeSetor}" aberto. Finalize-o antes de abrir outro.`);
    this.nomeSetor = nomeSetor;
    this.idSetorAberto = idSetorAberto;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      nomeSetor: this.nomeSetor,
      idSetorAberto: this.idSetorAberto,
    };
  }
}

// Inventario Finalization Errors
export class SetoresEmAbertoError extends DomainError {
  readonly code = 'SETORES_EM_ABERTO';
  readonly statusCode = 422;

  readonly setoresPendentes: { id: number; descricao: string | null; status: string }[];

  constructor(setoresPendentes: { id: number; descricao: string | null; status: string }[]) {
    super(`Existem ${setoresPendentes.length} setor(es) não finalizados`);
    this.setoresPendentes = setoresPendentes;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      setoresPendentes: this.setoresPendentes,
    };
  }
}

export class DivergenciasPendentesError extends DomainError {
  readonly code = 'DIVERGENCIAS_PENDENTES';
  readonly statusCode = 422;

  readonly total: number;

  constructor(total: number) {
    super(`Existem ${total} divergência(s) não reconferidas`);
    this.total = total;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      total: this.total,
    };
  }
}

export class InventarioJaFinalizadoError extends DomainError {
  readonly code = 'INVENTARIO_JA_FINALIZADO';
  readonly statusCode = 409;

  constructor(id: number) {
    super(`Inventário ${id} já está finalizado`);
  }
}

export class InventarioNaoFinalizadoError extends DomainError {
  readonly code = 'INVENTARIO_NAO_FINALIZADO';
  readonly statusCode = 409;

  constructor(id: number) {
    super(`Inventário ${id} não está finalizado`);
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
