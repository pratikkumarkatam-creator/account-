import {
  Briefcase,
  Landmark,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import AccountFormModal from "../components/AccountFormModal";
import PageHeader from "../components/PageHeader";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { ConfirmDialog } from "../components/ui/Modal";
import { Input, Select } from "../components/ui/Form";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuth } from "../hooks/useAuth";
import { useDebounce } from "../hooks/useDebounce";
import { useToast } from "../hooks/useToast";
import { api } from "../services/api";
import { formatCurrency, formatDate } from "../utils/format";

const TYPE_STYLES = {
  Savings: { icon: Wallet, badge: "info", label: "Savings" },
  Current: { icon: Briefcase, badge: "navy", label: "Current" },
  Salary: { icon: TrendingUp, badge: "credit", label: "Salary" },
};

export default function Accounts() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const debouncedSearch = useDebounce(search);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.listAccounts({ q: debouncedSearch, type: typeFilter });
      setAccounts(data.accounts);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setEditing(null);
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (account) => {
    setEditing(account);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteAccount(deleteTarget.account_id);
      toast.success("Account deleted", `${deleteTarget.account_holder} · ${deleteTarget.account_number_masked}`);
      setDeleteTarget(null);
      load();
    } catch (requestError) {
      toast.error("Could not delete account", requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = Boolean(search || typeFilter);
  const totalBalance = accounts.reduce(
    (sum, account) => sum + Number(account.current_balance || 0),
    0,
  );

  return (
    <div>
      <PageHeader
        title="Accounts"
        description="Create and manage the accounts you track. Only the last four digits of each account number are stored."
        actions={
          isAdmin ? (
            <Button icon={Plus} onClick={openCreate}>
              Add account
            </Button>
          ) : (
            <Badge tone="warning">Read-only demo access</Badge>
          )
        }
      />

      <div className="card mb-5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by holder name or account number"
              className="pl-9"
              aria-label="Search accounts"
            />
          </div>

          <Select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="sm:w-48"
            aria-label="Filter by account type"
          >
            <option value="">All account types</option>
            <option value="Savings">Savings</option>
            <option value="Current">Current</option>
            <option value="Salary">Salary</option>
          </Select>

          <Button
            variant="ghost"
            icon={RefreshCw}
            onClick={load}
            className="sm:w-auto"
            aria-label="Refresh accounts"
          >
            Refresh
          </Button>
        </div>

        {!loading && accounts.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>
              <strong className="text-ink">{accounts.length}</strong> account(s) shown
            </span>
            <span>
              Combined balance{" "}
              <strong className="text-ink">{formatCurrency(totalBalance)}</strong>
            </span>
            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("");
                }}
                className="font-medium text-royal hover:underline"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="card mb-5 border-red-100 p-4 text-sm text-debit">{error}</div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="card p-5">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="mt-4 h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-24" />
              <Skeleton className="mt-6 h-6 w-40" />
            </div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Wallet}
            title={hasFilters ? "No accounts match your filters" : "No accounts yet"}
            description={
              hasFilters
                ? "Try a different search term or account type."
                : "Add your first account to start recording transactions and generating statements."
            }
            action={
              hasFilters ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    setTypeFilter("");
                  }}
                >
                  Clear filters
                </Button>
              ) : isAdmin ? (
                <Button icon={Plus} onClick={openCreate}>
                  Add your first account
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => {
            const style = TYPE_STYLES[account.account_type] || TYPE_STYLES.Savings;
            const TypeIcon = style.icon;

            return (
              <article
                key={account.account_id}
                className="card flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy">
                      <TypeIcon size={18} />
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-ink">{account.account_holder}</h2>
                      <p className="mt-0.5 font-mono text-xs tracking-wide text-slate-500">
                        {account.account_number_masked}
                      </p>
                    </div>
                  </div>
                  <Badge tone={style.badge}>{account.account_type}</Badge>
                </div>

                <div className="mt-5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Current balance
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-ink">
                    {formatCurrency(account.current_balance)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Opening {formatCurrency(account.opening_balance)}
                  </p>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-xs">
                  <div>
                    <dt className="text-slate-400">Transactions</dt>
                    <dd className="mt-0.5 font-semibold text-ink">{account.transaction_count}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Opened</dt>
                    <dd className="mt-0.5 font-semibold text-ink">{formatDate(account.created_at)}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <Link
                    to={`/transactions?account_id=${account.account_id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-royal hover:underline"
                  >
                    <Landmark size={13} /> View activity
                  </Link>

                  {isAdmin ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(account)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-royal"
                        aria-label={`Edit ${account.account_holder}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(account)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-debit"
                        aria-label={`Delete ${account.account_holder}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AccountFormModal
        open={formOpen}
        account={editing}
        onClose={() => setFormOpen(false)}
        onSaved={load}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this account?"
        confirmLabel="Delete account"
        message={
          deleteTarget
            ? `Deleting ${deleteTarget.account_holder} (${deleteTarget.account_number_masked}) also removes all ${deleteTarget.transaction_count} of its transactions. This cannot be undone.`
            : ""
        }
      />
    </div>
  );
}
