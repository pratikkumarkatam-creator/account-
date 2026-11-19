import { useEffect, useState } from "react";

import { api } from "../services/api";
import { useToast } from "../hooks/useToast";
import Button from "./ui/Button";
import { FormField, Input, Select } from "./ui/Form";
import Modal from "./ui/Modal";

const EMPTY = {
  account_holder: "",
  account_number: "",
  account_type: "Savings",
  opening_balance: "0.00",
};

const ACCOUNT_TYPES = ["Savings", "Current", "Salary"];

export default function AccountFormModal({ open, account, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(account);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      account
        ? {
            account_holder: account.account_holder,
            account_number: account.account_number_masked,
            account_type: account.account_type,
            opening_balance: account.opening_balance,
          }
        : { ...EMPTY, account_holder: "" },
    );
  }, [open, account]);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const next = {};

    if (!form.account_holder.trim()) {
      next.account_holder = "Account holder name is required.";
    }
    if (!form.account_number.trim()) {
      next.account_number = "Account number is required.";
    } else if (!/^[0-9Xx\s-]{4,}$/.test(form.account_number.trim())) {
      next.account_number = "Use digits only (or keep the masked value).";
    }
    if (!ACCOUNT_TYPES.includes(form.account_type)) {
      next.account_type = "Choose an account type.";
    }
    if (form.opening_balance !== "" && Number.isNaN(Number(form.opening_balance))) {
      next.opening_balance = "Opening balance must be a number.";
    } else if (Number(form.opening_balance) < 0) {
      next.opening_balance = "Opening balance cannot be negative.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate() || saving) return;

    setSaving(true);
    try {
      const payload = {
        account_holder: form.account_holder.trim(),
        account_number: form.account_number.trim(),
        account_type: form.account_type,
        opening_balance: form.opening_balance || "0",
      };

      const result = isEdit
        ? await api.updateAccount(account.account_id, payload)
        : await api.createAccount(payload);

      toast.success(
        isEdit ? "Account updated" : "Account added",
        `${result.account.account_holder} · ${result.account.account_number_masked}`,
      );
      onSaved?.(result.account);
      onClose?.();
    } catch (error) {
      if (error.fields) setErrors(error.fields);
      toast.error(isEdit ? "Could not update account" : "Could not add account", error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={isEdit ? "Edit account" : "Add a new account"}
      subtitle={
        isEdit
          ? "Update the account details. Existing transactions are not affected."
          : "Create a demo account to record credits and debits against."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? "Save changes" : "Create account"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          label="Account holder name"
          htmlFor="account_holder"
          error={errors.account_holder}
          required
        >
          <Input
            id="account_holder"
            value={form.account_holder}
            onChange={update("account_holder")}
            placeholder="Rahul Kumar"
            error={errors.account_holder}
            autoFocus
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Account number"
            htmlFor="account_number"
            error={errors.account_number}
            hint="Only the last 4 digits are stored (XXXX1234)."
            required
          >
            <Input
              id="account_number"
              value={form.account_number}
              onChange={update("account_number")}
              placeholder="12345678"
              error={errors.account_number}
            />
          </FormField>

          <FormField label="Account type" htmlFor="account_type" error={errors.account_type} required>
            <Select
              id="account_type"
              value={form.account_type}
              onChange={update("account_type")}
              error={errors.account_type}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField
          label="Opening balance (₹)"
          htmlFor="opening_balance"
          error={errors.opening_balance}
          hint="Balance before the first recorded transaction."
        >
          <Input
            id="opening_balance"
            inputMode="decimal"
            value={form.opening_balance}
            onChange={update("opening_balance")}
            placeholder="10000.00"
            error={errors.opening_balance}
          />
        </FormField>
      </form>
    </Modal>
  );
}
