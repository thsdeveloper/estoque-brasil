# Estoque Brasil

Sistema de gestão de estoque e inventário.

## Estrutura do Projeto

Este é um monorepo gerenciado com [Turborepo](https://turbo.build/) e [pnpm](https://pnpm.io/).

```
estoque-brasil/
├── apps/
│   ├── api/          # API REST (Fastify + Clean Architecture)
│   └── web/          # Aplicação Web (Next.js)
├── packages/
│   ├── eslint-config/  # Configurações compartilhadas do ESLint
│   ├── shared/         # Código compartilhado entre apps
│   ├── tsconfig/       # Configurações compartilhadas do TypeScript
│   └── types/          # Tipos TypeScript compartilhados
└── turbo.json
```

## Tecnologias

- **Frontend:** Next.js 16, React 19, TailwindCSS 4, Feature-Based Architecture
- **Backend:** Fastify 5, Clean Architecture, Zod
- **Database:** Supabase (PostgreSQL)
- **Monorepo:** Turborepo, pnpm workspaces
- **UI Components:** Shadcn/ui, Radix UI

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Conta no [Supabase](https://supabase.com/)

## Configuração

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure suas credenciais:

```bash
cp apps/api/.env.example apps/api/.env
```

Edite `apps/api/.env` com suas credenciais do Supabase:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key
```

### 3. Criar tabelas no Supabase

Execute a migração SQL no [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor:

```sql
-- Arquivo: apps/api/src/infrastructure/database/migrations/001_create_clients_table.sql
```

## Executando o Projeto

### Desenvolvimento

```bash
# Rodar todos os apps
pnpm dev

# Rodar apenas a API
pnpm dev:api

# Rodar apenas o Web
pnpm dev:web
```

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

### Type Check

```bash
pnpm typecheck
```

## API REST

A API roda em `http://localhost:3001` com documentação Swagger em `/docs`.

### Endpoints de Clientes

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/clients` | Listar clientes (paginado) |
| GET | `/api/clients/:id` | Buscar cliente por ID |
| POST | `/api/clients` | Criar novo cliente |
| PUT | `/api/clients/:id` | Atualizar cliente |
| DELETE | `/api/clients/:id` | Excluir cliente |

### Exemplo de Requisição

```bash
# Criar cliente
curl -X POST http://localhost:3001/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Empresa Exemplo",
    "cep": "01310100",
    "endereco": "Av. Paulista",
    "numero": "1000",
    "bairro": "Bela Vista",
    "municipio": "São Paulo",
    "uf": "SP"
  }'

# Listar clientes
curl http://localhost:3001/api/clients?page=1&limit=10
```

## Arquitetura da API (Clean Architecture)

```
apps/api/src/
├── config/                 # Configurações (env, etc)
├── domain/                 # Camada de Domínio
│   ├── entities/           # Entidades de negócio
│   ├── value-objects/      # Objetos de valor
│   ├── repositories/       # Interfaces de repositório
│   └── errors/             # Erros de domínio
├── application/            # Camada de Aplicação
│   ├── use-cases/          # Casos de uso
│   └── dtos/               # Data Transfer Objects
├── infrastructure/         # Camada de Infraestrutura
│   ├── database/           # Implementações de banco
│   └── mappers/            # Mapeadores Entity <-> DB
├── interface-adapters/     # Adaptadores de Interface
│   └── controllers/        # Controllers HTTP
├── plugins/                # Plugins Fastify
└── routes/                 # Definição de rotas
```

## Arquitetura do Frontend (Feature-Based)

O frontend segue uma arquitetura baseada em features, organizando o código por domínio de negócio em vez de tipo técnico. Isso permite escalabilidade, isolamento de features e facilita o trabalho de times independentes.

### Estrutura de Diretórios

```
apps/web/
├── app/                    # Rotas Next.js (apenas páginas)
│   ├── admin/              # Área administrativa
│   │   ├── clients/        # Páginas de clientes
│   │   └── layout.tsx      # Layout do admin
│   ├── como-funciona/      # Página institucional
│   ├── servicos/           # Página de serviços
│   └── page.tsx            # Homepage
├── features/               # Features organizadas por domínio
│   ├── clients/            # Feature de gerenciamento de clientes
│   │   ├── components/     # Componentes da feature
│   │   ├── api/            # API client da feature
│   │   ├── types/          # Tipos TypeScript
│   │   └── index.ts        # API pública (exports)
│   ├── admin-layout/       # Feature de layout administrativo
│   │   ├── components/     # Sidebar, Header, Filters
│   │   └── index.ts
│   └── marketing/          # Feature de páginas institucionais
│       ├── components/     # Hero, Header, Footer, etc.
│       ├── data/           # Dados estáticos (FAQ, etc.)
│       └── index.ts
└── shared/                 # Código genuinamente compartilhado
    ├── components/ui/      # Componentes UI (Shadcn)
    └── lib/                # Utilitários (cn, etc.)
```

### Princípios da Arquitetura

1. **Feature Self-Contained**: Cada feature contém tudo que precisa (componentes, API, tipos)
2. **Public API Pattern**: Importações apenas via `index.ts` da feature
3. **Unidirectional Flow**: `app → features → shared` (nunca o contrário)
4. **No Cross-Feature Imports**: Features não importam diretamente de outras features

### Path Aliases

```typescript
// tsconfig.json
{
  "paths": {
    "@/*": ["./*"],
    "@/features/*": ["./features/*"],
    "@/shared/*": ["./shared/*"]
  }
}
```

### Exemplos de Import

```typescript
// ✅ Correto - importar da API pública da feature
import { ClientsTable, ClientForm } from "@/features/clients";
import { AdminSidebar } from "@/features/admin-layout";
import { Header, Footer } from "@/features/marketing";

// ✅ Correto - importar de shared
import { Button, Card } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

// ❌ Errado - deep import em feature
import { ClientsTable } from "@/features/clients/components/ClientsTable";
```

### Features Disponíveis

| Feature | Descrição | Exports Principais |
|---------|-----------|-------------------|
| `clients` | CRUD de clientes | `ClientsTable`, `ClientForm`, `clientsApi` |
| `admin-layout` | Layout administrativo | `AdminSidebar`, `AdminHeader`, `SearchFilters` |
| `marketing` | Páginas institucionais | `Header`, `Footer`, `Hero`, schemas SEO |

### ESLint Boundaries

O projeto inclui regras ESLint para prevenir imports incorretos:

```javascript
// eslint.config.mjs
"no-restricted-imports": ["error", {
  patterns: [
    { group: ["@/features/*/components/*"], message: "Import from feature's index.ts" },
    { group: ["@/features/*/api/*"], message: "Import from feature's index.ts" },
  ]
}]
```

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Inicia todos os apps em modo desenvolvimento |
| `pnpm dev:api` | Inicia apenas a API |
| `pnpm dev:web` | Inicia apenas o frontend |
| `pnpm build` | Build de produção |
| `pnpm lint` | Executa o linter |
| `pnpm typecheck` | Verifica tipos TypeScript |

## Licença

Proprietário - Todos os direitos reservados.
