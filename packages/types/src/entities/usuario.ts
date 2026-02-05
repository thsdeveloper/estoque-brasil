// tb_empresa_usuario - Vínculo Empresa-Usuário
export interface EmpresaUsuario {
  usrCodigo: number;
  idEmpresa: number;
}

// tb_loja_usuario - Vínculo Loja-Usuário
export interface LojaUsuario {
  usrCodigo: number;
  idLoja: number;
}

// tb_preferencia_usuario - Preferências do Usuário
export interface PreferenciaUsuario {
  usrCodigo: number;
  idEmpresa: number;
}

// tb_tokens - Tokens do Usuário
export interface Token {
  usrCodigo: number;
  token: string;
}

// tb_tentativas - Tentativas de Login
export interface Tentativa {
  id: number;
  quantidadeTentativas: number;
}

export interface UsuarioQueryParams {
  idEmpresa?: number;
  idLoja?: number;
}
