import pandas as pd
from pathlib import Path

SRC = Path(r"C:\Users\kadri\Downloads")

FILES = {
    "customer": "customers_final_fixed.csv",
    "organizations": "organizations_final_fixed.csv",
    "packages": "packages_final_fixed.csv",
    "subscriptions": "subscriptions_final_fixed.csv",
    "invoices": "invoices_final_fixed.csv",
    "invoice_lines": "invoice_lines_final_fixed.csv",
    "usage_summary": "usage_summary_final_fixed.csv",
}

UNIQUE_CHECKS = {
    "customer": ["id", "tc", "customer_number", "email", "phone_number"],
    "organizations": ["id", "organization_number", "tax_identity_number"],
    "packages": ["id", "package_code"],
    "subscriptions": ["id", "subscription_number", "phone_number"],
    "invoices": ["id", "invoice_number"],
    "invoice_lines": ["id"],
    "usage_summary": ["id"],
}

dfs = {}

for name, filename in FILES.items():
    path = SRC / filename
    df = pd.read_csv(path, encoding="utf-8")
    dfs[name] = df
    print(f"=== {name} ({filename}) ===")
    print(f"rows: {len(df)}, columns: {list(df.columns)}")

    null_counts = df.isnull().sum()
    nulls = null_counts[null_counts > 0]
    if len(nulls):
        print("null counts per column:")
        print(nulls.to_string())
    else:
        print("no nulls in any column")

    for col in UNIQUE_CHECKS.get(name, []):
        if col in df.columns:
            dupes = df[col].duplicated().sum()
            if dupes:
                print(f"DUPLICATE in '{col}': {dupes} duplicated values")
                print(df[df[col].duplicated(keep=False)].sort_values(col).head(10))
    print()

# Referential integrity checks
print("=== Referential integrity ===")

customer_ids = set(dfs["customer"]["id"])
org_ids = set(dfs["organizations"]["id"])
package_ids = set(dfs["packages"]["id"])
subscription_ids = set(dfs["subscriptions"]["id"])
invoice_ids = set(dfs["invoices"]["id"])

sub = dfs["subscriptions"]
missing_customer = sub[~sub["customer_id"].isin(customer_ids)]
print(f"subscriptions.customer_id missing from customer: {len(missing_customer)}")

org_col = sub["organization_id"].dropna()
org_col_int = org_col.astype(float).astype(int)
missing_org = org_col_int[~org_col_int.isin(org_ids)]
print(f"subscriptions.organization_id (non-null) missing from organizations: {len(missing_org)}")

missing_package = sub[~sub["package_id"].isin(package_ids)]
print(f"subscriptions.package_id missing from packages: {len(missing_package)}")

inv = dfs["invoices"]
missing_sub_for_invoice = inv[~inv["subscription_id"].isin(subscription_ids)]
print(f"invoices.subscription_id missing from subscriptions: {len(missing_sub_for_invoice)}")

lines = dfs["invoice_lines"]
missing_invoice_for_line = lines[~lines["invoice_id"].isin(invoice_ids)]
print(f"invoice_lines.invoice_id missing from invoices: {len(missing_invoice_for_line)}")

usage = dfs["usage_summary"]
missing_sub_for_usage = usage[~usage["subscription_id"].isin(subscription_ids)]
print(f"usage_summary.subscription_id missing from subscriptions: {len(missing_sub_for_usage)}")

# encoding spot-check: look for mojibake patterns
print()
print("=== Encoding spot-check (looking for mojibake like 'Ã' or '?') ===")
for name, df in dfs.items():
    text_cols = df.select_dtypes(include="object").columns
    for col in text_cols:
        sample_bad = df[df[col].astype(str).str.contains("Ã|�", regex=True, na=False)]
        if len(sample_bad):
            print(f"{name}.{col}: {len(sample_bad)} suspicious rows")
