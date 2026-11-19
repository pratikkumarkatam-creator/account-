import {
  CalendarRange,
  Download,
  FileText,
  Landmark,
  Printer,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { FormField, Input, Select } from "../components/ui/Form";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { api } from "../services/api";
import { formatCurrency, formatDate, getPeriodPresets } from "../utils/format";

const PRESETS = getPeriodPresets();

function presetFor(rangeId) {
  return PRESETS.find((preset) => preset.id === rangeId) || PRESETS[0];
}

function StatementPreview({ statement }) {
  if (!statement) return null;

  return (
    <div className="print-area overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex flex-col gap-3 bg-navy px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-blue-200">
            <Landmark size={19} />
          </span>
          <div>
            <p className="text-sm font-semibold">Account Statement Generator</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
              Statement of account
            </p>
          </div>
        </div>
        <div className="text-[11px] leading-5 text-slate-300 sm:text-right">
          <p className="uppercase tracking-wide">Generated on</p>
          <p className="font-semibold text-white">{statement.generated_at}</p>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-8">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Account holder
            </p>
            <h2 className="mt-1 text-lg font-semibold text-ink">
              {statement.account.account_holder}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {statement.account.account_number_masked} · {statement.account.account_type} account
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Statement period
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {formatDate(statement.period.start_date)} – {formatDate(statement.period.end_date)}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {statement.transaction_count} transaction(s)
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Opening balance
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {formatCurrency(statement.opening_balance)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Total credits
            </p>
            <p className="mt-1 text-sm font-semibold text-credit">
              +{formatCurrency(statement.total_credits)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Total debits
            </p>
            <p className="mt-1 text-sm font-semibold text-debit">
              −{formatCurrency(statement.total_debits)}
            </p>
          </div>
          <div className="rounded-xl bg-navy px-3.5 py-3 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Closing balance
            </p>
            <p className="mt-1 text-sm font-semibold">{formatCurrency(statement.closing_balance)}</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-royal text-white">
                <th className="rounded-l px-3 py-2.5 font-semibold">Date</th>
                <th className="px-3 py-2.5 font-semibold">Description</th>
                <th className="px-3 py-2.5 font-semibold">Transaction ID</th>
                <th className="px-3 py-2.5 text-right font-semibold">Debit</th>
                <th className="px-3 py-2.5 text-right font-semibold">Credit</th>
                <th className="rounded-r px-3 py-2.5 text-right font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody>
              {statement.transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                    No transactions were recorded in this period.
                  </td>
                </tr>
              ) : (
                statement.transactions.map((line, index) => (
                  <tr
                    key={line.transaction_id}
                    className={index % 2 === 1 ? "bg-slate-50/70" : "bg-white"}
                  >
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5 text-slate-600">
                      {formatDate(line.transaction_date)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2.5 text-ink">
                      {line.description}
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5 font-mono text-[11px] text-slate-500">
                      {line.reference}
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5 text-right tabular-nums text-debit">
                      {line.debit !== "0.00" ? formatCurrency(line.debit) : "—"}
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5 text-right tabular-nums text-credit">
                      {line.credit !== "0.00" ? formatCurrency(line.credit) : "—"}
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5 text-right font-semibold tabular-nums text-ink">
                      {formatCurrency(line.balance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {statement.transactions.length ? (
              <tfoot>
                <tr className="bg-slate-50">
                  <td colSpan={3} className="px-3 py-2.5 font-semibold text-ink">
                    Total for the period
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-debit">
                    {formatCurrency(statement.total_debits)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-credit">
                    {formatCurrency(statement.total_credits)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-ink">
                    {formatCurrency(statement.closing_balance)}
                  </td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>

        <p className="mt-5 border-t border-slate-100 pt-4 text-[10px] leading-5 text-slate-400">
          This statement is generated by an educational prototype. It does not represent a real
          bank account and must not be used for financial, legal or tax purposes. Balance
          calculation: opening balance + total credits − total debits = closing balance.
        </p>
      </div>
    </div>
  );
}

export default function Statements() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const previewRef = useRef(null);

  const initialPreset = presetFor(user?.preferences?.default_statement_range || "30");

  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [form, setForm] = useState({
    account_id: "",
    start_date: initialPreset.start,
    end_date: initialPreset.end,
  });
  const [errors, setErrors] = useState({});
  const [statement, setStatement] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const loadAccounts = async () => {
    setAccountsLoading(true);
    try {
      const data = await api.listAccounts();
      setAccounts(data.accounts);
    } catch (error) {
      toast.error("Could not load accounts", error.message);
    } finally {
      setAccountsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!accounts.length) return;

    const requested = searchParams.get("account_id");
    setForm((current) => {
      if (requested && accounts.some((a) => String(a.account_id) === requested)) {
        return current.account_id === requested
          ? current
          : { ...current, account_id: requested };
      }
      if (!current.account_id) {
        return { ...current, account_id: String(accounts[0].account_id) };
      }
      return current;
    });
  }, [accounts, searchParams]);

  useEffect(() => {
    const preset = presetFor(user?.preferences?.default_statement_range || "30");
    setForm((current) => ({ ...current, start_date: preset.start, end_date: preset.end }));
  }, [user?.preferences?.default_statement_range]);

  const updateForm = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatement(null);
  };

  const applyPreset = (preset) => {
    setForm((current) => ({
      ...current,
      start_date: preset.start,
      end_date: preset.end,
    }));
    setErrors({});
    setStatement(null);
  };

  const activePreset = PRESETS.find(
    (preset) => preset.start === form.start_date && preset.end === form.end_date,
  );

  const handleGenerate = async (event) => {
    event?.preventDefault();
    const nextErrors = {};

    if (!form.account_id) nextErrors.account_id = "Select an account.";
    if (!form.start_date) nextErrors.start_date = "Choose a start date.";
    if (!form.end_date) nextErrors.end_date = "Choose an end date.";
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      nextErrors.end_date = "End date must be on or after the start date.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setGenerating(true);
    try {
      const data = await api.previewStatement(form);
      setStatement(data.statement);
      toast.success(
        "Statement generated",
        `${data.statement.transaction_count} transaction(s) found in this period.`,
      );
      requestAnimationFrame(() => {
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (error) {
      if (error.fields) setErrors(error.fields);
      toast.error("Could not generate statement", error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!statement) return;
    setDownloading(true);
    try {
      const filename = await api.downloadStatement({
        account_id: statement.account.account_id,
        start_date: statement.period.start_date,
        end_date: statement.period.end_date,
      });
      toast.success("PDF downloaded", filename);
    } catch (error) {
      toast.error("Could not download PDF", error.message);
    } finally {
      setDownloading(false);
    }
  };

  const selectedAccount = accounts.find(
    (account) => String(account.account_id) === String(form.account_id),
  );

  return (
    <div>
      <div className="no-print">
        <PageHeader
          title="Statement generator"
          description="Pick an account and a date range to preview a professional statement, then download or print it."
          actions={
            statement ? (
              <>
                <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
                  Print
                </Button>
                <Button icon={Download} loading={downloading} onClick={handleDownload}>
                  Download PDF
                </Button>
              </>
            ) : null
          }
        />
      </div>

      {accountsLoading ? (
        <div className="card p-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="mt-4 h-10 w-2/3" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Wallet}
            title="Add an account to generate statements"
            description="Statements are built from the transactions of a single account. Create an account first."
            action={
              <Link to="/accounts?add=1">
                <Button>Add an account</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <>
          <form onSubmit={handleGenerate} className="no-print card mb-6 p-5">
            <div className="grid gap-4 lg:grid-cols-12">
              <FormField
                label="Account"
                htmlFor="statement_account"
                error={errors.account_id}
                className="lg:col-span-5"
                required
              >
                <Select
                  id="statement_account"
                  value={form.account_id}
                  onChange={updateForm("account_id")}
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

              <FormField
                label="Start date"
                htmlFor="start_date"
                error={errors.start_date}
                className="lg:col-span-3"
                required
              >
                <Input
                  id="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={updateForm("start_date")}
                  error={errors.start_date}
                />
              </FormField>

              <FormField
                label="End date"
                htmlFor="end_date"
                error={errors.end_date}
                className="lg:col-span-3"
                required
              >
                <Input
                  id="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={updateForm("end_date")}
                  error={errors.end_date}
                />
              </FormField>

              <div className="flex items-end lg:col-span-1">
                <Button type="submit" size="lg" loading={generating} className="w-full">
                  {generating ? "" : "Go"}
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <CalendarRange size={13} /> Quick range
              </span>
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    activePreset?.id === preset.id
                      ? "border-royal bg-royal text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-royal/40 hover:text-royal"
                  }`}
                >
                  {preset.label}
                </button>
              ))}

              {selectedAccount ? (
                <span className="ml-auto text-xs text-slate-500">
                  Current balance{" "}
                  <strong className="text-ink">
                    {formatCurrency(selectedAccount.current_balance)}
                  </strong>
                </span>
              ) : null}
            </div>
          </form>

          {statement ? (
            <div ref={previewRef}>
              <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-ink">Statement preview</h2>
                  <Badge tone="info">
                    <FileText size={11} /> {statement.transaction_count} transaction(s)
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RefreshCw}
                  onClick={handleGenerate}
                  loading={generating}
                >
                  Regenerate
                </Button>
              </div>

              <StatementPreview statement={statement} />
            </div>
          ) : (
            <div className="card no-print">
              <EmptyState
                icon={FileText}
                title="Your statement preview will appear here"
                description="Choose an account and date range, then select Generate. The opening balance includes every transaction dated before the start date."
                action={
                  <Button icon={FileText} loading={generating} onClick={handleGenerate}>
                    Generate statement
                  </Button>
                }
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
