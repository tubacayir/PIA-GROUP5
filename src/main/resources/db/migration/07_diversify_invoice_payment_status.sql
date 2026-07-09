-- Real invoice books are never 100% paid, but every invoice currently carries
-- a successful payment (from the 05 backfill). This flips a realistic slice
-- of invoices to OVERDUE (a payment attempt exists but failed, and the due
-- date has since passed relative to CURRENT_DATE) and a smaller slice to
-- CANCELLED (voided before any payment was collected), so the dashboard's
-- Payment Status, Payment Channels and rate cards show real variance instead
-- of a flat 100% paid / 0% unpaid split.
-- Idempotent: guarded by a check for any pre-existing OVERDUE/CANCELLED invoice.
DO $$
DECLARE
    overdue_ids bigint[];
    cancelled_ids bigint[];
BEGIN
    IF EXISTS (SELECT 1 FROM invoices WHERE status IN ('OVERDUE', 'CANCELLED')) THEN
        RAISE NOTICE 'Invoice diversification already applied, skipping.';
        RETURN;
    END IF;

    -- ~15% of paid, past-due invoices become OVERDUE. The existing payment
    -- row is kept as the record of the attempt, just flipped to UNPAID so it
    -- no longer counts as a successful payment.
    SELECT array_agg(id) INTO overdue_ids FROM (
        SELECT id FROM invoices
        WHERE status = 'PAID' AND due_date < CURRENT_DATE
        ORDER BY random()
        LIMIT (SELECT CEIL(COUNT(*) * 0.15)::int FROM invoices
               WHERE status = 'PAID' AND due_date < CURRENT_DATE)
    ) sub;

    UPDATE payments SET status = 'UNPAID', updated_at = now()
    WHERE invoice_id = ANY(overdue_ids);

    UPDATE invoices SET status = 'OVERDUE', updated_at = now()
    WHERE id = ANY(overdue_ids);

    -- ~3% of the remaining paid invoices become CANCELLED: voided before
    -- collection, so no payment attempt is on record at all.
    SELECT array_agg(id) INTO cancelled_ids FROM (
        SELECT id FROM invoices
        WHERE status = 'PAID'
        ORDER BY random()
        LIMIT (SELECT CEIL(COUNT(*) * 0.03)::int FROM invoices WHERE status = 'PAID')
    ) sub;

    DELETE FROM payments WHERE invoice_id = ANY(cancelled_ids);

    UPDATE invoices SET status = 'CANCELLED', updated_at = now()
    WHERE id = ANY(cancelled_ids);
END $$;
