// tb_uf - Unidade Federativa
export interface UF {
  codigoUf: string;
  descricao: string;
  regiao: string | null;
  capital: string | null;
}

// tb_municipio - Município
export interface Municipio {
  codigoMunicipio: string;
  descricao: string;
  codigoUf: string;
  latitude: number | null;
  longitude: number | null;
}

export interface MunicipioQueryParams {
  codigoUf?: string;
  search?: string;
}
