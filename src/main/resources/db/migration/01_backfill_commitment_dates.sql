-- Backfills commitment_start_date/commitment_end_date for subscriptions seeded before
-- these columns existed. Assumes a standard 24-month commitment period anchored to
-- start_date, since no other historical signal is available for the seeded rows.
UPDATE subscriptions
SET commitment_start_date = start_date,
    commitment_end_date = start_date + INTERVAL '24 months'
WHERE commitment_start_date IS NULL
   OR commitment_end_date IS NULL;
