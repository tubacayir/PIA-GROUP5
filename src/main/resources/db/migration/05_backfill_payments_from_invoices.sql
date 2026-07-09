-- Backfills a payments row for every existing invoice that is already marked
-- PAID but predates the payments table (payment_date/payment_channel on
-- invoices were always NULL in the seed data, so every dashboard metric that
-- depends on real payment records read as zero). One PAID payment per
-- invoice, with a realistic on-time/late split and channel/method mix so the
-- Paid On Time / Late Payment / Digital vs Physical Channel dashboard cards
-- have real, non-zero data to show. Idempotent: skips invoices that already
-- have a payment row.
INSERT INTO payments (invoice_id, payment_date, amount, payment_method, payment_channel, status, reference_number, created_at, updated_at)
SELECT
    i.id,
    LEAST(
        CASE
            WHEN random() < 0.88 THEN i.due_date - (floor(random() * 10))::int
            ELSE i.due_date + (floor(random() * 15) + 1)::int
        END,
        CURRENT_DATE
    ) AS payment_date,
    i.total_amount,
    (ARRAY['CREDIT_CARD', 'BANK_TRANSFER', 'OTHER'])[floor(random() * 3 + 1)],
    -- Weighted so digital self-service channels dominate over the physical STORE channel.
    (ARRAY['MOBILE_APP', 'MOBILE_APP', 'WEB', 'WEB', 'BANK_APP', 'AUTO_PAYMENT', 'AUTO_PAYMENT', 'STORE'])[floor(random() * 8 + 1)],
    'PAID',
    'PMT-' || i.id || '-' || substr(md5(random()::text), 1, 8),
    now(),
    now()
FROM invoices i
WHERE i.status = 'PAID'
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id);
