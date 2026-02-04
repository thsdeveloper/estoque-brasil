-- Migration: Create all tables for the inventory management system
-- Date: 2026-02-03

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: clients (Clientes)
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    link_bi TEXT,
    qtde_divergente_plus INTEGER,
    qtde_divergente_minus INTEGER,
    valor_divergente_plus DECIMAL(15, 2),
    valor_divergente_minus DECIMAL(15, 2),
    percentual_divergencia DECIMAL(5, 2),
    cep VARCHAR(9),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    bairro VARCHAR(100),
    uf CHAR(2),
    municipio VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for clients
CREATE INDEX IF NOT EXISTS idx_clients_nome ON clients(nome);

-- ============================================
-- Table: empresas (Empresas)
-- ============================================
CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255),
    cnpj VARCHAR(18),
    razao_social VARCHAR(255),
    nome_fantasia VARCHAR(255),
    cep VARCHAR(9),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    bairro VARCHAR(100),
    codigo_uf CHAR(2),
    codigo_municipio VARCHAR(10),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for empresas
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_razao_social ON empresas(razao_social);
CREATE INDEX IF NOT EXISTS idx_empresas_ativo ON empresas(ativo);

-- ============================================
-- Table: lojas (Lojas)
-- ============================================
CREATE TABLE IF NOT EXISTS lojas (
    id SERIAL PRIMARY KEY,
    id_cliente UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lojas
CREATE INDEX IF NOT EXISTS idx_lojas_id_cliente ON lojas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_lojas_nome ON lojas(nome);
CREATE INDEX IF NOT EXISTS idx_lojas_cnpj ON lojas(cnpj);

-- ============================================
-- Table: templates_importacao (Templates de Importacao)
-- ============================================
CREATE TABLE IF NOT EXISTS templates_importacao (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    delimitador VARCHAR(5) DEFAULT ';',
    tipo VARCHAR(3) DEFAULT 'CSV' CHECK (tipo IN ('CSV', 'TXT', 'XLS')),
    tipo_saldo CHAR(1) DEFAULT 'Q' CHECK (tipo_saldo IN ('Q', 'V', 'A')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for templates_importacao
CREATE INDEX IF NOT EXISTS idx_templates_descricao ON templates_importacao(descricao);

-- ============================================
-- Table: inventarios (Inventarios)
-- ============================================
CREATE TABLE IF NOT EXISTS inventarios (
    id SERIAL PRIMARY KEY,
    id_loja INTEGER NOT NULL REFERENCES lojas(id) ON DELETE CASCADE,
    id_empresa INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    id_template INTEGER REFERENCES templates_importacao(id) ON DELETE SET NULL,
    id_template_exportacao INTEGER REFERENCES templates_importacao(id) ON DELETE SET NULL,
    minimo_contagem INTEGER DEFAULT 1 CHECK (minimo_contagem >= 1),
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_termino TIMESTAMP WITH TIME ZONE,
    lote BOOLEAN DEFAULT FALSE,
    validade BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for inventarios
CREATE INDEX IF NOT EXISTS idx_inventarios_id_loja ON inventarios(id_loja);
CREATE INDEX IF NOT EXISTS idx_inventarios_id_empresa ON inventarios(id_empresa);
CREATE INDEX IF NOT EXISTS idx_inventarios_data_inicio ON inventarios(data_inicio);
CREATE INDEX IF NOT EXISTS idx_inventarios_ativo ON inventarios(ativo);

-- Constraint: data_termino must be after data_inicio
ALTER TABLE inventarios ADD CONSTRAINT chk_inventarios_datas
    CHECK (data_termino IS NULL OR data_termino >= data_inicio);

-- ============================================
-- Table: setores (Setores do Inventario)
-- ============================================
CREATE TABLE IF NOT EXISTS setores (
    id SERIAL PRIMARY KEY,
    id_inventario INTEGER NOT NULL REFERENCES inventarios(id) ON DELETE CASCADE,
    prefixo VARCHAR(10),
    inicio INTEGER NOT NULL CHECK (inicio >= 0),
    termino INTEGER NOT NULL CHECK (termino >= 0),
    descricao VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for setores
CREATE INDEX IF NOT EXISTS idx_setores_id_inventario ON setores(id_inventario);

-- Constraint: termino must be >= inicio
ALTER TABLE setores ADD CONSTRAINT chk_setores_intervalo
    CHECK (termino >= inicio);

-- ============================================
-- Table: inventarios_produtos (Produtos do Inventario)
-- ============================================
CREATE TABLE IF NOT EXISTS inventarios_produtos (
    id SERIAL PRIMARY KEY,
    id_inventario INTEGER NOT NULL REFERENCES inventarios(id) ON DELETE CASCADE,
    codigo_barras VARCHAR(50),
    codigo_interno VARCHAR(50),
    descricao VARCHAR(500) NOT NULL,
    lote VARCHAR(50),
    validade DATE,
    saldo DECIMAL(15, 4) DEFAULT 0 CHECK (saldo >= 0),
    custo DECIMAL(15, 4) DEFAULT 0 CHECK (custo >= 0),
    divergente BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for inventarios_produtos
CREATE INDEX IF NOT EXISTS idx_inv_produtos_id_inventario ON inventarios_produtos(id_inventario);
CREATE INDEX IF NOT EXISTS idx_inv_produtos_codigo_barras ON inventarios_produtos(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_inv_produtos_codigo_interno ON inventarios_produtos(codigo_interno);
CREATE INDEX IF NOT EXISTS idx_inv_produtos_divergente ON inventarios_produtos(divergente);

-- ============================================
-- Table: inventarios_contagens (Contagens do Inventario)
-- ============================================
CREATE TABLE IF NOT EXISTS inventarios_contagens (
    id SERIAL PRIMARY KEY,
    id_inventario_setor INTEGER NOT NULL REFERENCES setores(id) ON DELETE CASCADE,
    id_produto INTEGER NOT NULL REFERENCES inventarios_produtos(id) ON DELETE CASCADE,
    data TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lote VARCHAR(50),
    validade DATE,
    quantidade DECIMAL(15, 4) NOT NULL CHECK (quantidade >= 0),
    divergente BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for inventarios_contagens
CREATE INDEX IF NOT EXISTS idx_inv_contagens_id_setor ON inventarios_contagens(id_inventario_setor);
CREATE INDEX IF NOT EXISTS idx_inv_contagens_id_produto ON inventarios_contagens(id_produto);
CREATE INDEX IF NOT EXISTS idx_inv_contagens_data ON inventarios_contagens(data);
CREATE INDEX IF NOT EXISTS idx_inv_contagens_divergente ON inventarios_contagens(divergente);

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT unnest(ARRAY['clients', 'empresas', 'lojas', 'templates_importacao',
                           'inventarios', 'setores', 'inventarios_produtos', 'inventarios_contagens'])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
            CREATE TRIGGER update_%s_updated_at
                BEFORE UPDATE ON %s
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates_importacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventarios_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventarios_contagens ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (can be customized later)
-- For now, allow all authenticated users to access all data

CREATE POLICY "Allow authenticated users full access to clients"
    ON clients FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to empresas"
    ON empresas FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to lojas"
    ON lojas FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to templates_importacao"
    ON templates_importacao FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to inventarios"
    ON inventarios FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to setores"
    ON setores FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to inventarios_produtos"
    ON inventarios_produtos FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to inventarios_contagens"
    ON inventarios_contagens FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Comments on tables
-- ============================================
COMMENT ON TABLE clients IS 'Tabela de clientes do sistema';
COMMENT ON TABLE empresas IS 'Tabela de empresas associadas aos clientes';
COMMENT ON TABLE lojas IS 'Tabela de lojas dos clientes';
COMMENT ON TABLE templates_importacao IS 'Templates para importacao/exportacao de dados';
COMMENT ON TABLE inventarios IS 'Inventarios de estoque';
COMMENT ON TABLE setores IS 'Setores dentro de um inventario';
COMMENT ON TABLE inventarios_produtos IS 'Produtos cadastrados em um inventario';
COMMENT ON TABLE inventarios_contagens IS 'Contagens de produtos durante o inventario';
