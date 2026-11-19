import {
  ArrowDown,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  FileText,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { api } from "../services/api";
import { formatCurrency, formatDate } from "../utils/format";

function DetailRow({ label, value, mono = false }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={`mt-1 text-sm font-medium text-ink ${mono ? "font-mono text-[13px]" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

export default function TransactionDetails() {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getTransaction(transactionId);
      setTransaction(data.transaction);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    load();
  }, [load]);

  const isCredit = transaction?.transaction_type === "credit";

  return (
    <div>
      <Link
        to="/transactions"
        className="no-print mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to transactions
      </Link>

      <PageHeader
        title="Transaction details"
        description="A single entry with the balance before and after it was posted."
        actions={
          transaction ? (
            <Link to={`/statements?account_id=${transaction.account_id}`}>
              <Button variant="secondary" icon={FileText}>
                Generate statement
              </Button>
            </Link>
          ) : null
        }
      />

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card space-y-4 p-6 lg:col-span-2">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="card p-6">
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      ) : error ? (
        <div className="card flex flex-col items-center gap-4 p-10 text-center">
          <p className="text-sm text-debit">{error}</p>
          <div className="flex gap-2">
            <Button variant="secondary" icon={RefreshCw} onClick={load}>
              Try again
            </Button>
            <Link to="/transactions">
              <Button variant="ghost">Back to list</Button>
            </Link>
          </div>
        </div>
      ) : transaction ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isCredit ? "bg-emerald-50 text-credit" : "bg-red-50 text-debit"
                  }`}
                >
                  {isCredit ? <ArrowDown size={19} /> : <ArrowUp size={19} />}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-ink">{transaction.description}</h2>
                    <Badge tone={isCredit ? "credit" : "debit"}>
                      {isCredit ? "Credit" : "Debit"}
                    </Badge>
                    <Badge tone={transaction.status === "Completed" ? "info" : "warning"}>
                      {transaction.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {transaction.reference} · {formatDate(transaction.transaction_date)}
                  </p>
                </div>
              </div>

              <p className={`text-2xl font-semibold ${isCredit ? "text-credit" : "text-debit"}`}>
                {isCredit ? "+" : "−"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              <DetailRow label="Transaction ID" value={transaction.reference} mono />
              <DetailRow label="Date" value={formatDate(transaction.transaction_date)} />
              <DetailRow
                label="Type"
                value={isCredit ? "Credit (money in)" : "Debit (money out)"}
              />
              <DetailRow label="Account holder" value={transaction.account_holder} />
              <DetailRow
                label="Account number"
                value={transaction.account_number_masked}
                mono
              />
              <DetailRow label="Account type" value={transaction.account_type} />
              <DetailRow label="Amount" value={formatCurrency(transaction.amount)} />
              <DetailRow label="Status" value={transaction.status} />
              <DetailRow
                label="Recorded on"
                value={transaction.created_at?.slice(0, 10) ? formatDate(transaction.created_at) : "-"}
              />
            </dl>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Description
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{transaction.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-ink">Balance movement</h2>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-slate-200 px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Previous balance
                  </p>
                  <p className="mt-0.5 text-base font-semibold text-ink">
                    {formatCurrency(transaction.previous_balance)}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
                  <ArrowLeftRight size={13} />
                  {isCredit ? "Credit added" : "Debit deducted"}
                  <span className={isCredit ? "text-credit" : "text-debit"}>
                    {isCredit ? "+" : "−"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>

                <div className="rounded-xl border border-royal/20 bg-royal-50 px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-wide text-royal">Updated balance</p>
                  <p className="mt-0.5 text-base font-semibold text-ink">
                    {formatCurrency(transaction.updated_balance)}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-slate-500">
                Calculated from the account opening balance of{" "}
                {formatCurrency(transaction.account_opening_balance)} and every transaction up to
                this entry.
              </p>
            </div>

            <div className="card p-5">
              <h2 className="text-sm font-semibold text-ink">Account</h2>
              <p className="mt-2 text-sm text-ink">{transaction.account_holder}</p>
              <p className="font-mono text-xs text-slate-500">
                {transaction.account_number_masked} · {transaction.account_type}
              </p>
              <Link
                to={`/transactions?account_id=${transaction.account_id}`}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-royal hover:underline"
              >
                View all account activity <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
