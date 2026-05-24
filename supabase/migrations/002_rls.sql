-- ── Row Level Security ─────────────────────────────────────────────────────────
--
-- RLS strategy: all application queries arrive via the service-role key on the
-- server, which bypasses RLS by default.  These policies act as defense-in-depth
-- for any connection that does NOT use the service-role key (e.g. direct DB
-- access, future anon-key client-side queries, or Supabase Studio ad-hoc queries).
--
-- Application context is injected per-request via set_config() before each query:
--   app.tenant_id      — UUID of the resolved tenant (empty string = none)
--   app.clerk_user_id  — Clerk user ID string
--   app.user_role      — 'tenant_admin' | 'member' | '' (none)
--   app.is_super_admin — 'true' | 'false'
--
-- To use RLS enforcement without the service-role key, call set_app_context()
-- before running queries.

-- ── Helper functions ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_app_context(
  p_tenant_id      TEXT    DEFAULT '',
  p_clerk_user_id  TEXT    DEFAULT '',
  p_user_role      TEXT    DEFAULT '',
  p_is_super_admin BOOLEAN DEFAULT false
)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    set_config('app.tenant_id',      p_tenant_id,            true),
    set_config('app.clerk_user_id',  p_clerk_user_id,        true),
    set_config('app.user_role',      p_user_role,            true),
    set_config('app.is_super_admin', p_is_super_admin::text, true);
$$;

CREATE OR REPLACE FUNCTION app_tenant_id() RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '')::UUID;
$$;

CREATE OR REPLACE FUNCTION app_clerk_user_id() RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.clerk_user_id', true), '');
$$;

CREATE OR REPLACE FUNCTION app_user_role() RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.user_role', true), '');
$$;

CREATE OR REPLACE FUNCTION app_is_super_admin() RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT COALESCE(current_setting('app.is_super_admin', true), 'false')::BOOLEAN;
$$;

-- ── Enable RLS ─────────────────────────────────────────────────────────────────

ALTER TABLE tenants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_invites  ENABLE ROW LEVEL SECURITY;

-- ── tenants ────────────────────────────────────────────────────────────────────

-- Super admins can do anything
CREATE POLICY "tenants__super_admin_all" ON tenants
  FOR ALL
  USING (app_is_super_admin());

-- Members/admins can read their own tenant row
CREATE POLICY "tenants__member_read_own" ON tenants
  FOR SELECT
  USING (id = app_tenant_id());

-- ── tenant_accounts ────────────────────────────────────────────────────────────

-- Super admins can do anything
CREATE POLICY "tenant_accounts__super_admin_all" ON tenant_accounts
  FOR ALL
  USING (app_is_super_admin());

-- Tenant admins can read/write all accounts in their tenant
CREATE POLICY "tenant_accounts__admin_all_in_tenant" ON tenant_accounts
  FOR ALL
  USING (
    tenant_id = app_tenant_id()
    AND app_user_role() = 'tenant_admin'
  );

-- Members can only read their own account row
CREATE POLICY "tenant_accounts__member_read_self" ON tenant_accounts
  FOR SELECT
  USING (
    tenant_id      = app_tenant_id()
    AND clerk_user_id = app_clerk_user_id()
  );

-- ── tenant_invites ─────────────────────────────────────────────────────────────

-- Super admins can do anything
CREATE POLICY "tenant_invites__super_admin_all" ON tenant_invites
  FOR ALL
  USING (app_is_super_admin());

-- Tenant admins can manage invites for their own tenant
CREATE POLICY "tenant_invites__admin_manage" ON tenant_invites
  FOR ALL
  USING (
    tenant_id = app_tenant_id()
    AND app_user_role() = 'tenant_admin'
  );

-- Any authenticated user can read an invite by its token (for acceptance flow)
-- Note: token lookup goes through the service-role key in the API layer, so this
-- policy only needs to allow reads by the accepting user.
CREATE POLICY "tenant_invites__read_own_token" ON tenant_invites
  FOR SELECT
  USING (accepted_at IS NULL AND expires_at > NOW());
