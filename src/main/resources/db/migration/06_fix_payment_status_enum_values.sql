-- The payments table was originally created (and backfilled) while
-- PaymentStatus still had SUCCESS/FAILED values. That enum was since renamed
-- to PAID/UNPAID, but the live table was never migrated: every row's status
-- is still 'SUCCESS' and the payments_status_check constraint still only
-- allows 'SUCCESS'/'FAILED'. Every query filtering on PaymentStatus.PAID
-- (paid invoice count, paid-on-time/late rate, payment channel distribution)
-- therefore silently matches zero rows. Idempotent: only acts on legacy values.
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

UPDATE payments SET status = 'PAID' WHERE status = 'SUCCESS';
UPDATE payments SET status = 'UNPAID' WHERE status = 'FAILED';

ALTER TABLE payments ADD CONSTRAINT payments_status_check
    CHECK (status IN ('PAID', 'UNPAID'));
