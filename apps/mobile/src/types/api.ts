// Auth
export interface LoginRequest {
  cpf: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
  };
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
}

// Inventario
export interface Inventario {
  id: number;
  idLoja: number;
  idEmpresa: number;
  idTemplate?: number;
  idTemplateExportacao?: number;
  minimoContagem: number;
  dataInicio: string;
  dataTermino?: string;
  lote: boolean;
  validade: boolean;
  ativo: boolean;
}

// Setor
export interface Setor {
  id: number;
  idInventario: number;
  prefixo?: string;
  inicio: number;
  termino: number;
  descricao?: string;
  abertoEm?: string;
  status: 'pendente' | 'em_contagem' | 'finalizado';
  idUsuarioContagem: string | null;
}

// Produto
export interface Produto {
  id: number;
  idInventario: number;
  codigoBarras?: string;
  codigoInterno?: string;
  descricao: string;
  lote?: string;
  validade?: string;
  saldo: number;
  custo: number;
  divergente: boolean;
}

// Contagem
export interface Contagem {
  id: number;
  idInventarioSetor: number;
  idProduto: number;
  data: string;
  lote?: string;
  validade?: string;
  quantidade: number;
  divergente: boolean;
  reconferido: boolean;
}

export interface CreateContagemRequest {
  idInventarioSetor: number;
  idProduto: number;
  quantidade: number;
  lote?: string;
  validade?: string;
  divergente?: boolean;
  reconferencia?: boolean;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
