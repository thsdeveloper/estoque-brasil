/**
 * Remove pontuação do CPF (pontos e traço)
 */
export function stripCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Valida CPF usando algoritmo dos dígitos verificadores
 */
export function isValidCpf(raw: string): boolean {
  const cpf = stripCpf(raw);

  if (cpf.length !== 11) return false;

  // Rejeitar CPFs com todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validar primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  // Validar segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;

  return true;
}

/**
 * Converte CPF para email sintético para uso com Supabase Auth
 */
export function cpfToEmail(cpf: string): string {
  return `${stripCpf(cpf)}@inventario.local`;
}
