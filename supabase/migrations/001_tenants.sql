-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tenants ────────────────────────────────────────────────────────────────────

CREATE TABLE tenants (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT        UNIQUE NOT NULL,
  name            TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'suspended', 'churned')),
  custom_domain   TEXT        UNIQUE,
  branding        JSONB       NOT NULL DEFAULT '{
    "primary_color":   "#4f46e5",
    "secondary_color": "#6366f1",
    "logo_url":        null,
    "favicon_url":     null,
    "font_family":     "Inter, sans-serif",
    "app_name":        "ReviewAutomater"
  }'::jsonb,
  pricing         JSONB       NOT NULL DEFAULT '{
    "monthly_price_per_seat": 49,
    "billing_model":          "wholesale",
    "trial_days":             14,
    "max_seats":              10
  }'::jsonb,
  wholesale_rate  NUMERIC(10,2) NOT NULL DEFAULT 0,
  retail_rate     NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tenant Accounts ────────────────────────────────────────────────────────────
-- Links Clerk user IDs to tenants. clerk_user_id is the Clerk user.id string.

CREATE TABLE tenant_accounts (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  clerk_user_id   TEXT        NOT NULL,
  role            TEXT        NOT NULL DEFAULT 'member'
                              CHECK (role IN ('tenant_admin', 'member')),
  plan            TEXT,
  seat_count      INTEGER     NOT NULL DEFAULT 1,
  status          TEXT        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'suspended', 'removed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at  TIMESTAMPTZ,
  UNIQUE (tenant_id, clerk_user_id)
);

-- ── Tenant Invites ─────────────────────────────────────────────────────────────
-- One-time tokens used to onboard new accounts into a tenant.

CREATE TABLE tenant_invites (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role        TEXT        NOT NULL DEFAULT 'member'
                          CHECK (role IN ('tenant_admin', 'member')),
  token       TEXT        UNIQUE NOT NULL
                          DEFAULT encode(gen_random_bytes(32), 'hex'),
  accepted_at TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────────────────────

CREATE INDEX idx_tenants_slug          ON tenants(slug);
CREATE INDEX idx_tenants_custom_domain ON tenants(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_tenants_status        ON tenants(status);

CREATE INDEX idx_tenant_accounts_tenant_id     ON tenant_accounts(tenant_id);
CREATE INDEX idx_tenant_accounts_clerk_user_id ON tenant_accounts(clerk_user_id);
CREATE INDEX idx_tenant_accounts_status        ON tenant_accounts(status);

CREATE INDEX idx_tenant_invites_token     ON tenant_invites(token);
CREATE INDEX idx_tenant_invites_tenant_id ON tenant_invites(tenant_id);

-- ── updated_at trigger ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
