# Plano: Sistema de Controle de Acesso Directus-like

## Contexto

O sistema atual tem RBAC basico com `roles -> role_permissions -> permissions` (resource:action). Funciona, mas tem limitacoes:
- **Recursos e acoes hardcoded** na migration (9 recursos x 4 acoes CRUD)
- **Sem camada de Policies** - permissoes sao atribuidas diretamente a roles
- **Sem acoes customizadas** - apenas read/create/update/delete
- **Nenhuma UI para gerenciar recursos/acoes** - tudo via migration SQL

O objetivo e implementar um sistema similar ao Directus com **Policies** (grupos reutilizaveis de permissoes), **recursos/acoes dinamicos** gerenciaveis via UI admin, e **auto-geracao** de permissoes quando novos recursos/acoes sao criados.

**Escopo definido:**
- SEM row-level/conditional permissions (por enquanto)
- SEM field-level permissions
- UI Admin completa para gerenciar tudo

---

## Arquitetura Nova

```
User -> user_roles -> Role -> role_policies -> Policy -> policy_permissions -> Permission
                                                                                  |
                                                                    resource_id -> access_resources
                                                                    action_id  -> access_actions
```

Comparado com o modelo atual (`Role -> role_permissions -> Permission`), adicionamos:
1. **`access_resources`** - registro dinamico de recursos
2. **`access_actions`** - registro dinamico de acoes (CRUD + customizadas)
3. **`access_policies`** - grupos nomeados de permissoes
4. **`policy_permissions`** - N:N entre policies e permissions
5. **`role_policies`** - N:N entre roles e policies

---

## Fase 1: Migration SQL (Non-breaking)

**Arquivo:** `apps/api/src/infrastructure/database/migrations/003_create_access_policy_tables.sql`

### Novas tabelas

```sql
-- Registro dinamico de recursos
CREATE TABLE access_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_system BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registro dinamico de acoes
CREATE TABLE access_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policies (grupos de permissoes)
CREATE TABLE access_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_system_policy BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy <-> Permission (N:N)
CREATE TABLE policy_permissions (
    policy_id UUID NOT NULL REFERENCES access_policies(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (policy_id, permission_id)
);

-- Role <-> Policy (N:N)
CREATE TABLE role_policies (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES access_policies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (role_id, policy_id)
);
```

### Alteracao na tabela permissions existente

```sql
ALTER TABLE permissions
    ADD COLUMN resource_id UUID REFERENCES access_resources(id) ON DELETE CASCADE,
    ADD COLUMN action_id UUID REFERENCES access_actions(id) ON DELETE CASCADE;
```

### Triggers de auto-geracao

```sql
-- Trigger: ao inserir novo recurso, gera permissoes para TODAS as acoes existentes
CREATE OR REPLACE FUNCTION public.auto_generate_permissions_for_resource()
RETURNS TRIGGER AS $$
DECLARE
    act RECORD;
BEGIN
    FOR act IN SELECT id, name FROM public.access_actions LOOP
        INSERT INTO public.permissions (resource, action, description, resource_id, action_id)
        VALUES (
            NEW.name,
            act.name,
            format('Permissao para %s em %s', act.name, NEW.name),
            NEW.id,
            act.id
        )
        ON CONFLICT (resource, action) DO NOTHING;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_generate_permissions_on_resource
    AFTER INSERT ON public.access_resources
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_permissions_for_resource();

-- Trigger: ao inserir nova acao, gera permissoes para TODOS os recursos existentes
CREATE OR REPLACE FUNCTION public.auto_generate_permissions_for_action()
RETURNS TRIGGER AS $$
DECLARE
    res RECORD;
BEGIN
    FOR res IN SELECT id, name FROM public.access_resources LOOP
        INSERT INTO public.permissions (resource, action, description, resource_id, action_id)
        VALUES (
            res.name,
            NEW.name,
            format('Permissao para %s em %s', NEW.name, res.name),
            res.id,
            NEW.id
        )
        ON CONFLICT (resource, action) DO NOTHING;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_generate_permissions_on_action
    AFTER INSERT ON public.access_actions
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_generate_permissions_for_action();
```

### Seed de migracao de dados

1. Popular `access_resources` a partir dos 9 recursos existentes
2. Popular `access_actions` com as 4 acoes CRUD (marcadas como `is_system = true`)
3. Backfill `resource_id` e `action_id` na tabela `permissions`
4. Para cada role existente, criar uma policy padrao (ex: `admin_default_policy`)
5. Copiar `role_permissions` para `policy_permissions`
6. Criar `role_policies` ligando cada role a sua policy padrao

```sql
-- 1. Seed access_resources
INSERT INTO public.access_resources (name, display_name, is_system, sort_order) VALUES
    ('usuarios', 'Usuarios', true, 1),
    ('inventarios', 'Inventarios', true, 2),
    ('clients', 'Clientes', true, 3),
    ('empresas', 'Empresas', true, 4),
    ('lojas', 'Lojas', true, 5),
    ('contagens', 'Contagens', true, 6),
    ('setores', 'Setores', true, 7),
    ('produtos', 'Produtos', true, 8),
    ('templates', 'Templates', true, 9)
ON CONFLICT (name) DO NOTHING;

-- 2. Seed access_actions
INSERT INTO public.access_actions (name, display_name, is_system, sort_order) VALUES
    ('read', 'Visualizar', true, 1),
    ('create', 'Criar', true, 2),
    ('update', 'Editar', true, 3),
    ('delete', 'Excluir', true, 4)
ON CONFLICT (name) DO NOTHING;

-- 3. Backfill resource_id e action_id
UPDATE public.permissions p
SET
    resource_id = r.id,
    action_id = a.id
FROM public.access_resources r, public.access_actions a
WHERE p.resource = r.name AND p.action = a.name;

-- 4. Criar policies padrao e migrar role_permissions
DO $$
DECLARE
    r RECORD;
    policy_uuid UUID;
BEGIN
    FOR r IN SELECT id, name, display_name FROM public.roles LOOP
        INSERT INTO public.access_policies (name, display_name, description, is_system_policy)
        VALUES (
            r.name || '_default_policy',
            'Politica padrao: ' || r.display_name,
            'Politica migrada automaticamente das permissoes da role ' || r.display_name,
            true
        )
        RETURNING id INTO policy_uuid;

        -- Copiar role_permissions para policy_permissions
        INSERT INTO public.policy_permissions (policy_id, permission_id)
        SELECT policy_uuid, rp.permission_id
        FROM public.role_permissions rp
        WHERE rp.role_id = r.id;

        -- Ligar role a sua policy padrao
        INSERT INTO public.role_policies (role_id, policy_id)
        VALUES (r.id, policy_uuid);
    END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### Funcoes DB atualizadas

```sql
-- Consulta via AMBOS os caminhos (dual-path para compatibilidade)
CREATE OR REPLACE FUNCTION public.user_has_permission(
    user_uuid UUID,
    resource_name TEXT,
    action_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        -- Caminho novo: user_roles -> role_policies -> policy_permissions -> permissions
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_policies rp_link ON ur.role_id = rp_link.role_id
        JOIN public.policy_permissions pp ON rp_link.policy_id = pp.policy_id
        JOIN public.permissions p ON pp.permission_id = p.id
        WHERE ur.user_id = user_uuid
          AND p.resource = resource_name
          AND p.action = action_name
    )
    OR EXISTS (
        -- Caminho legado: user_roles -> role_permissions -> permissions (backward compat)
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = user_uuid
          AND p.resource = resource_name
          AND p.action = action_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mesma logica dual-path com UNION
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid UUID)
RETURNS TABLE (
    resource VARCHAR(50),
    action VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.resource, p.action
    FROM public.user_roles ur
    JOIN public.role_policies rp_link ON ur.role_id = rp_link.role_id
    JOIN public.policy_permissions pp ON rp_link.policy_id = pp.policy_id
    JOIN public.permissions p ON pp.permission_id = p.id
    WHERE ur.user_id = user_uuid
    UNION
    SELECT DISTINCT p.resource, p.action
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### RLS

Mesmos patterns das tabelas existentes: SELECT para authenticated, ALL para admins.

```sql
-- Enable RLS em todas as novas tabelas
ALTER TABLE public.access_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_policies ENABLE ROW LEVEL SECURITY;

-- Pattern: SELECT para authenticated, ALL para admins (mesmos das tabelas existentes)
-- Repetir para cada tabela...
```

---

## Fase 2: API Backend

### 2.1 Domain Entities (novos arquivos)

| Arquivo | Descricao |
|---------|-----------|
| `domain/entities/AccessResource.ts` | Entidade Resource (name, displayName, icon, isSystem, sortOrder) |
| `domain/entities/AccessAction.ts` | Entidade Action (name, displayName, isSystem, sortOrder) |
| `domain/entities/AccessPolicy.ts` | Entidade Policy (name, displayName, permissions[]) |

Seguir exatamente o pattern de `domain/entities/Role.ts` (private constructor, static create, validate, getters).

### 2.2 Atualizar entidades existentes

**`domain/entities/Permission.ts`**:
- Mudar `PermissionAction` de `'read' | 'create' | 'update' | 'delete'` para `string`
- Adicionar campos opcionais `resourceId?` e `actionId?`
- Remover validacao hardcoded de action no `validate()`

**`domain/entities/Role.ts`**:
- Adicionar `policies: AccessPolicy[]` ao `RoleProps`
- Atualizar `hasPermission()` para checar via policies tambem

### 2.3 Repository Interfaces (novos arquivos)

| Arquivo | Metodos |
|---------|---------|
| `domain/repositories/IAccessResourceRepository.ts` | create, findById, findByName, findAll, update, delete |
| `domain/repositories/IAccessActionRepository.ts` | create, findById, findByName, findAll, update, delete |
| `domain/repositories/IAccessPolicyRepository.ts` | create, findById, findAll, update, delete, setPermissions(policyId, permissionIds[]) |

**Atualizar `IRoleRepository.ts`**: adicionar `setPolicies(roleId, policyIds[])`, `getRolePolicies(roleId)`

### 2.4 Supabase Repositories (novos arquivos)

| Arquivo | Referencia |
|---------|-----------|
| `infrastructure/database/supabase/repositories/SupabaseAccessResourceRepository.ts` | Pattern de `SupabaseRoleRepository.ts` |
| `infrastructure/database/supabase/repositories/SupabaseAccessActionRepository.ts` | idem |
| `infrastructure/database/supabase/repositories/SupabaseAccessPolicyRepository.ts` | idem (com join policy_permissions -> permissions) |

**Atualizar `SupabaseRoleRepository.ts`**: adicionar metodos para policies, atualizar queries para fazer join com `role_policies`.

### 2.5 Mappers (novo arquivo)

`infrastructure/mappers/AccessMapper.ts` - AccessResourceMapper, AccessActionMapper, AccessPolicyMapper (DB row -> domain entity).

### 2.6 Use Cases (novos)

Todos em `application/use-cases/access/`:

**Resources:** CreateAccessResource, UpdateAccessResource, DeleteAccessResource (bloquear system), ListAccessResources
**Actions:** CreateAccessAction, UpdateAccessAction, DeleteAccessAction (bloquear system), ListAccessActions
**Policies:** CreateAccessPolicy, UpdateAccessPolicy, DeleteAccessPolicy (bloquear system), ListAccessPolicies, SetPolicyPermissions

**Atualizar em `roles/`:** SetRolePolicies use case novo

**Atualizar `ListPermissionsUseCase.ts`**: buscar display names de `access_resources` ao inves do map hardcoded.

### 2.7 Controllers (novos)

| Arquivo | Metodos |
|---------|---------|
| `interface-adapters/controllers/AccessResourceController.ts` | list, get, create, update, delete |
| `interface-adapters/controllers/AccessActionController.ts` | idem |
| `interface-adapters/controllers/AccessPolicyController.ts` | list, get, create, update, delete, setPermissions |

### 2.8 Routes (novos)

**`routes/access/resources.ts`**:
- `GET /access/resources` - listar todos
- `POST /access/resources` - criar (auto-gera permissions via trigger)
- `PUT /access/resources/:id` - atualizar
- `DELETE /access/resources/:id` - deletar (bloqueia system)

**`routes/access/actions.ts`**:
- `GET /access/actions` - listar todos
- `POST /access/actions` - criar (auto-gera permissions via trigger)
- `PUT /access/actions/:id` - atualizar
- `DELETE /access/actions/:id` - deletar (bloqueia system)

**`routes/access/policies.ts`**:
- `GET /access/policies` - listar todas (com permissions)
- `GET /access/policies/:id` - detalhe (com permissions)
- `POST /access/policies` - criar
- `PUT /access/policies/:id` - atualizar metadata
- `DELETE /access/policies/:id` - deletar
- `PUT /access/policies/:id/permissions` - definir permissoes da policy

**Atualizar `routes/roles/index.ts`**:
- `PUT /roles/:id/policies` - definir policies da role
- `GET /roles/:id/policies` - listar policies da role

**Registrar em `app.ts`**:
```typescript
import accessRoutes from './routes/access/index.js';
await app.register(accessRoutes, { prefix: '/api/access' });
```

Todas as rotas de access requerem: `requireAuth` + `requirePermission('usuarios', 'create')` (admin-level).

### 2.9 Middleware

**NENHUMA mudanca no `authorization.ts`!** A assinatura `requirePermission(resource, action)` continua identica. A mudanca e na funcao SQL `user_has_permission` que agora consulta via policies.

---

## Fase 3: Frontend (Web Admin)

### 3.1 Shared Types

**Atualizar `packages/types/src/entities/rbac.ts`**:
- `PermissionAction` -> `string` (manter alias `StandardPermissionAction` para CRUD)
- Adicionar interfaces: `AccessResource`, `AccessAction`, `AccessPolicy`

### 3.2 Nova feature: `features/access/`

```
features/access/
  api/access-api.ts         -- API client para resources, actions, policies
  types/index.ts            -- Types + zod schemas
  components/
    resources/
      ResourcesTable.tsx    -- Tabela de recursos
      ResourceForm.tsx      -- Form criar/editar recurso
      columns.tsx
    actions/
      ActionsTable.tsx      -- Tabela de acoes
      ActionForm.tsx        -- Form criar/editar acao
      columns.tsx
    policies/
      PoliciesTable.tsx     -- Tabela de policies
      PolicyForm.tsx        -- Form criar/editar policy
      PolicyPermissionsMatrix.tsx  -- Matrix recursos x acoes (checkboxes)
      columns.tsx
```

### 3.3 Novas paginas admin

```
app/admin/acesso/
  recursos/
    page.tsx              -- Lista de recursos
    create/page.tsx       -- Criar recurso
    [id]/edit/page.tsx    -- Editar recurso
  acoes/
    page.tsx              -- Lista de acoes
    create/page.tsx       -- Criar acao
    [id]/edit/page.tsx    -- Editar acao
  politicas/
    page.tsx              -- Lista de policies
    create/page.tsx       -- Criar policy + matrix
    [id]/page.tsx         -- Detalhe + matrix readonly
    [id]/edit/page.tsx    -- Editar policy + matrix
```

### 3.4 Atualizar feature roles existente

**`features/roles/components/PermissionsMatrix.tsx`**:
- Headers de colunas: buscar de `/api/access/actions` (dinamico, nao hardcoded `["read","create","update","delete"]`)
- Linhas de recursos: buscar de `/api/access/resources` (dinamico)
- Suportar colunas de acoes customizadas

**`features/roles/components/RoleForm.tsx`**:
- Modo create: trocar matrix de permissoes diretas por **seletor de policies** (multi-select com preview)
- Modo edit: idem

**Novo componente `features/roles/components/RolePoliciesSelector.tsx`**:
- Lista de policies disponiveis como cards/checkboxes
- Expandir para ver permissoes da policy
- Contador de permissoes por policy

**`features/roles/api/roles-api.ts`**: adicionar `setPolicies()` e `getPolicies()`.

**Pagina de detalhe da role**: mostrar policies atribuidas + matrix de permissoes efetivas (readonly, uniao de todas as policies).

### 3.5 Atualizar PermissionGate e usePermissions

**`shared/components/PermissionGate.tsx`**: mudar tipo do `action` de union literal para `string`.

**`features/usuarios/hooks/usePermissions.tsx`**:
- `hasPermission(resource, action)` aceitar `string` ao inves de `PermissionAction`
- Adicionar metodo `can(resource, action)` como alias para acoes customizadas
- Hook nao precisa de outras mudancas (ja funciona com strings)

### 3.6 Sidebar

**`features/admin-layout/components/AdminSidebar.tsx`**: adicionar secao "Controle de Acesso" com links para Recursos, Acoes, Politicas (debaixo de Cadastros ou como secao separada).

---

## Fase 4: Cleanup (Futuro, opcional)

1. Remover dados de `role_permissions` (migrados para policy_permissions)
2. Remover caminho legado da funcao `user_has_permission`
3. Tornar `resource_id` e `action_id` NOT NULL em `permissions`
4. Dropar tabela `role_permissions`

---

## Estrategia de Migracao

A migration e 100% aditiva - nenhuma coluna ou tabela existente e removida. O sistema antigo (`role_permissions`) continua funcionando em paralelo com o novo (`role_policies -> policy_permissions`). Isso garante:

- **Zero downtime** - deploy sem quebrar nada
- **Rollback seguro** - basta reverter a funcao SQL para a versao original
- **Compatibilidade total** - middleware e hooks do frontend nao mudam suas APIs publicas

---

## Ordem de Implementacao

### Sprint 1 - Database + API Core
1. Migration SQL `003_create_access_policy_tables.sql`
2. Domain entities (AccessResource, AccessAction, AccessPolicy)
3. Atualizar Permission e Role entities
4. Repository interfaces
5. Supabase repository implementations
6. Mappers

### Sprint 2 - API Use Cases + Routes
7. Use cases para Resources, Actions, Policies
8. Use case SetRolePolicies
9. Atualizar ListPermissionsUseCase (display names dinamicos)
10. Controllers
11. Routes + registro em app.ts

### Sprint 3 - Frontend: Gestao de Acesso
12. Shared types (rbac.ts)
13. Feature `access/` (api, types, components)
14. Paginas admin: Recursos, Acoes, Politicas
15. PolicyPermissionsMatrix component

### Sprint 4 - Frontend: Integracao Roles + Polish
16. Atualizar PermissionsMatrix para colunas/linhas dinamicas
17. RolePoliciesSelector component
18. Atualizar paginas de roles (policies ao inves de permissoes diretas)
19. Atualizar PermissionGate e usePermissions types
20. Atualizar sidebar
21. Testes end-to-end

---

## Verificacao

1. **API**: Criar recurso via POST -> verificar que permissions sao auto-geradas para todas as acoes
2. **API**: Criar acao customizada -> verificar que permissions sao geradas para todos os recursos
3. **API**: Criar policy -> atribuir permissoes -> atribuir a role -> verificar que usuario com essa role tem acesso
4. **DB**: `SELECT user_has_permission(uuid, 'novo_recurso', 'nova_acao')` retorna true para usuario com policy correta
5. **Frontend**: Login como admin -> acessar Controle de Acesso -> criar recurso/acao/policy -> atribuir policy a role
6. **Frontend**: Login como usuario com role modificada -> verificar que PermissionGate funciona com novas permissoes
7. **Backward compat**: Roles existentes continuam funcionando via caminho legado ate cleanup

---

## Arquivos Criticos

### Existentes (a modificar)
- `apps/api/src/infrastructure/database/migrations/002_create_rbac_tables.sql` (referencia para style)
- `apps/api/src/domain/entities/Permission.ts` (widen PermissionAction type)
- `apps/api/src/domain/entities/Role.ts` (adicionar policies)
- `apps/api/src/infrastructure/database/supabase/repositories/SupabaseRoleRepository.ts` (adicionar policy methods)
- `apps/api/src/application/use-cases/roles/ListPermissionsUseCase.ts` (display names dinamicos)
- `apps/api/src/routes/roles/index.ts` (novas rotas de policies)
- `apps/api/src/app.ts` (registrar rotas access)
- `packages/types/src/entities/rbac.ts` (novos types, widen PermissionAction)
- `apps/web/features/roles/types/index.ts` (widen action type)
- `apps/web/features/roles/components/PermissionsMatrix.tsx` (colunas dinamicas)
- `apps/web/features/roles/components/RoleForm.tsx` (policy selector)
- `apps/web/features/roles/api/roles-api.ts` (policy methods)
- `apps/web/features/usuarios/hooks/usePermissions.tsx` (widen type)
- `apps/web/shared/components/PermissionGate.tsx` (widen action type)
- `apps/web/features/admin-layout/components/AdminSidebar.tsx` (nova secao)

### Novos (a criar)
- `apps/api/src/infrastructure/database/migrations/003_create_access_policy_tables.sql`
- `apps/api/src/domain/entities/AccessResource.ts`
- `apps/api/src/domain/entities/AccessAction.ts`
- `apps/api/src/domain/entities/AccessPolicy.ts`
- `apps/api/src/domain/repositories/IAccessResourceRepository.ts`
- `apps/api/src/domain/repositories/IAccessActionRepository.ts`
- `apps/api/src/domain/repositories/IAccessPolicyRepository.ts`
- `apps/api/src/infrastructure/database/supabase/repositories/SupabaseAccessResourceRepository.ts`
- `apps/api/src/infrastructure/database/supabase/repositories/SupabaseAccessActionRepository.ts`
- `apps/api/src/infrastructure/database/supabase/repositories/SupabaseAccessPolicyRepository.ts`
- `apps/api/src/infrastructure/mappers/AccessMapper.ts`
- `apps/api/src/application/use-cases/access/` (15+ use cases)
- `apps/api/src/interface-adapters/controllers/AccessResourceController.ts`
- `apps/api/src/interface-adapters/controllers/AccessActionController.ts`
- `apps/api/src/interface-adapters/controllers/AccessPolicyController.ts`
- `apps/api/src/routes/access/resources.ts`
- `apps/api/src/routes/access/actions.ts`
- `apps/api/src/routes/access/policies.ts`
- `apps/web/features/access/` (feature module completo)
- `apps/web/app/admin/acesso/` (paginas admin)
