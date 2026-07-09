-- Extends the read-only "recommendations" feature into a full admin approval workflow.
-- Corporate recommendations are now organization-wide (not tied to a single subscription),
-- so subscription_id/current_package_id become optional, and direct customer_id/
-- organization_id columns become the authoritative link for individual vs corporate rows.

-- 0. Drop the CHECK constraints Hibernate generated for the old enum values
--    (ddl-auto=update does not update these automatically when enum values change).
ALTER TABLE recommendations DROP CONSTRAINT IF EXISTS recommendations_status_check;
ALTER TABLE recommendations DROP CONSTRAINT IF EXISTS recommendations_recommendation_type_check;

-- 1. Relax NOT NULL on subscription_id / current_package_id.
ALTER TABLE recommendations ALTER COLUMN subscription_id DROP NOT NULL;
ALTER TABLE recommendations ALTER COLUMN current_package_id DROP NOT NULL;

-- 2. New columns (idempotent).
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS customer_id BIGINT REFERENCES customers(id);
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS organization_id BIGINT REFERENCES organizations(id);
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS is_high_priority BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS average_usage_ratio NUMERIC(6,2);
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS consecutive_overage_months INTEGER;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS calculation_period_start DATE;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS calculation_period_end DATE;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS reviewed_by BIGINT;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- 3. Backfill customer_id/organization_id for existing rows from their subscription.
UPDATE recommendations r
SET customer_id = s.customer_id,
    organization_id = s.organization_id
FROM subscriptions s
WHERE r.subscription_id = s.id
  AND r.customer_id IS NULL;

-- 4. Remap old status values -> new 3-state enum.
UPDATE recommendations SET status = 'PENDING'  WHERE status IN ('ACTIVE', 'EXPIRED');
UPDATE recommendations SET status = 'APPROVED' WHERE status = 'APPLIED';
UPDATE recommendations SET status = 'REJECTED' WHERE status = 'DISMISSED';

-- 5. Remap old recommendation_type values -> new 3-state enum.
UPDATE recommendations SET recommendation_type = 'UPGRADE'   WHERE recommendation_type = 'UPGRADE_PACKAGE';
UPDATE recommendations SET recommendation_type = 'DOWNGRADE' WHERE recommendation_type = 'DOWNGRADE_PACKAGE';
UPDATE recommendations SET recommendation_type = 'NO_CHANGE' WHERE recommendation_type IN ('KEEP_CURRENT_PACKAGE', 'REVIEW_USAGE');

-- 6. updated_at backfill so the column isn't NULL for pre-existing rows.
UPDATE recommendations SET updated_at = created_at WHERE updated_at IS NULL;

-- 7. One recommendation row per customer / per organization (upsert target), plus
--    indexes to support the admin list/filter queries.
CREATE UNIQUE INDEX IF NOT EXISTS uq_recommendations_customer ON recommendations(customer_id) WHERE customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_recommendations_organization ON recommendations(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations(status);
CREATE INDEX IF NOT EXISTS idx_recommendations_type ON recommendations(recommendation_type);
