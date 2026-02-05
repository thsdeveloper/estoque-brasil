// tb_configuracao - Configurações do Sistema
export interface Configuracao {
  id: number;
  jwtTempo: number;
  jwtChave: string;
  caminhoArquivo: string;
}

export type UpdateConfiguracaoInput = Partial<Omit<Configuracao, 'id'>>;
