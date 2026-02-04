import { Empresa } from '../../domain/entities/Empresa.js';

export interface EmpresaDbRow {
  id: number;
  descricao: string | null;
  cnpj: string | null;
  razao_social: string | null;
  nome_fantasia: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  codigo_uf: string | null;
  codigo_municipio: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmpresaInsertRow {
  descricao?: string | null;
  cnpj?: string | null;
  razao_social?: string | null;
  nome_fantasia?: string | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  codigo_uf?: string | null;
  codigo_municipio?: string | null;
  ativo?: boolean;
}

export class EmpresaMapper {
  static toDomain(row: EmpresaDbRow): Empresa {
    return Empresa.create({
      id: row.id,
      descricao: row.descricao,
      cnpj: row.cnpj,
      razaoSocial: row.razao_social,
      nomeFantasia: row.nome_fantasia,
      cep: row.cep,
      endereco: row.endereco,
      numero: row.numero,
      bairro: row.bairro,
      codigoUf: row.codigo_uf,
      codigoMunicipio: row.codigo_municipio,
      ativo: row.ativo,
    });
  }

  static toInsertRow(empresa: Empresa): EmpresaInsertRow {
    return {
      descricao: empresa.descricao,
      cnpj: empresa.cnpj,
      razao_social: empresa.razaoSocial,
      nome_fantasia: empresa.nomeFantasia,
      cep: empresa.cep,
      endereco: empresa.endereco,
      numero: empresa.numero,
      bairro: empresa.bairro,
      codigo_uf: empresa.codigoUf,
      codigo_municipio: empresa.codigoMunicipio,
      ativo: empresa.ativo,
    };
  }

  static toUpdateRow(empresa: Empresa): EmpresaInsertRow & { updated_at: string } {
    return {
      ...this.toInsertRow(empresa),
      updated_at: new Date().toISOString(),
    };
  }
}
