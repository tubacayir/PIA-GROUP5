"""
Import the 7 source CSV files into the invoice_db PostgreSQL database.

Usage:
    python import_csv.py            # truncates target tables and reloads everything
    python import_csv.py --dry-run  # only prints what would happen, no DB writes

Connection settings are read from .env (see .env.example).
"""

import argparse
import io
import os
import sys
from datetime import date
from pathlib import Path

import pandas as pd
import psycopg2
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

DB_HOST = os.environ["DB_HOST"]
DB_PORT = os.environ["DB_PORT"]
DB_NAME = os.environ["DB_NAME"]
DB_USER = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]
CSV_DIR = Path(os.environ["CSV_DIR"])

LINE_TYPE_MAP = {
    "PACKAGE": "PACKAGE_FEE",
    "OVERAGE": "INTERNET_OVERAGE",
}

LINE_TYPE_DESCRIPTIONS = {
    "PACKAGE_FEE": "Package subscription fee",
    "INTERNET_OVERAGE": "Internet usage overage",
}

# Insert order respects foreign keys (parents before children).
# Each entry: (table name, csv loader function, list of columns to COPY in that order)
TABLE_ORDER = [
    "packages",
    "customer",
    "organizations",
    "subscriptions",
    "invoices",
    "invoice_lines",
    "usage_summaries",
]


def load_packages():
    df = pd.read_csv(CSV_DIR / "packages_final_fixed.csv", encoding="utf-8")
    cols = [
        "id", "created_at", "description", "internet_limit_gb", "minute_limit",
        "monthly_fee", "package_code", "package_name", "sms_limit", "status", "updated_at",
    ]
    return df[cols]


def load_customers(phone_by_customer):
    df = pd.read_csv(CSV_DIR / "customers_final_fixed.csv", encoding="utf-8")
    df = df.rename(columns={"password_hash": "password"})
    df["phone_number"] = df["id"].map(phone_by_customer)
    if df["phone_number"].isna().any():
        missing = df.loc[df["phone_number"].isna(), "id"].tolist()
        raise ValueError(f"No subscription phone_number found for customer ids: {missing}")
    cols = [
        "id", "tc", "customer_number", "first_name", "last_name", "email", "birth_date",
        "gender", "city", "status", "created_at", "updated_at", "password", "phone_number",
    ]
    return df[cols]


def load_organizations():
    df = pd.read_csv(CSV_DIR / "organizations_final_fixed.csv", encoding="utf-8")
    df = df.rename(columns={"password_hash": "password"})
    cols = [
        "id", "city", "created_at", "employee_count", "name", "sector", "status",
        "tax_identity_number", "updated_at", "password", "organization_number",
    ]
    return df[cols]


def load_subscriptions_raw():
    df = pd.read_csv(CSV_DIR / "subscriptions_final_fixed.csv", encoding="utf-8")
    df = df.rename(columns={
        "subscription_end_date": "end_date",
        "subscription_start_date": "start_date",
    })
    # organization_id arrives as a float ("1.0") because of NaNs for individual
    # subscriptions; Int64 is pandas' nullable integer dtype and keeps NaN as <NA>.
    df["organization_id"] = df["organization_id"].astype("Float64").astype("Int64")
    df["status"] = "ACTIVE"
    df["created_at"] = df["start_date"]
    cols = [
        "id", "created_at", "end_date", "phone_number", "start_date", "status",
        "subscription_number", "subscription_type", "updated_at", "customer_id",
        "organization_id", "package_id",
    ]
    return df[cols]


def phone_by_customer_map(subscriptions_df):
    # customers_final_fixed.csv has no phone_number column; use each customer's
    # earliest subscription's phone_number as their contact number. Subscription
    # phone numbers are already globally unique, so this stays unique per customer.
    ordered = subscriptions_df.sort_values(["customer_id", "start_date", "id"])
    first_per_customer = ordered.drop_duplicates("customer_id", keep="first")
    return first_per_customer.set_index("customer_id")["phone_number"]


def load_invoice_lines():
    df = pd.read_csv(CSV_DIR / "invoice_lines_final_fixed.csv", encoding="utf-8")
    df = df.rename(columns={"total_amount": "amount"})
    df["line_type"] = df["line_type"].map(LINE_TYPE_MAP)
    unmapped = df["line_type"].isna().sum()
    if unmapped:
        raise ValueError(f"{unmapped} invoice_lines rows have an unmapped line_type")
    df["description"] = df["line_type"].map(LINE_TYPE_DESCRIPTIONS)
    cols = ["id", "amount", "description", "line_type", "quantity", "unit_price", "invoice_id"]
    return df[cols]


def load_invoices(invoice_lines_df):
    df = pd.read_csv(
        CSV_DIR / "invoices_final_fixed.csv", encoding="utf-8", parse_dates=["invoice_date", "due_date"],
    )
    df = df.rename(columns={"invoice_date": "issue_date"})
    df["invoice_month"] = df["issue_date"].dt.month
    df["invoice_year"] = df["issue_date"].dt.year
    df["created_at"] = df["issue_date"]

    today = pd.Timestamp(date.today())
    df["status"] = df["due_date"].apply(lambda d: "PAID" if d < today else "CREATED")

    totals = invoice_lines_df.groupby("invoice_id")["amount"].sum().rename("total_amount")
    df = df.merge(totals, left_on="id", right_index=True, how="left")
    if df["total_amount"].isna().any():
        raise ValueError("Some invoices have no matching invoice_lines to total")

    cols = [
        "id", "created_at", "due_date", "invoice_month", "invoice_number",
        "invoice_year", "issue_date", "status", "total_amount", "subscription_id",
    ]
    return df[cols]


def load_usage_summaries():
    df = pd.read_csv(CSV_DIR / "usage_summary_final_fixed.csv", encoding="utf-8")
    parts = df["usage_month"].str.split("-", expand=True)
    df["usage_year"] = parts[0].astype(int)
    df["usage_month"] = parts[1].astype(int)
    df = df.rename(columns={
        "internet_used_gb": "used_internet_gb",
        "minute_used": "used_minutes",
        "sms_used": "used_sms",
    })
    cols = [
        "id", "usage_month", "usage_year", "used_internet_gb", "used_minutes",
        "used_sms", "subscription_id",
    ]
    return df[cols]


def build_dataframes():
    packages = load_packages()
    subscriptions = load_subscriptions_raw()
    customer = load_customers(phone_by_customer_map(subscriptions))
    organizations = load_organizations()
    invoice_lines = load_invoice_lines()
    invoices = load_invoices(invoice_lines)
    usage_summaries = load_usage_summaries()

    return {
        "packages": packages,
        "customer": customer,
        "organizations": organizations,
        "subscriptions": subscriptions,
        "invoices": invoices,
        "invoice_lines": invoice_lines,
        "usage_summaries": usage_summaries,
    }


def copy_dataframe(cursor, table, df):
    buffer = io.StringIO()
    df.to_csv(buffer, index=False, header=False, na_rep="")
    buffer.seek(0)
    columns = ", ".join(df.columns)
    cursor.copy_expert(
        f"COPY {table} ({columns}) FROM STDIN WITH (FORMAT csv, NULL '')",
        buffer,
    )


def reset_sequence(cursor, table):
    # table is always one of the hardcoded names in TABLE_ORDER, never user input.
    cursor.execute(
        f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), "
        f"COALESCE((SELECT MAX(id) FROM {table}), 1))"
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Only report, do not write to the database")
    args = parser.parse_args()

    print(f"Reading CSVs from {CSV_DIR} ...")
    dataframes = build_dataframes()

    for name in TABLE_ORDER:
        print(f"  {name}: {len(dataframes[name])} rows ready")

    if args.dry_run:
        print("\n--dry-run given, stopping before touching the database.")
        return

    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD,
    )
    conn.set_client_encoding("UTF8")
    conn.autocommit = False

    try:
        with conn.cursor() as cur:
            print("\nTruncating target tables (CASCADE also clears dependent rows, e.g. recommendations) ...")
            cur.execute(
                "TRUNCATE TABLE customer, organizations, packages, subscriptions, "
                "invoices, invoice_lines, usage_summaries RESTART IDENTITY CASCADE"
            )

            for name in TABLE_ORDER:
                print(f"Loading {name} ...")
                copy_dataframe(cur, name, dataframes[name])
                reset_sequence(cur, name)

        conn.commit()
        print("\nImport committed.")
    except Exception:
        conn.rollback()
        print("\nError occurred, transaction rolled back. No changes were made.", file=sys.stderr)
        raise
    finally:
        conn.close()

    validate(dataframes)


def validate(dataframes):
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD,
    )
    conn.set_client_encoding("UTF8")
    print("\n=== Validation report ===")
    with conn.cursor() as cur:
        all_ok = True
        for name in TABLE_ORDER:
            cur.execute(f"SELECT count(*) FROM {name}")
            db_count = cur.fetchone()[0]
            csv_count = len(dataframes[name])
            status = "OK" if db_count == csv_count else "MISMATCH"
            if status == "MISMATCH":
                all_ok = False
            print(f"{name:20s} csv={csv_count:8d}  db={db_count:8d}  [{status}]")
        print("\nAll tables match." if all_ok else "\nSome tables do not match, please review.")
    conn.close()


if __name__ == "__main__":
    main()
