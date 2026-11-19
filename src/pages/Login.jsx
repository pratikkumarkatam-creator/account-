import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Landmark,
  Lock,
  ShieldCheck,
  TrendingUp,
  User,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Brand from "../components/Brand";
import Button from "../components/ui/Button";
import { FormField, Input } from "../components/ui/Form";
import { useAuth } from "../hooks/useAuth";

const HIGHLIGHTS = [
  { icon: TrendingUp, title: "Live running balances", text: "Every credit and debit updates the account instantly." },
  { icon: FileText, title: "Date-range statements", text: "Opening balance, activity and closing balance in one view." },
  { icon: ShieldCheck, title: "Secure sessions", text: "Passwords are hashed and sessions stay server-side." },
];

const DEMO_ACCOUNTS = [
  { label: "Admin", username: "rahul", role: "Full access" },
  { label: "Analyst", username: "priya", role: "Read only" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: "", password: "", remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError("");
  };

  const validate = () => {
    const next = {};
    if (!form.username.trim()) next.username = "Username is required.";
    if (!form.password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    setServerError("");
    try {
      await login(form.username.trim(), form.password, form.remember);
      const destination = location.state?.from || "/";
      navigate(destination, { replace: true });
    } catch (error) {
      if (error.fields && Object.keys(error.fields).length) {
        setErrors(error.fields);
      }
      setServerError(error.message || "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (username) => {
    setForm({ username, password: "demo1234", remember: true });
    setErrors({});
    setServerError("");
  };

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[1fr_1.05fr]">
      {/* Form side */}
      <div className="flex min-h-screen flex-col px-5 py-8 sm:px-10 lg:px-14">
        <div className="lg:hidden">
          <Brand />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="mb-8 hidden lg:block">
            <Brand showTagline />
          </div>

          <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-royal-50 px-3 py-1 text-xs font-semibold text-royal ring-1 ring-inset ring-blue-100">
            <Lock size={12} /> Secure sign in
          </span>

          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to review accounts, record transactions and generate account statements.
          </p>

          {serverError ? (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-debit"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <FormField label="Username" htmlFor="username" error={errors.username} required>
              <div className="relative">
                <User
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  placeholder="Enter your username"
                  className="pl-9"
                  value={form.username}
                  onChange={update("username")}
                  error={errors.username}
                  autoFocus
                />
              </div>
            </FormField>

            <FormField label="Password" htmlFor="password" error={errors.password} required>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="pl-9 pr-11"
                  value={form.password}
                  onChange={update("password")}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, remember: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-royal focus:ring-royal/30"
                />
                Remember me for 7 days
              </label>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
              {!submitting ? <ArrowRight size={16} /> : null}
            </Button>
          </form>

          <div className="mt-7 rounded-xl border border-dashed border-slate-300 bg-white/70 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <CheckCircle2 size={13} className="text-credit" /> Demo accounts
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.username}
                  type="button"
                  onClick={() => fillDemo(account.username)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-royal/40 hover:bg-royal-50"
                >
                  <span className="block text-xs font-semibold text-ink">{account.label}</span>
                  <span className="block text-[11px] text-slate-500">
                    {account.username} / demo1234
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-[11px] leading-4 text-slate-500">
              Click a card to fill the form, then press Sign in. All data is fictional.
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            Educational prototype · No real bank connections
          </p>
        </div>
      </div>

      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-navy lg:flex lg:flex-col lg:justify-center lg:px-14 xl:px-20">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-royal/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-blue-200">
            <Landmark size={13} /> Fintech-style statement workspace
          </span>

          <h2 className="mt-6 max-w-lg text-3xl font-semibold leading-tight text-white xl:text-[34px]">
            Statements that look like they came from a real bank.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            Track multiple accounts, record credits and debits, and export a polished PDF
            statement for any date range — with auditable running balances.
          </p>

          {/* Mini statement preview card */}
          <div className="relative mt-10 max-w-md">
            <div className="rotate-[-1.5deg] rounded-2xl border border-white/10 bg-white p-5 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Account statement
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">Rahul Kumar</p>
                  <p className="text-xs text-slate-500">Savings · XXXX1234</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-white">
                  <Landmark size={15} />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-canvas p-3">
                <div>
                  <p className="text-[9px] uppercase tracking-wide text-slate-400">Opening</p>
                  <p className="text-xs font-semibold text-ink">₹10,000.00</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wide text-slate-400">Credits</p>
                  <p className="text-xs font-semibold text-credit">+₹5,000.00</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wide text-slate-400">Closing</p>
                  <p className="text-xs font-semibold text-ink">₹13,000.00</p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {[
                  ["02 Jul", "Cash deposit at branch", "+₹5,000.00", true],
                  ["04 Jul", "UPI payment · Stationery", "−₹2,000.00", false],
                  ["12 Jul", "Electricity bill", "−₹3,200.00", false],
                ].map(([date, label, amount, isCredit]) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${isCredit ? "bg-credit" : "bg-debit"}`}
                      />
                      <span className="text-slate-600">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400">{date}</span>
                      <span className={`font-semibold ${isCredit ? "text-credit" : "text-ink"}`}>
                        {amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-5 -right-3 flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-xl">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-credit">
                <FileText size={14} />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-ink">PDF ready to download</p>
                <p className="text-[10px] text-slate-500">Generated in one click</p>
              </div>
            </div>
          </div>

          <ul className="mt-16 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                  <item.icon size={15} />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs leading-5 text-slate-400">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
