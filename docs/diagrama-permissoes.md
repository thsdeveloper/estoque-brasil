# Sistema de Permissoes - Fluxo Completo

## 1. Modelo de Dados (Banco de Dados)

```mermaid
erDiagram
    auth_users ||--o| user_profiles : "id = id"
    user_profiles ||--o{ user_roles : "user_id"
    roles ||--o{ user_roles : "role_id"
    roles ||--o{ role_policies : "role_id"
    access_policies ||--o{ role_policies : "policy_id"
    access_policies ||--o{ policy_permissions : "policy_id"
    permissions ||--o{ policy_permissions : "permission_id"

    auth_users {
        uuid id PK
        string email
        string encrypted_password
    }

    user_profiles {
        uuid id PK "= auth.users.id"
        string email
        string full_name
        boolean is_active
        timestamp last_login_at
    }

    roles {
        uuid id PK
        string name "ex: admin, operador"
        string display_name "ex: Administrador"
        boolean is_system_role
    }

    user_roles {
        uuid user_id FK
        uuid role_id FK
        uuid assigned_by
    }

    access_policies {
        uuid id PK
        string name "ex: gestao_usuarios"
        string display_name "ex: Gestao de Usuarios"
        boolean is_system_policy
    }

    role_policies {
        uuid role_id FK
        uuid policy_id FK
    }

    permissions {
        uuid id PK
        string resource "ex: usuarios"
        string action "ex: read, create"
        string description
    }

    policy_permissions {
        uuid policy_id FK
        uuid permission_id FK
    }
```

## 2. Cadeia de Resolucao de Permissoes

```mermaid
flowchart LR
    U[Usuario] --> UR[user_roles]
    UR --> R[Role]
    R --> RP[role_policies]
    RP --> P[Policy]
    P --> PP[policy_permissions]
    PP --> PERM[Permission]
    PERM --> RA["resource:action<br/>ex: usuarios:read"]

    style U fill:#4f46e5,color:#fff
    style R fill:#7c3aed,color:#fff
    style P fill:#2563eb,color:#fff
    style PERM fill:#059669,color:#fff
    style RA fill:#d97706,color:#fff
```

## 3. Fluxo de Login e Obtencao de Token

```mermaid
sequenceDiagram
    participant C as Cliente<br/>(Web/Mobile)
    participant API as API Fastify
    participant SA as Supabase Auth
    participant DB as PostgreSQL

    C->>API: POST /api/auth/login<br/>{ email, password }
    API->>SA: signInWithPassword()
    SA->>SA: Valida credenciais
    SA-->>API: { access_token (JWT), refresh_token }
    API-->>C: { accessToken, refreshToken, expiresAt, user }

    Note over C: Web: armazena no Supabase Client (cookies)<br/>Mobile: armazena no SecureStore

    C->>API: GET /api/users/me<br/>Authorization: Bearer {JWT}
    API->>API: requireAuth: verifica JWT via JWKS
    API->>DB: SELECT user_profiles + roles
    DB-->>API: { id, fullName, roles: [...] }
    API-->>C: UserProfile com roles

    C->>API: GET /api/users/me/permissions<br/>Authorization: Bearer {JWT}
    API->>API: requireAuth: verifica JWT
    API->>DB: RPC get_user_permissions(user_uuid)
    DB->>DB: JOIN user_roles → role_policies<br/>→ policy_permissions → permissions
    DB-->>API: [{ resource, action }, ...]
    API-->>C: { userId, permissions: [...], roles: [...] }

    Note over C: Armazena permissoes no Context (React)
```

## 4. Fluxo de Autorizacao em Cada Request da API

```mermaid
flowchart TD
    REQ["Request HTTP<br/>Header: Authorization: Bearer JWT"] --> AUTH{requireAuth}
    AUTH -->|Token ausente| E401["401 Unauthorized<br/>Token nao fornecido"]
    AUTH -->|Token presente| VERIFY["Extrai Bearer Token<br/>Verifica JWT via Supabase JWKS"]
    VERIFY -->|JWT invalido/expirado| E401B["401 Unauthorized<br/>Token invalido"]
    VERIFY -->|JWT valido| EXTRACT["Extrai userId do payload<br/>request.user.sub = userId"]
    EXTRACT --> PERM{requirePermission<br/>resource, action}
    PERM --> RPC["Supabase RPC:<br/>user_has_permission(<br/>  userId,<br/>  resource,<br/>  action<br/>)"]
    RPC --> DBCHECK["PostgreSQL executa:<br/>SELECT 1 FROM user_roles<br/>JOIN role_policies<br/>JOIN policy_permissions<br/>JOIN permissions<br/>WHERE resource = X AND action = Y"]
    DBCHECK -->|false| E403["403 Forbidden<br/>Sem permissao"]
    DBCHECK -->|true| HANDLER["Executa Controller<br/>Retorna dados"]
    HANDLER --> R200["200 OK"]

    style REQ fill:#1e293b,color:#fff
    style AUTH fill:#7c3aed,color:#fff
    style PERM fill:#2563eb,color:#fff
    style RPC fill:#0891b2,color:#fff
    style DBCHECK fill:#059669,color:#fff
    style HANDLER fill:#16a34a,color:#fff
    style R200 fill:#16a34a,color:#fff
    style E401 fill:#dc2626,color:#fff
    style E401B fill:#dc2626,color:#fff
    style E403 fill:#dc2626,color:#fff
```

## 5. Fluxo no Frontend Web (Next.js)

```mermaid
flowchart TD
    LOGIN["Usuario faz login"] --> SUPA["Supabase Client<br/>signInWithPassword()"]
    SUPA --> TOKEN["JWT armazenado pelo<br/>Supabase Client (cookies)"]
    TOKEN --> REDIR["Redirect /admin"]
    REDIR --> PROV["PermissionsProvider<br/>(usePermissions hook)"]
    PROV --> FETCH["GET /api/users/me/permissions<br/>com Authorization header"]
    FETCH --> STORE["Armazena no React Context:<br/>permissions[] e roles[]"]
    STORE --> UI["Componentes usam:"]

    UI --> HP["hasPermission(resource, action)<br/>ex: hasPermission('usuarios', 'read')"]
    UI --> CR["canRead(resource)<br/>ex: canRead('inventarios')"]
    UI --> CC["canCreate(resource)"]
    UI --> CU["canUpdate(resource)"]
    UI --> CD["canDelete(resource)"]
    UI --> HR["hasRole(name)<br/>ex: hasRole('admin')"]

    HP --> SHOW{"Permissao<br/>existe?"}
    SHOW -->|Sim| RENDER["Renderiza componente<br/>(botao, link, pagina)"]
    SHOW -->|Nao| HIDE["Esconde componente<br/>ou mostra bloqueado"]

    style LOGIN fill:#4f46e5,color:#fff
    style PROV fill:#7c3aed,color:#fff
    style STORE fill:#2563eb,color:#fff
    style SHOW fill:#d97706,color:#fff
    style RENDER fill:#16a34a,color:#fff
    style HIDE fill:#dc2626,color:#fff
```

## 6. Fluxo no Mobile (Expo/React Native)

```mermaid
flowchart TD
    LOGIN["Usuario faz login"] --> POST["POST /api/auth/login<br/>{ email, password }"]
    POST --> SAVE["SecureStore.setItemAsync:<br/>- ACCESS_TOKEN<br/>- REFRESH_TOKEN<br/>- EXPIRES_AT"]
    SAVE --> ME["GET /api/users/me<br/>Busca perfil com roles"]
    ME --> CHECK{"Tem role permitida?<br/>(operador ou<br/>lider_coleta)"}
    CHECK -->|Nao| DENY["Logout + Erro:<br/>Acesso permitido apenas<br/>para Operadores"]
    CHECK -->|Sim| CTX["AuthContext atualiza:<br/>user, profile, isAuthenticated"]
    CTX --> NAV["Navega para tela principal"]

    NAV --> APICALL["Qualquer request API"]
    APICALL --> INTERCEPT["Axios Interceptor:<br/>Injeta Bearer token<br/>do SecureStore"]
    INTERCEPT --> SEND["Envia request com<br/>Authorization header"]
    SEND --> RESP{"Resposta"}
    RESP -->|200| OK["Processa dados"]
    RESP -->|401| REFRESH["Interceptor Response:<br/>Tenta refresh token"]
    REFRESH --> REFPOST["POST /api/auth/refresh<br/>{ refreshToken }"]
    REFPOST -->|Sucesso| RETRY["Atualiza tokens<br/>Reenvia request original<br/>+ requests da fila"]
    REFPOST -->|Falha| LOGOUT["Limpa SecureStore<br/>Redireciona para login"]

    style LOGIN fill:#4f46e5,color:#fff
    style SAVE fill:#7c3aed,color:#fff
    style CHECK fill:#d97706,color:#fff
    style DENY fill:#dc2626,color:#fff
    style CTX fill:#2563eb,color:#fff
    style REFRESH fill:#f59e0b,color:#fff
    style RETRY fill:#16a34a,color:#fff
    style LOGOUT fill:#dc2626,color:#fff
```

## 7. Exemplo Completo: Criar um Inventario

```mermaid
sequenceDiagram
    participant W as Web Admin
    participant API as API Fastify
    participant AUTH as requireAuth
    participant AUTHZ as requirePermission
    participant DB as PostgreSQL

    Note over W: Usuario clica "Novo Inventario"<br/>Frontend ja verificou:<br/>canCreate('inventarios') == true

    W->>API: POST /api/inventarios<br/>Authorization: Bearer eyJhbG...<br/>Body: { nome, clienteId, ... }

    API->>AUTH: Middleware 1: requireAuth
    AUTH->>AUTH: Extrai token do header
    AUTH->>AUTH: Verifica JWT via JWKS do Supabase
    AUTH->>AUTH: request.user = { sub: "user-uuid-123" }
    AUTH-->>API: OK - usuario autenticado

    API->>AUTHZ: Middleware 2: requirePermission('inventarios', 'create')
    AUTHZ->>DB: SELECT user_has_permission(<br/>  'user-uuid-123',<br/>  'inventarios',<br/>  'create'<br/>)
    DB->>DB: Verifica cadeia completa:<br/>user_roles → role_policies<br/>→ policy_permissions → permissions
    DB-->>AUTHZ: true
    AUTHZ-->>API: OK - permissao concedida

    API->>DB: INSERT INTO inventarios (...)
    DB-->>API: Inventario criado
    API-->>W: 201 Created { id, nome, ... }
```

## 8. O que e Necessario para a Validacao Funcionar

```mermaid
flowchart TD
    subgraph SETUP["CONFIGURACAO INICIAL (uma vez)"]
        direction TB
        S1["1. Criar Permissions no banco<br/>INSERT INTO permissions (resource, action)<br/>ex: ('inventarios', 'create')"]
        S2["2. Criar Policies agrupando permissions<br/>INSERT INTO access_policies (...)<br/>INSERT INTO policy_permissions (...)"]
        S3["3. Criar Roles<br/>INSERT INTO roles (name, display_name)"]
        S4["4. Atribuir Policies as Roles<br/>INSERT INTO role_policies (role_id, policy_id)"]
        S5["5. Atribuir Roles aos Users<br/>INSERT INTO user_roles (user_id, role_id)"]
        S1 --> S2 --> S3 --> S4 --> S5
    end

    subgraph API_SETUP["PROTECAO DAS ROTAS (codigo)"]
        direction TB
        A1["Rota define middlewares:<br/>preHandler: [<br/>  requireAuth,<br/>  requirePermission('recurso', 'acao')<br/>]"]
    end

    subgraph FRONTEND_SETUP["CONTROLE DE UI (codigo)"]
        direction TB
        F1["PermissionsProvider<br/>carrega permissoes do user<br/>no login"]
        F2["Componentes usam hooks:<br/>canCreate('inventarios')<br/>canUpdate('usuarios')"]
        F3["Condicional no JSX:<br/>{canCreate('inventarios') && <br/>  Button 'Novo Inventario' }"]
        F1 --> F2 --> F3
    end

    subgraph RUNTIME["EM TEMPO DE EXECUCAO"]
        direction TB
        R1["Login gera JWT"]
        R2["Frontend carrega permissoes"]
        R3["UI mostra/esconde elementos"]
        R4["Request vai para API"]
        R5["API verifica JWT"]
        R6["API verifica permissao no DB"]
        R7["Acesso concedido ou negado"]
        R1 --> R2 --> R3 --> R4 --> R5 --> R6 --> R7
    end

    SETUP --> API_SETUP
    API_SETUP --> FRONTEND_SETUP
    FRONTEND_SETUP --> RUNTIME

    style SETUP fill:#1e1b4b,color:#fff
    style API_SETUP fill:#172554,color:#fff
    style FRONTEND_SETUP fill:#14532d,color:#fff
    style RUNTIME fill:#431407,color:#fff
```

## 9. Dupla Validacao: Frontend + Backend

```mermaid
flowchart LR
    subgraph FRONT["FRONTEND (UX)"]
        direction TB
        F1["usePermissions()"]
        F2{"canCreate<br/>('inventarios')?"}
        F3["Mostra botao"]
        F4["Esconde botao"]
        F1 --> F2
        F2 -->|Sim| F3
        F2 -->|Nao| F4
    end

    subgraph BACK["BACKEND (Seguranca)"]
        direction TB
        B1["requireAuth"]
        B2["requirePermission<br/>('inventarios', 'create')"]
        B3["RPC user_has_permission()"]
        B4{"Permissao?"}
        B5["200 OK"]
        B6["403 Forbidden"]
        B1 --> B2 --> B3 --> B4
        B4 -->|Sim| B5
        B4 -->|Nao| B6
    end

    F3 -->|"POST /api/inventarios"| B1

    style FRONT fill:#1e1b4b,color:#fff
    style BACK fill:#14532d,color:#fff
```

> **Importante:** A validacao do frontend e apenas para UX (esconder botoes).
> A **seguranca real** esta no backend - mesmo que alguem burle o frontend,
> a API vai rejeitar com 403 se nao tiver permissao no banco.

## 10. Resumo das Funcoes SQL

| Funcao | Parametros | Retorno | Uso |
|--------|-----------|---------|-----|
| `user_has_permission` | `(user_uuid, resource, action)` | `BOOLEAN` | Middleware `requirePermission` em cada rota |
| `get_user_permissions` | `(user_uuid)` | `TABLE(resource, action)` | Endpoint `GET /api/users/me/permissions` |

Ambas seguem o mesmo caminho:
```
user_roles → role_policies → policy_permissions → permissions
```
