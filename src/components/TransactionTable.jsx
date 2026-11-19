import { ArrowDownLeft, ArrowUpRight, Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { formatCurrency, formatDate } from "../utils/format";
import Badge from "./ui/Badge";
import { TableSkeleton } from "./ui/Skeleton";

function TypeMark({ type }) {
  const isCredit = type === "credit";
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
        isCredit ? "bg-emerald-50 text-credit" : "bg-red-50 text-debit"
      }`}
      aria-hidden="true"
    >
      {isCredit ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
    </span>
  );
}

function Amount({ transaction }) {
  const isCredit = transaction.transaction_type === "credit";
  return (
    <span className={`font-semibold ${isCredit ? "text-credit" : "text-debit"}`}>
      {isCredit ? "+" : "-"}
      {formatCurrency(transaction.amount)}
    </span>
  );
}

export default function TransactionTable({
  transactions = [],
  loading = false,
  showAccount = true,
  canManage = true,
  onView,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return <TableSkeleton rows={5} />;
  }

  return (
    <>
      {/* Mobile cards */}
      <div className="divide-y divide-slate-100 md:hidden">
        {transactions.map((transaction) => (
          <div key={transaction.transaction_id} className="flex items-start gap-3 px-4 py-3.5">
            <TypeMark type={transaction.transaction_type} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="truncate text-sm font-medium text-ink">{transaction.description}</p>
                <Amount transaction={transaction} />
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {formatDate(transaction.transaction_date)}
                {showAccount ? ` · ${transaction.account_number_masked}` : ""}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Link
                  to={`/transactions/${transaction.transaction_id}`}
                  className="text-xs font-medium text-royal hover:underline"
                >
                  View details
                </Link>
                {canManage ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onEdit?.(transaction)}
                      className="text-xs font-medium text-slate-500 hover:text-ink"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete?.(transaction)}
                      className="text-xs font-medium text-debit hover:underline"
                    >
                      Delete
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="table-head">
            <tr>
              <th className="px-5 py-3 font-semibold">Transaction</th>
              {showAccount ? <th className="px-4 py-3 font-semibold">Account</th> : null}
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 text-right font-semibold">Amount</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((transaction) => (
              <tr key={transaction.transaction_id} className="transition hover:bg-slate-50/70">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <TypeMark type={transaction.transaction_type} />
                    <div className="min-w-0">
                      <p className="max-w-[260px] truncate font-medium text-ink">
                        {transaction.description}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">{transaction.reference}</p>
                    </div>
                  </div>
                </td>
                {showAccount ? (
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-ink">{transaction.account_holder}</p>
                    <p className="text-xs text-slate-400">
                      {transaction.account_number_masked} · {transaction.account_type}
                    </p>
                  </td>
                ) : null}
                <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                  {formatDate(transaction.transaction_date)}
                </td>
                <td className="px-4 py-3.5">
                  <Badge tone={transaction.transaction_type === "credit" ? "credit" : "debit"}>
                    {transaction.transaction_type === "credit" ? "Credit" : "Debit"}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right">
                  <Amount transaction={transaction} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/transactions/${transaction.transaction_id}`}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-royal"
                      aria-label="View transaction details"
                    >
                      <Eye size={15} />
                    </Link>
                    {canManage ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit?.(transaction)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-royal"
                          aria-label="Edit transaction"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete?.(transaction)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-debit"
                          aria-label="Delete transaction"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
