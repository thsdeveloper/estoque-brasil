-- Migration: Create RBAC (Role-Based Access Control) tables
-- Date: 2026-02-05

-- ============================================
-- Table: roles (Papéis do sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for roles
CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_system ON public.roles(is_system_role);

-- ============================================
-- Table: permissions (Permissões granulares)
-- ============================================
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource, action)
);

-- Index for permissions
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON public.permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON public.permissions(resource, action);

-- ============================================
-- Table: role_permissions (N:N entre roles e permissions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- Indexes for role_permissions
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON public.role_permissions(permission_id);

-- ============================================
-- Table: user_profiles (Perfil estendido - referencia auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON public.user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_full_name ON public.user_profiles(full_name);

-- ============================================
-- Table: user_roles (N:N entre users e roles)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- Indexes for user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role_id);

-- ============================================
-- Triggers for updated_at
-- ============================================

-- Apply trigger to new tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT unnest(ARRAY['roles', 'user_profiles'])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%s;
            CREATE TRIGGER update_%s_updated_at
                BEFORE UPDATE ON public.%s
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Check if user has permission
-- ============================================
CREATE OR REPLACE FUNCTION public.user_has_permission(
    user_uuid UUID,
    resource_name TEXT,
    action_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
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

-- ============================================
-- Function: Get all user permissions
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid UUID)
RETURNS TABLE (
    resource VARCHAR(50),
    action VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.resource, p.action
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Get user roles
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_roles(user_uuid UUID)
RETURNS TABLE (
    role_id UUID,
    role_name VARCHAR(50),
    display_name VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.name, r.display_name
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all RBAC tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Roles: Read by all authenticated, write only by admins
CREATE POLICY "Allow authenticated users to read roles"
    ON public.roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow admins to manage roles"
    ON public.roles FOR ALL
    TO authenticated
    USING (public.user_has_permission(auth.uid(), 'usuarios', 'create'))
    WITH CHECK (public.user_has_permission(auth.uid(), 'usuarios', 'create'));

-- Permissions: Read by all authenticated
CREATE POLICY "Allow authenticated users to read permissions"
    ON public.permissions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow admins to manage permissions"
    ON public.permissions FOR ALL
    TO authenticated
    USING (public.user_has_permission(auth.uid(), 'usuarios', 'create'))
    WITH CHECK (public.user_has_permission(auth.uid(), 'usuarios', 'create'));

-- Role Permissions: Read by all authenticated, write only by admins
CREATE POLICY "Allow authenticated users to read role_permissions"
    ON public.role_permissions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow admins to manage role_permissions"
    ON public.role_permissions FOR ALL
    TO authenticated
    USING (public.user_has_permission(auth.uid(), 'usuarios', 'create'))
    WITH CHECK (public.user_has_permission(auth.uid(), 'usuarios', 'create'));

-- User Profiles: Users can read all, but only update their own (admins can manage all)
CREATE POLICY "Allow authenticated users to read user_profiles"
    ON public.user_profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow users to update own profile"
    ON public.user_profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admins to manage user_profiles"
    ON public.user_profiles FOR ALL
    TO authenticated
    USING (public.user_has_permission(auth.uid(), 'usuarios', 'create'))
    WITH CHECK (public.user_has_permission(auth.uid(), 'usuarios', 'create'));

-- User Roles: Read by all authenticated, write only by admins
CREATE POLICY "Allow authenticated users to read user_roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow admins to manage user_roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.user_has_permission(auth.uid(), 'usuarios', 'create'))
    WITH CHECK (public.user_has_permission(auth.uid(), 'usuarios', 'create'));

-- ============================================
-- SEED DATA: Default Roles
-- ============================================
INSERT INTO public.roles (name, display_name, description, is_system_role) VALUES
    ('admin', 'Administrador', 'Acesso total ao sistema', true),
    ('gerente', 'Gerente', 'Gerencia inventários e operadores', true),
    ('operador', 'Operador', 'Realiza contagens de inventário', true),
    ('visualizador', 'Visualizador', 'Apenas visualização de dados', true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED DATA: Default Permissions
-- ============================================
-- Generate permissions for each resource and action
DO $$
DECLARE
    resource_name TEXT;
    action_name TEXT;
    resources TEXT[] := ARRAY['usuarios', 'inventarios', 'clients', 'empresas', 'lojas', 'contagens', 'setores', 'produtos', 'templates'];
    actions TEXT[] := ARRAY['read', 'create', 'update', 'delete'];
BEGIN
    FOREACH resource_name IN ARRAY resources LOOP
        FOREACH action_name IN ARRAY actions LOOP
            INSERT INTO public.permissions (resource, action, description)
            VALUES (
                resource_name,
                action_name,
                format('Permissão para %s em %s', action_name, resource_name)
            )
            ON CONFLICT (resource, action) DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA: Role Permissions Mapping
-- ============================================

-- Admin: All permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Gerente: All except usuarios:delete and usuarios:create
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'gerente'
  AND NOT (p.resource = 'usuarios' AND p.action IN ('delete', 'create'))
ON CONFLICT DO NOTHING;

-- Operador: Read on most, create/update on contagens
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'operador'
  AND (
    (p.action = 'read' AND p.resource IN ('inventarios', 'lojas', 'empresas', 'setores', 'produtos'))
    OR (p.resource = 'contagens' AND p.action IN ('read', 'create', 'update'))
  )
ON CONFLICT DO NOTHING;

-- Visualizador: Only read permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r, public.permissions p
WHERE r.name = 'visualizador'
  AND p.action = 'read'
  AND p.resource NOT IN ('usuarios')
ON CONFLICT DO NOTHING;

-- ============================================
-- Comments on tables
-- ============================================
COMMENT ON TABLE public.roles IS 'Papéis/funções do sistema para controle de acesso';
COMMENT ON TABLE public.permissions IS 'Permissões granulares baseadas em recurso e ação';
COMMENT ON TABLE public.role_permissions IS 'Associação entre papéis e permissões';
COMMENT ON TABLE public.user_profiles IS 'Perfis de usuário com informações adicionais';
COMMENT ON TABLE public.user_roles IS 'Associação entre usuários e papéis';

COMMENT ON FUNCTION public.user_has_permission IS 'Verifica se um usuário possui uma permissão específica';
COMMENT ON FUNCTION public.get_user_permissions IS 'Retorna todas as permissões de um usuário';
COMMENT ON FUNCTION public.get_user_roles IS 'Retorna todos os papéis de um usuário';
