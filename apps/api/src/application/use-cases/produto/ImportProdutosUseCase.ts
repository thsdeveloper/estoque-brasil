import { InventarioProduto } from '../../../domain/entities/InventarioProduto.js';
import { IInventarioProdutoRepository } from '../../../domain/repositories/IInventarioProdutoRepository.js';
import { ProdutoResponseDTO, toProdutoResponseDTO } from '../../dtos/inventario/ProdutoDTO.js';

export interface ImportProdutoItem {
  codigoBarras?: string | null;
  codigoInterno?: string | null;
  descricao: string;
  lote?: string | null;
  validade?: string | null;
  saldo?: number;
  custo?: number;
}

export interface ImportProdutosDTO {
  idInventario: number;
  produtos: ImportProdutoItem[];
}

export interface ImportResultDTO {
  importados: number;
  erros: { linha: number; erro: string }[];
  produtos: ProdutoResponseDTO[];
}

export class ImportProdutosUseCase {
  constructor(private readonly produtoRepository: IInventarioProdutoRepository) {}

  async execute(data: ImportProdutosDTO): Promise<ImportResultDTO> {
    const erros: { linha: number; erro: string }[] = [];
    const produtosValidos: InventarioProduto[] = [];

    for (let i = 0; i < data.produtos.length; i++) {
      const item = data.produtos[i];
      try {
        if (!item.descricao || item.descricao.trim().length === 0) {
          erros.push({ linha: i + 1, erro: 'Descrição é obrigatória' });
          continue;
        }

        const produto = InventarioProduto.create({
          idInventario: data.idInventario,
          codigoBarras: item.codigoBarras || null,
          codigoInterno: item.codigoInterno || null,
          descricao: item.descricao.trim(),
          lote: item.lote || null,
          validade: item.validade ? new Date(item.validade) : null,
          saldo: item.saldo ?? 0,
          custo: item.custo ?? 0,
          divergente: false,
        });

        produtosValidos.push(produto);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Erro desconhecido';
        erros.push({ linha: i + 1, erro: msg });
      }
    }

    let savedProdutos: InventarioProduto[] = [];

    if (produtosValidos.length > 0) {
      // Insert in batches of 500 to avoid payload limits
      const BATCH_SIZE = 500;
      for (let i = 0; i < produtosValidos.length; i += BATCH_SIZE) {
        const batch = produtosValidos.slice(i, i + BATCH_SIZE);
        const saved = await this.produtoRepository.createMany(batch);
        savedProdutos.push(...saved);
      }
    }

    return {
      importados: savedProdutos.length,
      erros,
      produtos: savedProdutos.map(toProdutoResponseDTO),
    };
  }
}
