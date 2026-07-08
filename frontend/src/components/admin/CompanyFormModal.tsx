import { useState } from "react";

import Modal from "./Modal";
import type { AdminOrganizationDetail } from "../../features/admin/adminTypes";

interface CompanyFormValues {
  taxIdentityNumber: string;
  name: string;
  password: string;
  sector: string;
  employeeCount: number;
  city: string;
}

interface CompanyFormModalProps {
  mode: "create" | "edit";
  initialValues?: AdminOrganizationDetail;
  onClose: () => void;
  onSubmit: (values: CompanyFormValues) => Promise<void>;
}

const EMPTY_VALUES: CompanyFormValues = {
  taxIdentityNumber: "",
  name: "",
  password: "",
  sector: "",
  employeeCount: 0,
  city: "",
};

export default function CompanyFormModal({ mode, initialValues, onClose, onSubmit }: CompanyFormModalProps) {
  const [values, setValues] = useState<CompanyFormValues>(
    initialValues
      ? {
          taxIdentityNumber: initialValues.taxIdentityNumber,
          name: initialValues.name,
          password: "",
          sector: initialValues.sector,
          employeeCount: initialValues.employeeCount,
          city: initialValues.city,
        }
      : EMPTY_VALUES
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof CompanyFormValues>(key: K, value: CompanyFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız oldu.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <Modal
      title={mode === "create" ? "New Company" : "Edit Company"}
      subtitle={mode === "create" ? "Add a new corporate account." : "Update company details."}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </div>
        )}

        {mode === "create" && (
          <div>
            <label className={labelClass}>Tax Identity Number</label>
            <input
              type="text"
              required
              maxLength={10}
              value={values.taxIdentityNumber}
              onChange={(event) => update("taxIdentityNumber", event.target.value)}
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label className={labelClass}>Company Name</label>
          <input
            type="text"
            required
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            className={inputClass}
          />
        </div>

        {mode === "create" && (
          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              required
              value={values.password}
              onChange={(event) => update("password", event.target.value)}
              className={inputClass}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Sector</label>
            <input
              type="text"
              value={values.sector}
              onChange={(event) => update("sector", event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Employee Count</label>
            <input
              type="number"
              min={0}
              required
              value={values.employeeCount}
              onChange={(event) => update("employeeCount", Number(event.target.value))}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>City</label>
          <input
            type="text"
            required
            value={values.city}
            onChange={(event) => update("city", event.target.value)}
            className={inputClass}
          />
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : mode === "create" ? "Create Company" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
