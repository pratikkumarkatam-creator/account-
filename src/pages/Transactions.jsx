import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  CalendarDays,
  FilterX,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import TransactionFormModal from "../components/TransactionFormModal";
import TransactionTable from "../components/TransactionTable";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { Input, Select } from "../components/ui/Form";
import { ConfirmDialog } from "../components/ui/Modal";
import { TableSkeleton } from "../components/ui/Skeleton";
import { useAuth } from "../hooks/useAuth";
import { useDebounce } from "../hooks/useDebounce";
import { useToast } from "../hooks/useToast";
import { api } from "../services/api";
import { formatCurrency } from "../utils/format";

const EMPTY_FILTERS = { q: "", account_id: "", type: "", from: "", to: "" };

export default function Transactions() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    account_id: searchParams.get("account_id") || "",
  });
  const debouncedSearch = useDebounce(filters.q);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadAccounts = useCallback(async () => {
    try {
      const data = await api.listAccounts();
      setAccounts(data.accounts);
      return data.accounts;
    } catch (requestError) {
      toast.error("Could not load accounts", requestError.message);
      return [];
    }
  }, [toast]);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.listTransactions({
        q: debouncedSearch,
        account_id: filters.account_id,
        type: filters.type,
        from: filters.from,
        to: filters.to,
      });
      setTransactions(data.transactions);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.account_id, filters.type, filters.from, filters.to]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    const accountFromUrl = searchParams.get("account_id");
    const addFromUrl = searchParams.get("add") === "1";

    if (accountFromUrl) {
      setFilters((current) => ({ ...current, account_id: accountFromUrl }));
    }
    if (addFromUrl && isAdmin) {
      setEditing(null);
      setFormOpen(true);
    }
  }, [searchParams, isAdmin]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (transaction) => {
    setEditing(transaction);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteTransaction(deleteTarget.transaction_id);
      toast.success("Transaction deleted", deleteTarget.reference);
      setDeleteTarget(null);
      loadTransactions();
      loadAccounts();
    } catch (requestError) {
      toast.error("Could not delete transaction", requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  const updateFilter = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
  };

  const totals = useMemo(() => {
    let credits = 0;
    let debits = 0;
    transactions.forEach((transaction) => {
      if (transaction.transaction_type === "credit") credits += Number(transaction.amount);
      else debits += Number(transaction.amount);
    });
    return { credits, debits, net: credits - debits };
  }, [transactions]);

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="Every credit and debit recorded against your accounts, ordered newest first."
        actions={
          isAdmin ? (
            <Button icon={Plus} onClick={openCreate} disabled={!accounts.length}>
              Add transaction
            </Button>
          ) : (
            <Badge tone="warning">Read-only demo access</Badge>
          )
        }
      />

      <div className="card mb-5 p-4">
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="relative lg:col-span-4">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              value={filters.q}
              onChange={updateFilter("q")}
              placeholder="Search description or transaction ID"
              className="pl-9"
              aria-label="Search transactions"
            />
          </div>

          <Select
            value={filters.account_id}
            onChange={updateFilter("account_id")}
            className="lg:col-span-3"
            aria-label="Filter by account"
          >
            <option value="">All accounts</option>
            {accounts.map((account) => (
              <option key={account.account_id} value={account.account_id}>
                {account.account_number_masked} · {account.account_type}
              </option>
            ))}
          </Select>

          <Select
            value={filters.type}
            onChange={updateFilter("type")}
            className="lg:col-span-2"
            aria-label="Filter by type"
          >
            <option value="">All types</option>
            <option value="credit">Credits</option>
            <option value="debit">Debits</option>
          </Select>

          <div className="grid grid-cols-2 gap-2 lg:col-span-3">
            <Input
              type="date"
              value={filters.from}
              onChange={updateFilter("from")}
              aria-label="From date"
              title="From date"
            />
            <Input
              type="date"
              value={filters.to}
              onChange={updateFilter("to")}
              aria-label="To date"
              title="To date"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={13} className="text-slate-400" />
              <strong className="text-ink">{transactions.length}</strong> transaction(s)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ArrowDownToLine size={13} className="text-credit" />
              Credits <strong className="text-credit">{formatCurrency(totals.credits)}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ArrowUpFromLine size={13} className="text-debit" />
              Debits <strong className="text-debit">{formatCurrency(totals.debits)}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              Net <strong className={totals.net >= 0 ? "text-ink" : "text-debit"}>{formatCurrency(totals.net)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasFilters ? (
              <Button
                variant="ghost"
                size="sm"
                icon={FilterX}
                onClick={() => setFilters(EMPTY_FILTERS)}
              >
                Clear filters
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={() => {
                loadTransactions();
                loadAccounts();
              }}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {error ? <div className="card mb-5 border-red-100 p-4 text-sm text-debit">{error}</div> : null}

      <div className="card overflow-hidden">
        {!loading && transactions.length ? (
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-ink">Transaction history</h2>
            <span className="text-xs text-slate-500">
              Sorted by date · newest first
            </span>
          </div>
        ) : null}

        {loading ? (
          <TableSkeleton rows={6} />
        ) : transactions.length ? (
          <TransactionTable
            transactions={transactions}
            canManage={isAdmin}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        ) : accounts.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="No accounts yet"
            description="Add an account first, then record credits and debits against it."
            action={
              <Link to="/accounts?add=1">
                <Button icon={Plus}>Add an account</Button>
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={ArrowLeftRight}
            title={hasFilters ? "No transactions match these filters" : "No transactions yet"}
            description={
              hasFilters
                ? "Try clearing the filters or widening the date range."
                : "Record your first credit or debit to build an account history."
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Clear filters
                </Button>
              ) : isAdmin ? (
                <Button icon={Plus} onClick={openCreate}>
                  Add transaction
                </Button>
              ) : null
            }
          />
        )}
      </div>

      <TransactionFormModal
        open={formOpen}
        transaction={editing}
        accounts={accounts}
        defaultAccountId={filters.account_id || accounts[0]?.account_id}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          loadTransactions();
          loadAccounts();
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this transaction?"
        confirmLabel="Delete transaction"
        message={
          deleteTarget
            ? `Deleting ${deleteTarget.reference} (${deleteTarget.description}) will recalculate the account balance. This cannot be undone.`
            : ""
        }
      />
    </div>
  );
}
