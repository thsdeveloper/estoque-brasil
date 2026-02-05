-- Migration: Create clients table
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    link_bi TEXT,
    qtde_divergente_plus DECIMAL(15, 2),
    qtde_divergente_minus DECIMAL(15, 2),
    valor_divergente_plus DECIMAL(15, 2),
    valor_divergente_minus DECIMAL(15, 2),
    percentual_divergencia DECIMAL(5, 2) CHECK (percentual_divergencia >= 0 AND percentual_divergencia <= 100),
    cep VARCHAR(8),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    bairro VARCHAR(100),
    uf CHAR(2),
    municipio VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_clients_nome ON public.clients (nome);
CREATE INDEX idx_clients_uf ON public.clients (uf);
CREATE INDEX idx_clients_created_at ON public.clients (created_at DESC);

-- Unique constraint on nome (case-insensitive)
CREATE UNIQUE INDEX idx_clients_nome_unique ON public.clients (LOWER(nome));

-- Enable Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all operations for authenticated users" ON public.clients
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Optional: Create a trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.clients IS 'Tabela de clientes do sistema Estoque Brasil';
COMMENT ON COLUMN public.clients.nome IS 'Nome do cliente';
COMMENT ON COLUMN public.clients.link_bi IS 'Link para o dashboard de BI do cliente';
COMMENT ON COLUMN public.clients.qtde_divergente_plus IS 'Quantidade de itens com divergência positiva';
COMMENT ON COLUMN public.clients.qtde_divergente_minus IS 'Quantidade de itens com divergência negativa';
COMMENT ON COLUMN public.clients.valor_divergente_plus IS 'Valor total da divergência positiva';
COMMENT ON COLUMN public.clients.valor_divergente_minus IS 'Valor total da divergência negativa';
COMMENT ON COLUMN public.clients.percentual_divergencia IS 'Percentual de divergência (0-100)';
