import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  FileText,
  Plus,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AccountFormModal from "../components/AccountFormModal";
import PageHeader from "../components/PageHeader";
import TransactionFormModal from "../components/TransactionFormModal";
import TransactionTable from "../components/TransactionTable";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { Skeleton, StatSkeleton } from "../components/ui/Skeleton";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import {
  formatCompactCurrency,
  formatCurrency,
  todayLabel,
} from "../utils/format";

const GREETING = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

function StatCard({ label, value, hint, icon: Icon, tone = "default", emphasis = false }) {
  if (emphasis) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-navy p-5 text-white shadow-card">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-royal/25 blur-2xl" />
        <div className="relative flex items-start justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-blue-200">
            <Icon size={16} />
          </span>
        </div>
        <p className="relative mt-4 text-2xl font-semibold tracking-tight">{value}</p>
        <p className="relative mt-1.5 text-xs text-slate-400">{hint}</p>
      </div>
    );
  }

  const tones = {
    default: "bg-slate-100 text-slate-500",
    credit: "bg-emerald-50 text-credit",
    debit: "bg-red-50 text-debit",
  };

  return (
    <div className="card p-5 transition hover:shadow-lift">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lift">
      <p className="mb-1 text-xs font-semibold text-ink">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2 text-xs text-slate-600">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          {entry.name}: <strong className="text-ink">{formatCurrency(entry.value)}</strong>
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboardData, accountsData] = await Promise.all([
        api.dashboard(),
        api.listAccounts(),
      ]);
      setSummary(dashboardData.summary);
      setAccounts(accountsData.accounts);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const chartData = useMemo(
    () =>
      (summary?.monthly || []).map((month) => ({
        month: month.month,
        Credits: Number(month.credits),
        Debits: Number(month.debits),
      })),
    [summary],
  );

  const hasChartData = chartData.some((item) => item.Credits > 0 || item.Debits > 0);
  const showCharts = user?.preferences?.show_charts !== false;

  const creditTotal = Number(summary?.total_credits || 0);
  const debitTotal = Number(summary?.total_debits || 0);
  const netFlow = creditTotal - debitTotal;

  const pieData = [
    { name: "Credits", value: creditTotal || 0, color: "#16A34A" },
    { name: "Debits", value: debitTotal || 0, color: "#DC2626" },
  ];

  return (
    <div>
      <PageHeader
        title={`${GREETING()}, ${user?.name?.split(" ")[0] || "there"}`}
        description={`${todayLabel()} · Here is the latest position across your managed accounts.`}
        actions={
          <>
            <Button variant="secondary" icon={Plus} onClick={() => setAccountModalOpen(true)}>
              Add account
            </Button>
            <Button
              variant="secondary"
              icon={ArrowLeftRight}
              onClick={() => setTransactionModalOpen(true)}
              disabled={accounts.length === 0}
            >
              Add transaction
            </Button>
            <Button variant="dark" icon={FileText} onClick={() => navigate("/statements")}>
              Generate statement
            </Button>
          </>
        }
      />

      {error ? (
        <div className="card mb-6 flex flex-col gap-3 border-red-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-debit">{error}</p>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={load}>
            Try again
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading || !summary ? (
          Array.from({ length: 4 }).map((_, index) => <StatSkeleton key={index} />)
        ) : (
          <>
            <StatCard
              label="Total accounts"
              value={summary.accounts_count}
              hint="Accounts you manage"
              icon={Wallet}
            />
            <StatCard
              label="Total credits"
              value={formatCompactCurrency(summary.total_credits)}
              hint="All-time money in"
              icon={ArrowDownToLine}
              tone="credit"
            />
            <StatCard
              label="Total debits"
              value={formatCompactCurrency(summary.total_debits)}
              hint="All-time money out"
              icon={ArrowUpFromLine}
              tone="debit"
            />
            <StatCard
              label="Combined balance"
              value={formatCurrency(summary.combined_balance)}
              hint={`${summary.transactions_count} recorded transactions`}
              icon={Wallet}
              emphasis
            />
          </>
        )}
      </div>

      {showCharts ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          <div className="card xl:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-ink">Monthly cash flow</h2>
                <p className="mt-0.5 text-xs text-slate-500">Credits vs debits over the last 6 months</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-credit" /> Credits
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-debit" /> Debits
                </span>
              </div>
            </div>

            <div className="h-[280px] px-3 py-4 sm:px-4">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : hasChartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={6} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#64748B", fontSize: 11 }}
                      dy={6}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 11 }}
                      tickFormatter={(value) =>
                        value >= 100000 ? `${value / 100000}L` : value >= 1000 ? `${value / 1000}K` : value
                      }
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(37, 99, 235, 0.04)" }} />
                    <Bar dataKey="Credits" fill="#16A34A" radius={[4, 4, 0, 0]} maxBarSize={26} />
                    <Bar dataKey="Debits" fill="#DC2626" radius={[4, 4, 0, 0]} maxBarSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  icon={ArrowLeftRight}
                  title="No activity yet"
                  description="Record your first credit or debit to see monthly cash flow."
                />
              )}
            </div>
          </div>

          <div className="card">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-ink">Credit vs debit</h2>
              <p className="mt-0.5 text-xs text-slate-500">All-time split of money in and out</p>
            </div>

            <div className="px-5 py-4">
              {loading ? (
                <Skeleton className="h-[190px] w-full" />
              ) : (
                <div className="relative h-[190px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={84}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Net flow
                    </p>
                    <p className={`text-lg font-semibold ${netFlow >= 0 ? "text-credit" : "text-debit"}`}>
                      {formatCompactCurrency(netFlow)}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-emerald-50/60 px-3 py-2 text-xs">
                  <span className="flex items-center gap-2 font-medium text-emerald-700">
                    <ArrowDownToLine size={14} /> Credits
                  </span>
                  <span className="font-semibold text-credit">
                    {formatCurrency(summary?.total_credits || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-red-50/60 px-3 py-2 text-xs">
                  <span className="flex items-center gap-2 font-medium text-red-700">
                    <ArrowUpFromLine size={14} /> Debits
                  </span>
                  <span className="font-semibold text-debit">
                    {formatCurrency(summary?.total_debits || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Recent transactions</h2>
            <p className="mt-0.5 text-xs text-slate-500">Latest activity across all accounts</p>
          </div>
          <Link
            to="/transactions"
            className="inline-flex items-center gap-1 text-xs font-semibold text-royal hover:underline"
          >
            View all <ArrowLeftRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="p-5">
            <Skeleton className="h-32 w-full" />
          </div>
        ) : summary?.recent_transactions?.length ? (
          <TransactionTable
            transactions={summary.recent_transactions}
            canManage={false}
            showAccount
          />
        ) : (
          <EmptyState
            icon={ArrowLeftRight}
            title="No transactions yet"
            description="Add your first credit or debit to start building a statement."
            action={
              accounts.length ? (
                <Button icon={Plus} onClick={() => setTransactionModalOpen(true)}>
                  Add transaction
                </Button>
              ) : (
                <Button icon={Plus} onClick={() => setAccountModalOpen(true)}>
                  Add an account
                </Button>
              )
            }
          />
        )}
      </div>

      <AccountFormModal
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        onSaved={load}
      />

      <TransactionFormModal
        open={transactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        accounts={accounts}
        onSaved={load}
      />
    </div>
  );
}
