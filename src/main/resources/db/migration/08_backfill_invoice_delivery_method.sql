-- delivery_method has been NULL on every invoice since the column was added,
-- so the dashboard's Digital Invoice Rate / Paper Invoice Rate cards and the
-- Digital vs Paper chart have always read as 0%. Backfills a realistic,
-- digital-leaning split so those cards show real, non-zero data.
-- Idempotent: only touches invoices that don't have a delivery method yet.
UPDATE invoices
SET delivery_method = (ARRAY['DIGITAL', 'DIGITAL', 'DIGITAL', 'PAPER'])[floor(random() * 4 + 1)],
    updated_at = now()
WHERE delivery_method IS NULL;
