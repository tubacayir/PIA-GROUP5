-- Auto-generated seed script for packages
-- Source: Excel import (customer/organizations/packages/subscriptions)
TRUNCATE TABLE packages RESTART IDENTITY CASCADE;

INSERT INTO packages (id, package_code, package_name, description, internet_limit_gb, minute_limit, sms_limit, monthly_fee, status, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES
  (1, 'PJ-10', 'PiACell Genc', 'Bireysel giris seviyesi paket', 10, 1000, 250, 399, 'ACTIVE', '2026-07-07 12:00:00.000000', '2026-07-07 12:00:00.000000'),
  (2, 'PN-25', 'PiACell Nova', 'Bireysel orta seviye paket', 25, 2000, 500, 599, 'ACTIVE', '2026-07-07 12:00:00.000000', '2026-07-07 12:00:00.000000'),
  (3, 'PN-50', 'PiACell Nova Max', 'Bireysel ust seviye paket', 50, 3000, 1000, 899, 'ACTIVE', '2026-07-07 12:00:00.000000', '2026-07-07 12:00:00.000000'),
  (4, 'BC-30', 'PiACell Business Core', 'Kurumsal giris seviyesi paket', 30, 2000, 500, 649, 'ACTIVE', '2026-07-07 12:00:00.000000', '2026-07-07 12:00:00.000000'),
  (5, 'BP-60', 'PiACell Business Pro', 'Kurumsal orta seviye paket', 60, 5000, 1000, 999, 'ACTIVE', '2026-07-07 12:00:00.000000', '2026-07-07 12:00:00.000000'),
  (6, 'BX-100', 'PiACell Business X', 'Kurumsal sinirsiz paket', 100, 100000, 20000, 1499, 'ACTIVE', '2026-07-07 12:00:00.000000', '2026-07-07 12:00:00.000000');

SELECT setval(pg_get_serial_sequence('packages', 'id'), (SELECT MAX(id) FROM packages));
