import {
  ArrowLeftRight,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import Brand from "../components/Brand";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { initials } from "../utils/format";
import Button from "../components/ui/Button";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/statements", label: "Statements", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

function pageTitle(pathname) {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/accounts")) return "Account management";
  if (/^\/transactions\/\d+/.test(pathname)) return "Transaction details";
  if (pathname.startsWith("/transactions")) return "Transaction management";
  if (pathname.startsWith("/statements")) return "Statement generator";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Account Statement Generator";
}

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info("Signed out", "Your session has been closed securely.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-6">
        <Brand variant="light" showTagline />
      </div>

      <nav className="flex-1 space-y-1 px-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Workspace
        </p>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-royal text-white shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon size={17} strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-2 text-[11px] font-medium text-blue-200">
          <ShieldCheck size={14} />
          {user?.role === "admin" ? "Admin access" : "Read-only access"}
        </div>
        <p className="mt-1 text-[11px] leading-4 text-slate-400">
          Educational prototype. All accounts and transactions are demo data.
        </p>
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-royal/20 text-sm font-semibold text-blue-100 ring-1 ring-white/10">
            {initials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-[11px] capitalize text-slate-400">
              {user?.role} · @{user?.username}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.info("Signed out", "Your session has been closed securely.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="no-print fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-navy lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen ? (
        <div className="no-print fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 animate-slide-up bg-navy shadow-lift">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="app-shell lg:pl-64">
        <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-ink lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink sm:text-base">
                {pageTitle(location.pathname)}
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Account Statement Generator · Demo workspace
              </p>
            </div>

            <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600 sm:inline-flex">
              <ShieldCheck size={13} className="text-credit" />
              Demo data only
            </span>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2 transition hover:bg-slate-50"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-xs font-semibold text-white">
                  {initials(user?.name)}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-[140px] truncate text-xs font-semibold text-ink">
                    {user?.name}
                  </span>
                  <span className="block text-[11px] capitalize text-slate-500">{user?.role}</span>
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {menuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lift"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-ink">{user?.name}</p>
                    <p className="text-xs text-slate-500">@{user?.username}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/settings")}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-ink"
                    role="menuitem"
                  >
                    <Settings size={15} /> Profile & settings
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-debit transition hover:bg-red-50"
                    role="menuitem"
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="app-main px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div key={location.pathname} className="mx-auto w-full max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
