-- ── Business Profiles ─────────────────────────────────────────────────────────
-- One row per tenant. Stores business details and primary admin contact info.

CREATE TABLE business_profiles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id        UUID UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  business_name    TEXT NOT NULL DEFAULT '',
  business_type    TEXT,
  phone            TEXT,
  address          TEXT,
  city             TEXT,
  state            TEXT,
  zip              TEXT,
  website          TEXT,
  admin_first_name TEXT,
  admin_last_name  TEXT,
  admin_email      TEXT,
  admin_phone      TEXT,
  admin_title      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Review Sites ───────────────────────────────────────────────────────────────
-- Platform-specific review URLs configured per tenant during onboarding.

CREATE TABLE review_sites (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform     TEXT        NOT NULL,
  display_name TEXT,
  url          TEXT        NOT NULL,
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_review_sites_tenant_id     ON review_sites(tenant_id);
CREATE INDEX idx_review_sites_tenant_active ON review_sites(tenant_id, is_active);

-- ── Onboarding tracking ────────────────────────────────────────────────────────

ALTER TABLE tenant_accounts ADD COLUMN onboarding_completed_at TIMESTAMPTZ;

-- ── RLS ────────────────────────────────────────────────────────────────────────

ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_sites       ENABLE ROW LEVEL SECURITY;

-- Super admin has full access
CREATE POLICY "business_profiles__super_admin_all" ON business_profiles
  FOR ALL USING (app_is_super_admin());

CREATE POLICY "review_sites__super_admin_all" ON review_sites
  FOR ALL USING (app_is_super_admin());

-- Tenant admins can manage their own business profile and review sites
CREATE POLICY "business_profiles__admin_all" ON business_profiles
  FOR ALL
  USING (tenant_id = app_tenant_id() AND app_user_role() = 'tenant_admin');

CREATE POLICY "review_sites__admin_all" ON review_sites
  FOR ALL
  USING (tenant_id = app_tenant_id() AND app_user_role() = 'tenant_admin');

-- All tenant members can read
CREATE POLICY "business_profiles__member_read" ON business_profiles
  FOR SELECT USING (tenant_id = app_tenant_id());

CREATE POLICY "review_sites__member_read" ON review_sites
  FOR SELECT USING (tenant_id = app_tenant_id());
