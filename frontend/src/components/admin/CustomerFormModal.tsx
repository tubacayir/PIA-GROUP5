import { useState } from "react";

import Modal from "./Modal";
import type { AdminCustomerDetail, Gender } from "../../features/admin/adminTypes";

interface CustomerFormValues {
  tcIdentityNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  birthDate: string;
  gender: Gender;
  city: string;
}

interface CustomerFormModalProps {
  mode: "create" | "edit";
  initialValues?: AdminCustomerDetail;
  onClose: () => void;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
}

const EMPTY_VALUES: CustomerFormValues = {
  tcIdentityNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  birthDate: "",
  gender: "MALE",
  city: "",
};

export default function CustomerFormModal({ mode, initialValues, onClose, onSubmit }: CustomerFormModalProps) {
  const [values, setValues] = useState<CustomerFormValues>(
    initialValues
      ? {
          tcIdentityNumber: initialValues.tcIdentityNumber,
          firstName: initialValues.firstName,
          lastName: initialValues.lastName,
          email: initialValues.email,
          phoneNumber: initialValues.phoneNumber,
          password: "",
          birthDate: initialValues.birthDate,
          gender: initialValues.gender,
          city: initialValues.city,
        }
      : EMPTY_VALUES
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) => {
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
      title={mode === "create" ? "New Customer" : "Edit Customer"}
      subtitle={mode === "create" ? "Add a new customer to the system." : "Update customer details."}
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
            <label className={labelClass}>TC Identity Number</label>
            <input
              type="text"
              required
              maxLength={11}
              value={values.tcIdentityNumber}
              onChange={(event) => update("tcIdentityNumber", event.target.value)}
              className={inputClass}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name</label>
            <input
              type="text"
              required
              value={values.firstName}
              onChange={(event) => update("firstName", event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Last Name</label>
            <input
              type="text"
              required
              value={values.lastName}
              onChange={(event) => update("lastName", event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            required
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Phone Number</label>
          <input
            type="text"
            required
            value={values.phoneNumber}
            onChange={(event) => update("phoneNumber", event.target.value)}
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
            <label className={labelClass}>Birth Date</label>
            <input
              type="date"
              required
              value={values.birthDate}
              onChange={(event) => update("birthDate", event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Gender</label>
            <select
              value={values.gender}
              onChange={(event) => update("gender", event.target.value as Gender)}
              className={inputClass}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
              <option value="UNSPECIFIED">Unspecified</option>
            </select>
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
            {saving ? "Saving..." : mode === "create" ? "Create Customer" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
