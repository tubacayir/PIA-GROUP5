-- Introduces a single company-wide corporate package per organization, separate from
-- each employee's individually assigned package on their subscription.
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS corporate_package_id BIGINT REFERENCES packages(id);

-- Backfill: assign each organization the package most commonly used by its employees'
-- subscriptions today (ties broken by lowest package id for determinism). Organizations
-- with no subscriptions yet are left NULL.
WITH package_counts AS (
    SELECT organization_id, package_id, COUNT(*) AS cnt
    FROM subscriptions
    WHERE organization_id IS NOT NULL
    GROUP BY organization_id, package_id
),
ranked AS (
    SELECT organization_id, package_id,
           ROW_NUMBER() OVER (PARTITION BY organization_id ORDER BY cnt DESC, package_id ASC) AS rn
    FROM package_counts
)
UPDATE organizations o
SET corporate_package_id = r.package_id
FROM ranked r
WHERE r.organization_id = o.id
  AND r.rn = 1
  AND o.corporate_package_id IS NULL;
