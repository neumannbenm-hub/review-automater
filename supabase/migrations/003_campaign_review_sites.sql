-- ── Campaign Review Sites ─────────────────────────────────────────────────────
-- Links campaign IDs (from external ReviewBoost API) to the review sites
-- (Supabase) that should appear on the multi-site landing page for that campaign.

CREATE TABLE campaign_review_sites (
  campaign_id    TEXT        NOT NULL,
  tenant_id      UUID        NOT NULL REFERENCES tenants(id)     ON DELETE CASCADE,
  review_site_id UUID        NOT NULL REFERENCES review_sites(id) ON DELETE CASCADE,
  sort_order     INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (campaign_id, review_site_id)
);

CREATE INDEX idx_campaign_review_sites_campaign_id ON campaign_review_sites(campaign_id);
CREATE INDEX idx_campaign_review_sites_tenant_id   ON campaign_review_sites(tenant_id);

ALTER TABLE campaign_review_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaign_review_sites__super_admin_all" ON campaign_review_sites
  FOR ALL USING (app_is_super_admin());

CREATE POLICY "campaign_review_sites__admin_all" ON campaign_review_sites
  FOR ALL
  USING (tenant_id = app_tenant_id() AND app_user_role() = 'tenant_admin');

CREATE POLICY "campaign_review_sites__member_all" ON campaign_review_sites
  FOR ALL
  USING (tenant_id = app_tenant_id());
