import { ArrowDownLeft, ArrowUpRight, Info } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "../services/api";
import { useToast } from "../hooks/useToast";
import { todayISO } from "../utils/format";
import Button from "./ui/Button";
import { FormField, Input, Select } from "./ui/Form";
import Modal from "./ui/Modal";

function emptyForm(accountId) {
  return {
    account_id: accountId ? String(accountId) : "",
    transaction_date: todayISO(),
    description: "",
    transaction_type: "credit",
    amount: "",
  };
}

export default function TransactionFormModal({
  open,
  transaction,
  accounts = [],
  defaultAccountId,
  onClose,
  onSaved,
}) {
  const toast = useToast();
  const isEdit = Boolean(transaction);

  const [form, setForm] = useState(emptyForm(defaultAccountId));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      transaction
        ? {
            account_id: String(transaction.account_id),
            transaction_date: transaction.transaction_date,
            description: transaction.description,
            transaction_type: transaction.transaction_type,
            amount: transaction.amount,
          }
        : emptyForm(defaultAccountId),
    );
  }, [open, transaction, defaultAccountId]);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const next = {};

    if (!form.account_id) next.account_id = "Select an account.";
    if (!form.transaction_date) next.transaction_date = "Pick a transaction date.";
    if (!form.description.trim()) next.description = "Description is required.";
    if (!["credit", "debit"].includes(form.transaction_type)) {
      next.transaction_type = "Choose Credit or Debit.";
    }

    const amount = Number(form.amount);
    if (!form.amount) next.amount = "Amount is required.";
    else if (Number.isNaN(amount)) next.amount = "Amount must be a valid number.";
    else if (amount <= 0) next.amount = "Amount must be greater than zero.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate() || saving) return;

    setSaving(true);
    try {
      const payload = {
        account_id: Number(form.account_id),
        transaction_date: form.transaction_date,
        description: form.description.trim(),
        transaction_type: form.transaction_type,
        amount: form.amount,
      };

      const result = isEdit
        ? await api.updateTransaction(transaction.transaction_id, payload)
        : await api.createTransaction(payload);

      toast.success(
        isEdit ? "Transaction updated" : "Transaction recorded",
        `${result.transaction.reference} · ${result.transaction.description}`,
      );
      onSaved?.(result.transaction);
      onClose?.();
    } catch (error) {
      if (error.fields) setErrors(error.fields);
      toast.error(
        isEdit ? "Could not update transaction" : "Could not record transaction",
        error.message,
      );
    } finally {
      setSaving(false);
    }
  };

  const isCredit = form.transaction_type === "credit";

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={isEdit ? "Edit transaction" : "Record a transaction"}
      subtitle={
        isEdit
          ? "Correcting a transaction recalculates every balance after it."
          : "Credits add to the balance, debits reduce it."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? "Save changes" : "Add transaction"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <span className="label">
            Transaction type <span className="text-debit">*</span>
          </span>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                value: "credit",
                label: "Credit",
                hint: "Money in",
                icon: ArrowDownLeft,
                active: "border-credit bg-emerald-50 text-credit ring-1 ring-credit/20",
              },
              {
                value: "debit",
                label: "Debit",
                hint: "Money out",
                icon: ArrowUpRight,
                active: "border-debit bg-red-50 text-debit ring-1 ring-debit/20",
              },
            ].map((option) => {
              const selected = form.transaction_type === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setForm((current) => ({ ...current, transaction_type: option.value }))
                  }
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                    selected
                      ? option.active
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                  aria-pressed={selected}
                >
                  <option.icon size={16} />
                  <span>
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="block text-[11px] opacity-80">{option.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {errors.transaction_type ? (
            <p className="mt-1.5 text-xs font-medium text-debit">{errors.transaction_type}</p>
          ) : null}
        </div>

        <FormField label="Account" htmlFor="account_id" error={errors.account_id} required>
          <Select
            id="account_id"
            value={form.account_id}
            onChange={update("account_id")}
            error={errors.account_id}
          >
            <option value="">Select an account</option>
            {accounts.map((account) => (
              <option key={account.account_id} value={account.account_id}>
                {account.account_holder} — {account.account_number_masked} ({account.account_type})
              </option>
            ))}
          </Select>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Transaction date"
            htmlFor="transaction_date"
            error={errors.transaction_date}
            required
          >
            <Input
              id="transaction_date"
              type="date"
              value={form.transaction_date}
              onChange={update("transaction_date")}
              error={errors.transaction_date}
              max="2100-12-31"
            />
          </FormField>

          <FormField label="Amount (₹)" htmlFor="amount" error={errors.amount} required>
            <Input
              id="amount"
              inputMode="decimal"
              value={form.amount}
              onChange={update("amount")}
              placeholder="5000.00"
              error={errors.amount}
            />
          </FormField>
        </div>

        <FormField label="Description" htmlFor="description" error={errors.description} required>
          <Input
            id="description"
            value={form.description}
            onChange={update("description")}
            placeholder="e.g. Cash deposit at branch"
            error={errors.description}
            maxLength={160}
          />
        </FormField>

        <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-500">
          <Info size={14} className="mt-0.5 shrink-0 text-slate-400" />
          <span>
            This entry changes the account balance by{" "}
            <strong className={isCredit ? "text-credit" : "text-debit"}>
              {isCredit ? "+" : "−"}₹{form.amount || "0.00"}
            </strong>
            . Amounts are stored with two-decimal precision.
          </span>
        </div>
      </form>
    </Modal>
  );
}
